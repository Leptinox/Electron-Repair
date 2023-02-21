param([string]$RunType)
$path = $MyInvocation.MyCommand.Path
Import-Module -Name "$(Split-Path $path -Parent)\modules\output"
Add-ScriptHeader -Path "$path"

<# function Start-CheckRun {
  Start-Process ms-settings:windowsupdate-options
  Write-Host "Manual check performed"
  exit 2
} #>

<# function Start-RepairRun {
  Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU" -Name "AllowMUUpdateService" -Type DWord -Value 0 -ErrorAction Stop
  Write-Host "WARNING: Repair run was made"
}

Switch ($RunType) {
    "check"  { Start-CheckRun; break }
    "repair" { Start-RepairRun; break }
    default  { Start-CheckRun; break }
}
 #>
Start-Process ms-settings:windowsupdate-options
Write-Output "Manual intervention required"
Write-Result
exit 2
