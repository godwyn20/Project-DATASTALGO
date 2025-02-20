from django.contrib import admin
from django.contrib.auth import get_user_model
from .models import SubscriptionPlan, Subscription

User = get_user_model()

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'is_subscribed', 'subscription_end_date')
    list_filter = ('is_subscribed',)
    search_fields = ('username', 'email')

@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'duration', 'price')
    search_fields = ('name',)

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'start_date', 'end_date', 'is_active', 'payment_status')
    list_filter = ('is_active', 'payment_status')
    search_fields = ('user__username', 'plan__name')
