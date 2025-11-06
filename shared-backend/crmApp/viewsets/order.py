"""
Order related viewsets
"""

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
# from django_filters.rest_framework import DjangoFilterBackend  # Not installed
from django.db.models import Sum, Count, Q
from crmApp.models import Order, OrderItem
from crmApp.serializers import (
    OrderSerializer,
    OrderListSerializer,
    OrderCreateSerializer,
    OrderUpdateSerializer
)
import logging

logger = logging.getLogger(__name__)


class OrderViewSet(viewsets.ModelViewSet):
    """ViewSet for Order model"""
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['vendor', 'customer', 'order_type', 'status', 'assigned_to']
    search_fields = ['order_number', 'title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'order_date', 'total_amount']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter orders by organization"""
        if hasattr(self.request.user, 'current_organization'):
            return Order.objects.filter(
                organization=self.request.user.current_organization
            ).select_related('vendor', 'customer', 'assigned_to', 'created_by').prefetch_related('items')
        return Order.objects.none()
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return OrderListSerializer
        elif self.action == 'create':
            return OrderCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return OrderUpdateSerializer
        return OrderSerializer
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark order as completed"""
        try:
            order = self.get_object()
            order.status = 'completed'
            order.save()
            serializer = self.get_serializer(order)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Not Found', 'details': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error completing order {pk}: {str(e)}")
            return Response(
                {'error': 'Internal Server Error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an order"""
        try:
            order = self.get_object()
            order.status = 'cancelled'
            order.save()
            serializer = self.get_serializer(order)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Not Found', 'details': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error cancelling order {pk}: {str(e)}")
            return Response(
                {'error': 'Internal Server Error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get order statistics"""
        try:
            queryset = self.get_queryset()
            
            stats = {
                'total': queryset.count(),
                'total_revenue': queryset.aggregate(Sum('total_amount'))['total_amount__sum'] or 0,
                'by_status': {
                    'pending': queryset.filter(status='pending').count(),
                    'confirmed': queryset.filter(status='confirmed').count(),
                    'processing': queryset.filter(status='processing').count(),
                    'completed': queryset.filter(status='completed').count(),
                    'cancelled': queryset.filter(status='cancelled').count(),
                },
                'by_type': {
                    'purchase': queryset.filter(order_type='purchase').count(),
                    'service': queryset.filter(order_type='service').count(),
                }
            }
            
            return Response(stats, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error getting order stats: {str(e)}")
            return Response(
                {'error': 'Internal Server Error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
