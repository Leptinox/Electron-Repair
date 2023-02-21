param([string]$RunType)
$path = $MyInvocation.MyCommand.Path
Import-Module -Name "$(Split-Path $path -Parent)\modules\output"
Add-ScriptHeader -Path "$path"

$exec = Test-Path $folder\utilities\adwcleaner.exe
if (!$exec) {
  Write-Output "AdwCleaner file not found"
  Write-Result
  exit 2
}

function Start-CheckRun {
  Start-Process -Wait $folder\utilities\adwcleaner.exe -ArgumentList "/eula /scan" -ErrorAction Stop
  Set-Location $env:HOMEDRIVE\AdwCleaner\Logs\
  $adwResult = Get-ChildItem -Attributes !Directory . | Sort-Object -Descending -Property LastWriteTime | Select-Object -First 1 | Get-Content
  $detectedItems = $adwResult -Match "Detected: "
  $detected = [int]$detectedItems.Substring(12, 1)
  if ($detected -gt 0) {
    Write-Output "WARNING: Run repair script. Detected $detected items"
    Write-Result
    exit 2
  } else {
    Write-Output "No issues found"
  }
  Write-Result
}

function Start-RepairRun {
  Start-Process -Wait $folder\utilities\adwcleaner.exe #-ArgumentList "/eula /clean /noreboot" -ErrorAction Stop
  Set-Location $env:HOMEDRIVE\AdwCleaner\Logs\
  $adwResult = Get-ChildItem -Attributes !Directory . | Sort-Object -Descending -Property LastWriteTime | Select-Object -First 1 | Get-Content
  $cleanedItems = $adwResult -Match "Cleaned: "
  Write-Output "AdwCleaner cleanup completed. $cleanedItems"
  Add-Note -Title "Adware found" -Body "Your computer was infected with adware. Most of these programs are installed alongside other programs; be careful what you download and where you download it from to keep your computer clean from future infections. We also found and cleaned tracking cookies in your system."
  Write-Result
}

function Start-Program {
  Start-Process $folder\utilities\adwcleaner.exe
}

Switch ($RunType) {
    "check"  { Start-CheckRun; break }
    "repair" { Start-RepairRun; break }
    "exec" { Start-Program; break }
    default  { Start-CheckRun; break }
}
