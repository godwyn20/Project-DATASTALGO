from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .models import SubscriptionPlan, Subscription
from .serializers import UserSerializer, SubscriptionPlanSerializer, SubscriptionSerializer
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request):
        try:
            logger.info(f"Received registration request with data: {request.data}")
            serializer = self.get_serializer(data=request.data)
            
            if serializer.is_valid():
                user = serializer.save()
                refresh = RefreshToken.for_user(user)
                response_data = {
                    'user': serializer.data,
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
                logger.info(f"Successfully registered user: {user.username}")
                return Response(response_data, status=status.HTTP_201_CREATED)
            
            logger.error(f"Validation error during registration: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Unexpected error during registration: {str(e)}")
            return Response(
                {'detail': 'An unexpected error occurred during registration.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get', 'patch'])
    def profile(self, request):
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        elif request.method == 'PATCH':
            serializer = self.get_serializer(request.user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = User.objects.filter(username=username).first()

        if user and user.check_password(password):
            refresh = RefreshToken.for_user(user)
            serializer = self.get_serializer(user)
            return Response({
                'user': serializer.data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class SubscriptionPlanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.AllowAny]

class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def upgrade(self, request):
        try:
            plan_id = request.data.get('tier')
            if not plan_id:
                return Response({'error': 'Missing subscription tier'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                new_plan = SubscriptionPlan.objects.get(id=plan_id)
            except SubscriptionPlan.DoesNotExist:
                return Response({'error': 'Invalid subscription plan'}, status=status.HTTP_404_NOT_FOUND)

            subscription, _ = Subscription.objects.get_or_create(
                user=request.user,
                defaults={'plan': new_plan}
            )

            if subscription.plan != new_plan:
                subscription.plan = new_plan
                subscription.save()

            return Response(self.get_serializer(subscription).data)
        except Exception as e:
            logger.error(f'Subscription upgrade error: {str(e)}')
            return Response(
                {'error': 'Failed to process upgrade'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def process_payment(self, request, pk=None):
        subscription = self.get_object()
        # Here you would integrate with GCash payment processing
        # For now, we'll simulate a successful payment
        subscription.payment_status = 'completed'
        subscription.save()
        return Response({'status': 'payment processed'}, status=status.HTTP_200_OK)
