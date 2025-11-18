"""
Message Serializers
"""

from rest_framework import serializers
from crmApp.models import Message, Conversation
from crmApp.serializers.auth import UserSerializer


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for Message model"""
    
    sender = UserSerializer(read_only=True)
    recipient = UserSerializer(read_only=True)
    sender_id = serializers.IntegerField(write_only=True, required=False)
    recipient_id = serializers.IntegerField(write_only=True)
    sender_email = serializers.CharField(source='sender.email', read_only=True)
    recipient_email = serializers.CharField(source='recipient.email', read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'id', 'sender', 'recipient', 'sender_id', 'recipient_id',
            'sender_email', 'recipient_email', 'message_type', 'subject',
            'content', 'organization', 'is_read', 'read_at',
            'related_lead', 'related_deal', 'related_customer',
            'attachments', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_read', 'read_at']
    
    def create(self, validated_data):
        """Create message with sender from request"""
        request = self.context.get('request')
        if request and request.user:
            validated_data['sender'] = request.user
        
        # Get recipient from recipient_id
        recipient_id = validated_data.pop('recipient_id', None)
        if recipient_id:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            validated_data['recipient'] = User.objects.get(id=recipient_id)
        
        return super().create(validated_data)


class MessageCreateSerializer(serializers.Serializer):
    """Serializer for creating messages"""
    
    recipient_id = serializers.IntegerField(required=True)
    content = serializers.CharField(required=True, max_length=5000)
    subject = serializers.CharField(required=False, allow_blank=True, max_length=255)
    related_lead_id = serializers.IntegerField(required=False, allow_null=True)
    related_deal_id = serializers.IntegerField(required=False, allow_null=True)
    related_customer_id = serializers.IntegerField(required=False, allow_null=True)
    attachments = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        allow_empty=True
    )
    
    def validate_recipient_id(self, value):
        """Validate recipient exists"""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("Recipient not found")
        return value


class ConversationSerializer(serializers.ModelSerializer):
    """Serializer for Conversation model"""
    
    participant1 = UserSerializer(read_only=True)
    participant2 = UserSerializer(read_only=True)
    last_message = MessageSerializer(read_only=True)
    other_participant = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'participant1', 'participant2', 'other_participant',
            'organization', 'last_message', 'last_message_at',
            'unread_count_participant1', 'unread_count_participant2',
            'unread_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_other_participant(self, obj):
        """Get the other participant (not the current user)"""
        request = self.context.get('request')
        if request and request.user:
            if obj.participant1 == request.user:
                return UserSerializer(obj.participant2).data
            return UserSerializer(obj.participant1).data
        return None
    
    def get_unread_count(self, obj):
        """Get unread count for current user"""
        request = self.context.get('request')
        if request and request.user:
            return obj.get_unread_count(request.user)
        return 0

