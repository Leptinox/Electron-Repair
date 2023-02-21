param([string]$RunType)
$path = $MyInvocation.MyCommand.Path
Import-Module -Name "$(Split-Path $path -Parent)\modules\output"
Add-ScriptHeader -Path "$path"

function Start-CheckRun {
  $UAC = (Get-ItemProperty HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System).EnableLUA
  if ($UAC){
      Write-Output "UAC is enabled"
      Write-Result
      exit 0
  } else {
      #Get-ItemProperty HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System | Set-ItemProperty -Name EnableLUA -Value 1 - Remmediation
      Write-Output "WARNING: UAC is disabled"
      Write-Result
      exit 2
  }
}

function Start-RepairRun {
  $UAC = (Get-ItemProperty HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System).EnableLUA
  if ($UAC){
    Write-Output "UAC is enabled"
  } else {
    Get-ItemProperty HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System | Set-ItemProperty -Name EnableLUA -Value 1 -ErrorAction Stop
    Write-Output "Repair run completed: UAC was enabled"
  }
  Write-Result
}

Switch ($RunType) {
  "check"  { Start-CheckRun; break }
  "repair" { Start-RepairRun; break }
  default  { Start-CheckRun; break }
}
