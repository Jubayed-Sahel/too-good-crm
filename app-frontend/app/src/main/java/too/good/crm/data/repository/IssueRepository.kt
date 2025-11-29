package too.good.crm.data.repository

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
                Result.failure(Exception(response.message() ?: "Failed to create issue"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getIssueDetails(issueId: Int): Result<Issue> {
        return try {
            val response = apiService.getIssueDetails(issueId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get issue"))
            }
        } catch (e: Exception) {
            Result.failure(e)
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

    // Vendor/Employee functions
    fun getAllIssues(
        status: String? = null,
        priority: String? = null,
        isClientIssue: Boolean? = null,
        customer: Int? = null
    ): Flow<List<Issue>> = flow {
        try {
            val response = apiService.getAllIssues(status, priority, isClientIssue, customer)
            if (response.isSuccessful && response.body() != null) {
                emit(response.body()!!.results)
            } else {
                emit(emptyList())
            }
        } catch (e: Exception) {
            emit(emptyList())
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
}

