# OrganizaAI - registra backup semanal no Agendador de Tarefas.
# Agendamento: domingo as 18h, sob o usuario atual, somente com sessao ativa.
# Nao grava senhas no agendador; nao executa backup imediatamente.
$ErrorActionPreference = "Stop"

$nomeTarefa = "OrganizaAI Backup Semanal"
$arquivoExecucao = Join-Path $PSScriptRoot "backup-semanal.ps1"
$raizProjeto = Split-Path -Parent $PSScriptRoot

try {
    if (-not (Test-Path -LiteralPath $arquivoExecucao)) {
        throw "Script de backup semanal nao encontrado."
    }

    if (Get-ScheduledTask -TaskName $nomeTarefa -ErrorAction SilentlyContinue) {
        Write-Host "JA EXISTE uma tarefa com esse nome. Nenhuma configuracao foi alterada."
        Get-ScheduledTask -TaskName $nomeTarefa |
            Select-Object TaskName, State | Format-Table -AutoSize
        return
    }

    $executavelPowerShell = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"
    $argumentos = '-NoProfile -NonInteractive -ExecutionPolicy Bypass -File "' +
        $arquivoExecucao + '"'

    $acao = New-ScheduledTaskAction -Execute $executavelPowerShell `
        -Argument $argumentos -WorkingDirectory $raizProjeto
    $gatilho = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At "18:00"
    $ajustes = New-ScheduledTaskSettingsSet -StartWhenAvailable `
        -ExecutionTimeLimit (New-TimeSpan -Hours 1) `
        -MultipleInstances IgnoreNew

    $usuario = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
    $principal = New-ScheduledTaskPrincipal -UserId $usuario `
        -LogonType Interactive -RunLevel Limited

    Register-ScheduledTask -TaskName $nomeTarefa -Action $acao `
        -Trigger $gatilho -Settings $ajustes -Principal $principal `
        -Description "OrganizaAI: backup semanal de leitura no PostgreSQL, com verificacao de catalogo." |
        Out-Null

    $registrada = Get-ScheduledTask -TaskName $nomeTarefa -ErrorAction Stop
    Write-Host "AGENDAMENTO CRIADO!"
    Write-Host "Tarefa:" $registrada.TaskName
    Write-Host "Frequencia: domingo, 18h (hora local do computador)"
    Write-Host "Usuario:" $usuario
    Write-Host "Somente enquanto a sessao do usuario estiver aberta."
    Write-Host "Inicio atrasado permitido se o horario programado for perdido."
    Write-Host "A tarefa nao foi executada agora."
    Write-Host "Consulte o arquivo OrganizaAI-backup-semanal.log apos a primeira execucao."
} catch {
    Write-Host "AGENDAMENTO NAO CONCLUIDO:" $_.Exception.Message
    Write-Host "Nenhuma alteracao no banco foi efetuada por este script."
}
