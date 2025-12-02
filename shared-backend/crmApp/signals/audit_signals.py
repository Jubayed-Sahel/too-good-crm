"""
Django signals for automatic audit logging of all CRUD operations.
"""
import logging
from django.db.models.signals import post_save, post_delete, pre_save, pre_delete
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType

from crmApp.models import (
    Customer, Lead, Deal, Employee, Issue, Order, Payment,
    Activity, Pipeline, PipelineStage, AuditLog, UserProfile
)

logger = logging.getLogger(__name__)


def get_changed_fields(instance, original_data):
    """
    Compare current instance with original data to find changed fields.
    Returns dict of changes: {'field': {'old': value, 'new': value}}
    """
    changes = {}
    
    if not original_data:
        return changes
    
    # List of fields to track
    tracked_fields = []
    for field in instance._meta.fields:
        # Skip auto fields, timestamps, and internal fields
        if field.name in ['id', 'created_at', 'updated_at', 'code']:
            continue
        if field.name.startswith('_'):
            continue
        tracked_fields.append(field.name)
    
    for field_name in tracked_fields:
        try:
            old_value = original_data.get(field_name)
            new_value = getattr(instance, field_name, None)
            
            # Convert foreign key to ID for comparison
            if hasattr(new_value, 'id'):
                new_value = new_value.id
            if hasattr(old_value, 'id'):
                old_value = old_value.id
            
            # Only log if value changed
            if old_value != new_value:
                changes[field_name] = {
                    'old': str(old_value) if old_value is not None else None,
                    'new': str(new_value) if new_value is not None else None
                }
        except Exception as e:
            logger.warning(f"Error comparing field {field_name}: {e}")
            continue
    
    return changes


def get_resource_name(instance):
    """Get a human-readable name for the resource."""
    if hasattr(instance, 'name'):
        return instance.name
    elif hasattr(instance, 'title'):
        return instance.title
    elif hasattr(instance, 'email'):
        return instance.email
    elif hasattr(instance, 'code'):
        return instance.code
    return f"{instance.__class__.__name__} #{instance.id}"


def get_related_entities(instance):
    """Get related customer, lead, or deal from the instance."""
    related = {
        'related_customer': None,
        'related_lead': None,
        'related_deal': None
    }
    
    # Direct relationship
    if hasattr(instance, 'customer') and instance.customer:
        related['related_customer'] = instance.customer
    if hasattr(instance, 'lead') and instance.lead:
        related['related_lead'] = instance.lead
    if hasattr(instance, 'deal') and instance.deal:
        related['related_deal'] = instance.deal
    
    # Instance IS a customer/lead/deal
    if isinstance(instance, Customer):
        related['related_customer'] = instance
    elif isinstance(instance, Lead):
        related['related_lead'] = instance
    elif isinstance(instance, Deal):
        related['related_deal'] = instance
    
    return related


def log_audit(action, instance, user=None, changes=None, description=None):
    """
    Create an audit log entry.
    """
    try:
        logger.info(f"🔔 log_audit called: {action} {instance.__class__.__name__} #{getattr(instance, 'id', 'N/A')}")
        
        # Skip if no organization
        if not hasattr(instance, 'organization') or not instance.organization:
            logger.warning(f"⚠️  Skipping audit log - no organization for {instance.__class__.__name__}")
            return
        
        organization = instance.organization
        
        # Get user from thread-local storage if not provided
        if not user:
            from crmApp.middleware import get_current_user
            user = get_current_user()
            logger.debug(f"Got user from thread-local: {user}")
        
        # Try to get user from instance if it has created_by or updated_by
        if not user or not user.is_authenticated:
            if hasattr(instance, '_audit_user'):
                user = instance._audit_user
                logger.debug(f"Got user from instance._audit_user: {user}")
            elif hasattr(instance, 'created_by') and instance.created_by:
                user = instance.created_by
                logger.debug(f"Got user from instance.created_by: {user}")
        
        if not user or not user.is_authenticated:
            logger.warning(f"⚠️  Skipping audit log - no authenticated user (user={user}, authenticated={getattr(user, 'is_authenticated', False)})")
            logger.warning(f"   Instance: {instance.__class__.__name__} #{instance.id}, has _audit_user: {hasattr(instance, '_audit_user')}, has created_by: {hasattr(instance, 'created_by')}")
            return
        
        # Get user profile type
        active_profile = getattr(user, 'active_profile', None)
        if not active_profile:
            profiles = UserProfile.objects.filter(
                user=user,
                organization=organization,
                status='active'
            )
            active_profile = profiles.first()
        
        if not active_profile:
            logger.warning(f"No active profile for user {user.email} in org {organization.id}")
            return
        
        user_profile_type = active_profile.profile_type
        
        # Get resource info
        resource_type = instance.__class__.__name__.lower()
        resource_name = get_resource_name(instance)
        
        # Build description
        if not description:
            action_verb = {
                'create': 'created',
                'update': 'updated',
                'delete': 'deleted'
            }.get(action, action)
            description = f"{action_verb.capitalize()} {resource_type}: {resource_name}"
        
        # Get related entities (but not for delete actions to avoid FK constraints)
        related_entities = {}
        if action != 'delete':
            related_entities = get_related_entities(instance)
        
        # Create audit log
        AuditLog.objects.create(
            organization=organization,
            user=user,
            user_email=user.email,
            user_profile_type=user_profile_type,
            action=action,
            resource_type=resource_type,
            resource_id=instance.id if hasattr(instance, 'id') else None,
            resource_name=resource_name,
            description=description,
            changes=changes or {},
            **related_entities
        )
        
        logger.debug(f"Audit log created: {user.email} {action} {resource_type} #{instance.id}")
        
    except Exception as e:
        logger.error(f"Failed to create audit log: {e}", exc_info=True)


# Store original data before save for comparison
_original_data = {}


@receiver(pre_save)
def store_original_data(sender, instance, **kwargs):
    """
    Store original data before save to detect changes.
    Only for models we want to audit.
    """
    audited_models = (
        Customer, Lead, Deal, Employee, Issue, Order, Payment,
        Activity, Pipeline, PipelineStage
    )
    
    if not isinstance(instance, audited_models):
        return
    
    # Only for updates (instance has pk)
    if instance.pk:
        try:
            original = sender.objects.get(pk=instance.pk)
            # Store as dict of field values
            data = {}
            for field in original._meta.fields:
                try:
                    data[field.name] = getattr(original, field.name)
                except Exception:
                    continue
            _original_data[f"{sender.__name__}_{instance.pk}"] = data
        except sender.DoesNotExist:
            pass


@receiver(post_save, sender=Customer)
@receiver(post_save, sender=Lead)
@receiver(post_save, sender=Deal)
@receiver(post_save, sender=Employee)
@receiver(post_save, sender=Issue)
@receiver(post_save, sender=Order)
@receiver(post_save, sender=Payment)
@receiver(post_save, sender=Pipeline)
@receiver(post_save, sender=PipelineStage)
def log_create_or_update(sender, instance, created, **kwargs):
    """
    Log create or update actions.
    """
    try:
        if created:
            # New record created
            log_audit('create', instance)
        else:
            # Record updated
            key = f"{sender.__name__}_{instance.pk}"
            original_data = _original_data.get(key)
            changes = get_changed_fields(instance, original_data)
            
            # Only log if there are actual changes
            if changes:
                log_audit('update', instance, changes=changes)
            
            # Clean up stored data
            if key in _original_data:
                del _original_data[key]
    
    except Exception as e:
        logger.error(f"Error in post_save signal: {e}", exc_info=True)


@receiver(pre_delete, sender=Customer)
@receiver(pre_delete, sender=Lead)
@receiver(pre_delete, sender=Deal)
@receiver(pre_delete, sender=Employee)
@receiver(pre_delete, sender=Issue)
@receiver(pre_delete, sender=Order)
@receiver(pre_delete, sender=Payment)
@receiver(pre_delete, sender=Pipeline)
@receiver(pre_delete, sender=PipelineStage)
def log_delete(sender, instance, **kwargs):
    """
    Log delete actions using pre_delete to capture data before deletion.
    We use pre_delete (not post_delete) to avoid foreign key constraint issues
    when trying to link to a deleted object.
    """
    try:
        # Store deleted object info in changes for reference
        delete_info = {
            'deleted_id': instance.id,
            'deleted_name': get_resource_name(instance),
        }
        
        # Add related entity IDs (not objects, to avoid FK constraints)
        if hasattr(instance, 'customer_id') and instance.customer_id:
            delete_info['customer_id'] = instance.customer_id
        if hasattr(instance, 'lead_id') and instance.lead_id:
            delete_info['lead_id'] = instance.lead_id
        if hasattr(instance, 'deal_id') and instance.deal_id:
            delete_info['deal_id'] = instance.deal_id
        
        log_audit('delete', instance, changes=delete_info)
    except Exception as e:
        logger.error(f"Error in pre_delete signal: {e}", exc_info=True)


# Special handling for stage moves
@receiver(post_save, sender=Deal)
def log_deal_stage_move(sender, instance, created, **kwargs):
    """
    Log when a deal is moved to a different stage.
    """
    if created:
        return
    
    try:
        key = f"{sender.__name__}_{instance.pk}"
        original_data = _original_data.get(key)
        
        if original_data:
            old_stage_id = original_data.get('stage_id')
            new_stage_id = instance.stage_id
            
            if old_stage_id and new_stage_id and old_stage_id != new_stage_id:
                # Stage changed - log as 'moved' action
                old_stage_name = PipelineStage.objects.filter(id=old_stage_id).first()
                new_stage_name = instance.stage.name if instance.stage else 'Unknown'
                
                description = f"Moved deal '{instance.title}' from '{old_stage_name}' to '{new_stage_name}'"
                
                log_audit(
                    'moved',
                    instance,
                    description=description,
                    changes={
                        'stage': {
                            'old': str(old_stage_name) if old_stage_name else None,
                            'new': new_stage_name
                        }
                    }
                )
    
    except Exception as e:
        logger.error(f"Error logging deal stage move: {e}", exc_info=True)


@receiver(post_save, sender=Lead)
def log_lead_conversion(sender, instance, created, **kwargs):
    """
    Log when a lead is converted to a deal/customer.
    """
    if created:
        return
    
    try:
        key = f"{sender.__name__}_{instance.pk}"
        original_data = _original_data.get(key)
        
        if original_data:
            was_converted = original_data.get('is_converted', False)
            is_now_converted = instance.is_converted
            
            if not was_converted and is_now_converted:
                # Lead was just converted
                description = f"Converted lead '{instance.name}' to customer/deal"
                
                log_audit(
                    'converted',
                    instance,
                    description=description
                )
    
    except Exception as e:
        logger.error(f"Error logging lead conversion: {e}", exc_info=True)

