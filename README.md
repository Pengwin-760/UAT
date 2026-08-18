# MagicDraw Migration UAT Comparator

Portable UAT tooling for comparing MagicDraw 2022xR2 model fingerprints against locally migrated MagicDraw 2024xR3 fingerprints.

## Expected workflow

1. Run the v1.3 fingerprint macro against the **MagicDraw 2022xR2** baseline model.
2. Save the 2022 project locally and open/migrate that local copy in **MagicDraw 2024xR3**.
3. Run the same fingerprint macro against the 2024xR3 model.
4. Use the Windows GUI comparator to select:
   - **Baseline — Expected: MagicDraw 2022xR2**
   - **Candidate — Expected: MagicDraw 2024xR3**
5. Generate the management-friendly HTML/CSV/JSON comparison report.

The 2024 model does **not** need to be uploaded back to Teamwork Cloud for comparison.

## Easiest way to get the Windows application

1. Open this repository's **Actions** tab.
2. Select **Build MagicDraw UAT Comparator**.
3. Choose **Run workflow** on `main`.
4. When the workflow completes, download the `MagicDraw_UAT_Comparator_1.0.0_Windows_x64` artifact.
5. Extract the artifact and run `MagicDraw_UAT_Comparator.exe`.

The workflow is self-contained: the complete comparator build source is stored in `.buildkit/` as four verified Base64 chunks. GitHub Actions reconstructs the build kit before running PyInstaller.

## Build on an approved Windows workstation instead

If your organization permits local builds and Python/PyInstaller are available:

```powershell
.\Build_MagicDraw_UAT_Comparator.ps1
```

See [`BUILD_WINDOWS_EXE.md`](BUILD_WINDOWS_EXE.md) for full instructions.

## Repository contents

- `MagicDraw_UAT_Comparator_GUI.pyw` — Windows GUI front end.
- `Build_MagicDraw_UAT_Comparator.ps1` — approved-machine Windows build helper.
- `MagicDraw_UAT_Comparator_version_info.txt` — Windows executable version metadata.
- `.buildkit/` — embedded complete v1.9 comparator build source used by CI.
- `.github/workflows/build-windows-exe.yml` — repeatable GitHub Actions Windows build.

## Data handling

Do not commit project fingerprint JSON files or generated UAT reports containing program/model information unless they are approved for storage in this repository. The application source itself does not require model data to be checked into GitHub.
