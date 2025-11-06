"""
Payment related viewsets
"""

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
# from django_filters.rest_framework import DjangoFilterBackend  # Not installed
from django.db.models import Sum, Count
from crmApp.models import Payment
from crmApp.serializers import (
    PaymentSerializer,
    PaymentListSerializer,
    PaymentCreateSerializer,
    PaymentUpdateSerializer
)
import logging

logger = logging.getLogger(__name__)


class PaymentViewSet(viewsets.ModelViewSet):
    """ViewSet for Payment model"""
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['vendor', 'customer', 'order', 'payment_type', 'payment_method', 'status']
    search_fields = ['payment_number', 'invoice_number', 'reference_number', 'transaction_id']
    ordering_fields = ['created_at', 'updated_at', 'payment_date', 'amount']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter payments by organization"""
        if hasattr(self.request.user, 'current_organization'):
            return Payment.objects.filter(
                organization=self.request.user.current_organization
            ).select_related('vendor', 'customer', 'order', 'processed_by', 'created_by')
        return Payment.objects.none()
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return PaymentListSerializer
        elif self.action == 'create':
            return PaymentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return PaymentUpdateSerializer
        return PaymentSerializer
    
    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        """Mark payment as processed"""
        try:
            payment = self.get_object()
            payment.status = 'completed'
            payment.processed_by = request.user
            payment.save()  # This will trigger auto-set processed_at
            serializer = self.get_serializer(payment)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Payment.DoesNotExist:
            return Response(
                {'error': 'Not Found', 'details': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error processing payment {pk}: {str(e)}")
            return Response(
                {'error': 'Internal Server Error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def mark_failed(self, request, pk=None):
        """Mark payment as failed"""
        try:
            payment = self.get_object()
            payment.status = 'failed'
            payment.save()
            serializer = self.get_serializer(payment)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Payment.DoesNotExist:
            return Response(
                {'error': 'Not Found', 'details': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error marking payment as failed {pk}: {str(e)}")
            return Response(
                {'error': 'Internal Server Error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get payment statistics"""
        try:
            queryset = self.get_queryset()
            
            stats = {
                'total': queryset.count(),
                'total_amount': queryset.aggregate(Sum('amount'))['amount__sum'] or 0,
                'by_status': {
                    'pending': queryset.filter(status='pending').count(),
                    'processing': queryset.filter(status='processing').count(),
                    'completed': queryset.filter(status='completed').count(),
                    'failed': queryset.filter(status='failed').count(),
                    'refunded': queryset.filter(status='refunded').count(),
                },
                'by_payment_type': {
                    'incoming': queryset.filter(payment_type='incoming').aggregate(Sum('amount'))['amount__sum'] or 0,
                    'outgoing': queryset.filter(payment_type='outgoing').aggregate(Sum('amount'))['amount__sum'] or 0,
                },
                'by_payment_method': {
                    'cash': queryset.filter(payment_method='cash').count(),
                    'bank_transfer': queryset.filter(payment_method='bank_transfer').count(),
                    'credit_card': queryset.filter(payment_method='credit_card').count(),
                    'check': queryset.filter(payment_method='check').count(),
                    'online': queryset.filter(payment_method='online').count(),
                }
            }
            
            return Response(stats, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error getting payment stats: {str(e)}")
            return Response(
                {'error': 'Internal Server Error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
