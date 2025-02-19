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
    def search(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response({'error': 'Query parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

        service = build('books', 'v1', developerKey=settings.GOOGLE_BOOKS_API_KEY)
        try:
            result = service.volumes().list(q=query, maxResults=40).execute()
            books_data = []
            for item in result.get('items', []):
                volume_info = item.get('volumeInfo', {})
                book_data = {
                    'google_books_id': item['id'],
                    'title': volume_info.get('title', ''),
                    'authors': ', '.join(volume_info.get('authors', [])),
                    'description': volume_info.get('description', ''),
                    'thumbnail_url': volume_info.get('imageLinks', {}).get('thumbnail', ''),
                    'preview_link': volume_info.get('previewLink', '')
                }
                book, _ = Book.objects.get_or_create(
                    google_books_id=book_data['google_books_id'],
                    defaults=book_data
                )
                books_data.append(book)

            serializer = self.get_serializer(books_data, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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