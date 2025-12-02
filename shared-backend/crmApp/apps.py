from django.apps import AppConfig


class CrmappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'crmApp'
    
    def ready(self):
        """
        Import signal handlers when app is ready.
        """
        import crmApp.signals.audit_signals  # noqa: F401