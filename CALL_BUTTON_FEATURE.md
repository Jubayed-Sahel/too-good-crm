# Call Button Feature for Customer Contact

**Date:** November 8, 2025  
**Status:** UI Complete - Ready for Twilio Integration

## Overview

Added a "Call" button to the Customer table that will be integrated with Twilio for direct customer calling functionality. The button is fully functional in the UI and ready for backend integration.

## Features

### UI Components

1. **Call Button in Customer Table**
   - Green-themed button with phone icon (FiPhone)
   - Only displays for customers who have a phone number
   - Available in both mobile card view and desktop table view
   - Tooltip: "Call customer via Twilio"

2. **Placement**
   - **Mobile View:** Full button with "Call" text in action row
   - **Desktop View:** Icon button in actions column
   - Positioned before View/Edit/Delete buttons

3. **Visual Design**
   - Color: Green (`colorPalette="green"`)
   - Icon: `FiPhone` from react-icons
   - Variant: `outline` (mobile), `ghost` (desktop)
   - Size: Small (`sm`)

## Implementation Details

### Files Modified

1. **`web-frontend/src/features/customers/components/CustomerTable.tsx`**
   - Added `onCall` prop to `CustomerTableProps` interface
   - Added conditional Call button in mobile view (lines ~165-175)
   - Added conditional Call button in desktop view (lines ~328-338)

2. **`web-frontend/src/components/customers/CustomerTable.tsx`**
   - Added `onCall` prop to `CustomerTableProps` interface
   - Added conditional Call button in mobile view
   - Added conditional Call button in desktop view

3. **`web-frontend/src/features/customers/components/CustomersPageContent.tsx`**
   - Added `onCall` prop to component props
   - Passed `onCall` to `CustomerTable` component

4. **`web-frontend/src/components/customers/CustomersPageContent.tsx`**
   - Added `onCall` prop to component props
   - Passed `onCall` to `CustomerTable` component

5. **`web-frontend/src/features/customers/pages/CustomersPage.tsx`**
   - Added `handleCall` function with placeholder implementation
   - Passed `handleCall` to `CustomersPageContent` component

### Current Behavior

```typescript
const handleCall = (customer: any) => {
  console.log('Initiating call to customer:', customer);
  // TODO: Integrate Twilio API
  alert(`Call feature coming soon!\n\nWill call: ${customer.name}\nPhone: ${customer.phone}`);
};
```

When clicked, the button:
1. Logs customer details to console
2. Shows an alert with customer name and phone number
3. Ready to be replaced with Twilio API call

## Conditional Display Logic

The Call button only appears when:
```typescript
{customer.phone && onCall && (
  <Button/IconButton ... />
)}
```

- ✅ Customer has a phone number
- ✅ `onCall` handler is provided
- ❌ Hidden if no phone number
- ❌ Hidden if no handler provided

## Next Steps for Twilio Integration

### 1. Backend API Endpoint

Create a new endpoint in Django:

```python
# shared-backend/crmApp/viewsets/customer.py

@action(detail=True, methods=['post'])
def initiate_call(self, request, pk=None):
    """Initiate a Twilio call to the customer"""
    customer = self.get_object()
    
    if not customer.phone:
        return Response(
            {'error': 'Customer has no phone number'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # TODO: Integrate Twilio SDK
    # from twilio.rest import Client
    # client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    # call = client.calls.create(
    #     to=customer.phone,
    #     from_=TWILIO_PHONE_NUMBER,
    #     url='http://demo.twilio.com/docs/voice.xml'
    # )
    
    return Response({
        'message': 'Call initiated',
        'customer_id': customer.id,
        'phone': customer.phone
    })
```

### 2. Frontend Service

Create Twilio service in web frontend:

```typescript
// web-frontend/src/services/twilio.service.ts

import api from '@/lib/apiClient';

class TwilioService {
  /**
   * Initiate a call to a customer
   */
  async initiateCall(customerId: string): Promise<void> {
    await api.post(`/customers/${customerId}/initiate_call/`);
  }
}

export const twilioService = new TwilioService();
```

### 3. Update Call Handler

Replace the placeholder in `CustomersPage.tsx`:

```typescript
const handleCall = async (customer: any) => {
  try {
    setIsCallLoading(true);
    await twilioService.initiateCall(customer.id);
    
    toaster.create({
      title: 'Call Initiated',
      description: `Calling ${customer.name} at ${customer.phone}`,
      type: 'success',
      duration: 3000,
    });
  } catch (error) {
    toaster.create({
      title: 'Call Failed',
      description: 'Unable to initiate call. Please try again.',
      type: 'error',
      duration: 3000,
    });
  } finally {
    setIsCallLoading(false);
  }
};
```

### 4. Environment Configuration

Add Twilio credentials to environment variables:

```bash
# shared-backend/.env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone
```

```python
# shared-backend/crmAdmin/settings.py
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER')
```

### 5. Install Twilio SDK

Backend:
```bash
pip install twilio
```

Add to `requirements.txt`:
```
twilio>=8.0.0
```

### 6. Call Activity Logging

Log calls in the Activity model:

```python
# After successful Twilio call
Activity.objects.create(
    customer=customer,
    activity_type='call',
    subject=f'Call to {customer.name}',
    description=f'Outbound call initiated to {customer.phone}',
    created_by=request.user,
    scheduled_at=timezone.now(),
    is_completed=True
)
```

## Testing Checklist

- [ ] Test call button appears for customers with phone numbers
- [ ] Test call button hidden for customers without phone numbers
- [ ] Test mobile responsive view
- [ ] Test desktop table view
- [ ] Test Twilio API integration
- [ ] Test error handling (invalid phone, API errors)
- [ ] Test activity logging after successful call
- [ ] Test permissions (only authorized users can call)
- [ ] Test call status updates
- [ ] Test multiple concurrent calls

## Future Enhancements

1. **Call Status Indicator**
   - Show calling/connected/ended states
   - Real-time status updates via WebSocket

2. **Call History**
   - Display recent calls in customer detail view
   - Call duration tracking
   - Call recordings (if enabled)

3. **Click-to-Call from Phone Number**
   - Make phone numbers clickable throughout the app
   - Direct dial from customer detail page

4. **Call Queue Management**
   - Queue multiple calls
   - Auto-dialer for bulk calling

5. **Call Analytics**
   - Track call success rates
   - Average call duration
   - Best time to call analysis

## UI/UX Considerations

- ✅ Only show for customers with valid phone numbers
- ✅ Green color for call action (universally recognized)
- ✅ Phone icon for instant recognition
- ✅ Tooltip provides context
- ✅ Responsive design for mobile and desktop
- 🔄 Add loading state during call initiation
- 🔄 Add success/error toast notifications
- 🔄 Add confirmation dialog for international calls
- 🔄 Add call cost estimate (if applicable)

## Security Considerations

- Validate phone numbers before calling
- Rate limit call endpoints
- Log all call attempts for audit
- Restrict by user permissions
- Encrypt Twilio credentials
- Use environment variables for sensitive data
- Implement RBAC for call functionality

## Cost Considerations

- Twilio charges per minute
- Monitor usage and set limits
- Consider adding budget alerts
- Track cost per customer/campaign
- Implement usage quotas per user

---

## Summary

The Call button UI is **100% complete** and ready for Twilio integration. The feature is:
- ✅ Fully responsive (mobile + desktop)
- ✅ Conditionally rendered (only with phone numbers)
- ✅ Properly styled and positioned
- ✅ Event handlers in place
- ⏳ Awaiting Twilio API integration

**Estimated Integration Time:** 2-4 hours
**Dependencies:** Twilio account, phone number, and API credentials
