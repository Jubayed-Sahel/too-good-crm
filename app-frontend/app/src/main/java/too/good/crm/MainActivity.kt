package too.good.crm

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import too.good.crm.features.dashboard.DashboardScreen
import too.good.crm.features.login.LoginScreen
import too.good.crm.features.signup.SignupScreen
import too.good.crm.ui.theme.TooGoodCrmTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            TooGoodCrmTheme {
                val navController = rememberNavController()
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
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
                                    navController.navigate("dashboard"){
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
                                    navController.navigate("dashboard"){
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
                                onDashboardItemClicked = { route ->
                                    navController.navigate(route)
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
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Button(onClick = { navController.navigate("login") }) {
            Text("Login")
        }
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = { navController.navigate("signup") }) {
            Text("Sign Up")
        }
    }
}

@Preview(showBackground = true)
@Composable
fun MainScreenPreview() {
    TooGoodCrmTheme {
        val navController = rememberNavController()
        MainScreen(navController)
    }
}
