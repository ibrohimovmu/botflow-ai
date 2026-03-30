Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   BotFlow AI - Desktop Dastur Sozlash    " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Write-Host "`n1. Frontend (React) fayllarini siqish va yig'ish..." -ForegroundColor Yellow
cd ui
npm run build
cd ..

Write-Host "`n2. Paketlash uchun tayyorlash..." -ForegroundColor Yellow
if (Test-Path -Path 'frontend_dist') { Remove-Item -Recurse -Force 'frontend_dist' }
Copy-Item -Recurse -Force 'ui\dist' 'frontend_dist'

Write-Host "`n3. PyInstaller orqali barcha kodni 1 ta .EXE qilib yig'ish..." -ForegroundColor Yellow
pyinstaller --name "BotFlow_AI" --clean --noconfirm --onefile --add-data "frontend_dist;dist" run_desktop.py

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host " TAYYOR! " -ForegroundColor Green
Write-Host " Dasturingiz quyidagi manzilda yasaldi: " -ForegroundColor White
Write-Host " $(Get-Location)\dist\BotFlow_AI.exe" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Green
