package too.good.crm.data.api

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

/**
 * Retrofit API Client for CRM Backend
 * Configure BASE_URL and auth token before using
 */
object ApiClient {

    // ⚠️ BASE_URL Configuration
    // Backend running on 0.0.0.0:8000
    //
    // OPTION 1: Android Emulator (Default)
    //   Use: "http://10.0.2.2:8000/api/"
    //   10.0.2.2 is the special IP that emulator uses to access host machine's localhost
    //
    // OPTION 2: Physical Device on Same Network
    //   Find your computer's IP address:
    //     Windows: ipconfig (look for IPv4 Address)
    //     Mac/Linux: ifconfig or ip addr
    //   Example: "http://192.168.1.100:8000/api/"
    //
    // OPTION 3: ngrok (for external access/testing)
    //   Use: "https://your-ngrok-url.ngrok-free.dev/api/"
    //
    // ✅ CURRENT: Android Emulator connecting to localhost:8000
    private const val BASE_URL = "http://10.0.2.2:8000/api/"

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

            // Add authorization token if available
            authToken?.let {
                requestBuilder.header("Authorization", "Token $it")
            }

            val request = requestBuilder
                .method(original.method, original.body)
                .build()

            chain.proceed(request)
        }
        .connectTimeout(60, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
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

    // Add other API services here as needed
    // val organizationApiService: OrganizationApiService by lazy { ... }
}

