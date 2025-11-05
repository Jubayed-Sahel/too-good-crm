
package too.good.crm.ui.components

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
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
        modifier = modifier.height(DesignTokens.Heights.InputMd),
        enabled = enabled,
        shape = RoundedCornerShape(DesignTokens.Radius.Lg),
        colors = ButtonDefaults.buttonColors(
            containerColor = DesignTokens.Colors.Purple500,
            contentColor = Color.White
        ),
        contentPadding = PaddingValues(horizontal = DesignTokens.Spacing.Space4)
    ) {
        Text(
            text = text,
            fontSize = DesignTokens.Typography.FontSizeSm,
            fontWeight = DesignTokens.Typography.FontWeightMedium
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
        modifier = modifier.height(DesignTokens.Heights.InputMd),
        enabled = enabled,
        shape = RoundedCornerShape(DesignTokens.Radius.Lg),
        colors = ButtonDefaults.outlinedButtonColors(
            contentColor = DesignTokens.Colors.Purple500
        ),
        contentPadding = PaddingValues(horizontal = DesignTokens.Spacing.Space4)
    ) {
        Text(
            text = text,
            fontSize = DesignTokens.Typography.FontSizeSm,
            fontWeight = DesignTokens.Typography.FontWeightMedium
        )
    }
}
