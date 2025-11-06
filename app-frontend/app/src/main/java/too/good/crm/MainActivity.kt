// app/src/main/java/too/good/crm/MainActivity.kt
package too.good.crm

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import too.good.crm.features.signup.SignupScreen
import too.good.crm.ui.components.PrimaryButton
import too.good.crm.ui.components.SecondaryButton
import too.good.crm.ui.theme.TooGoodCrmTheme
import too.good.crm.ui.theme.DesignTokens

import too.good.crm.features.dashboard.DashboardScreen
import too.good.crm.features.login.LoginScreen
import too.good.crm.features.leads.LeadsScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            TooGoodCrmTheme {
                val navController = rememberNavController()
                Scaffold(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(DesignTokens.Colors.Gray50)
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
            .background(DesignTokens.Colors.Gray50)
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
