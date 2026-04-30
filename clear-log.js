#!/usr/bin/env node

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Config ──────────────────────────────────────────────────────────────────

const CHANGELOG_PATH = path.join(__dirname, 'CHANGELOG.md');

const HEADER = '# 🧾 Project Change Log\n';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function archiveTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    '-',
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join('');
}

function softReset() {
  if (!fs.existsSync(CHANGELOG_PATH)) {
    console.log('Nothing to archive — CHANGELOG.md does not exist.');
    return;
  }

  const archiveName = `archive-${archiveTimestamp()}.md`;
  const archivePath = path.join(__dirname, archiveName);

  fs.renameSync(CHANGELOG_PATH, archivePath);
  fs.writeFileSync(CHANGELOG_PATH, HEADER + '\n', 'utf8');

  console.log(`📦  Archived → ${archiveName}`);
  console.log('✅  Fresh CHANGELOG.md created.');
}

function hardReset() {
  fs.writeFileSync(CHANGELOG_PATH, HEADER + '\n', 'utf8');
  console.log('🔴  Hard reset — CHANGELOG.md wiped and reset.');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const mode = (process.argv[2] || '').toLowerCase();

try {
  if (mode === '--hard') {
    hardReset();
  } else {
    // Default: soft reset (archive + fresh file)
    softReset();
  }
} catch (err) {
  console.error('Error during clear operation:', err.message);
  process.exit(1);
}
