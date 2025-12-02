"""
Audit Logging Mixin for ViewSets
Ensures current user is set for audit logging before CRUD operations
"""
import logging

logger = logging.getLogger(__name__)


class AuditLoggingMixin:
    """
    Mixin to ensure audit logging works by setting current_user before operations.
    
    Add this to any ViewSet that should have its operations logged:
    
    class MyViewSet(AuditLoggingMixin, viewsets.ModelViewSet):
        ...
    """
    
    def _set_audit_user(self):
        """Set current user for audit logging."""
        from crmApp.middleware import set_current_user
        
        if hasattr(self, 'request') and self.request.user.is_authenticated:
            set_current_user(self.request.user)
            
            # Ensure active_profile is set
            if not hasattr(self.request.user, 'active_profile') or not self.request.user.active_profile:
                from crmApp.utils.profile_context import get_user_active_profile
                self.request.user.active_profile = get_user_active_profile(self.request.user)
            
            logger.info(f"🔧 Audit: Set current_user = {self.request.user.email} (Profile: {getattr(self.request.user.active_profile, 'profile_type', 'None')})")
        else:
            logger.warning(f"⚠️  Audit: Could not set user (has request: {hasattr(self, 'request')}, authenticated: {getattr(self.request.user if hasattr(self, 'request') else None, 'is_authenticated', False)})")
    
    def perform_create(self, serializer):
        """Override to set audit user before create."""
        self._set_audit_user()
        return super().perform_create(serializer)
    
    def perform_update(self, serializer):
        """Override to set audit user before update."""
        self._set_audit_user()
        return super().perform_update(serializer)
    
    def perform_destroy(self, instance):
        """Override to set audit user before delete."""
        self._set_audit_user()
        return super().perform_destroy(instance)

