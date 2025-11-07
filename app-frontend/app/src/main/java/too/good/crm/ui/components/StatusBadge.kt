package too.good.crm.ui.components

import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import too.good.crm.ui.theme.DesignTokens

enum class CustomerStatus {
    ACTIVE,
    INACTIVE,
    PENDING
}

@Composable
fun StatusBadge(
    text: String,
    color: Color
) {
    Surface(
        shape = RoundedCornerShape(DesignTokens.Radius.Small),
        color = color.copy(alpha = 0.1f)
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(
                horizontal = DesignTokens.Spacing.Space2,
                vertical = DesignTokens.Spacing.Space1
            ),
            style = MaterialTheme.typography.labelSmall,
            color = color,
            fontWeight = DesignTokens.Typography.FontWeightMedium
        )
    }
}
