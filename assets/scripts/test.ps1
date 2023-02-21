param([string]$RunType)
$path = $MyInvocation.MyCommand.Path
Import-Module -Name "$(Split-Path $path -Parent)\modules\output"
Add-ScriptHeader -Path "$path"


Write-Output -Output "Error 1 was found"
Write-Output -Output "Error 2 was found"
Add-SubItem -Title "Fix error 1"
Add-SubItem -Title "Fix error 2"
Add-SubItem -Title "Fix error 3"
Add-Note -Title "Test" -Body "My Body"

Write-Result
exit 1
