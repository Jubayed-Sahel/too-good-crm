"""
Check which features are actually implemented in the bot
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.services.gemini_service import GeminiService

service = GeminiService()

# Create a mock user context
user_context = {'user_id': 1, 'organization_id': 1, 'role': 'vendor', 'permissions': []}

# Create tools
tools = service._create_crm_tools(user_context)

# Get all tool handlers
print('=' * 70)
print('ACTUALLY IMPLEMENTED TELEGRAM BOT FEATURES')
print('=' * 70)
print()

features = {
    'Customer Management': [
        'list_customers',
        'get_customer_count',
        'create_customer',
        'get_customer',
        'update_customer',
        'delete_customer',
    ],
    'Lead Management': [
        'list_leads',
        'create_lead',
        'update_lead',
        'qualify_lead',
        'convert_lead_to_customer',
    ],
    'Deal Management': [
        'list_deals',
        'create_deal',
        'update_deal',
        'mark_deal_won',
        'mark_deal_lost',
        'get_deal_stats',
    ],
    'Issue/Support Management': [
        'list_issues',
        'get_issue',
        'create_issue',
        'update_issue',
        'resolve_issue',
    ],
    'Analytics': [
        'get_dashboard_stats',
    ],
}

for category, tools_list in features.items():
    print(f'{category}:')
    for tool in tools_list:
        status = '✓' if tool in service._tool_handlers else '✗'
        print(f'  {status} {tool}')
    print()

print('=' * 70)
print(f'Total implemented: {len(service._tool_handlers)} tools')
print('=' * 70)

# Check what's NOT implemented
print()
print('NOT IMPLEMENTED (mentioned in features but missing):')
print('-' * 70)

not_implemented = [
    'Order Management (list_orders, create_order, get_order)',
    'Payment Management (list_payments, create_payment, record_payment)',
    'Employee Management (list_employees, add_employee, update_employee)',
    'Organization Management (show org details, update org settings)',
    'Deal pipeline visualization',
    'Sales funnel analysis',
    'Revenue by period',
    'Employee performance metrics',
    'Monthly/period analytics',
    'Conversion rate calculation',
    'Lead scoring updates',
    'Deal stage movement',
    'Issue comments',
    'Assign issues to staff',
]

for item in not_implemented:
    print(f'  ✗ {item}')

print()
print('=' * 70)
