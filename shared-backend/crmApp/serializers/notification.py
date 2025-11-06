"""
Notification Serializers
"""
from rest_framework import serializers
from crmApp.models import NotificationPreferences


class NotificationPreferencesSerializer(serializers.ModelSerializer):
    """Serializer for notification preferences"""
    
    class Meta:
        model = NotificationPreferences
        fields = [
            'id',
            'user',
            'organization',
            # Email notifications
            'email_new_lead',
            'email_new_deal',
            'email_deal_won',
            'email_deal_lost',
            'email_team_activity',
            'email_weekly_summary',
            'email_monthly_report',
            # Push notifications
            'push_new_lead',
            'push_new_deal',
            'push_deal_won',
            'push_deal_lost',
            'push_team_activity',
            'push_mentions',
            'push_tasks_due',
            # General settings
            'digest_frequency',
            'quiet_hours_start',
            'quiet_hours_end',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def update(self, instance, validated_data):
        """Update notification preferences"""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
