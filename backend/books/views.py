from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from googleapiclient.discovery import build
from django.conf import settings
from .models import Book, UserFavorite, ReadingHistory
from .serializers import BookSerializer, UserFavoriteSerializer, ReadingHistorySerializer

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def trending(self, request):
        # For now, return the most recently added books as trending
        trending_books = self.get_queryset().order_by('-id')[:10]
        serializer = self.get_serializer(trending_books, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def new_releases(self, request):
        # Return books ordered by publication date
        new_books = self.get_queryset().exclude(publication_date=None).order_by('-publication_date')[:10]
        serializer = self.get_serializer(new_books, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def recommended(self, request):
        # For now, return random books as recommendations
        recommended_books = self.get_queryset().order_by('?')[:10]
        serializer = self.get_serializer(recommended_books, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response({'error': 'Query parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            import requests
            import logging
            logger = logging.getLogger(__name__)
            
            logger.info(f'Searching OpenLibrary for query: {query}')
            response = requests.get(
                f'https://openlibrary.org/search.json?q={query}&limit=40',
                timeout=10  # Add timeout to prevent hanging
            )
            
            # Handle HTTP errors from OpenLibrary
            try:
                response.raise_for_status()
            except requests.exceptions.HTTPError as http_err:
                logger.error(f'HTTP error occurred: {http_err}')
                return Response({'error': 'Failed to fetch data from OpenLibrary'}, 
                               status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
            try:
                data = response.json()
            except ValueError as json_err:
                logger.error(f'Invalid JSON response: {json_err}')
                return Response({'error': 'Invalid response from OpenLibrary'}, 
                               status=status.HTTP_502_BAD_GATEWAY)
            
            if not data.get('docs'):
                logger.warning(f'No results found for query: {query}')
                return Response([])
                
            logger.info(f'Found {len(data.get("docs", []))} results for query: {query}')
            
            books_data = []
            for item in data.get('docs', []):
                try:
                    # Skip items without a key or title
                    if not item.get('key') or not item.get('title'):
                        continue

                    book_data = {
                        'open_library_id': item.get('key', '').split('/')[-1],  # Get the last part of the key
                        'title': item.get('title', '').strip(),
                        'authors': ', '.join(item.get('author_name', ['Unknown Author'])),
                        'description': item.get('first_sentence', [''])[0] if item.get('first_sentence') else '',
                        'thumbnail_url': f'https://covers.openlibrary.org/b/id/{item.get("cover_i", 0)}-L.jpg' if item.get('cover_i') else None,
                        'preview_link': f'https://openlibrary.org{item.get("key")}'
                    }
                    
                    if not book_data['open_library_id']:
                        logger.warning(f'Skipping book with missing ID: {item}')
                        continue
                        
                    book, _ = Book.objects.get_or_create(
                        open_library_id=book_data['open_library_id'],
                        defaults=book_data
                    )
                    books_data.append(book)
                except Exception as book_err:
                    logger.error(f'Error processing book data: {book_err}')
                    continue

            serializer = self.get_serializer(books_data, many=True)
            return Response(serializer.data)
            
        except requests.exceptions.Timeout:
            logger.error('Request to OpenLibrary timed out')
            return Response(
                {'error': 'Request to OpenLibrary timed out'}, 
                status=status.HTTP_504_GATEWAY_TIMEOUT
            )
        except requests.exceptions.ConnectionError as conn_err:
            logger.error(f'Connection error: {conn_err}')
            return Response(
                {'error': 'Could not connect to OpenLibrary'}, 
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
        favorite, created = UserFavorite.objects.get_or_create(
            user=request.user,
            book=book
        )
        return Response({'status': 'favorited' if created else 'already favorited'})

    @action(detail=True, methods=['post'])
    def unfavorite(self, request, pk=None):
        book = self.get_object()
        UserFavorite.objects.filter(user=request.user, book=book).delete()
        return Response({'status': 'unfavorited'})

    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        book = self.get_object()
        progress = request.data.get('progress', 0)
        history, _ = ReadingHistory.objects.get_or_create(
            user=request.user,
            book=book,
            defaults={'progress': progress}
        )
        history.progress = progress
        history.save()
        return Response({'status': 'progress updated'})

class UserFavoriteViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UserFavorite.objects.all()
    serializer_class = UserFavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserFavorite.objects.filter(user=self.request.user)

class ReadingHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ReadingHistory.objects.all()
    serializer_class = ReadingHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ReadingHistory.objects.filter(user=self.request.user)