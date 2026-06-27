# PowerShell script to run both backend and frontend concurrently

Clear-Host
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   Starting Google Calendar Clone App    " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Launch FastAPI Backend
Write-Host "[1/3] Launching FastAPI Backend on http://localhost:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

# 2. Launch Vite React Frontend
Write-Host "[2/3] Launching Vite React Frontend on http://localhost:5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

# 3. Wait a moment and launch browser
Write-Host "[3/3] Opening browser to http://localhost:5173..." -ForegroundColor Green
Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"

Write-Host "-----------------------------------------" -ForegroundColor Cyan
Write-Host "Both servers are running! Check their respective terminal windows for logs." -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
