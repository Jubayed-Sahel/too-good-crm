package too.good.crm.data.api

import retrofit2.Response
import retrofit2.http.*
import too.good.crm.data.model.*

interface IssueApiService {

    // Customer endpoints
    @POST("client/issues/raise/")
    suspend fun createIssue(
        @Body request: CreateIssueRequest
    ): Response<IssueResponse>

    @GET("client/issues/{issueId}/")
    suspend fun getIssueDetails(
        @Path("issueId") issueId: Int
    ): Response<Issue>

    @POST("client/issues/{issueId}/comment/")
    suspend fun addComment(
        @Path("issueId") issueId: Int,
        @Body request: AddCommentRequest
    ): Response<IssueResponse>

    // Vendor/Employee endpoints
    @GET("issues/")
    suspend fun getAllIssues(
        @Query("status") status: String? = null,
        @Query("priority") priority: String? = null,
        @Query("is_client_issue") isClientIssue: Boolean? = null
    ): Response<IssuesListResponse>

    @GET("issues/{issueId}/")
    suspend fun getIssue(
        @Path("issueId") issueId: Int
    ): Response<Issue>

    @PATCH("issues/{issueId}/")
    suspend fun updateIssueStatus(
        @Path("issueId") issueId: Int,
        @Body request: UpdateIssueStatusRequest
    ): Response<Issue>

    @PATCH("issues/{issueId}/")
    suspend fun updateIssuePriority(
        @Path("issueId") issueId: Int,
        @Body request: UpdateIssuePriorityRequest
    ): Response<Issue>

    @PATCH("issues/{issueId}/")
    suspend fun assignIssue(
        @Path("issueId") issueId: Int,
        @Body request: AssignIssueRequest
    ): Response<Issue>

    @POST("issues/resolve/{issueId}/")
    suspend fun resolveIssue(
        @Path("issueId") issueId: Int,
        @Body request: ResolveIssueRequest
    ): Response<Issue>
}

