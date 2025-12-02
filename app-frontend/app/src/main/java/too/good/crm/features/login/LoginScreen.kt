package too.good.crm.features.login

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.foundation.text.ClickableText
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.data.repository.AuthRepository
import too.good.crm.data.BackendUrlManager
import too.good.crm.data.api.ApiClient
import android.widget.Toast

@Composable
fun LoginScreen(
    onLoginClicked: () -> Unit,
    onSignUpClicked: () -> Unit
) {
    val context = LocalContext.current
    val viewModel = remember { LoginViewModel(AuthRepository(context), context) }

    val uiState by viewModel.uiState.collectAsState()
    val username by viewModel.username.collectAsState()
    val password by viewModel.password.collectAsState()

    var showBackendUrlDialog by remember { mutableStateOf(false) }
    val currentBackendUrl = remember { 
        mutableStateOf(BackendUrlManager.getBackendUrl(context))
    }

    LaunchedEffect(uiState) {
        if (uiState is LoginUiState.Success) {
            onLoginClicked()
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        // Settings icon in top-right corner
        IconButton(
            onClick = { showBackendUrlDialog = true },
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(16.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Settings,
                contentDescription = "Backend Settings",
                tint = DesignTokens.Colors.OnSurfaceVariant,
                modifier = Modifier.size(24.dp)
            )
        }
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
                        style = MaterialTheme.typography.labelMedium,
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

        // Backend URL Configuration Dialog
        if (showBackendUrlDialog) {
            BackendUrlDialog(
                currentUrl = currentBackendUrl.value,
                onDismiss = { showBackendUrlDialog = false },
                onSave = { newUrl ->
                    BackendUrlManager.setBackendUrl(context, newUrl)
                    currentBackendUrl.value = BackendUrlManager.getBackendUrl(context)
                    // Rebuild Retrofit with new URL
                    ApiClient.rebuildRetrofit()
                    showBackendUrlDialog = false
                    Toast.makeText(
                        context,
                        "Backend URL updated successfully",
                        Toast.LENGTH_SHORT
                    ).show()
                },
                onReset = {
                    BackendUrlManager.resetToDefault(context)
                    currentBackendUrl.value = BackendUrlManager.getBackendUrl(context)
                    ApiClient.rebuildRetrofit()
                    showBackendUrlDialog = false
                    Toast.makeText(
                        context,
                        "Backend URL reset to default",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            )
        }
    }
}

@Composable
fun BackendUrlDialog(
    currentUrl: String,
    onDismiss: () -> Unit,
    onSave: (String) -> Unit,
    onReset: () -> Unit
) {
    val context = LocalContext.current
    var urlText by remember { 
        mutableStateOf(
            currentUrl.replace("http://", "").replace("/api/", "").replace("/api", "")
        ) 
    }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { 
            Text(
                "Configure Backend URL",
                style = MaterialTheme.typography.titleLarge
            ) 
        },
        text = {
            Column {
                Text(
                    "Enter your backend server IP and port:",
                    style = MaterialTheme.typography.bodyMedium,
                    modifier = Modifier.padding(bottom = 8.dp),
                    color = DesignTokens.Colors.OnSurfaceVariant
                )
                OutlinedTextField(
                    value = urlText,
                    onValueChange = {
                        urlText = it
                        errorMessage = null
                    },
                    label = { Text("Backend URL (e.g., 192.168.1.100:8000)") },
                    placeholder = { Text("192.168.1.100:8000") },
                    modifier = Modifier.fillMaxWidth(),
                    isError = errorMessage != null,
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = DesignTokens.Colors.Primary,
                        unfocusedBorderColor = DesignTokens.Colors.Outline,
                        errorBorderColor = DesignTokens.Colors.Error
                    )
                )
                errorMessage?.let {
                    Text(
                        it,
                        color = DesignTokens.Colors.Error,
                        style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    "Current: $currentUrl",
                    style = MaterialTheme.typography.bodySmall,
                    color = DesignTokens.Colors.OnSurfaceVariant,
                    fontSize = 11.sp
                )
                if (BackendUrlManager.isUsingCustomUrl(context)) {
                    Text(
                        "Default: ${BackendUrlManager.getDefaultUrl()}",
                        style = MaterialTheme.typography.bodySmall,
                        color = DesignTokens.Colors.OnSurfaceVariant,
                        fontSize = 10.sp,
                        modifier = Modifier.padding(top = 2.dp)
                    )
                }
            }
        },
        confirmButton = {
            Row {
                TextButton(onClick = onReset) {
                    Text("Reset to Default")
                }
                Spacer(modifier = Modifier.width(8.dp))
                Button(
                    onClick = {
                        if (urlText.isNotBlank()) {
                            val normalized = urlText.trim()
                            if (BackendUrlManager.isValidUrl(normalized)) {
                                errorMessage = null
                                onSave(normalized)
                            } else {
                                errorMessage = "Invalid URL format. Example: 192.168.1.100:8000"
                            }
                        } else {
                            errorMessage = "URL cannot be empty"
                        }
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = DesignTokens.Colors.Primary
                    )
                ) {
                    Text("Save")
                }
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
