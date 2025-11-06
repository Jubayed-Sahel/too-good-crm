"""
Quick script to verify employee data
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import Employee

employees = Employee.objects.all()
print(f"\n📊 Total Employees: {employees.count()}\n")
print("=" * 80)

for emp in employees:
    dept = emp.department or "(No Dept)"
    code = emp.code or "NO-CODE"
    print(f"{code:8} | {emp.first_name:12} {emp.last_name:12} | {emp.email:35} | {dept:20} | {emp.status}")

print("=" * 80)

# Show department stats
from django.db.models import Count
dept_stats = Employee.objects.values('department').annotate(count=Count('id')).order_by('-count')
print(f"\n📈 Department Distribution:")
for dept in dept_stats:
    print(f"  {dept['department'] or '(No Department)':20} : {dept['count']} employees")

# Show status stats
status_stats = Employee.objects.values('status').annotate(count=Count('id')).order_by('-count')
print(f"\n📊 Status Distribution:")
for stat in status_stats:
    print(f"  {stat['status']:15} : {stat['count']} employees")
