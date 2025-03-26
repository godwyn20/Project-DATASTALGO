from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import SubscriptionPlan, Subscription

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'middle_name', 'last_name', 'phone', 'birthdate', 'is_subscribed', 'subscription_end_date')
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
            'is_subscribed': {'read_only': True},
            'subscription_end_date': {'read_only': True},
            'first_name': {'required': False},
            'middle_name': {'required': False},
            'last_name': {'required': False},
            'phone': {'required': False},
            'birthdate': {'required': False}
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('A user with this username already exists.')
        return value

    def create(self, validated_data):
        try:
            user = User.objects.create_user(
                username=validated_data['username'],
                email=validated_data['email'],
                password=validated_data['password']
            )
            return user
        except Exception as e:
            raise serializers.ValidationError(str(e))

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = ('id', 'name', 'duration', 'price', 'description')

class SubscriptionSerializer(serializers.ModelSerializer):
    tier = SubscriptionPlanSerializer(read_only=True, source='plan')
    tier_id = serializers.IntegerField(write_only=True, source='plan_id')

    class Meta:
        model = Subscription
        fields = ('id', 'user', 'plan', 'plan_id', 'tier', 'tier_id', 'start_date', 'end_date', 'is_active', 'payment_status')
        read_only_fields = ('user', 'start_date', 'end_date', 'is_active')