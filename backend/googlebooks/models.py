from django.db import models
from django.conf import settings

class GoogleBook(models.Model):
    google_books_id = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=255)
    authors = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    thumbnail_url = models.URLField(blank=True, null=True)
    preview_link = models.URLField(blank=True, null=True)
    publication_date = models.DateField(null=True, blank=True)
    isbn = models.CharField(max_length=13, blank=True)
    page_count = models.IntegerField(null=True, blank=True)
    categories = models.TextField(blank=True)
    language = models.CharField(max_length=10, blank=True)
    favorited_by = models.ManyToManyField(settings.AUTH_USER_MODEL, through='GoogleBookFavorite', related_name='favorite_google_books')

    def __str__(self):
        return self.title

class GoogleBookFavorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    book = models.ForeignKey(GoogleBook, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'book')

    def __str__(self):
        return f"{self.user.username} - {self.book.title}"

class GoogleBookReadingHistory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    book = models.ForeignKey(GoogleBook, on_delete=models.CASCADE)
    last_read = models.DateTimeField(auto_now=True)
    progress = models.IntegerField(default=0)  # Store reading progress as percentage

    class Meta:
        unique_together = ('user', 'book')
        ordering = ['-last_read']

    def __str__(self):
        return f"{self.user.username}'s progress on {self.book.title}: {self.progress}%"