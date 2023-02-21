param([string]$RunType)
$path = $MyInvocation.MyCommand.Path
Import-Module -Name "$(Split-Path $path -Parent)\modules\output"
Add-ScriptHeader -Path "$path"

$memory = Get-CimInstance Win32_PhysicalMemory
$memory | ForEach-Object{
  $size = [math]::round($_.Capacity / 1GB)
  Write-Output "[$($_.BankLabel): Size $size GB, Speed $($_.ConfiguredClockSpeed)]"
}
Write-Result
