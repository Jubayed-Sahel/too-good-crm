from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, RefreshToken, PasswordResetToken, EmailVerificationToken,
    Organization, UserOrganization,
    Role, Permission, RolePermission, UserRole,
    Employee, Vendor, Customer, Lead,
    Pipeline, PipelineStage, Deal
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'username', 'is_active', 'is_verified', 'is_staff', 'created_at')
    list_filter = ('is_active', 'is_verified', 'is_staff', 'is_superuser')
    search_fields = ('email', 'username', 'phone')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal Info', {'fields': ('phone',)}),
        ('Permissions', {'fields': ('is_active', 'is_verified', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Security', {'fields': ('two_factor_enabled', 'must_change_password', 'failed_login_attempts', 'locked_until')}),
        ('Important dates', {'fields': ('last_login_at', 'email_verified_at', 'password_changed_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'is_staff', 'is_active')}
        ),
    )


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'subscription_plan', 'is_active', 'created_at')
    list_filter = ('subscription_plan', 'subscription_status', 'is_active', 'created_at')
    search_fields = ('name', 'slug', 'email', 'phone')
    ordering = ('-created_at',)


@admin.register(UserOrganization)
class UserOrganizationAdmin(admin.ModelAdmin):
    list_display = ('user', 'organization', 'is_active', 'is_owner', 'joined_at')
    list_filter = ('is_active', 'is_owner')
    search_fields = ('user__email', 'organization__name')


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'organization', 'is_system_role', 'is_active', 'created_at')
    list_filter = ('is_system_role', 'is_active')
    search_fields = ('name', 'description')


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ('resource', 'action', 'organization', 'is_system_permission')
    list_filter = ('is_system_permission', 'resource', 'action')
    search_fields = ('resource', 'action', 'description')


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'organization', 'code', 'status', 'created_at')
    list_filter = ('status', 'department', 'employment_type', 'created_at')
    search_fields = ('first_name', 'last_name', 'email', 'code')


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'company_name', 'customer_type', 'status', 'organization', 'created_at')
    list_filter = ('customer_type', 'status', 'created_at')
    search_fields = ('name', 'email', 'company_name', 'code')


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'company', 'status', 'qualification_status', 'organization', 'created_at')
    list_filter = ('status', 'qualification_status', 'source', 'created_at')
    search_fields = ('name', 'email', 'company', 'code')


@admin.register(Deal)
class DealAdmin(admin.ModelAdmin):
    list_display = ('title', 'customer', 'value', 'status', 'priority', 'expected_close_date', 'organization', 'created_at')
    list_filter = ('status', 'priority', 'is_won', 'is_lost', 'created_at')
    search_fields = ('title', 'code', 'customer__name')


@admin.register(Pipeline)
class PipelineAdmin(admin.ModelAdmin):
    list_display = ('name', 'organization', 'is_default', 'is_active', 'created_at')
    list_filter = ('is_default', 'is_active')
    search_fields = ('name', 'code')


@admin.register(PipelineStage)
class PipelineStageAdmin(admin.ModelAdmin):
    list_display = ('name', 'pipeline', 'order', 'probability', 'is_closed_won', 'is_closed_lost')
    list_filter = ('is_closed_won', 'is_closed_lost', 'is_active')
    search_fields = ('name',)


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact_person', 'email', 'status', 'organization', 'created_at')
    list_filter = ('status', 'vendor_type', 'created_at')
    search_fields = ('name', 'contact_person', 'email', 'code')


# Register other models without custom admin
admin.site.register(RefreshToken)
admin.site.register(PasswordResetToken)
admin.site.register(EmailVerificationToken)
admin.site.register(RolePermission)
admin.site.register(UserRole)
