# Assessment Report System — Changes Log

## Overview

This document tracks all changes made to the **report-frontend** and **reports-backend** codebases based on the requirements provided on 24-02-2026.

The system is a clinical/psychological report generator for children's IQ and educational assessments (MISIC and related tests).

---

## Status Key
- ✅ Already implemented (confirmed in existing code)
- 🔧 Applied in this session
- ⏳ Pending (not yet implemented)

---

## Frontend Changes (`report-frontend`)

### `src/components/PersonalDetailsTab.jsx`

#### ✅ Informant Field — Parents group + "Other" with conditional text field
- Added **"Parents"** as a selectable option alongside Father, Mother, Grand Parent, Guardian
- When **"Other"** is selected, a text input appears for specifying the informant (e.g., Caretaker, Warden)
- Uses `showOtherInformant` state to conditionally render the text field
- The custom value is captured via `onBlur` and stored in the `informant` field

#### ✅ School Name — Dropdown with "Other" + conditional text field
- Replaced plain text input with a **dropdown list of schools**
- Includes an **"Other"** option that reveals a text field for manual entry
- Current school list includes: Aga Khan Academy, Delhi Public School, Don Bosco, Kendriya Vidyalaya, Little Flower, Montessori, National Public School, Ryan International, St. Joseph's, St. Mary's, St. Xavier's, Vidya Niketan

#### ✅ Presenting Complaints — Type-and-suggest autocomplete
- Implemented a **type-and-suggest system** with tag-style display
- Suggestions include: Difficulty in concentration, **Memory issues**, Poor handwriting, Reading problems, Spelling mistakes, Difficulty in following instructions, Hyperactivity, Slow learner, Behavioural problems, Speech and language delay
- Selected complaints appear as removable tags
- Custom complaints can be added by typing and pressing Enter or clicking "Add"
- Complaints are synced to the form via `setValue`

---

### `src/components/RecommendationsTab.jsx`

#### ✅ Summary — Dropdown with preset clinical options
- Changed from plain textarea to a **dropdown** with the following options:
  - Mild Intellectual Disability
  - Moderate Intellectual Disability
  - Borderline Intellectual Functioning
  - Low Average Intellectual Functioning
  - Average Intellectual Functioning
  - High Average Intellectual Functioning
  - Superior Intellectual Functioning
  - Specific Learning Disability in Reading
  - Specific Learning Disability in Written Expression
  - Specific Learning Disability in Mathematics
  - Attention Deficit Hyperactivity Disorder (ADHD)
  - Other (type below) — reveals a custom text area
- Dropdown selection auto-fills the `summary` form field

#### ✅ Recommendations — Dynamic section
- Recommendations section uses `useFieldArray` for dynamic addition
- "Insert Sample" button provides clinically relevant recommendation templates via dropdown
- Multiple recommendations can be added

#### 🔧 `informantOther` field passed in form submission
- Added `formData.append("informantOther", values.informantOther || "")` to both:
  - `handleDownload` — for PDF generation
  - `handlePreview` — for live preview
- This ensures the custom "Other" informant text is sent to the backend and appears correctly in the report

---

## Backend Changes (`reports-backend`)

### `helpers/tqClassifier.js`

#### ✅ Terminology Updates — Level of intelligence labels
Updated all classification labels to use proper phrasing:

| TQ Score Range | Old Label | New Label |
|---|---|---|
| ≥ 130 | Very Superior | Very Superior level of intelligence |
| 120–129 | Superior | Superior level of intelligence |
| 110–119 | High Average | High Average level of intelligence |
| 90–109 | Average | Average level of intelligence |
| 80–89 | Low Average | Low Average level of intelligence |
| 70–79 | Borderline | **Borderline level of intelligence** |
| 60–69 | *(missing)* | **Low level of intelligence** *(new range added)* |
| < 60 | Extremely Low | Extremely low level of intelligence |

- Added the **60–69 range** as "Low level of intelligence" (previously missing)
- "Borderline" is now consistently phrased as "Borderline level of intelligence"

---

### `routes/tqRoutes.js`

#### ✅ Raw Score Exceeds Max → Assign Highest Possible TQ Score
- Previously returned `error: 'Raw score not found'` when raw score exceeded table maximum
- Now: if raw score > max raw score in the norm table, the system **assigns the highest possible TQ score** instead of showing N/A
- Returns a `capped: true` flag in the result for transparency
- Logic: finds the mapping entry with the highest `tq_score` and uses that value

---

### `index.js`

#### 🔧 "Other" Informant — Resolved to custom text in report
- `«Informant»` placeholder now checks:
  - If `informant === "other"` AND `informantOther` is provided → uses the custom text
  - Otherwise → uses the selected informant value as-is
- Ensures the PDF/preview shows the actual informant name, not the word "other"

#### 🔧 NIMHANS Section — Conditional rendering
- Previously: NIMHANS SLD Index - Arithmetic test section was **always printed** in the report
- Now: the section only appears if "NIMHANS" is present in the selected tests (`testsadministered` or `otherTest`)
- Implemented via `«NIMHANS_Section»` placeholder in the HTML template
- The `buildReplacements` function evaluates whether to inject the full NIMHANS block or an empty string

#### 🔧 Reading Age & Spelling Age — Dynamic placeholders
- Previously: reading age was hardcoded as `1`, spelling age as `2`, and chronological age as `10` in the template
- Now: uses proper placeholders:
  - `«reading_age»` — from `values.readingAge`
  - `«Spelling_age»` — from `values.spellingAge`
  - `«below_than»` — from `values.belowReading` (e.g., "below", "above")
  - `«below_than1»` — from `values.aboveSpelling`
  - `«Age»` — child's computed age

---

### `template/complete_report.html`

#### 🔧 Subtest Findings — "of performance" → "of intelligence"
All 10 subtest result sentences updated from:
> "On this subtest [Name] has scored [Level] of **performance**."

To:
> "On this subtest [Name] has scored **[Level]** of **intelligence**."

Affected subtests:
- Information, Comprehension, Arithmetic, Similarities, Digit Span / Vocabulary
- Picture Completion, Block Design, Object Assembly, Coding, Mazes

#### 🔧 NIMHANS — Removed from hardcoded Educational Assessment list
- Removed `<li>NIMHANS SLD index- Arithmetic test</li>` from the static tests list
- NIMHANS now only appears in the report body when the test was actually administered (see conditional logic above)

#### ✅ Social Savvy — Correctly placed under "Other Assessments"
- Social Savvy is listed under a separate `<p class="section-title">Other Assessments</p>` section
- It is **not** under the Educational Assessment list

#### 🔧 Reading Age & Spelling Age sections — Fixed hardcoded values
- Replaced hardcoded ages and comparisons with dynamic placeholders
- Reading section now reads: *"reading age was found to be **«reading_age»**. This score is **«below_than»** than «his_her» chronological age (**«Age»**)"*
- Spelling section similarly uses `«Spelling_age»` and `«below_than1»`

#### 🔧 `«NIMHANS_Section»` placeholder added
- Added `«NIMHANS_Section»` marker in the appropriate page div
- Replaced by either the full NIMHANS section HTML or an empty string at render time

---

## Pending Changes ⏳

The following requirements from the specification have **not yet been implemented** and are planned for upcoming sessions:

| # | Requirement | Notes |
|---|---|---|
| 6 | **Remove Raw Total Scores** from report | Remove Verbal Raw Total, Performance Raw Total, Overall Raw Score Total. Only PQ and Total IQ to display. |
| 7 | **Verbal intelligence categories display** | Confirm "Borderline level of intelligence" used consistently in reference notes (currently says "Borderline level of impairment" in table footnotes) |
| 8 | **Assessment ranges for Educational Assessment** | Ranges to be provided by client |
| 9 | **Background & Behavioral Observation** | Should change per child; explore auto-generating from report data |
| 10 | **Additional tests & complaints** | New tests and complaint options to be provided by client |
| 11 | **BONUS: DOC export** | Backend has `docxtemplater` installed but no `/download-preview-doc` endpoint yet |

---

## File Reference

| File | Location | Status |
|---|---|---|
| `PersonalDetailsTab.jsx` | `report-frontend/src/components/` | Updated |
| `RecommendationsTab.jsx` | `report-frontend/src/components/` | Updated |
| `tqClassifier.js` | `reports-backend/helpers/` | Updated |
| `tqRoutes.js` | `reports-backend/routes/` | Updated |
| `index.js` | `reports-backend/` | Updated |
| `complete_report.html` | `reports-backend/template/` | Updated |
| `VerbalTestsTab.jsx` | `report-frontend/src/components/` | No changes yet |
| `PerformanceTestsTab.jsx` | `report-frontend/src/components/` | No changes yet |
| `TestInformationTab.jsx` | `report-frontend/src/components/` | No changes yet |
| `validateRawScore.js` | `reports-backend/routes/` | No changes yet |
| `tqNorms.js` | `reports-backend/models/` | No changes yet |
