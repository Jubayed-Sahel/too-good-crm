package too.good.crm.data.api

import android.content.Context
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import okio.Buffer
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import too.good.crm.BuildConfig
import too.good.crm.data.BackendUrlManager
import java.util.concurrent.TimeUnit

/**
 * Retrofit API Client for CRM Backend
 * Supports runtime URL configuration via BackendUrlManager
 * 
 * ✅ RUNTIME URL CONFIGURATION:
 * Change backend URL at runtime without rebuilding!
 * Use BackendUrlManager.setBackendUrl(context, "http://YOUR_IP:8000/api/")
 * Then call ApiClient.rebuildRetrofit() to apply changes.
 */
object ApiClient {

    private var appContext: Context? = null
    private var retrofitInstance: Retrofit? = null
    private var currentBaseUrl: String? = null

    /**
     * Initialize ApiClient with app context (call once in MainActivity)
     */
    fun initialize(context: Context) {
        appContext = context.applicationContext
        rebuildRetrofit()
    }

    /**
     * Get current BASE_URL (runtime or BuildConfig default)
     */
    private fun getBaseUrl(): String {
        return appContext?.let { BackendUrlManager.getBackendUrl(it) } 
            ?: BuildConfig.BACKEND_URL
    }

    /**
     * Rebuild Retrofit instance when URL changes
     */
    fun rebuildRetrofit() {
        val newBaseUrl = getBaseUrl()
        if (currentBaseUrl != newBaseUrl) {
            currentBaseUrl = newBaseUrl
            retrofitInstance = createRetrofit(newBaseUrl)
            android.util.Log.d("ApiClient", "🔄 Retrofit rebuilt with URL: $newBaseUrl")
        }
    }

    /**
     * Get Retrofit instance (rebuilds if URL changed)
     */
    private fun getRetrofit(): Retrofit {
        rebuildRetrofit()
        return retrofitInstance ?: createRetrofit(getBaseUrl())
    }

    /**
     * Create Retrofit instance with given base URL
     */
    private fun createRetrofit(baseUrl: String): Retrofit {
        return Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

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



    /**
     * Issue API Service instance
     * NOTE: If IDE shows errors, do: File -> Invalidate Caches -> Invalidate and Restart
     */
    val issueApiService: IssueApiService
        get() = getRetrofit().create(IssueApiService::class.java)

    /**
     * Auth API Service instance
     * NOTE: If IDE shows errors, do: File -> Invalidate Caches -> Invalidate and Restart
     */
    val authApiService: AuthApiService
        get() = getRetrofit().create(AuthApiService::class.java)

    /**
     * Customer API Service instance
     */
    val customerApiService: CustomerApiService
        get() = getRetrofit().create(CustomerApiService::class.java)

    /**
     * Role Selection API Service instance
     */
    val roleSelectionApiService: RoleSelectionApiService
        get() = getRetrofit().create(RoleSelectionApiService::class.java)

    /**
     * User Context API Service instance (for permissions)
     * Matches web frontend: /api/user-context/permissions/
     */
    val userContextApiService: UserContextApiService
        get() = getRetrofit().create(UserContextApiService::class.java)

    /**
     * Analytics API Service instance
     */
    val analyticsApiService: AnalyticsApiService
        get() = getRetrofit().create(AnalyticsApiService::class.java)

    /**
     * Employee API Service instance
     */
    val employeeApiService: EmployeeApiService
        get() = getRetrofit().create(EmployeeApiService::class.java)

    /**
     * Lead API Service instance
     */
    val leadApiService: LeadApiService
        get() = getRetrofit().create(LeadApiService::class.java)

    /**
     * Deal API Service instance
     */
    val dealApiService: DealApiService
        get() = getRetrofit().create(DealApiService::class.java)

    /**
     * Message API Service instance
     */
    val messageApiService: MessageApiService
        get() = getRetrofit().create(MessageApiService::class.java)

    /**
     * Activity API Service instance
     */
    val activityApiService: ActivityApiService
        get() = getRetrofit().create(ActivityApiService::class.java)

    /**
     * Video API Service instance (8x8 Video/Jitsi)
     */
    val videoApiService: VideoApiService
        get() = getRetrofit().create(VideoApiService::class.java)

    /**
     * Telegram API Service instance (Phone verification)
     */
    val telegramApiService: TelegramApiService
        get() = getRetrofit().create(TelegramApiService::class.java)

    /**
     * Organization API Service instance
     */
    val organizationApiService: OrganizationApiService
        get() = getRetrofit().create(OrganizationApiService::class.java)

    /**
     * Vendor API Service instance
     */
    val vendorApiService: VendorApiService
        get() = getRetrofit().create(VendorApiService::class.java)

    /**
     * Order API Service instance
     */
    val orderApiService: OrderApiService
        get() = getRetrofit().create(OrderApiService::class.java)

    /**
     * Gemini API Service instance
     */
    val geminiApiService: GeminiApiService
        get() = getRetrofit().create(GeminiApiService::class.java)
}

