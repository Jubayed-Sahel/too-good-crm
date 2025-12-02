package too.good.crm.data.repository

import too.good.crm.data.NetworkResult
import too.good.crm.data.api.ApiClient
import too.good.crm.data.api.*
import too.good.crm.data.safeApiCall

/**
 * Telegram Repository
 * Handles phone verification for Telegram bot linking
 */
class TelegramRepository {
    private val apiService = ApiClient.telegramApiService
    
    /**
     * Send verification code to phone number
     */
    suspend fun sendVerificationCode(
        phoneNumber: String,
        telegramChatId: Int? = null
    ): NetworkResult<SendVerificationCodeResponse> = safeApiCall {
        apiService.sendVerificationCode(
            SendVerificationCodeRequest(
                phone_number = phoneNumber,
                telegram_chat_id = telegramChatId
            )
        )
    }
    
    /**
     * Verify phone code and link Telegram account
     */
    suspend fun verifyPhoneCode(
        phoneNumber: String,
        verificationCode: String,
        telegramChatId: Int
    ): NetworkResult<VerifyPhoneCodeResponse> = safeApiCall {
        apiService.verifyPhoneCode(
            VerifyPhoneCodeRequest(
                phone_number = phoneNumber,
                verification_code = verificationCode,
                telegram_chat_id = telegramChatId
            )
        )
    }
    
    /**
     * Check if verification code is valid
     */
    suspend fun checkVerificationCode(
        phoneNumber: String,
        code: String
    ): NetworkResult<CheckVerificationCodeResponse> = safeApiCall {
        apiService.checkVerificationCode(phoneNumber, code)
    }
    
    /**
     * Generate a direct Telegram authentication link
     * This link opens Telegram bot and auto-authenticates the user
     */
    suspend fun generateTelegramLink(
        profileId: Int? = null
    ): NetworkResult<GenerateTelegramLinkResponse> = safeApiCall {
        apiService.generateTelegramLink(profileId)
    }
}

