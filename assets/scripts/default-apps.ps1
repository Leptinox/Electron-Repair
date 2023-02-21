param([string]$RunType)
$path = $MyInvocation.MyCommand.Path
Import-Module -Name "$(Split-Path $path -Parent)\modules\output"
Add-ScriptHeader -Path "$path"

Start-Process ms-settings:defaultapps
Write-Output "Manual intervention required"
Write-Result
exit 2
