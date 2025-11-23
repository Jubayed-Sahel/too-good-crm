package too.good.crm.ui.video

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext
import androidx.core.content.ContextCompat

/**
 * Required permissions for video calling
 */
val VIDEO_CALL_PERMISSIONS = arrayOf(
    Manifest.permission.CAMERA,
    Manifest.permission.RECORD_AUDIO
)

/**
 * Check if all video call permissions are granted
 */
fun Context.hasVideoCallPermissions(): Boolean {
    return VIDEO_CALL_PERMISSIONS.all { permission ->
        ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED
    }
}

/**
 * Video Call Permission Handler
 * Use this composable to request camera and microphone permissions before initiating a call
 * 
 * Usage:
 * ```kotlin
 * VideoCallPermissionHandler(
 *     onPermissionsGranted = {
 *         // Initiate video call
 *         VideoCallHelper.initiateCall(userId, CallType.VIDEO)
 *     },
 *     onPermissionsDenied = {
 *         Toast.makeText(context, "Permissions required", Toast.LENGTH_SHORT).show()
 *     }
 * ) { requestPermissions ->
 *     Button(onClick = { requestPermissions() }) {
 *         Text("Video Call")
 *     }
 * }
 * ```
 */
@Composable
fun VideoCallPermissionHandler(
    onPermissionsGranted: () -> Unit,
    onPermissionsDenied: () -> Unit = {},
    content: @Composable (requestPermissions: () -> Unit) -> Unit
) {
    val context = LocalContext.current
    var showRationale by remember { mutableStateOf(false) }
    
    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val allGranted = permissions.values.all { it }
        
        if (allGranted) {
            onPermissionsGranted()
        } else {
            showRationale = true
            onPermissionsDenied()
        }
    }
    
    val requestPermissions = {
        if (context.hasVideoCallPermissions()) {
            onPermissionsGranted()
        } else {
            permissionLauncher.launch(VIDEO_CALL_PERMISSIONS)
        }
    }
    
    content(requestPermissions)
    
    // Show rationale dialog if permissions denied
    if (showRationale) {
        PermissionRationaleDialog(
            onDismiss = { showRationale = false },
            onOpenSettings = {
                showRationale = false
                context.openAppSettings()
            }
        )
    }
}

/**
 * Permission Rationale Dialog
 * Shows when permissions are denied
 */
@Composable
private fun PermissionRationaleDialog(
    onDismiss: () -> Unit,
    onOpenSettings: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Permissions Required") },
        text = {
            Text(
                "Camera and microphone permissions are required for video calls. " +
                "Please grant these permissions in the app settings."
            )
        },
        confirmButton = {
            TextButton(onClick = onOpenSettings) {
                Text("Open Settings")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

/**
 * Open app settings to manually grant permissions
 */
private fun Context.openAppSettings() {
    val intent = android.content.Intent(
        android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
        android.net.Uri.fromParts("package", packageName, null)
    )
    startActivity(intent)
}

/**
 * Simple permission request for immediate use
 * Returns a callback to request permissions
 */
@Composable
fun rememberVideoCallPermissionRequest(
    onPermissionsGranted: () -> Unit,
    onPermissionsDenied: () -> Unit = {}
): () -> Unit {
    val context = LocalContext.current
    
    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        if (permissions.values.all { it }) {
            onPermissionsGranted()
        } else {
            onPermissionsDenied()
        }
    }
    
    return remember {
        {
            if (context.hasVideoCallPermissions()) {
                onPermissionsGranted()
            } else {
                permissionLauncher.launch(VIDEO_CALL_PERMISSIONS)
            }
        }
    }
}
