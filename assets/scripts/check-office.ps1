param([string]$RunType)
$path = $MyInvocation.MyCommand.Path
Import-Module -Name "$(Split-Path $path -Parent)\modules\output"
Add-ScriptHeader -Path "$path"

function Test-CommandExists {
 Param ($command)
 Try {if(Get-Command $command){$true}}
 Catch {$false}
}

function Start-CheckRun {
  $errors = $false
  $OfficeVersionX32 = (Get-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Office\ClickToRun\Configuration' -ErrorAction SilentlyContinue -WarningAction SilentlyContinue) | Select-Object -ExpandProperty VersionToReport
  $OfficeVersionX64 = (Get-ItemProperty -Path 'HKLM:\SOFTWARE\WOW6432Node\Microsoft\Office\ClickToRun\Configuration' -ErrorAction SilentlyContinue -WarningAction SilentlyContinue)
  if ($null -ne $OfficeVersionX32 -and $null -ne $OfficeVersionX64) {
    $OfficeVersion = "WARNING: Both x32 version ($OfficeVersionX32) and x64 version ($OfficeVersionX64) installed!"
    $errors = $true
  } elseif ($null -eq $OfficeVersionX32 -or $null -eq $OfficeVersionX64) {
    $OfficeVersion = $OfficeVersionX32 + $OfficeVersionX64
  }
  $OfficeVersionMain = $OfficeVersion.Split(".")[0]
  $OfficeVersionSub1  = $OfficeVersion.ToString().Replace("16.0.","")
  Switch  ($OfficeVersionMain) {
    11      {$MSOffice ="Office 2003 ($OfficeVersion)" }
    12      {$MSOffice ="Office 2007 ($OfficeVersion)" }
    14      {$MSOffice ="Office 2010 ($OfficeVersion)" }
    15      {$MSOffice ="Office 2013 ($OfficeVersion)" }
    16      {$MSOffice = "Office 365 (Version $(($LatestOfficeVersions | Where-Object {$_.Build -eq $OfficeVersionSub1}).Version), $OfficeVersionSub1)"}
    default {$MSOffice = $OfficeVersion}
    $null   {$MSOffice = "No Office installed."; $errors = $true}
  }

  if ($OfficeVersionMain) {
    $license = Get-CimInstance -ClassName SoftwareLicensingProduct | Where-Object PartialProductKey | Where-Object {$_.Name -Like "Office*"}
    if (($license.LicenseStatus -ne 1) -or ($license.LicenseStatus -ne 5)) {
      Write-Output "Office has possible license issues"
      Add-SubItem -Title "Verify Office is activated"
    }
  }

  $hasOpenOffice = Get-CimInstance -Class Win32_Product | Where-Object {$_.Name -Like 'OpenOffice*'}

  if ($hasOpenOffice) {
    Write-Output "OpenOffice is installed: $($haOpenOffice.Name)"
  }

  Write-Output $MSOffice
  Write-Result
  if ($errors) {
    exit 2
  }
}

function Start-RepairRun {
  # Uninstall OpenOffice if installed
  $hasOpenOffice = Get-CimInstance -Class Win32_Product | Where-Object {$_.Name -Like 'OpenOffice*'}

  if ($hasOpenOffice) {
    Uninstall-Package -Name $hasOpenOffice.Name
    Write-Output "$($haOpenOffice.Name) was uninstalled"
  }

  #Install LibreOffice if no Office app found
  $OfficeVersionX32 = (Get-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Office\ClickToRun\Configuration' -ErrorAction SilentlyContinue -WarningAction SilentlyContinue) | Select-Object -ExpandProperty VersionToReport
  $OfficeVersionX64 = (Get-ItemProperty -Path 'HKLM:\SOFTWARE\WOW6432Node\Microsoft\Office\ClickToRun\Configuration' -ErrorAction SilentlyContinue -WarningAction SilentlyContinue)
  if ($null -ne $OfficeVersionX32 -and $null -ne $OfficeVersionX64) {
    $OfficeVersion = "WARNING: Both x32 version ($OfficeVersionX32) and x64 version ($OfficeVersionX64) installed!"
  } elseif ($null -eq $OfficeVersionX32 -or $null -eq $OfficeVersionX64) {
    $OfficeVersion = $OfficeVersionX32 + $OfficeVersionX64
  }

  $OfficeVersionMain = $OfficeVersion.Split(".")[0]

  if ($null -eq $OfficeVersionMain) {
    Add-Type -AssemblyName PresentationFramework
    $msgBoxInput =  [System.Windows.MessageBox]::Show('Office app not found: would you like to install LibreOffice?', 'Confirmation', 'YesNo', 'Warning')

    switch  ($msgBoxInput) {
        'Yes' {
          Invoke-WebRequest -Uri "https://raw.githubusercontent.com/chocolatey-community/chocolatey-packages/master/automatic/libreoffice-streams/libreoffice-streams.json" -OutFile $env:temp\libreoffice-streams.json
          $package = Get-Content -Path $env:temp\libreoffice-streams.json | ConvertFrom-Json
          Invoke-WebRequest -Uri "https://download.documentfoundation.org/libreoffice/stable/$($package.fresh)/win/x86_64/LibreOffice_$($package.fresh)_Win_x64.msi" -OutFile $env:temp\LibreOffice-Install.msi
          try {
            Start-Process -Wait $env:temp\LibreOffice-Install.msi -ArgumentList "/qn /passive /norestart"
            Write-Output "LibreOffice was installed"
          }
          catch {
            Write-Output "Error installing LibreOffice"
            Write-Result
            exit 2
          }
          # apply config
          Start-Sleep -Seconds 30
          $configExist = Test-Path "$env:APPDATA\LibreOffice\4\user"
          if (!$configExist) {
            New-Item -Path "$env:APPDATA\LibreOffice\4\user" -ItemType "directory"
          }
          Copy-Item -Path $folder\utilities\registrymodifications.xcu -Destination "$env:APPDATA\LibreOffice\4\user" -Force
          Write-Output "Applied LibreOffice configuration"
          Add-Note -Title "LibreOffice installed" -Body "We loaded and configured LibreOffice on your computer for you. LibreOffice is a free, open-source Office Suite comparable to Microsoft Office. It offers Writer (Word), Calc (Excel), Impress (PowerPoint), and more. We have pre-configured LibreOffice to automatically save files in the widely used Office 2007-365 format for you."
        }
        'No' {
          break;
        }
    }
  } else {
    Write-Output "Microsoft Office is installed"
  }
  Write-Result
}

Switch ($RunType) {
    "check"  { Start-CheckRun; break }
    "repair" { Start-RepairRun; break }
    default  { Start-CheckRun; break }
}
