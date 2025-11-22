"""
Telegram Bot Features Message
Comprehensive list of all CRM actions available through the bot
"""


def create_features_message(user_role: str = None) -> str:
    """
    Create features message showing all available CRM actions.
    Customized based on user role.
    
    Args:
        user_role: User's role (vendor, employee, customer)
        
    Returns:
        Formatted features message
    """
    
    # Base message
    message = (
        "<b>🎯 What Can I Do?</b>\n\n"
        "I'm your AI-powered CRM assistant! Here's everything I can help you with:\n\n"
    )
    
    # Customer Management
    message += (
        "<b>👥 Customer Management</b>\n"
        "• Show all customers\n"
        "• List my customers\n"
        "• Find customer named [name]\n"
        "• Show customer details for ID [number]\n"
        "• How many customers do I have?\n"
        "• Search customers by [criteria]\n\n"
    )
    
    # Lead Management
    message += (
        "<b>🎯 Lead Management</b>\n"
        "• Show my leads\n"
        "• List all leads\n"
        "• Create a new lead named [name] from [source]\n"
        "• Update lead [ID] to [status]\n"
        "• Show leads from [source]\n"
        "• Convert lead [ID] to a deal\n"
        "• Find leads by [criteria]\n\n"
    )
    
    # Deal Management
    message += (
        "<b>💰 Deal Management</b>\n"
        "• Show my deals\n"
        "• List all deals\n"
        "• What deals are in [stage]?\n"
        "• Create a deal for customer [ID]\n"
        "• Update deal [ID] to [stage]\n"
        "• Show deal pipeline\n"
        "• What's the total value of my deals?\n"
        "• Move deal [ID] to [stage]\n\n"
    )
    
    # Order Management
    message += (
        "<b>🛒 Order Management</b>\n"
        "• Show all orders\n"
        "• List orders for customer [ID]\n"
        "• Create a new order\n"
        "• What's the status of order #[number]?\n"
        "• Show pending orders\n"
        "• Update order [ID]\n\n"
    )
    
    # Payment Management
    message += (
        "<b>💳 Payment Management</b>\n"
        "• Record a payment of [amount] for order #[number]\n"
        "• Show all payments\n"
        "• List payments for customer [ID]\n"
        "• What payments are pending?\n"
        "• Show payment history\n\n"
    )
    
    # Issue Management
    message += (
        "<b>🐛 Issue & Support</b>\n"
        "• Create a support issue\n"
        "• Report a bug about [topic]\n"
        "• Show my open issues\n"
        "• List all issues\n"
        "• Update issue [ID] to [status]\n"
        "• Show issues assigned to me\n\n"
    )
    
    # Analytics (not for customers)
    if user_role != 'customer':
        message += (
            "<b>📊 Analytics & Reports</b>\n"
            "• Show statistics\n"
            "• What's my conversion rate?\n"
            "• Show monthly revenue\n"
            "• How many deals did I close this month?\n"
            "• Show sales performance\n"
            "• What's the total revenue?\n"
            "• Show analytics for [period]\n\n"
        )
    
    # Employee Management (vendor only)
    if user_role == 'vendor':
        message += (
            "<b>👨‍💼 Employee Management</b>\n"
            "• List all employees\n"
            "• Show employee details\n"
            "• Add a new employee\n"
            "• Update employee information\n\n"
        )
        
        message += (
            "<b>🏢 Organization Management</b>\n"
            "• Show organization details\n"
            "• Update organization settings\n"
            "• List all users in organization\n\n"
        )
    
    # Footer
    message += (
        "<b>💡 Tips:</b>\n"
        "• Just ask naturally - I understand plain English!\n"
        "• I remember our conversation context\n"
        "• Use /clear to start a fresh conversation\n"
        "• Type /help for basic commands\n\n"
        "<i>Ask me anything about your CRM data!</i>"
    )
    
    return message


def create_quick_actions_message(user_role: str = None) -> str:
    """
    Create a quick actions message with common tasks.
    
    Args:
        user_role: User's role (vendor, employee, customer)
        
    Returns:
        Formatted quick actions message
    """
    message = "<b>⚡ Quick Actions</b>\n\n"
    
    if user_role == 'customer':
        message += (
            "As a customer, you can:\n\n"
            "• View your profile\n"
            "• Check your orders\n"
            "• Track payments\n"
            "• Submit support issues\n"
            "• View issue status\n\n"
            "<b>Try:</b>\n"
            "\"Show my orders\"\n"
            "\"Create a support issue\"\n"
            "\"Show my profile\""
        )
    elif user_role == 'employee':
        message += (
            "As an employee, you can:\n\n"
            "• View all customers & leads\n"
            "• Manage your assigned deals\n"
            "• Create new leads & deals\n"
            "• View analytics\n"
            "• Handle support issues\n\n"
            "<b>Try:</b>\n"
            "\"Show my deals\"\n"
            "\"List all leads\"\n"
            "\"Show statistics\""
        )
    else:  # vendor
        message += (
            "As a vendor, you have full access:\n\n"
            "• Manage all CRM data\n"
            "• View complete analytics\n"
            "• Manage employees\n"
            "• Configure organization\n"
            "• Full CRUD operations\n\n"
            "<b>Try:</b>\n"
            "\"Show monthly revenue\"\n"
            "\"List all employees\"\n"
            "\"Show deal pipeline\""
        )
    
    return message

