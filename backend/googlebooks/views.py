import requests
import logging
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.conf import settings
from django.shortcuts import get_object_or_404
from .models import GoogleBook, GoogleBookFavorite, GoogleBookReadingHistory
from .serializers import GoogleBookSerializer, GoogleBookFavoriteSerializer, GoogleBookReadingHistorySerializer

logger = logging.getLogger(__name__)

class GoogleBookViewSet(viewsets.ModelViewSet):
    queryset = GoogleBook.objects.all()
    serializer_class = GoogleBookSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def retrieve(self, request, pk=None):
        # Check if the pk is a google_books_id
        try:
            # First try to find by google_books_id
            book = get_object_or_404(GoogleBook, google_books_id=pk)
            serializer = self.get_serializer(book, context={'request': request})
            return Response(serializer.data)
        except:
            # If not found in database, try to fetch from Google Books API
            try:
                logger.info(f'Fetching book details from Google Books API for ID: {pk}')
                
                # Get API key from settings
                api_key = settings.GOOGLE_BOOKS_API_KEY
                if not api_key:
                    logger.error('Google Books API key is not configured')
                    return Response(
                        {'error': 'Google Books API key is not configured'}, 
                        status=status.HTTP_503_SERVICE_UNAVAILABLE
                    )
                
                # Make request to Google Books API for specific volume
                response = requests.get(
                    f'https://www.googleapis.com/books/v1/volumes/{pk}',
                    params={'key': api_key},
                    timeout=10
                )
                
                # Handle HTTP errors
                response.raise_for_status()
                
                item = response.json()
                
                # Skip if no volumeInfo
                if not item.get('volumeInfo'):
                    return Response({'error': 'Book information not available'}, status=status.HTTP_404_NOT_FOUND)

                volume_info = item.get('volumeInfo', {})
                
                # Extract publication date if available
                publication_date = None
                if volume_info.get('publishedDate'):
                    try:
                        from datetime import datetime
                        date_str = volume_info.get('publishedDate')
                        # Handle different date formats
                        if len(date_str) == 4:  # Just year
                            publication_date = f"{date_str}-01-01"
                        elif len(date_str) == 7:  # Year and month
                            publication_date = f"{date_str}-01"
                        else:
                            publication_date = date_str
                    except Exception as date_err:
                        logger.error(f'Error parsing publication date: {date_err}')
                        publication_date = None
                
                # Extract ISBN if available
                isbn = ''
                if volume_info.get('industryIdentifiers'):
                    for identifier in volume_info.get('industryIdentifiers'):
                        if identifier.get('type') in ['ISBN_13', 'ISBN_10']:
                            isbn = identifier.get('identifier', '')
                            break
                
                # Extract thumbnail URL if available
                thumbnail_url = None
                if volume_info.get('imageLinks', {}).get('thumbnail'):
                    thumbnail_url = volume_info.get('imageLinks', {}).get('thumbnail')
                    # Convert HTTP to HTTPS if needed
                    if thumbnail_url and thumbnail_url.startswith('http://'):
                        thumbnail_url = 'https://' + thumbnail_url[7:]
                
                # Extract categories
                categories = ''
                if volume_info.get('categories'):
                    categories = ', '.join(volume_info.get('categories'))
                
                book_data = {
                    'google_books_id': pk,
                    'title': volume_info.get('title', '').strip(),
                    'authors': ', '.join(volume_info.get('authors', ['Unknown Author'])),
                    'description': volume_info.get('description', ''),
                    'thumbnail_url': thumbnail_url,
                    'preview_link': volume_info.get('previewLink'),
                    'publication_date': publication_date,
                    'isbn': isbn,
                    'page_count': volume_info.get('pageCount'),
                    'categories': categories,
                    'language': volume_info.get('language', '')
                }
                
                # Create or update the book in our database
                book, created = GoogleBook.objects.get_or_create(
                    google_books_id=book_data['google_books_id'],
                    defaults=book_data
                )
                
                # Update book data if it already exists
                if not created:
                    for key, value in book_data.items():
                        if value:  # Only update if value is not empty
                            setattr(book, key, value)
                    book.save()
                
                serializer = self.get_serializer(book, context={'request': request})
                return Response(serializer.data)
                
            except requests.exceptions.Timeout:
                logger.error('Request to Google Books API timed out')
                return Response(
                    {'error': 'Request to Google Books API timed out'}, 
                    status=status.HTTP_504_GATEWAY_TIMEOUT
                )
            except requests.exceptions.HTTPError as http_err:
                logger.error(f'HTTP error occurred: {http_err}')
                return Response(
                    {'error': 'Failed to fetch data from Google Books API'}, 
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            except requests.exceptions.ConnectionError as conn_err:
                logger.error(f'Connection error: {conn_err}')
                return Response(
                    {'error': 'Could not connect to Google Books API'}, 
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            except Exception as e:
                logger.error(f'Unexpected error in retrieve: {str(e)}')
                # If all else fails, try the default behavior (lookup by database ID)
                return super().retrieve(request, pk)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def search(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response({'error': 'Query parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            logger.info(f'Searching Google Books for query: {query}')
            
            # Get API key from settings
            api_key = settings.GOOGLE_BOOKS_API_KEY
            if not api_key:
                logger.error('Google Books API key is not configured')
                return Response(
                    {'error': 'Google Books API key is not configured'}, 
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
            # Make request to Google Books API
            response = requests.get(
                f'https://www.googleapis.com/books/v1/volumes',
                params={
                    'q': query,
                    'key': api_key,
                    'maxResults': 40
                },
                timeout=10  # Add timeout to prevent hanging
            )
            
            # Handle HTTP errors
            response.raise_for_status()
            
            data = response.json()
            
            if not data.get('items'):
                logger.warning(f'No results found for query: {query}')
                return Response([])
                
            logger.info(f'Found {len(data.get("items", []))} results for query: {query}')
            
            books_data = []
            for item in data.get('items', []):
                try:
                    # Skip items without an ID or volumeInfo
                    if not item.get('id') or not item.get('volumeInfo'):
                        continue

                    volume_info = item.get('volumeInfo', {})
                    
                    # Extract publication date if available
                    publication_date = None
                    if volume_info.get('publishedDate'):
                        try:
                            from datetime import datetime
                            date_str = volume_info.get('publishedDate')
                            # Handle different date formats
                            if len(date_str) == 4:  # Just year
                                publication_date = f"{date_str}-01-01"
                            elif len(date_str) == 7:  # Year and month
                                publication_date = f"{date_str}-01"
                            else:
                                publication_date = date_str
                        except Exception as date_err:
                            logger.error(f'Error parsing publication date: {date_err}')
                            publication_date = None
                    
                    # Extract ISBN if available
                    isbn = ''
                    if volume_info.get('industryIdentifiers'):
                        for identifier in volume_info.get('industryIdentifiers'):
                            if identifier.get('type') in ['ISBN_13', 'ISBN_10']:
                                isbn = identifier.get('identifier', '')
                                break
                    
                    # Extract thumbnail URL if available
                    thumbnail_url = None
                    if volume_info.get('imageLinks', {}).get('thumbnail'):
                        thumbnail_url = volume_info.get('imageLinks', {}).get('thumbnail')
                        # Convert HTTP to HTTPS if needed
                        if thumbnail_url and thumbnail_url.startswith('http://'):
                            thumbnail_url = 'https://' + thumbnail_url[7:]
                    
                    # Extract categories
                    categories = ''
                    if volume_info.get('categories'):
                        categories = ', '.join(volume_info.get('categories'))
                    
                    book_data = {
                        'google_books_id': item.get('id'),
                        'title': volume_info.get('title', '').strip(),
                        'authors': ', '.join(volume_info.get('authors', ['Unknown Author'])),
                        'description': volume_info.get('description', ''),
                        'thumbnail_url': thumbnail_url,
                        'preview_link': volume_info.get('previewLink'),
                        'publication_date': publication_date,
                        'isbn': isbn,
                        'page_count': volume_info.get('pageCount'),
                        'categories': categories,
                        'language': volume_info.get('language', '')
                    }
                    
                    book, created = GoogleBook.objects.get_or_create(
                        google_books_id=book_data['google_books_id'],
                        defaults=book_data
                    )
                    
                    # Update book data if it already exists
                    if not created:
                        for key, value in book_data.items():
                            if value:  # Only update if value is not empty
                                setattr(book, key, value)
                        book.save()
                        
                    books_data.append(book)
                except Exception as book_err:
                    logger.error(f'Error processing book data: {book_err}')
                    continue

            serializer = self.get_serializer(books_data, many=True)
            return Response(serializer.data)
            
        except requests.exceptions.Timeout:
            logger.error('Request to Google Books API timed out')
            return Response(
                {'error': 'Request to Google Books API timed out'}, 
                status=status.HTTP_504_GATEWAY_TIMEOUT
            )
        except requests.exceptions.HTTPError as http_err:
            logger.error(f'HTTP error occurred: {http_err}')
            return Response(
                {'error': 'Failed to fetch data from Google Books API'}, 
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except requests.exceptions.ConnectionError as conn_err:
            logger.error(f'Connection error: {conn_err}')
            return Response(
                {'error': 'Could not connect to Google Books API'}, 
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            logger.error(f'Unexpected error in search: {str(e)}')
            return Response(
                {'error': 'An unexpected error occurred'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def favorite(self, request, pk=None):
        book = self.get_object()
        favorite, created = GoogleBookFavorite.objects.get_or_create(
            user=request.user,
            book=book
        )
        return Response({'status': 'favorited' if created else 'already favorited'})

    @action(detail=True, methods=['post'])
    def unfavorite(self, request, pk=None):
        book = self.get_object()
        GoogleBookFavorite.objects.filter(user=request.user, book=book).delete()
        return Response({'status': 'unfavorited'})

    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        book = self.get_object()
        progress = request.data.get('progress', 0)
        history, _ = GoogleBookReadingHistory.objects.get_or_create(
            user=request.user,
            book=book,
            defaults={'progress': progress}
        )
        history.progress = progress
        history.save()
        return Response({'status': 'progress updated'})

    @action(detail=False, methods=['get'])
    def favorites(self, request):
        favorites = GoogleBookFavorite.objects.filter(user=request.user)
        serializer = GoogleBookFavoriteSerializer(favorites, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def reading_history(self, request):
        history = GoogleBookReadingHistory.objects.filter(user=request.user)
        serializer = GoogleBookReadingHistorySerializer(history, many=True, context={'request': request})
        return Response(serializer.data)