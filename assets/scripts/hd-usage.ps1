param([string]$RunType)
$path = $MyInvocation.MyCommand.Path
Import-Module -Name "$(Split-Path $path -Parent)\modules\output"
Add-ScriptHeader -Path "$path"

$errors = $false
$treshold = 20
$hdUsage = Get-CimInstance win32_logicaldisk -ErrorAction Stop
$hdUsage | ForEach-Object {
  $size = $_.Size
  $free = $_.FreeSpace
  $freepercent = ($free/$size) * 100
  if ($freepercent -lt $treshold) {
    $errors = $true
    Write-Output "Drive $($_.DeviceID) free space below 20% (free space is $([Math]::Round($freepercent))%)"
  }
}

if ($errors) {
  Write-Result
  exit 2
}
Write-Output "No issues found"
Write-Result
