# Backend Documentation

This directory contains documentation for the Too Good CRM backend API.

## 📚 Documentation Index

### 🧪 Testing & API
- **[API_TESTING_GUIDE.md](API_TESTING_GUIDE.md)** - Comprehensive API testing guide
- **[ISSUE_ACTION_ENDPOINTS.md](ISSUE_ACTION_ENDPOINTS.md)** - Issue action API endpoints

### 🔗 Integrations
- **[LINEAR_INTEGRATION_GUIDE.md](LINEAR_INTEGRATION_GUIDE.md)** - Linear integration setup and usage
- **[LINEAR_API_REFERENCE.md](LINEAR_API_REFERENCE.md)** - Linear API reference
- **[LINEAR_COMPLETE.md](LINEAR_COMPLETE.md)** - Linear integration completion report

## 📖 Quick Reference

### Getting Started
1. Read [../README.md](../README.md) for project setup
2. Review [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md) for API overview
3. Check [LINEAR_INTEGRATION_GUIDE.md](LINEAR_INTEGRATION_GUIDE.md) for integrations

### Testing the API
1. Start the backend: `python manage.py runserver`
2. Follow [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md)
3. Use scripts in `../scripts/test/` for automated testing
4. Run verification: `python scripts/verify/verify_api.py`

### Working with Linear
1. Read [LINEAR_INTEGRATION_GUIDE.md](LINEAR_INTEGRATION_GUIDE.md) for setup
2. Check [LINEAR_API_REFERENCE.md](LINEAR_API_REFERENCE.md) for API details
3. Review [LINEAR_COMPLETE.md](LINEAR_COMPLETE.md) for implementation status

## 🎯 Document Purpose

### API Documentation
- **API_TESTING_GUIDE.md** - How to test all API endpoints
- **ISSUE_ACTION_ENDPOINTS.md** - Issue-specific endpoints

### Integration Guides
- **LINEAR_INTEGRATION_GUIDE.md** - Complete Linear integration guide
- **LINEAR_API_REFERENCE.md** - Linear API technical reference

### Status Reports
- **LINEAR_COMPLETE.md** - Linear implementation completion report

## 🔍 Finding What You Need

### I want to understand...

**API Endpoints:**
→ [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md)

**Issue Management:**
→ [ISSUE_ACTION_ENDPOINTS.md](ISSUE_ACTION_ENDPOINTS.md)

**Linear Integration:**
→ [LINEAR_INTEGRATION_GUIDE.md](LINEAR_INTEGRATION_GUIDE.md)

### I want to...

**Test the API:**
→ [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md)

**Set up Linear:**
→ [LINEAR_INTEGRATION_GUIDE.md](LINEAR_INTEGRATION_GUIDE.md)

**Understand webhooks:**
→ [LINEAR_INTEGRATION_GUIDE.md](LINEAR_INTEGRATION_GUIDE.md) (Webhook section)

**Check Linear API:**
→ [LINEAR_API_REFERENCE.md](LINEAR_API_REFERENCE.md)

## 📋 API Endpoints Overview

### Authentication
```
POST /api/auth/login/
POST /api/auth/register/
POST /api/auth/logout/
POST /api/auth/token/refresh/
POST /api/auth/select-profile/
```

### Resources
```
/api/customers/
/api/leads/
/api/deals/
/api/employees/
/api/organizations/
/api/orders/
/api/vendors/
/api/issues/
/api/activities/
/api/calls/
/api/payments/
/api/notifications/
```

### RBAC
```
/api/roles/
/api/permissions/
/api/user-profiles/
```

### Analytics
```
/api/analytics/
```

See [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md) for complete details.

## 🔧 Testing Resources

### Test Scripts
All test scripts are in `../scripts/test/`:
- `test_login.py` - Authentication testing
- `test_full_lifecycle.py` - End-to-end workflow testing
- `test_linear_integration.py` - Linear integration testing
- `test_call_endpoint.py` - Call endpoint testing
- `test_twilio.py` - Twilio integration testing

### Verification Scripts
All verification scripts are in `../scripts/verify/`:
- `verify_api.py` - Complete API verification
- `verify_employees.py` - Employee data verification
- `verify_user_profiles.py` - User profile verification

See [../scripts/README.md](../scripts/README.md) for complete script documentation.

## 🔗 Linear Integration

### Setup Steps
1. Configure Linear API key in settings
2. Set up webhook endpoint
3. Configure team mappings
4. Test integration

See [LINEAR_INTEGRATION_GUIDE.md](LINEAR_INTEGRATION_GUIDE.md) for detailed steps.

### Key Features
- Two-way issue sync
- Webhook notifications
- Status synchronization
- Comment syncing
- Assignment tracking

### API Endpoints
```
POST /api/linear/webhook/
GET /api/issues/
POST /api/issues/
PUT /api/issues/{id}/
DELETE /api/issues/{id}/
```

See [ISSUE_ACTION_ENDPOINTS.md](ISSUE_ACTION_ENDPOINTS.md) for details.

## 📝 Document Status

### Up to Date
- ✅ API_TESTING_GUIDE.md
- ✅ LINEAR_INTEGRATION_GUIDE.md
- ✅ LINEAR_API_REFERENCE.md

### Historical Reference
- 📜 LINEAR_COMPLETE.md

## 🤝 Contributing to Documentation

When adding or updating documentation:

1. **Choose the right location:**
   - API docs → this directory
   - Script docs → `../scripts/README.md`
   - General docs → project root

2. **Follow naming conventions:**
   - Use UPPERCASE_WITH_UNDERSCORES.md
   - Be descriptive but concise

3. **Include standard sections:**
   - Overview
   - Prerequisites
   - Setup/Configuration
   - Usage examples
   - Troubleshooting
   - References

4. **Update this README:**
   - Add to documentation index
   - Update quick reference
   - Update status section

## 🔍 Additional Resources

### Related Documentation
- [Main Backend README](../README.md)
- [Scripts Documentation](../scripts/README.md)
- [Web Frontend Docs](../../web-frontend/docs/)
- [Project Root README](../../README.md)
- [Database Schema](../../database_schema.sql)

### Project Documentation
- [RBAC Implementation](../../RBAC_IMPLEMENTATION_GUIDE.md)
- [Backend Implementation](../../BACKEND_IMPLEMENTATION_COMPLETE.md)
- [Database Documentation](../../DATABASE_README.md)

### External Resources
- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Linear API Docs](https://developers.linear.app/)
- [Twilio API Docs](https://www.twilio.com/docs)

## 🧪 Testing Workflow

### Quick Test
```bash
# Start server
python manage.py runserver

# In another terminal
python scripts/test/test_login.py
```

### Complete Test Suite
```bash
# Run all Django tests
python manage.py test

# Run custom test scripts
python scripts/test/test_full_lifecycle.py
python scripts/test/test_linear_integration.py

# Verify everything
python scripts/verify/verify_api.py
```

### Manual API Testing
Use tools like:
- Postman
- Insomnia
- curl
- HTTPie

See [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md) for examples.

## 🐛 Troubleshooting

### Common Issues

**Can't connect to API:**
- Check server is running: `python manage.py runserver`
- Verify port 8000 is not in use
- Check firewall settings

**Authentication fails:**
- Verify user exists
- Check password is correct
- Ensure token is valid
- Try refreshing token

**Linear integration not working:**
- Check API key is configured
- Verify webhook endpoint is accessible
- Check Linear team ID is correct
- Review webhook logs

### Debug Mode

Enable debug logging:
```python
# In settings.py
DEBUG = True
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
}
```

### Getting Help

1. Check relevant documentation
2. Review error logs in `../logs/`
3. Run verification scripts
4. Check database state
5. Ask the team

## 📞 Support

For issues or questions:
- Check this documentation
- Review test scripts
- Run verification scripts
- Check logs
- Create an issue

---

**Keep documentation updated as the API evolves!**

