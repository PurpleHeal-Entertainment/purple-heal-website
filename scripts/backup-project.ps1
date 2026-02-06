# backup-project.ps1
# Script de Backup para Purple Heal Entertainment

$BackupDir = "backups"
$ProjectDir = "."
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupName = "purple-heal-backup_$Timestamp.zip"
$BackupPath = Join-Path $BackupDir $BackupName

# Crear directorio de backups si no existe en el nivel superior (fuera de la carpeta actual por seguridad o dentro si es local)
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
    Write-Host "Directorio de backups creado: $BackupDir" -ForegroundColor Cyan
}

# Archivos y carpetas a excluir
$Excludes = @("backups", ".git", ".gemini", "node_modules", ".chrome-data")

Write-Host "Iniciando respaldo de: $ProjectDir" -ForegroundColor Yellow
Write-Host "Destino: $BackupPath" -ForegroundColor Yellow

# Comprimir el proyecto (excluyendo la carpeta de backups y carpetas pesadas/ocultas)
Get-ChildItem -Path $ProjectDir -Exclude $Excludes | Compress-Archive -DestinationPath $BackupPath -Update

if (Test-Path $BackupPath) {
    Write-Host "¡Respaldo completado con éxito! -> $BackupName" -ForegroundColor Green
}
else {
    Write-Host "Error al crear el respaldo." -ForegroundColor Red
    exit 1
}
