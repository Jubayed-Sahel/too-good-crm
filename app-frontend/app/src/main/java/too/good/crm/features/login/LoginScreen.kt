package too.good.crm.features.login

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.foundation.text.ClickableText
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.data.repository.AuthRepository

@Composable
fun LoginScreen(
    onLoginClicked: () -> Unit,
    onSignUpClicked: () -> Unit
) {
    val context = LocalContext.current
    val viewModel = remember { LoginViewModel(AuthRepository(context)) }
    
    val uiState by viewModel.uiState.collectAsState()
    val username by viewModel.username.collectAsState()
    val password by viewModel.password.collectAsState()

    LaunchedEffect(uiState) {
        if (uiState is LoginUiState.Success) {
            onLoginClicked()
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(DesignTokens.Spacing.Space6),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Welcome Back",
                style = MaterialTheme.typography.headlineLarge,
                color = DesignTokens.Colors.Primary
            )
            Text(
                text = "Sign in to continue",
                style = MaterialTheme.typography.bodyMedium,
                color = DesignTokens.Colors.OnSurfaceVariant
            )
            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space12))
            Text(
                text = "Login",
                style = MaterialTheme.typography.headlineMedium,
                color = DesignTokens.Colors.OnSurface
            )
            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space8))

            // Show error message
            if (uiState is LoginUiState.Error) {
                Text(
                    text = (uiState as LoginUiState.Error).message,
                    color = DesignTokens.Colors.Error,
                    style = MaterialTheme.typography.bodyMedium,
                    modifier = Modifier.padding(bottom = DesignTokens.Spacing.Space3)
                )
            }

            OutlinedTextField(
                value = username,
                onValueChange = { viewModel.onUsernameChange(it) },
                label = { Text("Username or Email") },
                modifier = Modifier.fillMaxWidth(),
                enabled = uiState !is LoginUiState.Loading,
                shape = MaterialTheme.shapes.small,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = DesignTokens.Colors.Primary,
                    unfocusedBorderColor = DesignTokens.Colors.Outline,
                    focusedLabelColor = DesignTokens.Colors.Primary,
                    unfocusedLabelColor = DesignTokens.Colors.OnSurfaceVariant,
                    cursorColor = DesignTokens.Colors.Primary
                )
            )
            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space3))
            OutlinedTextField(
                value = password,
                onValueChange = { viewModel.onPasswordChange(it) },
                label = { Text("Password") },
                visualTransformation = PasswordVisualTransformation(),
                modifier = Modifier.fillMaxWidth(),
                enabled = uiState !is LoginUiState.Loading,
                shape = MaterialTheme.shapes.small,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = DesignTokens.Colors.Primary,
                    unfocusedBorderColor = DesignTokens.Colors.Outline,
                    focusedLabelColor = DesignTokens.Colors.Primary,
                    unfocusedLabelColor = DesignTokens.Colors.OnSurfaceVariant,
                    cursorColor = DesignTokens.Colors.Primary
                )
            )
            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space6))
            Button(
                onClick = { viewModel.login(onLoginClicked) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(DesignTokens.Heights.ButtonStandard),
                enabled = uiState !is LoginUiState.Loading,
                shape = MaterialTheme.shapes.small,
                colors = ButtonDefaults.buttonColors(
                    containerColor = DesignTokens.Colors.Primary,
                    contentColor = DesignTokens.Colors.OnPrimary
                )
            ) {
                if (uiState is LoginUiState.Loading) {
                    CircularProgressIndicator(
                        color = DesignTokens.Colors.OnPrimary,
                        modifier = Modifier.height(DesignTokens.Spacing.Space6)
                    )
                } else {
                    Text(
                        text = "Login",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = DesignTokens.Typography.FontWeightSemiBold
                    )
                }
            }
            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space6))

            ClickableText(
                text = AnnotatedString("Don't have an account? Sign Up"),
                onClick = { onSignUpClicked() },
                style = MaterialTheme.typography.bodyMedium.copy(
                    color = DesignTokens.Colors.Primary,
                    textAlign = TextAlign.Center
                )
            )
        }
    }
}
