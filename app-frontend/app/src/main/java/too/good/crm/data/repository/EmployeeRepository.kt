package too.good.crm.data.repository

import android.content.Context
import android.util.Log
import too.good.crm.data.api.ApiClient
import too.good.crm.data.models.Employee
import too.good.crm.data.models.InviteEmployeeRequest
import too.good.crm.data.models.InviteEmployeeResponse
import too.good.crm.data.models.UpdateEmployeeRequest

/**
 * Repository for Employee-related API operations
 * Handles employee management, invitations, and updates
 */
class EmployeeRepository(context: Context) {
    
    private val employeeService = ApiClient.employeeApiService
    
    companion object {
        private const val TAG = "EmployeeRepository"
    }
    
    /**
     * Get all employees
     * GET /api/employees/
     */
    suspend fun getEmployees(
        organizationId: Int? = null,
        status: String? = null,
        department: String? = null,
        search: String? = null
    ): Result<List<Employee>> {
        return try {
            Log.d(TAG, "Fetching employees - org: $organizationId, status: $status, dept: $department, search: $search")
            
            val response = employeeService.getEmployees(
                organization = organizationId,
                status = status,
                department = department,
                search = search
            )
            
            // Extract employees from paginated response
            val employees = response.results
            Log.d(TAG, "Successfully fetched ${employees.size} employees (total: ${response.count})")
            Result.success(employees)
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching employees", e)
            Result.failure(e)
        }
    }
    
    /**
     * Get single employee by ID
     * GET /api/employees/{id}/
     */
    suspend fun getEmployee(id: Int): Result<Employee> {
        return try {
            Log.d(TAG, "Fetching employee: $id")
            val employee = employeeService.getEmployee(id)
            Log.d(TAG, "Successfully fetched employee: ${employee.fullName}")
            Result.success(employee)
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching employee $id", e)
            Result.failure(e)
        }
    }
    
    /**
     * Invite new employee
     * POST /api/employees/invite/
     */
    suspend fun inviteEmployee(
        email: String,
        firstName: String,
        lastName: String,
        phone: String? = null,
        department: String? = null,
        jobTitle: String? = null,
        roleId: Int? = null
    ): Result<InviteEmployeeResponse> {
        return try {
            Log.d(TAG, "Inviting employee: $email")
            
            val request = InviteEmployeeRequest(
                email = email,
                firstName = firstName,
                lastName = lastName,
                phone = phone,
                department = department,
                jobTitle = jobTitle,
                roleId = roleId
            )
            
            val response = employeeService.inviteEmployee(request)
            Log.d(TAG, "Successfully invited employee: $email")
            Result.success(response)
        } catch (e: Exception) {
            Log.e(TAG, "Error inviting employee", e)
            Result.failure(e)
        }
    }
    
    /**
     * Update employee
     * PATCH /api/employees/{id}/
     */
    suspend fun updateEmployee(
        id: Int,
        firstName: String? = null,
        lastName: String? = null,
        email: String? = null,
        phone: String? = null,
        department: String? = null,
        jobTitle: String? = null,
        role: Int? = null,
        employmentType: String? = null,
        status: String? = null
    ): Result<Employee> {
        return try {
            Log.d(TAG, "Updating employee: $id")
            
            val request = UpdateEmployeeRequest(
                firstName = firstName,
                lastName = lastName,
                email = email,
                phone = phone,
                department = department,
                jobTitle = jobTitle,
                role = role,
                employmentType = employmentType,
                status = status
            )
            
            val employee = employeeService.updateEmployee(id, request)
            Log.d(TAG, "Successfully updated employee: $id")
            Result.success(employee)
        } catch (e: Exception) {
            Log.e(TAG, "Error updating employee $id", e)
            Result.failure(e)
        }
    }
    
    /**
     * Delete employee
     * DELETE /api/employees/{id}/
     */
    suspend fun deleteEmployee(id: Int): Result<Unit> {
        return try {
            Log.d(TAG, "Deleting employee: $id")
            employeeService.deleteEmployee(id)
            Log.d(TAG, "Successfully deleted employee: $id")
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e(TAG, "Error deleting employee $id", e)
            Result.failure(e)
        }
    }
    
    /**
     * Get list of departments
     * GET /api/employees/departments/
     */
    suspend fun getDepartments(): Result<List<String>> {
        return try {
            Log.d(TAG, "Fetching departments")
            val departments = employeeService.getDepartments()
            Log.d(TAG, "Successfully fetched ${departments.size} departments")
            Result.success(departments)
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching departments", e)
            Result.failure(e)
        }
    }
    
    /**
     * Terminate employee
     * POST /api/employees/{id}/terminate/
     */
    suspend fun terminateEmployee(
        id: Int,
        terminationDate: String? = null,
        reason: String? = null
    ): Result<Map<String, Any>> {
        return try {
            Log.d(TAG, "Terminating employee: $id")
            
            val data = mutableMapOf<String, String?>()
            terminationDate?.let { data["termination_date"] = it }
            reason?.let { data["reason"] = it }
            
            val response = employeeService.terminateEmployee(id, data)
            Log.d(TAG, "Successfully terminated employee: $id")
            Result.success(response)
        } catch (e: Exception) {
            Log.e(TAG, "Error terminating employee $id", e)
            Result.failure(e)
        }
    }
}

