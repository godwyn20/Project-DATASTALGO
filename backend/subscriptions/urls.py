from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubscriptionTierViewSet, UserSubscriptionViewSet

router = DefaultRouter()
router.register(r'tiers', SubscriptionTierViewSet)
router.register(r'', UserSubscriptionViewSet, basename='subscription')

urlpatterns = [
    path('', include(router.urls)),
]