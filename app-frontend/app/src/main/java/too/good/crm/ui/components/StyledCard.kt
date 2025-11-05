package too.good.crm.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import too.good.crm.ui.theme.DesignTokens

@Composable
fun StyledCard(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(DesignTokens.Radius.Xl),
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        border = BorderStroke(
            width = DesignTokens.Spacing.Space1,
            color = DesignTokens.Colors.Gray200
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = DesignTokens.Spacing.Space1
        )
    ) {
        Column(modifier = Modifier.padding(DesignTokens.Spacing.Space6)) {
            content()
        }
    }
}
