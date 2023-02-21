param([string]$RunType)
$path = $MyInvocation.MyCommand.Path
Import-Module -Name "$(Split-Path $path -Parent)\modules\output"
Add-ScriptHeader -Path "$path"

$issues = $false

$disks = Get-Disk | Where-Object { $_.LargestFreeExtent -gt 1048576 } # in bytes

if ($null -ne $disks){
  Write-Output "WARNING: Found unallocated space in the following drive(s):"
  Write-Output "[$(Out-String -InputObject $disks)]"
  $issues = $true
}

ForEach ($disk in $(Get-Disk)){
  if ($disk.partitionstyle -eq 'raw'){
    Write-Output "WARNING: Found unformatted disk"
    Write-Output "$($disk.friendlyname)"
    $issues = $true
  }
}

if ($issues){
  Write-Result
  exit 2
} else {
  Write-Output "No issues found"
  Write-Result
}
