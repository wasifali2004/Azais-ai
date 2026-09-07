#!/usr/bin/env node
'use strict';
// Appends a PROMPT or RESPONSE entry to .agent-logs/<session>.md.
// Invoked by the UserPromptSubmit and Stop hooks in .claude/settings.json.
// Reads the hook's JSON payload from stdin; never edits past entries.

const fs = require('fs');
const path = require('path');

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch (_) {
    return '';
  }
}

function parseModelFromTranscript(transcriptPath) {
  try {
    const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n').filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i--) {
      let entry;
      try { entry = JSON.parse(lines[i]); } catch (_) { continue; }
      const model = entry && entry.message && entry.message.model;
      if (model) return model;
    }
  } catch (_) {}
  return null;
}

function extractLastAssistantText(transcriptPath) {
  try {
    const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n').filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i--) {
      let entry;
      try { entry = JSON.parse(lines[i]); } catch (_) { continue; }
      if (entry && entry.type === 'assistant' && entry.message && Array.isArray(entry.message.content)) {
        const texts = entry.message.content
          .filter((b) => b && b.type === 'text' && typeof b.text === 'string')
          .map((b) => b.text);
        if (texts.length) return texts.join('\n\n');
      }
    }
  } catch (_) {}
  return null;
}

function pad(n) { return String(n).padStart(2, '0'); }

function utcStampForFilename(d) {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}_` +
    `${pad(d.getUTCHours())}-${pad(d.getUTCMinutes())}-${pad(d.getUTCSeconds())}`;
}

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  const fm = {};
  if (!m) return fm;
  for (const line of m[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    fm[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return fm;
}

function stripFrontmatter(text) {
  return text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
}

function buildFrontmatter(fm) {
  const order = ['session_id', 'date', 'author', 'model', 'tool', 'project',
    'total_exchanges', 'first_prompt_time', 'last_prompt_time'];
  let out = '---\n';
  for (const k of order) {
    if (fm[k] !== undefined) out += `${k}: ${fm[k]}\n`;
  }
  out += '---\n';
  return out;
}

function main() {
  const eventType = process.argv[2]; // 'PROMPT' or 'RESPONSE'
  let input = {};
  try { input = JSON.parse(readStdin()); } catch (_) {}

  const sessionId = input.session_id || 'unknown-session';
  const shortId = sessionId.slice(0, 8);
  const cwd = input.cwd || process.cwd();
  const transcriptPath = input.transcript_path;
  const logsDir = path.join(cwd, '.agent-logs');
  try { fs.mkdirSync(logsDir, { recursive: true }); } catch (_) {}

  const now = new Date();
  const nowIso = now.toISOString();

  let existing = [];
  try {
    existing = fs.readdirSync(logsDir).filter((f) => f.endsWith(`_${shortId}.md`));
  } catch (_) {}

  let filePath, fm, body;
  if (existing.length > 0) {
    filePath = path.join(logsDir, existing[0]);
    const raw = fs.readFileSync(filePath, 'utf8');
    fm = parseFrontmatter(raw);
    body = stripFrontmatter(raw);
  } else {
    const fname = `${utcStampForFilename(now)}_${shortId}.md`;
    filePath = path.join(logsDir, fname);
    const projectName = path.basename(cwd);
    fm = {
      session_id: sessionId,
      date: nowIso.slice(0, 10),
      author: process.env.LOG_AUTHOR || 'wasif-ali',
      model: 'unknown',
      tool: 'claude-code',
      project: projectName,
      total_exchanges: '0',
      first_prompt_time: nowIso,
      last_prompt_time: nowIso,
    };
    body = `\n# Session Log - ${nowIso.slice(0, 10)}\n\n` +
      `Session: \`${shortId}\` | Project: \`${projectName}\` | Author: \`${fm.author}\`\n\n---\n`;
  }

  // Model isn't in the hook payload: try explicit fields, then the transcript's
  // last assistant turn, then whatever this session last resolved, else unknown.
  let model = input.model || process.env.CLAUDE_CODE_MODEL || process.env.ANTHROPIC_MODEL || null;
  if (!model && transcriptPath) model = parseModelFromTranscript(transcriptPath);
  if (!model && fm.model && fm.model !== 'unknown') model = fm.model;
  if (!model) model = 'unknown';

  fm.model = model;
  fm.last_prompt_time = nowIso;

  if (eventType === 'PROMPT') {
    const entryNum = (parseInt(fm.total_exchanges, 10) || 0) + 1;
    fm.total_exchanges = String(entryNum);
    const promptText = input.prompt || input.user_prompt || input.user_input ||
      input.message || '(prompt text unavailable in hook input)';
    body += `\n[LOG_ENTRY type=PROMPT num=${entryNum} session=${shortId}]\n` +
      `timestamp: ${nowIso}\nmodel: ${model}\n\n${promptText}\n\n`;
  } else {
    const entryNum = parseInt(fm.total_exchanges, 10) || 1;
    let responseText = input.last_assistant_message;
    if (!responseText && transcriptPath) responseText = extractLastAssistantText(transcriptPath);
    if (!responseText) responseText = '(no final assistant text captured for this turn)';
    body += `\n[LOG_ENTRY type=RESPONSE num=${entryNum} session=${shortId}]\n` +
      `timestamp: ${nowIso}\nmodel: ${model}\n\n${responseText}\n\n---\n`;
  }

  fs.writeFileSync(filePath, buildFrontmatter(fm) + body, 'utf8');
}

main();
