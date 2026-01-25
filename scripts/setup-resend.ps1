# Resend SMTP Setup Script
# This script helps you set up Resend SMTP for email authentication

Write-Host "📧 Resend SMTP Setup" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Get your Resend API Key" -ForegroundColor Yellow
Write-Host "1. Go to: https://resend.com/api-keys" -ForegroundColor White
Write-Host "2. Click 'Create API Key'" -ForegroundColor White
Write-Host "3. Name it: 'Forecast App'" -ForegroundColor White
Write-Host "4. Copy the API key (starts with 're_')" -ForegroundColor White
Write-Host ""

$apiKey = Read-Host "Paste your Resend API key here"

if (-not $apiKey -or -not $apiKey.StartsWith("re_")) {
    Write-Host "❌ Invalid API key. It should start with 're_'" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ API key received!" -ForegroundColor Green
Write-Host ""

# Update .env.local
Write-Host "📝 Updating .env.local..." -ForegroundColor Yellow

$envLocalPath = ".env.local"
$envContent = Get-Content $envLocalPath -Raw

# Update or add SMTP variables
$smtpVars = @{
    "SMTP_HOST" = "smtp.resend.com"
    "SMTP_PORT" = "587"
    "SMTP_USER" = "resend"
    "SMTP_PASSWORD" = $apiKey
    "EMAIL_FROM" = "onboarding@resend.dev"
}

foreach ($key in $smtpVars.Keys) {
    $value = $smtpVars[$key]
    if ($envContent -match "$key=.*") {
        $envContent = $envContent -replace "$key=.*", "$key=$value"
        Write-Host "  ✓ Updated $key" -ForegroundColor Green
    } else {
        # Add at the end if not found
        $envContent += "`n$key=$value"
        Write-Host "  ✓ Added $key" -ForegroundColor Green
    }
}

Set-Content -Path $envLocalPath -Value $envContent

Write-Host ""
Write-Host "✅ .env.local updated!" -ForegroundColor Green
Write-Host ""

# Ask if they want to set in Vercel
$setVercel = Read-Host "Do you want to set these in Vercel too? (y/n)"

if ($setVercel -eq "y" -or $setVercel -eq "Y") {
    Write-Host ""
    Write-Host "📤 Setting environment variables in Vercel..." -ForegroundColor Yellow
    
    echo "smtp.resend.com" | vercel env add SMTP_HOST production
    echo "smtp.resend.com" | vercel env add SMTP_HOST preview
    echo "smtp.resend.com" | vercel env add SMTP_HOST development
    
    echo "587" | vercel env add SMTP_PORT production
    echo "587" | vercel env add SMTP_PORT preview
    echo "587" | vercel env add SMTP_PORT development
    
    echo "resend" | vercel env add SMTP_USER production
    echo "resend" | vercel env add SMTP_USER preview
    echo "resend" | vercel env add SMTP_USER development
    
    echo $apiKey | vercel env add SMTP_PASSWORD production
    echo $apiKey | vercel env add SMTP_PASSWORD preview
    echo $apiKey | vercel env add SMTP_PASSWORD development
    
    echo "onboarding@resend.dev" | vercel env add EMAIL_FROM production
    echo "onboarding@resend.dev" | vercel env add EMAIL_FROM preview
    echo "onboarding@resend.dev" | vercel env add EMAIL_FROM development
    
    Write-Host ""
    Write-Host "✅ Vercel environment variables set!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔄 Redeploying to apply changes..." -ForegroundColor Yellow
    vercel --prod --yes
}

Write-Host ""
Write-Host "🎉 SMTP Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your dev server: npm run dev" -ForegroundColor White
Write-Host "2. Visit: http://localhost:3000/auth/signin" -ForegroundColor White
Write-Host "3. Enter your email and test the magic link!" -ForegroundColor White
Write-Host ""
