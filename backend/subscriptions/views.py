from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import SubscriptionTier, UserSubscription
from .serializers import SubscriptionTierSerializer, UserSubscriptionSerializer
from django.utils import timezone
from django.conf import settings

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
                {
                    "detail": "No active subscription found.",
                    "message": "Please upgrade to a subscription plan to access premium features.",
                    "status": "no_subscription"
                },
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'])
    def upgrade(self, request):
        tier_name = request.data.get('tier')
        if not tier_name:
            return Response(
                {"detail": "Subscription tier is required.",
                 "error": "missing_tier"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Validate tier name against choices
            valid_tiers = dict(SubscriptionTier.TIER_CHOICES)
            if tier_name not in valid_tiers:
                return Response(
                    {"detail": f"Invalid subscription tier. Valid tiers are: {', '.join(valid_tiers.keys())}",
                     "error": "invalid_tier"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            tier = SubscriptionTier.objects.get(name__iexact=tier_name)
            
            # Check if user has an active subscription
            current_subscription = UserSubscription.objects.filter(
                user=request.user,
                is_active=True,
                end_date__gt=timezone.now()
            ).first()

            # Start a transaction to ensure data consistency
            from django.db import transaction
            with transaction.atomic():
                if current_subscription:
                    # Don't allow downgrading to the same tier
                    if current_subscription.tier == tier:
                        return Response(
                            {"detail": "You are already subscribed to this tier.",
                             "error": "same_tier"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    # Deactivate the current subscription
                    current_subscription.is_active = False
                    current_subscription.save()

                # Create new subscription with end_date
                start_date = timezone.now()
                subscription = UserSubscription.objects.create(
                    user=request.user,
                    tier=tier,
                    start_date=start_date,
                    end_date=start_date + timezone.timedelta(days=30),
                    is_active=True
                )
                
                serializer = self.get_serializer(subscription)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except SubscriptionTier.DoesNotExist:
            return Response(
                {"detail": "Subscription tier not found in the system.",
                 "error": "tier_not_found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error in subscription upgrade: {str(e)}")
            return Response(
                {"detail": "An unexpected error occurred while processing your subscription. Please try again.",
                 "error": "server_error",
                 "message": str(e) if settings.DEBUG else None},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )