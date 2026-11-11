/**
 * LifeGraph 2.0 - Daylight Mode UI Integrity & Contrast Test Suite
 * Independent Automated Verification for Daylight Mode Overhaul
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to read file content
function readFile(relPath) {
  const fullPath = path.resolve(__dirname, relPath);
  return fs.readFileSync(fullPath, 'utf8');
}

// ============================================================================
// SUITE 1: CSS Design Tokens across all 4 themes in globals.css
// ============================================================================
test('Theme Tokens: --tree-sky-* and --tree-core-* are fully defined across all 4 themes', () => {
  const css = readFile('frontend/app/globals.css');

  const themes = ['daylight', 'obsidian', 'sepia', 'cyberpunk'];
  const requiredTokens = [
    '--tree-sky-spring',
    '--tree-sky-summer',
    '--tree-sky-autumn',
    '--tree-sky-winter',
    '--tree-core-bg',
    '--tree-core-border',
    '--tree-core-shadow',
    '--tree-core-text',
    '--tree-core-ap0-bg',
    '--tree-core-ap0-border',
    '--tree-core-ap0-shadow'
  ];

  for (const theme of themes) {
    // Locate theme block
    const themeSelector = theme === 'daylight' 
      ? /(?::root\s*,\s*)?\[data-theme="daylight"\]\s*\{([^}]+)\}/
      : new RegExp(`\\[data-theme="${theme}"\\]\\s*\\{([^}]+)\\}`);
    
    const match = css.match(themeSelector);
    assert.ok(match, `Theme block [data-theme="${theme}"] must be present in globals.css`);

    const blockContent = match[1];
    for (const token of requiredTokens) {
      assert.ok(
        blockContent.includes(token),
        `Theme "${theme}" is missing required token: ${token}`
      );
      
      // Ensure token is assigned a non-empty value
      const tokenRegex = new RegExp(`${token}\\s*:\\s*([^;]+);`);
      const tokenMatch = blockContent.match(tokenRegex);
      assert.ok(tokenMatch, `Token ${token} in theme "${theme}" must have a valid value`);
      assert.ok(tokenMatch[1].trim().length > 0, `Token ${token} in theme "${theme}" cannot be empty`);
    }

    // Check color-scheme property
    if (theme === 'daylight') {
      assert.ok(blockContent.includes('color-scheme: light;'), 'Daylight theme must declare "color-scheme: light;"');
      // Verify daylight core text is dark ink color
      assert.ok(blockContent.includes('--tree-core-text: #1e1b4b;'), 'Daylight theme must have high-contrast dark core text (#1e1b4b)');
    } else {
      assert.ok(blockContent.includes('color-scheme: dark;'), `Theme "${theme}" must declare "color-scheme: dark;"`);
    }
  }
});

test('Theme Tokens: Base Canvas and Card tokens are valid and high-contrast in daylight mode', () => {
  const css = readFile('frontend/app/globals.css');
  const daylightMatch = css.match(/\[data-theme="daylight"\]\s*\{([^}]+)\}/);
  assert.ok(daylightMatch);

  const daylight = daylightMatch[1];
  assert.ok(daylight.includes('--bg-canvas: #f6f8fb;'), 'Daylight canvas must be light tint (#f6f8fb)');
  assert.ok(daylight.includes('--bg-card: #ffffff;'), 'Daylight card must be crisp white (#ffffff)');
  assert.ok(daylight.includes('--text-primary: #0f172a;'), 'Daylight text-primary must be slate-900 ink (#0f172a)');
  assert.ok(daylight.includes('--text-secondary: #475569;'), 'Daylight text-secondary must be slate-600 (#475569)');
  assert.ok(daylight.includes('--border-subtle: #e2e8f0;'), 'Daylight border-subtle must be slate-200 (#e2e8f0)');
});

// ============================================================================
// SUITE 2: Dark Class Audit (Zero un-prefixed dark classes)
// ============================================================================
test('Dark Class Audit: DynamicLifeTree.tsx, CharacterHeroBanner.tsx, NarrativeFeed.tsx have no un-prefixed dark classes', () => {
  const targetFiles = [
    'frontend/app/components/rpg/DynamicLifeTree.tsx',
    'frontend/app/components/CharacterHeroBanner.tsx',
    'frontend/app/components/NarrativeFeed.tsx'
  ];

  const violations = [];

  for (const relPath of targetFiles) {
    const lines = readFile(relPath).split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      // Ignore comments
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
        return;
      }

      // Check 1: Hardcoded bg-*-950 without dark: prefix
      // (Exception: dark:bg-white paired on light canvas or CSS variables)
      const bg950Matches = trimmed.match(/(?<!dark:)\bbg-[a-z]+-950(?:\/[0-9]+)?\b/g) || [];
      for (const m of bg950Matches) {
        // Check if it's already an intentional light/dark pairing e.g. bg-slate-950 dark:bg-white for a ping dot
        if (trimmed.includes('dark:bg-white') && m === 'bg-slate-950') {
          continue; // Acceptable pairing for contrast ping dot
        }
        violations.push({
          file: relPath,
          line: lineNum,
          type: 'unprefixed-bg-950',
          match: m,
          content: trimmed
        });
      }

      // Check 2: Hardcoded border-slate-800 without dark: prefix
      const border800Matches = trimmed.match(/(?<!dark:)\bborder-slate-800(?:\/[0-9]+)?\b/g) || [];
      for (const m of border800Matches) {
        violations.push({
          file: relPath,
          line: lineNum,
          type: 'unprefixed-border-slate-800',
          match: m,
          content: trimmed
        });
      }

      // Check 3: Hardcoded text-white on light backgrounds
      // Allowed exceptions:
      // - on dark/vibrant solid buttons: bg-indigo-600, bg-sky-500, bg-blue-600, bg-emerald-600, bg-rose-600, bg-slate-900
      // - with dark: or dark:hover: prefix
      const textWhiteMatches = trimmed.match(/(?<!dark:)(?<!dark:hover:)\btext-white\b/g) || [];
      for (const m of textWhiteMatches) {
        const isSolidDarkButton = 
          trimmed.includes('bg-indigo-600') ||
          trimmed.includes('bg-indigo-700') ||
          trimmed.includes('bg-blue-600') ||
          trimmed.includes('bg-sky-500') ||
          trimmed.includes('to-blue-600') ||
          trimmed.includes('bg-slate-900') ||
          trimmed.includes('bg-black');

        if (!isSolidDarkButton) {
          violations.push({
            file: relPath,
            line: lineNum,
            type: 'unprefixed-text-white',
            match: m,
            content: trimmed
          });
        }
      }
    });
  }

  if (violations.length > 0) {
    console.error('Found Daylight Mode dark class violations:', JSON.stringify(violations, null, 2));
  }
  assert.equal(violations.length, 0, `Expected 0 dark class violations, found ${violations.length}`);
});

// ============================================================================
// SUITE 3: Multi-Age Stage UI Consistency & Dual-Theme Adaptation
// ============================================================================
test('Age Consistency: Infancy (0 - 5 years) UI mechanics & Daylight styling', () => {
  const treeContent = readFile('frontend/app/components/rpg/DynamicLifeTree.tsx');
  const heroContent = readFile('frontend/app/components/CharacterHeroBanner.tsx');

  // 1. Sprout & Origin Life Tree
  assert.ok(
    treeContent.includes("characterAge === 0 ? '🌱' : '🪵'"),
    'DynamicLifeTree must display 🌱 seedling for age 0'
  );
  assert.ok(
    treeContent.includes("Mầm Sống Khởi Nguyên • Gốc Rễ Đời Người"),
    'DynamicLifeTree must describe age 0 as Mầm Sống Khởi Nguyên'
  );

  // 2. Infancy mother meal
  assert.ok(
    treeContent.includes("characterAge <= 5 ? 'Bầu Sữa Mẹ' : 'Bữa Cơm'"),
    'DynamicLifeTree must render "Bầu Sữa Mẹ" for age <= 5'
  );

  // 3. Hero banner infancy stage badge
  assert.ok(
    heroContent.includes('Thời Kỳ Ấu Thơ'),
    'CharacterHeroBanner must identify age < 6 as Thời Kỳ Ấu Thơ'
  );
  assert.ok(
    heroContent.includes('Ấu nhi'),
    'CharacterHeroBanner must default occupation for age < 6 to Ấu nhi'
  );
});

test('Age Consistency: Childhood / School (6 - 17 years) UI mechanics & In-Tree NPCs', () => {
  const treeContent = readFile('frontend/app/components/rpg/DynamicLifeTree.tsx');
  const heroContent = readFile('frontend/app/components/CharacterHeroBanner.tsx');

  // 1. In-tree Celestial NPC Constellation unlocks at age >= 6
  assert.ok(
    treeContent.includes('characterAge >= 6 && (character?.social_links || []).slice(0, 4)'),
    'DynamicLifeTree must unlock in-tree NPC constellation at age >= 6'
  );

  // 2. School age occupation
  assert.ok(
    heroContent.includes('Học sinh'),
    'CharacterHeroBanner must identify age 6-17 as Học sinh'
  );

  // 3. Dual-theme spring & summer season badges
  assert.ok(
    treeContent.includes('bg-pink-50/90 dark:bg-pink-950/70'),
    'Spring season badge must support dual daylight/dark classes'
  );
  assert.ok(
    treeContent.includes('bg-amber-50/90 dark:bg-amber-950/70'),
    'Summer season badge must support dual daylight/dark classes'
  );
});

test('Age Consistency: Adulthood (18 - 69 years) Dual-Theme Slide-in Drawers & Career Hierarchy', () => {
  const treeContent = readFile('frontend/app/components/rpg/DynamicLifeTree.tsx');
  const heroContent = readFile('frontend/app/components/CharacterHeroBanner.tsx');

  // 1. Skill tree drawer uses theme tokens
  assert.ok(
    treeContent.includes("bg-[var(--bg-card)] border-l border-[var(--border-subtle)] text-[var(--text-primary)]"),
    'Skill Tree and Social Links drawers must use CSS variables for theme compatibility'
  );

  // 2. Social status classes adapt to daylight & dark
  assert.ok(
    heroContent.includes("text-amber-800 dark:text-amber-300"),
    'Social status must provide dual text classes for daylight high contrast'
  );
  assert.ok(
    heroContent.includes("text-emerald-800 dark:text-emerald-300"),
    'Cần Lao Tự Lập status must provide dual text classes for daylight high contrast'
  );
});

test('Age Consistency: Old Age (70+ years) Memory Fading & Hourglass Survival Pill', () => {
  const feedContent = readFile('frontend/app/components/NarrativeFeed.tsx');
  const heroContent = readFile('frontend/app/components/CharacterHeroBanner.tsx');

  // 1. Memory fading banner in NarrativeFeed has dual theme styling
  assert.ok(
    feedContent.includes('text-amber-700 dark:text-amber-300'),
    'NarrativeFeed "Trí nhớ mờ dần" banner must use dual-theme amber classes'
  );

  // 2. Hourglass pill for age 70+ in CharacterHeroBanner
  assert.ok(
    heroContent.includes('text-amber-800 dark:text-amber-300'),
    'Hourglass survival rate badge must use high-contrast dual theme colors'
  );
  assert.ok(
    heroContent.includes('bg-amber-500/15 dark:bg-amber-950/70'),
    'Hourglass survival rate badge background must adapt between daylight (15%) and dark (70%)'
  );
});

// ============================================================================
// SUITE 4: WCAG 2.1 AA Contrast Ratio Verification
// ============================================================================
test('WCAG 2.1 AA Contrast Verification: Color values meet minimum 4.5:1 ratio', () => {
  // Relative luminance calculation according to W3C WCAG specification
  function getLuminance(r, g, b) {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  function getContrastRatio(rgb1, rgb2) {
    const lum1 = getLuminance(...rgb1);
    const lum2 = getLuminance(...rgb2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  }

  // Hex to RGB parser
  function hexToRgb(hex) {
    const parsed = hex.replace('#', '');
    return [
      parseInt(parsed.substring(0, 2), 16),
      parseInt(parsed.substring(2, 4), 16),
      parseInt(parsed.substring(4, 6), 16)
    ];
  }

  // Daylight colors
  const bgCard = hexToRgb('#ffffff');
  const bgCanvas = hexToRgb('#f6f8fb');
  const textPrimary = hexToRgb('#0f172a');     // slate-900
  const textSecondary = hexToRgb('#475569');   // slate-600
  const treeCoreText = hexToRgb('#1e1b4b');    // indigo-950 ink

  // 1. Text Primary on Card (white)
  const ratioPrimaryCard = getContrastRatio(textPrimary, bgCard);
  assert.ok(ratioPrimaryCard >= 7.0, `text-primary on bg-card must exceed AAA (7:1). Actual: ${ratioPrimaryCard.toFixed(2)}:1`);

  // 2. Text Primary on Canvas
  const ratioPrimaryCanvas = getContrastRatio(textPrimary, bgCanvas);
  assert.ok(ratioPrimaryCanvas >= 7.0, `text-primary on bg-canvas must exceed AAA (7:1). Actual: ${ratioPrimaryCanvas.toFixed(2)}:1`);

  // 3. Text Secondary on Card
  const ratioSecondaryCard = getContrastRatio(textSecondary, bgCard);
  assert.ok(ratioSecondaryCard >= 4.5, `text-secondary on bg-card must meet AA (4.5:1). Actual: ${ratioSecondaryCard.toFixed(2)}:1`);

  // 4. Tree Core Text on Daylight Core
  const ratioCoreText = getContrastRatio(treeCoreText, bgCard);
  assert.ok(ratioCoreText >= 7.0, `tree-core-text on white must exceed AAA (7:1). Actual: ${ratioCoreText.toFixed(2)}:1`);

  // 5. Status Badges daylight ink
  const amber800 = hexToRgb('#92400e');
  const emerald800 = hexToRgb('#065f46');
  const rose900 = hexToRgb('#881337');

  assert.ok(getContrastRatio(amber800, bgCard) >= 4.5, 'amber-800 meets AA on white');
  assert.ok(getContrastRatio(emerald800, bgCard) >= 4.5, 'emerald-800 meets AA on white');
  assert.ok(getContrastRatio(rose900, bgCard) >= 7.0, 'rose-900 meets AAA on white');
});


// ============================================================================
// SUITE 5: Cultural Landscape Backdrop Verification
// ============================================================================
test('Cultural Landscape Backdrop: Panoramic silhouettes, national landmarks & seamless horizon integration', () => {
  const backdropContent = readFile('frontend/app/components/rpg/CulturalLandscapeBackdrop.tsx');
  const treeContent = readFile('frontend/app/components/rpg/DynamicLifeTree.tsx');

  // 1. DynamicLifeTree imports and mounts CulturalLandscapeBackdrop
  assert.ok(
    treeContent.includes('CulturalLandscapeBackdrop'),
    'DynamicLifeTree must import and render CulturalLandscapeBackdrop'
  );

  // 2. Cultural profile coverage for all key nationalities
  const requiredCountries = ['poland', 'vietnam', 'japan', 'korea', 'thailand', 'usa', 'germany', 'syria', 'universal'];
  for (const country of requiredCountries) {
    assert.ok(
      backdropContent.includes(`${country}:`),
      `CulturalLandscapeBackdrop must define profile for ${country}`
    );
  }

  // 3. Landmark representation in SVG
  assert.ok(backdropContent.includes('Tatra'), 'Must feature High Tatra mountain range for Poland');
  assert.ok(backdropContent.includes('Wawel'), 'Must feature Wawel Royal Castle for Poland');
  assert.ok(backdropContent.includes('Hạ Long'), 'Must feature Hạ Long Bay for Vietnam');
  assert.ok(backdropContent.includes('Khuê Văn Các'), 'Must feature Khuê Văn Các / One Pillar Pagoda for Vietnam');
  assert.ok(backdropContent.includes('Fuji'), 'Must feature Mount Fuji for Japan');
  assert.ok(backdropContent.includes('Torii'), 'Must feature Shinto Torii Gate for Japan');
  assert.ok(backdropContent.includes('Gyeongbokgung'), 'Must feature Gyeongbokgung Palace for Korea');
  assert.ok(backdropContent.includes('Wat Arun'), 'Must feature Wat Arun Temple of Dawn for Thailand');
  assert.ok(backdropContent.includes('Grand Canyon'), 'Must feature Grand Canyon for USA');

  // 4. Seamless atmospheric mist blending
  assert.ok(
    backdropContent.includes('horizon-mist-blend'),
    'Must include soft atmospheric horizon mist fade to integrate into canvas'
  );

  // 5. Dual-theme adaptive heritage badge
  assert.ok(
    backdropContent.includes('bg-[var(--bg-card)]'),
    'Heritage badge must use semantic --bg-card token'
  );
  assert.ok(
    backdropContent.includes('text-amber-800 dark:text-amber-300'),
    'Heritage badge must use high-contrast dual-theme amber colors'
  );
});
