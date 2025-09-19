# Script para rodar Outline localmente na porta 3020
Write-Host "=== Iniciando Outline na porta 3020 ===" -ForegroundColor Green

# Configurar variáveis de ambiente
$env:NODE_ENV = "development"
$env:PORT = "3020"
$env:DATABASE_URL = "postgres://user:pass@localhost:5432/outline"
$env:REDIS_URL = "redis://localhost:6379"
$env:URL = "http://localhost:3020"
$env:SECRET_KEY = "F0E5AD933D7F6FD8F4DBB3E038C501C052DC0593C686D21ACB30AE205D2F634B"
$env:UTILS_SECRET = "123456"
$env:COLLABORATION_URL = "ws://localhost:3020"
$env:FILE_STORAGE = "local"
$env:FILE_STORAGE_LOCAL_ROOT_DIR = "./data"

Write-Host "Variáveis de ambiente configuradas:" -ForegroundColor Yellow
Write-Host "PORT: $env:PORT"
Write-Host "URL: $env:URL"
Write-Host "NODE_ENV: $env:NODE_ENV"

# Verificar se o build existe
if (-not (Test-Path "./build/server/index.js")) {
    Write-Host "Build não encontrado. Tentando fazer build..." -ForegroundColor Yellow
    
    # Tentar fazer build usando PowerShell
    try {
        Write-Host "Criando diretório build..."
        New-Item -ItemType Directory -Force -Path "./build/server" | Out-Null
        New-Item -ItemType Directory -Force -Path "./build/shared" | Out-Null
        
        Write-Host "Copiando arquivos do servidor..."
        Copy-Item -Recurse -Force "./server" "./build/server"
        Copy-Item -Recurse -Force "./shared" "./build/shared"
        
        Write-Host "Build concluído!" -ForegroundColor Green
    } catch {
        Write-Host "Erro no build: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Tentando executar sem build..." -ForegroundColor Yellow
    }
}

# Tentar executar o servidor
Write-Host "Iniciando servidor Outline..." -ForegroundColor Green

try {
    if (Test-Path "./build/server/index.js") {
        Write-Host "Executando servidor compilado..." -ForegroundColor Green
        node build/server/index.js --services=cron,collaboration,websockets,admin,web,worker
    } else {
        Write-Host "Tentando executar com ts-node..." -ForegroundColor Yellow
        npx ts-node server/index.ts
    }
} catch {
    Write-Host "Erro ao executar servidor: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Verifique se as dependências estão instaladas: yarn install" -ForegroundColor Yellow
}
