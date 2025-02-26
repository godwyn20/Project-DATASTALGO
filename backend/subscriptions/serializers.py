from rest_framework import serializers
from .models import SubscriptionTier, UserSubscription

class SubscriptionTierSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionTier
        fields = ['id', 'name', 'price', 'max_books_per_month', 'max_downloads', 'description']

class UserSubscriptionSerializer(serializers.ModelSerializer):
    tier_details = SubscriptionTierSerializer(source='tier', read_only=True)

    class Meta:
        model = UserSubscription
        fields = ['id', 'tier', 'tier_details', 'start_date', 'end_date', 'is_active']
        read_only_fields = ['user', 'start_date', 'is_active']