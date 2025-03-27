from rest_framework import serializers
from .models import Book, UserFavorite, ReadingHistory

class BookSerializer(serializers.ModelSerializer):
    is_favorited = serializers.SerializerMethodField()
    reading_progress = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = ['id', 'google_books_id', 'title', 'authors', 'description',
                'thumbnail_url', 'preview_link', 'isbn', 'number_of_pages', 
                'subjects', 'is_favorited', 'reading_progress']

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserFavorite.objects.filter(user=request.user, book=obj).exists()
        return False

    def get_reading_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            history = ReadingHistory.objects.filter(user=request.user, book=obj).first()
            if history:
                return history.progress
        return 0

class UserFavoriteSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)

    class Meta:
        model = UserFavorite
        fields = ['id', 'book', 'created_at']

class ReadingHistorySerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)

    class Meta:
        model = ReadingHistory
        fields = ['id', 'book', 'last_read', 'progress']