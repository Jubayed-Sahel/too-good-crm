"""
Enhanced Error Handler Utility

Provides consistent error responses across all API endpoints.
Handles Django exceptions, DRF exceptions, and custom business logic errors.
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import Http404
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler for DRF
    Provides consistent error response format
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        # Customize the response data
        custom_response_data = {
            'error': True,
            'message': get_error_message(exc, response),
            'status_code': response.status_code,
        }
        
        # Add validation errors if present
        if hasattr(response, 'data') and isinstance(response.data, dict):
            if 'non_field_errors' in response.data:
                custom_response_data['message'] = response.data['non_field_errors'][0]
            elif len(response.data) > 0:
                custom_response_data['errors'] = response.data
        
        response.data = custom_response_data
        
        # Log the error
        log_error(exc, context, response.status_code)
    else:
        # Handle Django validation errors
        if isinstance(exc, DjangoValidationError):
            response = Response(
                {
                    'error': True,
                    'message': str(exc.message) if hasattr(exc, 'message') else str(exc),
                    'status_code': status.HTTP_400_BAD_REQUEST,
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        # Handle 404
        elif isinstance(exc, Http404):
            response = Response(
                {
                    'error': True,
                    'message': 'Resource not found',
                    'status_code': status.HTTP_404_NOT_FOUND,
                },
                status=status.HTTP_404_NOT_FOUND
            )
        # Handle other exceptions
        else:
            logger.error(f"Unhandled exception: {exc}", exc_info=True)
            response = Response(
                {
                    'error': True,
                    'message': 'An unexpected error occurred',
                    'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR,
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    return response


def get_error_message(exc, response) -> str:
    """Extract user-friendly error message from exception"""
    if hasattr(exc, 'detail'):
        detail = exc.detail
        if isinstance(detail, dict):
            # Get first error message from dict
            for key, value in detail.items():
                if isinstance(value, list):
                    return str(value[0])
                return str(value)
        elif isinstance(detail, list):
            return str(detail[0])
        return str(detail)
    
    return str(exc)


def log_error(exc, context, status_code):
    """Log error with context"""
    view = context.get('view', None)
    request = context.get('request', None)
    
    error_info = {
        'exception': str(exc),
        'status_code': status_code,
        'view': view.__class__.__name__ if view else 'Unknown',
        'method': request.method if request else 'Unknown',
        'path': request.path if request else 'Unknown',
    }
    
    if status_code >= 500:
        logger.error(f"Server error: {error_info}", exc_info=True)
    elif status_code >= 400:
        logger.warning(f"Client error: {error_info}")


class BusinessLogicError(Exception):
    """
    Custom exception for business logic errors
    """
    def __init__(self, message: str, code: str = 'business_logic_error', status_code: int = status.HTTP_400_BAD_REQUEST):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(self.message)


class ResourceNotFoundError(Exception):
    """
    Custom exception for resource not found
    """
    def __init__(self, resource: str, identifier: Any):
        self.message = f"{resource} with id {identifier} not found"
        self.status_code = status.HTTP_404_NOT_FOUND
        super().__init__(self.message)


class PermissionDeniedError(Exception):
    """
    Custom exception for permission denied
    """
    def __init__(self, message: str = "You don't have permission to perform this action"):
        self.message = message
        self.status_code = status.HTTP_403_FORBIDDEN
        super().__init__(self.message)


def error_response(
    message: str,
    status_code: int = status.HTTP_400_BAD_REQUEST,
    errors: Optional[Dict[str, Any]] = None
) -> Response:
    """
    Create standardized error response
    
    Args:
        message: Error message
        status_code: HTTP status code
        errors: Optional dict of field-specific errors
    
    Returns:
        Response object with error data
    """
    data = {
        'error': True,
        'message': message,
        'status_code': status_code,
    }
    
    if errors:
        data['errors'] = errors
    
    return Response(data, status=status_code)


def success_response(
    data: Any,
    message: Optional[str] = None,
    status_code: int = status.HTTP_200_OK
) -> Response:
    """
    Create standardized success response
    
    Args:
        data: Response data
        message: Optional success message
        status_code: HTTP status code
    
    Returns:
        Response object with success data
    """
    response_data = {
        'error': False,
        'data': data,
    }
    
    if message:
        response_data['message'] = message
    
    return Response(response_data, status=status_code)
