# MagicDraw Migration UAT Comparator

Browser-based UAT tooling for comparing a MagicDraw **2022xR2** model fingerprint against the same project after local migration to **MagicDraw 2024xR3**.

The tool is intended to help identify unexpected structural or semantic changes during version migration and support broader UAT activities involving collaboration, commit/sync, and Teamwork Cloud workflows.

## Recommended workflow

1. In **MagicDraw 2022xR2**, run `MD2022_UAT_Model_Fingerprint_v1_3.groovy` against the approved baseline model.
2. Save the 2022 project locally.
3. Open/migrate that local copy in **MagicDraw 2024xR3**.
4. In 2024xR3, run `MD2024_UAT_Model_Fingerprint_v1_3.groovy` before making intentional model edits.
5. Open [`MagicDraw_UAT_Comparator.html`](MagicDraw_UAT_Comparator.html) in Edge/Chrome and select:
   - **Baseline — Expected: MagicDraw 2022xR2**
   - **Candidate — Expected: MagicDraw 2024xR3**
6. Review the Acceptance Summary and drill into any findings.

The 2024 model does **not** need to be uploaded back to Teamwork Cloud for comparison.

## Browser comparator

The browser comparator runs locally. Fingerprint JSON files remain on the workstation and are not uploaded by the application.

The management-facing summary reports:

- Elements
- Properties
- Relationships
- Connectors
- Tagged values
- Stereotype applications
- Diagrams
- Diagram content
- Unresolved model references

Detailed findings include explicit change annotations such as **ADDED**, **MISSING**, **REMOVED**, **MOVED**, **TYPE CHANGED**, **VALUE CHANGED**, **REFERENCE ADDED/REMOVED**, and **EXPRESSION CHANGED**.

### Tagged-value inventory

MagicDraw can automatically instantiate stereotype/tag slots. Because the raw number of tag entries can change without representing an equivalent number of meaningful model edits, **Tagged values are findings-only in the management summary**. Raw tagged-value inventory counts remain available under **Technical diagnostics**.

## Distributed `MagicDraw_UAT_Comparator.zip`

The team distribution package is expected to contain:

- `MD2022_UAT_Model_Fingerprint_v1_3.groovy` — run in MagicDraw 2022xR2.
- `MD2024_UAT_Model_Fingerprint_v1_3.groovy` — run in MagicDraw 2024xR3.
- `MagicDraw_UAT_Comparator.html` — browser-based comparator.
- `MagicDraw_UAT_Model_Fingerprint_Workflow.pdf` — workflow/user guide.

The fingerprint macros also generate Elements CSV and Summary CSV files for engineering review, but the browser comparator only requires the two fingerprint JSON files.

## Repository browser source

The browser application is stored as a small HTML shell plus source files under `browser/`:

- `MagicDraw_UAT_Comparator.html`
- `browser/comparator.css`
- `browser/comparator-core-1.js`
- `browser/comparator-core-2.js`
- `browser/comparator-core-3.js`
- `browser/comparator-ui.js`

This modular layout is for source control. The distributed ZIP may use the equivalent single-file HTML build for easier team use.

## Legacy Windows executable build

The earlier Windows/PyInstaller build files remain in the repository for environments that allow unsigned/local executables, but the **browser comparator is the recommended deployment method** for the current corporate environment.

## Data handling

Do not commit project fingerprint JSON files or generated UAT reports containing program/model information unless they are approved for storage in this repository. The comparator source itself does not require model data to be checked into GitHub.
