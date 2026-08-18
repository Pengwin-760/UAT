param(
    [string]$Python = "python",
    [switch]$SkipZip
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

Write-Host "MagicDraw Migration UAT Comparator - Windows Build" -ForegroundColor Cyan
Write-Host "Source: $Root"

# Verify Python.
try {
    & $Python --version
    if ($LASTEXITCODE -ne 0) { throw "Python command failed." }
} catch {
    throw "Python was not found using '$Python'. Run with -Python <path-to-python.exe> if needed."
}

# Verify PyInstaller without silently reaching out to the internet.
& $Python -c "import PyInstaller, sys; print('PyInstaller ' + PyInstaller.__version__)"
if ($LASTEXITCODE -ne 0) {
    throw "PyInstaller is not installed in this Python environment. Install an approved PyInstaller package first, then rerun this build script."
}

$Gui = Join-Path $Root "MagicDraw_UAT_Comparator_GUI.pyw"
$Engine = Join-Path $Root "UAT_Fingerprint_Comparator_v1_9.py"
$Version = Join-Path $Root "MagicDraw_UAT_Comparator_version_info.txt"

foreach ($f in @($Gui, $Engine, $Version)) {
    if (-not (Test-Path $f)) { throw "Required build input missing: $f" }
}

Write-Host "Building one-directory, windowed Windows application..." -ForegroundColor Cyan
& $Python -m PyInstaller `
    --noconfirm `
    --clean `
    --windowed `
    --onedir `
    --name "MagicDraw_UAT_Comparator" `
    --version-file "$Version" `
    "$Gui"

if ($LASTEXITCODE -ne 0) { throw "PyInstaller build failed." }

$Dist = Join-Path $Root "dist\MagicDraw_UAT_Comparator"
$Exe = Join-Path $Dist "MagicDraw_UAT_Comparator.exe"
if (-not (Test-Path $Exe)) { throw "Build completed without expected EXE: $Exe" }

# Add a tiny deployment note to the distribution folder.
@"
MagicDraw Migration UAT Comparator 1.0.0

Expected inputs:
  Baseline  = MagicDraw 2022xR2 fingerprint JSON
  Candidate = MagicDraw 2024xR3 fingerprint JSON

Run MagicDraw_UAT_Comparator.exe. Python is not required on tester workstations.
"@ | Set-Content -Path (Join-Path $Dist "README.txt") -Encoding UTF8

Write-Host "EXE created: $Exe" -ForegroundColor Green

if (-not $SkipZip) {
    $Zip = Join-Path $Root "dist\MagicDraw_UAT_Comparator_1.0.0_Windows_x64.zip"
    if (Test-Path $Zip) { Remove-Item $Zip -Force }
    Compress-Archive -Path (Join-Path $Dist "*") -DestinationPath $Zip -Force
    Write-Host "Distribution ZIP created: $Zip" -ForegroundColor Green
}

Write-Host "Build complete." -ForegroundColor Green
