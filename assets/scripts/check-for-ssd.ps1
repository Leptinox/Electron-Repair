param([string]$RunType)
$path = $MyInvocation.MyCommand.Path
Import-Module -Name "$(Split-Path $path -Parent)\modules\output"
Add-ScriptHeader -Path "$path"

$errors = $false

$systemPartition = Get-Partition | Where-Object {$_.IsBoot -eq $true}
$systemDisk = Get-PhysicalDisk | Where-Object {$_.DeviceId -eq $systemPartition.DiskNumber}

Get-PhysicalDisk | ForEach-Object {
  if ($_.HealthStatus -ne 'Healthy') {
    Write-Output "Found unhealthy disk: $($_.FriendlyName)"
  }
}

if (($systemDisk.Size / 1GB -lt 150) -and $systemDisk.BusType -eq 'NVMe') {
  Write-Output "System disk has small sotrage capacity: $($systemDisk.Size / 1GB). Consider upgrading to NVMe if supported."
}

if ($systemDisk.MediaType -ne 'SSD'){
    Write-Output "WARNING: Windows is not installed on an SSD disk:`n$(Out-String -InputObject $systemDisk)"
    $errors = $true
}


if ($errors) {
  Write-Result
  exit 2
} else {
  Write-Output "No issues found"
  Write-result
}
