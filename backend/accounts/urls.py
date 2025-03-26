from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, SubscriptionPlanViewSet, SubscriptionViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)

router.register(r'subscriptions', SubscriptionViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/subscriptions/upgrade/', SubscriptionViewSet.as_view({'post': 'upgrade'}), name='subscription-upgrade'),
]