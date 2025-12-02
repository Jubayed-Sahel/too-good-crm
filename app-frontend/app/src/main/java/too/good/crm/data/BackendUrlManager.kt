package too.good.crm.data

import android.content.Context
import android.content.SharedPreferences
import too.good.crm.BuildConfig

/**
 * Manages backend URL configuration at runtime.
 * Allows changing backend URL without rebuilding the app.
 */
object BackendUrlManager {
    private const val PREFS_NAME = "crm_backend_config"
    private const val KEY_BACKEND_URL = "backend_url"
    private const val KEY_USE_CUSTOM_URL = "use_custom_url"
    
    /**
     * Get the current backend URL.
     * Returns custom URL if set, otherwise returns BuildConfig default.
     */
    fun getBackendUrl(context: Context): String {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val useCustom = prefs.getBoolean(KEY_USE_CUSTOM_URL, false)
        
        return if (useCustom) {
            prefs.getString(KEY_BACKEND_URL, BuildConfig.BACKEND_URL) ?: BuildConfig.BACKEND_URL
        } else {
            BuildConfig.BACKEND_URL
        }
    }
    
    /**
     * Set a custom backend URL.
     * @param url Must end with "/api/" (e.g., "http://192.168.1.100:8000/api/")
     */
    fun setBackendUrl(context: Context, url: String) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val normalizedUrl = normalizeUrl(url)
        
        prefs.edit()
            .putString(KEY_BACKEND_URL, normalizedUrl)
            .putBoolean(KEY_USE_CUSTOM_URL, true)
            .apply()
    }
    
    /**
     * Reset to default BuildConfig URL.
     */
    fun resetToDefault(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        // Set to the default IP address
        prefs.edit()
            .putString(KEY_BACKEND_URL, "http://192.168.0.102:8000/api/")
            .putBoolean(KEY_USE_CUSTOM_URL, true)
            .apply()
    }
    
    /**
     * Check if using custom URL.
     */
    fun isUsingCustomUrl(context: Context): Boolean {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getBoolean(KEY_USE_CUSTOM_URL, false)
    }
    
    /**
     * Get the default BuildConfig URL.
     */
    fun getDefaultUrl(): String = BuildConfig.BACKEND_URL
    
    /**
     * Normalize URL format:
     * - Ensures it ends with "/api/"
     * - Adds "http://" if missing
     * - Removes trailing slashes before adding "/api/"
     */
    private fun normalizeUrl(url: String): String {
        var normalized = url.trim()
        
        // Add http:// if missing
        if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
            normalized = "http://$normalized"
        }
        
        // Remove trailing slashes
        normalized = normalized.trimEnd('/')
        
        // Ensure it ends with /api/
        if (!normalized.endsWith("/api/")) {
            if (normalized.endsWith("/api")) {
                normalized += "/"
            } else {
                normalized += "/api/"
            }
        }
        
        return normalized
    }
    
    /**
     * Validate URL format.
     */
    fun isValidUrl(url: String): Boolean {
        return try {
            val normalized = normalizeUrl(url)
            java.net.URL(normalized)
            true
        } catch (e: Exception) {
            false
        }
    }
}

