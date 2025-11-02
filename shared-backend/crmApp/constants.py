"""
Constants used throughout the CRM application
"""

# User Status Choices
USER_STATUS_CHOICES = [
    ('active', 'Active'),
    ('inactive', 'Inactive'),
    ('suspended', 'Suspended'),
]

# Organization Sizes
ORG_SIZE_CHOICES = [
    ('small', 'Small (1-50)'),
    ('medium', 'Medium (51-200)'),
    ('large', 'Large (201-1000)'),
    ('enterprise', 'Enterprise (1000+)'),
]

# Industries
INDUSTRY_CHOICES = [
    ('technology', 'Technology'),
    ('finance', 'Finance'),
    ('healthcare', 'Healthcare'),
    ('education', 'Education'),
    ('retail', 'Retail'),
    ('manufacturing', 'Manufacturing'),
    ('services', 'Professional Services'),
    ('other', 'Other'),
]

# Lead Sources
LEAD_SOURCE_CHOICES = [
    ('website', 'Website'),
    ('referral', 'Referral'),
    ('social_media', 'Social Media'),
    ('email_campaign', 'Email Campaign'),
    ('cold_call', 'Cold Call'),
    ('event', 'Event'),
    ('partner', 'Partner'),
    ('other', 'Other'),
]

# Lead Status
LEAD_STATUS_CHOICES = [
    ('new', 'New'),
    ('active', 'Active'),
    ('nurturing', 'Nurturing'),
    ('inactive', 'Inactive'),
    ('disqualified', 'Disqualified'),
]

# Lead Qualification Status
LEAD_QUALIFICATION_CHOICES = [
    ('new', 'New'),
    ('contacted', 'Contacted'),
    ('qualified', 'Qualified'),
    ('unqualified', 'Unqualified'),
]

# Priority Levels
PRIORITY_CHOICES = [
    ('low', 'Low'),
    ('medium', 'Medium'),
    ('high', 'High'),
    ('urgent', 'Urgent'),
]

# Customer Types
CUSTOMER_TYPE_CHOICES = [
    ('individual', 'Individual'),
    ('business', 'Business'),
]

# Customer Status
CUSTOMER_STATUS_CHOICES = [
    ('active', 'Active'),
    ('inactive', 'Inactive'),
    ('churned', 'Churned'),
]

# Deal Status
DEAL_STATUS_CHOICES = [
    ('active', 'Active'),
    ('won', 'Won'),
    ('lost', 'Lost'),
    ('abandoned', 'Abandoned'),
]

# Employee Departments
DEPARTMENT_CHOICES = [
    ('sales', 'Sales'),
    ('marketing', 'Marketing'),
    ('support', 'Customer Support'),
    ('engineering', 'Engineering'),
    ('hr', 'Human Resources'),
    ('finance', 'Finance'),
    ('operations', 'Operations'),
    ('management', 'Management'),
]

# Vendor Types
VENDOR_TYPE_CHOICES = [
    ('supplier', 'Supplier'),
    ('contractor', 'Contractor'),
    ('consultant', 'Consultant'),
    ('partner', 'Partner'),
    ('other', 'Other'),
]

# Pagination Settings
DEFAULT_PAGE_SIZE = 25
MAX_PAGE_SIZE = 100

# Score Ranges
MIN_SCORE = 0
MAX_SCORE = 100

# Probability Ranges
MIN_PROBABILITY = 0
MAX_PROBABILITY = 100

# File Upload Settings
MAX_UPLOAD_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_FILE_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.png']

# Token Expiry (in days)
ACCESS_TOKEN_LIFETIME_DAYS = 1
REFRESH_TOKEN_LIFETIME_DAYS = 7
PASSWORD_RESET_TOKEN_LIFETIME_DAYS = 1
EMAIL_VERIFICATION_TOKEN_LIFETIME_DAYS = 3

# API Rate Limiting
API_RATE_LIMIT_PER_MINUTE = 60
API_RATE_LIMIT_PER_HOUR = 1000

# Business Hours
BUSINESS_HOURS_START = 9  # 9 AM
BUSINESS_HOURS_END = 17   # 5 PM

# Notification Settings
NOTIFICATION_TYPES = [
    ('email', 'Email'),
    ('sms', 'SMS'),
    ('push', 'Push Notification'),
    ('in_app', 'In-App'),
]

# Audit Log Actions
AUDIT_LOG_ACTIONS = [
    ('create', 'Create'),
    ('read', 'Read'),
    ('update', 'Update'),
    ('delete', 'Delete'),
    ('login', 'Login'),
    ('logout', 'Logout'),
]

# Permission Resources
PERMISSION_RESOURCES = [
    'users', 'organizations', 'roles', 'permissions',
    'employees', 'vendors', 'customers', 'leads', 'deals',
    'pipelines', 'reports', 'settings'
]

# Permission Actions
PERMISSION_ACTIONS = [
    'view', 'create', 'update', 'delete', 'manage'
]
