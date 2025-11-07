# PowerShell script to fix hardcoded colors in all Kotlin files
Write-Host "🎨 Fixing hardcoded colors in mobile app..." -ForegroundColor Cyan

$rootPath = "D:\Projects\too-good-crm\app-frontend\app\src\main\java\too\good\crm\features"

# Get all Kotlin files
$files = Get-ChildItem -Path $rootPath -Filter "*.kt" -Recurse

$replacements = @{
    # Gray scale
    'Color\(0xFF111827\)' = 'DesignTokens.Colors.OnSurface'
    'Color\(0xFF1F2937\)' = 'DesignTokens.Colors.OnSurface'
    'Color\(0xFF374151\)' = 'DesignTokens.Colors.OnSurface'
    'Color\(0xFF6B7280\)' = 'DesignTokens.Colors.OnSurfaceVariant'
    'Color\(0xFF9CA3AF\)' = 'DesignTokens.Colors.OnSurfaceTertiary'
    'Color\(0xFFE5E7EB\)' = 'DesignTokens.Colors.OutlineVariant'
    'Color\(0xFFD1D5DB\)' = 'DesignTokens.Colors.Outline'
    'Color\(0xFFF9FAFB\)' = 'DesignTokens.Colors.Background'
    'Color\(0xFFCBD5E1\)' = 'DesignTokens.Colors.Outline'
    
    # Primary/Purple
    'Color\(0xFF667EEA\)' = 'DesignTokens.Colors.Primary'
    'Color\(0xFF8B5CF6\)' = 'DesignTokens.Colors.StatusScheduled'
    'Color\(0xFFF3E5F5\)' = 'DesignTokens.Colors.PrimaryContainer'
    'Color\(0xFFEC4899\)' = 'DesignTokens.Colors.PinkAccent'
    
    # Success/Green
    'Color\(0xFF22C55E\)' = 'DesignTokens.Colors.Success'
    'Color\(0xFF10B981\)' = 'DesignTokens.Colors.Success'
    'Color\(0xFF4CAF50\)' = 'DesignTokens.Colors.Success'
    'Color\(0xFFE8F5E9\)' = 'DesignTokens.Colors.SuccessLight'
    'Color\(0xFF047857\)' = 'DesignTokens.Colors.SuccessDark'
    
    # Warning/Orange
    'Color\(0xFFF59E0B\)' = 'DesignTokens.Colors.Warning'
    'Color\(0xFFFF9800\)' = 'DesignTokens.Colors.Warning'
    'Color\(0xFFFEF3C7\)' = 'DesignTokens.Colors.WarningLight'
    
    # Error/Red
    'Color\(0xFFEF4444\)' = 'DesignTokens.Colors.Error'
    'Color\(0xFFD32F2F\)' = 'DesignTokens.Colors.ErrorDark'
    'Color\(0xFFFFEBEE\)' = 'DesignTokens.Colors.ErrorLight'
    'Color\(0xFFFEE2E2\)' = 'DesignTokens.Colors.ErrorLight'
    
    # Info/Blue
    'Color\(0xFF3B82F6\)' = 'DesignTokens.Colors.Info'
    'Color\(0xFFE3F2FD\)' = 'DesignTokens.Colors.InfoLight'
    'Color\(0xFF1E40AF\)' = 'DesignTokens.Colors.InfoDark'
    'Color\(0xFFDBEAFE\)' = 'DesignTokens.Colors.InfoLight'
    
    # Other colors
    'Color\(0xFFEAB308\)' = 'DesignTokens.Colors.ActivityNote'
    'Color\(0xFF06B6D4\)' = 'DesignTokens.Colors.ActivityTelegram'
}

$totalReplacements = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    foreach ($pattern in $replacements.Keys) {
        $content = $content -replace $pattern, $replacements[$pattern]
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $totalReplacements++
        Write-Host "✓ Fixed: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "`n✨ Complete! Fixed $totalReplacements files" -ForegroundColor Cyan
Write-Host "⚠️  Please ensure all files have this import:" -ForegroundColor Yellow
Write-Host "   import too.good.crm.ui.theme.DesignTokens" -ForegroundColor White
