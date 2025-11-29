package too.good.crm.data.api

import android.annotation.SuppressLint
import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL

object NetworkUtils {

    /**
     * Check if device has network connectivity
     */
    @SuppressLint("MissingPermission")
    fun isNetworkAvailable(context: Context): Boolean {
        val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = connectivityManager.activeNetwork ?: return false
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false

        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    /**
     * Test connection to backend server
     * Returns true if server is reachable, false otherwise
     */
    suspend fun testServerConnection(baseUrl: String = "http://10.0.2.2:8000"): Result<String> {
        return withContext(Dispatchers.IO) {
            try {
                val url = URL("$baseUrl/api/")
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "GET"
                connection.connectTimeout = 5000 // 5 second timeout for quick test
                connection.readTimeout = 5000

                val responseCode = connection.responseCode
                connection.disconnect()

                when {
                    responseCode in 200..299 -> Result.success("Server is reachable (HTTP $responseCode)")
                    responseCode == 404 -> Result.success("Server is running but endpoint not found (HTTP 404). Backend may need configuration.")
                    responseCode == 401 || responseCode == 403 -> Result.success("Server is reachable but requires authentication (HTTP $responseCode)")
                    else -> Result.failure(Exception("Server returned HTTP $responseCode"))
                }
            } catch (e: java.net.ConnectException) {
                Result.failure(Exception("Cannot connect to server at $baseUrl.\n\nPlease verify:\n1. Backend is running\n2. Using correct IP address\n3. Port 8000 is accessible\n\nError: ${e.message}"))
            } catch (e: java.net.SocketTimeoutException) {
                Result.failure(Exception("Connection timeout after 5 seconds.\n\nServer may be slow or not responding.\n\nError: ${e.message}"))
            } catch (e: java.net.UnknownHostException) {
                Result.failure(Exception("Cannot resolve host $baseUrl.\n\nCheck IP address configuration.\n\nError: ${e.message}"))
            } catch (e: Exception) {
                Result.failure(Exception("Connection test failed: ${e.message}"))
            }
        }
    }

    /**
     * Get network type name for user display
     */
    @SuppressLint("MissingPermission")
    fun getNetworkTypeName(context: Context): String {
        val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = connectivityManager.activeNetwork ?: return "No Connection"
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return "Unknown"

        return when {
            capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> "WiFi"
            capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> "Mobile Data"
            capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) -> "Ethernet"
            else -> "Unknown"
        }
    }
}
