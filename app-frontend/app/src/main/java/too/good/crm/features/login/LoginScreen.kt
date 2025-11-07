package too.good.crm.features.login

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.foundation.text.ClickableText
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.data.UserSession

@Composable
fun LoginScreen(
    onLoginClicked: () -> Unit,
    onSignUpClicked: () -> Unit
) {
    // Initialize user with both roles on login
    fun handleLogin() {
        UserSession.currentUser = UserSession.getSampleUser()
        onLoginClicked()
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
        OutlinedTextField(
            value = "",
            onValueChange = { /*TODO*/ },
            label = { Text("Email") },
            modifier = Modifier.fillMaxWidth(),
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
            value = "",
            onValueChange = { /*TODO*/ },
            label = { Text("Password") },
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier.fillMaxWidth(),
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
            onClick = { handleLogin() },
            modifier = Modifier
                .fillMaxWidth()
                .height(DesignTokens.Heights.ButtonStandard),
            shape = MaterialTheme.shapes.small,
            colors = ButtonDefaults.buttonColors(
                containerColor = DesignTokens.Colors.Primary,
                contentColor = DesignTokens.Colors.OnPrimary
            )
        ) {
            Text(
                text = "Login",
                style = MaterialTheme.typography.labelLarge,
                fontWeight = DesignTokens.Typography.FontWeightSemiBold
            )
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
