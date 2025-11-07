package too.good.crm.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import too.good.crm.ui.theme.DesignTokens

@Composable
fun PrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true
) {
    Button(
        onClick = onClick,
        modifier = modifier.height(DesignTokens.Heights.ButtonStandard),
        enabled = enabled,
        colors = ButtonDefaults.buttonColors(
            containerColor = DesignTokens.Colors.Primary,
            contentColor = DesignTokens.Colors.OnPrimary,
            disabledContainerColor = DesignTokens.Colors.Outline,
            disabledContentColor = DesignTokens.Colors.OnSurfaceVariant
        ),
        shape = MaterialTheme.shapes.medium
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelLarge,
            fontWeight = DesignTokens.Typography.FontWeightSemiBold
        )
    }
}

@Composable
fun SecondaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true
) {
    OutlinedButton(
        onClick = onClick,
        modifier = modifier.height(DesignTokens.Heights.ButtonStandard),
        enabled = enabled,
        colors = ButtonDefaults.outlinedButtonColors(
            contentColor = DesignTokens.Colors.Primary,
            disabledContentColor = DesignTokens.Colors.OnSurfaceVariant
        ),
        border = ButtonDefaults.outlinedButtonBorder.copy(
            brush = androidx.compose.ui.graphics.SolidColor(DesignTokens.Colors.Primary)
        ),
        shape = MaterialTheme.shapes.medium
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelLarge,
            fontWeight = DesignTokens.Typography.FontWeightSemiBold
        )
    }
}