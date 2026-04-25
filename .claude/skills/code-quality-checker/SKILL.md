---
name: code-quality-checker
description: >
  A comprehensive code quality auditor for Vibe Coding. Enforces the Tensaw 
  "High-Density SaaS" aesthetic, strictly prohibits inline styles, and ensures
  React best practices (semantic HTML over AntD Typography). Use this skill
  whenever the user says "check code quality", "run vibe check", "audit this file",
  "is this code clean", or whenever you generate or edit a React/TSX file and want
  to ensure it meets Tensaw standards. Always run this after any refactor or new
  component creation in this project.
---

# Code Quality Checker (Vibe Coding Standard)

This skill enforces the baseline quality standards for the Tensaw Skills Studio UI. 
It ensures all code adheres to the project's premium aesthetic and technical constraints.

## Objective
Run a repository or file-level scan to detect and auto-remediate:
1. Inline styles (`style={{...}}`)
2. Usage of Ant Design `<Title>` and `<Text>` instead of simple semantic HTML tags.
3. Magic numbers and hardcoded colors instead of CSS variables (e.g., `--text-main`, `--accent`).
4. Incorrect typography hierarchy (ensuring 14px titles, 12px descriptions).

## Triggers
* "check code quality"
* "run vibe check"
* "audit this file for tensaw standards"
* "is this code up to standard"
* After generating or editing any `.tsx` component in this project

## Execution Workflow

### 1. Audit (Discovery)
When triggered, scan the target file(s) for the following violations:
- **Rule 1**: No `style={{...}}`.
- **Rule 2**: No `<Typography.Text>` or `<Typography.Title>`. Use `<div>` or `<span>` with respective classes.
- **Rule 3**: Components must use standard `*-card-premium` class structures where applicable.

### 2. Vibe Verification
Check `resources/quality-rules.json` to verify current spacing, typography, and color token standards. Compare found violations against the benchmark in `examples/elite-code.tsx`.

### 3. Report & Plan
Output a structured Markdown report to the user summarizing the violations.
Say: *"I've analyzed the files based on Tensaw Vibe Standards. Here are the quality issues and my plan to fix them. Proceed?"*

### 4. Implement
Upon user approval, refactor the code strictly matching the `resources/` blueprints. Ensure CSS classes use `--var` injections instead of inline styles for dynamic data.
