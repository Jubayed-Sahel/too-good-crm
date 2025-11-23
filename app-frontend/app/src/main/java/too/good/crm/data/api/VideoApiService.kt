package too.good.crm.data.api

import retrofit2.Response
import retrofit2.http.*
import too.good.crm.data.models.*

/**
 * Video API Service for 8x8 Video (Jitsi) Integration
 * Handles all video calling API endpoints
 */
interface VideoApiService {
    
    /**
     * Initiate a video call to another user
     * POST /api/jitsi-calls/initiate_call/
     */
    @POST("jitsi-calls/initiate_call/")
    suspend fun initiateCall(
        @Body request: InitiateCallRequest
    ): Response<InitiateCallResponse>
    
    /**
     * Initiate a call by email
     * POST /api/jitsi-calls/initiate_call_by_email/
     */
    @POST("jitsi-calls/initiate_call_by_email/")
    suspend fun initiateCallByEmail(
        @Body request: InitiateCallByEmailRequest
    ): Response<InitiateCallResponse>
    
    /**
     * Answer an incoming call
     * POST /api/jitsi-calls/{id}/update_status/
     */
    @POST("jitsi-calls/{id}/update_status/")
    suspend fun answerCall(
        @Path("id") callId: Int,
        @Body request: UpdateCallStatusRequest
    ): Response<UpdateCallStatusResponse>
    
    /**
     * Reject an incoming call
     * POST /api/jitsi-calls/{id}/update_status/
     */
    @POST("jitsi-calls/{id}/update_status/")
    suspend fun rejectCall(
        @Path("id") callId: Int,
        @Body request: UpdateCallStatusRequest
    ): Response<UpdateCallStatusResponse>
    
    /**
     * End an active call
     * POST /api/jitsi-calls/{id}/update_status/
     */
    @POST("jitsi-calls/{id}/update_status/")
    suspend fun endCall(
        @Path("id") callId: Int,
        @Body request: UpdateCallStatusRequest
    ): Response<UpdateCallStatusResponse>
    
    /**
     * Get the current user's active or pending call
     * GET /api/jitsi-calls/my_active_call/
     */
    @GET("jitsi-calls/my_active_call/")
    suspend fun getMyActiveCall(): Response<VideoCallSession>
    
    /**
     * Get all active calls
     * GET /api/jitsi-calls/active_calls/
     */
    @GET("jitsi-calls/active_calls/")
    suspend fun getActiveCalls(): Response<List<VideoCallSession>>
    
    /**
     * Send heartbeat to mark user as online
     * POST /api/user-presence/heartbeat/
     */
    @POST("user-presence/heartbeat/")
    suspend fun sendHeartbeat(): Response<SendHeartbeatResponse>
    
    /**
     * Get list of online users available for calls
     * GET /api/user-presence/online_users/
     */
    @GET("user-presence/online_users/")
    suspend fun getOnlineUsers(): Response<GetOnlineUsersResponse>
    
    /**
     * Update user's presence status
     * POST /api/user-presence/update_my_status/
     */
    @POST("user-presence/update_my_status/")
    suspend fun updatePresenceStatus(
        @Body request: Map<String, String>
    ): Response<UserPresence>
}
