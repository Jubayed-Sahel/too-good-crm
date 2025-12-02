package too.good.crm.data.repository

import too.good.crm.data.NetworkResult
import too.good.crm.data.api.ApiClient
import too.good.crm.data.model.*
import too.good.crm.data.safeApiCall

/**
 * Vendor Repository
 * Handles all vendor-related data operations
 */
class VendorRepository {
    private val apiService = ApiClient.vendorApiService
    
    /**
     * Get all vendors with optional filters
     */
    suspend fun getVendors(
        page: Int? = null,
        pageSize: Int? = 20,
        vendorType: String? = null,
        status: String? = null,
        search: String? = null,
        ordering: String? = "-created_at",
        assignedEmployee: Int? = null
    ): NetworkResult<VendorListResponse> = safeApiCall {
        apiService.getVendors(
            page = page,
            pageSize = pageSize,
            vendorType = vendorType,
            status = status,
            search = search,
            ordering = ordering,
            assignedEmployee = assignedEmployee
        )
    }
    
    /**
     * Get single vendor by ID
     */
    suspend fun getVendor(id: Int): NetworkResult<Vendor> = safeApiCall {
        apiService.getVendor(id)
    }
    
    /**
     * Create new vendor
     */
    suspend fun createVendor(vendor: CreateVendorRequest): NetworkResult<Vendor> = safeApiCall {
        apiService.createVendor(vendor)
    }
    
    /**
     * Update existing vendor
     */
    suspend fun updateVendor(
        id: Int,
        vendor: CreateVendorRequest
    ): NetworkResult<Vendor> = safeApiCall {
        apiService.updateVendor(id, vendor)
    }
    
    /**
     * Partial update vendor
     */
    suspend fun patchVendor(id: Int, updates: Map<String, Any>): NetworkResult<Vendor> = safeApiCall {
        apiService.patchVendor(id, updates)
    }
    
    /**
     * Delete vendor
     */
    suspend fun deleteVendor(id: Int): NetworkResult<Unit> = safeApiCall {
        apiService.deleteVendor(id)
    }
    
    /**
     * Get vendor statistics
     */
    suspend fun getVendorStats(
        vendorType: String? = null,
        status: String? = null
    ): NetworkResult<VendorStats> = safeApiCall {
        apiService.getVendorStats(
            vendorType = vendorType,
            status = status
        )
    }
    
    /**
     * Get vendors by type
     */
    suspend fun getVendorsByType(
        vendorType: String,
        page: Int? = null,
        pageSize: Int? = 20
    ): NetworkResult<VendorListResponse> = getVendors(
        vendorType = vendorType,
        page = page,
        pageSize = pageSize
    )
    
    /**
     * Get vendors by status
     */
    suspend fun getVendorsByStatus(
        status: String,
        page: Int? = null,
        pageSize: Int? = 20
    ): NetworkResult<VendorListResponse> = getVendors(
        status = status,
        page = page,
        pageSize = pageSize
    )
    
    /**
     * Get active vendors
     */
    suspend fun getActiveVendors(
        page: Int? = null,
        pageSize: Int? = 20
    ): NetworkResult<VendorListResponse> = getVendors(
        status = "active",
        page = page,
        pageSize = pageSize
    )
    
    /**
     * Search vendors
     */
    suspend fun searchVendors(
        query: String,
        page: Int? = null,
        pageSize: Int? = 20
    ): NetworkResult<VendorListResponse> = getVendors(
        search = query,
        page = page,
        pageSize = pageSize
    )
    
    /**
     * Get vendors assigned to an employee
     */
    suspend fun getEmployeeVendors(
        employeeId: Int,
        page: Int? = null,
        pageSize: Int? = 20
    ): NetworkResult<VendorListResponse> = getVendors(
        assignedEmployee = employeeId,
        page = page,
        pageSize = pageSize
    )
}
