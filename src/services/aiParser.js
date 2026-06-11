// ── AI response parser ────────────────────────────────────────────────────────

import { parseDurationToSeconds } from '../schema.js'

export function parseStrategyResponse(rawText) {
  const errors = [];
  let parsed = null;

  const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonText = codeBlockMatch ? codeBlockMatch[1].trim() : rawText.trim();

  try {
    parsed = JSON.parse(jsonText);
  } catch {
    try {
      const cleaned = jsonText
        .replace(/,\s*([}\]])/g, '$1')
        .replace(/'/g, '"')
        // BUG FIX: only quote keys that are NOT already quoted
        .replace(/(?<!["\w])(\w+)(?=\s*:)/g, '"$1"');
      parsed = JSON.parse(cleaned);
    } catch {
      errors.push({ field: '_parse', message: 'Kunde inte tolka JSON. Kontrollera att du kopierat hela svaret.' });
      return { data: null, errors };
    }
  }

  const result = {
    appName:           parsed.appName           || null,
    tagline:           parsed.tagline           || null,
    emoji:             parsed.emoji             || null,
    accentColor:       parsed.accentColor       || null,
    tone:              parsed.tone              || null,
    targetInsights:    parsed.targetInsights    || null,
    contentGuidelines: parsed.contentGuidelines || null,
    totalActivities:   parsed.totalActivities   || 20,
    categories:        null,
    suggestedFeatures: parsed.suggestedFeatures || null,
  };

  if (parsed.categories) {
    if (!Array.isArray(parsed.categories)) {
      errors.push({ field: 'categories', message: 'categories måste vara en array' });
    } else {
      result.categories = parsed.categories.map(c =>
        typeof c === 'string'
          ? { id: c.toLowerCase().replace(/\s+/g, '-'), label: c, emoji: '' }
          : { id: c.id || c.slug || c.label?.toLowerCase().replace(/\s+/g, '-'), label: c.label || c.id, emoji: c.emoji || '', suggestedCount: c.suggestedCount, rationale: c.rationale }
      );
    }
  }

  return { data: result, errors };
}

export function parseAiResponse(rawText) {
  const errors = [];
  let parsed = null;

  const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonText = codeBlockMatch ? codeBlockMatch[1].trim() : rawText.trim();

  try {
    parsed = JSON.parse(jsonText);
  } catch {
    try {
      const cleaned = jsonText
        .replace(/,\s*([}\]])/g, '$1')
        .replace(/'/g, '"')
        // BUG FIX: only quote keys that are NOT already quoted
        .replace(/(?<!["\w])(\w+)(?=\s*:)/g, '"$1"');
      parsed = JSON.parse(cleaned);
    } catch {
      errors.push({ field: '_parse', message: 'Kunde inte tolka JSON. Kontrollera att du kopierat hela svaret.' });
      return { data: null, errors };
    }
  }

  const result = {};

  if (parsed.appName)    result.appName    = String(parsed.appName);
  if (parsed.tagline)    result.tagline    = String(parsed.tagline);
  if (parsed.emoji)      result.emoji      = String(parsed.emoji);
  if (parsed.accentColor) {
    if (!/^#[0-9A-Fa-f]{6}$/.test(parsed.accentColor)) {
      errors.push({ field: 'accentColor', message: `Ogiltig hex-färg: ${parsed.accentColor}` });
    } else {
      result.accentColor = parsed.accentColor;
    }
  }

  if (parsed.categories) {
    if (!Array.isArray(parsed.categories)) {
      errors.push({ field: 'categories', message: 'categories måste vara en array' });
    } else {
      result.categories = parsed.categories.map(c =>
        typeof c === 'string'
          ? { id: c.toLowerCase().replace(/\s+/g, '-'), label: c, emoji: '' }
          : { id: c.id || c.slug || c.label?.toLowerCase().replace(/\s+/g, '-'), label: c.label || c.id, emoji: c.emoji || '' }
      );
    }
  }

  if (parsed.activities) {
    if (!Array.isArray(parsed.activities)) {
      errors.push({ field: 'activities', message: 'activities måste vara en array' });
    } else {
      const valid = [];
      parsed.activities.forEach((act, i) => {
        const errs = [];
        if (!act.id)    errs.push('id saknas');
        if (!act.title) errs.push('title saknas');

        if (errs.length > 0) {
          errors.push({ field: `activities[${i}]`, message: errs.join(', ') });
          return;
        }

        // Konvertera duration-sträng → int om AI ändå skickade sträng
        let durSec = act.durationSeconds;
        if (typeof durSec !== 'number') {
          durSec = parseDurationToSeconds(act.duration || act.durationSeconds);
        }

        // level: int eller sträng
        let level = act.level;
        if (!level || typeof level === 'string') {
          const map = { easy: 1, medium: 2, hard: 3, enkel: 1, medel: 2, svår: 3 };
          level = map[String(act.difficulty || act.level || '').toLowerCase()] || 1;
        }

        valid.push({
          id:             act.id,
          title:          act.title          || '',
          description:    act.description    || '',
          emoji:          act.emoji          || '📌',
          category:       act.category       || '',
          durationSeconds: durSec,
          prepTimeMinutes: typeof act.prepTimeMinutes === 'number' ? act.prepTimeMinutes : 0,
          level,
          requiresProps:  act.requiresProps  ?? false,
          props:          Array.isArray(act.props)  ? act.props  : [],
          steps:          Array.isArray(act.steps)  ? act.steps  : [],
          tags:           Array.isArray(act.tags)   ? act.tags   : [],
          contentBlocks:  Array.isArray(act.contentBlocks) ? act.contentBlocks : [],
          // BUG FIX: cardFeatures and preferredView are not valid Playtypus Activity fields
          filterValues:   act.filterValues   || {},
          contentVersion: act.contentVersion ?? 1,
          _aiGenerated:   true,
        });
      });
      result.activities = valid;
    }
  }

  return { data: result, errors };
}
