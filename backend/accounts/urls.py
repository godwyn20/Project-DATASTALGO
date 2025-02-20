from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, SubscriptionPlanViewSet, SubscriptionViewSet

router = DefaultRouter()
router.register(r'', UserViewSet)
router.register(r'subscription-plans', SubscriptionPlanViewSet)
router.register(r'subscriptions', SubscriptionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]