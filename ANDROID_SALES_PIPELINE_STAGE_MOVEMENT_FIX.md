# Android Sales Pipeline Stage Movement Fix

## Issue
The button to move leads to the next stage in the Android app was not working. When users clicked the arrow button on a lead card to move it to the next pipeline stage, nothing happened.

## Root Cause Analysis

### The Problem
1. **Android Implementation**: The app was checking if `nextStage.id` was not null before making the API call
2. **Missing Stage IDs**: The `StageConfig` objects could have `null` IDs in certain scenarios:
   - When backend stages fail to load
   - When default stages are used as fallback
   - During initial app startup before backend data is fully loaded
3. **Null Check Blocking API Calls**: The line `nextStage?.id?.let { stageId -> ... }` prevented the API call from being made when the stage ID was null

### Backend Support
The backend `/api/leads/{id}/move_stage/` endpoint accepts multiple ways to identify a stage:
- `stage_id`: Direct stage ID (preferred)
- `stage_key`: Stage key like "lead", "qualified", "proposal", etc.
- `stage_name`: Stage name like "Lead", "Qualified", "Proposal", etc.

When `stage_id` is 0 or missing, the backend intelligently finds or creates the appropriate stage using `stage_key` or `stage_name`.

### Website Implementation
The web frontend successfully moves leads by sending both `stage_id` AND `stage_key`, allowing the backend to find the stage even if the ID doesn't match exactly.

## Solution

### Changes Made

#### 1. LeadRepository.kt
**File**: `app-frontend/app/src/main/java/too/good/crm/data/repository/LeadRepository.kt`

Updated `moveLeadStage()` method to:
- Accept nullable `stageId: Int?` instead of required `Int`
- Accept optional `stageKey: String?` parameter
- Send `stage_id: 0` to backend when ID is null (backend handles this)
- Always include `stage_key` in the request body

```kotlin
suspend fun moveLeadStage(
    id: Int,
    stageId: Int?,              // Now nullable
    stageKey: String? = null,    // New parameter
    notes: String? = null
): NetworkResult<Lead> = safeApiCall {
    val body = mutableMapOf<String, Any>()
    if (stageId != null && stageId > 0) {
        body["stage_id"] = stageId
    } else {
        body["stage_id"] = 0 // Backend will find/create by key/name
    }
    stageKey?.let { body["stage_key"] = it }
    notes?.let { body["notes"] = it }
    apiService.moveLeadStage(id, body)
}
```

#### 2. SalesPipelineViewModel.kt
**File**: `app-frontend/app/src/main/java/too/good/crm/features/sales/SalesPipelineViewModel.kt`

Updated `moveLeadToStage()` method to:
- Accept nullable `stageId: Int?` instead of required `Int`
- Pass `stageKey` to the repository method

```kotlin
fun moveLeadToStage(
    leadId: Int,
    stageId: Int?,           // Now nullable
    stageKey: String,
    onSuccess: () -> Unit
) {
    // ...
    when (val moveResult = leadRepository.moveLeadStage(leadId, stageId, stageKey)) {
        // ...
    }
}
```

#### 3. SalesPipelineScreen.kt
**File**: `app-frontend/app/src/main/java/too/good/crm/features/sales/SalesPipelineScreen.kt`

Removed the null check on `stageId`:
- **Before**: Only called API if `nextStage?.id?.let { ... }`
- **After**: Always calls API if `nextStage?.let { ... }` (stage found by key)

```kotlin
onMoveLeadToNextStage = { lead, nextStageKey ->
    val nextStage = uiState.stages.find { it.key == nextStageKey }
    
    // Always call the API - backend can find stage by key even without ID
    nextStage?.let { stage ->
        viewModel.moveLeadToStage(
            leadId = lead.id,
            stageId = stage.id,      // Can be null now
            stageKey = stage.key,    // Backend uses this if ID is null
            onSuccess = { 
                // Handle success
            }
        )
    }
}
```

## Testing

### Manual Test Steps
1. Open the Android app
2. Navigate to Sales Pipeline screen
3. Find a lead in any stage
4. Click the arrow button (→) on the lead card
5. **Expected**: Lead moves to the next stage immediately
6. Verify the lead appears in the next stage column
7. Test moving leads through all stages:
   - Lead → Qualified
   - Qualified → Proposal
   - Proposal → Negotiation
   - Negotiation → Closed Won
8. When a lead reaches "Closed Won", verify it's converted to a customer

### Edge Cases to Test
- Moving leads when backend stages haven't loaded yet
- Moving leads when using default stage configurations
- Moving leads when network is slow
- Multiple rapid button clicks (should not duplicate moves)

## Technical Details

### Backend API Contract
**Endpoint**: `POST /api/leads/{id}/move_stage/`

**Request Body**:
```json
{
  "stage_id": 0,           // 0 or null means "find by key/name"
  "stage_key": "qualified", // Used when stage_id is 0
  "notes": "Optional notes"
}
```

**Backend Logic**:
1. If `stage_id` is valid and > 0, use it directly
2. If `stage_id` is 0 or missing:
   - Try to find stage by `stage_key` (e.g., "qualified")
   - Or try to find stage by `stage_name` (e.g., "Qualified")
   - If pipeline doesn't exist, create default pipeline with all stages
3. Move lead to the found/created stage
4. Create stage history entry
5. If moved to "Closed Won", auto-convert lead to customer

### Why This Fix Works
1. **Graceful Degradation**: App works even when stage IDs aren't available
2. **Backend Flexibility**: Backend accepts multiple identifiers (ID, key, name)
3. **Stage Key Always Available**: `StageConfig.key` is never null (it's a required field)
4. **Consistent with Web**: Matches the web frontend's approach of sending both ID and key

## Benefits
✅ Leads can now be moved between stages using the arrow button
✅ Works even when backend stage IDs aren't loaded
✅ More resilient to network issues and data loading states
✅ Consistent with web frontend behavior
✅ Automatic customer conversion when reaching "Closed Won" still works

## Related Files
- `LeadRepository.kt` - Data layer
- `SalesPipelineViewModel.kt` - Business logic
- `SalesPipelineScreen.kt` - UI layer
- Backend: `shared-backend/crmApp/viewsets/lead.py` - API endpoint

## Date
December 3, 2025
