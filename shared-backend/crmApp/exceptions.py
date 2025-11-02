"""
Custom exception handlers for CRM API
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import Http404
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler for DRF
    
    Provides consistent error response format:
    {
        "error": "Error message",
        "details": {...},
        "status_code": 400
    }
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # Handle Django ValidationError
    if isinstance(exc, DjangoValidationError):
        data = {
            'error': 'Validation Error',
            'details': exc.message_dict if hasattr(exc, 'message_dict') else str(exc),
            'status_code': status.HTTP_400_BAD_REQUEST
        }
        return Response(data, status=status.HTTP_400_BAD_REQUEST)
    
    # Handle 404 errors
    if isinstance(exc, Http404):
        data = {
            'error': 'Not Found',
            'details': str(exc),
            'status_code': status.HTTP_404_NOT_FOUND
        }
        return Response(data, status=status.HTTP_404_NOT_FOUND)
    
    # If response is available, format it consistently
    if response is not None:
        custom_response_data = {
            'error': response.data.get('detail', 'An error occurred'),
            'details': response.data,
            'status_code': response.status_code
        }
        response.data = custom_response_data
        
        # Log error for debugging
        logger.error(
            f"API Error: {custom_response_data['error']} - "
            f"Status: {response.status_code} - "
            f"View: {context.get('view', 'Unknown')}"
        )
    
    return response


class APIException(Exception):
    """
    Base exception for API errors
    """
    default_message = 'An error occurred'
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    
    def __init__(self, message=None, status_code=None):
        self.message = message or self.default_message
        if status_code:
            self.status_code = status_code
        super().__init__(self.message)


class ValidationException(APIException):
    """Exception for validation errors"""
    default_message = 'Validation failed'
    status_code = status.HTTP_400_BAD_REQUEST


class AuthenticationException(APIException):
    """Exception for authentication errors"""
    default_message = 'Authentication failed'
    status_code = status.HTTP_401_UNAUTHORIZED


class PermissionException(APIException):
    """Exception for permission errors"""
    default_message = 'Permission denied'
    status_code = status.HTTP_403_FORBIDDEN


class NotFoundException(APIException):
    """Exception for not found errors"""
    default_message = 'Resource not found'
    status_code = status.HTTP_404_NOT_FOUND


class ConflictException(APIException):
    """Exception for conflict errors"""
    default_message = 'Resource conflict'
    status_code = status.HTTP_409_CONFLICT
