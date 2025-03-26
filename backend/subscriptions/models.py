from django.db import models
from django.utils import timezone
from accounts.models import User

class SubscriptionTier(models.Model):
    DURATION_CHOICES = [
        ('7D', '7 Days'),
        ('LT', 'Lifetime')
    ]
    
    CURRENCY_CHOICES = [
        ('PHP', 'Philippine Peso'),
        ('USD', 'US Dollar')
    ]
    
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    price_usd = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='PHP')
    duration = models.CharField(max_length=2, choices=DURATION_CHOICES, default='7D')
    payment_required = models.BooleanField(default=True)
    book_limit = models.IntegerField(help_text='Lifetime book access limit')
    max_downloads = models.IntegerField()
    description = models.TextField()
    
    def save(self, *args, **kwargs):
        # Auto-calculate USD price if not set (using 1 USD = 50 PHP conversion)
        if not self.price_usd and self.price:
            self.price_usd = self.price / 50
        super().save(*args, **kwargs)

    def __str__(self):
        return self.get_name_display()

class UserSubscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_subscriptions')
    tier = models.ForeignKey(SubscriptionTier, on_delete=models.PROTECT)
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.end_date:
            if self.tier.duration == '7D':
                self.end_date = self.start_date + timezone.timedelta(days=7)
            elif self.tier.duration == 'LT':
                self.end_date = self.start_date + timezone.timedelta(days=365*100)  # 100 years for lifetime
            else:
                self.end_date = self.start_date + timezone.timedelta(days=30)
        super().save(*args, **kwargs)

    def is_valid(self):
        return self.is_active and self.end_date > timezone.now()

    def __str__(self):
        return f"{self.user.username}'s {self.tier.get_name_display()} subscription"