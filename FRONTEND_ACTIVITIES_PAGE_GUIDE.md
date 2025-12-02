# Frontend Activities Page Implementation Guide

## 🎯 Current Issue

Your frontend Activities page is calling the **wrong API endpoint**:
- ❌ Currently calls: `/api/activities/` (old Activity model - for calls, meetings, tasks)
- ✅ Should call: `/api/audit-logs/` (new AuditLog model - for system actions)

---

## 📡 Correct API Endpoints

### 1. List Audit Logs
```
GET /api/audit-logs/
GET /api/audit-logs/?page=2
GET /api/audit-logs/?action=create
GET /api/audit-logs/?resource_type=customer
GET /api/audit-logs/?search=john
```

### 2. Get Statistics
```
GET /api/audit-logs/stats/
```

**Response:**
```json
{
  "total_logs": 150,
  "recent_activity_24h": 45,
  "by_action": {
    "create": {"label": "Created", "count": 60},
    "update": {"label": "Updated", "count": 70},
    "delete": {"label": "Deleted", "count": 15}
  },
  "by_resource": {
    "customer": {"label": "Customer", "count": 50},
    "lead": {"label": "Lead", "count": 40}
  },
  "by_profile_type": {
    "vendor": 100,
    "employee": 45,
    "customer": 5
  }
}
```

### 3. Get Recent Activities
```
GET /api/audit-logs/recent/
```

Returns last 50 audit logs.

### 4. Get Timeline
```
GET /api/audit-logs/timeline/
```

**Response:**
```json
{
  "2025-12-02": [
    {
      "id": 1,
      "user_email": "sahel@gmail.com",
      "user_profile_type": "vendor",
      "action": "create",
      "action_display": "Created",
      "resource_type": "customer",
      "resource_type_display": "Customer",
      "resource_name": "John Doe",
      "description": "Created customer: John Doe",
      "created_at": "2025-12-02T10:30:00Z"
    }
  ],
  "2025-12-01": [...]
}
```

---

## 🔧 Frontend Code Updates

### Step 1: Update API Service

**File:** `web-frontend/src/services/auditLog.service.ts` (create new)

```typescript
import api from '@/lib/apiClient';
import { buildUrl } from '@/lib/utils';

export interface AuditLog {
  id: number;
  created_at: string;
  user_email: string;
  user_profile_type: 'vendor' | 'employee' | 'customer';
  action: string;
  action_display: string;
  resource_type: string;
  resource_type_display: string;
  resource_id: number | null;
  resource_name: string;
  description: string;
  changes?: Record<string, { old: any; new: any }>;
  related_customer?: number;
  related_lead?: number;
  related_deal?: number;
}

export interface AuditLogStats {
  total_logs: number;
  recent_activity_24h: number;
  by_action: Record<string, { label: string; count: number }>;
  by_resource: Record<string, { label: string; count: number }>;
  by_profile_type: Record<string, number>;
}

export interface AuditLogFilters {
  action?: string;
  resource_type?: string;
  user_id?: number;
  profile_type?: string;
  customer_id?: number;
  lead_id?: number;
  deal_id?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
}

class AuditLogService {
  /**
   * Get audit logs with optional filters
   */
  async getAuditLogs(filters?: AuditLogFilters) {
    const url = buildUrl('/api/audit-logs/', filters);
    return api.get(url);
  }

  /**
   * Get audit log statistics
   */
  async getStats(): Promise<AuditLogStats> {
    return api.get('/api/audit-logs/stats/');
  }

  /**
   * Get recent audit logs (last 50)
   */
  async getRecent(): Promise<AuditLog[]> {
    return api.get('/api/audit-logs/recent/');
  }

  /**
   * Get timeline view (grouped by date)
   */
  async getTimeline(): Promise<Record<string, AuditLog[]>> {
    return api.get('/api/audit-logs/timeline/');
  }

  /**
   * Get single audit log
   */
  async getAuditLog(id: number): Promise<AuditLog> {
    return api.get(`/api/audit-logs/${id}/`);
  }
}

export const auditLogService = new AuditLogService();
```

### Step 2: Update Activities Page Hook

**File:** `web-frontend/src/hooks/useAuditLogs.ts` (create new)

```typescript
import { useQuery } from '@tanstack/react-query';
import { auditLogService, type AuditLogFilters } from '@/services/auditLog.service';

export const useAuditLogs = (filters?: AuditLogFilters) => {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => auditLogService.getAuditLogs(filters),
    refetchInterval: 10000, // Refresh every 10 seconds
  });
};

export const useAuditLogStats = () => {
  return useQuery({
    queryKey: ['audit-logs', 'stats'],
    queryFn: () => auditLogService.getStats(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useRecentAuditLogs = () => {
  return useQuery({
    queryKey: ['audit-logs', 'recent'],
    queryFn: () => auditLogService.getRecent(),
    refetchInterval: 5000, // Refresh every 5 seconds
  });
};

export const useAuditLogTimeline = () => {
  return useQuery({
    queryKey: ['audit-logs', 'timeline'],
    queryFn: () => auditLogService.getTimeline(),
    refetchInterval: 10000,
  });
};
```

### Step 3: Update Activities Page Component

**File:** `web-frontend/src/pages/ActivitiesPage.tsx`

```typescript
import { useRecentAuditLogs, useAuditLogStats } from '@/hooks/useAuditLogs';

const ActivitiesPage = () => {
  // OLD (WRONG):
  // const { data: activities } = useQuery({
  //   queryKey: ['activities'],
  //   queryFn: () => api.get('/api/activities/')
  // });

  // NEW (CORRECT):
  const { data: auditLogs, isLoading } = useRecentAuditLogs();
  const { data: stats } = useAuditLogStats();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Activity Feed</h1>
      
      {/* Stats */}
      {stats && (
        <div className="stats">
          <div>Total: {stats.total_logs}</div>
          <div>Last 24h: {stats.recent_activity_24h}</div>
        </div>
      )}

      {/* Activity List */}
      {auditLogs?.map(log => (
        <ActivityCard
          key={log.id}
          user={log.user_email}
          profileType={log.user_profile_type}
          action={log.action_display}
          resource={log.resource_type_display}
          resourceName={log.resource_name}
          description={log.description}
          changes={log.changes}
          timestamp={log.created_at}
        />
      ))}
    </div>
  );
};
```

### Step 4: Create Activity Card Component

```typescript
interface ActivityCardProps {
  user: string;
  profileType: 'vendor' | 'employee' | 'customer';
  action: string;
  resource: string;
  resourceName: string;
  description: string;
  changes?: Record<string, { old: any; new: any }>;
  timestamp: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  user,
  profileType,
  action,
  resource,
  resourceName,
  description,
  changes,
  timestamp
}) => {
  const getIcon = () => {
    switch (action.toLowerCase()) {
      case 'created': return <PlusIcon />;
      case 'updated': return <EditIcon />;
      case 'deleted': return <TrashIcon />;
      case 'moved': return <ArrowIcon />;
      default: return <ActivityIcon />;
    }
  };

  const getColor = () => {
    switch (profileType) {
      case 'vendor': return 'blue';
      case 'employee': return 'green';
      case 'customer': return 'purple';
      default: return 'gray';
    }
  };

  return (
    <div className="activity-card">
      <div className="icon">{getIcon()}</div>
      <div className="content">
        <div className="header">
          <Badge color={getColor()}>{profileType}</Badge>
          <span className="user">{user}</span>
          <span className="action">{action}</span>
          <span className="resource">{resource}</span>
          <strong>{resourceName}</strong>
        </div>
        <div className="description">{description}</div>
        {changes && Object.keys(changes).length > 0 && (
          <div className="changes">
            <details>
              <summary>View Changes</summary>
              {Object.entries(changes).map(([field, change]) => (
                <div key={field}>
                  <strong>{field}:</strong> {change.old} → {change.new}
                </div>
              ))}
            </details>
          </div>
        )}
        <div className="timestamp">{formatRelativeTime(timestamp)}</div>
      </div>
    </div>
  );
};
```

---

## ✅ Quick Fix Checklist

- [ ] Create `auditLog.service.ts`
- [ ] Create `useAuditLogs.ts` hook
- [ ] Update `ActivitiesPage.tsx` to use `/api/audit-logs/`
- [ ] Create `ActivityCard` component
- [ ] Remove references to old `/api/activities/` endpoint
- [ ] Test with real customer creation

---

## 🧪 Testing

After implementing:

1. **Create a customer** via web UI
2. **Check Activities page** - should see:
   ```
   [Vendor Badge] sahel@gmail.com Created Customer: John Doe
   Just now
   ```

3. **Update the customer** - should see:
   ```
   [Vendor Badge] sahel@gmail.com Updated Customer: John Doe
   → View Changes: name: "John" → "John Doe", phone: "123" → "456"
   2 minutes ago
   ```

4. **Delete the customer** - should see:
   ```
   [Vendor Badge] sahel@gmail.com Deleted Customer: John Doe
   5 minutes ago
   ```

---

## 📊 Expected Output

Your Activities page will show:
- ✅ All customer CRUD operations
- ✅ All lead CRUD operations
- ✅ All deal CRUD operations and stage moves
- ✅ All employee actions (if permitted)
- ✅ All customer actions (issue creation, profile updates)
- ✅ Field-level changes for updates
- ✅ Real-time updates (auto-refresh every 5-10 seconds)

---

## 🎨 UI Suggestions

### Activity Icons
- Create: `+` or `PlusCircle`
- Update: `✏️` or `Edit`
- Delete: `🗑️` or `Trash`
- Moved: `→` or `ArrowRight`
- Converted: `🔄` or `RefreshCw`

### Profile Type Badges
- Vendor: Blue
- Employee: Green
- Customer: Purple

### Timeline Grouping
```
Today
  ├─ 2:30 PM - sahel@gmail.com created customer: John Doe
  └─ 1:15 PM - sahel@gmail.com updated deal: Big Deal

Yesterday
  ├─ 5:45 PM - employee@co.com created issue: Bug #123
  └─ 2:00 PM - sahel@gmail.com deleted lead: Old Lead

December 1, 2025
  └─ 10:00 AM - sahel@gmail.com converted lead: Prospect
```

---

## ✅ Summary

**Problem:** Frontend calls `/api/activities/` (wrong endpoint)
**Solution:** Update to call `/api/audit-logs/` (correct endpoint)
**Result:** All organizational actions will appear in Activities page!

