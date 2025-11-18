"""
Lead related serializers
"""

from rest_framework import serializers
from crmApp.models import Lead, Customer, LeadStageHistory
from .employee import EmployeeListSerializer


class LeadListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for lead lists"""
    assigned_to_name = serializers.SerializerMethodField()
    stage_id = serializers.IntegerField(source='stage.id', read_only=True)
    stage_name = serializers.CharField(source='stage.name', read_only=True)
    
    class Meta:
        model = Lead
        fields = [
            'id', 'code', 'name', 'email', 'phone', 'organization_name',
            'job_title', 'status', 'source', 'qualification_status',
            'lead_score', 'estimated_value', 'assigned_to_name',
            'is_converted', 'stage_id', 'stage_name', 'created_at'
        ]
    
    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.full_name
        return None


class LeadStageHistorySerializer(serializers.ModelSerializer):
    """Serializer for lead stage history"""
    stage_name = serializers.CharField(source='stage.name', read_only=True)
    previous_stage_name = serializers.CharField(source='previous_stage.name', read_only=True)
    changed_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = LeadStageHistory
        fields = [
            'id', 'stage', 'stage_name', 'previous_stage', 'previous_stage_name',
            'changed_by', 'changed_by_name', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_changed_by_name(self, obj):
        if obj.changed_by:
            return obj.changed_by.full_name
        return None


class LeadSerializer(serializers.ModelSerializer):
    """Full lead serializer"""
    assigned_to = EmployeeListSerializer(read_only=True)
    converted_by_name = serializers.SerializerMethodField()
    stage_id = serializers.IntegerField(source='stage.id', read_only=True)
    stage_name = serializers.CharField(source='stage.name', read_only=True)
    stage_history = serializers.SerializerMethodField()
    
    class Meta:
        model = Lead
        fields = [
            'id', 'organization', 'code', 'name', 'organization_name',
            'job_title', 'email', 'phone', 'status', 'source',
            'qualification_status', 'assigned_to', 'lead_score',
            'estimated_value', 'is_converted', 'converted_at',
            'converted_by', 'converted_by_name', 'tags', 'notes',
            'campaign', 'referrer', 'address', 'city', 'state',
            'postal_code', 'country', 'stage', 'stage_id', 'stage_name',
            'stage_history', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at', 'converted_at', 'stage']
    
    def get_converted_by_name(self, obj):
        if obj.converted_by:
            return obj.converted_by.full_name
        return None
    
    def get_stage_history(self, obj):
        """Get stage history for the lead"""
        from crmApp.models import LeadStageHistory
        history = LeadStageHistory.objects.filter(lead=obj).order_by('-created_at')[:20]  # Last 20 entries
        return LeadStageHistorySerializer(history, many=True).data


class LeadCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating leads"""
    assigned_to_id = serializers.IntegerField(required=False, allow_null=True, write_only=True)
    zip_code = serializers.CharField(source='postal_code', required=False, allow_null=True)
    
    class Meta:
        model = Lead
        fields = [
            'organization', 'name', 'organization_name', 'job_title',
            'email', 'phone', 'source', 'qualification_status',
            'assigned_to_id', 'lead_score', 'estimated_value',
            'tags', 'notes', 'campaign', 'referrer',
            'address', 'city', 'state', 'postal_code', 'zip_code', 'country'
        ]
        extra_kwargs = {
            'organization': {'required': False}  # Will be set from request context
        }
    
    def create(self, validated_data):
        """Custom create to handle assigned_to_id, ensure Decimal conversion, and set default stage"""
        from decimal import Decimal
        import logging
        logger = logging.getLogger(__name__)
        
        assigned_to_id = validated_data.pop('assigned_to_id', None)
        
        # Get organization from validated_data or context
        # The organization should be set by perform_create in the viewset, but we handle it here as fallback
        organization = validated_data.get('organization')
        if not organization:
            # Try to get from context (set by viewset)
            request = self.context.get('request')
            if request:
                # Get organization from request context (set by middleware or viewset)
                if hasattr(request.user, 'current_organization') and request.user.current_organization:
                    organization = request.user.current_organization
                elif hasattr(request.user, 'active_profile') and request.user.active_profile:
                    organization = request.user.active_profile.organization
        
        if not organization:
            raise serializers.ValidationError({
                'organization': 'Organization is required. Please ensure you have an active profile.'
            })
        
        # Set organization in validated_data
        validated_data['organization'] = organization
        
        # Ensure estimated_value is Decimal if provided
        if 'estimated_value' in validated_data and validated_data['estimated_value'] is not None:
            try:
                if not isinstance(validated_data['estimated_value'], Decimal):
                    validated_data['estimated_value'] = Decimal(str(validated_data['estimated_value']))
            except (ValueError, TypeError) as e:
                logger.warning(f"Error converting estimated_value to Decimal: {e}")
                # Remove invalid estimated_value
                validated_data.pop('estimated_value', None)
        
        # Set default stage to "Lead" stage if not provided
        if organization and 'stage' not in validated_data:
            try:
                from crmApp.models import Pipeline, PipelineStage
                # Get or create default pipeline
                pipeline = Pipeline.objects.filter(
                    organization=organization,
                    is_active=True
                ).order_by('-is_default', '-created_at').first()
                
                if pipeline:
                    # Find "Lead" stage (case-insensitive match)
                    lead_stage = PipelineStage.objects.filter(
                        pipeline=pipeline,
                        name__icontains='lead'
                    ).order_by('order').first()
                    
                    # If no "Lead" stage found, get first stage
                    if not lead_stage:
                        lead_stage = PipelineStage.objects.filter(
                            pipeline=pipeline
                        ).order_by('order').first()
                    
                    if lead_stage:
                        validated_data['stage'] = lead_stage
            except Exception as e:
                logger.warning(f"Error setting default stage for lead: {e}")
        
        try:
            lead = Lead.objects.create(**validated_data)
        except Exception as e:
            logger.error(f"Error creating lead: {str(e)}", exc_info=True)
            raise
        
        if assigned_to_id:
            from crmApp.models import Employee
            try:
                employee = Employee.objects.get(id=assigned_to_id, organization=lead.organization)
                lead.assigned_to = employee
                lead.save()
            except Employee.DoesNotExist:
                pass  # Silently ignore if employee doesn't exist
        
        # Create initial stage history entry if stage is set
        if lead.stage:
            try:
                from crmApp.models import LeadStageHistory
                # Get current user's employee profile if available
                request = self.context.get('request')
                employee = None
                if request and request.user:
                    try:
                        from crmApp.models import Employee
                        employee = Employee.objects.filter(
                            user=request.user,
                            organization=lead.organization,
                            status='active'
                        ).first()
                    except Exception:
                        pass
                
                LeadStageHistory.objects.create(
                    lead=lead,
                    organization=lead.organization,
                    stage=lead.stage,
                    previous_stage=None,
                    changed_by=employee,
                    notes='Lead created with initial stage'
                )
                logger.info(f"Created initial stage history for lead {lead.id}: {lead.stage.name}")
            except Exception as e:
                logger.warning(f"Failed to create initial stage history for lead {lead.id}: {str(e)}", exc_info=True)
        
        return lead
    
    def validate_email(self, value):
        """Validate email format and uniqueness within organization"""
        if not value:
            return value
        
        organization = self.initial_data.get('organization')
        if organization:
            # Check if lead with this email exists in the organization
            if Lead.objects.filter(
                organization_id=organization,
                email__iexact=value,
                is_converted=False  # Only check unconverted leads
            ).exists():
                raise serializers.ValidationError(
                    "A lead with this email already exists in your organization."
                )
        
        return value.lower()
    
    def validate_phone(self, value):
        """Validate phone number format"""
        if not value:
            return value
        
        # Remove common separators
        cleaned = value.replace('-', '').replace(' ', '').replace('(', '').replace(')', '')
        digits_only = cleaned.replace('+', '')
        
        # Check if it's mostly digits
        if not digits_only.isdigit():
            raise serializers.ValidationError(
                "Phone number should only contain digits, spaces, hyphens, parentheses, and a leading +."
            )
        
        # Check minimum length (relaxed to 3 digits for international formats)
        if len(digits_only) < 3:
            raise serializers.ValidationError(
                "Phone number must be at least 3 digits."
            )
        
        return value
    
    def validate_lead_score(self, value):
        """Validate lead score is between 0 and 100"""
        if value is not None:
            if value < 0 or value > 100:
                raise serializers.ValidationError(
                    "Lead score must be between 0 and 100."
                )
        return value
    
    def validate_estimated_value(self, value):
        """Validate estimated value is positive and convert to Decimal"""
        from decimal import Decimal, InvalidOperation
        
        if value is None:
            return None
            
        if value < 0:
            raise serializers.ValidationError(
                "Estimated value cannot be negative."
            )
        
        # Convert to Decimal if it's not already
        try:
            if isinstance(value, str):
                return Decimal(value)
            elif isinstance(value, (int, float)):
                return Decimal(str(value))
            return value
        except (InvalidOperation, ValueError, TypeError) as e:
            raise serializers.ValidationError(
                f"Invalid estimated value format: {str(e)}"
            )
    
    def validate(self, attrs):
        """Object-level validation"""
        # Ensure at least name or organization_name is provided
        if not attrs.get('name') and not attrs.get('organization_name'):
            raise serializers.ValidationError(
                "Either 'name' or 'organization_name' must be provided."
            )
        
        # Ensure at least email or phone is provided
        if not attrs.get('email') and not attrs.get('phone'):
            raise serializers.ValidationError(
                "Either 'email' or 'phone' must be provided for contact."
            )
        
        return attrs


class LeadUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating leads"""
    assigned_to_id = serializers.IntegerField(required=False, allow_null=True)
    stage_id = serializers.IntegerField(required=False, allow_null=True, write_only=True)
    
    class Meta:
        model = Lead
        fields = [
            'name', 'organization_name', 'job_title', 'email', 'phone',
            'status', 'source', 'qualification_status',
            'assigned_to_id', 'stage_id', 'lead_score', 'estimated_value',
            'tags', 'notes', 'campaign', 'referrer',
            'address', 'city', 'state', 'postal_code', 'country'
        ]
    
    def update(self, instance, validated_data):
        """Custom update to handle stage_id"""
        stage_id = validated_data.pop('stage_id', None)
        previous_stage = instance.stage
        
        # Update stage if provided
        if stage_id is not None:
            from crmApp.models import PipelineStage, Pipeline, LeadStageHistory
            import logging
            logger = logging.getLogger(__name__)
            
            stage = None
            # Try to get stage by ID first (most direct approach)
            try:
                stage = PipelineStage.objects.get(id=stage_id)
                logger.info(f"Found stage {stage_id} directly: {stage.name}")
            except PipelineStage.DoesNotExist:
                # If stage doesn't exist by ID alone, try to find it by pipeline
                logger.warning(f"Stage {stage_id} not found directly, trying to find by pipeline...")
                pipeline = Pipeline.objects.filter(
                    organization=instance.organization,
                    is_active=True
                ).order_by('-is_default', '-created_at').first()
                
                if pipeline:
                    try:
                        stage = PipelineStage.objects.get(id=stage_id, pipeline=pipeline)
                        logger.info(f"Found stage {stage_id} in pipeline {pipeline.id}: {stage.name}")
                    except PipelineStage.DoesNotExist:
                        logger.warning(f"Stage {stage_id} not found in pipeline {pipeline.id}")
                else:
                    logger.warning(f"No active pipeline found for organization {instance.organization.id}, but trying to use stage {stage_id} anyway")
                    # Even without a pipeline, try to get the stage - it might be valid
                    try:
                        stage = PipelineStage.objects.get(id=stage_id)
                        logger.info(f"Found stage {stage_id} without pipeline check: {stage.name}")
                    except PipelineStage.DoesNotExist:
                        logger.error(f"Stage {stage_id} does not exist at all")
            
            # Update stage if found
            if stage:
                instance.stage = stage
                
                # Track stage change in history if stage actually changed
                if previous_stage != stage:
                    try:
                        # Get current user's employee profile if available
                        employee = None
                        request = self.context.get('request')
                        if request and request.user and hasattr(request.user, 'employee_profiles'):
                            employee = request.user.employee_profiles.filter(
                                organization=instance.organization
                            ).first()
                        
                        LeadStageHistory.objects.create(
                            lead=instance,
                            organization=instance.organization,
                            stage=stage,
                            previous_stage=previous_stage,
                            changed_by=employee,
                        )
                        logger.info(f"Created stage history for lead {instance.id}: {previous_stage} -> {stage}")
                    except Exception as e:
                        logger.warning(f"Failed to create stage history: {str(e)}")
            else:
                logger.error(f"Cannot update lead {instance.id} to stage {stage_id}: stage not found")
        
        # Update other fields
        return super().update(instance, validated_data)


class ConvertLeadSerializer(serializers.Serializer):
    """Serializer for converting lead to customer"""
    customer_type = serializers.ChoiceField(
        choices=['individual', 'business'],
        default='business'
    )
    assigned_to_id = serializers.IntegerField(required=False, allow_null=True)
    
    def validate(self, attrs):
        lead = self.context['lead']
        if lead.is_converted:
            raise serializers.ValidationError("Lead has already been converted.")
        return attrs
    
    def save(self):
        lead = self.context['lead']
        validated_data = self.validated_data
        
        # Create customer from lead
        customer = Customer.objects.create(
            organization=lead.organization,
            name=lead.name,
            company_name=lead.organization_name,
            email=lead.email,
            phone=lead.phone,
            customer_type=validated_data.get('customer_type', 'business'),
            status='active',
            assigned_to_id=validated_data.get('assigned_to_id'),
            source=lead.source,
            address=lead.address,
            city=lead.city,
            state=lead.state,
            postal_code=lead.postal_code,
            country=lead.country,
            notes=lead.notes,
            converted_from_lead=lead,
        )
        
        # Update lead
        lead.is_converted = True
        lead.converted_by = self.context['request'].user.employee_profiles.filter(
            organization=lead.organization
        ).first()
        lead.save()
        
        return customer
