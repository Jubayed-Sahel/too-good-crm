#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import Permission, Organization

# Get all permissions in the system
print("=== ALL PERMISSIONS IN SYSTEM ===\n")
permissions = Permission.objects.all().order_by('resource', 'action')
for perm in permissions:
    print(f"{perm.resource}:{perm.action} - {perm.description}")

# Group by resource
from collections import defaultdict
perm_by_resource = defaultdict(list)
for perm in permissions:
    perm_by_resource[perm.resource].append(perm.action)

print("\n\n=== GROUPED BY RESOURCE ===\n")
for resource, actions in sorted(perm_by_resource.items()):
    print(f"{resource}:")
    for action in sorted(actions):
        print(f"  - {action}")
