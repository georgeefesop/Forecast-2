# Check Database Connection Script
Write-Host "🔍 Checking Neon Database Connection..." -ForegroundColor Cyan
Write-Host ""

# Check if DATABASE_URL exists in Vercel
Write-Host "📋 Checking Vercel environment variables..." -ForegroundColor Yellow
$envVars = vercel env ls 2>&1
if ($envVars -match "DATABASE_URL") {
    Write-Host "✅ DATABASE_URL found in Vercel!" -ForegroundColor Green
} else {
    Write-Host "⚠️  DATABASE_URL not found yet." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Go to Vercel Dashboard → Integrations → Neon" -ForegroundColor White
    Write-Host "2. Click 'Manage' next to Neon integration" -ForegroundColor White
    Write-Host "3. Select your database (neon-indigo-queen)" -ForegroundColor White
    Write-Host "4. Go to 'Projects' tab" -ForegroundColor White
    Write-Host "5. Click 'Connect Project' and select 'forecast-2'" -ForegroundColor White
    Write-Host ""
    Write-Host "This will automatically inject DATABASE_URL into your project." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "After connecting, you can:" -ForegroundColor Cyan
Write-Host "1. Redeploy: vercel --prod" -ForegroundColor White
Write-Host "2. Check health: Visit https://your-app.vercel.app/api/health/db" -ForegroundColor White
Write-Host "3. Run migration: Use /api/migrate endpoint or Vercel SQL Editor" -ForegroundColor White
