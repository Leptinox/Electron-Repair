$folder = Split-Path $path -Parent
$file = Split-Path $path -Leaf
$fileEnd = $file.Lenght
$log = "$($file.Substring(0, $fileEnd - 3))log"
Start-Transcript -Path "$folder\$log" | Out-Null
Import-Module -Name $folder\modules\output
