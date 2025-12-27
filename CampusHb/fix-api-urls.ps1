# Fix API URLs Script
# This script will update all hardcoded localhost URLs to use the API config

Write-Host "🔧 Fixing API URLs in Frontend..." -ForegroundColor Yellow
Write-Host ""

$srcPath = "c:\Divyanshu\Divyanshu\Project\HiringBazar\CampusHB\Application\CampusHb\src"

# Files to update
$filesToUpdate = @(
    "$srcPath\pages\Register.jsx",
    "$srcPath\pages\Login.jsx",
    "$srcPath\pages\Home.jsx",
    "$srcPath\pages\ApplyJob.jsx",
    "$srcPath\pages\AdminLogin.jsx",
    "$srcPath\pages\AdminDashboard.jsx"
)

$filesUpdated = 0

foreach ($file in $filesToUpdate) {
    if (Test-Path $file) {
        Write-Host "Updating: $file" -ForegroundColor Cyan
        
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        # Add import at the top if not present
        if ($content -notmatch "import.*getApiUrl.*from.*config/api") {
            # Find the last import statement
            $importRegex = "(?s)(import.*?;)\s*\n\s*\n"
            if ($content -match $importRegex) {
                $content = $content -replace $importRegex, "`$1`nimport { getApiUrl, getUploadUrl } from '../config/api';`n`n"
            }
        }
        
        # Replace all localhost:5000 URLs
        # Pattern 1: ''/api/...'
        $content = $content -replace "(['\`])'/api/([^'\`]+)(['\`])", "`$1`${getApiUrl('`$2')}`$3"
        
        # Pattern 2: `'/api/...`
        $content = $content -replace "(['\`])'/api/([^'\`]+)(['\`])", "getApiUrl('`$2')"
        
        # Pattern 3: url} (for uploads)
        $content = $content -replace "(['\`])http://localhost:5000\`\{([^\}]+)\}(['\`])", "getUploadUrl(`$2)"
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "  ✓ Updated" -ForegroundColor Green
            $filesUpdated++
        } else {
            Write-Host "  - No changes needed" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ✗ File not found: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "✅ Done! Updated $filesUpdated files" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review the changes in your files"
Write-Host "2. Test locally: npm run dev"
Write-Host "3. Build for production: npm run build"
Write-Host "4. Deploy to server"
Write-Host ""
