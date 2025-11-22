package too.good.crm.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import too.good.crm.ui.theme.DesignTokens

/**
 * Full-screen loading indicator
 * 
 * @param message Optional loading message
 * @param modifier Modifier for customization
 */
@Composable
fun LoadingScreen(
    message: String = "Loading...",
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(DesignTokens.Colors.Background),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space4)
        ) {
            CircularProgressIndicator(
                modifier = Modifier.size(48.dp),
                color = DesignTokens.Colors.Primary,
                strokeWidth = 4.dp
            )
            
            Text(
                text = message,
                style = MaterialTheme.typography.bodyMedium,
                color = DesignTokens.Colors.OnSurfaceVariant
            )
        }
    }
}

/**
 * Compact loading indicator for inline use
 * 
 * @param message Optional loading message
 * @param modifier Modifier for customization
 */
@Composable
fun LoadingIndicator(
    message: String? = null,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(DesignTokens.Spacing.Space4),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically
    ) {
        CircularProgressIndicator(
            modifier = Modifier.size(24.dp),
            color = DesignTokens.Colors.Primary,
            strokeWidth = 3.dp
        )
        
        if (message != null) {
            Spacer(modifier = Modifier.width(DesignTokens.Spacing.Space3))
            Text(
                text = message,
                style = MaterialTheme.typography.bodySmall,
                color = DesignTokens.Colors.OnSurfaceVariant
            )
        }
    }
}

/**
 * Loading dialog that overlays the current screen
 * 
 * @param message Loading message
 * @param onDismissRequest Callback when user tries to dismiss (optional)
 */
@Composable
fun LoadingDialog(
    message: String = "Loading...",
    onDismissRequest: (() -> Unit)? = null
) {
    Dialog(
        onDismissRequest = onDismissRequest ?: {},
        properties = DialogProperties(
            dismissOnBackPress = onDismissRequest != null,
            dismissOnClickOutside = false
        )
    ) {
        Card(
            modifier = Modifier
                .wrapContentSize()
                .padding(DesignTokens.Spacing.Space4),
            colors = CardDefaults.cardColors(
                containerColor = DesignTokens.Colors.Surface
            ),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
            Row(
                modifier = Modifier
                    .padding(DesignTokens.Spacing.Space5),
                horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space4),
                verticalAlignment = Alignment.CenterVertically
            ) {
                CircularProgressIndicator(
                    modifier = Modifier.size(32.dp),
                    color = DesignTokens.Colors.Primary,
                    strokeWidth = 3.dp
                )
                
                Text(
                    text = message,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}

/**
 * Skeleton loading placeholder for content
 * 
 * @param modifier Modifier for customization
 */
@Composable
fun SkeletonLoader(
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "skeleton")
    val alpha by infiniteTransition.animateFloat(
        initialValue = 0.3f,
        targetValue = 0.7f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "skeleton_alpha"
    )
    
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(100.dp)
            .alpha(alpha)
            .background(
                color = DesignTokens.Colors.SurfaceVariant,
                shape = MaterialTheme.shapes.medium
            )
    )
}

/**
 * Skeleton loader for list items
 * 
 * @param count Number of skeleton items to display
 * @param modifier Modifier for customization
 */
@Composable
fun SkeletonList(
    count: Int = 5,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
    ) {
        repeat(count) {
            SkeletonLoader(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(80.dp)
            )
        }
    }
}

/**
 * Linear progress indicator for top of screen
 * 
 * @param modifier Modifier for customization
 */
@Composable
fun LinearLoadingIndicator(
    modifier: Modifier = Modifier
) {
    LinearProgressIndicator(
        modifier = modifier.fillMaxWidth(),
        color = DesignTokens.Colors.Primary,
        trackColor = DesignTokens.Colors.SurfaceVariant
    )
}

/**
 * Determinate loading progress with percentage
 * 
 * @param progress Current progress (0.0 to 1.0)
 * @param message Optional progress message
 * @param modifier Modifier for customization
 */
@Composable
fun ProgressIndicator(
    progress: Float,
    message: String? = null,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(DesignTokens.Spacing.Space4),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
    ) {
        LinearProgressIndicator(
            progress = progress,
            modifier = Modifier.fillMaxWidth(),
            color = DesignTokens.Colors.Primary,
            trackColor = DesignTokens.Colors.SurfaceVariant
        )
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (message != null) {
                Text(
                    text = message,
                    style = MaterialTheme.typography.bodySmall,
                    color = DesignTokens.Colors.OnSurfaceVariant
                )
            }
            
            Text(
                text = "${(progress * 100).toInt()}%",
                style = MaterialTheme.typography.bodySmall,
                fontWeight = FontWeight.Bold,
                color = DesignTokens.Colors.Primary
            )
        }
    }
}

/**
 * Pull-to-refresh indicator (for use with SwipeRefresh)
 */
@Composable
fun RefreshIndicator() {
    CircularProgressIndicator(
        modifier = Modifier.size(32.dp),
        color = DesignTokens.Colors.Primary,
        strokeWidth = 3.dp
    )
}

