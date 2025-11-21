"""
Order and Payment Tools for MCP Server
"""

import logging
from typing import Optional, List, Dict, Any
from crmApp.models import Order, Payment
from crmApp.serializers import OrderSerializer, PaymentSerializer

logger = logging.getLogger(__name__)

def register_order_tools(mcp):
    """Register all order and payment-related tools"""
    
    @mcp.tool()
    def list_orders(
        status: Optional[str] = None,
        customer_id: Optional[int] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """
        List orders with filtering options.
        
        Args:
            status: Filter by status
            customer_id: Filter by customer ID
            limit: Maximum results
        
        Returns:
            List of order objects
        """
        try:
            role = mcp.get_user_role()
            org_id = mcp.get_organization_id()
            user_id = mcp.get_user_id()
            
            if role == 'customer':
                # Customers can only see their own orders
                from crmApp.models import Customer
                customer = Customer.objects.get(user_id=user_id, organization_id=org_id)
                queryset = Order.objects.filter(customer=customer)
            else:
                mcp.check_permission('order', 'read')
                queryset = Order.objects.filter(vendor__organization_id=org_id)
            
            if status:
                queryset = queryset.filter(status=status)
            if customer_id:
                queryset = queryset.filter(customer_id=customer_id)
            
            limit = min(limit, 100)
            queryset = queryset.select_related('customer', 'vendor')[:limit]
            
            serializer = OrderSerializer(queryset, many=True)
            return serializer.data
            
        except PermissionError as e:
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Error listing orders: {str(e)}", exc_info=True)
            return {"error": f"Failed to list orders: {str(e)}"}
    
    @mcp.tool()
    def get_order(order_id: int) -> Dict[str, Any]:
        """Get detailed information about a specific order."""
        try:
            role = mcp.get_user_role()
            org_id = mcp.get_organization_id()
            user_id = mcp.get_user_id()
            
            order = Order.objects.select_related('customer', 'vendor').get(id=order_id)
            
            # Permission check
            if role == 'customer':
                if order.customer.user_id != user_id:
                    return {"error": "You can only view your own orders"}
            else:
                if order.vendor.organization_id != org_id:
                    return {"error": "Order not found"}
            
            serializer = OrderSerializer(order)
            return serializer.data
            
        except Order.DoesNotExist:
            return {"error": "Order not found"}
        except Exception as e:
            logger.error(f"Error getting order: {str(e)}", exc_info=True)
            return {"error": f"Failed to get order: {str(e)}"}
    
    @mcp.tool()
    def list_payments(
        status: Optional[str] = None,
        order_id: Optional[int] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """
        List payments with filtering options.
        
        Args:
            status: Filter by status
            order_id: Filter by order ID
            limit: Maximum results
        
        Returns:
            List of payment objects
        """
        try:
            role = mcp.get_user_role()
            org_id = mcp.get_organization_id()
            user_id = mcp.get_user_id()
            
            if role == 'customer':
                from crmApp.models import Customer
                customer = Customer.objects.get(user_id=user_id, organization_id=org_id)
                queryset = Payment.objects.filter(order__customer=customer)
            else:
                mcp.check_permission('payment', 'read')
                queryset = Payment.objects.filter(order__vendor__organization_id=org_id)
            
            if status:
                queryset = queryset.filter(status=status)
            if order_id:
                queryset = queryset.filter(order_id=order_id)
            
            limit = min(limit, 100)
            queryset = queryset.select_related('order', 'order__customer')[:limit]
            
            serializer = PaymentSerializer(queryset, many=True)
            return serializer.data
            
        except PermissionError as e:
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Error listing payments: {str(e)}", exc_info=True)
            return {"error": f"Failed to list payments: {str(e)}"}
    
    @mcp.tool()
    def get_payment(payment_id: int) -> Dict[str, Any]:
        """Get detailed information about a specific payment."""
        try:
            role = mcp.get_user_role()
            org_id = mcp.get_organization_id()
            user_id = mcp.get_user_id()
            
            payment = Payment.objects.select_related('order', 'order__customer').get(id=payment_id)
            
            # Permission check
            if role == 'customer':
                if payment.order.customer.user_id != user_id:
                    return {"error": "You can only view your own payments"}
            else:
                if payment.order.vendor.organization_id != org_id:
                    return {"error": "Payment not found"}
            
            serializer = PaymentSerializer(payment)
            return serializer.data
            
        except Payment.DoesNotExist:
            return {"error": "Payment not found"}
        except Exception as e:
            logger.error(f"Error getting payment: {str(e)}", exc_info=True)
            return {"error": f"Failed to get payment: {str(e)}"}
    
    logger.info("Order and payment tools registered")

