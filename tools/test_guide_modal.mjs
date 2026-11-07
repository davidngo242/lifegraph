/**
 * Test Suite: GameGuideModal Component & Integration Quality Gate
 * Tests rendering safety, 'fun' vs 'advanced' modes, 6yo child visual elements,
 * 4 core pillars (AP, HP/Vitality, Burnout, Cash), 3 gameplay steps, and page.tsx integration.
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const rootDir = process.cwd();
const frontendPkgPath = path.resolve(rootDir, 'frontend', 'package.json');
const req = createRequire(frontendPkgPath);
const ts = req('typescript');
const React = req('react');
const ReactDOMServer = req('react-dom/server');

console.log(`\n======================================================================`);
console.log(`🎮 TEST SUITE: GAME GUIDE MODAL & VISUAL USER EXPERIENCE GATE`);
console.log(`TS Version: ${ts.version} | React Version: ${React.version}`);
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
// Load and Transpile GameGuideModal Component
// -------------------------------------------------------------
const guideModalPath = path.resolve(rootDir, 'frontend', 'app', 'components', 'GameGuideModal.tsx');
assert.ok(fs.existsSync(guideModalPath), `GameGuideModal.tsx must exist at ${guideModalPath}`);

const tsxSource = fs.readFileSync(guideModalPath, 'utf8');
const transpiled = ts.transpileModule(tsxSource, {
  compilerOptions: {
    jsx: ts.JsxEmit.React,
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    esModuleInterop: true
  }
});

const componentModule = { exports: {} };
const fnRunner = new Function('require', 'module', 'exports', transpiled.outputText);
fnRunner(req, componentModule, componentModule.exports);
const GameGuideModal = componentModule.exports.default;

assert.equal(typeof GameGuideModal, 'function', 'GameGuideModal should export a React component function');

// =============================================================
// TEST 1: Component returns null when isOpen is false
// =============================================================
runTest('Safe Null Rendering when isOpen is false', () => {
  const html = ReactDOMServer.renderToString(
    React.createElement(GameGuideModal, { isOpen: false, onClose: () => {} })
  );
  assert.equal(html, '', 'Component must render nothing (empty string) when isOpen is false');
});

// =============================================================
// TEST 2: Fun Mode (Default) renders properly when isOpen is true
// =============================================================
let defaultHtml = '';
runTest('Default "fun" mode rendering and structure', () => {
  defaultHtml = ReactDOMServer.renderToString(
    React.createElement(GameGuideModal, { isOpen: true, onClose: () => {} })
  );
  assert.ok(defaultHtml.length > 5000, `Rendered HTML should be substantial (got ${defaultHtml.length} bytes)`);
  assert.ok(defaultHtml.includes('Bản Đồ Vui Nhộn'), 'Must include "Bản Đồ Vui Nhộn" title');
  assert.ok(defaultHtml.includes('Bé 6 tuổi cũng hiểu'), 'Must include "Bé 6 tuổi cũng hiểu" badge');
  assert.ok(defaultHtml.includes('Dễ Nhất'), 'Must include "Dễ Nhất" mobile switch label');
  assert.ok(defaultHtml.includes('Đã Hiểu Luật Chơi'), 'Must include confirmation button');
});

// =============================================================
// TEST 3: 3 Steps for 6yo child (10s gameplay loop)
// =============================================================
runTest('Visual 3 Steps Gameplay Loop (10 seconds tutorial)', () => {
  assert.ok(defaultHtml.includes('3 Bước Chơi Ngay Trong 10 Giây'), 'Must include 3 steps section heading');
  assert.ok(defaultHtml.includes('Cứ lặp lại là thọ 100 tuổi!'), 'Must include friendly longevity slogan');

  // Step 1
  assert.ok(defaultHtml.includes('Bước 1'), 'Must include Bước 1');
  assert.ok(defaultHtml.includes('Bấm Chọn 1 Việc Làm'), 'Must include Bước 1 Title');
  assert.ok(defaultHtml.includes('Đi làm'), 'Must mention "Đi làm"');
  assert.ok(defaultHtml.includes('Tập thể dục'), 'Must mention "Tập thể dục"');

  // Step 2
  assert.ok(defaultHtml.includes('Bước 2'), 'Must include Bước 2');
  assert.ok(defaultHtml.includes('Bước Sang Tuổi Mới'), 'Must include Bước 2 Title');
  assert.ok(defaultHtml.includes('Bấm nút tím to bự'), 'Must include intuitive visual hint for children');

  // Step 3
  assert.ok(defaultHtml.includes('Bước 3'), 'Must include Bước 3');
  assert.ok(defaultHtml.includes('Nhận Quà &amp; Điểm May Mắn') || defaultHtml.includes('Nhận Quà & Điểm May Mắn'), 'Must include Bước 3 Title');
  assert.ok(defaultHtml.includes('sinh nhật'), 'Must mention birthday rewards');
});

// =============================================================
// TEST 4: 4 Core Visual Pillars (AP, HP/Vitality, Burnout, Cash)
// =============================================================
runTest('4 Core Life Pillars for young players (AP, HP, Burnout, Cash)', () => {
  assert.ok(defaultHtml.includes('4 Đồ Chơi Sinh Mệnh Bạn Cần Nhìn Mỗi Năm'), 'Must include 4 pillars section heading');

  // Pillar 1: AP / Energy
  assert.ok(defaultHtml.includes('Tia Sét Năng Lượng'), 'Must include AP pillar title');
  assert.ok(defaultHtml.includes('Điểm AP'), 'Must label AP Points');
  assert.ok(defaultHtml.includes('3-4 tia sét'), 'Must describe AP count intuitively');
  assert.ok(defaultHtml.includes('Thừa sét cuối năm tự biến thành máu!'), 'Must describe AP to HP carryover bonus');

  // Pillar 2: Vitality / HP
  assert.ok(defaultHtml.includes('Trái Tim Khỏe Mạnh'), 'Must include HP pillar title');
  assert.ok(defaultHtml.includes('Sống Còn'), 'Must label Vitality as Survival');
  assert.ok(defaultHtml.includes('Hết tim là ngủm'), 'Must intuitively warn child about health loss');
  assert.ok(defaultHtml.includes('Hết máu là Game Over ngay!'), 'Must clearly state Game Over condition');

  // Pillar 3: Burnout / Stress
  assert.ok(defaultHtml.includes('Ngọn Lửa Áp Lực'), 'Must include Burnout pillar title');
  assert.ok(defaultHtml.includes('Mệt Mỏi'), 'Must label Burnout as Tiredness');
  assert.ok(defaultHtml.includes('mệt xỉu'), 'Must describe stress exhaustion intuitively');
  assert.ok(defaultHtml.includes('Lửa trên 80% sẽ thiêu rụi trái tim!'), 'Must specify the 80% critical threshold');

  // Pillar 4: Cash & Assets
  assert.ok(defaultHtml.includes('Túi Tiền Tiết Kiệm'), 'Must include Cash/Wealth pillar title');
  assert.ok(defaultHtml.includes('Tài Sản'), 'Must label Wealth as Assets');
  assert.ok(defaultHtml.includes('gom tiền mua nhà to'), 'Must describe buying houses and caring for family');
  assert.ok(defaultHtml.includes('Mua nhà xịn để cơ thể khỏe re!'), 'Must explain shelter tier health bonus');
});

// =============================================================
// TEST 5: 4 Easy Beginner Golden Rules
// =============================================================
runTest('4 Easy Beginner Tips for survival and success', () => {
  assert.ok(defaultHtml.includes('4 Bí Quyết Dễ Ẹc Để Luôn Chiến Thắng'), 'Must include beginner rules heading');
  assert.ok(defaultHtml.includes('Nâng cấp chỗ ở'), 'Must advise housing upgrades');
  assert.ok(defaultHtml.includes('Thư giãn đúng lúc'), 'Must advise relaxation when stressed');
  assert.ok(defaultHtml.includes('Kết thân với bạn bè'), 'Must advise forming social ties');
  assert.ok(defaultHtml.includes('Sinh con nối dõi'), 'Must advise family succession');
});

// =============================================================
// TEST 6: Advanced Mode - Tab 1 (RPG Skill Tree)
// =============================================================
runTest('Advanced Mode: Tab 1 - RPG Skill Trees (Wealth, Social, Sage)', () => {
  const origUseState = React.useState;
  let advRpgHtml = '';
  try {
    React.useState = function(initial) {
      if (initial === 'fun') return ['advanced', () => {}];
      if (initial === 'rpg') return ['rpg', () => {}];
      return origUseState.apply(this, arguments);
    };
    advRpgHtml = ReactDOMServer.renderToString(
      React.createElement(GameGuideModal, { isOpen: true, onClose: () => {} })
    );
  } finally {
    React.useState = origUseState;
  }

  assert.ok(advRpgHtml.includes('Cẩm Nang Tra Cứu RPG'), 'Must show RPG Guide header in advanced mode');
  assert.ok(advRpgHtml.includes('Dành cho Cao Thủ'), 'Must display "Dành cho Cao Thủ" badge');
  assert.ok(advRpgHtml.includes('Hệ Thống Điểm Kỹ Năng (SP) &amp; Tăng Cấp (EXP)') || advRpgHtml.includes('Hệ Thống Điểm Kỹ Năng (SP) & Tăng Cấp (EXP)'), 'Must explain SP & EXP');
  assert.ok(advRpgHtml.includes('Nhánh 1: Thương Trường &amp; Tài Phiệt (Wealth)') || advRpgHtml.includes('Nhánh 1: Thương Trường & Tài Phiệt (Wealth)'), 'Must detail Wealth skill tree');
  assert.ok(advRpgHtml.includes('Nhánh 2: Uy Quyền &amp; Nhân Mạch (Social)') || advRpgHtml.includes('Nhánh 2: Uy Quyền & Nhân Mạch (Social)'), 'Must detail Social skill tree');
  assert.ok(advRpgHtml.includes('Nhánh 3: Tâm Thức &amp; Chân Nhân (Sage)') || advRpgHtml.includes('Nhánh 3: Tâm Thức & Chân Nhân (Sage)'), 'Must detail Sage skill tree');
  assert.ok(advRpgHtml.includes('Mắt Thần Định Giá') && advRpgHtml.includes('Cỗ Máy Dòng Tiền'), 'Must list specific wealth talents');
  assert.ok(advRpgHtml.includes('Tâm Lý Thép') && advRpgHtml.includes('Giác Ngộ Niết Bàn'), 'Must list specific sage talents');
});

// =============================================================
// TEST 7: Advanced Mode - Tab 2 (NPC Quý Nhân)
// =============================================================
runTest('Advanced Mode: Tab 2 - 4 Social NPC Archetypes & Favor Bonuses', () => {
  const origUseState = React.useState;
  let advNpcHtml = '';
  try {
    React.useState = function(initial) {
      if (initial === 'fun') return ['advanced', () => {}];
      if (initial === 'rpg') return ['npcs', () => {}];
      return origUseState.apply(this, arguments);
    };
    advNpcHtml = ReactDOMServer.renderToString(
      React.createElement(GameGuideModal, { isOpen: true, onClose: () => {} })
    );
  } finally {
    React.useState = origUseState;
  }

  assert.ok(advNpcHtml.includes('4 Hình Mẫu Quý Nhân Đồng Hành'), 'Must show 4 NPC archetypes header');
  assert.ok(advNpcHtml.includes('GS. Vũ Trọng Khang'), 'Must contain Mentor GS. Vũ Trọng Khang');
  assert.ok(advNpcHtml.includes('Trần Đình Khang'), 'Must contain Ally Trần Đình Khang');
  assert.ok(advNpcHtml.includes('Lâm Thế Cường'), 'Must contain Rival Lâm Thế Cường');
  assert.ok(advNpcHtml.includes('Nguyễn Thảo My'), 'Must contain Protégé Nguyễn Thảo My');
  assert.ok(advNpcHtml.includes('Cấp 3'), 'Must explain Level 3 favor rescue abilities');
});

// =============================================================
// TEST 8: Advanced Mode - Tab 3 (Economy & Assets)
// =============================================================
runTest('Advanced Mode: Tab 3 - Economic Strategies & Debt Penalties', () => {
  const origUseState = React.useState;
  let advEcoHtml = '';
  try {
    React.useState = function(initial) {
      if (initial === 'fun') return ['advanced', () => {}];
      if (initial === 'rpg') return ['economy', () => {}];
      return origUseState.apply(this, arguments);
    };
    advEcoHtml = ReactDOMServer.renderToString(
      React.createElement(GameGuideModal, { isOpen: true, onClose: () => {} })
    );
  } finally {
    React.useState = origUseState;
  }

  assert.ok(advEcoHtml.includes('Chiến Lược Tích Sản &amp; Quản Trị Dòng Tiền') || advEcoHtml.includes('Chiến Lược Tích Sản & Quản Trị Dòng Tiền'), 'Must show economy title');
  assert.ok(advEcoHtml.includes('4.5%/năm'), 'Must warn about 4.5% interest on negative debt');
  assert.ok(advEcoHtml.includes('Cày Việc Chủ Động'), 'Must explain active labor stage');
  assert.ok(advEcoHtml.includes('Cổ Tức BĐS &amp; Cổ Phiếu') || advEcoHtml.includes('Cổ Tức BĐS & Cổ Phiếu'), 'Must explain passive cashflow');
});

// =============================================================
// TEST 9: Advanced Mode - Tab 4 (Life Stages)
// =============================================================
runTest('Advanced Mode: Tab 4 - 5 Life Milestones Progression', () => {
  const origUseState = React.useState;
  let advStagesHtml = '';
  try {
    React.useState = function(initial) {
      if (initial === 'fun') return ['advanced', () => {}];
      if (initial === 'rpg') return ['stages', () => {}];
      return origUseState.apply(this, arguments);
    };
    advStagesHtml = ReactDOMServer.renderToString(
      React.createElement(GameGuideModal, { isOpen: true, onClose: () => {} })
    );
  } finally {
    React.useState = origUseState;
  }

  assert.ok(advStagesHtml.includes('0 - 5 Tuổi'), 'Must include 0-5 years stage');
  assert.ok(advStagesHtml.includes('6 - 17 Tuổi'), 'Must include 6-17 years stage');
  assert.ok(advStagesHtml.includes('18 - 35 Tuổi'), 'Must include 18-35 years stage');
  assert.ok(advStagesHtml.includes('36 - 55 Tuổi'), 'Must include 36-55 years stage');
  assert.ok(advStagesHtml.includes('56+ Tuổi'), 'Must include 56+ years stage');
});

// =============================================================
// TEST 10: Integration with frontend/app/page.tsx
// =============================================================
runTest('Integration with frontend/app/page.tsx', () => {
  const pagePath = path.resolve(rootDir, 'frontend', 'app', 'page.tsx');
  const pageCode = fs.readFileSync(pagePath, 'utf8');

  // Verify import
  assert.ok(
    pageCode.includes("import GameGuideModal from './components/GameGuideModal'"),
    'page.tsx must import GameGuideModal'
  );

  // Verify state
  assert.ok(
    pageCode.includes('showGuideModal') && pageCode.includes('setShowGuideModal'),
    'page.tsx must define showGuideModal state'
  );

  // Verify keyboard shortcuts (? and /)
  assert.ok(
    pageCode.includes("key === '?'") || pageCode.includes("key === '/'"),
    'page.tsx must register ? or / shortcut for guide'
  );

  // Verify Guide opening connection in Header or HUD
  assert.ok(
    pageCode.includes('setShowGuideModal(true)'),
    'page.tsx must connect setShowGuideModal(true) to open guide'
  );

  // Verify modal rendering
  assert.ok(
    pageCode.includes('<GameGuideModal') &&
    pageCode.includes('isOpen={showGuideModal}') &&
    pageCode.includes('onClose={() => setShowGuideModal(false)}'),
    'page.tsx must render GameGuideModal with isOpen and onClose props'
  );
});

// =============================================================
// SUMMARY REPORT
// =============================================================
console.log(`\n======================================================================`);
console.log(`📊 TEST SUITE SUMMARY: ${passedTests}/${totalTests} Tests Passed (100%)`);
if (passedTests === totalTests) {
  console.log(`🎉 ALL GAME GUIDE MODAL QA TESTS PASSED FLAWLESSLY!`);
} else {
  console.log(`⚠️ SOME TESTS FAILED! Check error log above.`);
}
console.log(`======================================================================\n`);
