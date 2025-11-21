"""
Customer Management Tools for MCP Server
Provides tools for customer CRUD operations with RBAC
"""

import logging
from typing import Optional, List, Dict, Any
from crmApp.models import Customer, Employee
from crmApp.serializers import CustomerSerializer, CustomerListSerializer

logger = logging.getLogger(__name__)

def register_customer_tools(mcp):
    """Register all customer-related tools"""
    
    @mcp.tool()
    def list_customers(
        status: str = "active",
        search: Optional[str] = None,
        customer_type: Optional[str] = None,
        assigned_to: Optional[int] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """
        List customers with filtering options.
        
        Args:
            status: Filter by status (active, inactive, all). Default: active
            search: Search by name, email, or company
            customer_type: Filter by type (individual, business)
            assigned_to: Filter by assigned employee ID
            limit: Maximum number of results (default: 20, max: 100)
        
        Returns:
            List of customer objects with details
        """
        try:
            mcp.check_permission('customer', 'read')
            org_id = mcp.get_organization_id()
            
            if not org_id:
                return {"error": "No organization context found"}
            
            # Build queryset
            queryset = Customer.objects.filter(organization_id=org_id)
            
            # Apply filters
            if status and status.lower() != 'all':
                queryset = queryset.filter(status=status)
            
            if customer_type:
                queryset = queryset.filter(customer_type=customer_type)
            
            if assigned_to:
                queryset = queryset.filter(assigned_to_id=assigned_to)
            
            if search:
                from django.db.models import Q
                queryset = queryset.filter(
                    Q(name__icontains=search) |
                    Q(email__icontains=search) |
                    Q(company_name__icontains=search) |
                    Q(first_name__icontains=search) |
                    Q(last_name__icontains=search)
                )
            
            # Limit results
            limit = min(limit, 100)  # Cap at 100
            queryset = queryset.select_related('assigned_to')[:limit]
            
            # Serialize
            serializer = CustomerListSerializer(queryset, many=True)
            
            logger.info(f"Retrieved {len(serializer.data)} customers for org {org_id}")
            return serializer.data
            
        except PermissionError as e:
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Error listing customers: {str(e)}", exc_info=True)
            return {"error": f"Failed to list customers: {str(e)}"}
    
    @mcp.tool()
    def get_customer(customer_id: int) -> Dict[str, Any]:
        """
        Get detailed information about a specific customer.
        
        Args:
            customer_id: The ID of the customer to retrieve
        
        Returns:
            Customer object with full details
        """
        try:
            mcp.check_permission('customer', 'read')
            org_id = mcp.get_organization_id()
            
            customer = Customer.objects.select_related('assigned_to', 'organization').get(
                id=customer_id,
                organization_id=org_id
            )
            
            serializer = CustomerSerializer(customer)
            logger.info(f"Retrieved customer {customer_id} for org {org_id}")
            return serializer.data
            
        except PermissionError as e:
            return {"error": str(e)}
        except Customer.DoesNotExist:
            return {"error": f"Customer with ID {customer_id} not found"}
        except Exception as e:
            logger.error(f"Error getting customer {customer_id}: {str(e)}", exc_info=True)
            return {"error": f"Failed to get customer: {str(e)}"}
    
    @mcp.tool()
    def create_customer(
        name: str,
        email: str,
        phone: Optional[str] = None,
        company_name: Optional[str] = None,
        customer_type: str = "individual",
        address: Optional[str] = None,
        city: Optional[str] = None,
        state: Optional[str] = None,
        postal_code: Optional[str] = None,
        country: Optional[str] = None,
        assigned_to: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Create a new customer.
        
        Args:
            name: Full name of the customer (required)
            email: Email address (required)
            phone: Phone number
            company_name: Company name (for business customers)
            customer_type: Type of customer (individual or business)
            address: Street address
            city: City
            state: State/Province
            postal_code: Postal/ZIP code
            country: Country
            assigned_to: Employee ID to assign customer to
        
        Returns:
            Created customer object
        """
        try:
            mcp.check_permission('customer', 'create')
            org_id = mcp.get_organization_id()
            
            if not org_id:
                return {"error": "No organization context found"}
            
            # Parse name into first_name and last_name
            name_parts = name.strip().split(maxsplit=1)
            first_name = name_parts[0] if len(name_parts) > 0 else ""
            last_name = name_parts[1] if len(name_parts) > 1 else ""
            
            # Create customer
            customer_data = {
                'organization_id': org_id,
                'name': name,
                'first_name': first_name,
                'last_name': last_name,
                'email': email,
                'phone': phone,
                'company_name': company_name,
                'customer_type': customer_type,
                'address': address,
                'city': city,
                'state': state,
                'postal_code': postal_code,
                'country': country,
                'status': 'active'
            }
            
            if assigned_to:
                # Verify employee exists in same org
                try:
                    employee = Employee.objects.get(id=assigned_to, organization_id=org_id)
                    customer_data['assigned_to_id'] = assigned_to
                except Employee.DoesNotExist:
                    return {"error": f"Employee {assigned_to} not found in your organization"}
            
            customer = Customer.objects.create(**customer_data)
            serializer = CustomerSerializer(customer)
            
            logger.info(f"Created customer {customer.id} in org {org_id}")
            return {
                "success": True,
                "message": f"Customer '{name}' created successfully",
                "customer": serializer.data
            }
            
        except PermissionError as e:
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Error creating customer: {str(e)}", exc_info=True)
            return {"error": f"Failed to create customer: {str(e)}"}
    
    @mcp.tool()
    def update_customer(
        customer_id: int,
        name: Optional[str] = None,
        email: Optional[str] = None,
        phone: Optional[str] = None,
        company_name: Optional[str] = None,
        address: Optional[str] = None,
        city: Optional[str] = None,
        state: Optional[str] = None,
        postal_code: Optional[str] = None,
        country: Optional[str] = None,
        assigned_to: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Update an existing customer.
        
        Args:
            customer_id: ID of the customer to update (required)
            name: Updated full name
            email: Updated email
            phone: Updated phone
            company_name: Updated company name
            address: Updated address
            city: Updated city
            state: Updated state
            postal_code: Updated postal code
            country: Updated country
            assigned_to: Updated assigned employee ID
        
        Returns:
            Updated customer object
        """
        try:
            mcp.check_permission('customer', 'update')
            org_id = mcp.get_organization_id()
            
            customer = Customer.objects.get(id=customer_id, organization_id=org_id)
            
            # Update fields if provided
            if name is not None:
                customer.name = name
                name_parts = name.strip().split(maxsplit=1)
                customer.first_name = name_parts[0] if len(name_parts) > 0 else ""
                customer.last_name = name_parts[1] if len(name_parts) > 1 else ""
            
            if email is not None:
                customer.email = email
            if phone is not None:
                customer.phone = phone
            if company_name is not None:
                customer.company_name = company_name
            if address is not None:
                customer.address = address
            if city is not None:
                customer.city = city
            if state is not None:
                customer.state = state
            if postal_code is not None:
                customer.postal_code = postal_code
            if country is not None:
                customer.country = country
            
            if assigned_to is not None:
                try:
                    employee = Employee.objects.get(id=assigned_to, organization_id=org_id)
                    customer.assigned_to = employee
                except Employee.DoesNotExist:
                    return {"error": f"Employee {assigned_to} not found in your organization"}
            
            customer.save()
            serializer = CustomerSerializer(customer)
            
            logger.info(f"Updated customer {customer_id} in org {org_id}")
            return {
                "success": True,
                "message": f"Customer updated successfully",
                "customer": serializer.data
            }
            
        except PermissionError as e:
            return {"error": str(e)}
        except Customer.DoesNotExist:
            return {"error": f"Customer with ID {customer_id} not found"}
        except Exception as e:
            logger.error(f"Error updating customer {customer_id}: {str(e)}", exc_info=True)
            return {"error": f"Failed to update customer: {str(e)}"}
    
    @mcp.tool()
    def deactivate_customer(customer_id: int) -> Dict[str, Any]:
        """
        Deactivate a customer (soft delete).
        
        Args:
            customer_id: ID of the customer to deactivate
        
        Returns:
            Success message
        """
        try:
            mcp.check_permission('customer', 'update')
            org_id = mcp.get_organization_id()
            
            customer = Customer.objects.get(id=customer_id, organization_id=org_id)
            customer.status = 'inactive'
            customer.save()
            
            logger.info(f"Deactivated customer {customer_id} in org {org_id}")
            return {
                "success": True,
                "message": f"Customer '{customer.name}' deactivated successfully"
            }
            
        except PermissionError as e:
            return {"error": str(e)}
        except Customer.DoesNotExist:
            return {"error": f"Customer with ID {customer_id} not found"}
        except Exception as e:
            logger.error(f"Error deactivating customer {customer_id}: {str(e)}", exc_info=True)
            return {"error": f"Failed to deactivate customer: {str(e)}"}
    
    @mcp.tool()
    def get_customer_stats() -> Dict[str, Any]:
        """
        Get customer statistics for the current organization.
        
        Returns:
            Dictionary with customer statistics (total, active, inactive, by type)
        """
        try:
            mcp.check_permission('customer', 'read')
            org_id = mcp.get_organization_id()
            
            if not org_id:
                return {"error": "No organization context found"}
            
            queryset = Customer.objects.filter(organization_id=org_id)
            
            stats = {
                'total': queryset.count(),
                'active': queryset.filter(status='active').count(),
                'inactive': queryset.filter(status='inactive').count(),
                'by_type': {
                    'individual': queryset.filter(customer_type='individual').count(),
                    'business': queryset.filter(customer_type='business').count(),
                }
            }
            
            logger.info(f"Retrieved customer stats for org {org_id}")
            return stats
            
        except PermissionError as e:
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Error getting customer stats: {str(e)}", exc_info=True)
            return {"error": f"Failed to get customer stats: {str(e)}"}
    
    logger.info("Customer tools registered")

