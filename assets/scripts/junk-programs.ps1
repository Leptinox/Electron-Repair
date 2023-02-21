param([string]$RunType)
$path = $MyInvocation.MyCommand.Path
Import-Module -Name "$(Split-Path $path -Parent)\modules\output"
Add-ScriptHeader -Path "$path"

$exec = Test-Path "$folder\utilities\BRU-08-25-2022\Bloatware-Removal-Utility.ps1"
if (!$exec) {
  Write-Output "BRU file not found"
  Write-Result
  exit 2
}

$scPath = "$($folder)\utilities\BRU-08-25-2022\Bloatware-Removal-Utility.ps1"
Unblock-file $scPath
Start-Process powershell -Verb RunAs -ArgumentList "-File $scPath" -ErrorAction Stop
Write-Output "BRU was run"
Write-Result
