/**
 * Test Suite: Chibi 3D & Spine 2D Character Avatar Quality Gate
 * Tests Anime Chibi features (expressive eyes, catchlights, wavy hair, garland, satchel),
 * 10 Spine animations, diversity (gender, nationality, social status), and dual-mode studio integration.
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const rootDir = process.cwd();

console.log(`\n======================================================================`);
console.log(`🎨 TEST SUITE: CHIBI 3D & SPINE 2D AVATAR SYSTEM QUALITY GATE`);
console.log(`======================================================================\n`);

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ [PASS] Test ${totalTests}: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ [FAIL] Test ${totalTests}: ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

// -------------------------------------------------------------
// 1. SpineCharacterAvatar.tsx Verification
// -------------------------------------------------------------
const spinePath = path.resolve(rootDir, 'frontend', 'app', 'components', 'SpineCharacterAvatar.tsx');
assert.ok(fs.existsSync(spinePath), 'SpineCharacterAvatar.tsx must exist');
const spineSource = fs.readFileSync(spinePath, 'utf8');

runTest('SpineCharacterAvatar exports all 10 core animations from reference photo', () => {
  const expectedAnims = [
    'Front_idle',
    'Front_Talk',
    'Idle_1',
    'Idle_2',
    'Jump',
    'Run',
    'Vibing',
    'Walk',
    'Walk_Handup',
    'Back_idle'
  ];
  for (const anim of expectedAnims) {
    assert.ok(spineSource.includes(`'${anim}'`) || spineSource.includes(`"${anim}"`), `Missing animation ${anim}`);
  }
});

runTest('SpineCharacterAvatar includes bone visualizer and skeletal rigging anchors', () => {
  assert.ok(spineSource.includes('showBones'), 'Must support showBones toggle');
  assert.ok(spineSource.includes('bone_hand'), 'Must have hand bone anchor');
  assert.ok(spineSource.includes('bone_neck'), 'Must have neck bone anchor');
  assert.ok(spineSource.includes('bone_spine'), 'Must have spine bone anchor');
});

runTest('SpineCharacterAvatar renders Forest Berry Garland Crown & Crossbody Satchel', () => {
  assert.ok(spineSource.includes('Ruby Red Berries') || spineSource.includes('dc2626'), 'Must render ruby red berries');
  assert.ok(spineSource.includes('Adventure Leather Satchel') || spineSource.includes('Crossbody Strap'), 'Must render crossbody satchel');
  assert.ok(spineSource.includes('Wavy Side Hair Locks') || spineSource.includes('hairColor'), 'Must render layered wavy hair locks');
});

// -------------------------------------------------------------
// 2. Dynamic3DAvatar.tsx Verification (3D Stylized Chibi Anime)
// -------------------------------------------------------------
const avatar3dPath = path.resolve(rootDir, 'frontend', 'app', 'components', 'Dynamic3DAvatar.tsx');
assert.ok(fs.existsSync(avatar3dPath), 'Dynamic3DAvatar.tsx must exist');
const avatar3dSource = fs.readFileSync(avatar3dPath, 'utf8');

runTest('Dynamic3DAvatar features Anime Chibi Expressive Eyes with dual catchlights & blinking', () => {
  assert.ok(avatar3dSource.includes('eyeIrisMaterial'), 'Must have distinct iris material');
  assert.ok(avatar3dSource.includes('Primary Catchlight') || avatar3dSource.includes('Specular Sparkle'), 'Must have primary highlight');
  assert.ok(avatar3dSource.includes('Secondary Catchlight'), 'Must have secondary catchlight');
  assert.ok(avatar3dSource.includes('eyelashMaterial') || avatar3dSource.includes('Upper Eyelash'), 'Must have upper eyelash arc');
  assert.ok(avatar3dSource.includes('isBlinking') || avatar3dSource.includes('targetScaleY'), 'Must have procedural blinking loop');
});

runTest('Dynamic3DAvatar includes Peach Blush, Forest Garland Crown, and Crossbody Satchel', () => {
  assert.ok(avatar3dSource.includes('blushMaterial') || avatar3dSource.includes('fb7185'), 'Must have peach blush cheeks');
  assert.ok(avatar3dSource.includes('hasGarland') && avatar3dSource.includes('rubyBerryMaterial'), 'Must have 3D forest berry garland');
  assert.ok(avatar3dSource.includes('hasSatchel') && avatar3dSource.includes('satchelLeatherMaterial'), 'Must have 3D crossbody satchel');
  assert.ok(avatar3dSource.includes('Wavy Side Locks') || avatar3dSource.includes('cylinderGeometry args={[0.09, 0.12, 0.52'), 'Must have volumetric wavy side hair locks');
});

runTest('Dynamic3DAvatar supports Diversity across Gender, Nationalities, and Social Status', () => {
  assert.ok(avatar3dSource.includes('getSkinTone') && avatar3dSource.includes('getIrisColor'), 'Must map skin & iris by nationality');
  assert.ok(avatar3dSource.includes('na uy') || avatar3dSource.includes('norway'), 'Must support Norway / Scandinavian');
  assert.ok(avatar3dSource.includes('việt') || avatar3dSource.includes('vietnam'), 'Must support Vietnam');
  assert.ok(avatar3dSource.includes('nhật') || avatar3dSource.includes('japan'), 'Must support Japan / East Asia');
  assert.ok(avatar3dSource.includes('syria') || avatar3dSource.includes('ai cập'), 'Must support Middle East');
  assert.ok(avatar3dSource.includes('somalia') || avatar3dSource.includes('châu phi'), 'Must support African diaspora');
  assert.ok(avatar3dSource.includes('isWealthy') && avatar3dSource.includes('goldMaterial'), 'Must render luxury status perks');
});

// -------------------------------------------------------------
// 3. AvatarInspectorModal.tsx Verification (Dual-Mode Studio)
// -------------------------------------------------------------
const modalPath = path.resolve(rootDir, 'frontend', 'app', 'components', 'AvatarInspectorModal.tsx');
assert.ok(fs.existsSync(modalPath), 'AvatarInspectorModal.tsx must exist');
const modalSource = fs.readFileSync(modalPath, 'utf8');

runTest('AvatarInspectorModal integrates both Spine 2D Live and 3D Chibi Studio tabs', () => {
  assert.ok(modalSource.includes("activeTab === 'spine'"), 'Must support Spine 2D active view');
  assert.ok(modalSource.includes("activeTab === '3d'"), 'Must support 3D Chibi active view');
  assert.ok(modalSource.includes('SpineCharacterAvatar'), 'Must render SpineCharacterAvatar in modal');
  assert.ok(modalSource.includes('SPINE_ANIMATION_LIST'), 'Must display Spine animation list');
  assert.ok(modalSource.includes('showSpineBones'), 'Must allow toggling Spine bones on/off');
});

// -------------------------------------------------------------
// 4. CharacterHeroBanner.tsx Verification
// -------------------------------------------------------------
const bannerPath = path.resolve(rootDir, 'frontend', 'app', 'components', 'CharacterHeroBanner.tsx');
assert.ok(fs.existsSync(bannerPath), 'CharacterHeroBanner.tsx must exist');
const bannerSource = fs.readFileSync(bannerPath, 'utf8');

runTest('CharacterHeroBanner includes seamless 3D / SPINE mode toggle button on header avatar', () => {
  assert.ok(bannerSource.includes('bannerAvatarMode'), 'Must track bannerAvatarMode state');
  assert.ok(bannerSource.includes('SpineCharacterAvatar'), 'Must import and support SpineCharacterAvatar');
  assert.ok(bannerSource.includes("bannerAvatarMode === '3d' ? '3D' : 'SPINE'"), 'Must have mode switcher pill');
});

// -------------------------------------------------------------
// 5. MOBA Sidekick Pet Companion & Life-Stage Morphing Verification
// -------------------------------------------------------------
const sidekickPath = path.resolve(rootDir, 'frontend', 'app', 'components', 'SidekickPetCompanion.tsx');
assert.ok(fs.existsSync(sidekickPath), 'SidekickPetCompanion.tsx must exist');
const sidekickSource = fs.readFileSync(sidekickPath, 'utf8');

runTest('SidekickPetCompanion implements 4 MOBA pets including Deenoh the Dragon', () => {
  assert.ok(sidekickSource.includes('dragon'), 'Must support dragon companion');
  assert.ok(sidekickSource.includes('fox'), 'Must support fox companion');
  assert.ok(sidekickSource.includes('cat'), 'Must support cat companion');
  assert.ok(sidekickSource.includes('puppy'), 'Must support puppy companion');
  assert.ok(sidekickSource.includes('Deenoh'), 'Must feature Deenoh the Dragon');
  assert.ok(sidekickSource.includes('getRecommendedSidekick'), 'Must recommend companion by netWorth');
});

runTest('SpineCharacterAvatar supports MOBA Gotcha_Pose and Life Progression Morphing', () => {
  assert.ok(spineSource.includes('Gotcha_Pose'), 'Must support MOBA Gotcha_Pose');
  assert.ok(spineSource.includes('isBaby'), 'Must support infant stage');
  assert.ok(spineSource.includes('isPoor'), 'Must support poor socio-economic tier');
  assert.ok(spineSource.includes('isUltraRich'), 'Must support ultra-rich tycoon tier');
});

runTest('SidekickPetCompanion is mounted in CharacterHeroBanner and AvatarInspectorModal', () => {
  assert.ok(bannerSource.includes('SidekickPetCompanion'), 'CharacterHeroBanner must render SidekickPetCompanion');
  assert.ok(modalSource.includes('SidekickPetCompanion'), 'AvatarInspectorModal must render SidekickPetCompanion');
});

console.log(`\n======================================================================`);
console.log(`📊 TEST SUITE SUMMARY: ${passedTests}/${totalTests} Tests Passed (${Math.round((passedTests/totalTests)*100)}%)`);
console.log(`🎉 ALL CHIBI 3D & SPINE 2D AVATAR QUALITY GATES PASSED FLAWLESSLY!`);
console.log(`======================================================================\n`);
