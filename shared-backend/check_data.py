#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import Organization, User, UserProfile, Employee

print('\n=== ORGANIZATIONS ===')
for org in Organization.objects.all():
    print(f'ID: {org.id}, Name: {org.name}')

print('\n=== USERS ===')
for user in User.objects.all():
    print(f'ID: {user.id}, Email: {user.email}, Name: {user.full_name}')

print('\n=== USER PROFILES ===')
for profile in UserProfile.objects.all():
    print(f'ID: {profile.id}, User: {profile.user.email}, Type: {profile.profile_type}, Org: {profile.organization.name if profile.organization else None}, Primary: {profile.is_primary}')

print('\n=== EMPLOYEES ===')
for emp in Employee.objects.all():
    print(f'ID: {emp.id}, User: {emp.user.email if emp.user else None}, Org: {emp.organization.name}, Role: {emp.role.name if emp.role else None}')
