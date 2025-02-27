from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from rest_framework.routers import DefaultRouter
from accounts.views import UserViewSet, SubscriptionPlanViewSet, SubscriptionViewSet
from books.views import BookViewSet, UserFavoriteViewSet, ReadingHistoryViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'subscription-plans', SubscriptionPlanViewSet)
router.register(r'subscriptions', SubscriptionViewSet)
router.register(r'books', BookViewSet)
router.register(r'favorites', UserFavoriteViewSet)
router.register(r'reading-history', ReadingHistoryViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    path('api/books/', include('books.urls')),
    path('api/subscriptions/', include('subscriptions.urls')),
    path('api/googlebooks/', include('googlebooks.urls')),
]
