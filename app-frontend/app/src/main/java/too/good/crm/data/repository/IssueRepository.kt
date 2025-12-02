package too.good.crm.data.repository

import android.util.Log
import too.good.crm.data.api.ApiClient
import too.good.crm.data.api.IssueApiService
import too.good.crm.data.model.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

class IssueRepository {
    private val apiService: IssueApiService = ApiClient.issueApiService

    // Customer functions
    suspend fun createIssue(
        organizationId: Int,
        title: String,
        description: String,
        priority: String,
        category: String,
        vendorId: Int? = null,
        orderId: Int? = null
    ): Result<IssueResponse> {
        return try {
            val response = apiService.createIssue(
                CreateIssueRequest(
                    organizationId = organizationId,
                    title = title,
                    description = description,
                    priority = priority,
                    category = category,
                    vendorId = vendorId,
                    orderId = orderId
                )
            )
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                // Get detailed error message
                val errorBody = response.errorBody()?.string()
                val errorMsg = when (response.code()) {
                    404 -> "Endpoint not found (404). URL: client/issues/raise/"
                    401 -> "Unauthorized (401). Please login again."
                    403 -> "Forbidden (403). Only customers can create issues."
                    400 -> "Bad request (400). $errorBody"
                    else -> "Failed to create issue (${response.code()}): ${errorBody ?: response.message()}"
                }
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Network error: ${e.message}", e))
        }
    }

    suspend fun getIssueDetails(issueId: Int): Result<Issue> {
        return try {
            val response = apiService.getIssueDetails(issueId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                val errorBody = response.errorBody()?.string()
                val errorMsg = when (response.code()) {
                    404 -> "Issue not found. It may have been deleted or you don't have access to it."
                    401 -> "Unauthorized. Please login again."
                    403 -> "Access denied. You don't have permission to view this issue."
                    500 -> "Server error. Please try again later. Details: $errorBody"
                    else -> "Failed to load issue (${response.code()}): ${errorBody ?: response.message()}"
                }
                android.util.Log.e("IssueRepository", "getIssueDetails failed: $errorMsg")
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            android.util.Log.e("IssueRepository", "getIssueDetails exception", e)
            Result.failure(Exception("Network error: ${e.message}", e))
        }
    }

    suspend fun addComment(issueId: Int, comment: String): Result<IssueResponse> {
        return try {
            val response = apiService.addComment(issueId, AddCommentRequest(comment))
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to add comment"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Customer functions
    fun getCustomerIssues(
        status: String? = null,
        priority: String? = null
    ): Flow<List<Issue>> = flow {
        try {
            Log.d("IssueRepository", "Fetching customer issues...")
            val response = apiService.getCustomerIssues(status, priority)
            if (response.isSuccessful && response.body() != null) {
                val issues = response.body()!!.results
                Log.d("IssueRepository", "Got ${issues.size} customer issues")
                emit(issues)
            } else {
                val errorMsg = "Failed to get customer issues: ${response.code()} - ${response.message()}"
                Log.e("IssueRepository", errorMsg)
                throw Exception(errorMsg)
            }
        } catch (e: Exception) {
            Log.e("IssueRepository", "Error getting customer issues", e)
            throw e
        }
    }

    // Vendor/Employee functions
    fun getAllIssues(
        status: String? = null,
        priority: String? = null,
        isClientIssue: Boolean? = null,
        customer: Int? = null
    ): Flow<List<Issue>> = flow {
        try {
            Log.d("IssueRepository", "Fetching all issues...")
            val response = apiService.getAllIssues(status, priority, isClientIssue, customer)
            if (response.isSuccessful && response.body() != null) {
                val issues = response.body()!!.results
                Log.d("IssueRepository", "Got ${issues.size} issues")
                emit(issues)
            } else {
                val errorMsg = "Failed to get issues: ${response.code()} - ${response.message()}"
                Log.e("IssueRepository", errorMsg)
                throw Exception(errorMsg)
            }
        } catch (e: Exception) {
            Log.e("IssueRepository", "Error getting issues", e)
            throw e
        }
    }
    
    /**
     * Get issues for a specific customer
     */
    suspend fun getCustomerIssues(customerId: Int): Result<List<Issue>> {
        return try {
            val response = apiService.getAllIssues(customer = customerId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.results)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get customer issues"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getIssue(issueId: Int): Result<Issue> {
        return try {
            val response = apiService.getIssue(issueId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get issue"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateIssueStatus(issueId: Int, status: String): Result<Issue> {
        return try {
            val response = apiService.updateIssueStatus(
                issueId,
                UpdateIssueStatusRequest(status)
            )
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to update status"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateIssuePriority(issueId: Int, priority: String): Result<Issue> {
        return try {
            val response = apiService.updateIssuePriority(
                issueId,
                UpdateIssuePriorityRequest(priority)
            )
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to update priority"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun assignIssue(issueId: Int, assignedToId: Int): Result<Issue> {
        return try {
            val response = apiService.assignIssue(
                issueId,
                AssignIssueRequest(assignedToId)
            )
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to assign issue"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun resolveIssue(issueId: Int, resolutionNotes: String): Result<Issue> {
        return try {
            val response = apiService.resolveIssue(
                issueId,
                ResolveIssueRequest(resolutionNotes)
            )
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to resolve issue"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun syncToLinear(issueId: Int): Result<IssueResponse> {
        return try {
            val response = apiService.syncToLinear(issueId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to sync to Linear"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteIssue(issueId: Int): Result<Unit> {
        return try {
            val response = apiService.deleteIssue(issueId)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to delete issue"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

