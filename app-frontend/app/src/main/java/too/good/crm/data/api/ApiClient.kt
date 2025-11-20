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

    // ⚠️ IMPORTANT: Configure the correct BASE_URL based on your setup
    //
    // OPTION 1: Android Emulator (Currently Active)
    //   Use: "http://10.0.2.2:8000/api/"
    //   This is a special IP that Android emulator uses to access localhost
    //   ✅ CURRENT SETTING - Use this when running on Android Emulator
    //
    // OPTION 2: Physical Device on Same Network
    //   Step 1: Find your computer's IP address:
    //     Windows: Open CMD and type: ipconfig (look for IPv4 Address)
    //     Mac/Linux: Open Terminal and type: ifconfig or ip addr
    //   Step 2: Replace the IP below with your actual IP
    //   Example: "http://192.168.0.218:8000/api/"
    //
    // OPTION 3: Using ngrok (for external access)
    //   Use: "https://your-ngrok-url.ngrok-free.dev/api/"
    //
    // CURRENT SETTING: Android Emulator
    private const val BASE_URL = "http://10.0.2.2:8000/api/"
    
    // Uncomment one of these if you switch to a different setup:
    // For Physical Device (replace with your computer's IP):
    // private const val BASE_URL = "http://192.168.0.218:8000/api/"
    
    // For ngrok:
    // private const val BASE_URL = "https://your-ngrok-url.ngrok-free.dev/api/"

    private var authToken: String? = null

    /**
     * Set the authentication token for API requests
     */
    fun setAuthToken(token: String) {
        authToken = token
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

    // Add other API services here as needed
    // val organizationApiService: OrganizationApiService by lazy { ... }
}

