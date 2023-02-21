param([string]$RunType)
$path = $MyInvocation.MyCommand.Path
Import-Module -Name "$(Split-Path $path -Parent)\modules\output"
Add-ScriptHeader -Path "$path"

 $issues = $false
Function ConvertTo-Hex {
  Param([int]$Number)
  '0x{0:x}' -f $Number
}

$cimParams = @{
  Namespace   = "root/SecurityCenter2"
  ClassName   = "Antivirusproduct"
  ErrorAction = "Stop"
}

Try {
  $AV = Get-CimInstance @CimParams
}
Catch {
  Write-Output "$($_.Exception.Message)"
  $cimParams.cimsession = $null
}

foreach ($item in $AV) {
  $hx = ConvertTo-Hex $item.ProductState
  $mid = $hx.Substring(3, 2)
  if ($mid -match "00|01") {
      $Enabled = $False
  }
  else {
      $Enabled = $True
  }
  $end = $hx.Substring(5)
  if ($end -eq "00") {
      $UpToDate = $True
  }
  else {
      $UpToDate = $False
  }

  $results += $item | Select-Object Displayname, ProductState,
  @{Name = "Enabled"; Expression = { $Enabled } },
  @{Name = "UpToDate"; Expression = { $UptoDate } },
  @{Name = "Path"; Expression = { $_.pathToSignedProductExe } },
  Timestamp,
  @{Name = "Computername"; Expression = { $_.PSComputername.toUpper() } }
}

$foundAVs = ($results | Where-Object { $_.enabled })

if (!$foundAVs){
  Write-Output "WARNING: No active AVs found"
  $issues = $true
}

ForEach ($activeAV in $foundAVs){
  Write-Output "[Found AV: $($activeAV.displayName) Status: $(If ($activeAV.Enabled) {"Enabled"} Else {"Disabled"}) Up-to-date: $($activeAV.UpToDate)]"
  if (!$activeAV.Enabled){
    $issues = $true
  }
}

if (((Get-NetFirewallProfile | Select-Object name,enabled) | Where-Object { $_.Enabled -eq $True } | Measure-Object ).Count -eq 3) {Write-Output "[Firewall Status: OK]"} else {Write-Output "Firewall Status: OFF"; $issues = $true}

$SS = Get-ItemProperty -Path 'HKCU:\SOFTWARE\Microsoft\Edge\SmartScreenEnabled\' -ErrorAction Stop
$SSPua = Get-ItemProperty -Path 'HKCU:\SOFTWARE\Microsoft\Edge\SmartScreenPuaEnabled\' -ErrorAction Stop

if ($SS.'(default)' -eq 0) {
  Write-Output "[WARNING: SmartScreen is disabled]"
  $issues = $true
} else {
  Write-Output "[SmartScreen enabled]"
}

if ($SSPua.'(default)' -eq 0) {
  Write-Output "[WARNING: PUA disabled]"
  $issues = $true
} else {
  Write-Output "[PUA enabled]"
}

if ($issues) {
  Write-Result
  exit 2
}
Write-Result
