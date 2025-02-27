from rest_framework import serializers
from .models import GoogleBook, GoogleBookFavorite, GoogleBookReadingHistory

class GoogleBookSerializer(serializers.ModelSerializer):
    is_favorited = serializers.SerializerMethodField()
    reading_progress = serializers.SerializerMethodField()

    class Meta:
        model = GoogleBook
        fields = ['id', 'google_books_id', 'title', 'authors', 'description',
                'thumbnail_url', 'preview_link', 'publication_date',
                'isbn', 'page_count', 'categories', 'language',
                'is_favorited', 'reading_progress']

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return GoogleBookFavorite.objects.filter(user=request.user, book=obj).exists()
        return False

    def get_reading_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            history = GoogleBookReadingHistory.objects.filter(user=request.user, book=obj).first()
            if history:
                return history.progress
        return 0

class GoogleBookFavoriteSerializer(serializers.ModelSerializer):
    book = GoogleBookSerializer(read_only=True)

    class Meta:
        model = GoogleBookFavorite
        fields = ['id', 'book', 'created_at']

class GoogleBookReadingHistorySerializer(serializers.ModelSerializer):
    book = GoogleBookSerializer(read_only=True)

    class Meta:
        model = GoogleBookReadingHistory
        fields = ['id', 'book', 'last_read', 'progress']