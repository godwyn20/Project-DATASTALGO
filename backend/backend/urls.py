from django.urls import path, include
from rest_framework.routers import DefaultRouter
from accounts.views import UserViewSet, SubscriptionPlanViewSet, SubscriptionViewSet
from books.views import BookViewSet, UserFavoriteViewSet, ReadingHistoryViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'books', BookViewSet)
router.register(r'favorites', UserFavoriteViewSet)
router.register(r'reading-history', ReadingHistoryViewSet)
router.register(r'subscriptions', SubscriptionViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/', include('subscriptions.urls')),
    path('api/', include('books.urls')),
]