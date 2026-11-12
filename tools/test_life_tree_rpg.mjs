/**
 * Test Suite: Grand Unified Dynamic Life Tree (Đại Thụ Sinh Mệnh Toàn Năng)
 * Tests full integration of Tri-Branch RPG Skill Tree and NPC Social Links
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const rootDir = process.cwd();

console.log(`\n======================================================================`);
console.log(`🌳 TEST SUITE: GRAND UNIFIED DYNAMIC LIFE TREE (ĐẠI THỤ TOÀN NĂNG)`);
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

// 1. DynamicLifeTree.tsx Verification
const lifeTreePath = path.resolve(rootDir, 'frontend', 'app', 'components', 'rpg', 'DynamicLifeTree.tsx');
assert.ok(fs.existsSync(lifeTreePath), 'DynamicLifeTree.tsx must exist');
const lifeTreeSource = fs.readFileSync(lifeTreePath, 'utf8');

runTest('DynamicLifeTree imports SkillTreeTab and SocialLinksTab', () => {
  assert.ok(lifeTreeSource.includes('SkillTreeTab'), 'Must import SkillTreeTab');
  assert.ok(lifeTreeSource.includes('SocialLinksTab'), 'Must import SocialLinksTab');
});

runTest('DynamicLifeTree provides 4 Unified Ecosystem Tabs (Vòng Đời, Kỹ Năng, Nhân Mạch, Rễ Gia Đình)', () => {
  assert.ok(lifeTreeSource.includes('treeViewMode'), 'Must manage treeViewMode state');
  assert.ok(lifeTreeSource.includes('life_actions'), 'Must support life_actions mode');
  assert.ok(lifeTreeSource.includes('skill_tree'), 'Must support skill_tree mode');
  assert.ok(lifeTreeSource.includes('social_links'), 'Must support social_links mode');
  assert.ok(lifeTreeSource.includes('family_roots'), 'Must support family_roots mode');
});

runTest('DynamicLifeTree features 4 Sacred Pillars + Integrated Family Root Conduits & Event Strips', () => {
  assert.ok(lifeTreeSource.includes('Nhánh Kỹ Năng'), 'Must render Skill Pillar');
  assert.ok(lifeTreeSource.includes('Nhân Mạch Quý Nhân'), 'Must render Social Link Pillar');
  assert.ok(lifeTreeSource.includes('Cành Hoàng Kim'), 'Must render Wealth Pillar');
  assert.ok(lifeTreeSource.includes('Gốc Rễ Gia Đình'), 'Must render Family Roots Pillar');
  assert.ok(lifeTreeSource.includes('family-root-tendrils'), 'Must anchor SVG root tendrils to trunk');
  assert.ok(lifeTreeSource.includes('Đối Mặt Biến Cố'), 'Must integrate active scenario CTA inside Life Tree');
  assert.ok(lifeTreeSource.includes('onAdvanceYear'), 'Must unify year advancement inside Life Tree');
});

runTest('DynamicLifeTree renders Tri-Branch RPG Skill Tree in skill_tree mode', () => {
  assert.ok(lifeTreeSource.includes('<SkillTreeTab'), 'Must render SkillTreeTab component');
  assert.ok(lifeTreeSource.includes('onUnlockSkill'), 'Must pass onUnlockSkill callback');
});

runTest('DynamicLifeTree renders NPC Social Links in social_links mode', () => {
  assert.ok(lifeTreeSource.includes('<SocialLinksTab'), 'Must render SocialLinksTab component');
  assert.ok(lifeTreeSource.includes('onNpcInteract'), 'Must pass onNpcInteract callback');
});

// 2. ActionPointHub.tsx Verification
const hubPath = path.resolve(rootDir, 'frontend', 'app', 'components', 'ActionPointHub.tsx');
assert.ok(fs.existsSync(hubPath), 'ActionPointHub.tsx must exist');
const hubSource = fs.readFileSync(hubPath, 'utf8');

runTest('ActionPointHub connects onUnlockSkill and onNpcInteract to DynamicLifeTree', () => {
  assert.ok(hubSource.includes('onUnlockSkill={onUnlockSkill}'), 'Must pass onUnlockSkill to tree');
  assert.ok(hubSource.includes('onNpcInteract={onNpcInteract}'), 'Must pass onNpcInteract to tree');
});

// 3. Page.tsx Integration Verification
const pagePath = path.resolve(rootDir, 'frontend', 'app', 'page.tsx');
assert.ok(fs.existsSync(pagePath), 'page.tsx must exist');
// page.tsx đã được tách: callback ở GameCockpit.tsx, gọi API ở hooks/useGameState.ts.
const cockpitPath = path.join(path.dirname(pagePath), 'components', 'GameCockpit.tsx');
const gameStatePath = path.join(path.dirname(pagePath), 'hooks', 'useGameState.ts');
const readIf = (f) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '');
const pageSource = fs.readFileSync(pagePath, 'utf8') + readIf(cockpitPath) + readIf(gameStatePath);

runTest('page.tsx provides full Life Tree Loop Callbacks & Zero Detached Footer', () => {
  assert.ok(pageSource.includes('onUnlockSkill={handleUnlockSkill}'), 'Must pass handleUnlockSkill');
  assert.ok(pageSource.includes('onNpcInteract={handleNpcInteract}'), 'Must pass handleNpcInteract');
  assert.ok(pageSource.includes('onHealthCheckup={handleHealthCheckup}'), 'Must pass handleHealthCheckup');
  assert.ok(pageSource.includes('onSeniorAction={handleSeniorAction}'), 'Must pass handleSeniorAction');
  assert.ok(pageSource.includes('onDebtRelief={handleDebtRelief}'), 'Must pass handleDebtRelief');
  assert.ok(pageSource.includes('activeScenario={activeScenario}'), 'Must pass activeScenario to ActionPointHub');
  assert.ok(pageSource.includes('annualDigest={annualDigest}'), 'Must pass annualDigest to ActionPointHub');
  assert.ok(!pageSource.includes('Footer: Cánh Cửa Chuyển Tiếp Vòng Đời'), 'Must remove detached redundant footer from page.tsx');
  assert.ok(pageSource.includes('/rpg/unlock-skill'), 'Must connect to unlock-skill endpoint');
  assert.ok(pageSource.includes('/rpg/npc-interact'), 'Must connect to npc-interact endpoint');
});

console.log(`\n======================================================================`);
console.log(`📊 TEST SUITE SUMMARY: ${passedTests}/${totalTests} Tests Passed (${Math.round((passedTests/totalTests)*100)}%)`);
console.log(`🎉 GRAND UNIFIED DYNAMIC LIFE TREE QA GATES ALL PASSED!`);
console.log(`======================================================================\n`);
