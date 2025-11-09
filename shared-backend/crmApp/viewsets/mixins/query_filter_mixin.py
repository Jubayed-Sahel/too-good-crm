"""
Mixin for common queryset filtering patterns.
"""


class QueryFilterMixin:
    """
    Mixin for common queryset filtering operations.
    """
    
    def apply_status_filter(self, queryset, request, field_name='status'):
        """
        Apply status filter from query parameters.
        
        Args:
            queryset: Base queryset
            request: Request object
            field_name: Field name to filter on (default: 'status')
            
        Returns:
            Filtered queryset
        """
        status_filter = request.query_params.get(field_name)
        if status_filter:
            queryset = queryset.filter(**{field_name: status_filter})
        return queryset
    
    def apply_search_filter(self, queryset, request, search_fields):
        """
        Apply search filter across multiple fields.
        
        Args:
            queryset: Base queryset
            request: Request object
            search_fields: List of field names to search in
            
        Returns:
            Filtered queryset
        """
        search = request.query_params.get('search')
        if search:
            from django.db.models import Q
            query = Q()
            for field in search_fields:
                query |= Q(**{f'{field}__icontains': search})
            queryset = queryset.filter(query)
        return queryset
    
    def apply_assigned_to_filter(self, queryset, request, field_name='assigned_to'):
        """
        Apply assigned_to filter from query parameters.
        
        Args:
            queryset: Base queryset
            request: Request object
            field_name: Field name to filter on (default: 'assigned_to')
            
        Returns:
            Filtered queryset
        """
        assigned_to = request.query_params.get(field_name)
        if assigned_to:
            queryset = queryset.filter(**{f'{field_name}_id': assigned_to})
        return queryset
    
    def apply_boolean_filter(self, queryset, request, field_name):
        """
        Apply boolean filter from query parameters.
        
        Args:
            queryset: Base queryset
            request: Request object
            field_name: Field name to filter on
            
        Returns:
            Filtered queryset
        """
        value = request.query_params.get(field_name)
        if value is not None:
            queryset = queryset.filter(**{field_name: value.lower() == 'true'})
        return queryset

