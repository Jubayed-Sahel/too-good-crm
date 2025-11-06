package too.good.crm.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import too.good.crm.data.ActiveMode

@Composable
fun RoleSwitcher(
    currentMode: ActiveMode,
    onModeChanged: (ActiveMode) -> Unit,
    modifier: Modifier = Modifier
) {
    val vendorColor = Color(0xFF8B5CF6) // Purple for Vendor
    val clientColor = Color(0xFF3B82F6) // Blue for Client

    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(Color(0xFFF9FAFB))
            .padding(horizontal = 12.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // Vendor Mode Button
        ModeButton(
            modifier = Modifier.weight(1f),
            text = "Vendor",
            icon = Icons.Default.BusinessCenter,
            isSelected = currentMode == ActiveMode.VENDOR,
            selectedColor = vendorColor,
            onClick = { onModeChanged(ActiveMode.VENDOR) }
        )

        // Client Mode Button
        ModeButton(
            modifier = Modifier.weight(1f),
            text = "Client",
            icon = Icons.Default.Person,
            isSelected = currentMode == ActiveMode.CLIENT,
            selectedColor = clientColor,
            onClick = { onModeChanged(ActiveMode.CLIENT) }
        )
    }
}

@Composable
private fun ModeButton(
    modifier: Modifier = Modifier,
    text: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    isSelected: Boolean,
    selectedColor: Color,
    onClick: () -> Unit
) {
    val backgroundColor by animateColorAsState(
        targetValue = if (isSelected) selectedColor else Color.Transparent,
        label = "buttonBackground"
    )

    val contentColor by animateColorAsState(
        targetValue = if (isSelected) Color.White else Color(0xFF6B7280),
        label = "buttonContent"
    )

    Surface(
        modifier = modifier
            .height(44.dp)
            .clip(RoundedCornerShape(8.dp))
            .clickable(onClick = onClick),
        color = backgroundColor,
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 12.dp),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = icon,
                contentDescription = text,
                tint = contentColor,
                modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = text,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                color = contentColor,
                fontSize = 14.sp
            )
        }
    }
}

@Composable
fun ModeBadge(
    mode: ActiveMode,
    modifier: Modifier = Modifier
) {
    val (backgroundColor, textColor, text, icon) = when (mode) {
        ActiveMode.VENDOR -> Quadruple(
            Color(0xFF8B5CF6).copy(alpha = 0.1f),
            Color(0xFF8B5CF6),
            "Vendor Mode",
            Icons.Default.BusinessCenter
        )
        ActiveMode.CLIENT -> Quadruple(
            Color(0xFF3B82F6).copy(alpha = 0.1f),
            Color(0xFF3B82F6),
            "Client Mode",
            Icons.Default.Person
        )
    }

    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(8.dp),
        color = backgroundColor
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = textColor,
                modifier = Modifier.size(14.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = text,
                style = MaterialTheme.typography.bodySmall,
                color = textColor,
                fontWeight = FontWeight.Medium,
                fontSize = 12.sp
            )
        }
    }
}

// Helper data class for quadruple values
private data class Quadruple<A, B, C, D>(
    val first: A,
    val second: B,
    val third: C,
    val fourth: D
)

