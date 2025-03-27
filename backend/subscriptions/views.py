from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import SubscriptionTier, UserSubscription
from .serializers import SubscriptionTierSerializer, UserSubscriptionSerializer
from django.utils import timezone
from django.conf import settings
import paypalrestsdk

paypalrestsdk.configure({
  "mode": "sandbox",
  "client_id": settings.PAYPAL_CLIENT_ID,
  "client_secret": settings.PAYPAL_SECRET
})

class SubscriptionTierViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SubscriptionTier.objects.all()
    serializer_class = SubscriptionTierSerializer
    permission_classes = [permissions.IsAuthenticated]

class PaymentAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        tier_id = request.data.get('tier_id')

        try:
            tier = SubscriptionTier.objects.get(id=tier_id)
            
            if not tier.payment_required:
                UserSubscription.objects.create(
                    user=user,
                    tier=tier,
                    is_active=True
                )
                return Response({'status': 'activated'})

            payment = paypalrestsdk.Payment({
                "intent": "sale",
                "payer": {"payment_method": "paypal"},
                "transactions": [{
                    "amount": {
                        "total": str(tier.price_usd),
                        "currency": "USD"
                    },
                    "description": f"{tier.name} Subscription"
                }],
                "redirect_urls": {
                    "return_url": "http://localhost:8000/payment/success",
                    "cancel_url": "http://localhost:8000/payment/cancel"
                }
            })

            if payment.create():
                return Response({'approval_url': next(link.href for link in payment.links if link.rel == 'approval_url'), 'payment_id': payment.id})
            return Response({'error': 'Payment creation failed'}, status=status.HTTP_400_BAD_REQUEST)

        except SubscriptionTier.DoesNotExist:
            return Response({'error': 'Invalid tier ID'}, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        payment_id = request.query_params.get('paymentId')
        payer_id = request.query_params.get('PayerID')
        
        try:
            payment = paypalrestsdk.Payment.find(payment_id)
            
            if payment.execute({'payer_id': payer_id}):
                tier_id = payment.transactions[0].description.split()[0]
                tier = SubscriptionTier.objects.get(id=tier_id)
                
                # Calculate end date based on tier duration
                start_date = timezone.now()
                end_date = None
                if tier.duration == '7D':
                    end_date = start_date + timezone.timedelta(days=7)
                elif tier.duration == 'LT':
                    end_date = start_date + timezone.timedelta(days=365*100)  # 100 years for lifetime
                else:
                    end_date = start_date + timezone.timedelta(days=30)
                
                # Create subscription
                subscription = UserSubscription.objects.create(
                    user=request.user,
                    tier=tier,
                    start_date=start_date,
                    end_date=end_date,
                    is_active=True
                )
                
                # Update user's subscription status
                request.user.is_subscribed = True
                request.user.subscription_end_date = end_date
                request.user.save()
                return Response({'status': 'payment_completed'})
            return Response({'error': 'Payment execution failed'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


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

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def upgrade(self, request):
        tier_id = request.data.get('tier_id')
        if not tier_id:
            return Response(
                {"detail": "Subscription tier ID is required.",
                 "error": "missing_tier_id"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            tier = SubscriptionTier.objects.get(id=tier_id)
            
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
                end_date = None
                if tier.duration == '7D':
                    end_date = start_date + timezone.timedelta(days=7)
                elif tier.duration == 'LT':
                    end_date = start_date + timezone.timedelta(days=365*100)  # 100 years for lifetime
                else:
                    end_date = start_date + timezone.timedelta(days=30)
                
                subscription = UserSubscription.objects.create(
                    user=request.user,
                    tier=tier,
                    start_date=start_date,
                    end_date=end_date,
                    is_active=True
                )
                
                # Update user's subscription status
                request.user.is_subscribed = True
                request.user.subscription_end_date = end_date
                request.user.save()
                
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