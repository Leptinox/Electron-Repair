param([string]$RunType)
$path = $MyInvocation.MyCommand.Path
Import-Module -Name "$(Split-Path $path -Parent)\modules\output"
Add-ScriptHeader -Path "$path"

function Start-CheckRun {
  try {
    $InstallAppX = Get-AppxPackage -allusers MicrosoftCorporationII.QuickAssist
    If ($InstallAppX.status -eq 'OK'){
      Write-Output "Windows Store version of Quick Assist is already installed "
    }
    If ($InstallAppX.status -ne 'OK'){
      Write-Output "Windows Store version of Quick Assist is not installed. Run repair run to install. "
    }
  } catch [exception] {
    Write-Output "[Error] An error occurred while checking Quick Assist version: $($_.Exception.Message)"
  }
  Start-Process ms-windows-store://downloadsandupdates
  Write-Output " Manual intervention required: Update Microsoft Store Apps"
  Write-Result
  exit 2
}

function Start-RepairRun {
  try {
    $InstallAppX = Get-AppxPackage -allusers MicrosoftCorporationII.QuickAssist
    If ($InstallAppX.status -eq 'OK'){
      Remove-WindowsCapability -Online -Name 'App.Support.QuickAssist~~~~0.0.1.0' -ErrorAction 'SilentlyContinue'
    }
    If ($InstallAppX.status -ne 'OK'){
      Set-Location $folder
      Add-AppxProvisionedPackage -online -SkipLicense -PackagePath '.\MicrosoftCorporationII.QuickAssist.AppxBundle'
      Remove-WindowsCapability -Online -Name 'App.Support.QuickAssist~~~~0.0.1.0' -ErrorAction 'SilentlyContinue'
    }
    Write-Host "[Success] The Windows store version of Quick assist has successfully installed and the old version has been removed."
  } catch [exception] {
    Write-Output "[Error] An error occurred installing Quick Assist: $($_.Exception.Message)"
  }
  Start-Process ms-windows-store://downloadsandupdates
  Write-Output "Manual update of Store apps required"
  Write-Result
  exit 2
}

Switch ($RunType) {
    "check"  { Start-CheckRun; break }
    "repair" { Start-RepairRun; break }
    default  { Start-CheckRun; break }
}
