package too.good.crm.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import too.good.crm.ui.theme.DesignTokens

@Composable
fun StyledCard(
    modifier: Modifier = Modifier,
    backgroundColor: Color = DesignTokens.Colors.Surface,
    contentColor: Color = DesignTokens.Colors.OnSurface,
    content: @Composable ColumnScope.() -> Unit
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = backgroundColor,
            contentColor = contentColor
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = DesignTokens.Elevation.Level1
        ),
        shape = MaterialTheme.shapes.medium
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(DesignTokens.Padding.CardPaddingStandard),
            content = content
        )
    }
}

@Composable
fun ElevatedCard(
    modifier: Modifier = Modifier,
    backgroundColor: Color = DesignTokens.Colors.Surface,
    contentColor: Color = DesignTokens.Colors.OnSurface,
    content: @Composable ColumnScope.() -> Unit
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = backgroundColor,
            contentColor = contentColor
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = DesignTokens.Elevation.Level3
        ),
        shape = MaterialTheme.shapes.medium
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(DesignTokens.Padding.CardPaddingComfortable),
            content = content
        )
    }
}