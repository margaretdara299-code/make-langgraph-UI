---
name: checkpoint
description: >
  Save and revert code changes using git stash. Use when user says
  "checkpoint", "save state", "revert changes", "list checkpoints",
  or "/checkpoint". Creates git stash snapshots with descriptions,
  lists all checkpoints, shows diffs, and enables instant reversion.
---

# Code Checkpoint Skill

Powerful change tracking and reversion system using git stash + commits for atomic snapshots.

## The Only Allowed Pattern

```bash
# Create checkpoint with description
checkpoint save "refactored auth flow"

# List all checkpoints
checkpoint list

# Show diff from checkpoint
checkpoint diff checkpoint-name

# Revert to checkpoint
checkpoint revert checkpoint-name
```

---

## Use Cases

- **Before risky refactors**: "save state before inline style removal"
- **Before big changes**: "checkpoint before component restructure"
- **Experimental work**: "save state, try this approach"
- **Bug investigation**: "checkpoint, then test fix"
- **Feature branches**: track all WIP states

---

## Workflow

### 1. Create Checkpoint (Before Changes)

```bash
# Stage all changes first
git add -A

# Create checkpoint with description
git stash push -m "checkpoint: description"

# OR commit as checkpoint
git commit -m "checkpoint: description"
```

**Rule**: Always create checkpoint BEFORE making changes.

### 2. List Checkpoints

```bash
# Show all stashes (checkpoints)
git stash list

# OR show checkpoint commits
git log --oneline --all --grep="checkpoint" -10
```

### 3. Show Changes in Checkpoint

```bash
# Show diff for a stash
git stash show -p stash@{0}

# OR show commit diff
git show <commit-sha> --stat
```

### 4. Revert to Checkpoint

```bash
# Apply checkpoint and keep it
git stash pop

# OR hard reset (warning: loses current work)
git reset --hard <commit-sha>
```

### 5. Delete Checkpoint

```bash
git stash drop stash@{0}
```

---

## Triggers

* "checkpoint"
* "save state"
* "revert changes"
* "list checkpoints"
* "show changes"
* "/checkpoint"
* Before any refactor, bulk fix, or risky change

---

## Execution Steps

### Default: Create Checkpoint

1. Run `git status` to see current state
2. Run `git add -A` to stage all
3. Ask user for checkpoint description
4. Run `git stash push -m "checkpoint: <description>"`
5. Report: "Checkpoint created: <description>"

### List Mode

1. Run `git stash list`
2. Format output as table
3. Report available checkpoints

### Diff Mode

1. Get checkpoint name/number from user
2. Run `git stash show -p stash@{<n>}`
3. Report diff summary

### Revert Mode

1. Confirm with user before reverting
2. Run `git stash pop stash@{<n>}` or `git reset --hard`
3. Report reversion complete

---

## Rules

- **ALWAYS** create checkpoint before bulk changes
- **ALWAYS** confirm before reverting
- Use descriptive checkpoint names
- Keep checkpoints until changes are committed
- Never force push after reverts