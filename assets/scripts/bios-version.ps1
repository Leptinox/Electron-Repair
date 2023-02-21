param([string]$RunType)
$path = $MyInvocation.MyCommand.Path
Import-Module -Name "$(Split-Path $path -Parent)\modules\output"
Add-ScriptHeader -Path "$path"

$pcInfo = Get-ComputerInfo

$mobo = Get-CimInstance -Class Win32_BaseBoard | Select-Object Manufacturer, Product, SerialNumber, Version
Write-Output "Motherborard:"
Write-Output "Manufacturer: $($mobo.Manufacturer) Product: $($mobo.Product) Serial Number: $($mobo.SerialNumber) Version: $($mobo.Version)"

$biosVer = $pcInfo.BiosBIOSVersion
$biosDate = $pcInfo.BiosReleaseDate
Write-Output "Manual intervention required: check BIOS updates"
Write-Output "BIOS version: '$biosVer`n'"
Write-Output "Release date: $biosDate"
Add-SubItem -Title "Check for and install BIOS updates"
Add-Note -Title "Drivers BIOS" -Body "We checked your computer for driver updates and installed the latest version of your drivers. A driver is a program that controls the communication between Windows and a component or peripheral in your computer to allow it to function. We also checked to be sure you were running the latest version of your computer's BIOS. When you push the power button, the BIOS initializes and configures all the components in your computer and performs a power-on self-test before loading your boot device to allow Windows to start. Keeping your drivers and BIOS up-to-date is crucial for the performance, stability, and security of your system."
Write-Result
exit 2
