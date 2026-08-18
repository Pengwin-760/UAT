# MagicDraw Migration UAT Comparator

Portable UAT tooling for comparing MagicDraw 2022xR2 model fingerprints against locally migrated MagicDraw 2024xR3 fingerprints.

## Expected workflow

1. Run `UAT_Model_Fingerprint_v1_3.groovy` against the **MagicDraw 2022xR2** baseline model.
2. Save the 2022 project locally and open/migrate that local copy in **MagicDraw 2024xR3**.
3. Run the same fingerprint macro against the 2024xR3 model.
4. Use the Windows GUI comparator to select:
   - **Baseline — Expected: MagicDraw 2022xR2**
   - **Candidate — Expected: MagicDraw 2024xR3**
5. Generate the management-friendly HTML/CSV/JSON comparison report.

The 2024 model does **not** need to be uploaded back to Teamwork Cloud for comparison.

## Build the Windows application

The preferred build is a portable, windowed, one-directory PyInstaller application. On an approved Windows machine with Python and PyInstaller available:

```powershell
.\Build_MagicDraw_UAT_Comparator.ps1
```

Alternatively, use the **Build MagicDraw UAT Comparator** GitHub Actions workflow from the Actions tab. The workflow publishes the portable Windows application as a downloadable artifact.

See [`BUILD_WINDOWS_EXE.md`](BUILD_WINDOWS_EXE.md) for full instructions.

## Repository contents

- `MagicDraw_UAT_Comparator_GUI.pyw` — Windows GUI front end.
- `UAT_Fingerprint_Comparator_v1_9.py` — semantic comparison/reporting engine.
- `UAT_Model_Fingerprint_v1_3.groovy` — read-only MagicDraw fingerprint macro compatible with the 2022xR2 → 2024xR3 migration workflow.
- `Build_MagicDraw_UAT_Comparator.ps1` — approved-machine Windows build helper.
- `MagicDraw_UAT_Comparator_version_info.txt` — Windows executable version metadata.
- `.github/workflows/build-windows-exe.yml` — repeatable GitHub Actions Windows build.

## Data handling

Do not commit project fingerprint JSON files or generated UAT reports containing program/model information unless they are approved for storage in this repository. The application source itself does not require model data to be checked into GitHub.
