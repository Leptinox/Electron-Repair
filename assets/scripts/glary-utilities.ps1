param([string]$RunType)
$path = $MyInvocation.MyCommand.Path
Import-Module -Name "$(Split-Path $path -Parent)\modules\output"
Add-ScriptHeader -Path "$path"

function Start-CheckRun {
  $exec = Test-Path $folder\utilities\gu5setup.exe
  if (!$exec) {
    Write-Output "Glary Utilities file not found"
    Write-Result
    exit 2
  }
  $GlaryUInstalled = Test-Path "${env:ProgramFiles(x86)}\Glary Utilities*\Integrator.exe"

  if ($GlaryUInstalled) {
    Start-Process -Wait "${env:ProgramFiles(x86)}\Glary Utilities*\Integrator.exe"
    Write-Output "Glary Utilities installed. Running"
  } else {
    Start-Process -Wait $folder\utilities\gu5setup.exe -ErrorAction Stop
    Write-Output "Glary Utilities was run"
  }
  Write-Result
}

function Start-Program {
  $GlaryUInstalled = Test-Path "${env:ProgramFiles(x86)}\Glary Utilities*\Integrator.exe"
  if ($GlaryUInstalled) {
    Start-Process "${env:ProgramFiles(x86)}\Glary Utilities*\Integrator.exe"
  } else {
    Start-Process $folder\utilities\gu5setup.exe
  }
}

Switch ($RunType) {
  "exec" { Start-Program; break }
  default  { Start-CheckRun; break }
}


