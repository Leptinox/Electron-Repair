param([string]$RunType)
$path = $MyInvocation.MyCommand.Path
Import-Module -Name "$(Split-Path $path -Parent)\modules\output"
Add-ScriptHeader -Path "$path"

$gpu = Get-CimInstance Win32_VideoController
Write-Output $gpu.Name
Write-Result
