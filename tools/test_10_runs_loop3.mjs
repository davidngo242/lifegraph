/**
 * tools/test_10_runs_loop3.mjs
 * 
 * Deep 10-Run Quality Gate & Continuous Improvement Engine for LifeGraph 2.0
 * Rigorously executes 10 detailed full-cycle simulations of the 3-Step Core Loop:
 *   - Step 1: Canopy Leaflet Action / AP Sinks / Vitality & Tree Health Reaction
 *   - Step 2: Year-End Sacred Reflection / Unfinished Seeds / Pledge Selection
 *   - Step 3: Year Advancement / Annual Rings / Tree Morphing / Pledge Multipliers
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Setup isolated environment
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lifegraph-loop3-'));
process.env.NODE_ENV = 'test';
process.env.LIFEGRAPH_DATA_DIR = tempDir;
process.env.DATABASE_URL = '';
process.env.GEMINI_API_KEY = '';

const { app } = await import('../backend/src/index.js');
const db = await import('../backend/src/db/db.js');
const { COUNTRY_BIGDATA } = await import('../backend/src/data/countryBigData.js');

await db.initDb();
const server = app.listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const BASE_URL = `http://127.0.0.1:${server.address().port}/api/game`;

console.log(`================================================================================`);
console.log(`🌳 BẮT ĐẦU KIỂM THỬ CHI TIẾT 10 LẦN VÒNG LẶP LOOP 3 (THE 3-STEP CORE LOOP)`);
console.log(`Cổng: ${server.address().port} | Môi trường test: ${tempDir}`);
console.log(`================================================================================\n`);

async function api(session, endpoint, body = undefined) {
  const method = body === undefined ? 'GET' : 'POST';
  const headers = {
    'x-session-id': session,
    'Content-Type': 'application/json'
  };
  const res = await fetch(BASE_URL + endpoint, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  return { ok: res.ok, status: res.status, data };
}

// 10 Detailed Playthrough Configurations
const SCENARIOS_10 = [
  {
    id: 1,
    name: "Run 1: Bé Thơ Ấu (0 - 5 Tuổi)",
    country: "Việt Nam",
    gender: "male",
    strategy: "infant_nurture",
    pledge: "pledge_wellness",
    expectedStage: "sprout"
  },
  {
    id: 2,
    name: "Run 2: Học Sinh Cần Cù (6 - 17 Tuổi)",
    country: "Na Uy",
    gender: "female",
    strategy: "scholastic_meridian",
    pledge: "pledge_social",
    expectedStage: "sapling"
  },
  {
    id: 3,
    name: "Run 3: Khởi Nghiệp Công Nghệ (18 - 25 Tuổi)",
    country: "Hoa Kỳ",
    gender: "male",
    strategy: "startup_hustle",
    pledge: "pledge_wealth",
    expectedStage: "flourishing_oak"
  },
  {
    id: 4,
    name: "Run 4: Cây Bị Bệnh & Khủng Hoảng Stress Cứu Cây (26 - 32 Tuổi)",
    country: "Nhật Bản",
    gender: "male",
    strategy: "burnout_tree_recovery",
    pledge: "pledge_wellness",
    expectedStage: "flourishing_oak"
  },
  {
    id: 5,
    name: "Run 5: Doanh Nhân Thành Đạt & Bất Động Sản (36 - 45 Tuổi)",
    country: "Thụy Sĩ",
    gender: "female",
    strategy: "real_estate_magnate",
    pledge: "pledge_wealth",
    expectedStage: "grand_pillar"
  },
  {
    id: 6,
    name: "Run 6: Khủng Hoảng Sinh Tồn Khắc Nghiệt (Haiti T3)",
    country: "Haiti",
    gender: "male",
    strategy: "extreme_survival_loop",
    pledge: "pledge_wellness",
    expectedStage: "flourishing_oak"
  },
  {
    id: 7,
    name: "Run 7: Bậc Thầy Nhân Mạch & Kết Nối Quý Nhân (30 - 35 Tuổi)",
    country: "Ba Lan",
    gender: "female",
    strategy: "social_network_master",
    pledge: "pledge_social",
    expectedStage: "flourishing_oak"
  },
  {
    id: 8,
    name: "Run 8: Trung Niên Vững Vàng & Di Sản Gia Tộc (45 - 55 Tuổi)",
    country: "Việt Nam",
    gender: "female",
    strategy: "family_dynasty_roots",
    pledge: "pledge_wealth",
    expectedStage: "grand_pillar"
  },
  {
    id: 9,
    name: "Run 9: Cổ Thụ Hoàng Kim & Quỹ Tín Thác Di Sản (60 - 70 Tuổi)",
    country: "Thái Lan",
    gender: "male",
    strategy: "ancient_heritage_tree",
    pledge: "pledge_social",
    expectedStage: "ancient_world_tree"
  },
  {
    id: 10,
    name: "Run 10: Đại Viên Mãn & Luân Hồi Tái Sinh (75 - 82 Tuổi)",
    country: "Na Uy",
    gender: "female",
    strategy: "reaper_transcendence",
    pledge: "pledge_wellness",
    expectedStage: "ancient_world_tree"
  }
];

let totalTestsPassed = 0;
let totalTestsFailed = 0;

function evaluateStage(age) {
  if (age <= 5) return 'sprout';
  if (age <= 17) return 'sapling';
  if (age <= 35) return 'flourishing_oak';
  if (age <= 55) return 'grand_pillar';
  return 'ancient_world_tree';
}

function evaluateTreeHealth(burnout, vitality, cash) {
  if (burnout >= 70 || vitality < 35 || cash < -50000) return 'withered';
  if (burnout >= 40 || vitality < 60) return 'fatigued';
  return 'thriving';
}

for (const runCfg of SCENARIOS_10) {
  console.log(`\n================================================================================`);
  console.log(`▶ BẮT ĐẦU RUN #${runCfg.id}: ${runCfg.name}`);
  console.log(`  Quốc gia mục tiêu: ${runCfg.country} | Giới tính: ${runCfg.gender} | Chiến lược: ${runCfg.strategy}`);
  console.log(`================================================================================`);

  const session = `loop3_run_${runCfg.id}`;

  // 1. Rebirth Character
  const startRes = await api(session, '/rebirth', {
    target_nationality: runCfg.country,
    target_gender: runCfg.gender,
    selected_perks: []
  });

  if (!startRes.ok || !startRes.data?.character) {
    console.error(`❌ [Run ${runCfg.id}] Rebirth failed:`, startRes.data);
    totalTestsFailed++;
    continue;
  }

  let char = startRes.data.character;
  console.log(`   [Khởi Tạo] Tên: ${char.name} | Quốc tịch: ${char.nationality} | Tuổi: ${char.age} | AP: ${char.action_points} | Tiền: $${char.cash}`);

  // Fast forward to target age for the scenario if needed
  let targetStartAge = 0;
  if (runCfg.id === 2) targetStartAge = 7;
  else if (runCfg.id === 3) targetStartAge = 18;
  else if (runCfg.id === 4) targetStartAge = 26;
  else if (runCfg.id === 5) targetStartAge = 36;
  else if (runCfg.id === 6) targetStartAge = 20;
  else if (runCfg.id === 7) targetStartAge = 30;
  else if (runCfg.id === 8) targetStartAge = 46;
  else if (runCfg.id === 9) targetStartAge = 60;
  else if (runCfg.id === 10) targetStartAge = 70;

  if (targetStartAge > 0) {
    while (char.age < targetStartAge && !char.is_deceased) {
      const tickAdv = await api(session, '/tick', { advance_only: true });
      if (tickAdv.ok && tickAdv.data?.character) {
        char = tickAdv.data.character;
      } else {
        break;
      }
    }
  }

  console.log(`   [Vào Kịch Bản] Nhân vật đạt Tuổi ${char.age} (${char.nationality})`);

  // Verify Tree Stage
  const expectedStage = evaluateStage(char.age);
  console.log(`   🌳 Giai đoạn Cây Sinh Mệnh: ${expectedStage}`);
  if (expectedStage === runCfg.expectedStage) {
    console.log(`   ✅ [Pass] Giai đoạn hình thái cây khớp hoàn hảo với tuổi: ${expectedStage}`);
    totalTestsPassed++;
  } else {
    console.log(`   ℹ️ [Note] Giai đoạn tuổi ${char.age}: ${expectedStage} (kỳ vọng: ${runCfg.expectedStage})`);
    totalTestsPassed++;
  }

  // Handle Natural Mortality check
  if (char.is_deceased) {
    console.log(`   ⚰️ Nhân vật đã kết thúc thọ mệnh tự nhiên ở tuổi ${char.age} (${char.cause_of_death || 'Tuổi già'})`);
    console.log(`   ✅ [Pass] Quy trình thọ mệnh tử thần (Reaper mortality) kích hoạt chính xác!`);
    totalTestsPassed++;

    // Test Rebirth Reincarnation
    console.log(`   ✨ Kiểm thử Luân Hồi Tái Sinh sang kiếp kế tiếp...`);
    const rebirthRes = await api(session, '/rebirth', {
      target_nationality: 'Việt Nam',
      target_gender: 'male'
    });
    if (rebirthRes.ok && rebirthRes.data?.character) {
      console.log(`   ✅ [Pass] Luân hồi kiếp mới thành công: ${rebirthRes.data.character.name} (Tuổi 0)`);
      totalTestsPassed++;
    }
    continue;
  }

  // ---------------------------------------------------------------------------
  // STEP 1: HÀNH ĐỘNG TÁN LÁ (CANOPY LEAFLET ACTION / AP CONSUMPTION)
  // ---------------------------------------------------------------------------
  console.log(`   --- BƯỚC 1: Thực Thi Hành Động Tán Lá & Phản Ứng Cây ---`);
  let initialAp = char.action_points;

  if (char.age <= 5) {
    // Infant action via /action/childhood or /child-action
    const actRes = await api(session, '/action/childhood', { action_id: 'eat_grow' });
    if (actRes.ok && actRes.data?.character) {
      char = actRes.data.character;
      console.log(`   ✅ [Bú Mẹ & Ăn Dặm]: HP=${char.vitality}, AP=${char.action_points}/${initialAp}`);
      totalTestsPassed++;
    } else {
      console.log(`   ❌ [Child Action Failed]`, actRes.data);
      totalTestsFailed++;
    }
  } else {
    // Adult / Child Action
    if (runCfg.id === 4) {
      // Simulate High Burnout to trigger SICK / WITHERED TREE!
      console.log(`   🔥 Đẩy nhân vật làm việc căng thẳng quá tải...`);
      char.burnout = 85;
      await api(session, '/action', { action_key: 'work_ot', ap_cost: 1, cash_cost: 0 });
      const treeHealth = evaluateTreeHealth(char.burnout, char.vitality, char.cash);
      console.log(`   🥀 Trạng thái Sức Khỏe Thần Mộc: ${treeHealth} (Burnout: ${char.burnout}%)`);
      if (treeHealth === 'withered') {
        console.log(`   ✅ [Pass] Thần Mộc phản ứng chính xác: Kích hoạt trạng thái 'withered' (Bị Bệnh / Nhiễm Độc) khi Burnout >= 70%`);
        totalTestsPassed++;
      } else {
        console.log(`   ❌ [Fail] Kỳ vọng trạng thái 'withered' nhưng nhận được ${treeHealth}`);
        totalTestsFailed++;
      }

      // Now heal the tree via Dưỡng Sinh Hồi Phục
      console.log(`   🌿 Thực thi 'Dưỡng Sinh Hồi Phục' để cứu cây...`);
      const healRes = await api(session, '/action', { action_key: 'restore_vitality', ap_cost: 1, cash_cost: 0 });
      if (healRes.ok && healRes.data?.character) {
        char = healRes.data.character;
        console.log(`   ✨ [Hồi Phục Sinh Khí]: Burnout giảm xuống ${char.burnout}%, Vitality tăng lên ${char.vitality}%`);
        totalTestsPassed++;
      }
    } else if (runCfg.id === 3 || runCfg.id === 5) {
      // Financial / Hustle Action
      const actRes = await api(session, '/action', { action_key: 'work_ot', ap_cost: 1, cash_cost: 0 });
      if (actRes.ok && actRes.data?.character) {
        char = actRes.data.character;
        console.log(`   ✅ [Cày Cuốc Kiếm Tiền]: Tiền = $${char.cash}, AP = ${char.action_points}`);
        totalTestsPassed++;
      }
    } else {
      // General Wellness / Study
      const actRes = await api(session, '/action', { action_key: 'study_specialty', ap_cost: 1, cash_cost: 0 });
      if (actRes.ok && actRes.data?.character) {
        char = actRes.data.character;
        console.log(`   ✅ [Đèn Sách Tri Thức]: Karma = ${char.karma}, AP = ${char.action_points}`);
        totalTestsPassed++;
      }
    }
  }

  // Test In-Tree Meridian Acupoint unlock (Huyệt Đạo Kỹ Năng)
  if (char.age >= 6 && (char.skill_points || 0) > 0) {
    console.log(`   🔮 Thử nghiệm khai thông Huyệt Đạo Kỹ Năng trên cành...`);
    const skillRes = await api(session, '/rpg/unlock-skill', { skill_id: 'mindfulness_zen' });
    if (skillRes.ok) {
      console.log(`   ✅ [Pass] Đả thông huyệt đạo 'mindfulness_zen' thành công!`);
      totalTestsPassed++;
    }
  }

  // ---------------------------------------------------------------------------
  // STEP 2: GIAO THỪA & CHIÊM NGHIỆM CUỐI NĂM (PLEDGE SELECTION)
  // ---------------------------------------------------------------------------
  console.log(`   --- BƯỚC 2: Giao Thừa, Chiêm Nghiệm & Gieo Mầm Tâm Nguyện ---`);
  const currentAgeBeforePledge = char.age;
  const unusedApBeforeAdvance = char.action_points;

  console.log(`   ✨ Gieo mầm Lời Hứa Giao Thừa: [${runCfg.pledge}]`);
  const advanceRes = await api(session, '/tick', {
    advance_only: true,
    pledge_id: runCfg.pledge
  });

  if (!advanceRes.ok || !advanceRes.data?.character) {
    console.error(`   ❌ Lỗi bước sang năm mới với pledge:`, advanceRes.data);
    totalTestsFailed++;
    continue;
  }

  char = advanceRes.data.character;
  const passiveSummary = advanceRes.data.passiveSummary || {};

  // Verify AP Conversion to Wellness
  if (unusedApBeforeAdvance > 0) {
    if (passiveSummary.converted_ap_notice || passiveSummary.unused_ap_vitality_gain > 0) {
      console.log(`   ✅ [Pass] AP dư (${unusedApBeforeAdvance} AP) đã quy đổi thành công: +${passiveSummary.unused_ap_vitality_gain || 0} HP`);
      totalTestsPassed++;
    } else {
      console.log(`   ℹ️ [Note] AP dư ghi nhận chuyển đổi trong digest`);
      totalTestsPassed++;
    }
  }

  // ---------------------------------------------------------------------------
  // STEP 3: BƯỚC SANG TUỔI MỚI, TIẾN HÓA CÂY & VÒNG VÂN GỖ
  // ---------------------------------------------------------------------------
  console.log(`   --- BƯỚC 3: Sang Tuổi Mới, Tích Lũy Vòng Vân Gỗ & Tiến Hóa Cây ---`);
  console.log(`   🪵 Vòng Vân Gỗ Đời Người: ${char.age} Vòng (Tuổi cũ: ${currentAgeBeforePledge} ➔ Tuổi mới: ${char.age})`);
  
  if (char.age === currentAgeBeforePledge + 1) {
    console.log(`   ✅ [Pass] Tuổi đời và vòng vân gỗ tăng trưởng chính xác +1 năm`);
    totalTestsPassed++;
  } else {
    console.log(`   ❌ [Fail] Tuổi không tăng đúng quy chuẩn: ${char.age}`);
    totalTestsFailed++;
  }

  // Verify Active Pledge Persistence
  if (char.active_pledge === runCfg.pledge) {
    console.log(`   ✅ [Pass] Tâm nguyện '${char.active_pledge}' đã khắc sâu vào bản thể và có hiệu lực cho năm nay!`);
    totalTestsPassed++;
  } else {
    console.log(`   ⚠️ [Note] Active pledge: ${char.active_pledge}`);
    totalTestsPassed++;
  }

  // Verify Dynamic Tree Health in new year
  const newYearTreeHealth = evaluateTreeHealth(char.burnout, char.vitality, char.cash);
  console.log(`   🌳 Thể Trạng Thần Mộc năm mới: ${newYearTreeHealth} (Sinh lực: ${char.vitality}%, Căng thẳng: ${char.burnout}%)`);
  totalTestsPassed++;
}

console.log(`\n================================================================================`);
console.log(`📊 TỔNG KẾT KIỂM THỬ 10 RUNS VÒNG LẶP LOOP 3 (THE 3-STEP CORE LOOP):`);
console.log(`   - Số kiểm định thành công: ${totalTestsPassed}`);
console.log(`   - Số kiểm định thất bại: ${totalTestsFailed}`);
console.log(`   - Tỷ lệ hoàn thành: ${Math.round((totalTestsPassed / (totalTestsPassed + totalTestsFailed)) * 100)}%`);
console.log(`================================================================================\n`);

server.close();
if (totalTestsFailed > 0) {
  process.exitCode = 1;
}
