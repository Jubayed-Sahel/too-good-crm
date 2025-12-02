package too.good.crm.data.api

import retrofit2.http.*

/**
 * Telegram Phone Verification API Service
 * Endpoints for phone number-based Telegram bot linking
 */
interface TelegramApiService {
    
    /**
     * Send verification code to phone number
     * POST /api/telegram/send-verification-code/
     */
    @POST("telegram/send-verification-code/")
    suspend fun sendVerificationCode(@Body request: SendVerificationCodeRequest): SendVerificationCodeResponse
    
    /**
     * Verify phone code and link Telegram account
     * POST /api/telegram/verify-phone-code/
     */
    @POST("telegram/verify-phone-code/")
    suspend fun verifyPhoneCode(@Body request: VerifyPhoneCodeRequest): VerifyPhoneCodeResponse
    
    /**
     * Check if verification code exists and is valid
     * GET /api/telegram/check-verification-code/
     */
    @GET("telegram/check-verification-code/")
    suspend fun checkVerificationCode(
        @Query("phone") phone: String,
        @Query("code") code: String
    ): CheckVerificationCodeResponse
    
    /**
     * Generate a direct Telegram authentication link
     * GET /api/telegram/generate-link/
     */
    @GET("telegram/generate-link/")
    suspend fun generateTelegramLink(
        @Query("profile_id") profileId: Int? = null
    ): GenerateTelegramLinkResponse
}

/**
 * Request to send verification code
 */
data class SendVerificationCodeRequest(
    val phone_number: String,
    val telegram_chat_id: Int? = null
)

/**
 * Response after sending verification code
 */
data class SendVerificationCodeResponse(
    val success: Boolean,
    val message: String? = null,
    val error: String? = null,
    val phone_number: String? = null,
    val expires_in: Int? = null,
    val verification_id: Int? = null,
    val verification_code: String? = null,
    val verification_url: String? = null
)

/**
 * Request to verify phone code
 */
data class VerifyPhoneCodeRequest(
    val phone_number: String,
    val verification_code: String,
    val telegram_chat_id: Int
)

/**
 * Response after verifying phone code
 */
data class VerifyPhoneCodeResponse(
    val success: Boolean,
    val message: String? = null,
    val error: String? = null,
    val user: TelegramUser? = null,
    val telegram_user: TelegramTelegramUser? = null
)

/**
 * Response for checking verification code
 */
data class CheckVerificationCodeResponse(
    val exists: Boolean,
    val is_expired: Boolean,
    val remaining_attempts: Int
)

/**
 * Telegram user data
 */
data class TelegramUser(
    val id: Int,
    val email: String,
    val full_name: String
)

/**
 * Telegram account data
 */
data class TelegramTelegramUser(
    val chat_id: Long,
    val username: String? = null,
    val full_name: String,
    val is_authenticated: Boolean
)

/**
 * Response for generating Telegram link
 */
data class GenerateTelegramLinkResponse(
    val telegram_link: String,
    val auth_code: String? = null,  // Short 6-character code for manual entry
    val bot_username: String,
    val expires_in: Int,
    val user: TelegramLinkUser? = null,
    val profile: TelegramLinkProfile? = null,
    val error: String? = null
)

/**
 * User info in Telegram link response
 */
data class TelegramLinkUser(
    val id: Int,
    val email: String,
    val full_name: String
)

/**
 * Profile info in Telegram link response
 */
data class TelegramLinkProfile(
    val id: Int,
    val profile_type: String,
    val organization: TelegramLinkOrganization? = null
)

/**
 * Organization info in Telegram link response
 */
data class TelegramLinkOrganization(
    val id: Int,
    val name: String
)

