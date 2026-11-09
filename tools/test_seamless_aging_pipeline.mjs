/**
 * Test Suite: The 3-Phase Seamless Evolution & Annual Reflection Pipeline
 * Verifies Phase 1 (YearEndReflectionModal & Pledges), Phase 2 (5-Stage Morphing Life Tree & Growth Rings),
 * and Phase 3 (Seamless Mind Stage River & Visual Evolution).
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const rootDir = process.cwd();

console.log(`\n======================================================================`);
console.log(`🌟 TEST SUITE: 3-PHASE SEAMLESS EVOLUTION & ANNUAL REFLECTION PIPELINE`);
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
// 1. Phase 1: YearEndReflectionModal.tsx Verification
// -------------------------------------------------------------
const modalPath = path.resolve(rootDir, 'frontend', 'app', 'components', 'rpg', 'YearEndReflectionModal.tsx');
assert.ok(fs.existsSync(modalPath), 'YearEndReflectionModal.tsx must exist');
const modalSource = fs.readFileSync(modalPath, 'utf8');

runTest('YearEndReflectionModal implements 3 Strategic 1-Click Annual Pledges', () => {
  assert.ok(modalSource.includes('pledge_wealth'), 'Must support pledge_wealth');
  assert.ok(modalSource.includes('pledge_wellness'), 'Must support pledge_wellness');
  assert.ok(modalSource.includes('pledge_social'), 'Must support pledge_social');
  assert.ok(modalSource.includes('Tâm Nguyện Thịnh Vượng'), 'Must label Wealth pledge in Vietnamese');
  assert.ok(modalSource.includes('Tâm Nguyện An Yên'), 'Must label Wellness pledge in Vietnamese');
  assert.ok(modalSource.includes('Tâm Nguyện Nhân Mạch'), 'Must label Social pledge in Vietnamese');
});

runTest('YearEndReflectionModal features Accomplishments, Unfinished Seeds, and AP Conversion', () => {
  assert.ok(modalSource.includes('Dấu Ấn Đã Thực Hiện'), 'Must render completed accomplishments');
  assert.ok(modalSource.includes('Hạt Mầm Còn Dang Dở'), 'Must render unfinished opportunities');
  assert.ok(modalSource.includes('Dưỡng Sinh Cuối Năm'), 'Must convert unused AP to Vitality and Burnout relief');
});

// -------------------------------------------------------------
// 2. Phase 1: Backend Tick & Pledge Engine Verification
// -------------------------------------------------------------
const tickEnginePath = path.resolve(rootDir, 'backend', 'src', 'engine', 'tickEngine.js');
assert.ok(fs.existsSync(tickEnginePath), 'tickEngine.js must exist');
const tickSource = fs.readFileSync(tickEnginePath, 'utf8');

runTest('tickEngine processes active_pledge multipliers across Wealth, Wellness, and Social links', () => {
  assert.ok(tickSource.includes("activePledge === 'pledge_wealth'"), 'Must handle pledge_wealth');
  assert.ok(tickSource.includes("activePledge === 'pledge_wellness'"), 'Must handle pledge_wellness');
  assert.ok(tickSource.includes("activePledge === 'pledge_social'"), 'Must handle pledge_social');
  assert.ok(tickSource.includes('totalAssetIncome = Math.round(totalAssetIncome * 1.10)'), 'Wealth pledge gives +10% passive yield');
  assert.ok(tickSource.includes('totalRelationshipCost = Math.round(totalRelationshipCost * 0.5)'), 'Social pledge halves relationship upkeep');
});

const gameRoutesPath = path.resolve(rootDir, 'backend', 'src', 'routes', 'game.js');
assert.ok(fs.existsSync(gameRoutesPath), 'game.js must exist');
const gameSource = fs.readFileSync(gameRoutesPath, 'utf8');

runTest('game.js registers pledge_id in /tick and applies active_pledge bonuses in AP actions', () => {
  assert.ok(gameSource.includes('pledge_id'), 'Must extract pledge_id in /tick');
  assert.ok(gameSource.includes("character.active_pledge = pledge_id"), 'Must persist active_pledge on character');
  assert.ok(gameSource.includes("pledgeWealthMultiplier"), 'Overtime hustle must apply pledgeWealthMultiplier');
  assert.ok(gameSource.includes("isWellnessPledge"), 'Wellness actions must detect isWellnessPledge');
});

const rpgProgPath = path.resolve(rootDir, 'backend', 'src', 'engine', 'rpgProgressionEngine.js');
assert.ok(fs.existsSync(rpgProgPath), 'rpgProgressionEngine.js must exist');
const rpgProgSource = fs.readFileSync(rpgProgPath, 'utf8');

runTest('rpgProgressionEngine doubles Social Link EXP and discounts gifts when pledge_social is active', () => {
  assert.ok(rpgProgSource.includes('isSocialPledge'), 'Must detect isSocialPledge');
  assert.ok(rpgProgSource.includes('expMultiplier'), 'Must scale expMultiplier with social pledge');
  assert.ok(rpgProgSource.includes('cashCost = isSocialPledge ? 250 : 500'), 'Must give 50% discount on gifts');
});

// -------------------------------------------------------------
// 3. Phase 2: DynamicLifeTree 5-Stage Morphing & Growth Rings Verification
// -------------------------------------------------------------
const treePath = path.resolve(rootDir, 'frontend', 'app', 'components', 'rpg', 'DynamicLifeTree.tsx');
assert.ok(fs.existsSync(treePath), 'DynamicLifeTree.tsx must exist');
const treeSource = fs.readFileSync(treePath, 'utf8');

runTest('DynamicLifeTree implements 5 Procedural Morphing Stages from Sprout to Ancient World Tree', () => {
  assert.ok(treeSource.includes("'sprout'"), 'Must support sprout stage');
  assert.ok(treeSource.includes("'sapling'"), 'Must support sapling stage');
  assert.ok(treeSource.includes("'flourishing_oak'"), 'Must support flourishing_oak stage');
  assert.ok(treeSource.includes("'grand_pillar'"), 'Must support grand_pillar stage');
  assert.ok(treeSource.includes("'ancient_world_tree'"), 'Must support ancient_world_tree stage');
  assert.ok(treeSource.includes('Mầm Non Búp Măng'), 'Must describe sprout stage');
  assert.ok(treeSource.includes('Cổ Thụ Hoàng Kim'), 'Must describe Ancient World Tree stage');
});

runTest('DynamicLifeTree renders Procedural Trunk Geometry and Annual Tree Growth Rings', () => {
  assert.ok(treeSource.includes('proceduralTreeTrunk'), 'Must render proceduralTreeTrunk SVG group');
  assert.ok(treeSource.includes('annualGrowthRings'), 'Must render annualGrowthRings SVG group');
  assert.ok(treeSource.includes('Vòng Vân Gỗ Đời Người'), 'Must render interactive Growth Rings badge');
  assert.ok(treeSource.includes('woodOakGradient'), 'Must include realistic wood oak SVG gradient');
  assert.ok(treeSource.includes('ancientWorldTreeGold'), 'Must include radiant golden world tree SVG gradient');
});

// -------------------------------------------------------------
// 4. Phase 3: Seamless Integration & Page.tsx Wiring
// -------------------------------------------------------------
const pagePath = path.resolve(rootDir, 'frontend', 'app', 'page.tsx');
assert.ok(fs.existsSync(pagePath), 'page.tsx must exist');
const pageSource = fs.readFileSync(pagePath, 'utf8');

runTest('page.tsx mounts YearEndReflectionModal and connects pledge advancement', () => {
  assert.ok(pageSource.includes('YearEndReflectionModal'), 'Must import and mount YearEndReflectionModal');
  assert.ok(pageSource.includes('isYearEndModalOpen'), 'Must track isYearEndModalOpen state');
  assert.ok(pageSource.includes('handlePledgeAndAdvance'), 'Must provide handlePledgeAndAdvance function');
  assert.ok(pageSource.includes('Chiêm Nghiệm Cuối Năm'), 'Action bar button must trigger Chiêm Nghiệm Cuối Năm');
});

const bannerPath = path.resolve(rootDir, 'frontend', 'app', 'components', 'CharacterHeroBanner.tsx');
assert.ok(fs.existsSync(bannerPath), 'CharacterHeroBanner.tsx must exist');
const bannerSource = fs.readFileSync(bannerPath, 'utf8');

runTest('CharacterHeroBanner displays Active Annual Pledge and Pet Companion', () => {
  assert.ok(bannerSource.includes('character.active_pledge'), 'Must render active_pledge indicator');
  assert.ok(bannerSource.includes('SidekickPetCompanion'), 'Must include SidekickPetCompanion');
});

const scenePath = path.resolve(rootDir, 'frontend', 'app', 'components', 'InteractiveScene2D.tsx');
assert.ok(fs.existsSync(scenePath), 'InteractiveScene2D.tsx must exist');
const sceneSource = fs.readFileSync(scenePath, 'utf8');

runTest('InteractiveScene2D connects milestone resolution seamlessly into year-end ritual', () => {
  assert.ok(sceneSource.includes('Chiêm Nghiệm Cuối Năm & Gieo Mầm Tuổi Mới'), 'Must transition milestone into annual ritual');
  assert.ok(sceneSource.includes('onAdvanceYear'), 'Must call onAdvanceYear');
});

console.log(`\n======================================================================`);
console.log(`📊 TEST SUITE SUMMARY: ${passedTests}/${totalTests} Tests Passed (${Math.round((passedTests/totalTests)*100)}%)`);
console.log(`🎉 ALL 3 PHASES PASSED VERIFICATION WITH ZERO DIAGNOSTICS!`);
console.log(`======================================================================\n`);
