package too.good.crm.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.navigation.*
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession

/**
 * Navigation routes for the app
 * Using sealed class for type-safety
 */
sealed class Screen(val route: String) {
    object Main : Screen("main")
    object Login : Screen("login")
    object Signup : Screen("signup")
    object Dashboard : Screen("dashboard")
    object ClientDashboard : Screen("client-dashboard")
    
    // Feature screens
    object Leads : Screen("leads")
    object Customers : Screen("customers")
    object Deals : Screen("deals")
    object Sales : Screen("sales")
    object Activities : Screen("activities")
    object Analytics : Screen("analytics")
    object Messages : Screen("messages")
    object Settings : Screen("settings")
    object Team : Screen("team")
    object Employees : Screen("employees")
    
    // Employee detail screens
    object EmployeeDetail : Screen("employee-detail/{employeeId}") {
        fun createRoute(employeeId: String) = "employee-detail/$employeeId"
    }
    object EmployeeEdit : Screen("employee-edit/{employeeId}") {
        fun createRoute(employeeId: String) = "employee-edit/$employeeId"
    }
    
    // Issue tracking screens
    object VendorIssues : Screen("vendor-issues")
    object VendorIssueDetail : Screen("vendor-issue-detail/{issueId}") {
        fun createRoute(issueId: Int) = "vendor-issue-detail/$issueId"
    }
    object CustomerIssues : Screen("issues")
    object CustomerIssueDetail : Screen("issue-detail/{issueId}") {
        fun createRoute(issueId: Int) = "issue-detail/$issueId"
    }
    object CreateIssue : Screen("create-issue")
    
    // Client screens
    object MyVendors : Screen("my-vendors")
    object MyOrders : Screen("my-orders")
    object Payments : Screen("payments")
}

/**
 * Navigation arguments helper
 */
object NavArgs {
    const val EMPLOYEE_ID = "employeeId"
    const val ISSUE_ID = "issueId"
}

/**
 * Extension functions for type-safe navigation
 */
fun NavController.navigateToEmployeeDetail(employeeId: String) {
    navigate(Screen.EmployeeDetail.createRoute(employeeId))
}

fun NavController.navigateToEmployeeEdit(employeeId: String) {
    navigate(Screen.EmployeeEdit.createRoute(employeeId))
}

fun NavController.navigateToVendorIssueDetail(issueId: Int) {
    navigate(Screen.VendorIssueDetail.createRoute(issueId))
}

fun NavController.navigateToCustomerIssueDetail(issueId: Int) {
    navigate(Screen.CustomerIssueDetail.createRoute(issueId))
}

/**
 * Navigate to appropriate dashboard based on user mode
 */
fun NavController.navigateToDashboard() {
    val destination = if (UserSession.activeMode == ActiveMode.CLIENT) {
        Screen.ClientDashboard.route
    } else {
        Screen.Dashboard.route
    }
    navigate(destination) {
        popUpTo(Screen.Main.route) { inclusive = true }
    }
}

/**
 * Navigate back with proper handling
 */
fun NavController.navigateBack() {
    if (!popBackStack()) {
        // If can't pop back, navigate to main dashboard
        navigateToDashboard()
    }
}

/**
 * Clear navigation stack and navigate to destination
 */
fun NavController.navigateAndClearStack(route: String) {
    navigate(route) {
        popUpTo(0) { inclusive = true }
    }
}

/**
 * Navigation helper for common patterns
 */
object NavigationHelper {
    /**
     * Get start destination based on login state
     */
    fun getStartDestination(isLoggedIn: Boolean): String {
        return if (isLoggedIn) {
            if (UserSession.activeMode == ActiveMode.CLIENT) {
                Screen.ClientDashboard.route
            } else {
                Screen.Dashboard.route
            }
        } else {
            Screen.Main.route
        }
    }
    
    /**
     * Check if route requires authentication
     */
    fun requiresAuth(route: String?): Boolean {
        return route != null && route !in listOf(
            Screen.Main.route,
            Screen.Login.route,
            Screen.Signup.route
        )
    }
}

/**
 * Navigation graph builder with type-safety
 */
@Composable
fun rememberAppNavController(): NavHostController {
    return rememberNavController()
}

/**
 * Deep link helper
 */
object DeepLinks {
    private const val DOMAIN = "toogoodcrm://app"
    
    fun employeeDetail(employeeId: String) = "$DOMAIN/employee/$employeeId"
    fun issueDetail(issueId: Int) = "$DOMAIN/issue/$issueId"
    fun customerDetail(customerId: String) = "$DOMAIN/customer/$customerId"
}

