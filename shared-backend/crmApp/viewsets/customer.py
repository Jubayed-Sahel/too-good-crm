"""
Customer ViewSet
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from crmApp.models import Customer
from crmApp.serializers import (
    CustomerSerializer,
    CustomerCreateSerializer,
    CustomerListSerializer,
    InitiateCallSerializer,
    CallSerializer,
)
from crmApp.services.twilio_service import twilio_service


class CustomerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Customer management.
    """
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CustomerListSerializer
        elif self.action == 'create':
            return CustomerCreateSerializer
        return CustomerSerializer
    
    def perform_create(self, serializer):
        """Auto-set organization from user's current organization"""
        import logging
        logger = logging.getLogger(__name__)
        
        # Get organization from request or use user's primary profile organization
        organization_id = self.request.data.get('organization')
        
        if not organization_id:
            # Fallback to user's primary profile organization
            primary_profile = self.request.user.user_profiles.filter(
                is_primary=True,
                status='active'
            ).first()
            
            if primary_profile:
                organization_id = primary_profile.organization_id
            else:
                # If no primary, get first active profile
                first_profile = self.request.user.user_profiles.filter(status='active').first()
                if first_profile:
                    organization_id = first_profile.organization_id
        
        logger.info(f"Creating customer for organization: {organization_id}, user: {self.request.user.username}")
        logger.info(f"Request data organization: {self.request.data.get('organization')}")
        
        serializer.save(organization_id=organization_id)
    
    def get_queryset(self):
        """Filter customers by user's organizations through user_profiles"""
        # Get organization IDs from user's active profiles
        user_orgs = self.request.user.user_profiles.filter(
            status='active'
        ).values_list('organization_id', flat=True)
        
        queryset = Customer.objects.filter(organization_id__in=user_orgs)
        
        # Filter by organization
        org_id = self.request.query_params.get('organization')
        if org_id:
            queryset = queryset.filter(organization_id=org_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by customer type
        customer_type = self.request.query_params.get('customer_type')
        if customer_type:
            queryset = queryset.filter(customer_type=customer_type)
        
        # Filter by assigned employee
        assigned_to = self.request.query_params.get('assigned_to')
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                name__icontains=search
            ) | queryset.filter(
                email__icontains=search
            ) | queryset.filter(
                company_name__icontains=search
            )
        
        return queryset.select_related('organization', 'assigned_to')
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get customer statistics"""
        user_orgs = request.user.user_profiles.filter(
            status='active'
        ).values_list('organization_id', flat=True)
        
        queryset = Customer.objects.filter(organization_id__in=user_orgs)
        
        stats = {
            'total': queryset.count(),
            'active': queryset.filter(status='active').count(),
            'inactive': queryset.filter(status='inactive').count(),
            'by_type': {
                'individual': queryset.filter(customer_type='individual').count(),
                'business': queryset.filter(customer_type='business').count(),
            }
        }
        
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a customer"""
        customer = self.get_object()
        customer.status = 'inactive'
        customer.save()
        
        return Response({
            'message': 'Customer deactivated successfully.',
            'customer': CustomerSerializer(customer).data
        })
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a customer"""
        customer = self.get_object()
        customer.status = 'active'
        customer.save()
        
        return Response({
            'message': 'Customer activated successfully.',
            'customer': CustomerSerializer(customer).data
        })
    
    @action(detail=True, methods=['get'])
    def notes(self, request, pk=None):
        """Get customer notes"""
        from crmApp.models import Activity
        customer = self.get_object()
        
        # Get all note-type activities for this customer
        notes = Activity.objects.filter(
            customer=customer,
            activity_type='note'
        ).select_related('created_by').order_by('-created_at')
        
        notes_data = [{
            'id': note.id,
            'customer': note.customer_id,
            'user': note.created_by_id if note.created_by else None,
            'user_name': note.created_by.full_name if note.created_by else 'Unknown',
            'note': note.description,
            'created_at': note.created_at
        } for note in notes]
        
        return Response(notes_data)
    
    @action(detail=True, methods=['post'])
    def add_note(self, request, pk=None):
        """Add a note to customer"""
        from crmApp.models import Activity
        customer = self.get_object()
        note_text = request.data.get('note')
        
        if not note_text:
            return Response(
                {'error': 'Note text is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        note = Activity.objects.create(
            customer=customer,
            activity_type='note',
            subject=f'Note for {customer.name}',
            description=note_text,
            created_by=request.user,
            is_completed=True
        )
        
        return Response({
            'id': note.id,
            'customer': note.customer_id,
            'user': note.created_by_id,
            'user_name': note.created_by.full_name,
            'note': note.description,
            'created_at': note.created_at
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def activities(self, request, pk=None):
        """Get customer activities"""
        from crmApp.models import Activity
        customer = self.get_object()
        
        activities = Activity.objects.filter(
            customer=customer
        ).select_related('created_by').order_by('-created_at')[:50]
        
        activities_data = [{
            'id': activity.id,
            'customer': activity.customer_id,
            'deal': activity.deal_id if hasattr(activity, 'deal') else None,
            'activity_type': activity.activity_type,
            'subject': activity.subject,
            'description': activity.description,
            'scheduled_at': activity.scheduled_at,
            'completed_at': activity.completed_at,
            'is_completed': activity.is_completed,
            'created_by': {
                'id': activity.created_by.id,
                'name': activity.created_by.full_name
            } if activity.created_by else None,
            'created_at': activity.created_at,
            'updated_at': activity.updated_at
        } for activity in activities]
        
        return Response(activities_data)
    
    @action(detail=True, methods=['post'])
    def initiate_call(self, request, pk=None):
        """Initiate a VOIP call to customer via Twilio"""
        from crmApp.models import Call, Activity
        import logging
        
        logger = logging.getLogger(__name__)
        customer = self.get_object()
        
        # Validate customer has phone number
        if not customer.phone:
            return Response(
                {'error': 'Customer does not have a phone number'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if Twilio is configured
        if not twilio_service.is_configured():
            return Response(
                {
                    'error': 'Twilio is not configured. Please add your Twilio credentials to the .env file.',
                    'details': 'Required: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER'
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        try:
            # Initiate the call via Twilio
            call_response = twilio_service.initiate_call(
                to_number=customer.phone,
                from_number=None  # Will use default from settings
            )
            
            logger.info(f"Call initiated: {call_response}")
            
            # Create call record in database
            call = Call.objects.create(
                call_sid=call_response['call_sid'],
                from_number=call_response['from'],
                to_number=call_response['to'],
                direction='outbound',
                status=call_response['status'],
                organization=customer.organization,
                customer=customer,
                initiated_by=request.user
            )
            
            # Create activity record for the call
            Activity.objects.create(
                organization=customer.organization,
                customer=customer,
                activity_type='call',
                title=f'Outbound call to {customer.name}',
                description=f'Initiated VOIP call to {customer.phone}',
                phone_number=customer.phone,
                created_by=request.user,
                status='completed',
                scheduled_at=call_response.get('date_created'),
                completed_at=call_response.get('date_created')
            )
            
            # Return call details
            return Response({
                'message': 'Call initiated successfully',
                'call': CallSerializer(call).data,
                'twilio_response': call_response
            }, status=status.HTTP_201_CREATED)
            
        except ValueError as e:
            logger.error(f"Configuration error: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            from twilio.base.exceptions import TwilioRestException
            
            logger.error(f"Error initiating call: {str(e)}")
            
            # Handle Twilio-specific errors
            if isinstance(e, TwilioRestException):
                error_code = getattr(e, 'code', None)
                error_msg = str(e)
                
                # Error 21219: Unverified number (trial account)
                if error_code == 21219 or 'unverified' in error_msg.lower():
                    return Response({
                        'error': f'The number {customer.phone} needs to be verified in your Twilio account. Trial accounts can only call verified numbers. Verify at: https://console.twilio.com/us1/develop/phone-numbers/manage/verified',
                        'twilio_error_code': error_code,
                        'action': 'verify_number'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Error 20003: Geographic permissions (international calling)
                if error_code == 20003 or 'not authorized to call' in error_msg.lower() or 'geo-permissions' in error_msg.lower():
                    return Response({
                        'error': f'Your Twilio account is not authorized to call {customer.phone}. You need to enable international calling permissions for this country. Enable at: https://console.twilio.com/us1/develop/voice/settings/geo-permissions',
                        'twilio_error_code': error_code,
                        'action': 'enable_geo_permissions'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Other Twilio errors
                return Response({
                    'error': f'Twilio error: {error_msg}',
                    'twilio_error_code': error_code
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Generic error
            return Response(
                {'error': f'Failed to initiate call: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def call_history(self, request, pk=None):
        """Get call history for customer"""
        from crmApp.models import Call
        
        customer = self.get_object()
        calls = Call.objects.filter(customer=customer).order_by('-created_at')
        
        return Response(CallSerializer(calls, many=True).data)
