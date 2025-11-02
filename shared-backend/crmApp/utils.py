"""
Utility functions for the CRM application
"""

from typing import Optional, Dict, Any
from django.db.models import Q
from django.utils import timezone
import re


def normalize_phone(phone: str) -> str:
    """
    Normalize phone number format
    
    Args:
        phone: Phone number string
        
    Returns:
        Normalized phone number
    """
    if not phone:
        return ""
    
    # Remove all non-digit characters except +
    normalized = re.sub(r'[^\d+]', '', phone)
    return normalized


def validate_email(email: str) -> bool:
    """
    Validate email format
    
    Args:
        email: Email address string
        
    Returns:
        True if valid email format, False otherwise
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def build_search_query(search_term: str, fields: list) -> Q:
    """
    Build a Q object for searching across multiple fields
    
    Args:
        search_term: Search string
        fields: List of field names to search
        
    Returns:
        Django Q object for filtering
    """
    query = Q()
    for field in fields:
        query |= Q(**{f"{field}__icontains": search_term})
    return query


def calculate_expected_revenue(value: float, probability: float) -> float:
    """
    Calculate expected revenue based on deal value and probability
    
    Args:
        value: Deal value
        probability: Probability percentage (0-100)
        
    Returns:
        Expected revenue
    """
    if not value or not probability:
        return 0.0
    
    return value * (probability / 100)


def format_currency(amount: float, currency: str = 'USD') -> str:
    """
    Format currency value
    
    Args:
        amount: Amount to format
        currency: Currency code
        
    Returns:
        Formatted currency string
    """
    if currency == 'USD':
        return f"${amount:,.2f}"
    return f"{amount:,.2f} {currency}"


def get_client_ip(request) -> str:
    """
    Get client IP address from request
    
    Args:
        request: Django request object
        
    Returns:
        IP address string
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def get_user_agent(request) -> str:
    """
    Get user agent from request
    
    Args:
        request: Django request object
        
    Returns:
        User agent string
    """
    return request.META.get('HTTP_USER_AGENT', '')[:255]


def is_business_hours() -> bool:
    """
    Check if current time is during business hours (9 AM - 5 PM)
    
    Returns:
        True if business hours, False otherwise
    """
    now = timezone.now()
    return 9 <= now.hour < 17


def get_quarter(date=None) -> int:
    """
    Get quarter number (1-4) for a given date
    
    Args:
        date: Date object (defaults to current date)
        
    Returns:
        Quarter number (1-4)
    """
    if date is None:
        date = timezone.now()
    
    month = date.month
    return (month - 1) // 3 + 1


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename by removing special characters
    
    Args:
        filename: Original filename
        
    Returns:
        Sanitized filename
    """
    # Remove path components
    filename = filename.split('/')[-1].split('\\')[-1]
    
    # Remove special characters
    filename = re.sub(r'[^\w\s.-]', '', filename)
    
    # Replace spaces with underscores
    filename = filename.replace(' ', '_')
    
    return filename


def truncate_text(text: str, max_length: int = 100, suffix: str = '...') -> str:
    """
    Truncate text to specified length
    
    Args:
        text: Text to truncate
        max_length: Maximum length
        suffix: Suffix to add if truncated
        
    Returns:
        Truncated text
    """
    if not text or len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)] + suffix
