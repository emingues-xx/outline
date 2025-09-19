# Windows PowerShell script to start Outline development
Write-Host "Setting up environment variables..."

# Set environment variables
$env:NODE_ENV = "development"
$env:PORT = "3020"
$env:DATABASE_URL = "postgres://user:pass@localhost:5432/outline"
$env:REDIS_URL = "redis://localhost:6379"
$env:URL = "http://localhost:3020"
$env:SECRET_KEY = "F0E5AD933D7F6FD8F4DBB3E038C501C052DC0593C686D21ACB30AE205D2F634B"
$env:UTILS_SECRET = "123456"
$env:COLLABORATION_URL = "ws://localhost:3020"

Write-Host "Environment variables set:"
Write-Host "NODE_ENV: $env:NODE_ENV"
Write-Host "PORT: $env:PORT"
Write-Host "URL: $env:URL"

Write-Host "Starting Vite development server..."
Start-Process -FilePath "yarn" -ArgumentList "vite:dev" -WindowStyle Hidden

Write-Host "Waiting for Vite to start..."
Start-Sleep -Seconds 5

Write-Host "Starting backend server..."
# Try to start the backend directly
try {
    if (Test-Path "./build/server/index.js") {
        Write-Host "Using existing build..."
        node build/server/index.js --services=cron,collaboration,websockets,admin,web,worker
    } else {
        Write-Host "No build found. Please run 'yarn build:server' first."
        Write-Host "Or try using WSL/Git Bash for full compatibility."
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Please ensure Docker containers are running:"
    Write-Host "docker compose up -d redis postgres"
}
