package too.good.crm.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import java.util.Locale
import too.good.crm.ui.theme.DesignTokens

enum class StatusType {
    ACTIVE, PENDING, INACTIVE, WON, LOST, QUALIFIED
}

@Composable
fun StatusBadge(
    status: StatusType,
    text: String,
    modifier: Modifier = Modifier
) {
    val (bgColor, textColor) = when (status) {
        StatusType.ACTIVE, StatusType.WON ->
            DesignTokens.Colors.GreenBg to DesignTokens.Colors.GreenText
        StatusType.PENDING ->
            DesignTokens.Colors.YellowBg to DesignTokens.Colors.YellowText
        StatusType.INACTIVE, StatusType.LOST ->
            DesignTokens.Colors.RedBg to DesignTokens.Colors.RedText
        StatusType.QUALIFIED ->
            DesignTokens.Colors.PurpleBg to DesignTokens.Colors.PurpleText
    }

    Text(
        text = text.uppercase(Locale.getDefault()), // Manual uppercase transformation
        modifier = modifier
            .background(
                color = bgColor,
                shape = RoundedCornerShape(percent = 50)
            )
            .padding(
                horizontal = DesignTokens.Spacing.Space3,
                vertical = DesignTokens.Spacing.Space1
            ),
        color = textColor,
        fontSize = DesignTokens.Typography.FontSizeXs,
        fontWeight = DesignTokens.Typography.FontWeightMedium
    )
}
