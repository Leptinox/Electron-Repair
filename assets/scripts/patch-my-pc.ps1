param([string]$RunType)
$path = $MyInvocation.MyCommand.Path
Import-Module -Name "$(Split-Path $path -Parent)\modules\output"
Add-ScriptHeader -Path "$path"

function Start-CheckRun {
  $exec = Test-Path $folder\utilities\PatchMyPC.exe
  if (!$exec) {
    Write-Output "PatchMyPC file not found"
    Write-Result
    exit 2
  }

  Start-Process -Wait $folder\utilities\PatchMyPC.exe -ErrorAction Stop
  Write-Output "PatchMyPC was run"
  Write-Result
}

function Start-Program {
  Start-Process $folder\utilities\PatchMyPC.exe
}

Switch ($RunType) {
  "exec" { Start-Program; break }
  default  { Start-CheckRun; break }
}
