import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User

# List of users with their expected passwords
user_passwords = {
    'me': 'me',
    'admin': 'admin123',
    'john.vendor': 'vendor123',
    'sarah.manager': 'manager123',
    'mike.employee': 'employee123',
}

print("🔧 Fixing passwords for all test users...\n")

for username, password in user_passwords.items():
    try:
        user = User.objects.get(username=username)
        
        # Check if password is correct
        if user.check_password(password):
            print(f"✅ {username}: Password already correct")
        else:
            # Reset password
            user.set_password(password)
            user.save()
            
            # Verify it worked
            if user.check_password(password):
                print(f"✅ {username}: Password reset to '{password}'")
            else:
                print(f"❌ {username}: Password reset FAILED")
                
    except User.DoesNotExist:
        print(f"⚠️  {username}: User not found")

print("\n🎉 Password fix complete!")
print("\nYou can now login with:")
for username, password in user_passwords.items():
    print(f"  - Username: {username}, Password: {password}")
