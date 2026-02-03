
# Re-generate Improvements & Resume Builder Plan

## Overview
This plan adds two features:
1. **Regenerate Improvements** - Allow users to generate new improvement suggestions for any historical analysis
2. **Resume Builder** - Create a new, improved resume document with all suggestions automatically applied

---

## Feature 1: Regenerate Improvements for Historical Analysis

### Current Problem
When loading an analysis from history, the `improvements` state is cleared (`setImprovements(null)`), and users have no way to regenerate suggestions without re-running the full analysis.

### Solution
Add a "Generate Improvements" button in the improvements tab that calls the existing `improve-resume` edge function using the stored `resumeText` and `jobDescription`.

### Changes

**File: `src/pages/Dashboard.tsx`**
- Add new state: `isRegenerating` (boolean)
- Add function `handleRegenerateImprovements()` that:
  - Calls `improve-resume` edge function with current `resumeText` and `jobDescription`
  - Updates `improvements` state with results
  - Shows toast on success/error
- Update the improvements tab to show:
  - If improvements exist: show `ResumeImprovements` component
  - If no improvements but `resumeText` exists: show "Generate Improvements" button
  - If no `resumeText`: show "Upload Resume First" message

---

## Feature 2: Resume Builder (Generate Improved Resume)

### Overview
Create a new edge function and UI component that generates a complete improved resume document by applying all AI suggestions to the original resume text.

### New Edge Function

**File: `supabase/functions/generate-improved-resume/index.ts`**

Purpose: Takes original resume text + improvements and generates a polished, improved resume

Input:
```json
{
  "originalResume": "...",
  "improvements": [...],
  "suggestedTitle": "...",
  "targetRole": "..."
}
```

Output:
```json
{
  "improvedResume": "... full improved resume text ...",
  "sections": {
    "header": "...",
    "summary": "...",
    "experience": "...",
    "skills": "...",
    "education": "..."
  }
}
```

### New UI Component

**File: `src/components/dashboard/ResumeBuilder.tsx`**

Features:
- Display the generated improved resume in a clean, formatted view
- Section-by-section editing capability (textarea per section)
- Copy individual sections or full resume
- Download as TXT file
- Apply/reject individual improvements toggle

### Dashboard Integration

**File: `src/pages/Dashboard.tsx`**
- Add new state: `improvedResume` (object or null)
- Add new state: `isGeneratingResume` (boolean)
- Add function `handleGenerateImprovedResume()`
- Update `ResumeImprovements` component to include "Build Improved Resume" button

### Updated Component

**File: `src/components/dashboard/ResumeImprovements.tsx`**
- Add new prop: `onBuildResume: () => void`
- Add new prop: `isBuilding: boolean`
- Add "Build Improved Resume" button at top of component
- Show loading state when building

---

## Technical Details

### New Edge Function: `generate-improved-resume/index.ts`

```text
supabase/functions/generate-improved-resume/
  index.ts
```

AI Prompt Strategy:
- System prompt: Expert resume writer that merges improvements into original
- User prompt: Includes original resume, list of improvements, suggested title
- Output: Structured JSON with full resume and individual sections

### State Flow

```text
1. User loads historical analysis
   -> resumeText, jobDescription, jdAnalysis set
   -> improvements = null

2. User clicks "Generate Improvements"
   -> Calls improve-resume function
   -> improvements set with results

3. User clicks "Build Improved Resume"
   -> Calls generate-improved-resume function
   -> improvedResume set with results
   -> Shows ResumeBuilder component
```

### UI Flow

Improvements Tab States:
1. No resume uploaded: "Upload Resume First" CTA
2. Resume exists, no improvements: "Generate Improvements" button
3. Improvements exist: Show improvements + "Build Improved Resume" button
4. Improved resume generated: Show ResumeBuilder component

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/generate-improved-resume/index.ts` | Create | Edge function to generate improved resume |
| `src/components/dashboard/ResumeBuilder.tsx` | Create | Component to display/edit/download improved resume |
| `src/components/dashboard/ResumeImprovements.tsx` | Edit | Add "Build Improved Resume" button and props |
| `src/pages/Dashboard.tsx` | Edit | Add regenerate and build resume handlers, new states |

---

## User Experience

1. **From Fresh Analysis**: After uploading resume + JD, improvements auto-generate. User can click "Build Improved Resume" to get the final document.

2. **From History**: User loads past analysis, clicks "Generate Improvements" to get suggestions, then "Build Improved Resume" for the final document.

3. **Resume Builder**: User sees the improved resume, can edit sections inline, copy to clipboard, or download as a text file.
