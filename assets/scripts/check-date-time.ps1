param([string]$RunType)
$path = $MyInvocation.MyCommand.Path
Import-Module -Name "$(Split-Path $path -Parent)\modules\output"
Add-ScriptHeader -Path "$path"

#TODO: Check for correct timezone and DST
$dstStatus = (Get-Date).IsDaylightSavingTime()
$issues = $false
# Check for DST
if (!$dstStatus){
  Write-Output "DST is not active. Please check time settings. "
  $issues = $true
}
# Check for correct time zone
$timeZone = (Get-TimeZone).StandardName
if ($timezone -ne 'Central Standard Time'){
  Write-Output " Time zone is not set as CST. Please review TimeZone settings"
}

if ($issues) {
  Write-Result
  exit 2
} else {
  Write-Output "No issues found"
  Write-Result
}
