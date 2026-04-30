# Tensaw Skills Studio UI

## Dev Commands

```bash
npm run dev          # Local development
npm run dev:staging  # Local UI with staging API
npm run build        # Standard build
npm run build:strict # tsc + vite build
npm run lint         # ESLint validation
```

## Environment Variables

Required in `.env`:

- `VITE_API_URL` — Backend API base URL
- `VITE_ENV_NAME` — Environment name (local/staging/production)
- `VITE_IMAGE_BASE_URL` — Static assets domain

## Architecture

- **Entry**: `src/App.tsx` — Root with AntD ConfigProvider + router
- **Route guards**: `PrivateRoute`, `PublicRoute` for auth protection
- **Layout**: `MainLayout` wraps all protected routes
- **State**: Context API via `ThemeContext`, execution state in contexts/

## Available Skills

Custom Claude skills in `.claude/skills/`:

- `checkpoint` — Save/revert changes with git stash
- `inline-audit` — Detect inline style violations  
- `token-audit` — Verify CSS variable usage
- `code-refactorer` — Clean up overgrown components
- `react-best-practices` — Enforce quality standards
- `code-quality-checker` — Enforce Tensaw design rules

Run with: `/checkpoint save`, `/inline-audit`, `/token-audit`, `/vibe-check`

## Quality Standards

**Strict rules** (enforced by skills):
- No inline styles — use CSS variables
- No implicit `any` — explicit interfaces required
- Components: stateless (UI) + stateful (hook) separation
- Custom hooks for logic > 30 lines
- No `eslint-disable` or `@ts-ignore`

## Checkpoint Commands

```bash
/checkpoint save <description>   # Create checkpoint before changes
/checkpoint list             # List all checkpoints
/checkpoint diff <n>          # Show changes in checkpoint
/checkpoint revert <n>          # Revert to checkpoint
/checkpoint drop <n>           # Delete checkpoint
```

## Testing

No test framework configured. Verify changes manually.

## Build Output

`dist/` directory — deploy according to environment (staging/production).