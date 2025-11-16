"""
Issue Comment serializers
"""
from rest_framework import serializers
from crmApp.models import IssueComment


class IssueCommentSerializer(serializers.ModelSerializer):
    """Serializer for IssueComment model"""
    
    class Meta:
        model = IssueComment
        fields = [
            'id', 'issue', 'author', 'author_name', 'content',
            'linear_comment_id', 'synced_to_linear',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'linear_comment_id', 'synced_to_linear']


class CreateIssueCommentSerializer(serializers.ModelSerializer):
    """Serializer for creating issue comments"""
    
    class Meta:
        model = IssueComment
        fields = ['issue', 'content']
    
    def create(self, validated_data):
        # Get current user from request context
        request = self.context.get('request')
        user = request.user if request else None
        
        # Set author and author_name
        validated_data['author'] = user
        if user:
            validated_data['author_name'] = f"{user.first_name} {user.last_name}".strip() or user.username
        else:
            validated_data['author_name'] = 'Unknown User'
        
        return super().create(validated_data)

