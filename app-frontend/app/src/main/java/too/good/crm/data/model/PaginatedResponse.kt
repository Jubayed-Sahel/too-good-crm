package too.good.crm.data.model

import com.google.gson.annotations.SerializedName

/**
 * Paginated response wrapper for Django REST Framework pagination
 * Backend uses StandardResultsSetPagination which returns:
 * {
 *   "count": 50,
 *   "next": "http://.../api/customers/?page=2",
 *   "previous": null,
 *   "results": [...]
 * }
 */
data class PaginatedResponse<T>(
    val count: Int = 0,
    val next: String? = null,
    val previous: String? = null,
    val results: List<T> = emptyList()
)

