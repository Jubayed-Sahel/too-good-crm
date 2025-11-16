"""
Issue Comment model for tracking comments and discussions on issues.
"""
from django.db import models
from .base import TimestampedModel


class IssueComment(TimestampedModel):
    """
    Comment model for issue discussions and updates.
    Allows users to add comments to issues without modifying the description.
    """
    
    issue = models.ForeignKey(
        'Issue',
        on_delete=models.CASCADE,
        related_name='comments'
    )
    
    author = models.ForeignKey(
        'User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='issue_comments'
    )
    
    author_name = models.CharField(
        max_length=255,
        help_text='Name of the comment author (stored for display)'
    )
    
    content = models.TextField(
        help_text='Comment text content'
    )
    
    # Linear Integration
    linear_comment_id = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text='Linear comment ID if synced from Linear'
    )
    
    synced_to_linear = models.BooleanField(
        default=False,
        help_text='Whether this comment has been synced to Linear'
    )
    
    class Meta:
        db_table = 'issue_comments'
        verbose_name = 'Issue Comment'
        verbose_name_plural = 'Issue Comments'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['issue', 'created_at']),
            models.Index(fields=['author']),
        ]
    
    def __str__(self):
        return f"Comment by {self.author_name} on {self.issue.issue_number}"

