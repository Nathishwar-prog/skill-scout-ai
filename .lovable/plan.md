
## What’s wrong right now (root cause)
- The dashboard logic already expects **two inputs**: `resumeText` and `jobDescription`:
  - `handleResumeUpload(content, jd, fileName?)` calls the backend function `compare-jd` with `{ resumeText: content, jobDescription: jd }`.
- But the UI component you’re using for input (`src/components/dashboard/ResumeUpload.tsx`) only collects **resume content** (upload or paste) and never asks for / sends a **Job Description**.
- Result: the screen shows only resume upload, and even if you upload a resume, the job description is `undefined`, so the JD comparison can’t work.

## Goal (what I will implement)
On `/dashboard` → tab “Upload”:
- User can **paste Job Description (JD)** in a dedicated textarea.
- User can **upload resume** (or paste resume text).
- “Analyze” will run only when **both JD + resume are present**.
- The analysis results shown will include:
  - ATS score
  - Job match
  - Skill match
  - Similarity score
  - Skill gap analysis (critical/important/nice-to-have)
  - (All already supported by `compare-jd` + `JDAnalysisResults.tsx`)

## Planned changes (files)
### 1) Update ResumeUpload UI to include Job Description input
**File:** `src/components/dashboard/ResumeUpload.tsx`

Changes:
- Add a new state: `jobDescription` (string).
- Add a **Job Description Textarea** (always visible at the top of the card).
- Update the “Analyze Resume” / “Browse Files” flows so they call `onUpload(resumeText, jobDescription, fileName?)`.
- Add simple validation:
  - Disable submit if JD is empty.
  - If user uploads a resume but JD is empty, show a clear message (either inline or via toast callback depending on existing pattern).
- Improve UX copy:
  - Placeholder for JD: “Paste the job description here…”
  - Add small helper text: “JD is required for ATS + match analysis.”

### 2) Fix ResumeUpload prop types to match Dashboard usage
**File:** `src/components/dashboard/ResumeUpload.tsx`

Update the prop contract:
- From: `onUpload: (content: string, fileName?: string) => void`
- To: `onUpload: (resumeText: string, jobDescription: string, fileName?: string) => void`

This aligns with `Dashboard.tsx` which already has:
- `const handleResumeUpload = async (content: string, jd: string, fileName?: string) => { ... }`

### 3) Small navigation label polish (optional but recommended)
**File:** `src/components/dashboard/DashboardLayout.tsx`

Update sidebar label:
- From: “Upload Resume”
- To: “Resume + JD” (or “Upload & JD”)

This reduces confusion and makes it obvious the JD input exists.

### 4) Confirm result rendering doesn’t hide skill gap analysis
**Files:**  
- `src/pages/Dashboard.tsx`  
- `src/components/dashboard/JDAnalysisResults.tsx`

Quick verification during implementation:
- Ensure `setJdAnalysis(data.analysis)` remains correct (it is).
- Ensure the UI does not crash if some arrays are missing.
  - If needed, add safe defaults in rendering (e.g., `analysis.matchedSkills ?? []`) so the section always renders reliably even when AI returns empty lists.

## End-to-end test plan (manual QA)
1. Login → go to `/dashboard`.
2. Click “Upload” (or “Resume + JD” if we rename).
3. Paste a JD into the JD textarea.
4. Upload a resume file OR paste resume text.
5. Click “Analyze”.
6. Confirm:
   - Loading state appears
   - Results show ATS score, job match, skill match, similarity
   - Skill gap analysis section appears with Critical/Important/Nice-to-have when applicable
7. Negative tests:
   - Try analyzing with JD empty → button disabled or clear message shown
   - Try analyzing with resume empty → button disabled or clear message shown

## Notes / future improvements (not required for this fix)
- Parsing PDF/DOCX properly (current demo reads as text)
- Save analyses to backend history per user
- Add a “Clear / New analysis” button inside the upload screen to reset JD + resume inputs quickly
