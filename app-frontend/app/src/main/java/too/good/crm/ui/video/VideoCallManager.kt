package too.good.crm.ui.video

import android.util.Log
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import too.good.crm.data.Resource
import too.good.crm.data.models.VideoCallSession
import too.good.crm.data.repository.VideoRepository
import androidx.compose.runtime.State

/**
 * Global state holder for video calls
 * Singleton pattern to manage call state across the app
 */
object GlobalCallState {
    private val _currentCall = mutableStateOf<VideoCallSession?>(null)
    val currentCall: State<VideoCallSession?> = _currentCall
    
    fun setCall(call: VideoCallSession?) {
        Log.d("GlobalCallState", "Setting call: ${call?.id} status: ${call?.status} initiator: ${call?.initiator} recipient: ${call?.recipient}")
        _currentCall.value = call
        Log.d("GlobalCallState", "Call state updated. Current value: ${_currentCall.value?.id}")
    }
    
    fun clearCall() {
        Log.d("GlobalCallState", "Clearing call")
        _currentCall.value = null
    }
}

/**
 * Video Call Manager
 * Manages global video call state, heartbeat, and incoming call detection
 * 
 * This composable should be placed at the app level (in MainActivity)
 * to handle video calls across the entire app lifecycle.
 */
@Composable
fun VideoCallManager(
    isAuthenticated: Boolean,
    currentUserId: Int?,
    onShowToast: (String) -> Unit = {}
) {
    val videoRepository = remember { VideoRepository() }
    val coroutineScope = rememberCoroutineScope()
    
    // Observe global call state
    val currentCall by GlobalCallState.currentCall
    var lastCallId by remember { mutableStateOf<Int?>(null) }
    
    // Heartbeat - Send every 30 seconds
    LaunchedEffect(isAuthenticated) {
        if (isAuthenticated) {
            while (true) {
                try {
                    videoRepository.sendHeartbeat()
                    Log.d("VideoCallManager", "Heartbeat sent")
                } catch (e: Exception) {
                    Log.e("VideoCallManager", "Heartbeat error", e)
                }
                delay(30_000) // 30 seconds
            }
        }
    }
    
    // Poll for incoming calls - Check every 5 seconds
    LaunchedEffect(isAuthenticated) {
        if (isAuthenticated) {
            while (true) {
                try {
                    val result = videoRepository.getMyActiveCall()
                    if (result is Resource.Success) {
                        val call = result.data
                        
                        // Detect new incoming call
                        if (call != null && call.id != lastCallId) {
                            GlobalCallState.setCall(call)
                            lastCallId = call.id
                            
                            // Show notification for incoming calls
                            if (call.status == too.good.crm.data.models.CallStatus.PENDING 
                                && currentUserId != null 
                                && call.recipient == currentUserId) {
                                val callerName = call.initiatorName
                                onShowToast("Incoming call from $callerName")
                                Log.d("VideoCallManager", "Incoming call from $callerName")
                            }
                        } else if (call != null && call.id == lastCallId) {
                            // Update existing call status (but don't clear if call becomes null)
                            // The call should only be cleared by:
                            // 1. User ending it manually (Jitsi CONFERENCE_TERMINATED event)
                            // 2. WebSocket "call-ended" notification
                            GlobalCallState.setCall(call)
                        }
                        // Note: Removed automatic clear when call becomes null
                        // This prevents premature closing when other party ends the call
                    }
                } catch (e: Exception) {
                    Log.e("VideoCallManager", "Error checking for calls", e)
                }
                delay(5_000) // 5 seconds
            }
        }
    }
    
    // Render video call window if there's an active call
    val callSession = currentCall // Create local variable for smart cast
    
    Log.d("VideoCallManager", "=== RENDER CHECK ===")
    Log.d("VideoCallManager", "currentCall exists: ${callSession != null}")
    Log.d("VideoCallManager", "currentCall ID: ${callSession?.id}")
    Log.d("VideoCallManager", "currentUserId: $currentUserId")
    Log.d("VideoCallManager", "Will render: ${callSession != null && currentUserId != null}")
    
    if (callSession != null && currentUserId != null) {
        Log.d("VideoCallManager", "✅ RENDERING VideoCallWindow for call ${callSession.id}, status: ${callSession.status}")
        VideoCallWindow(
            callSession = callSession,
            currentUserId = currentUserId,
            onAnswer = { callId ->
                coroutineScope.launch {
                    val result = videoRepository.answerCall(callId)
                    if (result is Resource.Success) {
                        GlobalCallState.setCall(result.data)
                        onShowToast("Call answered")
                    } else if (result is Resource.Error) {
                        onShowToast(result.message ?: "Failed to answer call")
                    }
                }
            },
            onReject = { callId ->
                coroutineScope.launch {
                    val result = videoRepository.rejectCall(callId)
                    if (result is Resource.Success) {
                        GlobalCallState.clearCall()
                        lastCallId = null
                        onShowToast("Call rejected")
                    } else if (result is Resource.Error) {
                        onShowToast(result.message ?: "Failed to reject call")
                    }
                }
            },
            onEnd = { callId ->
                coroutineScope.launch {
                    val result = videoRepository.endCall(callId)
                    if (result is Resource.Success) {
                        GlobalCallState.clearCall()
                        lastCallId = null
                        onShowToast("Call ended")
                    } else if (result is Resource.Error) {
                        onShowToast(result.message ?: "Failed to end call")
                    }
                }
            }
        )
    }
    
    // Cleanup on dispose
    DisposableEffect(Unit) {
        onDispose {
            Log.d("VideoCallManager", "VideoCallManager disposed")
        }
    }
}

/**
 * Helper function to initiate a call from anywhere in the app
 */
object VideoCallHelper {
    private var videoRepository: VideoRepository? = null
    
    fun initialize() {
        videoRepository = VideoRepository()
    }
    
    suspend fun initiateCall(
        recipientId: Int,
        callType: too.good.crm.data.models.CallType = too.good.crm.data.models.CallType.VIDEO
    ): Resource<VideoCallSession> {
        val repo = videoRepository ?: run {
            initialize()
            videoRepository!!
        }
        Log.d("VideoCallHelper", "🔵 Initiating call to user $recipientId")
        val result = repo.initiateCall(recipientId, callType)
        
        Log.d("VideoCallHelper", "🔵 Call result: ${if (result is Resource.Success) "SUCCESS" else "ERROR"}")
        
        // Update global state on success so VideoCallManager shows the UI immediately
        if (result is Resource.Success) {
            Log.d("VideoCallHelper", "🔵 Setting GlobalCallState with call ID: ${result.data?.id}")
            Log.d("VideoCallHelper", "🔵 Call details - status: ${result.data?.status}, initiator: ${result.data?.initiator}, recipient: ${result.data?.recipient}")
            GlobalCallState.setCall(result.data)
            Log.d("VideoCallHelper", "🔵 GlobalCallState updated. Current value: ${GlobalCallState.currentCall.value?.id}")
        } else if (result is Resource.Error) {
            Log.e("VideoCallHelper", "🔴 Call failed: ${result.message}")
        }
        
        return result
    }
    
    suspend fun initiateCallByEmail(
        email: String,
        callType: too.good.crm.data.models.CallType = too.good.crm.data.models.CallType.VIDEO
    ): Resource<VideoCallSession> {
        val repo = videoRepository ?: run {
            initialize()
            videoRepository!!
        }
        Log.d("VideoCallHelper", "🔵 Initiating call to email $email")
        val result = repo.initiateCallByEmail(email, callType)
        
        Log.d("VideoCallHelper", "🔵 Call result: ${if (result is Resource.Success) "SUCCESS" else "ERROR"}")
        
        // Update global state on success so VideoCallManager shows the UI immediately
        if (result is Resource.Success) {
            Log.d("VideoCallHelper", "🔵 Setting GlobalCallState with call ID: ${result.data?.id}")
            Log.d("VideoCallHelper", "🔵 Call details - status: ${result.data?.status}, initiator: ${result.data?.initiator}, recipient: ${result.data?.recipient}")
            GlobalCallState.setCall(result.data)
            Log.d("VideoCallHelper", "🔵 GlobalCallState updated. Current value: ${GlobalCallState.currentCall.value?.id}")
        } else if (result is Resource.Error) {
            Log.e("VideoCallHelper", "🔴 Call failed: ${result.message}")
        }
        
        return result
    }
}
