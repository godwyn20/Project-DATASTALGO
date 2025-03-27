from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    birthdate = models.DateField(blank=True, null=True)
    middle_name = models.CharField(max_length=150, blank=True, null=True)
    is_subscribed = models.BooleanField(default=False, null=True)
    subscription_end_date = models.DateTimeField(null=True, blank=True)

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_users',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_users_permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    def __str__(self):
        return self.username

class SubscriptionPlan(models.Model):
    DURATION_CHOICES = [
        ('1W', '1 Week'),
        ('4M', '4 Months'),
    ]

    name = models.CharField(max_length=100)
    duration = models.CharField(max_length=2, choices=DURATION_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    book_limit = models.IntegerField(default=10)

    def __str__(self):
        return f"{self.name} - {self.get_duration_display()}"

class Subscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT)
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    payment_status = models.CharField(max_length=20, default='pending')

    def save(self, *args, **kwargs):
        if not self.end_date:
            if self.plan.duration == '1W':
                self.end_date = self.start_date + timezone.timedelta(weeks=1)
            elif self.plan.duration == '6W':
                self.end_date = self.start_date + timezone.timedelta(weeks=6)
            elif self.plan.duration == '4M':
                self.end_date = self.start_date + timezone.timedelta(weeks=16)
        
        if self.is_active and self.payment_status == 'completed':
            self.user.is_subscribed = True
            self.user.subscription_end_date = self.end_date
            self.user.save()
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username}'s {self.plan.name} subscription"
