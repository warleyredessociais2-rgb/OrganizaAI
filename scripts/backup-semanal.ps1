# OrganizaAI - executado pelo Agendador de Tarefas do Windows.
# Nao guarda segredos e nao altera os projetos.
$ErrorActionPreference = "Stop"
$raizProjeto = Split-Path -Parent $PSScriptRoot
$pastaBackup = Join-Path ([Environment]::GetFolderPath("MyDocuments")) "OrganizaAI-Backups"
$arquivoLog = Join-Path $pastaBackup "OrganizaAI-backup-semanal.log"

function Registrar([string] $estado) {
    New-Item -ItemType Directory -Path $pastaBackup -Force | Out-Null
    $hora = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -LiteralPath $arquivoLog -Encoding UTF8 -Value "$hora - $estado"
}

try {
    $scriptNode = Join-Path $raizProjeto "scripts\criar-backup-principal.js"
    if (-not (Test-Path -LiteralPath $scriptNode)) {
        throw "Script Node nao encontrado."
    }

    $comandoNode = Get-Command node.exe -ErrorAction SilentlyContinue
    if (-not $comandoNode) {
        $nodePadrao = Join-Path $env:ProgramFiles "nodejs\node.exe"
        if (-not (Test-Path -LiteralPath $nodePadrao)) {
            throw "Node.js nao encontrado."
        }
        $executavelNode = $nodePadrao
    } else {
        $executavelNode = $comandoNode.Source
    }

    Push-Location $raizProjeto
    try {
        & $executavelNode $scriptNode $pastaBackup
        if ($LASTEXITCODE -ne 0) {
            throw "Procedimento de backup retornou falha."
        }
    } finally {
        Pop-Location
    }
    Registrar "SUCESSO - novo backup e catalogo verificado"
    Write-Host "BACKUP SEMANAL CONCLUIDO!"
} catch {
    Registrar "FALHA - verificar conectividade, permissao e configuracao local"
    Write-Error "Falha ao executar backup semanal. Consulte o log e execute o backup manual para diagnosticar."
    exit 1
}
