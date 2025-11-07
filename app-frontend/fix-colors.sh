#!/bin/bash
# Auto-fix script to replace all hardcoded colors with DesignTokens

echo "🎨 Fixing hardcoded colors across all mobile app screens..."

# Define the workspace root
ROOT="d:/Projects/too-good-crm/app-frontend/app/src/main/java/too/good/crm/features"

# Gray scale replacements
echo "📝 Replacing gray scale colors..."
find "$ROOT" -name "*.kt" -type f -exec sed -i 's/Color(0xFF111827)/DesignTokens.Colors.OnSurface/g' {} \;
find "$ROOT" -name "*.kt" -type f -exec sed -i 's/Color(0xFF1F2937)/DesignTokens.Colors.OnSurface/g' {} \;
find "$ROOT" -name "*.kt" -type f -exec sed -i 's/Color(0xFF374151)/DesignTokens.Colors.OnSurface/g' {} \;
find "$ROOT" -name "*.kt" -type f -exec sed -i 's/Color(0xFF6B7280)/DesignTokens.Colors.OnSurfaceVariant/g' {} \;
find "$ROOT" -name "*.kt" -type f -exec sed -i 's/Color(0xFF9CA3AF)/DesignTokens.Colors.OnSurfaceTertiary/g' {} \;
find "$ROOT" -name "*.kt" -type f -exec sed -i 's/Color(0xFFE5E7EB)/DesignTokens.Colors.OutlineVariant/g' {} \;
find "$ROOT" -name "*.kt" -type f -exec sed -i 's/Color(0xFFD1D5DB)/DesignTokens.Colors.Outline/g' {} \;
find "$ROOT" -name "*.kt" -type f -exec sed -i 's/Color(0xFFF9FAFB)/DesignTokens.Colors.Background/g' {} \;
find "$ROOT" -name "*.kt" -type f -exec sed -i 's/Color(0xFFCBD5E1)/DesignTokens.Colors.Outline/g' {} \;

# Primary/Purple colors
echo "💜 Replacing primary colors..."
find "$ROOT" -name "*.kt" -type f -exec sed -i 's/Color(0xFF667EEA)/DesignTokens.Colors.Primary/g' {} \;
find "$ROOT" -name "*.kt" -type f -exec sed -i 's/Color(0xFF8B5CF6)/DesignTokens.Colors.StatusScheduled/g' {} \;
find "$ROOT" -name "*.kt" -type f -exec sed -i 's/Color(0xFFF3E5F5)/DesignTokens.Colors.PrimaryContainer/g' {} \;
find "$ROOT" -name "*.kt" -type f -exec sed -i 's/Color(0xFFEC4899)/DesignTokens.Colors.PinkAccent/g' {} \;

# Success/Green colors
echo "✅ Replacing success colors..."
find "$ROOT" -name "*.kt" -type f -exec sed -i 's/Color(0xFF22C55E)/DesignTokens.Colors.Success/g' {} \;
find "$ROOT" -name "*.kt" -type f -exec sed -i 's/Color(0xFF10B981)/DesignTokens.Colors.Success/g' {} \;
find "$ROOT" -name "*.kt" -type f -exec sed -i 's/Color(0xFF4CAF50)/DesignTokens.Colors.Success/g' {} \;
find "$ROOT" -name "*.kt" -type f -exec sed -i 's/Color(0xFFE8F5E9)/DesignTokens.Colors.SuccessLight/g' {} \;
find "$ROOT" -name "*.kt" -type f -exec sed -i 's/Color(0xFF047857)/DesignTokens.Colors.SuccessDark/g' {} \;

# Warning/Orange colors
echo "⚠️ Replacing warning colors..."
find "$ROOT" -name "*.kt" -type f -exec sed -i 's/Color(0xFFF59E0B)/DesignTokens.Colors.Warning/g' {} \;
find "$ROOT" -name "*.kt" -type f -exec sed -i 's/Color(0xFFFF9800)/DesignTokens.Colors.Warning/g' {} \;
find "$ROOT" -name "*.kt" -type f -exec sed -i 's/Color(0xFFFEF3C7)/DesignTokens.Colors.WarningLight/g' {} \;

# Error/Red colors
echo "❌ Replacing error colors..."
find "$ROOT" -name "*.kt" -type f -exec sed -i 's/Color(0xFFEF4444)/DesignTokens.Colors.Error/g' {} \;
find "$ROOT" -name "*.kt" -type f -exec sed -i 's/Color(0xFFD32F2F)/DesignTokens.Colors.ErrorDark/g' {} \;
find "$ROOT" -name "*.kt" -type f -exec sed -i 's/Color(0xFFFFEBEE)/DesignTokens.Colors.ErrorLight/g' {} \;
find "$ROOT" -name "*.kt" -type f -exec sed -i 's/Color(0xFFFEE2E2)/DesignTokens.Colors.ErrorLight/g' {} \;

# Info/Blue colors
echo "ℹ️ Replacing info colors..."
find "$ROOT" -name "*.kt" -type f -exec sed -i 's/Color(0xFF3B82F6)/DesignTokens.Colors.Info/g' {} \;
find "$ROOT" -name "*.kt" -type f -exec sed -i 's/Color(0xFFE3F2FD)/DesignTokens.Colors.InfoLight/g' {} \;
find "$ROOT" -name "*.kt" -type f -exec sed -i 's/Color(0xFF1E40AF)/DesignTokens.Colors.InfoDark/g' {} \;
find "$ROOT" -name "*.kt" -type f -exec sed -i 's/Color(0xFFDBEAFE)/DesignTokens.Colors.InfoLight/g' {} \;

echo "✨ Done! All hardcoded colors have been replaced with DesignTokens."
echo ""
echo "📋 Summary:"
echo "  - Gray scale colors: ✅"
echo "  - Primary/Purple colors: ✅"
echo "  - Success/Green colors: ✅"
echo "  - Warning/Orange colors: ✅"
echo "  - Error/Red colors: ✅"
echo "  - Info/Blue colors: ✅"
echo ""
echo "⚠️  Note: Please review the changes and ensure imports include:"
echo "   import too.good.crm.ui.theme.DesignTokens"
