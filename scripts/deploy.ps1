# Deployment Automation Script
# This script helps automate GitHub and Vercel deployment

Write-Host "🚀 Forecast Deployment Script" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Git status
Write-Host "📦 Checking Git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  You have uncommitted changes. Committing them..." -ForegroundColor Yellow
    git add .
    git commit -m "Deploy: Update before deployment"
}

# Step 2: Check if GitHub remote exists
Write-Host "🔍 Checking GitHub remote..." -ForegroundColor Yellow
$remote = git remote get-url origin 2>$null
if (-not $remote) {
    Write-Host "❌ No GitHub remote configured." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create a GitHub repository first:" -ForegroundColor Yellow
    Write-Host "1. Go to https://github.com/new" -ForegroundColor White
    Write-Host "2. Create a repository named 'Forecast-2'" -ForegroundColor White
    Write-Host "3. Then run:" -ForegroundColor White
    Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/Forecast-2.git" -ForegroundColor Cyan
    Write-Host "   git push -u origin main" -ForegroundColor Cyan
    exit 1
} else {
    Write-Host "✅ GitHub remote found: $remote" -ForegroundColor Green
}

# Step 3: Push to GitHub
Write-Host ""
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
try {
    git push -u origin main
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to push to GitHub. Error: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Check Vercel authentication
Write-Host ""
Write-Host "🔐 Checking Vercel authentication..." -ForegroundColor Yellow
try {
    $vercelUser = vercel whoami 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Logged into Vercel as: $vercelUser" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Not logged into Vercel. Please run: vercel login" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Vercel CLI error. Please ensure Vercel CLI is installed." -ForegroundColor Red
    exit 1
}

# Step 5: Deploy to Vercel
Write-Host ""
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Yellow
Write-Host "This will open a browser for authentication if needed." -ForegroundColor Cyan
Write-Host ""

try {
    # Check if already linked to a Vercel project
    if (Test-Path ".vercel/project.json") {
        Write-Host "📋 Project already linked. Deploying..." -ForegroundColor Yellow
        vercel --prod
    } else {
        Write-Host "🔗 Linking to Vercel project..." -ForegroundColor Yellow
        Write-Host "Follow the prompts:" -ForegroundColor Cyan
        Write-Host "  - Link to existing project? No" -ForegroundColor White
        Write-Host "  - Project name: forecast-2" -ForegroundColor White
        Write-Host "  - Directory: ./" -ForegroundColor White
        Write-Host ""
        vercel
    }
    Write-Host ""
    Write-Host "✅ Deployment initiated!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Set environment variables in Vercel Dashboard" -ForegroundColor White
    Write-Host "2. Create Vercel Postgres database" -ForegroundColor White
    Write-Host "3. Run database migration" -ForegroundColor White
    Write-Host ""
    Write-Host "See DEPLOYMENT.md for detailed instructions." -ForegroundColor Yellow
} catch {
    Write-Host "❌ Deployment failed. Error: $_" -ForegroundColor Red
    exit 1
}
