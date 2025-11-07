package too.good.crm

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import too.good.crm.features.activities.ActivitiesScreen
import too.good.crm.features.analytics.AnalyticsScreen
import too.good.crm.features.client.ClientDashboardScreen
import too.good.crm.features.client.MyVendorsScreen
import too.good.crm.features.client.issues.IssuesScreen
import too.good.crm.features.client.orders.MyOrdersScreen
import too.good.crm.features.client.payment.PaymentScreen
import too.good.crm.features.customers.CustomersScreen
import too.good.crm.features.dashboard.DashboardScreen
import too.good.crm.features.deals.DealsScreen
import too.good.crm.features.leads.LeadsScreen
import too.good.crm.features.login.LoginScreen
import too.good.crm.features.sales.SalesScreen
import too.good.crm.features.settings.SettingsScreen
import too.good.crm.features.signup.SignupScreen
import too.good.crm.features.team.TeamScreen
import too.good.crm.ui.components.PrimaryButton
import too.good.crm.ui.components.SecondaryButton
import too.good.crm.ui.theme.DesignTokens

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
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
                                    navController.navigate("dashboard") {
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
                        composable("analytics") {
                            AnalyticsScreen(
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
                            IssuesScreen(
                                onNavigate = { route ->
                                    navController.navigate(route)
                                },
                                onBack = {
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
