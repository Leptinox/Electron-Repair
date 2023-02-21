param([string]$RunType)
$path = $MyInvocation.MyCommand.Path
Import-Module -Name "$(Split-Path $path -Parent)\modules\output"
Add-ScriptHeader -Path "$path"

function Start-CheckRun {
  # Define paths where Office could be located
  $paths = @(
    "HKLM:\SOFTWARE\Microsoft\Office\ClickToRun",
    "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Office\ClickToRun"
  )
  # Variable to hold version
  $officeVersion = ""

  $versionFound = $false
  # Loop through paths and find version
  foreach ($path in $paths) {
    # Check to see if path exists
    if (Test-Path -Path "$path\Configuration") {
      $officeVersion = (Get-ItemProperty -Path "$path\Configuration" -Name "VersionToReport").VersionToReport
      $versionFound = $true
    }
  }

  if (!$versionFound) {
    Write-Output "Could not retrieve Office version. Office not installed or older version?"
    Write-Result
    exit 2
  }

  # Get version information
  $content = Invoke-RestMethod -Uri "https://docs.microsoft.com/en-us/officeupdates/update-history-office365-proplus-by-date" -Method Get

  # Cast current version to a version
  $build = [Version]$officeVersion

  # Get the version using regex
  $upToDate = $content -match "<a href=`"(?<Channel>.+?)`".+?>Version (?<Version>\d{4}) \(Build $($build.Build)\.$($build.Revision)\)"

  if (!$upToDate) {
    Write-Output "Unsupported/Outdated Office version:"
    Write-Output $build
    Write-Result
    exit 2
  }

  # Output the data
  $output = [PSCustomObject]@{
    Build = $build
    Version = $Matches['Version']
    Channel = ($Matches['Channel'] -split "#")[0]
  }

  Write-Output $output
  Write-Result
}

function Start-RepairRun {
  $updaterExist = Test-Path "$env:CommonProgramFiles\microsoft shared\ClickToRun\OfficeC2RClient.exe"
  if (!$updaterExist) {
    Write-Output "Did not find office update client. Office not installed or older version?"
    Write-Result
    exit 2
  }
  Start-Process "$env:CommonProgramFiles\microsoft shared\ClickToRun\OfficeC2RClient.exe" -ArgumentList "/update user" -Wait
  Write-Output "Office update client was run"
  Write-Result
}

Switch ($RunType) {
  "check"  { Start-CheckRun; break }
  "repair" { Start-RepairRun; break }
  default  { Start-CheckRun; break }
}
