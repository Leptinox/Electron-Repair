param([string]$RunType)
$path = $MyInvocation.MyCommand.Path
Import-Module -Name "$(Split-Path $path -Parent)\modules\output"
Add-ScriptHeader -Path "$path"

$pcInfo = Get-ComputerInfo
$manufacturer = $pcInfo.CsManufacturer
$model = $pcInfo.CsModel
Write-Output "$manufacturer $model"
Write-Result
