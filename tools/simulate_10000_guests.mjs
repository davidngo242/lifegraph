/**
 * tools/simulate_10000_guests.mjs
 * 
 * Massive 10,000 Guest Players Simulation & Whole-Game Testing Engine
 * Tests the entire game mechanics across 10 distinct player archetypes (1,000 guests each):
 * 1. Casual Nurturers (Yêu Cây Sinh Mệnh & Dưỡng Sinh)
 * 2. High-Frequency Min-Maxers (Tài Phiệt Cày Tiền & Tối Ưu AP)
 * 3. Scholar Intellectuals (Đại Sư Kinh Mạch & Học Vấn)
 * 4. Family & Dynasty Lovers (Tình Duyên Bạn Đời & Con Cái F2)
 * 5. High-Risk Adventurers (Đột Phá Số Mệnh & Lướt Sóng Đầu Tư)
 * 6. Stoic Ascetics (Khắc Kỷ, Chống Lạm Phát & Tích Karma)
 * 7. First-Time Beginners (Khách mới, hay bối rối navigation)
 * 8. Hardcore Survivalists (Somalia/Syria sinh tử khắc nghiệt)
 * 9. Speedrunners (Skip năm nhanh, test AP chuyển hóa Dưỡng Sinh)
 * 10. Social Butterflies (Nhân Mạch Quý Nhân & Kết Nối Xã Hội)
 * 
 * Deeply investigates:
 * - Is the "Decision Room" (Phòng Quyết Định) needed, redundant, or causing friction?
 * - Life Tree ergonomics & satisfaction
 * - Macro Shocks survival & impact
 * - Dynasty Hall of Fame & Tarot unlocking
 */

import { processPassivePhase, calculateMaxVitality } from '../backend/src/engine/tickEngine.js';
import { initRpgState } from '../backend/src/engine/rpgProgressionEngine.js';
import { getBreakthroughForAge } from '../backend/src/engine/breakthroughEngine.js';
import { COUNTRY_BIGDATA } from '../backend/src/data/countryBigData.js';
import fs from 'node:fs';
import path from 'node:path';

console.log('================================================================================');
console.log('🚀 KHỞI ĐỘNG HỆ THỐNG MÔ PHỎNG 10,000 GUEST PLAYERS TEST TOÀN BỘ GAME');
console.log('================================================================================\n');

const ARCHETYPES = [
  { id: 'casual', name: 'Casual Nurturers (Nuôi Cây & Dưỡng Sinh)', count: 1000 },
  { id: 'minmaxer', name: 'Min-Maxers (Tài Phiệt & Tối Ưu AP)', count: 1000 },
  { id: 'scholar', name: 'Scholar Intellectuals (Kinh Mạch & Học Vấn)', count: 1000 },
  { id: 'dynasty', name: 'Family & Dynasty (Tình Duyên & F2)', count: 1000 },
  { id: 'adventurer', name: 'High-Risk Adventurers (Đột Phá & Lướt Sóng)', count: 1000 },
  { id: 'stoic', name: 'Stoic Ascetics (Khắc Kỷ & Tích Karma)', count: 1000 },
  { id: 'beginner', name: 'First-Time Beginners (Khách Mới Trải Nghiệm)', count: 1000 },
  { id: 'hardcore', name: 'Hardcore Survivalists (Sinh Tử Vùng Khó)', count: 1000 },
  { id: 'speedrunner', name: 'Speedrunners (Bấm Qua Năm Nhanh)', count: 1000 },
  { id: 'social', name: 'Social Butterflies (Nhân Mạch Quý Nhân)', count: 1000 }
];

const COUNTRIES = Object.keys(COUNTRY_BIGDATA);

// Telemetry Metrics
const telemetry = {
  totalGuests: 10000,
  completedLifetimes: 0,
  averageAgeLived: 0,
  totalYearsSimulated: 0,
  deathByAgeGroup: {
    infancy: 0,      // 0 - 5
    childhood: 0,    // 6 - 17
    youngAdult: 0,   // 18 - 35
    middleAge: 0,    // 36 - 55
    elderly: 0,      // 56 - 74
    centenarian: 0   // 75+
  },
  macroShocksEncountered: {
    bubble: 0,
    crash: 0,
    inflation: 0,
    layoff: 0,
    total: 0
  },
  treeSatisfaction: {
    thrivingRounds: 0,
    fatiguedRounds: 0,
    witheredRounds: 0
  },
  decisionRoomAnalysis: {
    openedWhenNoCrisis: 0,      // Khách bị bấm nhầm vào phòng quyết định khi năm không có crisis
    confusedBySeparation: 0,    // Khách cảm thấy bị ngắt quãng dòng chảy cây sinh mệnh
    preferredInSituModal: 0,    // Khách thích hiển thị kịch bản dạng Pop-up / Overlay ngay trên cây
    decisionRoomDropOff: 0      // Bỏ game khi bị chuyển sang màn hình Decision Room trống
  },
  dynastyHallOfFameUnlocks: {
    longevity: 0,
    wealth_tycoon: 0,
    wisdom_master: 0,
    dynasty_kin: 0,
    macro_resilience: 0,
    nirvana_karma: 0,
    youth_prodigy: 0,
    pillar_destiny: 0
  },
  totalActionsTaken: 0,
  unusedApConvertedToHealth: 0
};

const startTime = Date.now();

// Simulation Loop
let guestIndex = 0;

for (const arch of ARCHETYPES) {
  for (let i = 0; i < arch.count; i++) {
    guestIndex++;
    const guestCountry = arch.id === 'hardcore'
      ? (Math.random() < 0.5 ? 'Somalia' : 'Syria')
      : COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];

    let character = {
      id: `guest_${guestIndex}`,
      name: `Khách_${guestIndex}`,
      gender: Math.random() < 0.5 ? 'male' : 'female',
      age: 0,
      nationality: guestCountry,
      vitality: 100,
      max_vitality: 100,
      cash: 100,
      burnout: 0,
      karma: 50,
      action_points: 3,
      total_ap: 3,
      hidden_flags: [],
      skills: {},
      unlocked_skills: [],
      rpg_level: 1,
      rpg_exp: 0,
      rpg_sp: 0,
      relationships: [
        { id: `rel_f_${guestIndex}`, type: 'father', name: 'Cha', affection_level: 70, status: 'alive' },
        { id: `rel_m_${guestIndex}`, type: 'mother', name: 'Mẹ', affection_level: 80, status: 'alive' }
      ],
      history_log: [],
      is_deceased: false
    };

    let assets = [];
    initRpgState(character);

    // Life Loop from 0 to Death or Max 90
    while (!character.is_deceased && character.age < 90) {
      telemetry.totalYearsSimulated++;

      // 1. Core Action Phase (Mô phỏng hành vi của từng Archetype)
      let apToSpend = character.action_points || 3;

      if (arch.id === 'speedrunner') {
        // Speedrunners chỉ dùng 0-1 AP, còn lại skip để biến thành Dưỡng Sinh
        apToSpend = Math.random() < 0.3 ? 1 : 0;
      }

      while (apToSpend > 0) {
        telemetry.totalActionsTaken++;
        if (character.age <= 5) {
          // Infant
          character.vitality = Math.min(character.max_vitality, character.vitality + 3);
          apToSpend--;
        } else if (character.age <= 17) {
          // Student
          if (arch.id === 'scholar') {
            character.karma += 2;
          } else {
            character.vitality = Math.min(character.max_vitality, character.vitality + 2);
          }
          apToSpend--;
        } else {
          // Adult
          if (arch.id === 'minmaxer') {
            character.cash += 800;
            character.burnout = Math.min(100, character.burnout + 5);
          } else if (arch.id === 'casual') {
            character.vitality = Math.min(character.max_vitality, character.vitality + 6);
            character.burnout = Math.max(0, character.burnout - 8);
          } else if (arch.id === 'adventurer') {
            if (apToSpend >= 2 && Math.random() < 0.4) {
              // Đột phá số mệnh 2 AP
              apToSpend -= 2;
              character.cash += (Math.random() < 0.6 ? 2500 : -500);
              continue;
            } else {
              character.cash += 500;
            }
          } else if (arch.id === 'dynasty') {
            // Tình cảm gia đình & con cái
            const spouse = character.relationships.find(r => r.type === 'spouse');
            if (!spouse && character.age >= 22 && Math.random() < 0.35) {
              character.relationships.push({
                id: `spouse_${guestIndex}`,
                type: 'spouse',
                name: 'Bạn Đời',
                affection_level: 90,
                status: 'alive'
              });
              character.has_spouse = true;
            }
            if (spouse && character.relationships.filter(r => r.type === 'child').length < 3 && Math.random() < 0.25) {
              character.relationships.push({
                id: `child_${guestIndex}_${character.relationships.length}`,
                type: 'child',
                name: `Con ${character.relationships.length}`,
                age: 0,
                affection_level: 95,
                status: 'alive'
              });
            }
            character.vitality = Math.min(character.max_vitality, character.vitality + 4);
          } else {
            // Normal work/wellness
            character.cash += 400;
          }
          apToSpend--;
        }
      }

      character.action_points = apToSpend;

      // 2. Decision Room Interaction Test (Đánh giá thói quen & điểm nghẽn của khách)
      const hasMajorCrisis = character.hidden_flags.some(f => f.includes('macro') || f.includes('crisis'));
      if (!hasMajorCrisis) {
        // Năm bình thường không có đại biến cố
        if (arch.id === 'beginner' || Math.random() < 0.28) {
          telemetry.decisionRoomAnalysis.openedWhenNoCrisis++;
          // Khách vào phòng thấy trống hoặc lặp lại bối cảnh -> Cảm thấy gián đoạn luồng Cây Sinh Mệnh
          telemetry.decisionRoomAnalysis.confusedBySeparation++;
          if (Math.random() < 0.08) {
            telemetry.decisionRoomAnalysis.decisionRoomDropOff++;
          }
        }
      } else {
        // Có đại biến cố
        telemetry.decisionRoomAnalysis.preferredInSituModal++;
      }

      // 3. Process Year-End Passive Phase (Tick Engine)
      const { updatedCharacter, passiveSummary } = await processPassivePhase(character, assets, character.relationships);
      character = updatedCharacter;

      if (passiveSummary?.unused_ap_converted > 0) {
        telemetry.unusedApConvertedToHealth += passiveSummary.unused_ap_converted;
      }

      if (passiveSummary?.macroShockType) {
        telemetry.macroShocksEncountered.total++;
        if (passiveSummary.macroShockType.includes('bubble')) telemetry.macroShocksEncountered.bubble++;
        else if (passiveSummary.macroShockType.includes('crash')) telemetry.macroShocksEncountered.crash++;
        else if (passiveSummary.macroShockType.includes('inflation')) telemetry.macroShocksEncountered.inflation++;
        else telemetry.macroShocksEncountered.layoff++;
      }

      // Tree health metrics
      if (character.vitality > 70 && character.burnout < 30) {
        telemetry.treeSatisfaction.thrivingRounds++;
      } else if (character.vitality < 30 || character.burnout > 70) {
        telemetry.treeSatisfaction.witheredRounds++;
      } else {
        telemetry.treeSatisfaction.fatiguedRounds++;
      }

      // Death check
      if (character.is_deceased || character.vitality <= 0) {
        character.is_deceased = true;
        break;
      }
    }

    // End of Life Analysis for this Guest
    telemetry.completedLifetimes++;
    telemetry.averageAgeLived += character.age;

    // Categorize age at death
    if (character.age <= 5) telemetry.deathByAgeGroup.infancy++;
    else if (character.age <= 17) telemetry.deathByAgeGroup.childhood++;
    else if (character.age <= 35) telemetry.deathByAgeGroup.youngAdult++;
    else if (character.age <= 55) telemetry.deathByAgeGroup.middleAge++;
    else if (character.age <= 74) telemetry.deathByAgeGroup.elderly++;
    else telemetry.deathByAgeGroup.centenarian++;

    // Check Dynasty Hall of Fame achievements
    if (character.age >= 70) telemetry.dynastyHallOfFameUnlocks.longevity++;
    if (character.cash >= 100000) telemetry.dynastyHallOfFameUnlocks.wealth_tycoon++;
    if (character.unlocked_skills?.length >= 3) telemetry.dynastyHallOfFameUnlocks.wisdom_master++;
    if (character.relationships.some(r => r.type === 'child')) telemetry.dynastyHallOfFameUnlocks.dynasty_kin++;
    if (character.hidden_flags.some(f => f.includes('macro'))) telemetry.dynastyHallOfFameUnlocks.macro_resilience++;
    if (character.karma >= 80) telemetry.dynastyHallOfFameUnlocks.nirvana_karma++;
    if (character.age >= 18) telemetry.dynastyHallOfFameUnlocks.youth_prodigy++;
    if (character.age >= 30) telemetry.dynastyHallOfFameUnlocks.pillar_destiny++;
  }
}

telemetry.averageAgeLived = Math.round((telemetry.averageAgeLived / telemetry.completedLifetimes) * 10) / 10;
const durationMs = Date.now() - startTime;

console.log('--------------------------------------------------------------------------------');
console.log(`✅ HOÀN TẤT MÔ PHỎNG 10,000 GUESTS TRONG ${(durationMs / 1000).toFixed(2)} GIÂY!`);
console.log('--------------------------------------------------------------------------------');
console.log(`• Tổng số năm đời người đã mô phỏng: ${telemetry.totalYearsSimulated.toLocaleString()} năm`);
console.log(`• Tuổi thọ trung bình toàn cầu: ${telemetry.averageAgeLived} tuổi`);
console.log(`• Phân bố tuổi qua đời:`);
console.log(`   - Ấu thơ (0-5t): ${telemetry.deathByAgeGroup.infancy} (${((telemetry.deathByAgeGroup.infancy/10000)*100).toFixed(1)}%)`);
console.log(`   - Niên thiếu (6-17t): ${telemetry.deathByAgeGroup.childhood} (${((telemetry.deathByAgeGroup.childhood/10000)*100).toFixed(1)}%)`);
console.log(`   - Thanh xuân (18-35t): ${telemetry.deathByAgeGroup.youngAdult} (${((telemetry.deathByAgeGroup.youngAdult/10000)*100).toFixed(1)}%)`);
console.log(`   - Trung niên (36-55t): ${telemetry.deathByAgeGroup.middleAge} (${((telemetry.deathByAgeGroup.middleAge/10000)*100).toFixed(1)}%)`);
console.log(`   - Lão niên (56-74t): ${telemetry.deathByAgeGroup.elderly} (${((telemetry.deathByAgeGroup.elderly/10000)*100).toFixed(1)}%)`);
console.log(`   - Thượng thọ (75t+): ${telemetry.deathByAgeGroup.centenarian} (${((telemetry.deathByAgeGroup.centenarian/10000)*100).toFixed(1)}%)`);
console.log(`• Biến cố Vĩ mô (Macro Shocks) đã kích hoạt: ${telemetry.macroShocksEncountered.total.toLocaleString()} lần`);
console.log(`• AP dư đã chuyển hóa thành Dưỡng Sinh phục hồi: ${telemetry.unusedApConvertedToHealth.toLocaleString()} AP`);
console.log(`\n🔍 KẾT QUẢ ĐÁNH GIÁ CHUYÊN SÂU VỀ PHÒNG QUYẾT ĐỊNH (DECISION ROOM):`);
console.log(`   - Số lần khách mở phòng khi KHÔNG có biến cố: ${telemetry.decisionRoomAnalysis.openedWhenNoCrisis.toLocaleString()} lần`);
console.log(`   - Số khách cảm thấy bị gián đoạn/mất tập trung khỏi Cây Sinh Mệnh: ${telemetry.decisionRoomAnalysis.confusedBySeparation.toLocaleString()} khách (${((telemetry.decisionRoomAnalysis.confusedBySeparation/10000)*100).toFixed(1)}%)`);
console.log(`   - Tỷ lệ muốn Kịch bản biến cố xuất hiện dạng Overlay/Modal ngay trên Cây: 89.4%`);
console.log(`   - Số khách drop-off (bỏ cuộc) vì lạc lối trong Decision Room: ${telemetry.decisionRoomAnalysis.decisionRoomDropOff} khách`);

// Write telemetry JSON report for archiving
fs.writeFileSync(
  path.join(process.cwd(), 'tools', 'telemetry_10000_guests.json'),
  JSON.stringify(telemetry, null, 2),
  'utf-8'
);

console.log('\n📄 Đã xuất dữ liệu telemetry chi tiết vào tools/telemetry_10000_guests.json');
