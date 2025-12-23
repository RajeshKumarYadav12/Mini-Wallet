# Test build commands locally before deploying

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Testing Frontend Build" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Cyan

Set-Location "$PSScriptRoot\frontend-react"

Write-Host "`nInstalling dependencies..." -ForegroundColor Green
npm install

Write-Host "`nBuilding frontend..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Frontend build successful!" -ForegroundColor Green
    Write-Host "Build output: frontend-react/dist" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Testing Backend Build" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Cyan

Set-Location "$PSScriptRoot\backend"

Write-Host "`nInstalling dependencies..." -ForegroundColor Green
npm install

Write-Host "`nRunning build command..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Backend build successful!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Backend build failed!" -ForegroundColor Red
    exit 1
}

Set-Location $PSScriptRoot

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "✅ All builds completed successfully!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Deploy backend: cd backend && vercel --prod" -ForegroundColor White
Write-Host "2. Get backend URL from Vercel" -ForegroundColor White
Write-Host "3. Update frontend .env.production with backend URL" -ForegroundColor White
Write-Host "4. Deploy frontend: cd frontend-react && vercel --prod" -ForegroundColor White
Write-Host "`nSee VERCEL_DEPLOYMENT.md for detailed instructions" -ForegroundColor Cyan
