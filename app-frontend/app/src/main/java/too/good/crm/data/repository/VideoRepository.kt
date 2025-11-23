package too.good.crm.data.repository

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import too.good.crm.data.Resource
import too.good.crm.data.api.ApiClient
import too.good.crm.data.models.*

/**
 * Video Repository
 * Handles all video calling operations with proper error handling
 */
class VideoRepository {
    
    private val videoApiService = ApiClient.videoApiService
    
    companion object {
        private const val TAG = "VideoRepository"
    }
    
    /**
     * Initiate a video call to another user
     */
    suspend fun initiateCall(
        recipientId: Int,
        callType: CallType = CallType.VIDEO
    ): Resource<VideoCallSession> = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "Initiating $callType call to user $recipientId")
            
            val request = InitiateCallRequest(
                recipientId = recipientId,
                callType = callType
            )
            
            val response = videoApiService.initiateCall(request)
            
            if (response.isSuccessful && response.body() != null) {
                val callSession = response.body()!!.callSession
                Log.d(TAG, "Call initiated successfully: ${callSession.id}")
                Resource.Success(callSession)
            } else {
                val errorMessage = response.errorBody()?.string() ?: "Failed to initiate call"
                Log.e(TAG, "Failed to initiate call: $errorMessage")
                Resource.Error(errorMessage)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception initiating call", e)
            Resource.Error(e.message ?: "Network error")
        }
    }
    
    /**
     * Initiate a call by email address
     */
    suspend fun initiateCallByEmail(
        email: String,
        callType: CallType = CallType.VIDEO
    ): Resource<VideoCallSession> = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "Initiating $callType call to email $email")
            
            val request = InitiateCallByEmailRequest(
                recipientEmail = email,
                callType = callType.name.lowercase()
            )
            
            val response = videoApiService.initiateCallByEmail(request)
            
            if (response.isSuccessful && response.body() != null) {
                val callSession = response.body()!!.callSession
                Log.d(TAG, "Call initiated successfully: ${callSession.id}")
                Resource.Success(callSession)
            } else {
                val errorMessage = response.errorBody()?.string() ?: "Failed to initiate call"
                Log.e(TAG, "Failed to initiate call: $errorMessage")
                Resource.Error(errorMessage)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception initiating call by email", e)
            Resource.Error(e.message ?: "Network error")
        }
    }
    
    /**
     * Answer an incoming call
     */
    suspend fun answerCall(callId: Int): Resource<VideoCallSession> = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "Answering call $callId")
            
            val request = UpdateCallStatusRequest(action = "answer")
            val response = videoApiService.answerCall(callId, request)
            
            if (response.isSuccessful && response.body() != null) {
                val callSession = response.body()!!.callSession
                Log.d(TAG, "Call answered successfully: ${callSession.id}")
                Resource.Success(callSession)
            } else {
                val errorMessage = response.errorBody()?.string() ?: "Failed to answer call"
                Log.e(TAG, "Failed to answer call: $errorMessage")
                Resource.Error(errorMessage)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception answering call", e)
            Resource.Error(e.message ?: "Network error")
        }
    }
    
    /**
     * Reject an incoming call
     */
    suspend fun rejectCall(callId: Int): Resource<VideoCallSession> = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "Rejecting call $callId")
            
            val request = UpdateCallStatusRequest(action = "reject")
            val response = videoApiService.rejectCall(callId, request)
            
            if (response.isSuccessful && response.body() != null) {
                val callSession = response.body()!!.callSession
                Log.d(TAG, "Call rejected successfully: ${callSession.id}")
                Resource.Success(callSession)
            } else {
                val errorMessage = response.errorBody()?.string() ?: "Failed to reject call"
                Log.e(TAG, "Failed to reject call: $errorMessage")
                Resource.Error(errorMessage)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception rejecting call", e)
            Resource.Error(e.message ?: "Network error")
        }
    }
    
    /**
     * End an active call
     */
    suspend fun endCall(callId: Int): Resource<VideoCallSession> = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "Ending call $callId")
            
            val request = UpdateCallStatusRequest(action = "end")
            val response = videoApiService.endCall(callId, request)
            
            if (response.isSuccessful && response.body() != null) {
                val callSession = response.body()!!.callSession
                Log.d(TAG, "Call ended successfully: ${callSession.id}")
                Resource.Success(callSession)
            } else {
                val errorMessage = response.errorBody()?.string() ?: "Failed to end call"
                Log.e(TAG, "Failed to end call: $errorMessage")
                Resource.Error(errorMessage)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception ending call", e)
            Resource.Error(e.message ?: "Network error")
        }
    }
    
    /**
     * Get the current user's active or pending call
     */
    suspend fun getMyActiveCall(): Resource<VideoCallSession?> = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "Fetching my active call")
            
            val response = videoApiService.getMyActiveCall()
            
            when {
                response.isSuccessful && response.body() != null -> {
                    val callSession = response.body()!!
                    Log.d(TAG, "Active call found: ${callSession.id}")
                    Resource.Success(callSession)
                }
                response.code() == 404 || response.code() == 204 -> {
                    Log.d(TAG, "No active call")
                    Resource.Success(null)
                }
                else -> {
                    val errorMessage = response.errorBody()?.string() ?: "Failed to get active call"
                    Log.e(TAG, "Failed to get active call: $errorMessage")
                    Resource.Error(errorMessage)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception getting active call", e)
            // Return null for network errors (user might be offline)
            Resource.Success(null)
        }
    }
    
    /**
     * Get all active calls
     */
    suspend fun getActiveCalls(): Resource<List<VideoCallSession>> = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "Fetching active calls")
            
            val response = videoApiService.getActiveCalls()
            
            if (response.isSuccessful && response.body() != null) {
                val calls = response.body()!!
                Log.d(TAG, "Found ${calls.size} active calls")
                Resource.Success(calls)
            } else {
                val errorMessage = response.errorBody()?.string() ?: "Failed to get active calls"
                Log.e(TAG, "Failed to get active calls: $errorMessage")
                Resource.Error(errorMessage)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception getting active calls", e)
            Resource.Error(e.message ?: "Network error")
        }
    }
    
    /**
     * Send heartbeat to mark user as online
     */
    suspend fun sendHeartbeat(): Resource<UserPresence> = withContext(Dispatchers.IO) {
        try {
            val response = videoApiService.sendHeartbeat()
            
            if (response.isSuccessful && response.body() != null) {
                val userPresence = response.body()!!.userPresence
                Log.d(TAG, "Heartbeat sent successfully")
                Resource.Success(userPresence)
            } else {
                val errorMessage = response.errorBody()?.string() ?: "Failed to send heartbeat"
                Log.e(TAG, "Failed to send heartbeat: $errorMessage")
                Resource.Error(errorMessage)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception sending heartbeat", e)
            Resource.Error(e.message ?: "Network error")
        }
    }
    
    /**
     * Get list of online users available for calls
     */
    suspend fun getOnlineUsers(): Resource<List<OnlineUser>> = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "Fetching online users")
            
            val response = videoApiService.getOnlineUsers()
            
            if (response.isSuccessful && response.body() != null) {
                val users = response.body()!!.users
                Log.d(TAG, "Found ${users.size} online users")
                Resource.Success(users)
            } else {
                val errorMessage = response.errorBody()?.string() ?: "Failed to get online users"
                Log.e(TAG, "Failed to get online users: $errorMessage")
                Resource.Error(errorMessage)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception getting online users", e)
            Resource.Error(e.message ?: "Network error")
        }
    }
    
    /**
     * Update user's presence status
     */
    suspend fun updatePresenceStatus(
        status: PresenceStatus,
        statusMessage: String = ""
    ): Resource<UserPresence> = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "Updating presence status to $status")
            
            val request = mapOf(
                "status" to status.name.lowercase(),
                "status_message" to statusMessage
            )
            
            val response = videoApiService.updatePresenceStatus(request)
            
            if (response.isSuccessful && response.body() != null) {
                val userPresence = response.body()!!
                Log.d(TAG, "Presence status updated successfully")
                Resource.Success(userPresence)
            } else {
                val errorMessage = response.errorBody()?.string() ?: "Failed to update status"
                Log.e(TAG, "Failed to update presence status: $errorMessage")
                Resource.Error(errorMessage)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception updating presence status", e)
            Resource.Error(e.message ?: "Network error")
        }
    }
}
