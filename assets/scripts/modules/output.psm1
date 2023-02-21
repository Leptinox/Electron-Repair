$scriptResult = @{
  output    = @()
  itemNotes = @()
  subItems  = @()
}

$result = [pscustomobject]$scriptResult

$folder = Split-Path $Path -Parent

function Add-ScriptHeader {
  param (
    [Parameter (Mandatory = $true)] [String]$Path
  )
  $folder = Split-Path $Path -Parent
  $file = Split-Path $Path -Leaf
  $fileEnd = $file.Length
  $log = "$($file.Substring(0, $fileEnd -3))log"
  Start-Transcript -Path "$folder\$log" | Out-Null
}

function Add-Note {
  param (
      [Parameter (Mandatory = $true)] [String]$Title,
      [Parameter (Mandatory = $true)] [String]$Body
    )
  $result.itemNotes += @{noteTitle = $Title;noteBody = $Body}
}

function Write-Output {
  param (
      [Parameter (Mandatory = $true)] [String]$Output
    )
  $result.output += $Output
}

function Add-SubItem {
  param (
      [Parameter (Mandatory = $true)] [String]$Title
    )
  $result.subItems += $Title
}

function Write-Result {
  Write-Host ($result | ConvertTo-Json)
}

Export-ModuleMember -Function Add-ScriptHeader, Write-Result, Write-Output, Add-Note, Add-SubItem -Variable result, folder
