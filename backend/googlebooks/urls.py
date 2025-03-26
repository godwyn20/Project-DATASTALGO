from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GoogleBookViewSet

router = DefaultRouter()
router.register(r'', GoogleBookViewSet)

urlpatterns = [
    path('search/', GoogleBookViewSet.as_view({'get': 'search'}), name='googlebook-search'),
    path('', include(router.urls)),
]