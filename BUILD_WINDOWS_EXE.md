# MagicDraw Migration UAT Comparator — Windows EXE Build

## What testers receive

The production distribution is a **one-directory, windowed** Windows application:

```text
MagicDraw_UAT_Comparator\
  MagicDraw_UAT_Comparator.exe
  _internal\
  README.txt
```

Testers double-click `MagicDraw_UAT_Comparator.exe`. They do **not** need Python and do not run a `.bat` file.

The GUI explicitly requires:

- **Baseline — Expected: MagicDraw 2022xR2**
- **Candidate — Expected: MagicDraw 2024xR3**

The GUI also reads the fingerprint's captured runtime and warns when the selected baseline does not look like the Java 11 release family or the selected candidate does not look like the Java 17 release family. This is a selection aid, not authoritative release detection.

## Files required on the Windows build machine

Keep these files together:

```text
MagicDraw_UAT_Comparator_GUI.pyw
UAT_Fingerprint_Comparator_v1_9.py
MagicDraw_UAT_Comparator_version_info.txt
Build_MagicDraw_UAT_Comparator.ps1
```

Only the **build machine** needs:

1. Windows x64
2. Python
3. PyInstaller installed in that Python environment

End-user/tester workstations do not need Python.

## Build

From an approved PowerShell session in this folder:

```powershell
.\Build_MagicDraw_UAT_Comparator.ps1
```

If Python is installed at a specific path:

```powershell
.\Build_MagicDraw_UAT_Comparator.ps1 -Python "C:\Path\To\python.exe"
```

The output is:

```text
dist\MagicDraw_UAT_Comparator\MagicDraw_UAT_Comparator.exe
dist\MagicDraw_UAT_Comparator_1.0.0_Windows_x64.zip
```

If company policy blocks PowerShell scripts too, the build can be performed directly from an approved Command Prompt/terminal with:

```text
python -m PyInstaller --noconfirm --clean --windowed --onedir --name MagicDraw_UAT_Comparator --version-file MagicDraw_UAT_Comparator_version_info.txt MagicDraw_UAT_Comparator_GUI.pyw
```

No `.bat` file is involved.

## Recommended enterprise deployment

Build the executable once on an approved Windows build workstation or CI runner, then submit the resulting distribution folder/ZIP through the organization's normal software scanning and code-signing process before sharing it with testers.
