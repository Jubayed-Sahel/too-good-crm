# Runtime Permissions for Video Calling - Implementation Guide

## Overview

This guide shows how to request camera and microphone permissions at runtime before initiating video calls.

## Files Created

- `PermissionHandler.kt` - Permission handling utilities and composables

## Usage Examples

### Method 1: Using VideoCallPermissionHandler (Recommended)

The easiest way - wraps your call button and handles everything automatically:

```kotlin
import too.good.crm.ui.video.VideoCallPermissionHandler
import too.good.crm.ui.video.VideoCallHelper
import too.good.crm.data.models.CallType

@Composable
fun EmployeeListItem(employee: Employee) {
    val coroutineScope = rememberCoroutineScope()
    val context = LocalContext.current
    
    VideoCallPermissionHandler(
        onPermissionsGranted = {
            // Permissions granted - initiate call
            coroutineScope.launch {
                val result = VideoCallHelper.initiateCall(
                    recipientId = employee.userId,
                    callType = CallType.VIDEO
                )
                
                if (result is Resource.Error) {
                    Toast.makeText(context, result.message, Toast.LENGTH_SHORT).show()
                }
            }
        },
        onPermissionsDenied = {
            // Permissions denied
            Toast.makeText(
                context,
                "Camera and microphone permissions are required for video calls",
                Toast.LENGTH_LONG
            ).show()
        }
    ) { requestPermissions ->
        // Your button/UI element
        IconButton(onClick = { requestPermissions() }) {
            Icon(Icons.Default.Videocam, "Video Call")
        }
    }
}
```

### Method 2: Using rememberVideoCallPermissionRequest

For more control, get a callback to request permissions:

```kotlin
import too.good.crm.ui.video.rememberVideoCallPermissionRequest

@Composable
fun CustomerDetailScreen(customer: Customer) {
    val coroutineScope = rememberCoroutineScope()
    val context = LocalContext.current
    var isInitiatingCall by remember { mutableStateOf(false) }
    
    val requestVideoCallPermissions = rememberVideoCallPermissionRequest(
        onPermissionsGranted = {
            // Permissions granted - start the call
            isInitiatingCall = true
            coroutineScope.launch {
                val result = VideoCallHelper.initiateCall(
                    recipientId = customer.userId,
                    callType = CallType.VIDEO
                )
                isInitiatingCall = false
                
                if (result is Resource.Error) {
                    Toast.makeText(context, result.message, Toast.LENGTH_SHORT).show()
                }
            }
        },
        onPermissionsDenied = {
            Toast.makeText(
                context,
                "Permissions required for video calls",
                Toast.LENGTH_SHORT
            ).show()
        }
    )
    
    // Your UI
    Button(
        onClick = { requestVideoCallPermissions() },
        enabled = !isInitiatingCall
    ) {
        if (isInitiatingCall) {
            CircularProgressIndicator(modifier = Modifier.size(20.dp))
        } else {
            Icon(Icons.Default.Videocam, null)
            Spacer(Modifier.width(8.dp))
            Text("Video Call")
        }
    }
}
```

### Method 3: Manual Permission Check

Check permissions manually before initiating call:

```kotlin
import too.good.crm.ui.video.hasVideoCallPermissions
import too.good.crm.ui.video.VIDEO_CALL_PERMISSIONS
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts

@Composable
fun ManualPermissionExample(userId: Int) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    
    val permissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        if (permissions.values.all { it }) {
            // All permissions granted
            coroutineScope.launch {
                VideoCallHelper.initiateCall(userId, CallType.VIDEO)
            }
        } else {
            // Permissions denied
            Toast.makeText(
                context,
                "Camera and microphone access required",
                Toast.LENGTH_SHORT
            ).show()
        }
    }
    
    IconButton(
        onClick = {
            if (context.hasVideoCallPermissions()) {
                // Already have permissions
                coroutineScope.launch {
                    VideoCallHelper.initiateCall(userId, CallType.VIDEO)
                }
            } else {
                // Request permissions
                permissionLauncher.launch(VIDEO_CALL_PERMISSIONS)
            }
        }
    ) {
        Icon(Icons.Default.Videocam, "Video Call")
    }
}
```

## Complete Example: Employee List with Permissions

```kotlin
package too.good.crm.features.team

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch
import too.good.crm.data.Resource
import too.good.crm.data.models.CallType
import too.good.crm.data.models.Employee
import too.good.crm.ui.video.VideoCallHelper
import too.good.crm.ui.video.VideoCallPermissionHandler
import android.widget.Toast

@Composable
fun TeamScreenWithVideoCalls(
    employees: List<Employee>,
    onNavigateBack: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Team") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, "Back")
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            contentPadding = PaddingValues(16.dp)
        ) {
            items(employees) { employee ->
                EmployeeCardWithCallButtons(employee = employee)
            }
        }
    }
}

@Composable
fun EmployeeCardWithCallButtons(employee: Employee) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    var isInitiatingCall by remember { mutableStateOf(false) }
    
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Employee info
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = employee.fullName,
                    style = MaterialTheme.typography.titleMedium
                )
                Text(
                    text = employee.email,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                if (employee.role.isNotEmpty()) {
                    Text(
                        text = employee.role,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }
            
            // Call buttons with permission handling
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                // Video call button
                VideoCallPermissionHandler(
                    onPermissionsGranted = {
                        isInitiatingCall = true
                        coroutineScope.launch {
                            val result = VideoCallHelper.initiateCall(
                                recipientId = employee.userId,
                                callType = CallType.VIDEO
                            )
                            isInitiatingCall = false
                            
                            if (result is Resource.Error) {
                                Toast.makeText(
                                    context,
                                    result.message ?: "Failed to start call",
                                    Toast.LENGTH_SHORT
                                ).show()
                            }
                        }
                    },
                    onPermissionsDenied = {
                        Toast.makeText(
                            context,
                            "Camera and microphone permissions required",
                            Toast.LENGTH_LONG
                        ).show()
                    }
                ) { requestPermissions ->
                    IconButton(
                        onClick = { requestPermissions() },
                        enabled = !isInitiatingCall
                    ) {
                        if (isInitiatingCall) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(24.dp),
                                strokeWidth = 2.dp
                            )
                        } else {
                            Icon(
                                imageVector = Icons.Default.Videocam,
                                contentDescription = "Video Call",
                                tint = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }
                
                // Audio call button
                VideoCallPermissionHandler(
                    onPermissionsGranted = {
                        coroutineScope.launch {
                            val result = VideoCallHelper.initiateCall(
                                recipientId = employee.userId,
                                callType = CallType.AUDIO
                            )
                            
                            if (result is Resource.Error) {
                                Toast.makeText(
                                    context,
                                    result.message ?: "Failed to start call",
                                    Toast.LENGTH_SHORT
                                ).show()
                            }
                        }
                    },
                    onPermissionsDenied = {
                        Toast.makeText(
                            context,
                            "Microphone permission required",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                ) { requestPermissions ->
                    IconButton(onClick = { requestPermissions() }) {
                        Icon(
                            imageVector = Icons.Default.Phone,
                            contentDescription = "Audio Call",
                            tint = MaterialTheme.colorScheme.secondary
                        )
                    }
                }
            }
        }
    }
}
```

## Features

### ✅ Automatic Permission Checking
- Checks if permissions already granted before requesting
- Only requests if needed

### ✅ Permission Rationale Dialog
- Shows explanation dialog if permissions denied
- Provides "Open Settings" button to manually grant

### ✅ Reusable Composables
- `VideoCallPermissionHandler` - Wrapper component
- `rememberVideoCallPermissionRequest` - Callback-based
- `hasVideoCallPermissions()` - Direct check function

### ✅ User-Friendly
- Clear permission explanations
- Easy access to app settings
- Material 3 design

## Required Permissions

Already added to `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

## Testing

1. **First Launch**: Click video call button → Permission dialog appears
2. **Grant Permissions**: Click "Allow" → Call initiates immediately
3. **Deny Permissions**: Click "Deny" → Rationale dialog appears with "Open Settings"
4. **Already Granted**: Click call button → Call starts immediately (no dialog)

## Best Practices

1. **Request Just-In-Time**: Request permissions when user tries to make a call, not on app launch
2. **Show Rationale**: Explain why permissions are needed
3. **Provide Settings Access**: Let users manually grant if denied
4. **Check Before Every Call**: Always verify permissions before initiating

## Import Statements

```kotlin
import too.good.crm.ui.video.VideoCallPermissionHandler
import too.good.crm.ui.video.rememberVideoCallPermissionRequest
import too.good.crm.ui.video.hasVideoCallPermissions
import too.good.crm.ui.video.VIDEO_CALL_PERMISSIONS
```

## Summary

The `VideoCallPermissionHandler` composable makes it easy to add permission handling to any call button. Just wrap your button and provide callbacks for granted/denied states. The system handles everything else including rationale dialogs and settings navigation.
