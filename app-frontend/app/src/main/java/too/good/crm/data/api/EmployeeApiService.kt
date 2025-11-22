package too.good.crm.data.api

import retrofit2.http.*
import too.good.crm.data.models.Employee
import too.good.crm.data.models.InviteEmployeeRequest
import too.good.crm.data.models.InviteEmployeeResponse
import too.good.crm.data.models.UpdateEmployeeRequest

/**
 * Retrofit API interface for Employee endpoints
 */
interface EmployeeApiService {
    
    @GET("employees/")
    suspend fun getEmployees(
        @Query("organization") organization: Int? = null,
        @Query("status") status: String? = null,
        @Query("department") department: String? = null,
        @Query("search") search: String? = null
    ): List<Employee>
    
    @GET("employees/{id}/")
    suspend fun getEmployee(@Path("id") id: Int): Employee
    
    @POST("employees/")
    suspend fun createEmployee(@Body employee: UpdateEmployeeRequest): Employee
    
    @PATCH("employees/{id}/")
    suspend fun updateEmployee(
        @Path("id") id: Int,
        @Body employee: UpdateEmployeeRequest
    ): Employee
    
    @DELETE("employees/{id}/")
    suspend fun deleteEmployee(@Path("id") id: Int)
    
    @POST("employees/invite/")
    suspend fun inviteEmployee(@Body request: InviteEmployeeRequest): InviteEmployeeResponse
    
    @GET("employees/departments/")
    suspend fun getDepartments(): List<String>
    
    @POST("employees/{id}/terminate/")
    suspend fun terminateEmployee(
        @Path("id") id: Int,
        @Body data: Map<String, String?>
    ): Map<String, Any>
}
