from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import SubscriptionTier, UserSubscription
from .serializers import SubscriptionTierSerializer, UserSubscriptionSerializer
from django.utils import timezone

class SubscriptionTierViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SubscriptionTier.objects.all()
    serializer_class = SubscriptionTierSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserSubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = UserSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserSubscription.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def current(self, request):
        try:
            subscription = UserSubscription.objects.get(
                user=request.user,
                is_active=True,
                end_date__gt=timezone.now()
            )
            serializer = self.get_serializer(subscription)
            return Response(serializer.data)
        except UserSubscription.DoesNotExist:
            return Response(
                {"detail": "No active subscription found."},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'])
    def upgrade(self, request):
        tier_name = request.data.get('tier')
        try:
            tier = SubscriptionTier.objects.get(name=tier_name)
            
            # Check if user has an active subscription
            current_subscription = UserSubscription.objects.filter(
                user=request.user,
                is_active=True,
                end_date__gt=timezone.now()
            ).first()

            if current_subscription:
                current_subscription.is_active = False
                current_subscription.save()

            # Create new subscription
            subscription = UserSubscription.objects.create(
                user=request.user,
                tier=tier,
                start_date=timezone.now()
            )
            
            serializer = self.get_serializer(subscription)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except SubscriptionTier.DoesNotExist:
            return Response(
                {"detail": "Invalid subscription tier."},
                status=status.HTTP_400_BAD_REQUEST
            )