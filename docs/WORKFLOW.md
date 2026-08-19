# MagicDraw UAT Model Fingerprint Workflow

## Purpose

This workflow compares the structure and semantic content of the same MagicDraw model between **MagicDraw 2022xR2** and **MagicDraw 2024xR3**.

The fingerprint macros generate model data that is compared using the browser-based **MagicDraw UAT Comparator**.

## Workflow

```text
MagicDraw 2022xR2
        |
        | Run MD2022_UAT_Model_Fingerprint_v1_3.groovy
        v
2022 Fingerprint JSON
        |
        | Save project locally
        | Open / migrate in MagicDraw 2024xR3
        v
MagicDraw 2024xR3
        |
        | Run MD2024_UAT_Model_Fingerprint_v1_3.groovy
        v
2024 Fingerprint JSON
        |
        v
MagicDraw UAT Comparator
        |
        +-- Baseline  = 2022 Fingerprint JSON
        +-- Candidate = 2024 Fingerprint JSON
        |
        v
Acceptance Summary + Detailed Findings
```

## 1. Generate the 2022xR2 baseline

1. Open the source model in **MagicDraw 2022xR2**.
2. If the project is stored in Teamwork Cloud, open the normal TWC project/version that will serve as the migration baseline.
3. Run `MD2022_UAT_Model_Fingerprint_v1_3.groovy`.
4. Allow the macro to complete and retain the generated files.

The 2022 fingerprint JSON is used as the **Baseline** in the comparator.

## 2. Save and migrate the model

1. Save the 2022xR2 project locally.
2. Open that saved local project in **MagicDraw 2024xR3**.
3. Allow MagicDraw to perform its normal version conversion.
4. Do not intentionally modify the model before generating the 2024 fingerprint.

The 2024 project does **not** need to be uploaded back to Teamwork Cloud for comparison.

## 3. Generate the 2024xR3 candidate

1. Open the migrated local model in **MagicDraw 2024xR3**.
2. Run `MD2024_UAT_Model_Fingerprint_v1_3.groovy`.
3. Allow the macro to complete and retain the generated files.

The 2024 fingerprint JSON is used as the **Candidate** in the comparator.

## Expected macro output

Each macro run generates:

- `*_MD_UAT_Elements_<version>_<timestamp>.csv`
- `*_MD_UAT_Fingerprint_<version>_<timestamp>.json`
- `*_MD_UAT_Summary_<version>_<timestamp>.csv`

The browser comparator only requires:

```text
2022: *_MD_UAT_Fingerprint_2022_*.json
2024: *_MD_UAT_Fingerprint_2024_*.json
```

The Elements and Summary CSV files are retained for engineering review/troubleshooting.

## 4. Compare the fingerprints

Open `MagicDraw_UAT_Comparator.html` in Edge or Chrome.

Select:

- **Baseline — Expected: MagicDraw 2022xR2**
- **Candidate — Expected: MagicDraw 2024xR3**

Then choose **Compare 2022xR2 → 2024xR3**.

The comparator runs locally in the browser and does not upload the selected JSON files.

## 5. Review the results

The Acceptance Summary reports model changes in management-readable categories:

- Elements
- Properties
- Relationships
- Connectors
- Tagged values
- Stereotype applications
- Diagrams
- Diagram content
- Unresolved model references

Click a Findings count to filter the Detailed Findings view to that capability.

Detailed findings explicitly identify change types such as **ADDED**, **MISSING**, **REMOVED**, **MOVED**, **VALUE CHANGED**, **TYPE CHANGED**, **REFERENCE ADDED/REMOVED**, and **EXPRESSION CHANGED**.

### Tagged-value inventory

The raw number of MagicDraw tag slots may change when stereotypes are instantiated or migrated. Therefore the management summary treats **Tagged values as findings-only**. Raw tagged-value inventory counts are retained in **Technical diagnostics**.

## Recommended distribution package

`MagicDraw_UAT_Comparator.zip` should contain:

- `MD2022_UAT_Model_Fingerprint_v1_3.groovy`
- `MD2024_UAT_Model_Fingerprint_v1_3.groovy`
- `MagicDraw_UAT_Comparator.html`
- `MagicDraw_UAT_Model_Fingerprint_Workflow.pdf`
