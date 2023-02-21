param([string]$RunType)
$path = $MyInvocation.MyCommand.Path
Import-Module -Name "$(Split-Path $path -Parent)\modules\output"
Add-ScriptHeader -Path "$path"

function Start-CheckRun {
  $errors = $false
  $search = Get-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Search" -ErrorAction Stop
  if ($search.SearchboxTaskbarMode -eq 2) {
    $errors = $true
  }
  $explorer = Get-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -ErrorAction Stop
  if ($explorer.MMTaskbarEnabled -ne 1) {
    $errors = $true
  }
  if ($explorer.TaskbarGlomLevel -ne 1) {
    $errors = $true
  }
  $feed = Get-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Feeds" -ErrorAction Stop
  if ($feed.ShellFeedsTaskbarOpenOnHover -eq 1) {
    $errors = $true
  }
  $desktopIcons = Get-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\HideDesktopIcons\NewStartPanel"
  if ($desktopIcons."{645FF040-5081-101B-9F08-00AA002F954E}" -eq 1) {
    $errors = $true
  }
  if ($desktopIcons."{20D04FE0-3AEA-1069-A2D8-08002B30309D}" -eq 1) {
    $errors = $true
  }
  if ($desktopIcons."{59031a47-3f72-44a7-89c5-5595fe6b30ee}" -eq 1) {
    $errors = $true
  }
  if ($errors) {
    Write-Output "WARNING: Some or all appearance tweaks have not been applied"
    Write-Result
    exit 2
  } else {
    Write-Output "No issues found"
    Write-Result
  }
}

function Start-RepairRun {
  Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Search" -Name "SearchboxTaskbarMode" -Type DWord -Value 1 -ErrorAction Stop
  Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "MMTaskbarEnabled" -Type DWord -Value 1 -ErrorAction Stop
  Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "TaskbarGlomLevel" -Type DWord -Value 1 -ErrorAction Stop
  Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Feeds" -Name "ShellFeedsTaskbarOpenOnHover" -Type DWord -Value 0 -ErrorAction Stop
  # Recycle bin
  Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\HideDesktopIcons\NewStartPanel" -Name "{645FF040-5081-101B-9F08-00AA002F954E}" -Type DWord -Value 0 -ErrorAction Stop
  # Computer
  Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\HideDesktopIcons\NewStartPanel" -Name "{20D04FE0-3AEA-1069-A2D8-08002B30309D}" -Type DWord -Value 0 -ErrorAction Stop
  # User files
  Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\HideDesktopIcons\NewStartPanel" -Name "{59031a47-3f72-44a7-89c5-5595fe6b30ee}" -Type DWord -Value 0 -ErrorAction Stop
  Stop-Process -Name explorer -Force
  Write-Output "Appearence tweaks applied"
  Write-Result
}

Switch ($RunType) {
    "check"  { Start-CheckRun; break }
    "repair" { Start-RepairRun; break }
    default  { Start-CheckRun; break }
}
