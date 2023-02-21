param([string]$RunType)
$path = $MyInvocation.MyCommand.Path
Import-Module -Name "$(Split-Path $path -Parent)\modules\output"
Add-ScriptHeader -Path "$path"

function Start-CheckRun {
  $exec = Test-Path $folder\utilities\HitmanPro_x64.exe
  if (!$exec) {
    Write-Output "HitmanPro file not found"
    Write-Result
    exit 2
  }
  Start-Process -Wait $folder\utilities\HitmanPro_x64.exe -ErrorAction Stop
  Write-Output "HitmanPro was run"
  Write-Result
}

function Start-Program {
  Start-Process $folder\utilities\HitmanPro_x64.exe
}

Switch ($RunType) {
  "exec" { Start-Program; break }
  default  { Start-CheckRun; break }
}

