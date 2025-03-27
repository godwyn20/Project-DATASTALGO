from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubscriptionTierViewSet, UserSubscriptionViewSet, PaymentAPIView

router = DefaultRouter()
router.register(r'tiers', SubscriptionTierViewSet)

# Don't register with 'subscriptions' prefix to avoid double nesting
router.register(r'', UserSubscriptionViewSet, basename='subscription')

urlpatterns = [
    path('payment/', PaymentAPIView.as_view(), name='payment-process'),
    path('current/', UserSubscriptionViewSet.as_view({'get': 'current'}), name='subscription-current'),
    path('upgrade/', UserSubscriptionViewSet.as_view({'post': 'upgrade'}), name='subscription-upgrade'),
    path('', include(router.urls)),
]