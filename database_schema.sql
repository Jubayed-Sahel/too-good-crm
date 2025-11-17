-- ============================================
-- CRM Database Schema
-- ============================================

-- ============================================
-- AUTHENTICATION & AUTHORIZATION TABLES
-- ============================================

-- Users Table (for authentication - supports multi-tenancy with profiles)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_staff BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP NULL,
    phone VARCHAR(20),
    last_login_at TIMESTAMP NULL,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,
    password_changed_at TIMESTAMP NULL,
    must_change_password BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- JWT Refresh Tokens Table
CREATE TABLE refresh_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP NULL,
    device_info VARCHAR(255),
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Password Reset Tokens Table
CREATE TABLE password_reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Email Verification Tokens Table
CREATE TABLE email_verification_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- MULTI-TENANCY & ORGANIZATION TABLES
-- ============================================

-- Organizations/Tenants Table
CREATE TABLE organizations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_code VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE,
    domain VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    logo VARCHAR(255),
    industry VARCHAR(100),
    company_size ENUM('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'),
    timezone VARCHAR(50) DEFAULT 'UTC',
    currency VARCHAR(3) DEFAULT 'USD',
    language VARCHAR(10) DEFAULT 'en',
    status ENUM('active', 'inactive', 'suspended', 'trial') DEFAULT 'trial',
    owner_user_id INT,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    tax_id VARCHAR(100),
    settings JSON,
    trial_ends_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- User Organization Mapping (for multi-org access)
CREATE TABLE user_organizations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    organization_id INT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    invited_by_user_id INT,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive', 'invited', 'rejected') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_org (user_id, organization_id)
);

-- User Profiles Table (Multi-tenancy: One user can have multiple profiles - Vendor, Employee, Customer)
CREATE TABLE user_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    organization_id INT NOT NULL,
    profile_type ENUM('vendor', 'employee', 'customer') NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    activated_at TIMESTAMP NULL,
    deactivated_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_org_profile (user_id, organization_id, profile_type)
);

-- ============================================
-- SUBSCRIPTION & PAYMENT TABLES
-- ============================================

-- Subscription Plans Table
CREATE TABLE subscription_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plan_code VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    plan_type ENUM('free', 'trial', 'basic', 'professional', 'enterprise', 'custom') DEFAULT 'basic',
    billing_cycle ENUM('monthly', 'quarterly', 'yearly', 'lifetime') DEFAULT 'monthly',
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    trial_days INT DEFAULT 0,
    max_users INT,
    max_contacts INT,
    max_deals INT,
    max_storage_gb INT,
    features JSON,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Organization Subscriptions Table
CREATE TABLE subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subscription_code VARCHAR(50) UNIQUE,
    organization_id INT NOT NULL,
    plan_id INT NOT NULL,
    status ENUM('active', 'cancelled', 'expired', 'past_due', 'trialing', 'paused') DEFAULT 'trialing',
    current_period_start DATE NOT NULL,
    current_period_end DATE NOT NULL,
    trial_ends_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    cancellation_reason TEXT,
    auto_renew BOOLEAN DEFAULT TRUE,
    seats_purchased INT DEFAULT 1,
    seats_used INT DEFAULT 0,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    next_billing_date DATE,
    payment_method ENUM('credit_card', 'bank_transfer', 'paypal', 'stripe', 'other'),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT
);

-- Payments/Invoices Table
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payment_code VARCHAR(50) UNIQUE,
    organization_id INT NOT NULL,
    subscription_id INT,
    invoice_number VARCHAR(100) UNIQUE,
    invoice_date DATE NOT NULL,
    due_date DATE,
    payment_date DATE,
    amount DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method ENUM('credit_card', 'bank_transfer', 'paypal', 'stripe', 'other'),
    payment_status ENUM('pending', 'paid', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
    transaction_id VARCHAR(255),
    payment_gateway VARCHAR(100),
    payment_gateway_response JSON,
    billing_address TEXT,
    billing_city VARCHAR(100),
    billing_state VARCHAR(100),
    billing_country VARCHAR(100),
    billing_postal_code VARCHAR(20),
    description TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL
);

-- Payment Line Items Table
CREATE TABLE payment_line_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payment_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(15,2) NOT NULL,
    line_total DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);

-- ============================================
-- ENHANCED RBAC TABLES
-- ============================================

-- Roles Table
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    UNIQUE KEY unique_org_role (organization_id, name)
);

-- Permissions Table
CREATE TABLE permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    is_system_permission BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Role Permissions Junction Table
CREATE TABLE role_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_permission (role_id, permission_id)
);

-- User Roles (per organization)
CREATE TABLE user_roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    organization_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_by_user_id INT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_org_role (user_id, organization_id, role_id)
);

-- Employees Table
CREATE TABLE employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    user_id INT,
    user_profile_id INT,
    employee_code VARCHAR(50),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    mobile VARCHAR(20),
    role_id INT,
    department VARCHAR(100),
    designation VARCHAR(100),
    employment_type ENUM('full_time', 'part_time', 'contract', 'intern') DEFAULT 'full_time',
    manager_id INT,
    date_of_joining DATE,
    date_of_leaving DATE,
    status ENUM('active', 'inactive', 'on_leave', 'terminated') DEFAULT 'active',
    profile_image VARCHAR(255),
    emergency_contact VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (user_profile_id) REFERENCES user_profiles(id) ON DELETE SET NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL,
    FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL,
    UNIQUE KEY unique_org_employee_code (organization_id, employee_code),
    UNIQUE KEY unique_org_employee_email (organization_id, email),
    UNIQUE KEY unique_org_user (organization_id, user_id)
);

-- Vendors Table
CREATE TABLE vendors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    user_id INT,
    user_profile_id INT,
    vendor_code VARCHAR(50),
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    mobile VARCHAR(20),
    website VARCHAR(255),
    industry VARCHAR(100),
    rating DECIMAL(3,2),
    status ENUM('active', 'inactive', 'pending', 'blacklisted') DEFAULT 'active',
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    tax_id VARCHAR(100),
    payment_terms VARCHAR(100),
    credit_limit DECIMAL(15,2),
    notes TEXT,
    assigned_employee_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (user_profile_id) REFERENCES user_profiles(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    UNIQUE KEY unique_org_vendor_code (organization_id, vendor_code),
    UNIQUE KEY unique_org_user (organization_id, user_id)
);

-- Customers Table
CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    user_id INT,
    user_profile_id INT,
    customer_code VARCHAR(50),
    company_name VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    mobile VARCHAR(20),
    website VARCHAR(255),
    industry VARCHAR(100),
    customer_type ENUM('individual', 'business') DEFAULT 'individual',
    status ENUM('active', 'inactive', 'prospect', 'vip') DEFAULT 'active',
    rating DECIMAL(3,2),
    credit_limit DECIMAL(15,2),
    payment_terms VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    tax_id VARCHAR(100),
    assigned_employee_id INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (user_profile_id) REFERENCES user_profiles(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    UNIQUE KEY unique_org_customer_code (organization_id, customer_code),
    UNIQUE KEY unique_org_user (organization_id, user_id)
);

-- Leads Table
CREATE TABLE leads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    lead_code VARCHAR(50),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    mobile VARCHAR(20),
    job_title VARCHAR(100),
    lead_source VARCHAR(100),
    industry VARCHAR(100),
    status ENUM('new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost') DEFAULT 'new',
    rating ENUM('hot', 'warm', 'cold') DEFAULT 'cold',
    estimated_value DECIMAL(15,2),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    assigned_employee_id INT,
    stage_id INT,
    converted_to_customer_id INT,
    converted_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (stage_id) REFERENCES pipeline_stages(id) ON DELETE SET NULL,
    FOREIGN KEY (converted_to_customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    UNIQUE KEY unique_org_lead_code (organization_id, lead_code)
);

-- Lead Stage History Table
-- Tracks which vendor/organization the lead belongs to and stage transitions
CREATE TABLE lead_stage_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lead_id INT NOT NULL,
    organization_id INT NOT NULL,
    stage_id INT,
    previous_stage_id INT,
    changed_by_employee_id INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (stage_id) REFERENCES pipeline_stages(id) ON DELETE SET NULL,
    FOREIGN KEY (previous_stage_id) REFERENCES pipeline_stages(id) ON DELETE SET NULL,
    FOREIGN KEY (changed_by_employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_lead_created (lead_id, created_at DESC),
    INDEX idx_org_stage (organization_id, stage_id),
    INDEX idx_org_created (organization_id, created_at DESC)
);

-- Accounts Table
CREATE TABLE accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    account_code VARCHAR(50),
    account_name VARCHAR(255) NOT NULL,
    account_type ENUM('customer', 'vendor', 'partner', 'competitor') DEFAULT 'customer',
    parent_account_id INT,
    customer_id INT,
    vendor_id INT,
    industry VARCHAR(100),
    annual_revenue DECIMAL(15,2),
    employee_count INT,
    website VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    billing_address TEXT,
    billing_city VARCHAR(100),
    billing_state VARCHAR(100),
    billing_country VARCHAR(100),
    billing_postal_code VARCHAR(20),
    shipping_address TEXT,
    shipping_city VARCHAR(100),
    shipping_state VARCHAR(100),
    shipping_country VARCHAR(100),
    shipping_postal_code VARCHAR(20),
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    assigned_employee_id INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    UNIQUE KEY unique_org_account_code (organization_id, account_code)
);

-- Pipeline Table
CREATE TABLE pipeline (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Pipeline Stages Table
CREATE TABLE pipeline_stages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pipeline_id INT NOT NULL,
    stage_name VARCHAR(100) NOT NULL,
    stage_order INT NOT NULL,
    probability DECIMAL(5,2),
    is_closed_won BOOLEAN DEFAULT FALSE,
    is_closed_lost BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pipeline_id) REFERENCES pipeline(id) ON DELETE CASCADE
);

-- Deals Table
CREATE TABLE deals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    deal_code VARCHAR(50),
    deal_name VARCHAR(255) NOT NULL,
    account_id INT,
    customer_id INT,
    lead_id INT,
    pipeline_id INT,
    stage_id INT,
    amount DECIMAL(15,2),
    expected_close_date DATE,
    actual_close_date DATE,
    probability DECIMAL(5,2),
    deal_type VARCHAR(100),
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('open', 'won', 'lost', 'abandoned') DEFAULT 'open',
    assigned_employee_id INT,
    next_step TEXT,
    description TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
    FOREIGN KEY (pipeline_id) REFERENCES pipeline(id) ON DELETE SET NULL,
    FOREIGN KEY (stage_id) REFERENCES pipeline_stages(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    UNIQUE KEY unique_org_deal_code (organization_id, deal_code)
);

-- Products Table
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    product_code VARCHAR(50),
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit_price DECIMAL(15,2) NOT NULL,
    cost_price DECIMAL(15,2),
    vendor_id INT,
    unit_of_measure VARCHAR(50),
    tax_rate DECIMAL(5,2),
    stock_quantity INT DEFAULT 0,
    reorder_level INT,
    status ENUM('active', 'inactive', 'discontinued') DEFAULT 'active',
    product_image VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
    UNIQUE KEY unique_org_product_code (organization_id, product_code)
);

-- Activities Table (Updated with new fields)
CREATE TABLE activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    activity_type ENUM('call', 'email', 'telegram', 'meeting', 'note', 'task') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    customer_id INT,
    lead_id INT,
    deal_id INT,
    customer_name VARCHAR(255),
    -- Activity-specific fields
    -- For calls
    phone_number VARCHAR(20),
    call_duration INT COMMENT 'Duration in seconds',
    call_recording_url VARCHAR(500),
    -- For emails
    email_subject VARCHAR(255),
    email_body TEXT,
    email_to VARCHAR(255),
    email_from VARCHAR(255),
    email_attachments JSON,
    -- For telegram
    telegram_username VARCHAR(100),
    telegram_message TEXT,
    telegram_chat_id VARCHAR(100),
    -- For meetings
    meeting_location VARCHAR(255),
    meeting_url VARCHAR(500),
    attendees JSON,
    -- For tasks
    task_priority ENUM('low', 'medium', 'high'),
    task_due_date DATE,
    -- Status and timeline
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    scheduled_at DATETIME,
    completed_at DATETIME,
    duration_minutes INT,
    -- Assignment
    assigned_employee_id INT,
    created_by_user_id INT,
    -- Additional metadata
    tags JSON,
    attachments JSON,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
    FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Issues Table (New table for tracking vendor and order issues)
CREATE TABLE issues (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    code VARCHAR(50),
    issue_number VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    vendor_id INT,
    order_id INT,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    category ENUM('general', 'delivery', 'quality', 'billing', 'communication', 'technical', 'other') DEFAULT 'general',
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    assigned_to_employee_id INT,
    created_by_user_id INT,
    resolved_at DATETIME,
    resolved_by_employee_id INT,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to_employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (resolved_by_employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    UNIQUE KEY unique_org_code (organization_id, code)
);

-- Orders Table (Updated with new fields)
DROP TABLE IF EXISTS order_details;
DROP TABLE IF EXISTS orders;

CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    code VARCHAR(50),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    vendor_id INT,
    customer_id INT,
    order_type ENUM('purchase', 'service', 'subscription', 'maintenance') DEFAULT 'purchase',
    status ENUM('draft', 'pending', 'approved', 'in_progress', 'completed', 'cancelled') DEFAULT 'draft',
    total_amount DECIMAL(12,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    tax_amount DECIMAL(12,2),
    discount_amount DECIMAL(12,2),
    order_date DATE NOT NULL,
    expected_delivery DATE,
    actual_delivery DATE,
    assigned_to_employee_id INT,
    created_by_user_id INT,
    notes TEXT,
    terms_and_conditions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to_employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_org_code (organization_id, code)
);

-- Order Items Table (Updated)
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100),
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Payments Table (Updated - separate from subscription payments)
DROP TABLE IF EXISTS payment_line_items;

CREATE TABLE crm_payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    code VARCHAR(50),
    payment_number VARCHAR(50) NOT NULL UNIQUE,
    invoice_number VARCHAR(50),
    reference_number VARCHAR(100),
    order_id INT,
    vendor_id INT,
    customer_id INT,
    payment_type ENUM('incoming', 'outgoing') DEFAULT 'outgoing',
    payment_method ENUM('bank_transfer', 'credit_card', 'debit_card', 'check', 'cash', 'paypal', 'stripe', 'other') DEFAULT 'bank_transfer',
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_date DATE NOT NULL,
    due_date DATE,
    status ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
    transaction_id VARCHAR(255),
    processed_at DATETIME,
    processed_by_employee_id INT,
    notes TEXT,
    created_by_user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (processed_by_employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_org_code (organization_id, code)
);

-- Samples Table
CREATE TABLE samples (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    sample_code VARCHAR(50),
    product_id INT,
    customer_id INT,
    lead_id INT,
    account_id INT,
    quantity INT NOT NULL,
    sample_date DATE NOT NULL,
    expected_return_date DATE,
    actual_return_date DATE,
    status ENUM('requested', 'approved', 'sent', 'delivered', 'returned', 'lost', 'rejected') DEFAULT 'requested',
    purpose TEXT,
    assigned_employee_id INT,
    shipping_address TEXT,
    shipping_city VARCHAR(100),
    shipping_state VARCHAR(100),
    shipping_country VARCHAR(100),
    shipping_postal_code VARCHAR(20),
    tracking_number VARCHAR(100),
    feedback TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    UNIQUE KEY unique_org_sample_code (organization_id, sample_code)
);

-- ============================================
-- AUDIT LOG TABLE
-- ============================================

CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- Indexes for Performance
-- ============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

CREATE INDEX idx_organizations_subdomain ON organizations(subdomain);
CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_user_organizations_user ON user_organizations(user_id);
CREATE INDEX idx_user_organizations_org ON user_organizations(organization_id);

CREATE INDEX idx_user_profiles_user ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_org ON user_profiles(organization_id);
CREATE INDEX idx_user_profiles_type ON user_profiles(profile_type);
CREATE INDEX idx_user_profiles_status ON user_profiles(status);

CREATE INDEX idx_subscriptions_org ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_payments_org ON payments(organization_id);
CREATE INDEX idx_payments_status ON payments(payment_status);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_org ON user_roles(organization_id);

CREATE INDEX idx_employees_org ON employees(organization_id);
CREATE INDEX idx_employees_user ON employees(user_id);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_role ON employees(role_id);
CREATE INDEX idx_employees_manager ON employees(manager_id);

CREATE INDEX idx_vendors_org ON vendors(organization_id);
CREATE INDEX idx_vendors_email ON vendors(email);
CREATE INDEX idx_vendors_assigned ON vendors(assigned_employee_id);

CREATE INDEX idx_customers_org ON customers(organization_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_assigned ON customers(assigned_employee_id);

CREATE INDEX idx_leads_org ON leads(organization_id);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned ON leads(assigned_employee_id);
CREATE INDEX idx_leads_org_stage ON leads(organization_id, stage_id);
CREATE INDEX idx_leads_stage_org ON leads(stage_id, organization_id);

CREATE INDEX idx_accounts_org ON accounts(organization_id);
CREATE INDEX idx_accounts_type ON accounts(account_type);
CREATE INDEX idx_accounts_assigned ON accounts(assigned_employee_id);

CREATE INDEX idx_pipeline_org ON pipeline(organization_id);

CREATE INDEX idx_deals_org ON deals(organization_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_assigned ON deals(assigned_employee_id);
CREATE INDEX idx_deals_customer ON deals(customer_id);

CREATE INDEX idx_products_org ON products(organization_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_vendor ON products(vendor_id);

CREATE INDEX idx_orders_org ON orders(organization_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_date ON orders(order_date);

CREATE INDEX idx_activities_org ON activities(organization_id);
CREATE INDEX idx_activities_type ON activities(activity_type);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_scheduled ON activities(scheduled_at);
CREATE INDEX idx_activities_completed ON activities(completed_at);
CREATE INDEX idx_activities_customer ON activities(customer_id);
CREATE INDEX idx_activities_lead ON activities(lead_id);
CREATE INDEX idx_activities_deal ON activities(deal_id);
CREATE INDEX idx_activities_assigned ON activities(assigned_employee_id);

CREATE INDEX idx_issues_org ON issues(organization_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_priority ON issues(priority);
CREATE INDEX idx_issues_category ON issues(category);
CREATE INDEX idx_issues_vendor ON issues(vendor_id);
CREATE INDEX idx_issues_order ON issues(order_id);
CREATE INDEX idx_issues_assigned ON issues(assigned_to_employee_id);
CREATE INDEX idx_issues_number ON issues(issue_number);

CREATE INDEX idx_order_items_order ON order_items(order_id);

CREATE INDEX idx_crm_payments_org ON crm_payments(organization_id);
CREATE INDEX idx_crm_payments_status ON crm_payments(status);
CREATE INDEX idx_crm_payments_type ON crm_payments(payment_type);
CREATE INDEX idx_crm_payments_order ON crm_payments(order_id);
CREATE INDEX idx_crm_payments_vendor ON crm_payments(vendor_id);
CREATE INDEX idx_crm_payments_customer ON crm_payments(customer_id);
CREATE INDEX idx_crm_payments_number ON crm_payments(payment_number);
CREATE INDEX idx_crm_payments_date ON crm_payments(payment_date);
CREATE INDEX idx_crm_payments_due_date ON crm_payments(due_date);

CREATE INDEX idx_samples_org ON samples(organization_id);
CREATE INDEX idx_samples_status ON samples(status);
CREATE INDEX idx_samples_product ON samples(product_id);

CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- ============================================
-- Insert Default Data
-- ============================================

-- Default Subscription Plans
INSERT INTO subscription_plans (plan_code, name, description, plan_type, billing_cycle, price, trial_days, max_users, max_contacts, max_deals, max_storage_gb, features) VALUES
('FREE', 'Free Plan', 'Basic features for startups', 'free', 'monthly', 0.00, 0, 2, 100, 10, 1, '{"email_support": false, "advanced_reports": false, "api_access": false}'),
('TRIAL', 'Trial Plan', '14-day trial with all features', 'trial', 'monthly', 0.00, 14, 5, 1000, 100, 5, '{"email_support": true, "advanced_reports": true, "api_access": true}'),
('BASIC', 'Basic Plan', 'Essential CRM features', 'basic', 'monthly', 29.99, 14, 5, 1000, 100, 5, '{"email_support": true, "advanced_reports": false, "api_access": false}'),
('PRO', 'Professional Plan', 'Advanced features for growing teams', 'professional', 'monthly', 79.99, 14, 20, 10000, 1000, 50, '{"email_support": true, "advanced_reports": true, "api_access": true}'),
('ENTERPRISE', 'Enterprise Plan', 'Unlimited features for large organizations', 'enterprise', 'monthly', 199.99, 14, 9999, 999999, 999999, 500, '{"email_support": true, "advanced_reports": true, "api_access": true, "custom_integrations": true, "dedicated_support": true}');

-- Default System Permissions
INSERT INTO permissions (name, resource, action, description, is_system_permission) VALUES
('view_all_leads', 'leads', 'read', 'View all leads in the system', TRUE),
('create_lead', 'leads', 'create', 'Create new leads', TRUE),
('edit_own_leads', 'leads', 'update', 'Edit own assigned leads', TRUE),
('edit_all_leads', 'leads', 'update', 'Edit all leads', TRUE),
('delete_leads', 'leads', 'delete', 'Delete leads', TRUE),
('view_all_deals', 'deals', 'read', 'View all deals', TRUE),
('create_deal', 'deals', 'create', 'Create new deals', TRUE),
('edit_own_deals', 'deals', 'update', 'Edit own assigned deals', TRUE),
('edit_all_deals', 'deals', 'update', 'Edit all deals', TRUE),
('delete_deals', 'deals', 'delete', 'Delete deals', TRUE),
('view_all_customers', 'customers', 'read', 'View all customers', TRUE),
('create_customer', 'customers', 'create', 'Create new customers', TRUE),
('edit_customer', 'customers', 'update', 'Edit customers', TRUE),
('delete_customer', 'customers', 'delete', 'Delete customers', TRUE),
('manage_products', 'products', 'all', 'Full product management', TRUE),
('manage_employees', 'employees', 'all', 'Full employee management', TRUE),
('manage_roles', 'roles', 'all', 'Full role management', TRUE),
('manage_permissions', 'permissions', 'all', 'Full permission management', TRUE),
('view_reports', 'reports', 'read', 'View reports and analytics', TRUE),
('manage_organization', 'organization', 'all', 'Manage organization settings', TRUE),
('manage_subscription', 'subscription', 'all', 'Manage subscription and billing', TRUE);

-- Default System Roles (without organization_id for system-wide defaults)
INSERT INTO roles (name, description, is_system_role) VALUES
('Super Admin', 'Full system access across all organizations', TRUE),
('Organization Owner', 'Full access within organization', TRUE),
('Admin', 'Administrative access within organization', TRUE),
('Sales Manager', 'Manage sales team and deals', TRUE),
('Sales Representative', 'Handle customer interactions and deals', TRUE),
('Support Staff', 'Customer support activities', TRUE),
('Viewer', 'Read-only access', TRUE);
