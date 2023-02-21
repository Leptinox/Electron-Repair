param([string]$RunType)
$path = $MyInvocation.MyCommand.Path
Import-Module -Name "$(Split-Path $path -Parent)\modules\output"
Add-ScriptHeader -Path "$path"

$pcInfo = Get-ComputerInfo
$cpu = $pcInfo.CsProcessors
$cpu | ForEach-Object{
  Write-Output $_.Name
}
Write-Result
