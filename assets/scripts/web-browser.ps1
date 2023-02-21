param([string]$RunType)
$path = $MyInvocation.MyCommand.Path
Import-Module -Name "$(Split-Path $path -Parent)\modules\output"
Add-ScriptHeader -Path "$path"

function Start-BrowserCheck {
  Start-Process -Wait $folder\utilities\BrowsingHistoryView.exe -ArgumentList "/VisitTimeFilterType 3 /VisitTimeFilterValue 60 /scomma $env:temp\web-history.csv"
  $webHistory = Import-Csv -Path $env:temp\web-history.csv
  $mostVisited = $webHistory | Sort-Object -Property 'Visit Count' -Descending | Select-Object -First 100
  $browserList = $mostVisited.'Web Browser' | Sort-Object | Get-Unique
  Write-Output "======== Most used browser(s) ========"
  foreach ($browser in $browserList) {
    Write-Output $browser
  }
  Write-Output "=================================="
}

function Get-BrowserExtensions {
  Start-Process -Wait $folder\utilities\BrowserAddonsView.exe -ArgumentList "/scomma $env:temp\browser-addons.csv"
  $browserAddons = Import-Csv -Path $env:temp\browser-addons.csv
  $allExtensions = $browserAddons | Where-Object {$_.'Addon Type' -eq 'Extension' -and $_.Name -ne ''} | Select-Object 'Web Browser',Name,Version | Sort-Object -Property 'Web Browser'
  Write-Output "========= Browser Extensions ========="
  if ($null -eq $allExtensions){
    Write-Output "No browser extensions found."
  } else {
    $allExtensions | ForEach-Object {
      Write-Output "$($_.'Web Browser'): $($_.Name)"
    }
  }
  Write-Output "================================"
}

function Get-BrowserNotifications {
  # Edge
  $edgePath = "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Preferences"
  $isEdge = Test-Path $edgePath
  if ($isEdge){
    $preferences = Get-Content $edgePath | ConvertFrom-Json
    $notifications = $preferences.profile.content_settings.exceptions.notifications # Setting -eq 1 means enabled
    $sites = $notifications.PSObject.Properties | Where-Object { $_.Value.setting -eq 1 } | Select-Object -Property Name
    if ($null -ne $sites) {
      Write-Output "Edge Browser notifications:"
      foreach ($site in $sites) {
        Write-Output $site.Name
      }
    }
  }

  # Chrome
  $chromePath = "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Preferences"
  $isChrome = Test-Path $chromePath
  if ($isChrome){
    $preferences = Get-Content $chromePath | ConvertFrom-Json
    $notifications = $preferences.profile.content_settings.exceptions.notifications # Setting -eq 1 means enabled
    $sites = $notifications.PSObject.Properties | Where-Object { $_.Value.setting -eq 1 } | Select-Object -Property Name
    if ($null -ne $sites) {
      Write-Output "Chrome Browser notifications:"
      foreach ($site in $sites) {
        Write-Output $site.Name
      }
    }
  }

  # Firefox
  $firefoxPath = "$env:APPDATA\Mozilla\Firefox\Profiles"
  $profileFolder = Get-ChildItem $firefoxPath | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  $permissionsFile = "$firefoxPath\$profileFolder\permissions.sqlite"
  $isPermissions = Test-Path $permissionsFile
  if ($isPermissions){
    Set-Location $folder\utilities\
    $sites = .\sqlite3.exe $permissionsFile "SELECT origin FROM moz_perms WHERE (type = 'desktop-notification' AND permission = 1)"
    if ($null -ne $sites) {
      Write-Output "Firefox Browser notifications:"
      foreach ($site in $sites) {
        Write-Output $site
      }
    }
  }
  Write-Output "================================"
}

function Start-CheckRun {
  Write-Output "Check results for issues"
  Start-BrowserCheck
  Get-BrowserExtensions
  Get-BrowserNotifications
  Write-Result
  exit 2
}

function Start-RepairRun {
  $isChrome = Test-Path "HKLM:Software\Policies\Google\Chrome\"
  if ($isChrome) {
    $extList = Test-Path "HKLM:Software\Policies\Google\Chrome\ExtensionInstallBlocklist"
    if ($extList) {
      Write-Output "Found custom extension policy. Skipping uBlock Origin install policy"
    } else {
      New-Item -Path "HKLM:Software\Policies\Google\Chrome\ExtensionInstallForcelist"
      New-ItemProperty -Path "HKLM:Software\Policies\Google\Chrome\ExtensionInstallForcelist" -Name 42 -PropertyType String -Value "cjpalhdlnbpafiamejdnhcphjbkeiagm"
    }
  }

  #Edge
  $isEdge = Test-Path "HKLM:SOFTWARE\Policies\Microsoft\Edge\ExtensionInstallForcelist\"
  if ($isEdge) {
    Write-Output "Skipping uBlock extension policy. Edge already has a policy in place"
  } else {
    New-Item -Path "HKLM:SOFTWARE\Policies\Microsoft\Edge\ExtensionInstallForcelist\" -Force
    New-ItemProperty -Path "HKLM:SOFTWARE\Policies\Microsoft\Edge\ExtensionInstallForcelist\" -Name 42 -PropertyType String -Value "odfafepnkmbhccpbejgmiehpchacaeak"
  }

  $firefoxPath = "$env:ProgramFiles\Mozilla Firefox"
  $isFirefox = Test-Path $firefoxPath

  if ($isFirefox) {
    $firefoxPath = "$env:APPDATA\Mozilla\Firefox\Profiles"
    $profileFolder = Get-ChildItem $firefoxPath | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    $hasProfile = Test-Path "$firefoxPath\$profileFolder\policies.json"
    if ($hasProfile) {
      Write-Output "Found a custom firefox profile settings. Skipping uBlock install policy."
    } else {
      New-Item "$firefoxPath\$($profileFolder.Name)\policies.json"
      $policy = @"
{
  "policies": {
    "Extensions": {
      "Install": ["https://addons.mozilla.org/firefox/downloads/file/4003969/ublock_origin-1.44.4.xpi"]
    }
  }
}
"@
      Set-Content "$firefoxPath\$profileFolder\policies.json" -Value $policy
    }
  }
  Add-Note -Title "Installed uBlock Origin" -Body "We loaded the uBlock Origin extension on your browsers. uBlock Origin is a wide-spectrum blocker which blocks out annoying and intrusive ads online, trackers, and known infected websites. uBlock Origin will speed up your web surfing while helping keep you safe online."
  Add-SubItem -Title "Uninstall unused browsers"
  Add-SubItem -Title "Check for notification spam"
  Add-SubItem -Title "Remove junk extensions"
  Write-Result
}

Switch ($RunType) {
    "check"  { Start-CheckRun; break }
    "repair" { Start-RepairRun; break }
    default  { Start-CheckRun; break }
}
