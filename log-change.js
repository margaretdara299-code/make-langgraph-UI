#!/usr/bin/env node

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Config ──────────────────────────────────────────────────────────────────

const CHANGELOG_PATH = path.join(__dirname, 'CHANGELOG.md');

const HEADER = '# 🧾 Project Change Log\n';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timestamp() {
  return new Date().toLocaleString('en-US', {
    weekday : 'short',
    year    : 'numeric',
    month   : 'short',
    day     : '2-digit',
    hour    : '2-digit',
    minute  : '2-digit',
    second  : '2-digit',
    hour12  : true,
  });
}

function buildEntry(action, prompt) {
  return [
    '---',
    '',
    `## ⏱ ${timestamp()}`,
    '',
    '### 📌 Action',
    action,
    '',
    '### 💬 Prompt',
    prompt,
    '',
    '### 📂 Files Changed',
    '- (update manually or via your tooling)',
    '',
    '---',
    '',
  ].join('\n');
}

function ensureFile() {
  if (!fs.existsSync(CHANGELOG_PATH)) {
    fs.writeFileSync(CHANGELOG_PATH, HEADER + '\n', 'utf8');
    console.log('Created CHANGELOG.md');
  }
}

function appendEntry(action, prompt) {
  ensureFile();
  const entry = buildEntry(action, prompt);
  fs.appendFileSync(CHANGELOG_PATH, entry, 'utf8');
  console.log(`✅  Checkpoint logged → CHANGELOG.md`);
  console.log(`    Action : ${action}`);
  console.log(`    Prompt : ${prompt}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const [, , action, prompt] = process.argv;

if (!action || !prompt) {
  console.error('Usage: node log-change.js "<action>" "<prompt>"');
  process.exit(1);
}

try {
  appendEntry(action.trim(), prompt.trim());
} catch (err) {
  console.error('Error writing to CHANGELOG.md:', err.message);
  process.exit(1);
}
