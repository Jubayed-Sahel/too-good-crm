package too.good.crm.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import too.good.crm.ui.theme.DesignTokens

enum class StatusType {
    OPEN,
    IN_PROGRESS,
    COMPLETED,
    CLOSED,
    FAILED,
    PENDING,
    SCHEDULED
}

@Composable
fun StatusBadge(
    status: String,
    type: StatusType,
    modifier: Modifier = Modifier
) {
    val (backgroundColor, textColor) = when (type) {
        StatusType.OPEN -> DesignTokens.Colors.StatusOpen to DesignTokens.Colors.White
        StatusType.IN_PROGRESS -> DesignTokens.Colors.StatusInProgress to DesignTokens.Colors.White
        StatusType.COMPLETED -> DesignTokens.Colors.StatusCompleted to DesignTokens.Colors.White
        StatusType.CLOSED -> DesignTokens.Colors.StatusClosed to DesignTokens.Colors.White
        StatusType.FAILED -> DesignTokens.Colors.StatusFailed to DesignTokens.Colors.White
        StatusType.PENDING -> DesignTokens.Colors.StatusPending to DesignTokens.Colors.White
        StatusType.SCHEDULED -> DesignTokens.Colors.StatusScheduled to DesignTokens.Colors.White
    }

    Text(
        text = status,
        modifier = modifier
            .background(
                color = backgroundColor,
                shape = RoundedCornerShape(DesignTokens.Radius.ExtraSmall)
            )
            .padding(
                horizontal = DesignTokens.Spacing.Space3,
                vertical = DesignTokens.Spacing.Space1
            ),
        color = textColor,
        style = MaterialTheme.typography.labelSmall,
        fontWeight = DesignTokens.Typography.FontWeightSemiBold
    )
}