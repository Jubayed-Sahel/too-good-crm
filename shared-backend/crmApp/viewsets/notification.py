"""
Notification ViewSets
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from crmApp.models import NotificationPreferences
from crmApp.serializers import NotificationPreferencesSerializer


class NotificationPreferencesViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing notification preferences
    """
    serializer_class = NotificationPreferencesSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Only return current user's notification preferences"""
        return NotificationPreferences.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        """
        Get or update current user's notification preferences
        GET: Retrieve preferences
        PUT/PATCH: Update preferences
        """
        # Get or create notification preferences for current user
        preferences, created = NotificationPreferences.objects.get_or_create(
            user=request.user
        )
        
        if request.method == 'GET':
            serializer = self.get_serializer(preferences)
            return Response(serializer.data)
        
        elif request.method in ['PUT', 'PATCH']:
            partial = request.method == 'PATCH'
            serializer = self.get_serializer(
                preferences,
                data=request.data,
                partial=partial
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """Override create to ensure user is set to current user"""
        # Check if preferences already exist
        if NotificationPreferences.objects.filter(user=request.user).exists():
            return Response(
                {'detail': 'Notification preferences already exist for this user.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )
