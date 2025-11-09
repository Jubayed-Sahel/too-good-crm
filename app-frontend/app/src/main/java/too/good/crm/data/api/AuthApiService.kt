package too.good.crm.data.api

import retrofit2.Response
import retrofit2.http.*
import too.good.crm.data.model.*

interface AuthApiService {

    @POST("auth/login/")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<LoginResponse>

    @POST("users/")
    suspend fun register(
        @Body request: RegisterRequest
    ): Response<RegisterResponse>

    @POST("auth/logout/")
    suspend fun logout(): Response<LogoutResponse>

    @GET("users/me/")
    suspend fun getCurrentUser(): Response<UserResponse>

    @POST("auth/change-password/")
    suspend fun changePassword(
        @Body request: ChangePasswordRequest
    ): Response<MessageResponse>
}

