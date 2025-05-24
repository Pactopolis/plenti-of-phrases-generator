param (
    [string]$SourcePath,
    [string]$DestinationZip
)

# Resolve paths
$source = Resolve-Path $SourcePath
$sourcePathStr = $source.Path
$destination = Resolve-Path -Path $DestinationZip -ErrorAction SilentlyContinue
if (-not $destination) {
    $destination = (Join-Path -Path (Get-Location) -ChildPath $DestinationZip)
}

Add-Type -AssemblyName System.IO.Compression.FileSystem

# Create Zip file
$zipFileStream = [System.IO.File]::Open($destination, [System.IO.FileMode]::Create)
$zipArchive = New-Object System.IO.Compression.ZipArchive($zipFileStream, [System.IO.Compression.ZipArchiveMode]::Create)

Get-ChildItem -Path $sourcePathStr -Recurse -File | Where-Object {
    $_.FullName -notmatch '\\\.git\\' -and
    $_.FullName -notmatch '\\node_modules\\' -and
    $_.FullName -notmatch '\\test\\__snapshots__\\' -and
    $_.Extension -ne '.zip'
} | ForEach-Object {
    $relativePath = $_.FullName.Substring($sourcePathStr.Length + 1).TrimStart('\')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zipArchive, $_.FullName, $relativePath)
}

$zipArchive.Dispose()
$zipFileStream.Dispose()
