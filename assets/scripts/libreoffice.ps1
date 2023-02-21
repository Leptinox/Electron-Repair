param([string]$RunType)
$path = $MyInvocation.MyCommand.Path
Import-Module -Name "$(Split-Path $path -Parent)\modules\output"
Add-ScriptHeader -Path "$path"

function Start-CheckRun {
  $LOInstalled = Get-CimInstance -Class Win32_Product | Where-Object {$_.Name -Like 'LibreOffice*'}
  if ($LOInstalled) {
    Write-Output "LibreOffice is installed. Check if the recommended configuration has been applied or perform a repair run to apply recommended configuration"
  } else {
    Write-Output "LibreOffice is not installed"
  }
  Write-Result
  exit 2
}

function Start-RepairRun {
  $errors = $false
  $LOConfigPath = Test-Path "$env:APPDATA\LibreOffice\4\user"
  if (LOConfigPath) {
    Copy-Item -Path $folder\utilities\registrymodifications.xcu -Destination "$env:APPDATA\LibreOffice\4\user" -Force
  } else {
    Write-Output "Could not find configuration folder. Check if LibreOffice is installed or copy config file manually:"
    Write-Output "$folder\utilities\registrymodifications.xcu"
    $errors = $true
  }

  if ($errors) {
    Write-Result
    exit 2
  }
  Write-Result
}

Switch ($RunType) {
  "check"  { Start-CheckRun; break }
  "repair" { Start-RepairRun; break }
  default  { Start-CheckRun; break }
}
