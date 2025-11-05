package too.good.crm.ui.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.TextStyle
import too.good.crm.ui.theme.DesignTokens

@Composable
fun StyledTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    placeholder: String = "",
    isError: Boolean = false,
    errorMessage: String? = null,
    leadingIcon: @Composable (() -> Unit)? = null,
    trailingIcon: @Composable (() -> Unit)? = null
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        label = { Text(label) },
        placeholder = { Text(placeholder) },
        modifier = modifier
            .fillMaxWidth()
            .height(DesignTokens.Heights.InputMd),
        isError = isError,
        supportingText = if (isError && errorMessage != null) {
            { Text(errorMessage, color = DesignTokens.Colors.Error) }
        } else null,
        leadingIcon = leadingIcon,
        trailingIcon = trailingIcon,
        shape = RoundedCornerShape(DesignTokens.Radius.Lg),
        colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = DesignTokens.Colors.Purple500,
            unfocusedBorderColor = DesignTokens.Colors.Gray200,
            errorBorderColor = DesignTokens.Colors.Error
        ),
        textStyle = TextStyle(
            fontSize = DesignTokens.Typography.FontSizeSm,
            fontWeight = DesignTokens.Typography.FontWeightNormal
        )
    )
}
