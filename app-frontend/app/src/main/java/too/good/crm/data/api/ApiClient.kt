package too.good.crm.data.api

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import okio.Buffer
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import too.good.crm.BuildConfig
import java.util.concurrent.TimeUnit

/**
 * Retrofit API Client for CRM Backend
 * Configure BASE_URL and auth token before using
 */
object ApiClient {

    // ⚠️ BASE_URL Configuration
    //
    // TO CHANGE THE BACKEND URL:
    // Edit the file: gradle.properties (in the root project folder)
    // Update the line: BACKEND_URL=http://YOUR_IP:8000/api/
    //
    // OPTION 1: Android Emulator
    //   BACKEND_URL=http://10.0.2.2:8000/api/
    //   (10.0.2.2 is the special IP that emulator uses to access host machine's localhost)
    //
    // OPTION 2: Physical Device on Same Network
    //   BACKEND_URL=http://192.168.1.100:8000/api/
    //   (Replace 192.168.1.100 with your computer's IP address)
    //   Find your IP: Windows: ipconfig | Mac/Linux: ifconfig
    //
    // OPTION 3: Production/ngrok
    //   BACKEND_URL=https://api.yourdomain.com/api/
    //
    // ✅ CURRENT: Configured in gradle.properties
    // Make sure your phone is connected to the SAME WiFi network as your PC!
    private val BASE_URL = BuildConfig.BACKEND_URL

    private var authToken: String? = null

    /**
     * Set the authentication token for API requests
     */
    fun setAuthToken(token: String) {
        authToken = token
    }
    
    /**
     * Get the current authentication token
     */
    fun getAuthToken(): String? {
        return authToken
    }

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .addInterceptor { chain ->
            val original = chain.request()
            val requestBuilder = original.newBuilder()
                .header("Content-Type", "application/json")

            // List of public endpoints that don't require authentication
            val publicEndpoints = listOf(
                "/api/auth/login/",
                "/api/users/",  // Registration endpoint
            )
            
            // Check if this is a public endpoint
            val isPublicEndpoint = publicEndpoints.any { endpoint ->
                original.url.encodedPath.endsWith(endpoint) || 
                original.url.encodedPath.contains(endpoint)
            }

            // Only add authorization token if:
            // 1. Token is available
            // 2. Endpoint is NOT a public endpoint
            if (!isPublicEndpoint) {
                authToken?.let {
                    requestBuilder.header("Authorization", "Token $it")
                    android.util.Log.d("ApiClient", "🔐 Added Authorization header (token length: ${it.length})")
                } ?: run {
                    android.util.Log.w("ApiClient", "⚠️ No auth token available for ${original.url.encodedPath}")
                }
            }

            val request = requestBuilder
                .method(original.method, original.body)
                .build()

            // Debug logging for customer update requests
            if (request.url.encodedPath.contains("customers") && 
                (request.method == "PATCH" || request.method == "PUT")) {
                android.util.Log.d("ApiClient", "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
                android.util.Log.d("ApiClient", "🔄 CUSTOMER UPDATE REQUEST DEBUG")
                android.util.Log.d("ApiClient", "Method: ${request.method}")
                android.util.Log.d("ApiClient", "URL: ${request.url}")
                android.util.Log.d("ApiClient", "Path: ${request.url.encodedPath}")
                android.util.Log.d("ApiClient", "Has Auth Token: ${authToken != null}")
                request.headers.names().forEach { headerName ->
                    if (headerName.equals("Authorization", ignoreCase = true)) {
                        android.util.Log.d("ApiClient", "Header: $headerName = Token [REDACTED]")
                    } else {
                        android.util.Log.d("ApiClient", "Header: $headerName = ${request.header(headerName)}")
                    }
                }
                // Try to log request body (if available)
                request.body?.let { body ->
                    try {
                        val buffer = okio.Buffer()
                        body.writeTo(buffer)
                        val bodyString = buffer.readUtf8()
                        android.util.Log.d("ApiClient", "Request Body: $bodyString")
                    } catch (e: Exception) {
                        android.util.Log.d("ApiClient", "Request Body: [Could not read]")
                    }
                }
                android.util.Log.d("ApiClient", "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            }

            val response = chain.proceed(request)
            
            // Debug logging for customer update responses
            if (request.url.encodedPath.contains("customers") && 
                (request.method == "PATCH" || request.method == "PUT")) {
                android.util.Log.d("ApiClient", "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
                android.util.Log.d("ApiClient", "📥 CUSTOMER UPDATE RESPONSE DEBUG")
                android.util.Log.d("ApiClient", "Status Code: ${response.code}")
                android.util.Log.d("ApiClient", "Status Message: ${response.message}")
                android.util.Log.d("ApiClient", "Is Successful: ${response.isSuccessful}")
                response.headers.names().forEach { headerName ->
                    android.util.Log.d("ApiClient", "Response Header: $headerName = ${response.header(headerName)}")
                }
                
                // Log error body for failed requests
                if (!response.isSuccessful) {
                    try {
                        val errorBody = response.peekBody(2048).string()
                        android.util.Log.e("ApiClient", "Error Response Body: $errorBody")
                    } catch (e: Exception) {
                        android.util.Log.e("ApiClient", "Could not read error body: ${e.message}")
                    }
                }
                android.util.Log.d("ApiClient", "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            }
            
            response
        }
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .writeTimeout(15, TimeUnit.SECONDS)
        .retryOnConnectionFailure(true)
        .build()

    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    /**
     * Issue API Service instance
     * NOTE: If IDE shows errors, do: File -> Invalidate Caches -> Invalidate and Restart
     */
    val issueApiService: IssueApiService by lazy {
        retrofit.create(IssueApiService::class.java)
    }

    /**
     * Auth API Service instance
     * NOTE: If IDE shows errors, do: File -> Invalidate Caches -> Invalidate and Restart
     */
    val authApiService: AuthApiService by lazy {
        retrofit.create(AuthApiService::class.java)
    }

    /**
     * Customer API Service instance
     */
    val customerApiService: CustomerApiService by lazy {
        retrofit.create(CustomerApiService::class.java)
    }

    /**
     * Role Selection API Service instance
     */
    val roleSelectionApiService: RoleSelectionApiService by lazy {
        retrofit.create(RoleSelectionApiService::class.java)
    }

    /**
     * User Context API Service instance (for permissions)
     * Matches web frontend: /api/user-context/permissions/
     */
    val userContextApiService: UserContextApiService by lazy {
        retrofit.create(UserContextApiService::class.java)
    }

    /**
     * Analytics API Service instance
     */
    val analyticsApiService: AnalyticsApiService by lazy {
        retrofit.create(AnalyticsApiService::class.java)
    }

    /**
     * Employee API Service instance
     */
    val employeeApiService: EmployeeApiService by lazy {
        retrofit.create(EmployeeApiService::class.java)
    }

    /**
     * Lead API Service instance
     */
    val leadApiService: LeadApiService by lazy {
        retrofit.create(LeadApiService::class.java)
    }

    /**
     * Deal API Service instance
     */
    val dealApiService: DealApiService by lazy {
        retrofit.create(DealApiService::class.java)
    }

    /**
     * Message API Service instance
     */
    val messageApiService: MessageApiService by lazy {
        retrofit.create(MessageApiService::class.java)
    }

    /**
     * Activity API Service instance
     */
    val activityApiService: ActivityApiService by lazy {
        retrofit.create(ActivityApiService::class.java)
    }

    /**
     * Video API Service instance (8x8 Video/Jitsi)
     */
    val videoApiService: VideoApiService by lazy {
        retrofit.create(VideoApiService::class.java)
    }

    /**
     * Telegram API Service instance (Phone verification)
     */
    val telegramApiService: TelegramApiService by lazy {
        retrofit.create(TelegramApiService::class.java)
    }

    /**
     * Vendor API Service instance
     */
    val vendorApiService: VendorApiService by lazy {
        retrofit.create(VendorApiService::class.java)
    }

    // Add other API services here as needed
    // val organizationApiService: OrganizationApiService by lazy { ... }
}

