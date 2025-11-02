"""
Custom validators for CRM models
"""

from django.core.exceptions import ValidationError
from django.core.validators import EmailValidator
import re


def validate_phone_number(value):
    """
    Validate phone number format
    """
    if not value:
        return
    
    # Remove all non-digit characters except +
    cleaned = re.sub(r'[^\d+]', '', value)
    
    # Check if it starts with + and has 10-15 digits
    if not re.match(r'^\+?\d{10,15}$', cleaned):
        raise ValidationError(
            'Invalid phone number format. Use format: +1234567890'
        )


def validate_website_url(value):
    """
    Validate website URL format
    """
    if not value:
        return
    
    # Check if URL starts with http:// or https://
    if not re.match(r'^https?://', value):
        raise ValidationError(
            'URL must start with http:// or https://'
        )


def validate_score(value):
    """
    Validate score is between 0 and 100
    """
    if value is not None and (value < 0 or value > 100):
        raise ValidationError(
            'Score must be between 0 and 100'
        )


def validate_probability(value):
    """
    Validate probability is between 0 and 100
    """
    if value is not None and (value < 0 or value > 100):
        raise ValidationError(
            'Probability must be between 0 and 100'
        )


def validate_positive_number(value):
    """
    Validate number is positive
    """
    if value is not None and value < 0:
        raise ValidationError(
            'Value must be a positive number'
        )


def validate_industry(value):
    """
    Validate industry is from allowed list
    """
    allowed_industries = [
        'technology', 'finance', 'healthcare', 'education',
        'retail', 'manufacturing', 'services', 'other'
    ]
    
    if value and value.lower() not in allowed_industries:
        raise ValidationError(
            f'Industry must be one of: {", ".join(allowed_industries)}'
        )


def validate_company_size(value):
    """
    Validate company size is from allowed list
    """
    allowed_sizes = ['small', 'medium', 'large', 'enterprise']
    
    if value and value.lower() not in allowed_sizes:
        raise ValidationError(
            f'Company size must be one of: {", ".join(allowed_sizes)}'
        )
