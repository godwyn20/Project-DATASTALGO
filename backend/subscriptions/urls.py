from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubscriptionTierViewSet, UserSubscriptionViewSet, PaymentAPIView

router = DefaultRouter()
router.register(r'tiers', SubscriptionTierViewSet)

router.register(r'subscriptions', UserSubscriptionViewSet, basename='subscription')

urlpatterns = [
    path('payment/', PaymentAPIView.as_view(), name='payment-process'),
    path('current/', UserSubscriptionViewSet.as_view({'get': 'current'}), name='subscription-current'),
    path('', include(router.urls)),
]