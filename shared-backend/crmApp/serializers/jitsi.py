"""
Serializers for Jitsi call sessions and user presence
"""
from rest_framework import serializers
from crmApp.models import JitsiCallSession, UserPresence, User


class UserPresenceSerializer(serializers.ModelSerializer):
    """Serializer for user presence/status"""
    
    username = serializers.CharField(source='user.username', read_only=True)
    full_name = serializers.SerializerMethodField()
    is_online = serializers.BooleanField(read_only=True)
    is_available = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = UserPresence
        fields = [
            'user',
            'username',
            'full_name',
            'status',
            'is_online',
            'is_available',
            'last_seen',
            'available_for_calls',
            'status_message',
            'current_call',
        ]
        read_only_fields = ['user', 'last_seen', 'current_call']
    
    def get_full_name(self, obj):
        """Get user's full name"""
        if obj.user.first_name or obj.user.last_name:
            return f"{obj.user.first_name} {obj.user.last_name}".strip()
        return obj.user.username


class OnlineUserSerializer(serializers.Serializer):
    """Simplified serializer for listing online users"""
    
    id = serializers.IntegerField()
    username = serializers.CharField()
    full_name = serializers.CharField()
    status = serializers.CharField()
    available_for_calls = serializers.BooleanField()
    status_message = serializers.CharField()
    current_call_id = serializers.IntegerField(allow_null=True)


class JitsiCallSessionSerializer(serializers.ModelSerializer):
    """Serializer for Jitsi call sessions"""
    
    initiator_name = serializers.SerializerMethodField()
    recipient_name = serializers.SerializerMethodField()
    duration_formatted = serializers.CharField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    participant_count = serializers.IntegerField(read_only=True)
    jitsi_url = serializers.SerializerMethodField()
    
    class Meta:
        model = JitsiCallSession
        fields = [
            'id',
            'session_id',
            'room_name',
            'call_type',
            'status',
            'initiator',
            'initiator_name',
            'recipient',
            'recipient_name',
            'participants',
            'started_at',
            'ended_at',
            'duration_seconds',
            'duration_formatted',
            'is_active',
            'participant_count',
            'organization',
            'recording_url',
            'notes',
            'jitsi_server',
            'jitsi_url',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'session_id',
            'room_name',
            'started_at',
            'ended_at',
            'duration_seconds',
            'organization',
            'created_at',
            'updated_at',
        ]
    
    def get_initiator_name(self, obj):
        """Get initiator's name"""
        if obj.initiator:
            if obj.initiator.first_name or obj.initiator.last_name:
                return f"{obj.initiator.first_name} {obj.initiator.last_name}".strip()
            return obj.initiator.username
        return None
    
    def get_recipient_name(self, obj):
        """Get recipient's name"""
        if obj.recipient:
            if obj.recipient.first_name or obj.recipient.last_name:
                return f"{obj.recipient.first_name} {obj.recipient.last_name}".strip()
            return obj.recipient.username
        return None
    
    def get_jitsi_url(self, obj):
        """Get 8x8 Video URL with JWT token for this call"""
        from crmApp.services.jitsi_service import jitsi_service
        
        # Get user from context if available
        request = self.context.get('request')
        if request and request.user:
            try:
                video_data = jitsi_service.get_video_url(obj, request.user)
                return video_data
            except Exception as e:
                # Return basic info if JWT generation fails
                return {
                    'room_name': obj.room_name,
                    'error': str(e)
                }
        
        # Return minimal info if no user context
        return {'room_name': obj.room_name}


class InitiateCallSerializer(serializers.Serializer):
    """Serializer for initiating a call"""
    
    recipient_id = serializers.IntegerField(required=False, allow_null=True)
    call_type = serializers.ChoiceField(choices=['audio', 'video'], default='video')
    
    def validate_recipient_id(self, value):
        """Validate recipient exists"""
        if value:
            try:
                User.objects.get(id=value)
            except User.DoesNotExist:
                raise serializers.ValidationError("Recipient user not found")
        return value


class UpdateCallStatusSerializer(serializers.Serializer):
    """Serializer for updating call status"""
    
    action = serializers.ChoiceField(choices=['answer', 'reject', 'end'])


class UpdatePresenceSerializer(serializers.Serializer):
    """Serializer for updating user presence"""
    
    status = serializers.ChoiceField(choices=['online', 'busy', 'away', 'offline'])
    available_for_calls = serializers.BooleanField(required=False)
    status_message = serializers.CharField(max_length=100, required=False, allow_blank=True)
