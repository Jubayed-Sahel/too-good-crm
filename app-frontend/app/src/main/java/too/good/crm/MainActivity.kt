package too.good.crm

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession
import too.good.crm.features.activities.ActivitiesScreen
import too.good.crm.features.client.ClientDashboardScreen
import too.good.crm.features.client.MyVendorsScreen
import too.good.crm.features.client.orders.MyOrdersScreen
import too.good.crm.features.client.payment.PaymentScreen
import too.good.crm.features.issues.ui.VendorIssuesListScreen
import too.good.crm.features.issues.ui.VendorIssueDetailScreen
import too.good.crm.features.issues.ui.CustomerIssuesListScreen
import too.good.crm.features.issues.ui.CustomerIssueDetailScreen
import too.good.crm.features.issues.ui.CustomerCreateIssueScreen
import too.good.crm.features.customers.CustomersScreen
import too.good.crm.features.customers.CustomerDetailScreen
import too.good.crm.features.customers.CustomersScreen
import too.good.crm.features.customers.CustomerDetailScreen
import too.good.crm.features.customers.CustomerEditScreen
import too.good.crm.features.dashboard.DashboardScreen
import too.good.crm.features.deals.DealsScreen
import too.good.crm.features.deals.DealDetailScreen
import too.good.crm.features.deals.DealEditScreen
import too.good.crm.features.leads.LeadsScreen
import too.good.crm.features.leads.LeadDetailScreen
import too.good.crm.features.leads.LeadEditScreen
import too.good.crm.features.login.LoginScreen
import too.good.crm.features.sales.SalesScreen
import too.good.crm.features.settings.SettingsScreen
import too.good.crm.features.signup.SignupScreen
import too.good.crm.features.team.TeamScreen
import too.good.crm.ui.components.PrimaryButton
import too.good.crm.ui.components.SecondaryButton
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.ui.video.VideoCallManager
import too.good.crm.ui.video.VideoCallHelper
import android.widget.Toast

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize VideoCallHelper for global access
        VideoCallHelper.initialize()
        
        // Initialize API client session (load saved token if exists)
        val authRepository = too.good.crm.data.repository.AuthRepository(this)
        authRepository.initializeSession()
        
        // Removed enableEdgeToEdge() as it can interfere with keyboard input
        setContent {
            MaterialTheme(
                colorScheme = lightColorScheme(
                    primary = DesignTokens.Colors.Primary,
                    onPrimary = DesignTokens.Colors.OnPrimary,
                    primaryContainer = DesignTokens.Colors.PrimaryContainer,
                    onPrimaryContainer = DesignTokens.Colors.Primary,
                    secondary = DesignTokens.Colors.Secondary,
                    onSecondary = DesignTokens.Colors.OnSecondary,
                    secondaryContainer = DesignTokens.Colors.SecondaryContainer,
                    onSecondaryContainer = DesignTokens.Colors.Secondary,
                    error = DesignTokens.Colors.Error,
                    onError = DesignTokens.Colors.White,
                    errorContainer = DesignTokens.Colors.ErrorLight,
                    onErrorContainer = DesignTokens.Colors.ErrorDark,
                    background = DesignTokens.Colors.Background,
                    onBackground = DesignTokens.Colors.OnSurface,
                    surface = DesignTokens.Colors.Surface,
                    onSurface = DesignTokens.Colors.OnSurface,
                    surfaceVariant = DesignTokens.Colors.SurfaceVariant,
                    onSurfaceVariant = DesignTokens.Colors.OnSurfaceVariant,
                    outline = DesignTokens.Colors.Outline,
                    outlineVariant = DesignTokens.Colors.OutlineVariant,
                    surfaceTint = DesignTokens.Colors.SurfaceTint
                )
            ) {
                val navController = rememberNavController()
                val context = androidx.compose.ui.platform.LocalContext.current
                
                // Observe user session state for reactive updates
                val currentProfile by UserSession.currentProfileState
                val isAuthenticated = currentProfile != null
                val currentUserId = currentProfile?.id
                
                // Video Call Manager - runs globally
                android.util.Log.d("MainActivity", "VideoCallManager - isAuthenticated: $isAuthenticated, userId: $currentUserId, profile: ${currentProfile?.name}")
                VideoCallManager(
                    isAuthenticated = isAuthenticated,
                    currentUserId = currentUserId,
                    onShowToast = { message ->
                        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
                    }
                )
                
                Scaffold(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(DesignTokens.Colors.Background)
                ) { innerPadding ->
                    NavHost(
                        navController = navController,
                        startDestination = "main",
                        modifier = Modifier.padding(innerPadding)
                    ) {
                        composable("main") {
                            MainScreen(navController = navController)
                        }
                        composable("login") {
                            LoginScreen(
                                onLoginClicked = {
                                    // Navigate to appropriate dashboard based on user role
                                    val destination = if (UserSession.activeMode == ActiveMode.CLIENT) {
                                        "client-dashboard"
                                    } else {
                                        "dashboard"
                                    }
                                    navController.navigate(destination) {
                                        popUpTo("main") { inclusive = true }
                                    }
                                },
                                onSignUpClicked = {
                                    navController.navigate("signup")
                                }
                            )
                        }
                        composable("signup") {
                            SignupScreen(
                                onSignUpClicked = {
                                    navController.navigate("dashboard") {
                                        popUpTo("main") { inclusive = true }
                                    }
                                },
                                onLoginClicked = {
                                    navController.popBackStack()
                                }
                            )
                        }
                        composable("dashboard") {
                            DashboardScreen(
                                onLogoutClicked = {
                                    navController.navigate("main") {
                                        popUpTo("dashboard") { inclusive = true }
                                    }
                                },
                                onNavigate = { route ->
                                    println("🔵 MainActivity: Navigating to: $route")
                                    navController.navigate(route)
                                }
                            )
                        }
                        composable("leads") {
                            println("🟢 MainActivity: Leads route composing")
                            LeadsScreen(
                                onNavigate = { route ->
                                    navController.navigate(route)
                                },
                                onBack = {
                                    navController.popBackStack()
                                }
                            )
                        }
                        composable("lead-detail/{leadId}") { backStackEntry ->
                            val leadId = backStackEntry.arguments?.getString("leadId") ?: ""
                            LeadDetailScreen(
                                leadId = leadId,
                                onBack = {
                                    navController.popBackStack()
                                },
                                onEdit = {
                                    navController.navigate("lead-edit/$leadId")
                                },
                                onNavigate = { route ->
                                    navController.navigate(route)
                                }
                            )
                        }
                        composable("lead-edit/{leadId}") { backStackEntry ->
                            val leadId = backStackEntry.arguments?.getString("leadId") ?: ""
                            LeadEditScreen(
                                leadId = leadId,
                                onBack = {
                                    navController.popBackStack()
                                },
                                onNavigate = { route ->
                                    navController.navigate(route)
                                }
                            )
                        }
                        composable("customers") {
                            CustomersScreen(
                                onNavigate = { route ->
                                    navController.navigate(route)
                                },
                                onBack = {
                                    navController.popBackStack()
                                }
                            )
                        }
                        composable("customer-detail/{customerId}") { backStackEntry ->
                            val customerId = backStackEntry.arguments?.getString("customerId") ?: ""
                            CustomerDetailScreen(
                                customerId = customerId,
                                onBack = {
                                    navController.popBackStack()
                                },
                                onEdit = {
                                    navController.navigate("customer-edit/$customerId")
                                },
                                onNavigate = { route ->
                                    navController.navigate(route)
                                }
                            )
                        }
                        composable("customer-edit/{customerId}") { backStackEntry ->
                            val customerId = backStackEntry.arguments?.getString("customerId") ?: ""
                            CustomerEditScreen(
                                customerId = customerId,
                                onBack = {
                                    navController.popBackStack()
                                },
                                onNavigate = { route ->
                                    navController.navigate(route)
                                }
                            )
                        }
                        composable("deals") {
                            DealsScreen(
                                onNavigate = { route ->
                                    navController.navigate(route)
                                },
                                onBack = {
                                    navController.popBackStack()
                                }
                            )
                        }
                        composable("deal-detail/{dealId}") { backStackEntry ->
                            val dealId = backStackEntry.arguments?.getString("dealId")?.toIntOrNull() ?: 0
                            DealDetailScreen(
                                dealId = dealId,
                                onNavigate = { route ->
                                    navController.navigate(route)
                                },
                                onBack = {
                                    navController.popBackStack()
                                }
                            )
                        }
                        composable("deal-edit/{dealId}") { backStackEntry ->
                            val dealId = backStackEntry.arguments?.getString("dealId")?.toIntOrNull() ?: 0
                            DealEditScreen(
                                dealId = dealId,
                                onNavigate = { route ->
                                    navController.navigate(route)
                                },
                                onBack = {
                                    navController.popBackStack()
                                }
                            )
                        }
                        composable("sales") {
                            SalesScreen(
                                onNavigate = { route ->
                                    navController.navigate(route)
                                },
                                onBack = {
                                    navController.popBackStack()
                                }
                            )
                        }
                        composable("activities") {
                            ActivitiesScreen(
                                onNavigate = { route ->
                                    navController.navigate(route)
                                },
                                onBack = {
                                    navController.popBackStack()
                                }
                            )
                        }
                        composable("messages") {
                            too.good.crm.features.messages.MessagesScreen(
                                onNavigate = { route ->
                                    navController.navigate(route)
                                },
                                onBack = {
                                    navController.popBackStack()
                                }
                            )
                        }
                        composable("settings") {
                            SettingsScreen(
                                onNavigate = { route ->
                                    navController.navigate(route)
                                },
                                onBack = {
                                    navController.popBackStack()
                                }
                            )
                        }
                        composable("team") {
                            TeamScreen(
                                onNavigate = { route ->
                                    navController.navigate(route)
                                },
                                onBack = {
                                    navController.popBackStack()
                                }
                            )
                        }
                        composable("employees") {
                            too.good.crm.features.employees.EmployeesScreen(
                                onNavigate = { route ->
                                    navController.navigate(route)
                                },
                                onBack = {
                                    navController.popBackStack()
                                }
                            )
                        }
                        composable("employee-detail/{employeeId}") { backStackEntry ->
                            val employeeId = backStackEntry.arguments?.getString("employeeId") ?: "0"
                            too.good.crm.features.employees.EmployeeDetailScreen(
                                employeeId = employeeId,
                                onNavigate = { route ->
                                    navController.navigate(route)
                                },
                                onBack = {
                                    navController.popBackStack()
                                }
                            )
                        }
                        composable("employee-edit/{employeeId}") { backStackEntry ->
                            val employeeId = backStackEntry.arguments?.getString("employeeId") ?: "0"
                            too.good.crm.features.employees.EmployeeEditScreen(
                                employeeId = employeeId,
                                onNavigate = { route ->
                                    navController.navigate(route)
                                },
                                onBack = {
                                    navController.popBackStack()
                                }
                            )
                        }
                        composable("vendor-issues") {
                            VendorIssuesListScreen(
                                onNavigateToDetail = { issueId ->
                                    navController.navigate("vendor-issue-detail/$issueId")
                                },
                                onNavigateBack = {
                                    navController.popBackStack()
                                }
                            )
                        }
                        composable("vendor-issue-detail/{issueId}") { backStackEntry ->
                            val issueId = backStackEntry.arguments?.getString("issueId")?.toIntOrNull() ?: 0
                            VendorIssueDetailScreen(
                                issueId = issueId,
                                onNavigateBack = {
                                    navController.popBackStack()
                                },
                                onOpenLinear = { linearUrl ->
                                    // TODO: Open Linear URL in browser
                                }
                            )
                        }
                        composable("client-dashboard") {
                            ClientDashboardScreen(
                                onLogoutClicked = {
                                    navController.navigate("main") {
                                        popUpTo("client-dashboard") { inclusive = true }
                                    }
                                },
                                onNavigate = { route ->
                                    navController.navigate(route)
                                }
                            )
                        }
                        composable("my-vendors") {
                            MyVendorsScreen(
                                onNavigate = { route ->
                                    navController.navigate(route)
                                },
                                onBack = {
                                    navController.popBackStack()
                                }
                            )
                        }
                        composable("my-orders") {
                            MyOrdersScreen(
                                onNavigate = { route ->
                                    navController.navigate(route)
                                },
                                onBack = {
                                    navController.popBackStack()
                                }
                            )
                        }
                        composable("payments") {
                            PaymentScreen(
                                onNavigate = { route ->
                                    navController.navigate(route)
                                },
                                onBack = {
                                    navController.popBackStack()
                                }
                            )
                        }
                        composable("issues") {
                            CustomerIssuesListScreen(
                                organizationId = 1, // TODO: Get from user session
                                onNavigateToCreate = {
                                    navController.navigate("create-issue")
                                },
                                onNavigateToDetail = { issueId ->
                                    navController.navigate("issue-detail/$issueId")
                                },
                                onNavigateBack = {
                                    navController.popBackStack()
                                }
                            )
                        }
                        composable("issue-detail/{issueId}") { backStackEntry ->
                            val issueId = backStackEntry.arguments?.getString("issueId")?.toIntOrNull() ?: 0
                            CustomerIssueDetailScreen(
                                issueId = issueId,
                                onNavigateBack = {
                                    navController.popBackStack()
                                },
                                onOpenLinear = { linearUrl ->
                                    // TODO: Open Linear URL in browser
                                }
                            )
                        }
                        composable("create-issue") {
                            CustomerCreateIssueScreen(
                                organizationId = 1, // TODO: Get from user session
                                onNavigateBack = {
                                    navController.popBackStack()
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun MainScreen(navController: NavController) {
    val context = androidx.compose.ui.platform.LocalContext.current
    val authRepository = remember { too.good.crm.data.repository.AuthRepository(context) }
    
    // Check if user is already logged in
    LaunchedEffect(Unit) {
        if (authRepository.isLoggedIn()) {
            // User is logged in, navigate to dashboard
            val destination = if (UserSession.activeMode == ActiveMode.CLIENT) {
                "client-dashboard"
            } else {
                "dashboard"
            }
            navController.navigate(destination) {
                popUpTo("main") { inclusive = true }
            }
        }
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DesignTokens.Colors.Background)
            .padding(DesignTokens.Spacing.Space6),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        PrimaryButton(
            text = "Login",
            onClick = { navController.navigate("login") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space4))
        SecondaryButton(
            text = "Sign Up",
            onClick = { navController.navigate("signup") },
            modifier = Modifier.fillMaxWidth()
        )
    }
}
