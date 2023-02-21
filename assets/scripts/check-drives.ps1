param([string]$RunType)
$path = $MyInvocation.MyCommand.Path
Import-Module -Name "$(Split-Path $path -Parent)\modules\output"
Add-ScriptHeader -Path "$path"

$errors = $false

Get-Partition | ForEach-Object {
  Write-Output "[ Partition number: $($_.PartitionNumber) Drive letter: $($_.DriveLetter) Size: $($_.Size / 1GB) GB ] "
}

$SMART = Get-CimInstance -namespace root\wmi -Class MSStorageDriver_FailurePredictStatus

foreach ($res in $SMART) {
  if ($res.Active -eq $false) {
    Write-Output "SMART disabled on disk $($res.InstanceName)"
  }
  if ($res.PredictFailure -eq $true) {
    Write-Output "Issues found on disk $($res.InstanceName)"
  }
}

# Checking disk alignments
$partitions = Get-CimInstance -Class Win32_DiskPartition | Select-Object -Property DeviceId, Name, Description, BootPartition, PrimaryPartition, Index, Size, BlockSize, StartingOffset | Format-Table -AutoSize
$partitions | ForEach-Object {
  if ($_.StartingOffset % 4096 -ne 0) {
    Write-Output "WARNING: Disk $($_.Name) has drive alignment issues."
  }
}

$disks = Get-PhysicalDisk
$trim = fsutil behavior query DisableDeleteNotify

for ($i = 0; $i -lt $disks.Count; $i++) {
    $isSSD = $disks[$i] | Where-Object -Property MediaType -eq 'SSD'
    $enabled = $trim[$i] | ForEach-Object{($_ -split "\s+")[3]}
    if ($null -ne $isSSD -and $enabled -eq 1){
        Write-Output 'One or more SSDs have TRIM disabled'
        Write-Output "`nfsutil output:`n$trim"
        $errors = $true
    }
}

if ($errors) {
  exit 2
  Write-Result
} else {
  Write-Output "No issues found"
  Write-Result
}
