# Mobile Video Calling - Quick Integration Guide

## How to Add Call Buttons to Your Screens

This guide shows you how to add video/audio call buttons to existing screens in the mobile app.

## Example 1: Employee List Screen

Add call buttons to each employee in the team list:

```kotlin
@Composable
fun EmployeeListItem(
    employee: Employee,
    onEmployeeClick: (Employee) -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    val context = LocalContext.current
    
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp)
            .clickable { onEmployeeClick(employee) }
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
                    text = employee.name,
                    style = MaterialTheme.typography.titleMedium
                )
                Text(
                    text = employee.email,
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray
                )
            }
            
            // Call buttons
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                // Video call button
                IconButton(
                    onClick = {
                        coroutineScope.launch {
                            val result = VideoCallHelper.initiateCall(
                                recipientId = employee.userId,
                                callType = CallType.VIDEO
                            )
                            
                            when (result) {
                                is Resource.Success -> {
                                    // Call initiated - VideoCallManager will show UI
                                }
                                is Resource.Error -> {
                                    Toast.makeText(
                                        context,
                                        result.message ?: "Failed to start call",
                                        Toast.LENGTH_SHORT
                                    ).show()
                                }
                                else -> {}
                            }
                        }
                    }
                ) {
                    Icon(
                        imageVector = Icons.Default.Videocam,
                        contentDescription = "Video Call",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
                
                // Audio call button
                IconButton(
                    onClick = {
                        coroutineScope.launch {
                            val result = VideoCallHelper.initiateCall(
                                recipientId = employee.userId,
                                callType = CallType.AUDIO
                            )
                            
                            when (result) {
                                is Resource.Success -> {
                                    // Call initiated
                                }
                                is Resource.Error -> {
                                    Toast.makeText(
                                        context,
                                        result.message ?: "Failed to start call",
                                        Toast.LENGTH_SHORT
                                    ).show()
                                }
                                else -> {}
                            }
                        }
                    }
                ) {
                    Icon(
                        imageVector = Icons.Default.Phone,
                        contentDescription = "Audio Call",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
            }
        }
    }
}
```

## Example 2: Customer Detail Screen

Add call button to customer detail header:

```kotlin
@Composable
fun CustomerDetailHeader(
    customer: Customer,
    onBack: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    val context = LocalContext.current
    
    TopAppBar(
        title = { Text(customer.name) },
        navigationIcon = {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, "Back")
            }
        },
        actions = {
            // Video call action
            IconButton(
                onClick = {
                    coroutineScope.launch {
                        // Assuming customer has userId field
                        val result = VideoCallHelper.initiateCall(
                            recipientId = customer.userId,
                            callType = CallType.VIDEO
                        )
                        
                        if (result is Resource.Error) {
                            Toast.makeText(
                                context,
                                result.message ?: "Failed to start call",
                                Toast.LENGTH_SHORT
                            ).show()
                        }
                    }
                }
            ) {
                Icon(
                    imageVector = Icons.Default.Videocam,
                    contentDescription = "Video Call",
                    tint = Color.White
                )
            }
            
            // Phone call action
            IconButton(
                onClick = {
                    coroutineScope.launch {
                        val result = VideoCallHelper.initiateCall(
                            recipientId = customer.userId,
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
                }
            ) {
                Icon(
                    imageVector = Icons.Default.Phone,
                    contentDescription = "Audio Call",
                    tint = Color.White
                )
            }
        }
    )
}
```

## Example 3: Floating Action Button

Add a FAB to initiate calls from any screen:

```kotlin
@Composable
fun ScreenWithCallFAB(
    recipientUserId: Int,
    recipientName: String
) {
    val coroutineScope = rememberCoroutineScope()
    val context = LocalContext.current
    var showCallMenu by remember { mutableStateOf(false) }
    
    Scaffold(
        floatingActionButton = {
            Column(
                horizontalAlignment = Alignment.End,
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Show menu items when expanded
                if (showCallMenu) {
                    // Video call FAB
                    SmallFloatingActionButton(
                        onClick = {
                            showCallMenu = false
                            coroutineScope.launch {
                                VideoCallHelper.initiateCall(
                                    recipientId = recipientUserId,
                                    callType = CallType.VIDEO
                                )
                            }
                        },
                        containerColor = MaterialTheme.colorScheme.primary
                    ) {
                        Icon(Icons.Default.Videocam, "Video Call")
                    }
                    
                    // Audio call FAB
                    SmallFloatingActionButton(
                        onClick = {
                            showCallMenu = false
                            coroutineScope.launch {
                                VideoCallHelper.initiateCall(
                                    recipientId = recipientUserId,
                                    callType = CallType.AUDIO
                                )
                            }
                        },
                        containerColor = MaterialTheme.colorScheme.secondary
                    ) {
                        Icon(Icons.Default.Phone, "Audio Call")
                    }
                }
                
                // Main FAB
                FloatingActionButton(
                    onClick = { showCallMenu = !showCallMenu }
                ) {
                    Icon(
                        imageVector = if (showCallMenu) Icons.Default.Close else Icons.Default.Call,
                        contentDescription = "Call"
                    )
                }
            }
        }
    ) { padding ->
        // Your screen content
    }
}
```

## Example 4: Online Users List

Show online users with call buttons:

```kotlin
@Composable
fun OnlineUsersScreen() {
    val videoRepository = remember { VideoRepository() }
    var onlineUsers by remember { mutableStateOf<List<OnlineUser>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    val coroutineScope = rememberCoroutineScope()
    val context = LocalContext.current
    
    LaunchedEffect(Unit) {
        while (true) {
            val result = videoRepository.getOnlineUsers()
            if (result is Resource.Success) {
                onlineUsers = result.data
                isLoading = false
            }
            delay(10_000) // Refresh every 10 seconds
        }
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Online Users (${onlineUsers.size})",
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.padding(bottom = 16.dp)
        )
        
        if (isLoading) {
            CircularProgressIndicator()
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(onlineUsers) { user ->
                    OnlineUserItem(
                        user = user,
                        onVideoCall = {
                            coroutineScope.launch {
                                VideoCallHelper.initiateCall(
                                    recipientId = user.id,
                                    callType = CallType.VIDEO
                                )
                            }
                        },
                        onAudioCall = {
                            coroutineScope.launch {
                                VideoCallHelper.initiateCall(
                                    recipientId = user.id,
                                    callType = CallType.AUDIO
                                )
                            }
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun OnlineUserItem(
    user: OnlineUser,
    onVideoCall: () -> Unit,
    onAudioCall: () -> Unit
) {
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
            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Online indicator
                Box(
                    modifier = Modifier
                        .size(12.dp)
                        .clip(CircleShape)
                        .background(
                            if (user.availableForCalls) Color.Green else Color.Orange
                        )
                )
                
                Column {
                    Text(
                        text = user.fullName,
                        style = MaterialTheme.typography.titleMedium
                    )
                    Text(
                        text = if (user.availableForCalls) "Available" else "Busy",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.Gray
                    )
                }
            }
            
            // Call buttons
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                IconButton(
                    onClick = onVideoCall,
                    enabled = user.availableForCalls
                ) {
                    Icon(
                        imageVector = Icons.Default.Videocam,
                        contentDescription = "Video Call",
                        tint = if (user.availableForCalls) 
                            MaterialTheme.colorScheme.primary 
                        else 
                            Color.Gray
                    )
                }
                
                IconButton(
                    onClick = onAudioCall,
                    enabled = user.availableForCalls
                ) {
                    Icon(
                        imageVector = Icons.Default.Phone,
                        contentDescription = "Audio Call",
                        tint = if (user.availableForCalls) 
                            MaterialTheme.colorScheme.primary 
                        else 
                            Color.Gray
                    )
                }
            }
        }
    }
}
```

## Required Imports

Add these imports to your files:

```kotlin
import too.good.crm.ui.video.VideoCallHelper
import too.good.crm.data.models.CallType
import too.good.crm.data.Resource
import too.good.crm.data.repository.VideoRepository
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.platform.LocalContext
import android.widget.Toast
import kotlinx.coroutines.launch
```

## Best Practices

### 1. Error Handling

Always handle errors gracefully:

```kotlin
when (result) {
    is Resource.Success -> {
        // Call initiated successfully
        // VideoCallManager will automatically handle the UI
    }
    is Resource.Error -> {
        // Show user-friendly error message
        Toast.makeText(
            context,
            when {
                result.message?.contains("not available") == true -> 
                    "User is not available for calls"
                result.message?.contains("offline") == true -> 
                    "User is offline"
                else -> "Failed to start call. Please try again."
            },
            Toast.LENGTH_SHORT
        ).show()
    }
    else -> {}
}
```

### 2. Check User Availability

Before initiating a call, check if user is available:

```kotlin
val videoRepository = VideoRepository()

suspend fun checkAndCall(userId: Int) {
    val onlineUsersResult = videoRepository.getOnlineUsers()
    if (onlineUsersResult is Resource.Success) {
        val user = onlineUsersResult.data.find { it.id == userId }
        
        if (user == null || !user.availableForCalls) {
            Toast.makeText(context, "User is not available", Toast.LENGTH_SHORT).show()
            return
        }
    }
    
    // User is available, proceed with call
    VideoCallHelper.initiateCall(userId, CallType.VIDEO)
}
```

### 3. Loading States

Show loading indicator while initiating call:

```kotlin
var isInitiatingCall by remember { mutableStateOf(false) }

IconButton(
    onClick = {
        if (!isInitiatingCall) {
            isInitiatingCall = true
            coroutineScope.launch {
                val result = VideoCallHelper.initiateCall(userId, CallType.VIDEO)
                isInitiatingCall = false
                
                if (result is Resource.Error) {
                    Toast.makeText(context, result.message, Toast.LENGTH_SHORT).show()
                }
            }
        }
    },
    enabled = !isInitiatingCall
) {
    if (isInitiatingCall) {
        CircularProgressIndicator(modifier = Modifier.size(24.dp))
    } else {
        Icon(Icons.Default.Videocam, "Video Call")
    }
}
```

## Navigation

The VideoCallManager handles all call UI automatically. You don't need to navigate to a separate screen. The call window appears as a full-screen dialog on top of the current screen.

## Permissions

Request camera and microphone permissions before the first call:

```kotlin
val launcher = rememberLauncherForActivityResult(
    ActivityResultContracts.RequestMultiplePermissions()
) { permissions ->
    if (permissions[Manifest.permission.CAMERA] == true &&
        permissions[Manifest.permission.RECORD_AUDIO] == true) {
        // Permissions granted, initiate call
        coroutineScope.launch {
            VideoCallHelper.initiateCall(userId, CallType.VIDEO)
        }
    } else {
        Toast.makeText(context, "Permissions required for video calls", Toast.LENGTH_SHORT).show()
    }
}

IconButton(onClick = {
    launcher.launch(arrayOf(
        Manifest.permission.CAMERA,
        Manifest.permission.RECORD_AUDIO
    ))
}) {
    Icon(Icons.Default.Videocam, "Video Call")
}
```

## Summary

Adding video calling to any screen is simple:

1. Import `VideoCallHelper` and `CallType`
2. Use `rememberCoroutineScope()` for async calls
3. Call `VideoCallHelper.initiateCall(recipientId, callType)`
4. Handle errors with Toast messages
5. VideoCallManager handles all UI automatically

That's it! The call window will appear automatically, and users can answer/decline/end calls through the global VideoCallManager.
