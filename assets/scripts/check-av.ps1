param([string]$RunType)
$path = $MyInvocation.MyCommand.Path
Import-Module -Name "$(Split-Path $path -Parent)\modules\output"
Add-ScriptHeader -Path "$path"

$avs = Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntivirusProduct
if (!$avs) {
  Write-Output "WARNING: No AV(s) found"
  Write-Result
  exit 2
} else {
  $avs | ForEach-Object {
    Write-Output "Found AV(s): `n$($_.displayName)"
  }
  Write-Result
}
