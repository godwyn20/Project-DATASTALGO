from django.db import models
from django.utils import timezone
from accounts.models import User

class SubscriptionTier(models.Model):
    TIER_CHOICES = [
        ('QUICK_READ', 'Quick Read'),
        ('EXPLORER', 'Explorer'),
        ('BOOKWORM', 'Bookworm'),
    ]

    name = models.CharField(max_length=20, choices=TIER_CHOICES, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    max_books_per_month = models.IntegerField(default=-1)  # -1 means unlimited
    max_downloads = models.IntegerField(default=-1)  # -1 means unlimited
    description = models.TextField()

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
            # Default to 30 days subscription
            self.end_date = self.start_date + timezone.timedelta(days=30)
        super().save(*args, **kwargs)

    def is_valid(self):
        return self.is_active and self.end_date > timezone.now()

    def __str__(self):
        return f"{self.user.username}'s {self.tier.get_name_display()} subscription"