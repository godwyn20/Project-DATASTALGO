from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookViewSet, UserFavoriteViewSet, ReadingHistoryViewSet

router = DefaultRouter()
router.register(r'books', BookViewSet, basename='book')
router.register(r'favorites', UserFavoriteViewSet)
router.register(r'reading-history', ReadingHistoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]