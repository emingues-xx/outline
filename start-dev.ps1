# PowerShell script to start Outline development server
$env:NODE_ENV = "development"
$env:PORT = "3020"
$env:DATABASE_URL = "postgres://user:pass@localhost:5432/outline"
$env:REDIS_URL = "redis://localhost:6379"
$env:URL = "http://localhost:3020"
$env:SECRET_KEY = "F0E5AD933D7F6FD8F4DBB3E038C501C052DC0593C686D21ACB30AE205D2F634B"
$env:UTILS_SECRET = "123456"
$env:COLLABORATION_URL = "ws://localhost:3020"

Write-Host "Starting Outline development server on port 3020..."
Write-Host "Environment variables set:"
Write-Host "NODE_ENV: $env:NODE_ENV"
Write-Host "PORT: $env:PORT"
Write-Host "URL: $env:URL"

# Try to start the development server
try {
    yarn dev:watch
} catch {
    Write-Host "Error starting with yarn dev:watch, trying alternative approach..."
    # Alternative: try to run the server directly
    yarn dev
}
