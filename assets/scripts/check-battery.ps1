param([string]$RunType)
$path = $MyInvocation.MyCommand.Path
Import-Module -Name "$(Split-Path $path -Parent)\modules\output"
Add-ScriptHeader -Path "$path"

$errors = $false
$AlertPercent = "70"

& powercfg /batteryreport /XML /OUTPUT "$env:temp\batteryreport.xml" | Out-Null
$pcInfo = Get-ComputerInfo
Start-Sleep 5
$reportFound = Test-Path "$env:temp\batteryreport.xml"

if ($reportFound) {
  [xml]$Report = Get-Content "$env:temp\batteryreport.xml"
  $BatteryStatus = $Report.BatteryReport.Batteries | ForEach-Object {
    [PSCustomObject]@{
        DesignCapacity = $_.Battery.DesignCapacity
        FullChargeCapacity = $_.Battery.FullChargeCapacity
        CycleCount = $_.Battery.CycleCount
        Id = $_.Battery.id
    }
  }
}

if (!$BatteryStatus) {
    Write-Output "This device does not have batteries, or we could not find the status of the batteries. Device type is $($pcInfo.CsPCSystemType)"
} else {
    foreach ($Battery in $BatteryStatus) {
        if ([int64]$Battery.FullChargeCapacity * 100 / [int64]$Battery.DesignCapacity -lt $AlertPercent) {
          $errors = $true
          Write-Output "The battery health is less than expected. The battery was designed for $($battery.DesignCapacity) but the maximum charge is $($Battery.FullChargeCapacity). The battery info is $($Battery.id)"
        }
    }
}

if ($errors) {
  Write-Result
  exit 2
}
Write-Result
