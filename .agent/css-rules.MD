---
name: css-checker
description: Comprehensive CSS validation and checking tool. Use this skill whenever the user mentions CSS files, stylesheets, SCSS, SASS, CSS-in-JS, styled components, or wants to check, validate, lint, audit, or scan CSS code. Triggers include "check my CSS", "validate styles", "lint CSS", "find CSS errors", "CSS best practices", "scan repo for CSS issues", "fix CSS problems", or any mention of CSS quality, syntax errors, or style conflicts. Also use when checking entire repositories or codebases for CSS issues.
---

# CSS Checker Skill

A comprehensive skill for checking CSS syntax, validating rules, detecting errors, and ensuring best practices across entire repositories.

## What This Skill Does

This skill helps you:
- **Validate CSS syntax** - Check for syntax errors, malformed rules, and invalid properties
- **Check rule alignment** - Ensure consistent formatting, proper nesting, and correct selector usage
- **Scan entire repositories** - Find all CSS files (CSS, SCSS, SASS, LESS, CSS-in-JS) and check them
- **Detect common issues** - Find duplicates, unused rules, specificity problems, and performance issues
- **Apply best practices** - Check accessibility, browser compatibility, and modern CSS standards

## Supported CSS Types

- Plain CSS (.css)
- SCSS/SASS (.scss, .sass)
- LESS (.less)
- CSS-in-JS (styled-components, emotion, etc.)
- Styled JSX
- Vue/Svelte component styles
- CSS Modules

## Workflow

### 1. Discovery Phase
When a user asks to check CSS, first determine the scope:
- Single file or entire repository?
- What types of CSS files to check?
- Specific issues to look for or comprehensive scan?

### 2. File Discovery
Use the provided `find_css_files.py` script to locate all CSS files:

```bash
python scripts/find_css_files.py <directory> [--types css,scss,sass,less,jsx,tsx,vue,svelte]
```

This outputs a JSON list of all CSS files with metadata.

### 3. Validation
For each file, run validation checks in this order:

**A. Syntax Validation**
- Use appropriate parser based on file type
- For CSS/SCSS/SASS: use `postcss` with appropriate syntax
- For CSS-in-JS: use AST parsing
- Report syntax errors with line numbers

**B. Rule Alignment Checks**
- Indentation consistency
- Bracket placement
- Semicolon usage
- Quote style consistency
- Property ordering
- Selector formatting

**C. Best Practice Checks**
- No vendor prefixes without fallbacks
- Avoid `!important` (flag excessive use)
- Check for deprecated properties
- Color contrast for accessibility
- Font size units (avoid px for text)
- Z-index management
- Specificity issues
- Duplicate selectors/rules

### 4. Repository-Wide Analysis
When scanning entire repos, also check:
- **Duplicate detection** - Same rules in multiple files
- **Unused styles** - Selectors not found in HTML/JSX
- **Naming conventions** - BEM, SMACSS, or custom patterns
- **File organization** - Imports, dependencies, structure
- **Performance** - File sizes, complexity metrics

### 5. Reporting
Generate a comprehensive report with:
- Summary statistics (files checked, issues found)
- Issues grouped by severity (error, warning, suggestion)
- File-by-file breakdown
- Quick fixes where possible
- Recommendations for improvements

## Tools and Dependencies

The skill uses these tools:
- **stylelint** - Primary CSS linting engine
- **postcss** - CSS parsing and transformation
- **css-tree** - CSS AST parser
- **prettier** - Formatting consistency checks

Install them if not present:
```bash
npm install -g stylelint stylelint-config-standard postcss postcss-scss prettier
```

## Example Configurations

### Stylelint Config
Create `.stylelintrc.json` with sensible defaults (see `references/stylelint-config.json`).

### Quick Check Command
```bash
stylelint "**/*.{css,scss,sass}" --formatter verbose
```

### Advanced Repository Scan
```bash
python scripts/check_css_repo.py <repo-path> --output-format html
```

## Common User Requests

**"Check my CSS file"**
→ Validate syntax, check formatting, report issues

**"Scan my entire project for CSS problems"**
→ Discover all CSS files, run comprehensive checks, generate report

**"Find CSS errors in my repo"**
→ Focus on syntax errors and critical issues only

**"Check if my CSS follows best practices"**
→ Run best practice checks, accessibility audits, performance analysis

**"Fix CSS formatting"**
→ Use prettier to auto-format, then validate

**"Find duplicate CSS rules"**
→ Parse all files, detect duplicate selectors and properties

## Error Handling

- If tools are missing, install them automatically or guide the user
- If parsing fails, try alternative parsers or report the issue clearly
- For large repos (>1000 files), ask user to confirm before processing
- Handle different CSS syntaxes gracefully with appropriate parsers

## Output Formats

Support multiple output formats based on user needs:
- **Terminal** - Colored, formatted text for quick review
- **JSON** - Structured data for CI/CD integration
- **HTML** - Interactive report with filtering and search
- **Markdown** - For documentation or GitHub issues

## Quick Reference

Read `references/css-validation-guide.md` for detailed information on:
- CSS syntax rules
- Common validation errors
- Best practice guidelines
- Browser compatibility issues
- Accessibility requirements

Read `references/rule-alignment-patterns.md` for:
- Formatting conventions
- Property ordering standards
- Naming convention patterns
- Selector specificity rules

## Scripts Reference

- `scripts/find_css_files.py` - Discover CSS files in a directory tree
- `scripts/check_css_repo.py` - Comprehensive repository scanner
- `scripts/validate_css.py` - Single file validation with detailed output
- `scripts/fix_css_formatting.py` - Auto-fix formatting issues

---

## Execution Strategy

1. **Understand the request** - What does the user want to check?
2. **Scope the work** - Single file, multiple files, or entire repo?
3. **Install dependencies** - Ensure tools are available
4. **Discover files** - Find all relevant CSS files
5. **Run checks** - Validate syntax, check rules, analyze patterns
6. **Generate report** - Format results clearly with actionable insights
7. **Offer fixes** - Suggest or apply automated fixes where possible

Always provide clear, actionable feedback with line numbers, examples, and suggestions for improvement.