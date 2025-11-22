package too.good.crm.data

/**
 * A generic wrapper class around data request states
 * Following Android best practices for API response handling
 * 
 * Based on Google's Architecture recommendations:
 * https://developer.android.com/topic/architecture/data-layer
 */
sealed class Resource<T>(
    val data: T? = null,
    val message: String? = null
) {
    /**
     * Success state with data
     */
    class Success<T>(data: T) : Resource<T>(data)
    
    /**
     * Error state with message and optional partial data
     */
    class Error<T>(message: String, data: T? = null) : Resource<T>(data, message)
    
    /**
     * Loading state with optional cached data
     */
    class Loading<T>(data: T? = null) : Resource<T>(data)
}

/**
 * Network response wrapper
 * Used for more detailed error handling
 */
sealed class NetworkResult<T> {
    data class Success<T>(val data: T) : NetworkResult<T>()
    data class Error<T>(val message: String, val code: Int? = null) : NetworkResult<T>()
    data class Exception<T>(val exception: Throwable) : NetworkResult<T>()
}

/**
 * Extension function to convert NetworkResult to Resource
 */
fun <T> NetworkResult<T>.toResource(): Resource<T> {
    return when (this) {
        is NetworkResult.Success -> Resource.Success(data)
        is NetworkResult.Error -> Resource.Error(message)
        is NetworkResult.Exception -> Resource.Error(
            exception.message ?: "Unknown error occurred"
        )
    }
}

/**
 * Inline function for safe API calls with automatic error handling
 * 
 * Usage:
 * ```
 * val result = safeApiCall {
 *     apiService.getCustomers()
 * }
 * ```
 */
suspend fun <T> safeApiCall(apiCall: suspend () -> T): NetworkResult<T> {
    return try {
        val response = apiCall()
        NetworkResult.Success(response)
    } catch (e: retrofit2.HttpException) {
        // HTTP errors (4xx, 5xx)
        val errorBody = e.response()?.errorBody()?.string()
        val message = errorBody ?: "HTTP ${e.code()}: ${e.message()}"
        NetworkResult.Error(message, e.code())
    } catch (e: java.net.UnknownHostException) {
        NetworkResult.Error("No internet connection. Please check your network.")
    } catch (e: java.net.SocketTimeoutException) {
        NetworkResult.Error("Connection timeout. Please try again.")
    } catch (e: java.io.IOException) {
        NetworkResult.Error("Network error. Please try again.")
    } catch (e: Exception) {
        NetworkResult.Exception(e)
    }
}

