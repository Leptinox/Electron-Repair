param([string]$RunType)
$path = $MyInvocation.MyCommand.Path
Import-Module -Name "$(Split-Path $path -Parent)\modules\output"
Add-ScriptHeader -Path "$path"

function Start-CheckRun {
  Write-Host "Check run completed"
}

function Start-RepairRun {
  Write-Host "Repair run completed"
}

Switch ($RunType) {
    "check"  { Start-CheckRun; break }
    "repair" { Start-RepairRun; break }
    default  { Start-CheckRun; break }
}
