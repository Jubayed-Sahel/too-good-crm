package too.good.crm.data.pusher

import android.util.Log
import com.pusher.client.Pusher
import com.pusher.client.PusherOptions
import com.pusher.client.channel.Channel
import com.pusher.client.channel.SubscriptionEventListener
import com.pusher.client.connection.ConnectionEventListener
import com.pusher.client.connection.ConnectionState
import com.pusher.client.connection.ConnectionStateChange
import com.pusher.client.util.HttpAuthorizer
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import too.good.crm.BuildConfig
import too.good.crm.data.api.ApiClient
import java.io.IOException

object PusherService {
    private const val TAG = "PusherService"
    
    // Pusher configuration (from backend settings)
    private const val PUSHER_KEY = "5ea9fef4e6e142b94ac4"
    private const val PUSHER_CLUSTER = "ap2"
    
    // Use BuildConfig.BACKEND_URL from gradle.properties instead of hardcoded URL
    private val PUSHER_AUTH_ENDPOINT: String
        get() = "${BuildConfig.BACKEND_URL.removeSuffix("/")}/pusher/auth/"
    
    private var pusher: Pusher? = null
    private val _connectionState = MutableStateFlow<ConnectionState>(ConnectionState.DISCONNECTED)
    val connectionState: StateFlow<ConnectionState> = _connectionState
    
    /**
     * Initialize Pusher connection
     */
    fun initialize(userId: Int) {
        if (pusher != null) {
            Log.d(TAG, "Pusher already initialized")
            return
        }
        
        try {
            val options = PusherOptions()
            options.setCluster(PUSHER_CLUSTER)
            options.isEncrypted = true
            
            // Set authentication endpoint for private channels
            options.authorizer = object : HttpAuthorizer(PUSHER_AUTH_ENDPOINT) {
                override fun authorize(channelName: String, socketId: String): String {
                    return authorizeChannel(channelName, socketId)
                }
            }
            
            pusher = Pusher(PUSHER_KEY, options)
            
            // Connect and monitor state
            pusher?.connect()
            
            // Update connection state periodically
            kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.IO).launch {
                while (pusher != null) {
                    val currentState = pusher?.connection?.state ?: ConnectionState.DISCONNECTED
                    _connectionState.value = currentState
                    
                    when (currentState) {
                        ConnectionState.CONNECTED -> Log.d(TAG, "Pusher connected")
                        ConnectionState.DISCONNECTED -> Log.d(TAG, "Pusher disconnected")
                        ConnectionState.CONNECTING -> Log.d(TAG, "Pusher connecting")
                        ConnectionState.DISCONNECTING -> Log.d(TAG, "Pusher disconnecting")
                        else -> {}
                    }
                    
                    kotlinx.coroutines.delay(1000) // Check every second
                }
            }
            
            Log.d(TAG, "Pusher initialized for user $userId")
            
        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize Pusher", e)
        }
    }
    
    /**
     * Authorize private channel subscription
     */
    private fun authorizeChannel(channelName: String, socketId: String): String {
        return try {
            val client = OkHttpClient()
            val token = ApiClient.getAuthToken()
            
            val requestBody = JSONObject().apply {
                put("socket_id", socketId)
                put("channel_name", channelName)
            }.toString()
            
            val request = Request.Builder()
                .url(PUSHER_AUTH_ENDPOINT)
                .post(requestBody.toRequestBody("application/json".toMediaType()))
                .addHeader("Content-Type", "application/json")
                .apply {
                    if (token != null) {
                        addHeader("Authorization", "Token $token")
                    }
                }
                .build()
            
            val response = client.newCall(request).execute()
            val responseBody = response.body?.string() ?: "{}"
            
            if (!response.isSuccessful) {
                Log.e(TAG, "Pusher auth failed: ${response.code} - $responseBody")
                return "{}"
            }
            
            Log.d(TAG, "Pusher auth successful")
            responseBody
            
        } catch (e: Exception) {
            Log.e(TAG, "Failed to authorize Pusher channel", e)
            "{}"
        }
    }
    
    /**
     * Subscribe to a private channel
     */
    fun subscribeToChannel(
        channelName: String,
        onEvent: (eventName: String, data: String) -> Unit
    ): Channel? {
        if (pusher == null) {
            Log.w(TAG, "Pusher not initialized, cannot subscribe to $channelName")
            return null
        }
        
        return try {
            val channel = pusher!!.subscribe(channelName)
            
            channel.bind("pusher:subscription_succeeded", object : SubscriptionEventListener {
                override fun onEvent(event: com.pusher.client.channel.PusherEvent) {
                    Log.d(TAG, "Subscribed to channel: $channelName")
                }
            })
            
            channel.bind("pusher:subscription_error", object : SubscriptionEventListener {
                override fun onEvent(event: com.pusher.client.channel.PusherEvent) {
                    Log.e(TAG, "Subscription error for channel $channelName: ${event.data}")
                }
            })
            
            // Bind to all events on this channel
            channel.bindGlobal(object : SubscriptionEventListener {
                override fun onEvent(event: com.pusher.client.channel.PusherEvent) {
                    Log.d(TAG, "Event received on $channelName: ${event.eventName}")
                    onEvent(event.eventName, event.data)
                }
            })
            
            channel
        } catch (e: Exception) {
            Log.e(TAG, "Failed to subscribe to channel $channelName", e)
            null
        }
    }
    
    /**
     * Unsubscribe from a channel
     */
    fun unsubscribe(channelName: String) {
        try {
            pusher?.unsubscribe(channelName)
            Log.d(TAG, "Unsubscribed from channel: $channelName")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to unsubscribe from channel $channelName", e)
        }
    }
    
    /**
     * Disconnect Pusher
     */
    fun disconnect() {
        try {
            pusher?.disconnect()
            pusher = null
            _connectionState.value = ConnectionState.DISCONNECTED
            Log.d(TAG, "Pusher disconnected")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to disconnect Pusher", e)
        }
    }
    
    /**
     * Check if Pusher is connected
     */
    fun isConnected(): Boolean {
        return pusher?.connection?.state == ConnectionState.CONNECTED
    }
}

