package too.good.crm.ui.video

import android.content.Context
import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import org.jitsi.meet.sdk.JitsiMeetActivity
import org.jitsi.meet.sdk.JitsiMeetConferenceOptions
import too.good.crm.data.models.CallStatus
import too.good.crm.data.models.VideoCallSession
import java.net.URL

/**
 * Video Call Window
 * Displays the video call interface with Jitsi Meet integration
 * 
 * Shows:
 * - Incoming call UI with Answer/Decline buttons (status=pending)
 * - Outgoing call UI with Cancel button (status=pending, user is initiator)
 * - Active video call with Jitsi Meet SDK (status=active)
 */
@Composable
fun VideoCallWindow(
    callSession: VideoCallSession,
    currentUserId: Int,
    onAnswer: (Int) -> Unit,
    onReject: (Int) -> Unit,
    onEnd: (Int) -> Unit
) {
    val context = LocalContext.current
    val isPending = callSession.status == CallStatus.PENDING
    val isActive = callSession.status == CallStatus.ACTIVE
    val isInitiator = currentUserId == callSession.initiator
    
    // Get the other party's name
    val otherPartyName = if (isInitiator) {
        callSession.recipientName ?: "User"
    } else {
        callSession.initiatorName
    }
    
    Log.d("VideoCallWindow", "=== VideoCallWindow RENDERING ===")
    Log.d("VideoCallWindow", "Call ID: ${callSession.id}")
    Log.d("VideoCallWindow", "Status: ${callSession.status}")
    Log.d("VideoCallWindow", "isPending: $isPending, isActive: $isActive")
    Log.d("VideoCallWindow", "isInitiator: $isInitiator, currentUserId: $currentUserId")
    Log.d("VideoCallWindow", "Initiator: ${callSession.initiator}, Recipient: ${callSession.recipient}")
    Log.d("VideoCallWindow", "Other party: $otherPartyName")
    
    // Extract JWT token and room info
    val jwtToken = callSession.jitsiUrl.jwtToken
    val roomName = callSession.jitsiUrl.roomName ?: callSession.roomName
    val serverDomain = callSession.jitsiUrl.serverDomain ?: callSession.jitsiServer
    val hasJwtError = callSession.jitsiUrl.error != null
    
    Dialog(
        onDismissRequest = { /* Prevent dismissing by tapping outside */ },
        properties = DialogProperties(
            dismissOnBackPress = false,
            dismissOnClickOutside = false,
            usePlatformDefaultWidth = false
        )
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.9f))
        ) {
            when {
                // Pending Call - Show incoming/outgoing UI
                isPending -> {
                    Log.d("VideoCallWindow", "Showing IncomingCallUI - isInitiator: $isInitiator, otherParty: $otherPartyName")
                    IncomingCallUI(
                        callSession = callSession,
                        otherPartyName = otherPartyName,
                        isInitiator = isInitiator,
                        onAnswer = { onAnswer(callSession.id) },
                        onReject = { onReject(callSession.id) }
                    )
                }
                
                // Active Call - Show Jitsi Meet video
                // For public server (meet.jit.si), jwtToken will be null - that's expected!
                isActive && !hasJwtError -> {
                    Log.d("VideoCallWindow", "✅ Showing JitsiMeetCallUI - token: ${if (jwtToken != null) "present" else "none (public server)"}, room: $roomName")
                    JitsiMeetCallUI(
                        context = context,
                        jwtToken = jwtToken,
                        roomName = roomName,
                        serverDomain = serverDomain,
                        callSession = callSession,
                        onEnd = { onEnd(callSession.id) }
                    )
                }
                
                // Error state
                else -> {
                    Log.e("VideoCallWindow", "❌ Showing ErrorCallUI - jwtToken: $jwtToken, hasJwtError: $hasJwtError, error: ${callSession.jitsiUrl.error}")
                    ErrorCallUI(
                        errorMessage = callSession.jitsiUrl.error ?: "Failed to initialize call",
                        onDismiss = { onEnd(callSession.id) }
                    )
                }
            }
        }
    }
}

/**
 * Incoming/Outgoing Call UI
 */
@Composable
private fun IncomingCallUI(
    callSession: VideoCallSession,
    otherPartyName: String,
    isInitiator: Boolean,
    onAnswer: () -> Unit,
    onReject: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = androidx.compose.ui.graphics.Brush.linearGradient(
                    colors = listOf(
                        Color(0xFFF3E8FF), // purple.50
                        Color(0xFFDBEAFE)  // blue.50
                    )
                )
            )
            .padding(32.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            // Avatar with gradient
            Box(
                modifier = Modifier
                    .size(100.dp)
                    .clip(CircleShape)
                    .background(
                        brush = androidx.compose.ui.graphics.Brush.linearGradient(
                            colors = listOf(
                                Color(0xFF667EEA), // #667eea
                                Color(0xFF764BA2)  // #764ba2
                            ),
                            start = androidx.compose.ui.geometry.Offset(0f, 0f),
                            end = androidx.compose.ui.geometry.Offset(100f, 100f)
                        )
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Person,
                    contentDescription = null,
                    modifier = Modifier.size(40.dp),
                    tint = Color.White
                )
            }
            
            // Name and badge
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = otherPartyName,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF1F2937) // gray.800
                )
                
                // Status badge
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = if (isInitiator) Color(0xFFFF9800) else Color(0xFF9333EA), // orange/purple
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = if (isInitiator) "Calling..." else "Incoming Call",
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                        color = Color.White,
                        fontSize = 14.sp
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Action buttons
            if (isInitiator) {
                // Cancel button for initiator
                Button(
                    onClick = onReject,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFFEF4444) // red.500
                    )
                ) {
                    Icon(
                        imageVector = Icons.Default.CallEnd,
                        contentDescription = null,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Cancel Call",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            } else {
                // Answer and Decline buttons for recipient
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Answer button
                    Button(
                        onClick = onAnswer,
                        modifier = Modifier
                            .weight(1f)
                            .height(56.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF22C55E) // green gradient start
                        )
                    ) {
                        Icon(
                            imageVector = Icons.Default.Call,
                            contentDescription = null,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Answer",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    
                    // Decline button
                    Button(
                        onClick = onReject,
                        modifier = Modifier
                            .weight(1f)
                            .height(56.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFFEF4444) // red.500
                        )
                    ) {
                        Icon(
                            imageVector = Icons.Default.CallEnd,
                            contentDescription = null,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Decline",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}

/**
 * Active Call UI with Jitsi Meet
 * Note: JitsiMeetActivity launches in its own Activity, so this composable
 * just triggers the launch and shows a minimal UI.
 */
@Composable
private fun JitsiMeetCallUI(
    context: Context,
    jwtToken: String?,  // Nullable - null for public server (meet.jit.si)
    roomName: String,
    serverDomain: String,
    callSession: VideoCallSession,
    onEnd: () -> Unit
) {
    var jitsiLaunched by remember { mutableStateOf(false) }
    
    LaunchedEffect(Unit) {
        if (!jitsiLaunched) {
            Log.d("VideoCallWindow", "Starting Jitsi Meet call")
            Log.d("VideoCallWindow", "Room: $roomName")
            Log.d("VideoCallWindow", "Server: $serverDomain")
            
            try {
                // Launch Jitsi Meet activity with JWT token (if provided)
                Log.d("VideoCallWindow", "Building Jitsi options with audio/video enabled")
                Log.d("VideoCallWindow", "JWT Token: ${if (jwtToken.isNullOrEmpty()) "NOT PROVIDED (public server)" else "PROVIDED"}")
                
                val optionsBuilder = JitsiMeetConferenceOptions.Builder()
                    .setServerURL(URL("https://$serverDomain"))
                    .setRoom(roomName)
                    .setAudioOnly(callSession.callType == too.good.crm.data.models.CallType.AUDIO)
                    .setAudioMuted(false)  // Start with audio UNMUTED
                    .setVideoMuted(callSession.callType == too.good.crm.data.models.CallType.AUDIO)
                    // Feature flags for better call experience
                    .setFeatureFlag("welcomepage.enabled", false)
                    .setFeatureFlag("prejoinpage.enabled", false)
                    .setFeatureFlag("pip.enabled", true)  // Picture-in-picture
                    .setFeatureFlag("recording.enabled", true)
                    .setFeatureFlag("live-streaming.enabled", false)
                    .setFeatureFlag("meeting-name.enabled", false)
                    .setFeatureFlag("calendar.enabled", false)
                    .setFeatureFlag("call-integration.enabled", true)
                    // Audio settings
                    .setFeatureFlag("audio-mute.enabled", true)
                    .setFeatureFlag("video-mute.enabled", true)
                    .setFeatureFlag("speakerphone.enabled", true)
                
                // Only set JWT token if provided (8x8 server needs it, public server doesn't)
                if (!jwtToken.isNullOrEmpty()) {
                    optionsBuilder.setToken(jwtToken)
                    Log.d("VideoCallWindow", "Using authenticated server with JWT token")
                } else {
                    Log.d("VideoCallWindow", "Using public Jitsi server (no JWT token)")
                }
                
                val options = optionsBuilder.build()
                
                Log.d("VideoCallWindow", "Jitsi options: audioOnly=${callSession.callType == too.good.crm.data.models.CallType.AUDIO}, audioMuted=false")
                JitsiMeetActivity.launch(context, options)
                jitsiLaunched = true
                Log.d("VideoCallWindow", "✅ Jitsi Meet launched successfully")
            } catch (e: Exception) {
                Log.e("VideoCallWindow", "❌ Failed to start Jitsi Meet", e)
                android.widget.Toast.makeText(context, "Failed to start video call: ${e.message}", android.widget.Toast.LENGTH_LONG).show()
                onEnd()
            }
        }
    }
    
    // Show a simple "In Call" message since JitsiMeetActivity is in a separate Activity
    // The user will see the Jitsi UI in the other activity
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Icon(
                imageVector = Icons.Default.VideoCall,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = Color.White
            )
            Text(
                text = "Call in Progress",
                color = Color.White,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Switch to the Jitsi window",
                color = Color.White.copy(alpha = 0.7f),
                fontSize = 14.sp
            )
        }
    }
    
    DisposableEffect(Unit) {
        onDispose {
            Log.d("VideoCallWindow", "JitsiMeetCallUI disposed")
            // Note: JitsiMeetActivity handles its own lifecycle
            // We don't need to manually dispose the view here
            Log.d("VideoCallWindow", "Jitsi view cleanup")
        }
    }
}

/**
 * Error Call UI
 */
@Composable
private fun ErrorCallUI(
    errorMessage: String,
    onDismiss: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = Icons.Default.Error,
            contentDescription = null,
            modifier = Modifier.size(80.dp),
            tint = Color.Red
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Text(
            text = "Call Failed",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = errorMessage,
            fontSize = 16.sp,
            color = Color.White.copy(alpha = 0.7f)
        )
        
        Spacer(modifier = Modifier.height(32.dp))
        
        Button(
            onClick = onDismiss,
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.primary
            )
        ) {
            Text("Close")
        }
    }
}
