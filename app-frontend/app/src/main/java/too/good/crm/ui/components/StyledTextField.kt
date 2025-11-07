package too.good.crm.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.input.VisualTransformation
import too.good.crm.ui.theme.DesignTokens

@Composable
fun StyledTextField(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    label: String? = null,
    placeholder: String? = null,
    leadingIcon: @Composable (() -> Unit)? = null,
    trailingIcon: @Composable (() -> Unit)? = null,
    isError: Boolean = false,
    errorMessage: String? = null,
    enabled: Boolean = true,
    readOnly: Boolean = false,
    singleLine: Boolean = true,
    maxLines: Int = 1,
    visualTransformation: VisualTransformation = VisualTransformation.None,
    keyboardOptions: KeyboardOptions = KeyboardOptions.Default,
    keyboardActions: KeyboardActions = KeyboardActions.Default
) {
    Column(modifier = modifier) {
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth(),
            label = label?.let { { Text(it) } },
            placeholder = placeholder?.let { { Text(it) } },
            leadingIcon = leadingIcon,
            trailingIcon = trailingIcon,
            isError = isError,
            enabled = enabled,
            readOnly = readOnly,
            singleLine = singleLine,
            maxLines = maxLines,
            visualTransformation = visualTransformation,
            keyboardOptions = keyboardOptions,
            keyboardActions = keyboardActions,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = DesignTokens.Colors.Primary,
                unfocusedBorderColor = DesignTokens.Colors.Outline,
                errorBorderColor = DesignTokens.Colors.Error,
                focusedLabelColor = DesignTokens.Colors.Primary,
                unfocusedLabelColor = DesignTokens.Colors.OnSurfaceVariant,
                errorLabelColor = DesignTokens.Colors.Error,
                cursorColor = DesignTokens.Colors.Primary,
                errorCursorColor = DesignTokens.Colors.Error,
                focusedTextColor = DesignTokens.Colors.OnSurface,
                unfocusedTextColor = DesignTokens.Colors.OnSurface,
                disabledTextColor = DesignTokens.Colors.OnSurfaceVariant,
                errorTextColor = DesignTokens.Colors.OnSurface,
                focusedContainerColor = DesignTokens.Colors.Surface,
                unfocusedContainerColor = DesignTokens.Colors.Surface,
                disabledContainerColor = DesignTokens.Colors.SurfaceVariant,
                errorContainerColor = DesignTokens.Colors.Surface
            ),
            shape = MaterialTheme.shapes.medium
        )

        if (isError && errorMessage != null) {
            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space1))
            Text(
                text = errorMessage,
                color = DesignTokens.Colors.Error,
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}