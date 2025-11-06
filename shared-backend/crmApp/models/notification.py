"""
Notification Preferences Model
Stores user and organization notification settings for email and push notifications
"""

from django.db import models
from django.conf import settings
from .base import TimestampedModel


class NotificationPreferences(TimestampedModel):
    """
    Notification preferences for users
    Controls email and push notification settings
    """
    
    DIGEST_FREQUENCY_CHOICES = [
        ('instant', 'Instant'),
        ('daily', 'Daily Digest'),
        ('weekly', 'Weekly Digest'),
        ('never', 'Never'),
    ]
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_preferences'
    )
    
    organization = models.ForeignKey(
        'Organization',
        on_delete=models.CASCADE,
        related_name='notification_preferences',
        null=True,
        blank=True
    )
    
    # Email Notifications
    email_new_lead = models.BooleanField(default=True, help_text="Notify when new lead is created")
    email_new_deal = models.BooleanField(default=True, help_text="Notify when new deal is created")
    email_deal_won = models.BooleanField(default=True, help_text="Notify when deal is won")
    email_deal_lost = models.BooleanField(default=False, help_text="Notify when deal is lost")
    email_team_activity = models.BooleanField(default=True, help_text="Notify about team activity")
    email_weekly_summary = models.BooleanField(default=True, help_text="Send weekly summary")
    email_monthly_report = models.BooleanField(default=True, help_text="Send monthly report")
    
    # Push Notifications
    push_new_lead = models.BooleanField(default=True, help_text="Push notification for new lead")
    push_new_deal = models.BooleanField(default=True, help_text="Push notification for new deal")
    push_deal_won = models.BooleanField(default=True, help_text="Push notification when deal is won")
    push_deal_lost = models.BooleanField(default=False, help_text="Push notification when deal is lost")
    push_team_activity = models.BooleanField(default=True, help_text="Push notification for team activity")
    push_mentions = models.BooleanField(default=True, help_text="Push notification when mentioned")
    push_tasks_due = models.BooleanField(default=True, help_text="Push notification for task reminders")
    
    # General Settings
    digest_frequency = models.CharField(
        max_length=20,
        choices=DIGEST_FREQUENCY_CHOICES,
        default='daily',
        help_text="How often to receive digest emails"
    )
    
    quiet_hours_start = models.TimeField(
        null=True,
        blank=True,
        help_text="Start of quiet hours (no notifications)"
    )
    
    quiet_hours_end = models.TimeField(
        null=True,
        blank=True,
        help_text="End of quiet hours"
    )
    
    class Meta:
        db_table = 'notification_preferences'
        verbose_name = 'Notification Preference'
        verbose_name_plural = 'Notification Preferences'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Notification Preferences for {self.user.username}"
    
    @classmethod
    def get_or_create_for_user(cls, user, organization=None):
        """
        Get or create notification preferences for a user
        """
        preferences, created = cls.objects.get_or_create(
            user=user,
            defaults={'organization': organization}
        )
        return preferences
    
    def reset_to_defaults(self):
        """
        Reset notification preferences to default values
        """
        self.email_new_lead = True
        self.email_new_deal = True
        self.email_deal_won = True
        self.email_deal_lost = False
        self.email_team_activity = True
        self.email_weekly_summary = True
        self.email_monthly_report = True
        
        self.push_new_lead = True
        self.push_new_deal = True
        self.push_deal_won = True
        self.push_deal_lost = False
        self.push_team_activity = True
        self.push_mentions = True
        self.push_tasks_due = True
        
        self.digest_frequency = 'daily'
        self.quiet_hours_start = None
        self.quiet_hours_end = None
        
        self.save()
        return self
