param([string]$RunType)
$path = $MyInvocation.MyCommand.Path
Import-Module -Name "$(Split-Path $path -Parent)\modules\output"
Add-ScriptHeader -Path "$path"

$errors = $false
$WindowsVersion = [System.Environment]::OSVersion.Version
if ($WindowsVersion.Major -lt 10){
  Write-Output "Windows version not supported. Needs Windows 10 or higher."
  $errors = $true
} else {
  if (($WindowsVersion.Major -eq 10) -and ($WindowsVersion.Build -lt 19043)){
    Write-Output "Windows 10 version not supported. Please update."
    $errors = $true
  }
}

if (![System.Environment]::Is64BitOperatingSystem){
  Write-Output "32-bit version of Windows not supported. Possible compatibility issues with scripts/applications."
  $errors = $true
}

if ($errors){
  Write-Result
  exit 2
} else {
  Write-Output "No issues: recent Windows build detected"
  Write-Result
}
