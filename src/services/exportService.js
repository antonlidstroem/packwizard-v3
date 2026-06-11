// ── Export service — genererar ZIP med alla pack-filer ────────────────────────

export async function exportPackZip(wizardState) {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();

  const { packMeta, activities, features, viewConfig, deployTarget, languages } = wizardState;
  const packId = packMeta.packId || slugify(packMeta.appName) || 'my-pack';
  const folder = zip.folder(packId);

  const config = buildPackConfig(wizardState, packId);
  folder.file('pack.config.json', JSON.stringify(config, null, 2));

  const normalizedActs = normalizeActivities(activities || []);
  for (const lang of (languages || ['sv'])) {
    folder.file(`activities.${lang}.json`, JSON.stringify(normalizedActs, null, 2));
  }

  for (const lang of (languages || ['sv'])) {
    const translations = buildTranslations(packMeta, lang);
    folder.file(`translations.${lang}.json`, JSON.stringify(translations, null, 2));
  }

  folder.file('theme.css',      buildThemeCss(packMeta));
  folder.file('theme-dark.css', buildThemeDarkCss(packMeta));

  // ── Bilder — bädda in alla uppladdade bildfiler i images/-mappen ─────────
  const hasImages = addImagesToZip(folder, packMeta, activities || []);

  if (deployTarget && deployTarget !== 'none') {
    const yaml = buildDeployYaml(packId, packMeta.appName, deployTarget);
    zip.folder('.github/workflows').file(`deploy-${packId}.yml`, yaml);
  }

  folder.file('README.md', buildReadme(packId, packMeta, config));

  const blob = await zip.generateAsync({ type: 'blob' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${packId}.zip`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// ── Bädda in bilder i ZIP ────────────────────────────────────────────────────
function addImagesToZip(folder, packMeta, activities) {
  let hasAny = false;
  const imgFolder = folder.folder('images');

  // Pack-nivå: ikon
  if (packMeta._iconImageData) {
    const { base64, ext } = packMeta._iconImageData;
    imgFolder.file(`pack-icon${ext}`, base64, { base64: true });
    hasAny = true;
  }

  // Aktiviteter: hero + thumbnail
  for (const act of activities) {
    if (act._heroImageData) {
      const { base64, ext } = act._heroImageData;
      imgFolder.file(`${act.id || 'act'}-hero${ext}`, base64, { base64: true });
      hasAny = true;
    }
    if (act._thumbnailData) {
      const { base64, ext } = act._thumbnailData;
      imgFolder.file(`${act.id || 'act'}-thumb${ext}`, base64, { base64: true });
      hasAny = true;
    }
  }

  return hasAny;
}

// ── Normalise activities → Playtypus Activity model ───────────────────────────
function normalizeActivities(activities) {
  return activities.map((act, i) => {
    let durSec = act.durationSeconds;
    if (typeof durSec !== 'number') {
      durSec = parseDurationToSeconds(act.duration || act.durationSeconds);
    }

    let level = act.level;
    if (!level || typeof level === 'string') {
      const map = { easy: 1, medium: 2, hard: 3, enkel: 1, medel: 2, svår: 3 };
      level = map[String(act.difficulty || act.level || '').toLowerCase()] || 1;
    }

    const repeat = act.repeat || null;

    // Bygg heroImage-sökväg från uppladdad bildfil om det finns
    const heroImage = act._heroImageData
      ? `images/${act.id || `act-${String(i+1).padStart(3,'0')}`}-hero${act._heroImageData.ext}`
      : (act.heroImage || null);

    const thumbnail = act._thumbnailData
      ? `images/${act.id || `act-${String(i+1).padStart(3,'0')}`}-thumb${act._thumbnailData.ext}`
      : (act.thumbnail || null);

    return {
      id:              act.id || `act-${String(i + 1).padStart(3, '0')}`,
      title:           act.title        || '',
      description:     act.description  || '',
      emoji:           act.emoji        || '📌',
      category:        act.category     || '',
      durationSeconds: durSec,
      prepTimeMinutes: typeof act.prepTimeMinutes === 'number' ? act.prepTimeMinutes : 0,
      level,
      requiresProps:   act.requiresProps ?? false,
      props:           Array.isArray(act.props) ? act.props : [],
      steps:           Array.isArray(act.steps) ? act.steps : [],
      tags:            Array.isArray(act.tags)  ? act.tags  : [],
      contentBlocks:   Array.isArray(act.contentBlocks) ? act.contentBlocks : [],
      filterValues:    act.filterValues  || {},
      contentVersion:  act.contentVersion ?? 1,
      ...(repeat       && { repeat }),
      ...(heroImage    && { heroImage }),
      ...(thumbnail    && { thumbnail }),
      ...(act.backendRef && { backendRef: act.backendRef }),
      ...(act.showAfter  && { showAfter:  act.showAfter }),
      ...(act.showBefore && { showBefore: act.showBefore }),
      ...(act.nextActivity && { nextActivity: act.nextActivity }),
      // _-prefixade wizard-interna fält exporteras ALDRIG
    };
  });
}

function parseDurationToSeconds(str) {
  if (typeof str === 'number') return str;
  if (!str) return 600;
  const s = String(str).toLowerCase().trim();
  const hM = s.match(/(\d+)\s*h/);
  const mM = s.match(/(\d+)\s*(min|m)/);
  const sM = s.match(/(\d+)\s*(sek|s)/);
  let total = 0;
  if (hM) total += parseInt(hM[1]) * 3600;
  if (mM) total += parseInt(mM[1]) * 60;
  if (sM) total += parseInt(sM[1]);
  return total || 600;
}

// ── buildPackConfig ───────────────────────────────────────────────────────────
function buildPackConfig(state, packId) {
  const { packMeta, features, viewConfig, languages } = state;

  const LANG_META = {
    sv: { label: 'Svenska', flag: '🇸🇪' },
    en: { label: 'English', flag: '🇬🇧' },
    no: { label: 'Norsk',   flag: '🇳🇴' },
    da: { label: 'Dansk',   flag: '🇩🇰' },
    fi: { label: 'Suomi',   flag: '🇫🇮' },
    de: { label: 'Deutsch', flag: '🇩🇪' },
  };
  const languageObjects = (languages || ['sv']).map(code => ({
    code,
    label: LANG_META[code]?.label || code,
    flag:  LANG_META[code]?.flag  || '',
  }));

  const rawCats = packMeta.categories || [];
  const categoryObjects = rawCats.map(c => {
    if (typeof c === 'string') return { id: slugify(c), labelKey: `categories.${slugify(c)}`, emoji: '' };
    return { id: c.id || slugify(c.label || ''), labelKey: `categories.${c.id || slugify(c.label || '')}`, emoji: c.emoji || '' };
  });

  const pb = packMeta.panicButton;
  const panicButton = pb?.enabled
    ? {
        enabled:     true,
        labelKey:    'panic.button',
        sublabelKey: 'panic.subtitle',
        emoji:       pb.emoji || '🎲',
        style:       'urgent',
        filterOverride: {
          ...(pb.maxPrepMinutes    != null && { maxPrepMinutes:    pb.maxPrepMinutes }),
          ...(pb.requireNoProps             && { requireNoProps:    true }),
          ...(pb.maxDurationSeconds != null && { maxDurationSeconds: pb.maxDurationSeconds }),
          ...(pb.maxLevel           != null && { maxLevel:          pb.maxLevel }),
        },
      }
    : { enabled: false };

  const readyNow = packMeta.readyNow
    ? {
        labelKey:    'readyNow.label',
        sublabelKey: 'readyNow.sublabel',
        count:       packMeta.readyNowCount || 3,
        ...(packMeta.readyNowCriteria && { criteria: packMeta.readyNowCriteria }),
      }
    : null;

  const typography = { preset: packMeta.typography || 'rounded' };

  // ── Backends — rensa bort wizardinterna/tomma fält ───────────────────────
  const backends = (packMeta.backends || [])
    .filter(b => b.id && b.baseUrl)
    .map(b => ({
      id:   b.id,
      baseUrl: b.baseUrl,
      authMode: b.authMode || 'none',
      ...(b.authMode === 'apikey' && b.apiKey     && { apiKey: b.apiKey }),
      ...(b.authMode === 'jwt'    && b.jwtAudience && { jwtAudience: b.jwtAudience }),
      ...(b.signalRHub && { signalRHub: b.signalRHub }),
      ...(b.cacheTtlMinutes > 0  && { cacheTtlMinutes: b.cacheTtlMinutes }),
    }));

  const hasBackends = backends.length > 0;
  const hasImages = !!(packMeta._iconImageData) ||
    (state.activities || []).some(a => a._heroImageData || a._thumbnailData);

  const featOut = {
    favorites:         !!features.favorites,
    favoritesShelf:    !!features.favoritesShelf,
    doneTracking:      !!features.doneTracking,
    logbook:           !!features.logbook,
    streakTracking:    features.streakTracking || null,
    badges:            !!features.badges,
    recentHistory:     !!features.recentHistory,
    shareActivity:     !!features.shareActivity,
    textToSpeech:      !!features.textToSpeech,
    audioPlayer:       !!features.audioPlayer,
    printView:         !!features.printView,
    levelBadges:       !!features.levelBadges,
    guidedMode:        !!features.guidedMode,
    export:            features.export || null,
    defaultLayoutMode: features.defaultLayoutMode || 'grid',
    layoutUserToggle:  features.layoutUserToggle  !== false,
    allowUserContent:  !!features.allowUserContent,
    activityNotes:     !!features.activityNotes,
    cardActions:       !!features.cardActions,
    dataSync:          features.dataSync || 'none',
    slideshow:         !!features.slideshow,
    progressionLock:   !!features.progressionLock,
    fontSizeScale:     !!features.fontSizeScale,
    // v7: backend-flags auto-sätts om backends är konfigurerade
    activityActions:   hasBackends || !!features.activityActions,
    backendStatus:     hasBackends || !!features.backendStatus,
    // v7: media-flags auto-sätts om bilder finns
    contentBlocks:     !!features.contentBlocks,
    heroImages:        hasImages   || !!features.heroImages,
    thumbnails:        (state.activities || []).some(a => a._thumbnailData) || !!features.thumbnails,
    ...(features.reminders && { reminders: features.reminders }),
  };

  const categoryLayouts = buildCategoryLayouts(viewConfig, categoryObjects);

  return {
    packId,
    version:          '7.0',
    appName:          packMeta.appName      || '',
    tagline:          packMeta.tagline      || '',
    emoji:            packMeta.emoji        || '✨',
    defaultLanguage:  packMeta.defaultLanguage || 'sv',
    languages:        languageObjects,
    startView:        packMeta.startView || 'grid',
    themeFile:        'theme.css',
    themeDarkFile:    'theme-dark.css',
    typography,
    panicButton,
    features:         featOut,
    categoryLayouts,
    readyNow,
    categories:       categoryObjects,
    situationPresets: packMeta.situationPresets || [],
    filters:          [],
    onboarding:       packMeta.onboarding   || { enabled: false, steps: [] },
    tutorial:         packMeta.tutorial     || { enabled: false, steps: [] },
    // v7: backends skrivs alltid, även om tom array (tydlig signal att packen är v7)
    backends,
  };
}

function buildCategoryLayouts(viewConfig, categoryObjects) {
  if (!viewConfig?.overrides) return [];
  return Object.entries(viewConfig.overrides)
    .map(([catLabel, layoutMode]) => {
      const match = categoryObjects.find(
        c => c.id === catLabel || c.id === slugify(catLabel)
      );
      const categoryId = match?.id || slugify(catLabel);
      return { categoryId, layoutMode };
    })
    .filter(cl => cl.layoutMode && cl.categoryId);
}

function buildTranslations(packMeta, lang) {
  const sv = lang === 'sv';
  const cats = packMeta.categories || [];

  const categoryKeys = {};
  cats.forEach(c => {
    const id    = typeof c === 'string' ? slugify(c) : (c.id    || slugify(c.label || ''));
    const label = typeof c === 'string' ? c          : (c.label || c.id              || '');
    categoryKeys[id] = label;
  });

  const pb = packMeta.panicButton;
  const panicButtonLabel    = pb?.label    || (sv ? 'Vad kan vi göra nu?' : 'What can we do now?');
  const panicButtonSubtitle = pb?.subtitle || (sv ? 'Slumpa en aktivitet' : 'Pick something for me');

  return {
    appName:  packMeta.appName  || '',
    tagline:  packMeta.tagline  || '',
    nav: {
      home:      sv ? 'Hem'           : 'Home',
      favorites: sv ? 'Favoriter'     : 'Favorites',
      logbook:   sv ? 'Loggbok'       : 'Logbook',
      settings:  sv ? 'Inställningar' : 'Settings',
    },
    filters: {
      all:      sv ? 'Alla'     : 'All',
      category: sv ? 'Kategori' : 'Category',
    },
    categories: categoryKeys,
    actions: {
      done:     sv ? 'Klar'    : 'Done',
      favorite: sv ? 'Favorit' : 'Favorite',
      share:    sv ? 'Dela'    : 'Share',
      start:    sv ? 'Starta'  : 'Start',
      next:     sv ? 'Nästa'   : 'Next',
    },
    readyNow: {
      label:    sv ? 'Redo nu'          : 'Ready now',
      sublabel: sv ? 'Kan göras direkt' : 'No prep needed',
    },
    panic: {
      button:   panicButtonLabel,
      subtitle: panicButtonSubtitle,
    },
  };
}

function buildThemeCss(packMeta) {
  const accent = packMeta.accentColor || '#E8845A';
  return `/* ${packMeta.appName || 'Pack'} — light theme */
:root {
  --accent:          ${accent};
  --accent-light:    ${lighten(accent, 0.85)};
  --accent-dark:     ${darken(accent, 0.7)};
  --bg:              #FDFAF6;
  --bg-card:         #FFFFFF;
  --text-primary:    #1A1A1A;
  --text-secondary:  #6B6B6B;
  --border:          #E8E0D8;
  --shadow:          0 2px 12px rgba(0,0,0,0.06);
  --radius-card:     16px;
  --radius-btn:      12px;
}
`;
}

function buildThemeDarkCss(packMeta) {
  const accent = packMeta.accentColor || '#E8845A';
  return `/* ${packMeta.appName || 'Pack'} — dark theme */
html.dark {
  --accent:          ${accent};
  --accent-light:    ${darken(accent, 0.3)};
  --accent-dark:     ${lighten(accent, 0.9)};
  --bg:              #1A1714;
  --bg-card:         #242018;
  --text-primary:    #F5F0E8;
  --text-secondary:  #A09080;
  --border:          #3A3028;
  --shadow:          0 2px 12px rgba(0,0,0,0.3);
  --radius-card:     16px;
  --radius-btn:      12px;
}
`;
}

function buildDeployYaml(packId, appName, target) {
  const name = appName || packId;
  if (target === 'github-pages') return `name: Deploy ${name} to GitHub Pages

on:
  push:
    branches: [main]
    paths:
      - 'src/Playtypus.Content/wwwroot/packs/${packId}/**'
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: deploy-${packId}
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: 9.x
      - name: Build
        run: |
          dotnet publish src/Playtypus.Web/Playtypus.Web.csproj \\
            -c Release -o dist /p:BundleId=${packId}
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist/wwwroot
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
`;
  if (target === 'azure') return `name: Deploy ${name} to Azure Static Web Apps

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: 9.x
      - name: Build
        run: dotnet publish src/Playtypus.Web -c Release -o dist /p:BundleId=${packId}
      - name: Deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: \${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: upload
          app_location: dist/wwwroot
`;
  return `# Deploy ${packId} — lägg till egna steg här`;
}

function buildReadme(packId, packMeta, config) {
  const backendSection = (config.backends || []).length > 0
    ? `\n## Backend\n\nDetta pack kräver en eller flera servrar:\n\n${config.backends.map(b =>
        `- **${b.id}**: \`${b.baseUrl}\` (auth: ${b.authMode})`
      ).join('\n')}\n\nKonfigurera \`baseUrl\` i \`pack.config.json\` för respektive miljö.\n`
    : '';

  return `# ${packMeta.appName || packId}

${packMeta.tagline || ''}

Genererat av PackWizard 3.0 — Playtypus v7-kompatibelt.
${backendSection}
## Installation

1. Kopiera denna mapp till \`src/Playtypus.Content/wwwroot/packs/${packId}/\`
2. Lägg till \`${packId}\` i \`packs/directory.json\`
3. Kör \`dotnet run\` i Playtypus.Web

## Deploy

Kopiera \`.github/workflows/deploy-${packId}.yml\` till ditt Playtypus-repo.
`;
}

// ── Color helpers ─────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
}
function rgbToHex(r,g,b) {
  return '#'+[r,g,b].map(v=>Math.min(255,Math.max(0,Math.round(v))).toString(16).padStart(2,'0')).join('');
}
function lighten(hex, f) { const [r,g,b]=hexToRgb(hex); return rgbToHex(r+(255-r)*f, g+(255-g)*f, b+(255-b)*f); }
function darken(hex, f)  { const [r,g,b]=hexToRgb(hex); return rgbToHex(r*f, g*f, b*f); }

export function slugify(str) {
  return (str||'').toLowerCase()
    .replace(/å/g,'a').replace(/ä/g,'a').replace(/ö/g,'o')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}
