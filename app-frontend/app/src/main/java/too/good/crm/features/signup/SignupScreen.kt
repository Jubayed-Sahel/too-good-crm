package too.good.crm.features.signup

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
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.foundation.layout.Row
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.foundation.text.ClickableText
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.style.TextAlign
import too.good.crm.ui.theme.DesignTokens

@Composable
fun SignupScreen(
    onSignUpClicked: () -> Unit,
    onLoginClicked: () -> Unit,
) {
    var username by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var confirmPasswordVisible by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(DesignTokens.Spacing.Space6),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Create Account",
            style = MaterialTheme.typography.headlineMedium,
            color = DesignTokens.Colors.OnSurface,
            modifier = Modifier.padding(vertical = DesignTokens.Spacing.Space4)
        )
        Text(
            text = "Sign up to get started with LeadGrid",
            style = MaterialTheme.typography.bodyLarge,
            color = DesignTokens.Colors.OnSurfaceVariant,
            modifier = Modifier.padding(bottom = DesignTokens.Spacing.Space6)
        )

        OutlinedTextField(
            value = username,
            onValueChange = { username = it },
            label = { Text("Username") },
            modifier = Modifier.fillMaxWidth(),
            shape = MaterialTheme.shapes.small,
            singleLine = true,
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
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") },
            modifier = Modifier.fillMaxWidth(),
            shape = MaterialTheme.shapes.small,
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = DesignTokens.Colors.Primary,
                unfocusedBorderColor = DesignTokens.Colors.Outline,
                focusedLabelColor = DesignTokens.Colors.Primary,
                unfocusedLabelColor = DesignTokens.Colors.OnSurfaceVariant,
                cursorColor = DesignTokens.Colors.Primary
            )
        )
        Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space3))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
        ) {
            OutlinedTextField(
                value = firstName,
                onValueChange = { firstName = it },
                label = { Text("First Name") },
                modifier = Modifier.weight(1f),
                shape = MaterialTheme.shapes.small,
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = DesignTokens.Colors.Primary,
                    unfocusedBorderColor = DesignTokens.Colors.Outline,
                    focusedLabelColor = DesignTokens.Colors.Primary,
                    unfocusedLabelColor = DesignTokens.Colors.OnSurfaceVariant,
                    cursorColor = DesignTokens.Colors.Primary
                )
            )
            OutlinedTextField(
                value = lastName,
                onValueChange = { lastName = it },
                label = { Text("Last Name") },
                modifier = Modifier.weight(1f),
                shape = MaterialTheme.shapes.small,
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = DesignTokens.Colors.Primary,
                    unfocusedBorderColor = DesignTokens.Colors.Outline,
                    focusedLabelColor = DesignTokens.Colors.Primary,
                    unfocusedLabelColor = DesignTokens.Colors.OnSurfaceVariant,
                    cursorColor = DesignTokens.Colors.Primary
                )
            )
        }
        Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space3))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Password") },
            modifier = Modifier.fillMaxWidth(),
            shape = MaterialTheme.shapes.small,
            visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
            trailingIcon = {
                IconButton(onClick = { passwordVisible = !passwordVisible }) {
                    Icon(
                        if (passwordVisible) Icons.Filled.VisibilityOff else Icons.Filled.Visibility,
                        contentDescription = "Toggle password visibility",
                        tint = DesignTokens.Colors.OnSurfaceVariant
                    )
                }
            },
            singleLine = true,
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
            value = confirmPassword,
            onValueChange = { confirmPassword = it },
            label = { Text("Confirm Password") },
            modifier = Modifier.fillMaxWidth(),
            shape = MaterialTheme.shapes.small,
            visualTransformation = if (confirmPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
            trailingIcon = {
                IconButton(onClick = { confirmPasswordVisible = !confirmPasswordVisible }) {
                    Icon(
                        if (confirmPasswordVisible) Icons.Filled.VisibilityOff else Icons.Filled.Visibility,
                        contentDescription = "Toggle password visibility",
                        tint = DesignTokens.Colors.OnSurfaceVariant
                    )
                }
            },
            singleLine = true,
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
            onClick = onSignUpClicked,
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
                text = "Sign Up",
                style = MaterialTheme.typography.labelLarge,
                fontWeight = DesignTokens.Typography.FontWeightSemiBold
            )
        }

        Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space4))

        ClickableText(
            text = AnnotatedString("Already have an account? Sign In"),
            onClick = { onLoginClicked() },
            style = MaterialTheme.typography.bodyMedium.copy(
                color = DesignTokens.Colors.Primary,
                textAlign = TextAlign.Center
            )
        )
    }
}
