from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GoogleBookViewSet

router = DefaultRouter()
router.register(r'googlebooks', GoogleBookViewSet)

urlpatterns = [
    path('', include(router.urls)),
]