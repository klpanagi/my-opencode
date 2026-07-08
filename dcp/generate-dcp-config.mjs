#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const DCP_DIR = join(homedir(), '.myopencode', 'dcp');

function stripComments(jsonc) {
  let result = '';
  let i = 0;
  while (i < jsonc.length) {
    if (jsonc[i] === '"') {
      // String literal — copy until closing quote (handle escapes)
      result += jsonc[i++];
      while (i < jsonc.length && jsonc[i] !== '"') {
        if (jsonc[i] === '\\') {
          result += jsonc[i++]; // backslash
        }
        if (i < jsonc.length) result += jsonc[i++];
      }
      if (i < jsonc.length) result += jsonc[i++]; // closing quote
    } else if (jsonc[i] === '/' && jsonc[i + 1] === '/') {
      // Single-line comment — skip until newline
      while (i < jsonc.length && jsonc[i] !== '\n') i++;
    } else if (jsonc[i] === '/' && jsonc[i + 1] === '*') {
      // Multi-line comment — skip until */
      i += 2;
      while (i < jsonc.length - 1 && !(jsonc[i] === '*' && jsonc[i + 1] === '/')) i++;
      i += 2;
    } else {
      result += jsonc[i++];
    }
  }
  return result;
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

function generateProfile(profileName) {
  const profile = profileName || process.argv[2];
  if (!profile) {
    console.error('Usage: generate-dcp-config.mjs <profile>');
    console.error('Profiles: economy, balanced, performance, ultimate');
    process.exit(1);
  }

  const validProfiles = ['economy', 'balanced', 'performance', 'ultimate'];
  if (!validProfiles.includes(profile)) {
    console.error(`Invalid profile: ${profile}`);
    console.error(`Valid: ${validProfiles.join(', ')}`);
    process.exit(1);
  }

  const basePath = join(DCP_DIR, 'dcp-base.jsonc');
  const overridePath = join(DCP_DIR, `dcp-${profile}.jsonc`);
  const outputPath = join(DCP_DIR, `dcp-generated-${profile}.jsonc`);

  if (!existsSync(basePath)) { console.error('Base config not found:', basePath); process.exit(1); }
  if (!existsSync(overridePath)) { console.error(`Override not found: ${overridePath}`); process.exit(1); }

  const base = JSON.parse(stripComments(readFileSync(basePath, 'utf8')));
  const override = JSON.parse(stripComments(readFileSync(overridePath, 'utf8')));
  const merged = deepMerge(base, override);

  writeFileSync(outputPath, JSON.stringify(merged, null, 2) + '\n');
  console.log(`Generated: ${outputPath}`);
}

generateProfile();
