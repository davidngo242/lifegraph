import { getRandom } from '../engine/rng.js';
import express from 'express';
import {
  getLatestCharacter,
  getSessionData,
  updateNpc,
  updateCharacter,
  getAssets,
  updateAsset,
  addAsset,
  deleteAsset,
  getRelationships,
  addRelationship,
  updateRelationship,
  getNpcs,
  addNpc,
  cacheTickEvent,
  startNewRebirthGame,
  resetGame,
  getPlayerAccount,
  updatePlayerAccount,
  addTotalKarma,
  buyKarmaPerk,
  getAncestralLineage,
  addAncestralMemorial,
  getCurrentSessionId
} from '../db/db.js';
import {
  SKILL_TREE,
  initRpgState,
  getLevelInfo,
  awardLifeExp,
  unlockSkill,
  interactNpc
} from '../engine/rpgProgressionEngine.js';
import { processPassivePhase, calculateMaxVitality } from '../engine/tickEngine.js';
import { getCurrentScenarioForCharacter, interactWithHotspot, resolveMindStageChoice, fulfillCommitment, evaluateCommitments, getNextScenarioAge } from '../engine/scenarioEngine.js';
import { recordAndCheckCombo, resetAnnualActions } from '../engine/comboActionEngine.js';
import { executeBreakthroughAction, getBreakthroughForAge } from '../engine/breakthroughEngine.js';
import { evaluateIncomingNpcEvent } from '../engine/incomingSocialEngine.js';
import { compileSystemPrompt } from '../engine/promptCompiler.js';
import { generateDilemma } from '../engine/aiGameMaster.js';
import { getChildhoodMilestones, generateLocalizedName, NAMES_BY_COUNTRY } from '../engine/rebirthEngine.js';
import { generateCharacterVisuals } from '../engine/avatarEngine.js';
import { evaluateNpcLongTermArc } from '../engine/npcEngine.js';
import { checkDelayedDominoFuses, updateEventTagWindow, recordExperiencedScenario } from '../engine/antiLoopEngine.js';
import { evaluateAspirationProgress, assignInitialAspiration, ASPIRATIONS } from '../engine/aspirationEngine.js';
import { getLocalizedMarketAssets, HOUSING_TIERS } from '../engine/assetMarketEngine.js';
import { resolveCustomAction } from '../engine/openTextResolutionEngine.js';
import { getRealWorldSyncData } from '../services/realWorldSyncService.js';
import { getMmoMacroState, recordPlayerAction } from '../services/mmoMacroService.js';
import { generateCulturallyAuthenticName, extractFamilySurname, getCountryBigData } from '../data/countryBigData.js';
import {
  signSessionToken,
  getSecurityAuditLogs,
  sanitizeString,
  logSecurityIncident
} from '../security/securityEngine.js';
import {
  SKILL_DEFINITIONS,
  getExamMinigameType,
  checkGeneticAffinity,
  getTuitionFee
} from '../engine/skillEngine.js';

import crypto from 'node:crypto';
import { sessionMutations } from '../middleware/sessionMutations.js';

const router = express.Router();
router.use(sessionMutations);

// Helper bảo đảm chỉ nhân vật đang còn sống mới được thực hiện hành động
async function getLivingCharacter(res) {
  const character = await getLatestCharacter();
  if (!character) {
    res.status(400).json({ error: "Không tìm thấy nhân vật đang hoạt động. Vui lòng bắt đầu kiếp sống mới!" });
    return null;
  }
  if (character.is_deceased) {
    res.status(409).json({ error: "Kiếp sống này đã kết thúc." });
    return null;
  }
  return character;
}

// GET /api/game/diagnostic
router.get('/diagnostic', async (req, res) => {
  try {
    const character = await getLatestCharacter();
    const account = await getPlayerAccount();
    res.json({
      status: 'online',
      version: 'v6.0-ultimate-narrative',
      security_shield: 'active-hmac-sha256',
      timestamp: new Date().toISOString(),
      connections: {
        database: process.env.DATABASE_URL ? 'PostgreSQL (Connected)' : 'In-Memory Simulation DB (Ready)',
        ai_engine: process.env.GEMINI_API_KEY ? `Gemini API (${process.env.GEMINI_MODEL || 'gemini-2.0-flash'})` : 'Built-in Procedural AI Narrative Engine'
      },
      player_account: {
        total_karma: account.total_karma,
        reincarnation_count: account.reincarnation_count,
        unlocked_perks: account.unlocked_perks
      },
      active_character_id: character?.id || null
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /api/game/auth/handshake - Cấp phát Token có chữ ký Mật mã (Anti-Tampering)
router.post('/auth/handshake', (req, res) => {
  // Mã phiên do server cấp (lớp 3 trong index.js đã xử lý); client chỉ nhận lại token đã ký.
  const sessionId = getCurrentSessionId();
  res.json({
    success: true,
    session_id: sessionId,
    session_token: signSessionToken(sessionId),
    issued_at: new Date().toISOString()
  });
});

// GET /api/game/security/audit - Kiểm tra nhật ký an ninh và phát hiện xâm nhập
router.get('/security/audit', (req, res) => {
  res.json({
    success: true,
    audit_logs: getSecurityAuditLogs()
  });
});

// GET /api/game/account - Layer 1 Meta Progression
router.get('/account', async (req, res) => {
  try {
    const account = await getPlayerAccount();
    res.json({ success: true, account });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch account', message: err.message });
  }
});

// POST /api/game/karma-shop/buy - Purchase Reincarnation Perks
router.post('/karma-shop/buy', async (req, res) => {
  try {
    const { perk_id, cost } = req.body;
    if (!perk_id || !cost) {
      return res.status(400).json({ error: 'Missing perk_id or cost' });
    }
    const result = await buyKarmaPerk(perk_id, cost);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: 'Perk purchase failed', message: err.message });
  }
});

// GET /api/game/state - Current Life & Account Snapshot
router.get('/state', async (req, res) => {
  try {
    let character = await getLatestCharacter();
    const account = await getPlayerAccount();

    if (!character) {
      return res.json({
        character: null,
        player_account: account,
        visuals: null,
        assets: [],
        relationships: [],
        npcs: [],
        dilemma: null,
        can_transhuman: false,
        aspiration: null,
        net_worth: 0
      });
    }

    const assets = await getAssets(character.id);
    const relationships = await getRelationships(character.id);
    const npcs = await getNpcs(character.id);

    const totalAssets = assets.reduce((sum, a) => sum + Number(a.current_value || 0), 0);
    const netWorth = (Number(character.cash) || 0) + totalAssets;

    // Invalidate stale or age-inappropriate dilemmas (e.g. parent passing at age 60+)
    const isStaleDilemma = getSessionData().currentDilemma && (
      (getSessionData().currentDilemma.id === 'ill_parent_passing' && character.age >= 60) ||
      (getSessionData().currentDilemma.min_age && character.age < getSessionData().currentDilemma.min_age) ||
      (getSessionData().currentDilemma.max_age && character.age > getSessionData().currentDilemma.max_age)
    );

    if ((!getSessionData().currentDilemma || isStaleDilemma) && !character.is_deceased) {
      const prompt = compileSystemPrompt(character, assets, relationships);
      getSessionData().currentDilemma = await generateDilemma(prompt, character, assets, relationships);
      await cacheTickEvent(character.id, character.age, getSessionData().currentDilemma);
    }

    const visuals = generateCharacterVisuals(character, assets);

    // Can access Transhumanism surgery?
    const canTranshuman = character.age > 60 && netWorth > 15000000 && !character.is_transhuman;

    initRpgState(character);
    if (!character.life_aspiration) {
      character.life_aspiration = assignInitialAspiration(character);
      await updateCharacter(character.id, { life_aspiration: character.life_aspiration });
    }

    // Tự động chuẩn hóa tên nhân vật nếu không khớp với quốc tịch sinh ra
    const vnNames = NAMES_BY_COUNTRY["Việt Nam"] || [];
    if (character.nationality && character.nationality !== "Việt Nam" && vnNames.includes(character.name)) {
      character.name = generateLocalizedName(character.nationality, null);
      await updateCharacter(character.id, { name: character.name });
    }

    if (!character.current_city) {
      const countryData = getCountryBigData(character.nationality);
      character.current_city = countryData?.cities?.[0] || `${character.nationality} (Trung Tâm)`;

      if (!character.housing) {
        character.housing = {
          tier: (Number(character.cash) || 0) > 50000 ? 3 : 1,
          name: (Number(character.cash) || 0) > 50000 ? "Nhà phố gia đình trung tâm" : "Phòng trọ / Mái ấm bình dân",
          address: `${character.current_city}`,
          status: (Number(character.cash) || 0) > 50000 ? "owned" : "rented"
        };
      }
      await updateCharacter(character.id, { current_city: character.current_city, housing: character.housing });
    }

    // Auto-normalize Occupation, Location & Study Abroad Fellowship
    const flags = character.hidden_flags || [];
    let stateNeedsUpdate = false;
    if (flags.includes('stanford_phd_scholar')) {
      if (character.current_city !== "California (ĐH Stanford, Hoa Kỳ)") {
        character.current_city = "California (ĐH Stanford, Hoa Kỳ)";
        character.housing = { name: "Ký túc xá ĐH Stanford", tier: 2, status: "rented" };
        stateNeedsUpdate = true;
      }
      if (!character.occupation || character.occupation !== "NCS Tiến sĩ (ĐH Stanford)") {
        character.occupation = "NCS Tiến sĩ (ĐH Stanford)";
        stateNeedsUpdate = true;
      }
      // If cash was pushed into artificial negative deficit by the old Trilemma bug, heal it with fellowship stipend
      if (Number(character.cash) < 0) {
        character.cash = 3500;
        stateNeedsUpdate = true;
      }
    } else if (flags.includes('bigtech_lead_eng')) {
      if (character.current_city !== "San Francisco (Silicon Valley, Hoa Kỳ)") {
        character.current_city = "San Francisco (Silicon Valley, Hoa Kỳ)";
        character.housing = { name: "Căn hộ cao cấp San Francisco", tier: 3, status: "rented" };
        stateNeedsUpdate = true;
      }
      if (!character.occupation || character.occupation !== "Kỹ sư AI Big Tech") {
        character.occupation = "Kỹ sư AI Big Tech";
        stateNeedsUpdate = true;
      }
    } else if (flags.includes('local_mentor_spouse')) {
      if (!character.occupation || character.occupation !== "Giảng viên Đại học địa phương") {
        character.occupation = "Giảng viên Đại học địa phương";
        stateNeedsUpdate = true;
      }
    }

    if (!character.occupation) {
      if (character.age < 6) character.occupation = "Ấu nhi gia đình";
      else if (character.age < 12) character.occupation = "Học sinh tiểu học";
      else if (character.age < 18) character.occupation = "Học sinh phổ thông";
      else if (flags.includes('genz_pioneer')) character.occupation = "Khởi nghiệp công nghệ";
      else if (flags.includes('street_smart')) character.occupation = "Lao động tự do";
      else if (flags.includes('heir_of_fortune')) character.occupation = "Thừa kế gia tộc";
      else character.occupation = "Lao động tự do";
      stateNeedsUpdate = true;
    }

    if (stateNeedsUpdate) {
      await updateCharacter(character.id, {
        current_city: character.current_city,
        housing: character.housing,
        occupation: character.occupation,
        cash: character.cash
      });
    }
    const aspiration = evaluateAspirationProgress(character, assets, relationships);

    res.json({
      character,
      player_account: account,
      visuals,
      assets,
      relationships,
      npcs,
      dilemma: getSessionData().currentDilemma,
      net_worth: netWorth,
      can_transhuman: canTranshuman,
      aspiration,
      scenario: getCurrentScenarioForCharacter(character),
      breakthrough_action: getBreakthroughForAge(character.age)
    });
  } catch (err) {
    console.error('Error fetching game state:', err);
    res.status(500).json({ error: 'Failed to fetch game state', message: err.message });
  }
});

// POST /api/game/start - Procedural Rebirth from Age 0
router.post('/start', async (req, res) => {
  try {
    const { karma_perks = {}, lineage_parent_id = null, starter_pack = 'standard', preferred_gender = null, gender = null } = req.body;
    const chosenGender = preferred_gender || gender || karma_perks.preferred_gender || karma_perks.gender;
    if (chosenGender) {
      karma_perks.preferred_gender = chosenGender;
      karma_perks.gender = chosenGender;
    }

    // Enforce Endgame Karma Costs for Adulthood Starter Packs
    const STARTER_PACK_KARMA_COSTS = {
      standard: 0,
      street_hustler: 200,
      genz_startup: 800,
      crazy_rich: 2500
    };
    const packCost = STARTER_PACK_KARMA_COSTS[starter_pack] || 0;
    const currentAccount = await getPlayerAccount();
    if (packCost > 0 && (currentAccount.total_karma || 0) < packCost) {
      return res.status(400).json({
        error: `Bạn cần tối thiểu ${packCost.toLocaleString()} Karma vĩnh cửu từ các kiếp trước để chọn kịch bản này! (Hiện có: ${currentAccount.total_karma || 0} Karma)`
      });
    }

    let lineageParent = null;
    if (lineage_parent_id) {
      const char = await getLatestCharacter();
      if (char && char.id === lineage_parent_id) lineageParent = char;
    }

    const { character, assets, relationships, npcs, player_account } = await startNewRebirthGame(karma_perks, lineageParent);

    // Deduct eternal karma if starter pack was purchased
    if (packCost > 0) {
      await addTotalKarma(-packCost);
      if (player_account) {
        player_account.total_karma = Math.max(0, (player_account.total_karma || 0) - packCost);
      }
    }

    // Apply Contemporary Reality Starter Pack Customization (BẮT ĐẦU TỪ 0 TUỔI)
    if (starter_pack === 'genz_startup') {
      character.age = 0;
      character.cash = 50;
      character.burnout = 0;
      if (!character.skills) character.skills = {};
      if (!character.skills.tech_logic) character.skills.tech_logic = { level: 0, name: "Trí Tuệ & Công Nghệ" };
      character.skills.tech_logic.level = 1;
      const flags = new Set(character.hidden_flags || []);
      flags.add('genz_pioneer');
      flags.add('tech_master_lv1');
      character.hidden_flags = Array.from(flags);
      character.history_log = character.history_log || [];
      character.history_log.push({
        age: 0,
        event: "Kịch bản khởi đầu: Gen Z Tiên Phong",
        choice: "Chào đời với tư duy số nhạy bén, rèn luyện trí tuệ công nghệ ngay từ thuở ấu thơ."
      });
      await updateCharacter(character.id, character);
    } else if (starter_pack === 'crazy_rich') {
      character.age = 0;
      character.cash = 250;
      character.family_endowment = 250000;
      if (!character.skills) character.skills = {};
      if (!character.skills.finance_market) character.skills.finance_market = { level: 0, name: "Tài Chính & Thương Trường" };
      character.skills.finance_market.level = 1;
      const flags = new Set(character.hidden_flags || []);
      flags.add('heir_of_fortune');
      flags.add('finance_master_lv1');
      character.hidden_flags = Array.from(flags);
      character.history_log = character.history_log || [];
      character.history_log.push({
        age: 0,
        event: "Kịch bản khởi đầu: Con Nhà Siêu Giàu",
        choice: "Sinh ra ở vạch đích hào môn với quỹ tín thác $250.000 (sẽ tự động giải ngân khi tròn 18 tuổi)."
      });
      await updateCharacter(character.id, character);
    } else if (starter_pack === 'street_hustler') {
      character.age = 0;
      character.cash = 25;
      character.vitality = 95;
      if (!character.skills) character.skills = {};
      if (!character.skills.resilience_health) character.skills.resilience_health = { level: 0, name: "Sinh Lực & Khắc Kỷ" };
      character.skills.resilience_health.level = 1;
      const flags = new Set(character.hidden_flags || []);
      flags.add('street_smart');
      flags.add('resilience_master_lv1');
      character.hidden_flags = Array.from(flags);
      character.history_log = character.history_log || [];
      character.history_log.push({
        age: 0,
        event: "Kịch bản khởi đầu: Vượt Khó Bàn Tay Trắng",
        choice: "Chào đời trong khu phố lao động nghèo với ý chí thép và thể lực kiên cường."
      });
      await updateCharacter(character.id, character);
    }

    const visuals = generateCharacterVisuals(character, assets);
    const milestones = getChildhoodMilestones(character);

    res.json({
      success: true,
      character,
      player_account,
      visuals,
      childhood_milestones: milestones,
      assets,
      relationships,
      npcs
    });
  } catch (err) {
    console.error('Error starting rebirth game:', err);
    res.status(500).json({ error: 'Rebirth failed', message: err.message });
  }
});

// POST /api/game/childhood-fastforward - Complete childhood choices and advance
router.post('/childhood-fastforward', async (req, res) => {
  try {
    const { milestone_choices = [], target_age = 6 } = req.body;
    let character = await getLatestCharacter();
    let assets = await getAssets(character.id);
    let relationships = await getRelationships(character.id);
    let npcs = await getNpcs(character.id);

    const flagSet = new Set(character.hidden_flags || []);
    const personalitySet = new Set(character.personality_flags || []);
    const history = character.history_log || [];

    for (const choice of milestone_choices) {
      if (choice.effects) {
        if (choice.effects.vitality_delta) character.vitality = Math.min(100, character.vitality + choice.effects.vitality_delta);
        if (choice.effects.burnout_delta) character.burnout = Math.min(100, character.burnout + choice.effects.burnout_delta);
        if (choice.effects.karma_delta) character.karma = Math.min(100, character.karma + choice.effects.karma_delta);
        if (choice.effects.add_flags) choice.effects.add_flags.forEach(f => flagSet.add(f));
        if (choice.effects.add_personality_flag) personalitySet.add(choice.effects.add_personality_flag);
      }
      history.push({
        age: choice.age,
        event: choice.title,
        choice: choice.action_title
      });
    }

    
    if ((!milestone_choices || milestone_choices.length === 0) && (Number(target_age) || 6) <= 6) {
      history.push({
        age: 1,
        event: "Thôi Nôi Bập Bẹ & Đôi Bước Chập Chững",
        choice: "Bập bẹ tiếng gọi mẹ bên bếp lửa ấm; chập chững bám ống quần ba ngã dập môi rồi nín khóc khi được dỗ kẹo."
      });
      history.push({
        age: 3,
        event: "Nhà Trẻ Phố Cũ & Bụi Bặm Tuổi Thơ",
        choice: "Tranh nhau món đồ chơi gỗ cũ với bạn cùng bàn, bị phạt đứng góc lớp rồi làm lành bằng mẩu bánh quy vụn."
      });
      history.push({
        age: 5,
        event: "Rời Lớp Mầm Non & Ngóng Trông Bàn Gỗ",
        choice: "Mẹ dắt tay lội mưa dầm mua cho đôi ủng cao su và cặp sách mới; đêm trước ngày tựu trường thao thức chờ trời sáng."
      });
      character.vitality = Math.min(100, (character.vitality || 80) + 15);
      character.karma = Math.min(100, (character.karma || 100) + 15);
      flagSet.add("cherished_childhood");
    }
    const finalAge = Math.max(6, Math.min(18, Number(target_age) || 6));
    character.age = finalAge;
    character.max_vitality = calculateMaxVitality(finalAge);
    character.hidden_flags = Array.from(flagSet);
    character.personality_flags = Array.from(personalitySet);
    character.history_log = history;

    if (finalAge >= 18) {
      // UNLOCK PERSONAL CASH AT AGE 18!
      character.cash = Number(character.family_endowment || 0);
      character.family_endowment = 0;
      if (!character.occupation || character.occupation === "Trẻ mầm non" || character.occupation === "Học sinh tiểu học") {
        character.occupation = "Lao động tự do";
      }
    } else {
      // Retain family endowment safely until age 18, provide living allowance
      character.cash = Math.max(150, character.household?.annual_allowance || 200);
      if (finalAge >= 6 && finalAge < 12) {
        character.occupation = "Học sinh tiểu học";
      } else if (finalAge >= 12 && finalAge < 16) {
        character.occupation = "Học sinh THCS";
      } else if (finalAge >= 16) {
        character.occupation = "Học sinh THPT";
      }
    }

    await updateCharacter(character.id, character);

    // Generate dilemma matching new age
    const prompt = compileSystemPrompt(character, assets, relationships);
    getSessionData().currentDilemma = await generateDilemma(prompt, character, assets, relationships);
    await cacheTickEvent(character.id, character.age, getSessionData().currentDilemma);

    const visuals = generateCharacterVisuals(character, assets);

    res.json({
      success: true,
      character,
      visuals,
      assets,
      relationships,
      npcs,
      dilemma: getSessionData().currentDilemma,
      scenario: getCurrentScenarioForCharacter(character)
    });
  } catch (err) {
    console.error('Childhood fastforward error:', err);
    res.status(500).json({ error: 'Fastforward failed', message: err.message });
  }
});

// POST /api/game/rebirth - Direct Rebirth Execution & State Synchronization
router.post('/rebirth', async (req, res) => {
  try {
    const { karma_perks = {}, lineage_parent_id = null, character: directChar, preferred_gender = null, gender = null, target_nationality = null, nationality = null } = req.body;
    const chosenGender = preferred_gender || gender || karma_perks.preferred_gender || karma_perks.gender;
    if (chosenGender) {
      karma_perks.preferred_gender = chosenGender;
      karma_perks.gender = chosenGender;
    }
    const chosenNat = target_nationality || nationality || karma_perks.target_nationality || karma_perks.nationality;
    if (chosenNat) {
      karma_perks.target_nationality = chosenNat;
    }
    
    if (directChar) return res.status(400).json({ error: 'Nhân vật phải được tạo và cập nhật bởi máy chủ.' });

    // Otherwise, perform fresh rebirth
    let lineageParent = null;
    if (lineage_parent_id) {
      const char = await getLatestCharacter();
      if (char && char.id === lineage_parent_id) lineageParent = char;
    }

    const { character, assets, relationships, npcs, player_account } = await startNewRebirthGame(karma_perks, lineageParent);
    const visuals = generateCharacterVisuals(character, assets);
    const prompt = compileSystemPrompt(character, assets, relationships);
    getSessionData().currentDilemma = await generateDilemma(prompt, character, assets, relationships);
    await cacheTickEvent(character.id, character.age, getSessionData().currentDilemma);

    res.json({
      success: true,
      character,
      player_account,
      visuals,
      assets,
      relationships,
      npcs,
      dilemma: getSessionData().currentDilemma,
      scenario: getCurrentScenarioForCharacter(character)
    });
  } catch (err) {
    console.error('Direct rebirth error:', err);
    res.status(500).json({ error: 'Rebirth failed', message: err.message });
  }
});

// POST /api/game/rebirth/surrender - Chốt sổ kiếp sống & Chuyển hóa toàn bộ công đức sang Eternal Karma
router.post('/rebirth/surrender', async (req, res) => {
  try {
    const character = await getLatestCharacter();
    if (!character) return res.status(400).json({ error: "Không tìm thấy nhân vật hiện tại" });

    if (character.is_deceased) return res.status(409).json({ error: 'Kiếp sống này đã kết thúc.' });
    const assets = await getAssets(character.id);
    const totalAssetValue = assets.reduce((sum, a) => sum + Number(a.current_value || 0), 0);
    const netWorth = Math.max(0, (Number(character.cash) || 0) + totalAssetValue);

    // Karma computation from life achievement:
    // 1. Age longevity: 2 Karma per year lived
    const ageKarma = Math.round((character.age || 0) * 2);
    // 2. Net worth scale: 1 Karma per $20,000, max 200 Karma
    const wealthKarma = Math.min(200, Math.floor(netWorth / 20000));
    // 3. Mental peace bonus: +25 if burnout < 50
    const peaceKarma = (character.burnout || 0) < 50 ? 25 : 5;
    // 4. Character intrinsic karma bonus: +20% of character.karma
    const residualKarma = Math.round((character.karma || 100) * 0.2);

    const totalHarvested = ageKarma + wealthKarma + peaceKarma + residualKarma;

    // Credit to Eternal Account
    const account = await getPlayerAccount();
    const updatedTotal = (account.total_karma || 0) + totalHarvested;
    await updatePlayerAccount({ total_karma: updatedTotal });

    // Mark current character as retired/ascended
    character.life_settled = true;
    character.is_deceased = true;
    character.death_age = character.age;
    character.death_cause = "Buông bỏ hồng trần, quy hồi hư không chuyển kiếp mới";
    await updateCharacter(character.id, character);

    res.json({
      success: true,
      harvested_karma: totalHarvested,
      new_total_karma: updatedTotal,
      breakdown: {
        age_karma: ageKarma,
        wealth_karma: wealthKarma,
        peace_karma: peaceKarma,
        residual_karma: residualKarma
      },
      character_name: character.name,
      character_age: character.age,
      net_worth: netWorth
    });
  } catch (err) {
    console.error('Surrender rebirth error:', err);
    res.status(500).json({ error: 'Surrender failed', message: err.message });
  }
});

// POST /api/game/rebirth/nirvana - Buông bỏ vòng luân hồi, an nghỉ tại Đại Điện Tiên Hiền & Lưu Gia Phả
router.post('/rebirth/nirvana', async (req, res) => {
  try {
    const character = await getLatestCharacter();
    if (!character || character.nirvana_ascended) return res.status(409).json({ error: 'Kiếp sống này đã được ghi danh.' });
    const account = await getPlayerAccount();
    const assets = await getAssets(character.id);
    const totalAssets = assets.reduce((sum, a) => sum + Number(a.current_value || 0), 0);
    const netWorth = (Number(character.cash) || 0) + totalAssets;

    // Solace grant for weary souls: +150 Eternal Karma
    const solaceKarma = 150;
    const updatedTotal = (account.total_karma || 0) + solaceKarma;
    await updatePlayerAccount({ total_karma: updatedTotal });

    // Inscribe to Ancestral Memorial Hall
    const memorial = await addAncestralMemorial({
      generation: character.generation || 1,
      name: character.name,
      nationality: character.nationality || "Việt Nam",
      age: character.death_age || character.age,
      status: "ascended_nirvana",
      cause_of_passing: "Đắc Đạo Niết Bàn (Ascended to Nirvana)",
      max_net_worth: netWorth,
      cash: Number(character.cash || 0),
      karma: character.karma || 100,
      aspiration_title: character.life_aspiration || "Khai Sáng & Đức Hạnh",
      epitaph_quote: "Thân tựa phù vân nơi trần thế, tâm an tĩnh tại giữa hư không. Vạn duyên dứt sạch, an trụ cõi tịch tịnh muôn thu.",
      blessing: "+150 Nghiệp Lực Vĩnh Cửu & Gia Trì Hộ Mệnh Muôn Đời"
    });

    // Mark current character as ascended to Nirvana
    character.is_deceased = true;
    character.death_cause = "Đắc Đạo Niết Bàn (Ascended to Nirvana)";
    character.nirvana_ascended = true;
    await updateCharacter(character.id, character);

    res.json({
      success: true,
      soul_title: "Đấng Giác Ngộ Tự Tại (Ascended Sovereign)",
      solace_karma: solaceKarma,
      total_karma: updatedTotal,
      memorial,
      redirect_to_home: true,
      message: "Linh hồn bạn đã vượt thoát khỏi Bánh Xe Luân Hồi (Samsara). Danh xưng được vĩnh viễn khắc ghi tại Đại Điện Tiên Hiền & Gia Phả Dòng Họ."
    });
  } catch (err) {
    console.error('Nirvana error:', err);
    res.status(500).json({ error: 'Nirvana failed', message: err.message });
  }
});

// GET /api/game/lineage - Lấy danh sách Đài Tưởng Niệm Gia Phả
router.get('/lineage', async (req, res) => {
  try {
    const account = await getPlayerAccount();
    const lineage = account.ancestral_lineage || [];
    res.json({ success: true, lineage, account });
  } catch (err) {
    console.error('Error fetching lineage:', err);
    res.status(500).json({ error: 'Failed to fetch lineage', message: err.message });
  }
});

// POST /api/game/lineage/incense - Thắp hương tri ân đài tưởng niệm tổ tiên
router.post('/lineage/incense', async (req, res) => {
  try {
    let character = await getLatestCharacter();
    let account = await getPlayerAccount();

    if (character && !character.is_deceased) {
      character.vitality = Math.min(character.max_vitality || 100, (character.vitality || 80) + 10);
      character.burnout = Math.max(0, (character.burnout || 0) - 10);
      character.karma = Math.min(100, (character.karma || 80) + 5);

      const history = character.history_log || [];
      history.push({
        age: character.age,
        event: "Dâng nén tâm hương lên bàn thờ tổ tiên. Tiền nhân hiển linh gia trì phúc lành, thể chất dẻo dai và tâm hồn thanh tịnh (+10 Thể lực, +5 Karma).",
        impact: { vitality: +10, burnout: -10, karma: +5 },
        timestamp: new Date().toISOString()
      });
      character.history_log = history;
      await updateCharacter(character.id, character);
    } else {
      // If no active living character, grant +10 Eternal Karma to player account
      const updatedTotal = (account.total_karma || 0) + 10;
      account = await updatePlayerAccount({ total_karma: updatedTotal });
    }

    res.json({
      success: true,
      character,
      player_account: account,
      message: "Tâm hương lan tỏa cõi huyền vi. Tổ tiên phù hộ dòng họ bình an thịnh vượng!"
    });
  } catch (err) {
    console.error('Error offering incense:', err);
    res.status(500).json({ error: 'Failed to offer incense', message: err.message });
  }
});

// GET /api/game/rpg/state - Get Skill Tree & RPG State
router.get('/rpg/state', async (req, res) => {
  try {
    let character = await getLatestCharacter();
    if (!character) return res.status(404).json({ error: "Chưa có nhân vật" });
    initRpgState(character);
    const levelInfo = getLevelInfo(character.life_level);
    return res.json({
      skill_tree: SKILL_TREE,
      character_rpg: {
        level: character.life_level,
        level_info: levelInfo,
        exp: character.life_exp,
        skill_points: character.skill_points,
        unlocked_skills: character.unlocked_skills,
        social_links: character.social_links
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/game/rpg/unlock-skill - Spend SP to unlock a skill node
router.post('/rpg/unlock-skill', async (req, res) => {
  try {
    const { skill_id } = req.body;
    let character = await getLivingCharacter(res);
    if (!character) return;
    const result = unlockSkill(character, skill_id);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    await updateCharacter(character.id, character);
    return res.json({
      success: true,
      message: result.message,
      character,
      unlocked_skills: character.unlocked_skills,
      skill_points: character.skill_points
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/game/rpg/npc-interact - Interact with an NPC (socialize, gift, request_favor)
router.post('/rpg/npc-interact', async (req, res) => {
  try {
    const { npc_id, action_type } = req.body;
    let character = await getLivingCharacter(res);
    if (!character) return;
    const result = interactNpc(character, npc_id, action_type);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    await updateCharacter(character.id, character);
    return res.json({
      success: true,
      message: result.message,
      character,
      npc: result.npc
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/game/aspiration/upgrade - Nâng trình Khát Vọng Đời Người khi đạt 100%
router.post('/aspiration/upgrade', async (req, res) => {
  try {
    const { new_aspiration_id } = req.body;
    let character = await getLatestCharacter();
    if (!character) return res.status(400).json({ error: "Không tìm thấy nhân vật" });

    const newMeta = ASPIRATIONS.find(a => a.id === new_aspiration_id);
    if (!newMeta) return res.status(400).json({ error: "Khát vọng không hợp lệ" });

    // Grant Aspiration Bounty: +60 Eternal Karma
    const bountyKarma = 60;
    const account = await getPlayerAccount();
    const updatedTotal = (account.total_karma || 0) + bountyKarma;
    await updatePlayerAccount({ total_karma: updatedTotal });

    // Record achievement to History Log
    const history = character.history_log || [];
    history.push({
      age: character.age || 0,
      event: `🌟 Hoàn Thành Khát Vọng & Nâng Trình: ${newMeta.title}`,
      choice: `Nhận +${bountyKarma} Karma Vĩnh Cửu, chính thức theo đuổi mục tiêu: "${newMeta.target_summary}"`
    });

    character.life_aspiration = new_aspiration_id;
    character.history_log = history;
    await updateCharacter(character.id, character);

    const assets = await getAssets(character.id);
    const relationships = await getRelationships(character.id);
    const aspiration = evaluateAspirationProgress(character, assets, relationships);

    res.json({
      success: true,
      message: `Đã nâng trình thành công! Nhận +${bountyKarma} Karma Vĩnh Cửu!`,
      bounty_karma: bountyKarma,
      character,
      aspiration,
      player_account: await getPlayerAccount()
    });
  } catch (err) {
    console.error('Aspiration upgrade error:', err);
    res.status(500).json({ error: 'Upgrade failed', message: err.message });
  }
});

// POST /api/game/rebirth/heir & POST /api/game/continue-child - Vendetta & 30% Tax Lineage Transfer
const handleHeirRebirth = async (req, res) => {
  try {
    const { child_id } = req.body;
    let parent = await getLatestCharacter();
    if (!parent) {
      return res.status(400).json({ error: "Không tìm thấy dữ liệu nhân vật cha mẹ tiền kiếp." });
    }

    if (!parent.is_deceased || parent.heir_transferred) return res.status(409).json({ error: 'Chỉ chuyển giao một kiếp đã kết thúc và chưa có người kế thừa.' });
    let parentAssets = await getAssets(parent.id);
    let parentRelationships = await getRelationships(parent.id);
    let parentNpcs = await getNpcs(parent.id);

    // Find chosen child or first living child
    let childRecord = (parentRelationships || []).find(r => r.id === child_id && r.type === 'child' && r.status !== 'deceased');
    if (!childRecord) {
      childRecord = (parentRelationships || []).find(r => r.type === 'child' && r.status !== 'deceased');
    }

    if (!childRecord || (child_id && childRecord.id !== child_id)) return res.status(400).json({ error: 'Không có người con hợp lệ để kế thừa.' });
    const childName = childRecord?.name || "Hậu Duệ Thừa Kế";
    const childAge = typeof childRecord?.age === 'number' ? childRecord.age : 0;

    // 1. Calculate Inheritance Tax (10% if early_will_established, otherwise 30%)
    const totalAssetValue = parentAssets.reduce((sum, a) => sum + Number(a.current_value || 0), 0);
    const parentNetWorth = Math.max(0, (Number(parent.cash) || 0) + totalAssetValue);
    const hasEarlyWill = Boolean(parent.early_will_established || parent.hidden_flags?.includes('early_will_established'));
    const estateTaxRate = hasEarlyWill ? 0.10 : 0.30;
    const estateTax = Math.round(parentNetWorth * estateTaxRate);
    const inheritedNetWorth = Math.max(0, parentNetWorth - estateTax);
    const inheritedCash = Math.max(0, Math.round(Number(parent.cash ?? 0) * (1 - estateTaxRate)));

    // 2. Vendetta Transfer (Sổ Thù Vặt Dòng Tộc)
    const inheritedNpcs = [];
    let enemiesCount = 0;
    let alliesCount = 0;

    for (const npc of parentNpcs) {
      if (Number(npc.affinity || 0) <= -70) {
        // Enemy becomes family vendetta enemy
        enemiesCount++;
        inheritedNpcs.push({
          id: crypto.randomUUID(),
          name: npc.name,
          role: `Kẻ Thù Truyền Kiếp (${npc.name})`,
          affinity: -85,
          status: "alive",
          memory_notes: `Kẻ thù không đội trời chung từng hãm hại cha mẹ bạn (${parent.name}). Luôn rình rập báo thù dòng họ!`,
          avatar_color: "#ef4444",
          inherited_vendetta: true,
          last_encountered_age: childAge
        });
      } else if (Number(npc.affinity || 0) >= 70) {
        // Benefactor becomes loyal family ally
        alliesCount++;
        inheritedNpcs.push({
          id: crypto.randomUUID(),
          name: npc.name,
          role: `Bằng Hữu Của Cha Mẹ (${npc.name})`,
          affinity: 85,
          status: "alive",
          memory_notes: `Từng gắn bó tri kỷ hoặc chịu ơn sâu nặng từ gia đình bạn (${parent.name}).`,
          avatar_color: "#10b981",
          inherited_ally: true,
          last_encountered_age: childAge
        });
      }
    }

    // Always have a youth companion if no NPCs
    if (inheritedNpcs.length === 0) {
      inheritedNpcs.push({
        id: crypto.randomUUID(),
        name: "Lê Minh",
        role: "Bạn thuở thiếu thời",
        affinity: 75,
        status: "alive",
        memory_notes: "Cùng lớn lên trong những năm tháng dòng họ chuyển giao.",
        avatar_color: "#38bdf8",
        last_encountered_age: childAge
      });
    }

    // 3. Child Character Creation
    const childId = crypto.randomUUID();
    const generation = (parent.generation || 1) + 1;
    const isAdult = childAge >= 18;

    const newCharacter = {
      id: childId,
      name: childName,
      gender: childRecord?.gender || (getRandom() > 0.5 ? "Nam" : "Nữ"),
      nationality: parent.nationality || "Việt Nam",
      country_tier: parent.country_tier || "Tier 2",
      background: `Hậu duệ gia tộc thế hệ ${generation} (Thừa kế từ ${parent.name})`,
      background_type: inheritedNetWorth > 500000 ? "super_rich" : "middle_class",
      age: childAge,
      vitality: 95,
      max_vitality: calculateMaxVitality(childAge),
      // Cash locked in family_endowment until age 18 if minor
      cash: isAdult ? inheritedCash : 0,
      family_endowment: isAdult ? 0 : inheritedCash,
      burnout: 0,
      karma: Math.min(100, Math.round((parent.karma || 50) * 0.7) + 20),
      action_points: 3,
      innate_traits: childRecord?.innate_traits || ["heir_lineage", "resilient_blood"],
      personality_flags: childRecord?.personality_flags || ["pragmatic", "stoic"],
      hidden_flags: [
        "heir_of_dynasty",
        ...(enemiesCount > 0 ? ["inherited_vendetta"] : []),
        ...(alliesCount > 0 ? ["has_family_benefactor"] : [])
      ],
      history_log: [
        {
          age: childAge,
          event: `Chào đời / Thừa kế thế hệ thứ ${generation} của dòng họ ${parent.name}.`,
          choice: hasEarlyWill
            ? `Kế thừa ${inheritedNetWorth.toLocaleString()} với Thuế Thừa Kế ưu đãi 10% nhờ Di Chúc Sớm (${estateTax.toLocaleString()}).`
            : `Kế thừa ${inheritedNetWorth.toLocaleString()} sau khi nộp 30% Thuế Thừa Kế (${estateTax.toLocaleString()}).`
        }
      ],
      generation,
      lineage_parent_id: parent.id,
      timeline_snapshots: [
        {
          age: childAge,
          net_worth: inheritedNetWorth,
          vitality: 95,
          burnout: 0,
          event: `Bắt đầu kế thừa đời thứ ${generation}`
        }
      ],
      is_deceased: false,
      global_indices: parent.global_indices || { economy: 65, social: 65, environment: 65 }
    };

    // 4. Save to Database
    await updateCharacter(newCharacter.id, newCharacter);
    
    // Save inherited NPCs
    for (const npc of inheritedNpcs) {
      await addNpc({ ...npc, character_id: newCharacter.id });
    }

    // Transfer surviving assets with discount
    const childAssets = [];
    for (const asset of parentAssets) {
      const discountedValue = Math.round(Number(asset.current_value || 0) * 0.70);
      const newAsset = {
        id: asset.id,
        character_id: newCharacter.id,
        name: `${asset.name} (Thừa kế đời ${generation})`,
        type: asset.type,
        buy_price: discountedValue,
        current_value: discountedValue,
        annual_cash_flow: Math.round(Number(asset.annual_cash_flow || 0) * 0.70),
        maintenance_cost: Number(asset.maintenance_cost || 0),
        age_acquired: childAge
      };
      await deleteAsset(asset.id);
      await addAsset(newAsset);
      childAssets.push(newAsset);
    }

    // Initial relationships (Late parent honored)
    const childRelationships = [
      {
        id: crypto.randomUUID(),
        character_id: newCharacter.id,
        name: parent.name,
        type: "parent",
        status: "deceased",
        affinity: 95,
        memory_notes: `Cha/Mẹ tiền kiếp, người đặt nền móng gia sản dòng họ.`
      }
    ];
    for (const rel of childRelationships) {
      await addRelationship(rel);
    }

    // 5. Update eternal player account and archive late parent into Memorial
    const account = await getPlayerAccount();
    await updatePlayerAccount({
      reincarnation_count: (account.reincarnation_count || 1) + 1
    });

    await addAncestralMemorial({
      generation: parent.generation || 1,
      name: parent.name,
      nationality: parent.nationality || "Việt Nam",
      age: parent.death_age || parent.age,
      status: "deceased",
      cause_of_passing: parent.death_cause || "Trút hơi thở cuối cùng, truyền thừa cơ đồ gia tộc",
      max_net_worth: parentNetWorth,
      cash: Number(parent.cash || 0),
      karma: parent.karma || 100,
      aspiration_title: parent.life_aspiration || "Gia Đạo Viên Mãn",
      epitaph_quote: parent.epitaph || `Dày công gầy dựng cơ đồ đời ${parent.generation || 1}, trao truyền ngọn lửa cho hậu duệ.`,
      blessing: `Để lại cơ nghiệp ${(inheritedNetWorth).toLocaleString()} và phúc đức tổ tông.`
    });

    // 6. Generate dilemma & visuals
    const visuals = generateCharacterVisuals(newCharacter, childAssets);
    const milestones = childAge < 18 ? getChildhoodMilestones(newCharacter) : null;
    const prompt = compileSystemPrompt(newCharacter, childAssets, childRelationships);
    getSessionData().currentDilemma = await generateDilemma(prompt, newCharacter, childAssets, childRelationships);
    await cacheTickEvent(newCharacter.id, newCharacter.age, getSessionData().currentDilemma);

    res.json({
      success: true,
      character: newCharacter,
      visuals,
      assets: childAssets,
      relationships: childRelationships,
      npcs: inheritedNpcs,
      childhood_milestones: milestones,
      dilemma: getSessionData().currentDilemma,
      scenario: getCurrentScenarioForCharacter(newCharacter),
      player_account: await getPlayerAccount(),
      inheritance_summary: {
        parent_name: parent.name,
        generation,
        estate_tax: estateTax,
        tax_rate: estateTaxRate,
        has_early_will: hasEarlyWill,
        inherited_amount: inheritedNetWorth,
        enemies_count: enemiesCount,
        allies_count: alliesCount
      }
    });
  } catch (err) {
    console.error('Heir rebirth error:', err);
    res.status(500).json({ error: 'Chuyển giao kế thừa thất bại', message: err.message });
  }
};
router.post('/rebirth/heir', handleHeirRebirth);
router.post('/continue-child', handleHeirRebirth);

// POST /api/game/transhumanism - Underground Cybernetic Implant Surgery
router.post('/transhumanism', async (req, res) => {
  try {
    let character = await getLatestCharacter();
    let assets = await getAssets(character.id);
    const totalAssets = assets.reduce((sum, a) => sum + Number(a.current_value || 0), 0);
    const netWorth = (Number(character.cash) || 0) + totalAssets;

    if (character.age <= 60 || netWorth <= 15000000) {
      return res.status(400).json({ error: "Chưa đủ điều kiện: Yêu cầu tuổi > 60 và Net Worth > $15 Triệu USD." });
    }

    const surgeryCost = 8000000;
    if (character.cash < surgeryCost) {
      return res.status(400).json({ error: "Không đủ tiền mặt: Cần tối thiểu $8.000.000 tiền mặt để chi trả đường dây y tế ngầm." });
    }

    character.cash -= surgeryCost;
    const failureRoll = getRandom();

    // 50% fatal rejection risk
    if (failureRoll < 0.50) {
      character.vitality = 0;
      character.is_deceased = true;
      character.death_cause = "Đột tử do sốc phản vệ và đào thải tế bào cấy ghép y tế ngầm";
      character.death_age = character.age;
      await updateCharacter(character.id, character);
      await addTotalKarma(character.karma);

      return res.json({
        success: false,
        is_game_over: true,
        died: true,
        death_cause: character.death_cause,
        death_age: character.death_age,
        character
      });
    }

    // Success! Freeze vitality decay for 10 years!
    character.is_transhuman = true;
    character.transhuman_frozen_until_age = character.age + 10;
    character.max_vitality = 90;
    character.vitality = 90;
    character.burnout = Math.max(0, character.burnout - 30);
    character.hidden_flags = [...(character.hidden_flags || []), "transhuman_cybernetic"];

    await updateCharacter(character.id, character);

    res.json({
      success: true,
      died: false,
      message: "Cấy ghép Y tế ngầm thành công! Toàn bộ quá trình lão hóa sinh học và suy giảm Max Vitality đã được khóa cứng trong 10 năm tới.",
      character
    });
  } catch (err) {
    res.status(500).json({ error: "Transhumanism procedure failed", message: err.message });
  }
});

// GET /api/game/death-recap - 15s Death Video Recap Data
router.get('/death-recap', async (req, res) => {
  try {
    const character = await getLatestCharacter();
    const account = await getPlayerAccount();
    const assets = await getAssets(character.id);

    const totalAssets = assets.reduce((sum, a) => sum + Number(a.current_value || 0), 0);
    const finalNetWorth = (Number(character.cash) || 0) + totalAssets;

    res.json({
      success: true,
      character_name: character.name,
      death_age: character.death_age || character.age,
      death_cause: character.death_cause || "Hết tuổi thọ tự nhiên",
      final_net_worth: finalNetWorth,
      final_karma: character.karma,
      total_account_karma: account.total_karma,
      generation: character.generation || 1,
      personality_flags: character.personality_flags || [],
      innate_traits: character.innate_traits || [],
      timeline_snapshots: character.timeline_snapshots || [],
      history_log: character.history_log || []
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate death recap", message: err.message });
  }
});

// =========================================================================
// STRATEGIC AP ACTION HUB ENDPOINTS
// =========================================================================

// POST /api/game/action/buy-asset
router.post('/action/buy-asset', async (req, res) => {
  try {
    const {
      asset_type,
      type,
      name,
      cost,
      cost_ap,
      ap_cost,
      maintenance,
      maintenance_cost,
      annual_cash_flow,
      cash_flow
    } = req.body;
    let character = await getLivingCharacter(res);
    if (!character) return;

    if ((Number(character.age) || 0) < 18) {
      return res.status(400).json({
        error: `Chưa đủ 18 tuổi (${character.age} tuổi)! Bạn chưa có tư cách pháp nhân để tự ý giao dịch sàn tài sản hay đứng tên sở hữu thương mại.`
      });
    }

    const actualType = sanitizeString(asset_type || type || 'stocks', 50);
    const safeName = sanitizeString(name || 'Tài sản', 100);
    const actualCostAp = Math.max(1, Math.min(4, Math.floor(Number(ap_cost || cost_ap || 1))));
    const rawCost = Math.max(0, Number(cost) || 0);
    const actualMaintenance = Math.max(0, Number(maintenance_cost ?? maintenance ?? 0));
    const actualCashFlow = Math.max(0, Number(annual_cash_flow || cash_flow || 0));

    const financeLevel = character.skills?.finance_market?.level || 0;
    let discountRate = financeLevel === 1 ? 0.10 : financeLevel === 2 ? 0.20 : financeLevel >= 3 ? 0.25 : 0;
    const hasMarketSense = (character.unlocked_skills || []).includes("market_sense_1");
    if (hasMarketSense) {
      discountRate = Math.min(0.40, discountRate + 0.10); // +10% discount from Mắt Thần Định Giá
    }
    const hasNegotiationShark = (character.innate_traits || []).includes("negotiation_shark");
    if (hasNegotiationShark) {
      discountRate = Math.min(0.50, discountRate + 0.15); // +15% discount from Cá Mập Đàm Phán
    }
    const finalCost = Math.round(rawCost * (1 - discountRate));

    if ((character.action_points || 0) < actualCostAp) {
      return res.status(400).json({ error: "Không đủ Điểm Hành Động (AP)!" });
    }
    if ((Number(character.cash) || 0) < finalCost) {
      return res.status(400).json({ error: `Không đủ tiền mặt! Cần $${finalCost.toLocaleString()} (Hiện có $${(Number(character.cash) || 0).toLocaleString()}).` });
    }

    character.action_points -= actualCostAp;
    character.cash -= finalCost;

    // Award Life EXP for strategic investment
    awardLifeExp(character, 80, `Đầu tư tài sản: ${safeName}`);

    const newAsset = await addAsset({
      character_id: character.id,
      type: actualType,
      name: safeName,
      current_value: rawCost, // Keeps intrinsic asset value!
      liquidity_status: actualType === 'stock' || actualType === 'stocks' || actualType === 'gold' ? 'liquid' : 'illiquid',
      maintenance_cost_per_tick: actualMaintenance,
      maintenance_cost: actualMaintenance,
      annual_cash_flow: actualCashFlow
    });

    const skillNote = hasMarketSense ? ' + 10% [Mắt Thần Định Giá]' : '';
    const discountNote = discountRate > 0 ? ` (Được chiết khấu ${(discountRate * 100).toFixed(0)}% nhờ Kỹ Năng Tài Chính${skillNote})` : '';
    const history = character.history_log || [];
    history.push({
      age: character.age,
      event: `Đầu tư mua tài sản: ${name}`,
      choice: `Chi tiêu $${finalCost.toLocaleString()} & ${actualCostAp} AP${discountNote} (Dòng tiền: +$${actualCashFlow.toLocaleString()}/năm)`
    });
    character.history_log = history;

    await updateCharacter(character.id, character);
    const assets = await getAssets(character.id);

    res.json({
      success: true,
      message: `Đầu tư thành công tài sản: ${name}! (Dòng tiền ròng: +$${actualCashFlow.toLocaleString()}/năm)`,
      character,
      assets,
      new_asset: newAsset
    });
  } catch (err) {
    res.status(500).json({ error: "Thao tác mua tài sản thất bại", message: err.message });
  }
});

// =========================================================================
// LINH THÚ CÁC (PET SANCTUARY & SHOP / THUẬN HÓA THÚ CƯNG 3D)
// =========================================================================
const PET_CATALOG = [
  {
    id: 'puppy',
    name: 'Cún Cỏ Trung Nghĩa',
    title: 'Lucky Pup',
    rarity: 'common',
    rarityLabel: 'Thường',
    cost: 500,
    costKarma: 0,
    icon: '🐶',
    buff: 'Giảm 5% Stress mỗi năm, +3 Tình cảm',
    description: 'Chú cún cỏ trung thành quấn quýt dưới chân bục, xua tan căng thẳng và mang lại niềm vui giản dị.',
    animationType: 'grounded'
  },
  {
    id: 'cat',
    name: 'Mèo Thần Tài',
    title: 'Mochi Maneki-Neko',
    rarity: 'rare',
    rarityLabel: 'Hiếm',
    cost: 5000,
    costKarma: 0,
    icon: '🐱',
    buff: '+3% Lợi nhuận đầu tư & lương hàng năm',
    description: 'Bé mèo vẫy tay chiêu tài ôm đồng tiền vàng, thu hút vượng khí và may mắn tài lộc cho gia chủ.',
    animationType: 'grounded'
  },
  {
    id: 'fox',
    name: 'Hồ Ly Cửu Vĩ',
    title: 'Kitsune Spirit',
    rarity: 'epic',
    rarityLabel: 'Quý Hiếm',
    cost: 50000,
    costKarma: 20,
    icon: '🦊',
    buff: '+15 Sức hút xã hội (Charm), tăng cơ hội gặp Quý Nhân',
    description: 'Linh thú cáo chín đuôi huyền ảo tỏa vầng sáng hộ mệnh, kết nối nhân duyên đại phú đại quý.',
    animationType: 'grounded'
  },
  {
    id: 'dragon',
    name: 'Ấu Long Luân Hồi',
    title: 'Celestial Dragon',
    rarity: 'mythic',
    rarityLabel: 'Thần Thoại',
    cost: 500000,
    costKarma: 200,
    icon: '🐉',
    buff: '+20% Thọ mệnh, +10 Karma vĩnh cửu mỗi năm',
    description: 'Thần thú rồng huyền thoại bay lượn uốn lượn 3D quanh người với hào quang sao lấp lánh.',
    animationType: 'flying_orbital'
  }
];

// GET /api/game/pets/catalog - Lấy danh mục thú cưng & trạng thái sở hữu
router.get('/pets/catalog', async (req, res) => {
  try {
    const character = await getLatestCharacter();
    res.json({
      success: true,
      catalog: PET_CATALOG,
      equipped_pet: character?.equipped_pet || 'none',
      owned_pets: character?.owned_pets || []
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pet catalog', message: err.message });
  }
});

// POST /api/game/pets/buy - Mua / Nhận nuôi thú cưng
router.post('/pets/buy', async (req, res) => {
  try {
    const { petId, paymentMethod = 'cash' } = req.body;
    const character = await getLatestCharacter();
    if (!character || character.is_deceased) {
      return res.status(400).json({ error: 'Không tìm thấy kiếp sống đang hoạt động.' });
    }

    const pet = PET_CATALOG.find(p => p.id === petId);
    if (!pet) {
      return res.status(404).json({ error: 'Loài linh thú không tồn tại trong danh mục.' });
    }

    character.owned_pets = character.owned_pets || [];
    if (character.owned_pets.includes(petId)) {
      character.equipped_pet = petId;
      await updateCharacter(character.id, character);
      return res.json({
        success: true,
        message: `Đã xuất trận đồng hành cùng ${pet.name}!`,
        character,
        equipped_pet: petId,
        owned_pets: character.owned_pets
      });
    }

    if (paymentMethod === 'karma' && pet.costKarma > 0) {
      const playerAccount = await getPlayerAccount();
      if (!playerAccount || (playerAccount.eternal_karma || 0) < pet.costKarma) {
        return res.status(400).json({ error: `Không đủ Karma linh hồn (cần ${pet.costKarma} Karma).` });
      }
      playerAccount.eternal_karma -= pet.costKarma;
      await updatePlayerAccount(playerAccount);
    } else {
      if ((character.cash || 0) < pet.cost) {
        return res.status(400).json({ error: `Không đủ tiền mặt để nhận nuôi ${pet.name} (cần $${pet.cost.toLocaleString()}).` });
      }
      character.cash -= pet.cost;
    }

    character.owned_pets.push(petId);
    character.equipped_pet = petId;

    const history = character.history_log || [];
    history.push({
      age: character.age,
      event: `Thuần hóa linh thú: ${pet.name}`,
      choice: `Chi tiêu ${paymentMethod === 'karma' ? `${pet.costKarma} Karma` : `$${pet.cost.toLocaleString()}`} để đón ${pet.name} về đồng hành (${pet.buff})`
    });
    character.history_log = history;

    await updateCharacter(character.id, character);

    res.json({
      success: true,
      message: `Chúc mừng bạn đã đón ${pet.name} về đồng hành thành công!`,
      character,
      equipped_pet: petId,
      owned_pets: character.owned_pets
    });
  } catch (err) {
    res.status(500).json({ error: 'Thao tác mua linh thú thất bại', message: err.message });
  }
});

// POST /api/game/pets/equip - Xuất trận hoặc Thu hồi thú cưng
router.post('/pets/equip', async (req, res) => {
  try {
    const { petId } = req.body;
    const character = await getLatestCharacter();
    if (!character || character.is_deceased) {
      return res.status(400).json({ error: 'Không tìm thấy kiếp sống đang hoạt động.' });
    }

    character.owned_pets = character.owned_pets || [];

    if (petId === 'none') {
      character.equipped_pet = 'none';
      await updateCharacter(character.id, character);
      return res.json({
        success: true,
        message: 'Linh thú đã trở về chuồng nghỉ ngơi.',
        character,
        equipped_pet: 'none',
        owned_pets: character.owned_pets
      });
    }

    if (!character.owned_pets.includes(petId)) {
      return res.status(400).json({ error: 'Bạn chưa sở hữu linh thú này. Hãy nhận nuôi trước!' });
    }

    character.equipped_pet = petId;
    await updateCharacter(character.id, character);

    const pet = PET_CATALOG.find(p => p.id === petId);
    res.json({
      success: true,
      message: `Đã xuất trận đồng hành cùng ${pet?.name || 'linh thú'}!`,
      character,
      equipped_pet: petId,
      owned_pets: character.owned_pets
    });
  } catch (err) {
    res.status(500).json({ error: 'Thao tác trang bị linh thú thất bại', message: err.message });
  }
});

// GET /api/game/market/assets - Lấy danh mục BigData tài sản theo quốc gia & thành phố
router.get('/market/assets', async (req, res) => {
  try {
    const character = await getLatestCharacter();
    const assets = getLocalizedMarketAssets(character?.nationality, character?.current_city);
    res.json({
      success: true,
      nationality: character?.nationality || "Việt Nam",
      current_city: character?.current_city || "Hà Nội",
      housing: character?.housing || HOUSING_TIERS[0],
      housing_tiers: HOUSING_TIERS,
      market_assets: assets
    });
  } catch (err) {
    console.error('Error fetching market assets:', err);
    res.status(500).json({ error: 'Failed to fetch market assets', message: err.message });
  }
});

// POST /api/game/action/upgrade-housing - Nâng cấp không gian cư trú thực tế
router.post('/action/upgrade-housing', async (req, res) => {
  try {
    const { housing_id, target_tier } = req.body;
    let character = await getLivingCharacter(res);
    if (!character) return;

    if ((Number(character.age) || 0) < 18) {
      return res.status(400).json({
        error: `Chưa đủ 18 tuổi (${character.age} tuổi)! Nơi cư trú của bạn hiện do cha mẹ / người giám hộ quyết định.`
      });
    }

    const targetHousing = HOUSING_TIERS.find(h => h.id === housing_id || h.tier === target_tier);
    if (!targetHousing) return res.status(400).json({ error: "Loại nhà ở không hợp lệ." });

    const buyPrice = targetHousing.buy_price || 0;
    if (buyPrice > 0) {
      if ((Number(character.cash) || 0) < buyPrice) {
        return res.status(400).json({ error: `Không đủ tiền mặt để mua nhà mới! (Cần $${buyPrice.toLocaleString()})` });
      }
      character.cash -= buyPrice;
    }

    character.housing = {
      ...targetHousing,
      address: `${targetHousing.name}, ${character.current_city || character.nationality}`,
      status: buyPrice > 0 ? "owned" : "rented"
    };

    character.burnout = Math.max(0, (character.burnout || 0) - (targetHousing.happiness_bonus || 10));

    const history = character.history_log || [];
    history.push({
      age: character.age,
      event: `Nâng cấp không gian cư trú: Dọn về ${targetHousing.name} tại ${character.current_city || character.nationality}.`,
      choice: buyPrice > 0 ? `Chi $${buyPrice.toLocaleString()} sở hữu tư gia mới` : `Thuê nhà mới`
    });
    character.history_log = history;

    await updateCharacter(character.id, character);

    res.json({
      success: true,
      character,
      housing: character.housing,
      message: `Đã dọn về nơi ở mới: ${targetHousing.name}!`
    });
  } catch (err) {
    console.error('Error upgrading housing:', err);
    res.status(500).json({ error: 'Housing upgrade failed', message: err.message });
  }
});

// POST /api/game/action/childhood - Tác vụ tuổi thơ & thiếu niên (0 - 17 tuổi)
router.post(['/action/childhood', '/child-action'], async (req, res) => {
  try {
    const { action_id } = req.body;
    let character = await getLivingCharacter(res);
    if (!character) return;
    const history = character.history_log || [];
    const flags = new Set(character.hidden_flags || []);

    if ((character.action_points || 0) < 1) {
      return res.status(400).json({ error: "Không đủ Điểm Hành Động (AP)!" });
    }

    character.action_points -= 1;
    let feedback = "";

    // 0-5 tuổi
    if (action_id === 'eat_grow') {
      character.vitality = Math.min(character.max_vitality || 100, (character.vitality || 80) + 15);
      flags.add("well_nourished");
      feedback = "Ăn dặm ngon miệng & ngủ đủ giấc! Cơ thể khỏe khoắn, tăng đề kháng (+15 Sức khỏe).";
    } else if (action_id === 'sunbath') {
      character.vitality = Math.min(character.max_vitality || 100, (character.vitality || 80) + 5);
      flags.add("sunbath_immunity");
      feedback = "Tắm nắng sớm tiếp nhận vitamin D tự nhiên! Da dẻ hồng hào, tăng sức đề kháng (+5 Sức khỏe).";
    } else if (action_id === 'toy_brain') {
      character.karma = Math.min(100, (character.karma || 100) + 10);
      flags.add("early_curiosity");
      feedback = "Khám phá đồ chơi xếp hình trí tuệ! Kích thích tư duy sơ khai (+10 Karma).";
    } else if (action_id === 'toddler_walk') {
      character.max_vitality = Math.min(100, (character.max_vitality || 90) + 3);
      flags.add("toddler_mobility");
      feedback = "Tập chập chững bước đi và bập bẹ gọi cha mẹ! Nhận được tràng pháo tay cổ vũ (+3 Max HP).";
    } else if (action_id === 'cuddle_parents') {
      character.burnout = 0;
      character.karma = Math.min(100, (character.karma || 100) + 15);
      feedback = "Làm nũng trong vòng tay ấm áp của mẹ cha! Cảm nhận tình thương vô điều kiện (+15 Karma).";
    } else if (action_id === 'thoi_noi_book') {
      character.karma = Math.min(100, (character.karma || 100) + 15);
      flags.add("first_birthday_chosen");
      flags.add("thoi_noi_hoc_thuat");
      feedback = "Lễ Thôi Nôi 1 Tuổi: Bàn tay bé xíu vươn ra bốc Sách Bút & Thước Kẻ! Cả họ tấm tắc khen ngợi mầm non đỗ đạt, công danh sáng lạn (+15 Karma tri thức).";
    } else if (action_id === 'thoi_noi_coin') {
      const luckyMoney = 100;
      character.cash = (Number(character.cash) || 0) + luckyMoney;
      flags.add("first_birthday_chosen");
      flags.add("thoi_noi_kinh_doanh");
      feedback = `Lễ Thôi Nôi 1 Tuổi: Em bé nhoẻn miệng cười bốc xấp Tiền Vàng & Bàn Tính! Cha mẹ mừng rỡ, họ hàng lì xì thêm +$${luckyMoney} vào quỹ bỉm sữa (+Trực giác thương trường).`;
    } else if (action_id === 'thoi_noi_toy') {
      character.vitality = Math.min(character.max_vitality || 100, (character.vitality || 80) + 15);
      character.max_vitality = Math.min(100, (character.max_vitality || 90) + 3);
      flags.add("first_birthday_chosen");
      flags.add("thoi_noi_the_thao");
      feedback = "Lễ Thôi Nôi 1 Tuổi: Em bé nắm chặt Quả Bóng & Đồ Chơi! Thể chất tràn đầy sinh lực và óc sáng tạo linh hoạt (+15 Thể chất, +3 Max HP).";
    } 
    // 6-12 tuổi
    else if (action_id === 'school_study') {
      character.karma = Math.min(100, (character.karma || 100) + 12);
      flags.add("diligent_pupil");
      feedback = "Chăm ngoan nghe giảng ở lớp! Thầy cô khen ngợi, nhận cờ 'Học Sinh Chăm Ngoan' (+12 Karma).";
    } else if (action_id === 'help_chores') {
      const pocketMoney = 25;
      character.cash = (Number(character.cash) || 0) + pocketMoney;
      character.karma = Math.min(100, (character.karma || 100) + 8);
      flags.add("family_helper");
      feedback = `Quét nhà, rửa bát phụ cha mẹ! Được thưởng +$${pocketMoney} tiền tiêu vặt bỏ heo đất (+8 Karma).`;
    } else if (action_id === 'play_friends') {
      character.vitality = Math.min(character.max_vitality || 100, (character.vitality || 80) + 10);
      character.burnout = Math.max(0, (character.burnout || 0) - 20);
      feedback = "Chơi đuổi bắt và đá bóng rộn rã cùng bạn bè trang lứa! Tinh thần sảng khoái (-20 Stress).";
    } else if (action_id === 'explore_nature') {
      character.vitality = Math.min(character.max_vitality || 100, (character.vitality || 80) + 8);
      character.karma = Math.min(100, (character.karma || 100) + 8);
      flags.add("nature_lover");
      feedback = "Khám phá thế giới tự nhiên, bắt bướm trồng cây! Nuôi dưỡng tình yêu sinh thái (+8 Sinh lực, +8 Karma).";
    }
    // 13-17 tuổi (Thiếu niên)
    else if (action_id === 'teen_part_time') {
      const pocketMoney = 100;
      character.cash = (Number(character.cash) || 0) + pocketMoney;
      character.karma = Math.min(100, (character.karma || 100) + 5);
      flags.add("teen_work_ethic");
      feedback = `Làm thêm phụ việc quán xá ngoài giờ học! Kiếm được +$${pocketMoney} tiền túi, học cách tự lập dòng tiền (+5 Karma).`;
    } else if (action_id === 'teen_sports') {
      character.vitality = Math.min(character.max_vitality || 100, (character.vitality || 80) + 12);
      character.burnout = Math.max(0, (character.burnout || 0) - 20);
      flags.add("athletic_youth");
      feedback = "Tập luyện thể thao tuổi dậy thì! Chiều cao và thể lực phát triển vượt trội (+12 Thể chất, -20 Stress).";
    } else if (action_id === 'teen_online_sales') {
      const profit = 150;
      character.cash = (Number(character.cash) || 0) + profit;
      flags.add("young_entrepreneur");
      feedback = `Tập tành kinh doanh phụ kiện online! Thu về +$${profit} tiền vốn tích lũy, trui rèn kỹ năng thương trường sớm.`;
    }
    // Hành động bẩm sinh / thần đồng (Prodigy actions)
    else if (action_id === 'prodigy_trade') {
      const earnings = 60;
      character.cash = (Number(character.cash) || 0) + earnings;
      flags.add("young_entrepreneur");
      feedback = `Trổ tài buôn bán truyện tranh cũ và đồ chơi! Thu về +$${earnings} tiền túi, nhận cờ 'Thương Nhân Nhí'.`;
    } else if (action_id === 'prodigy_math_infant') {
      character.karma = Math.min(100, (character.karma || 100) + 10);
      flags.add("early_logic");
      feedback = "Nhận biết các khối hình và màu sắc chuẩn xác từ khi còn trong nôi! Não bộ phản xạ vượt trội (+10 Karma).";
    } else if (action_id === 'prodigy_math') {
      character.karma = Math.min(100, (character.karma || 100) + 18);
      flags.add("math_prodigy");
      feedback = "Giải đề thi cờ thế và toán học nâng cao! Nhận học bổng khen thưởng tuổi thơ (+18 Karma).";
    } else if (action_id === 'prodigy_art_infant') {
      character.burnout = 0;
      character.karma = Math.min(100, (character.karma || 100) + 10);
      flags.add("early_art");
      feedback = "Nghịch màu bằng ngón tay bé xíu, reo vui trước những mảng màu rực rỡ! Kích hoạt cảm thụ nghệ thuật sớm (+10 Karma).";
    } else if (action_id === 'prodigy_art') {
      character.burnout = 0;
      character.karma = Math.min(100, (character.karma || 100) + 15);
      flags.add("artistic_child");
      feedback = "Sáng tác bức tranh rực rỡ sắc màu cuộc sống! Được thầy cô đem đi triển lãm tranh thiếu nhi (+15 Karma).";
    } else {
      character.vitality = Math.min(character.max_vitality || 100, (character.vitality || 80) + 5);
      feedback = "Một ngày ấu thơ trôi qua êm đềm dưới mái ấm gia đình.";
    }

    history.push({
      age: character.age,
      event: "Hành động tuổi thơ",
      choice: feedback
    });
    character.history_log = history;
    character.hidden_flags = Array.from(flags);

    await updateCharacter(character.id, character);

    res.json({
      success: true,
      message: feedback,
      character
    });
  } catch (err) {
    res.status(500).json({ error: "Hành động tuổi thơ thất bại", message: err.message });
  }
});

// POST /api/game/action/custom-resolve - Open-Text AI Resolution Engine
// POST /api/game/action/annual-focus - Chiến lược 1 click trọng tâm năm (giảm tải choice fatigue)
router.post('/action/annual-focus', async (req, res) => {
  try {
    const { focus_type } = req.body;
    let character = await getLivingCharacter(res);
    if (!character) return;
    if (!character) return res.status(404).json({ error: "Không tìm thấy nhân vật!" });

    const apAvailable = character.action_points || 0;
    const reqAP = Math.min(3, Math.max(1, apAvailable));
    if (apAvailable < 1) {
      return res.status(400).json({ error: "Đã dùng hết Điểm Hành Động (AP) năm nay!" });
    }

    character.action_points = Math.max(0, apAvailable - reqAP);
    const history = character.history_log || [];
    const flags = new Set(character.hidden_flags || []);
    const isAdult = (character.age || 0) >= 18;
    const isTeen = (character.age || 0) >= 13 && (character.age || 0) < 18;
    let message = "";

    if (focus_type === 'hustle') {
      if (isAdult) {
        const bonusCash = Math.round(getRandom() * 3500 + 3500);
        character.cash = (Number(character.cash) || 0) + bonusCash;
        character.burnout = Math.min(100, (character.burnout || 0) + 25);
        message = `Cả năm dốc toàn lực cày cuốc! Thu về +$${bonusCash.toLocaleString()} USD thặng dư, tăng 25 Căng thẳng.`;
      } else if (isTeen) {
        const pocketMoney = 250;
        character.cash = (Number(character.cash) || 0) + pocketMoney;
        character.burnout = Math.min(100, (character.burnout || 0) + 15);
        message = `Chăm chỉ phụ việc & làm thêm suốt cả năm! Tích lũy được +$${pocketMoney} tiền túi, rèn tính tự lập.`;
      } else {
        character.vitality = Math.min(character.max_vitality || 100, (character.vitality || 80) + 15);
        character.burnout = Math.max(0, (character.burnout || 0) - 20);
        message = "Một năm năng động thể thao và chạy nhảy cùng bè bạn! Thể lực tăng vọt (+15 Sinh lực, -20 Stress).";
      }
    } else if (focus_type === 'study') {
      if (isAdult && character.cash >= 800) character.cash -= 800;
      character.karma = Math.min(100, (character.karma || 100) + 22);
      character.burnout = Math.min(100, (character.burnout || 0) + 10);
      message = isAdult
        ? "Đầu tư cả năm trau dồi tri thức & thi chứng chỉ chuyên môn (-$800, +22 Karma tri thức)!"
        : "Chuyên tâm đèn sách suốt cả năm học! Đạt thành tích xuất sắc đứng đầu lớp (+22 Karma học vấn).";
    } else if (focus_type === 'wellness') {
      const healVitality = Math.min(character.max_vitality || 100, (character.vitality || 80) + 25);
      character.vitality = healVitality;
      character.burnout = Math.max(0, (character.burnout || 0) - 45);
      if (isAdult && character.cash >= 600) character.cash -= 600;
      message = isAdult
        ? "Dành trọn năm dưỡng sinh, nghỉ ngơi trị liệu và gắn kết mái ấm (-$600, hồi phục +25 Sinh lực, giảm 45 Stress)!"
        : "Một năm bình yên bên gia đình và bạn bè, thanh lọc mọi áp lực trường lớp (+25 Sinh lực, giảm 45 Stress).";
    } else {
      character.vitality = Math.min(character.max_vitality || 100, (character.vitality || 80) + 10);
      message = "Một năm trôi qua bình dị và thuận hòa.";
    }

    awardLifeExp(character, 80, `Trọng tâm năm: ${focus_type}`);

    history.push({
      age: character.age,
      event: `Trọng tâm năm: ${focus_type === 'hustle' ? 'Cày Cuốc Hết Mình' : focus_type === 'study' ? 'Đèn Sách Tri Thức' : 'Dưỡng Sinh Chữa Lành'}`,
      choice: message
    });
    character.history_log = history;
    character.hidden_flags = Array.from(flags);

    await updateCharacter(character.id, character);

    res.json({
      success: true,
      message,
      character
    });
  } catch (err) {
    res.status(500).json({ error: "Thao tác trọng tâm năm thất bại", message: err.message });
  }
});

router.post('/action/custom-resolve', async (req, res) => {
  try {
    const { user_action_text, cost_ap = 1 } = req.body;
    let character = await getLivingCharacter(res);
    if (!character) return;
    if (!character) return res.status(404).json({ error: "Không tìm thấy nhân vật!" });

    if ((character.action_points || 0) < cost_ap) {
      return res.status(400).json({ error: "Không đủ Điểm Hành Động (AP) để thực hiện quyết định này!" });
    }

    const resolution = await resolveCustomAction({
      character,
      dilemma: getSessionData().currentDilemma,
      userActionText: user_action_text
    });

    // Deduct AP
    character.action_points = Math.max(0, (character.action_points || 0) - cost_ap);

    // Apply stat deltas
    if (resolution.effects) {
      if (resolution.effects.cash_delta) {
        character.cash = (Number(character.cash) || 0) + resolution.effects.cash_delta;
      }
      if (resolution.effects.vitality_delta) {
        character.vitality = Math.max(0, Math.min(character.max_vitality || 100, (character.vitality || 0) + resolution.effects.vitality_delta));
      }
      if (resolution.effects.burnout_delta) {
        character.burnout = Math.max(0, Math.min(100, (character.burnout || 0) + resolution.effects.burnout_delta));
      }
      if (resolution.effects.karma_delta) {
        character.karma = Math.max(0, Math.min(100, (character.karma || 0) + resolution.effects.karma_delta));
      }
    }

    // Apply flags
    const flags = new Set(character.hidden_flags || []);
    if (resolution.applied_flag) flags.add(resolution.applied_flag);
    character.hidden_flags = Array.from(flags);

    // Record in history log
    const history = character.history_log || [];
    history.push({
      age: character.age,
      event: resolution.resolution_title,
      choice: `[Tự Do]: "${(user_action_text || "").slice(0, 50)}..."`,
      resolution: resolution.narrative
    });
    character.history_log = history;

    await updateCharacter(character.id, character);
    recordPlayerAction("custom_resolve", character);

    const playerAccount = await getPlayerAccount();

    res.json({
      success: true,
      resolution,
      character,
      player_account: playerAccount
    });
  } catch (err) {
    console.error("Error in custom-resolve:", err);
    res.status(500).json({ error: "Phán xử hành động thất bại", message: err.message });
  }
});

// GET /api/game/macro/realworld - Real-World Weather & Market Snapshot
router.get('/macro/realworld', async (req, res) => {
  try {
    const character = await getLatestCharacter();
    const city = req.query.city || (character ? character.current_city : "Hà Nội");
    const country = req.query.country || (character ? character.nationality : "Việt Nam");
    const data = await getRealWorldSyncData(city, country);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: "Lỗi đồng bộ thế giới thực", message: err.message });
  }
});

// GET /api/game/macro/mmo-state - MMO Global Servers & News Ticker
router.get('/macro/mmo-state', async (req, res) => {
  try {
    const character = await getLatestCharacter();
    const tier = character ? character.country_tier : "T2";
    const data = getMmoMacroState(tier);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: "Lỗi tải dữ liệu MMO", message: err.message });
  }
});

// POST /api/game/action/sell-asset
router.post('/action/sell-asset', async (req, res) => {
  try {
    const { asset_id, cost_ap = 1 } = req.body;
    const safeAssetId = sanitizeString(asset_id, 64);
    const validCostAp = Math.max(1, Math.min(4, Math.floor(Number(cost_ap || 1))));

    let character = await getLivingCharacter(res);
    if (!character) return;
    let assets = await getAssets(character.id);

    if ((character.action_points || 0) < validCostAp) {
      return res.status(400).json({ error: "Không đủ Điểm Hành Động (AP)!" });
    }

    const targetAsset = assets.find(a => a.id === safeAssetId);
    if (!targetAsset) {
      return res.status(404).json({ error: "Không tìm thấy tài sản trong danh mục!" });
    }

    const saleAmount = Math.max(0, Number(targetAsset.current_value) || 0);
    character.action_points -= validCostAp;
    character.cash = (Number(character.cash) || 0) + saleAmount;

    await deleteAsset(safeAssetId);

    const history = character.history_log || [];
    history.push({
      age: character.age,
      event: `Thanh lý tài sản: ${targetAsset.name}`,
      choice: `Thu về $${saleAmount.toLocaleString()} tiền mặt (Tốn ${validCostAp} AP)`
    });
    character.history_log = history;

    await updateCharacter(character.id, character);
    const updatedAssets = await getAssets(character.id);

    res.json({
      success: true,
      message: `Đã bán thanh lý ${targetAsset.name}, thu về $${saleAmount.toLocaleString()}!`,
      character,
      assets: updatedAssets
    });
  } catch (err) {
    res.status(500).json({ error: "Thanh lý tài sản thất bại", message: err.message });
  }
});

// POST /api/game/action/family
router.post('/action/family', async (req, res) => {
  try {
    const { action_type } = req.body;
    let character = await getLivingCharacter(res);
    if (!character) return;
    let relationships = await getRelationships(character.id);
    const history = character.history_log || [];

    if (action_type === 'date') {
      if ((Number(character.age) || 0) < 16) {
        return res.status(400).json({
          error: `Chưa đủ tuổi hẹn hò (${character.age} tuổi)! Tình yêu đôi lứa chỉ mở khóa từ năm 16 tuổi.`
        });
      }
      const costAP = 1;
      const costCash = 1500;
      if (character.action_points < costAP || character.cash < costCash) {
        return res.status(400).json({ error: "Cần tối thiểu 1 AP và $1.500 để hẹn hò lãng mạn!" });
      }

      character.action_points -= costAP;
      character.cash -= costCash;
      character.burnout = Math.max(0, character.burnout - 15);

      let partner = relationships.find(r => r.type === 'partner' || r.type === 'spouse');
      if (partner) {
        partner.affection_level = Math.min(100, partner.affection_level + 20);
        await updateRelationship(partner.id, { affection_level: partner.affection_level });
      } else {
        const partnerGender = character.gender === 'female' ? 'male' : 'female';
        const name = generateCulturallyAuthenticName(character.nationality, 'partner', partnerGender);
        const partnerAge = Math.max(16, (character.age || 18) + (Math.floor(getRandom() * 3) - 1));
        partner = await addRelationship({
          character_id: character.id,
          type: 'partner',
          name,
          age: partnerAge,
          status: 'alive',
          affection_level: 75,
          monthly_cost: 400
        });
      }

      history.push({
        age: character.age,
        event: `Hẹn hò vun đắp tình cảm cùng ${partner.name}`,
        choice: `Chi $${costCash.toLocaleString()} & ${costAP} AP`
      });
      character.history_log = history;
      await updateCharacter(character.id, character);
      const updatedRels = await getRelationships(character.id);

      return res.json({
        success: true,
        message: `Buổi hẹn hò lãng mạn cùng ${partner.name} thành công rực rỡ! (+20 Thiện cảm, -15 Burnout)`,
        character,
        relationships: updatedRels
      });
    }

    if (action_type === 'marry') {
      if ((Number(character.age) || 0) < 18) {
        return res.status(400).json({
          error: `Chưa đủ 18 tuổi (${character.age} tuổi)! Pháp luật quy định độ tuổi kết hôn hợp pháp là từ đủ 18 tuổi trở lên.`
        });
      }
      const costAP = 2;
      const costCash = 10000;
      if (character.action_points < costAP || character.cash < costCash) {
        return res.status(400).json({ error: "Cần tối thiểu 2 AP và $10.000 để tổ chức lễ cưới!" });
      }

      let partner = relationships.find(r => r.type === 'partner');
      if (!partner) {
        // If no partner yet, instantly find and marry with culturally authentic identity
        const partnerGender = character.gender === 'female' ? 'male' : 'female';
        const name = generateCulturallyAuthenticName(character.nationality, 'spouse', partnerGender);
        const partnerAge = Math.max(18, (character.age || 18) + (Math.floor(getRandom() * 5) - 2));
        partner = await addRelationship({
          character_id: character.id,
          type: 'spouse',
          name,
          age: partnerAge,
          status: 'alive',
          affection_level: 90,
          monthly_cost: 600
        });
      } else {
        await updateRelationship(partner.id, { type: 'spouse', affection_level: 95, monthly_cost: 600 });
      }

      character.action_points -= costAP;
      character.cash -= costCash;
      character.karma = Math.min(100, character.karma + 25);
      character.burnout = Math.max(0, character.burnout - 20);

      history.push({
        age: character.age,
        event: `Tổ chức lễ kết hôn trọng đại cùng ${partner.name}`,
        choice: `Chi $${costCash.toLocaleString()} & ${costAP} AP (Chính thức lập gia đình)`
      });
      character.history_log = history;
      await updateCharacter(character.id, character);
      const updatedRels = await getRelationships(character.id);

      return res.json({
        success: true,
        message: `Đám cưới thiêng liêng cùng ${partner.name} đã diễn ra trọn vẹn! (+25 Karma, Gia đình vững chãi)`,
        character,
        relationships: updatedRels
      });
    }

    if (action_type === 'have_child') {
      if ((Number(character.age) || 0) < 18) {
        return res.status(400).json({
          error: `Chưa đủ 18 tuổi (${character.age} tuổi)! Bạn chưa đủ tuổi trưởng thành để sinh con lập gia đình.`
        });
      }
      const costAP = 2;
      const costCash = 8000;
      if (character.action_points < costAP || character.cash < costCash) {
        return res.status(400).json({ error: "Cần tối thiểu 2 AP và $8.000 để chăm sóc thai kỳ & đón con chào đời!" });
      }

      // Kế thừa Họ cha theo tập tục văn hóa từng quốc gia
      const fatherFullName = character.gender === 'male' ? character.name : (relationships.find(r => r.type === 'spouse')?.name || character.name);
      const fatherSurname = extractFamilySurname(fatherFullName, character.nationality);
      const childGender = getRandom() < 0.5 ? 'male' : 'female';
      const name = generateCulturallyAuthenticName(character.nationality, 'child', childGender, fatherSurname);

      const newChild = await addRelationship({
        character_id: character.id,
        type: 'child',
        name,
        age: 0,
        status: 'alive',
        affection_level: 95,
        monthly_cost: 800,
        inherited_traits: character.innate_traits ? character.innate_traits.slice(0, 1) : []
      });

      character.action_points -= costAP;
      character.cash -= costCash;
      character.karma = Math.min(100, character.karma + 30);
      character.burnout = Math.min(100, character.burnout + 10);

      history.push({
        age: character.age,
        event: `Chào đón thiên thần nhỏ: ${name} chào đời`,
        choice: `Chi $${costCash.toLocaleString()} & ${costAP} AP (Mở khóa dòng dõi kế thừa)`
      });
      character.history_log = history;
      await updateCharacter(character.id, character);
      const updatedRels = await getRelationships(character.id);

      return res.json({
        success: true,
        message: `Chào mừng bé ${name} đến với thế giới! Dòng tộc của bạn đã có người kế thừa (+30 Karma).`,
        character,
        relationships: updatedRels
      });
    }

    if (action_type === 'gift_parent') {
      const costAP = 1;
      const costCash = 2000;
      if (character.action_points < costAP || character.cash < costCash) {
        return res.status(400).json({ error: "Cần tối thiểu 1 AP và $2.000 để báo hiếu phụ mẫu!" });
      }

      character.action_points -= costAP;
      character.cash -= costCash;
      character.karma = Math.min(100, character.karma + 20);
      character.burnout = Math.max(0, character.burnout - 20);

      const parents = relationships.filter(r => r.type === 'parent' || r.type === 'father' || r.type === 'mother');
      for (const parent of parents) {
        parent.affection_level = Math.min(100, (parent.affection_level || 75) + 25);
        await updateRelationship(parent.id, { affection_level: parent.affection_level });
      }

      history.push({
        age: character.age,
        event: `Báo hiếu cha mẹ: Mua sắm quà cáp & chăm sóc sức khỏe phụ mẫu`,
        choice: `Chi $${costCash.toLocaleString()} & ${costAP} AP`
      });
      character.history_log = history;
      await updateCharacter(character.id, character);
      const updatedRels = await getRelationships(character.id);

      return res.json({
        success: true,
        message: `Báo hiếu cha mẹ thành tâm! (+20 Karma, -20 Burnout, Cha mẹ an lòng)`,
        character,
        relationships: updatedRels
      });
    }

    if (action_type === 'family_mentorship') {
      if (!character.household || character.household.parents_status === 'deceased_or_abandoned' || character.household.parents_status === 'deceased') {
        return res.status(400).json({ error: "Cha mẹ đã khuất núi, không thể tâm sự định hướng." });
      }
      if (character.household.family_mentorship_used === character.age) {
        return res.status(400).json({ error: "Năm nay bạn đã tâm sự cùng cha mẹ rồi. Hãy trải nghiệm cuộc sống và chia sẻ lại sang năm nhé!" });
      }

      character.household.family_mentorship_used = character.age;
      character.burnout = Math.max(0, (character.burnout || 0) - 10);
      character.karma = Math.min(100, (character.karma || 50) + 8);
      const flags = new Set(character.hidden_flags || []);
      flags.add("family_guidance_received");
      character.hidden_flags = Array.from(flags);

      const advice = character.household.family_buff?.description || "Cha mẹ luôn dõi theo và khuyên bạn hãy vững vàng với sự lựa chọn của mình, giữ gìn nhân cách và sức khỏe.";
      history.push({
        age: character.age,
        event: "Tâm Sự Định Hướng Cùng Cha Mẹ",
        choice: "Lắng nghe lời khuyên: " + advice + " (-10 Burnout, +8 Nghiệp Lực, Vững vàng tâm lý)"
      });
      character.history_log = history;
      await updateCharacter(character.id, character);
      const updatedRels = await getRelationships(character.id);

      return res.json({
        success: true,
        message: "Cha mẹ đã lắng nghe tâm tư và chia sẻ lời khuyên quý giá: " + advice + " (-10 Burnout, +8 Nghiệp Lực).",
        character,
        relationships: updatedRels
      });
    }

    if (action_type === 'family_meal') {
      if (!character.household || character.household.parents_status === 'deceased_or_abandoned' || character.household.parents_status === 'deceased') {
        return res.status(400).json({ error: "Cha mẹ đã khuất núi, không còn bữa cơm sum vầy gia đình." });
      }
      if (character.household.family_meals_available === 0) {
        return res.status(400).json({ error: "Năm nay bạn đã dùng bữa cơm gia đình rồi. Hãy đợi sang tuổi tiếp theo!" });
      }

      character.burnout = Math.max(0, (character.burnout || 0) - 15);
      character.karma = Math.min(100, (character.karma || 50) + 5);
      if (character.age < 6) {
        character.vitality = Math.min(character.max_vitality || 100, (character.vitality || 0) + 10);
      }
      character.household.family_meals_available = 0;

      history.push({
        age: character.age,
        event: "Bữa Cơm Sum Vầy Mái Ấm Gia Đình",
        choice: "Cơm mẹ nấu & tình thân gia đình (-15 Burnout, +5 Nghiệp Lực)"
      });
      character.history_log = history;
      await updateCharacter(character.id, character);
      const updatedRels = await getRelationships(character.id);

      return res.json({
        success: true,
        message: "Bữa cơm gia đình ấm áp đã xua tan muộn phiền! Giảm 15 Burnout, tăng +5 Nghiệp Lực.",
        character,
        relationships: updatedRels
      });
    }

    res.status(400).json({ error: "Hành động gia đình không hợp lệ!" });
  } catch (err) {
    res.status(500).json({ error: "Thao tác gia đình thất bại", message: err.message });
  }
});

// POST /api/game/action/senior - Hoạt Động Tiêu AP Tuổi Già (Senior AP Sinks: 45+ Tuổi)
router.post('/action/senior', async (req, res) => {
  try {
    const { action_type } = req.body;
    let character = await getLivingCharacter(res);
    if (!character) return;

    if ((Number(character.age) || 0) < 45) {
      return res.status(400).json({
        error: `Chỉ mở khóa cho người từng trải từ 45 tuổi trở lên (Hiện tại: ${character.age} tuổi)!`
      });
    }

    const history = character.history_log || [];
    if (!character.hidden_flags) character.hidden_flags = [];

    if (action_type === 'write_memoir') {
      const costAP = 2;
      if ((character.action_points || 0) < costAP) {
        return res.status(400).json({ error: "Cần tối thiểu 2 AP để tĩnh tâm chấp bút hồi ký cuộc đời!" });
      }

      character.action_points -= costAP;
      character.karma = Math.min(100, (Number(character.karma) || 0) + 25);
      character.written_memoir = true;
      if (!character.hidden_flags.includes('written_memoir')) {
        character.hidden_flags.push('written_memoir');
      }

      history.push({
        age: character.age,
        event: 'Viết hồi ký cuộc đời',
        choice: 'Đúc kết bài học nhân sinh (+25 Karma, lưu danh hậu thế)'
      });
      character.history_log = history;
      await updateCharacter(character.id, character);

      return res.json({
        success: true,
        message: "Đã hoàn thành cuốn hồi ký cuộc đời, truyền lại trí tuệ và công đức cho muôn đời sau (+25 Karma)!",
        character
      });
    }

    if (action_type === 'grandchild_mentorship') {
      const costAP = 1;
      if ((character.action_points || 0) < costAP) {
        return res.status(400).json({ error: "Cần tối thiểu 1 AP để chỉ dạy, bồi dưỡng thế hệ con cháu!" });
      }

      character.action_points -= costAP;
      character.karma = Math.min(100, (Number(character.karma) || 0) + 10);
      character.mentored_heir = true;
      if (!character.hidden_flags.includes('mentored_heir')) {
        character.hidden_flags.push('mentored_heir');
      }

      // Boost affinity of family members
      try {
        const relationships = await getRelationships(character.id);
        for (const rel of relationships) {
          if (rel.type === 'child' || rel.type === 'spouse' || rel.type === 'relative') {
            rel.affinity = Math.min(100, (Number(rel.affinity) || 50) + 15);
            await updateRelationship(rel.id, rel);
          }
        }
      } catch (err) {
        console.error("Lỗi cập nhật hảo cảm người thân:", err);
      }

      history.push({
        age: character.age,
        event: 'Truyền thụ kinh nghiệm cho con cháu',
        choice: 'Bồi dưỡng thế hệ kế cận (+15 Hảo cảm gia đình, +10 Karma)'
      });
      character.history_log = history;
      await updateCharacter(character.id, character);

      return res.json({
        success: true,
        message: "Đã dành thời gian chỉ dạy thế hệ thừa kế, củng cố tình thân và đạo đức gia tộc (+15 Gắn kết, +10 Karma)!",
        character
      });
    }

    if (action_type === 'early_estate_will') {
      const costAP = 2;
      const costCash = 1000;
      if ((character.action_points || 0) < costAP) {
        return res.status(400).json({ error: "Cần tối thiểu 2 AP để hoàn tất thủ tục lập di chúc hợp pháp!" });
      }
      if ((Number(character.cash) || 0) < costCash) {
        return res.status(400).json({ error: "Cần $1.000 để chi trả lệ phí công chứng và pháp lý di chúc!" });
      }

      character.action_points -= costAP;
      character.cash -= costCash;
      character.early_will_established = true;
      if (!character.hidden_flags.includes('early_will_established')) {
        character.hidden_flags.push('early_will_established');
      }

      history.push({
        age: character.age,
        event: 'Lập di chúc & quy hoạch thừa kế',
        choice: 'Công chứng di chúc hợp pháp, giảm thuế thừa kế từ 30% xuống chỉ còn 10%'
      });
      character.history_log = history;
      await updateCharacter(character.id, character);

      return res.json({
        success: true,
        message: "Đã hoàn tất công chứng di chúc thừa kế! Thế hệ sau sẽ được giảm thuế thừa kế từ 30% xuống chỉ còn 10%!",
        character
      });
    }

    return res.status(400).json({ error: "Loại hành động dưỡng lão không hợp lệ!" });
  } catch (err) {
    res.status(500).json({ error: "Thao tác dưỡng lão thất bại", message: err.message });
  }
});

// POST /api/game/action/debt-relief - Tái Cấu Trúc Nợ & Thoát Bẫy Nghèo (Debt Restructuring)
router.post('/action/debt-relief', async (req, res) => {
  try {
    const { relief_type } = req.body;
    let character = await getLivingCharacter(res);
    if (!character) return;

    if ((Number(character.cash) || 0) >= 0) {
      return res.status(400).json({
        error: "Tài chính của bạn chưa rơi vào tình trạng âm nợ! Không cần kích hoạt gói cứu trợ thoát bẫy nghèo."
      });
    }

    const history = character.history_log || [];
    if (!character.hidden_flags) character.hidden_flags = [];

    if (relief_type === 'family_soft_loan') {
      character.cash = Number(character.cash) + 3000;
      character.family_soft_loan_taken = true;
      if (!character.hidden_flags.includes('family_soft_loan_taken')) {
        character.hidden_flags.push('family_soft_loan_taken');
      }

      // Trừ nhẹ 10 điểm hảo cảm gia tộc
      try {
        const relationships = await getRelationships(character.id);
        for (const rel of relationships) {
          if (rel.type === 'father' || rel.type === 'mother' || rel.type === 'parent' || rel.type === 'spouse') {
            rel.affinity = Math.max(0, (Number(rel.affinity) || 50) - 10);
            await updateRelationship(rel.id, rel);
          }
        }
      } catch (err) {
        console.error("Lỗi cập nhật hảo cảm khi vay mềm:", err);
      }

      history.push({
        age: character.age,
        event: 'Cứu trợ tài chính thân tộc',
        choice: 'Vay mềm $3,000 khẩn cấp 0% lãi suất (-10 Gắn kết gia đình)'
      });
      character.history_log = history;
      await updateCharacter(character.id, character);

      return res.json({
        success: true,
        message: "Gia đình đã gom góp gói cứu trợ khẩn cấp $3,000 giúp bạn tạm thoát khỏi khủng hoảng nợ nần (-10 Gắn kết)!",
        character
      });
    }

    if (relief_type === 'liquidate_personal_items') {
      character.cash = Number(character.cash) + 1200;
      character.burnout = Math.min(100, (Number(character.burnout) || 0) + 10);

      history.push({
        age: character.age,
        event: 'Thanh lý tư trang cá nhân',
        choice: 'Bán gấp đồ đạc thu về $1,200 tiền mặt (+10% Kiệt sức)'
      });
      character.history_log = history;
      await updateCharacter(character.id, character);

      return res.json({
        success: true,
        message: "Đã bán thanh lý các vật dụng cá nhân, thu về $1,200 tiền mặt để bù đắp thâm hụt (+10 Kiệt sức)!",
        character
      });
    }

    return res.status(400).json({ error: "Phương án cứu trợ nợ không hợp lệ!" });
  } catch (err) {
    res.status(500).json({ error: "Cứu trợ nợ thất bại", message: err.message });
  }
});

// POST /api/game/action/wellness
router.post('/action/wellness', async (req, res) => {
  try {
    const action_type = req.body.action_type || req.body.therapy_type || 'meditation_retreat';
    let character = await getLivingCharacter(res);
    if (!character) return;
    const history = character.history_log || [];
    const healthLevel = character.skills?.resilience_health?.level || 0;
    const bonusVit = healthLevel >= 2 ? (healthLevel === 2 ? 10 : 15) : 0;
    const bonusBurnoutRelief = healthLevel >= 1 ? (healthLevel === 1 ? 5 : healthLevel === 2 ? 15 : 25) : 0;

    const isWellnessPledge = character.active_pledge === 'pledge_wellness';
    const wellnessMult = isWellnessPledge ? 1.5 : 1.0;
    const wellnessBurnoutMult = isWellnessPledge ? 1.3 : 1.0;

    if (action_type === 'medical_checkup') {
      const costAP = 1;
      const costCash = 3000;
      if (character.action_points < costAP || character.cash < costCash) {
        return res.status(400).json({ error: "Cần 1 AP và $3.000 để khám tổng quát tại bệnh viện quốc tế!" });
      }

      character.action_points -= costAP;
      character.cash -= costCash;
      const maxV = character.max_vitality || 100;
      const vitGained = Math.round((20 + bonusVit) * wellnessMult);
      const burnoutRelief = Math.round((25 + bonusBurnoutRelief) * wellnessBurnoutMult);
      character.vitality = Math.min(maxV, character.vitality + vitGained);
      character.burnout = Math.max(0, character.burnout - burnoutRelief);
      awardLifeExp(character, 30, "Trị liệu y tế phục hồi thể trạng");

      const healthPerkMsg = healthLevel > 0 ? ` (Kỹ Năng Sinh Lực Lv${healthLevel} tăng thêm +${bonusVit} HP, -${bonusBurnoutRelief} Burnout)` : '';
      const pledgeMsg = isWellnessPledge ? ' [🧘 Tâm Nguyện An Yên x1.5]' : '';
      history.push({
        age: character.age,
        event: "Khám sức khỏe tổng quát & Trị liệu dưỡng sinh",
        choice: `Chi $${costCash.toLocaleString()} & ${costAP} AP (+${vitGained} Sinh lực, -${burnoutRelief} Burnout)${healthPerkMsg}${pledgeMsg}`
      });
      const combo = recordAndCheckCombo(character, 'wellness');
      character.history_log = history;
      await updateCharacter(character.id, character);

      return res.json({
        success: true,
        combo_triggered: combo,
        message: `Trị liệu y tế phục hồi thể trạng thành công! (+${vitGained} Sinh lực, -${burnoutRelief} Burnout)${healthPerkMsg}${pledgeMsg}`,
        character
      });
    }

    if (action_type === 'meditation_retreat') {
      const costAP = 1;
      const costCash = 800;
      if (character.action_points < costAP || character.cash < costCash) {
        return res.status(400).json({ error: "Cần 1 AP và $800 để tham gia khóa thiền tịnh tâm!" });
      }

      character.action_points -= costAP;
      character.cash -= costCash;
      const vitGained = Math.round((15 + bonusVit) * wellnessMult);
      const burnoutRelief = Math.round((35 + bonusBurnoutRelief) * wellnessBurnoutMult);
      character.burnout = Math.max(0, character.burnout - burnoutRelief);
      character.vitality = Math.min(character.max_vitality || 100, character.vitality + vitGained);
      character.karma = Math.min(100, character.karma + 10);
      awardLifeExp(character, 35, "Khóa tu tĩnh tâm dưỡng sinh");

      const healthPerkMsg = healthLevel > 0 ? ` (Kỹ Năng Sinh Lực Lv${healthLevel} tăng thêm +${bonusVit} HP, -${bonusBurnoutRelief} Burnout)` : '';
      const pledgeMsg = isWellnessPledge ? ' [🧘 Tâm Nguyện An Yên x1.5]' : '';
      history.push({
        age: character.age,
        event: "Khóa tu tĩnh tâm / Du lịch hòa mình vào thiên nhiên",
        choice: `Chi $${costCash.toLocaleString()} & ${costAP} AP (+${vitGained} Sinh lực, -${burnoutRelief} Burnout)${healthPerkMsg}${pledgeMsg}`
      });
      character.history_log = history;
      await updateCharacter(character.id, character);

      return res.json({
        success: true,
        message: `Tâm hồn hoàn toàn tĩnh tại, thể lực hồi phục! (+${vitGained} Sinh lực, -${burnoutRelief} Burnout)${healthPerkMsg}`,
        character
      });
    }

    res.status(400).json({ error: "Hành động dưỡng sinh không hợp lệ!" });
  } catch (err) {
    res.status(500).json({ error: "Thao tác dưỡng sinh thất bại", message: err.message });
  }
});

// POST /api/game/action/overtime - High-value direct AP cash earner
router.post('/action/overtime', async (req, res) => {
  try {
    let character = await getLivingCharacter(res);
    if (!character) return;
    const age = typeof character.age === 'number' ? character.age : 25;
    if (age < 18) {
      return res.status(400).json({ error: "Chưa đủ 18 tuổi để tham gia lao động cày việc ngoài luồng!" });
    }
    if (character.action_points < 1) {
      return res.status(400).json({ error: "Cần tối thiểu 1 AP để cày việc kiếm thêm thu nhập!" });
    }

    const techLevel = character.skills?.tech_logic?.level || 0;
    const techMultiplier = 1 + (techLevel * 0.15); // +15% per tech level
    const hasNegotiation = (character.unlocked_skills || []).includes("negotiation_master");
    const negotiationMultiplier = hasNegotiation ? 1.35 : 1.0; // +35% thặng dư từ Kỹ Năng Đàm Phán Khắc Nghiệt

    const baseEarned = Math.round(1500 + (age * 120) + (getRandom() * 800));
    const hasCodeWhisperer = (character.innate_traits || []).includes("code_whisperer");
    const codeMultiplier = hasCodeWhisperer ? 1.35 : 1.0;
    const isWealthPledge = character.active_pledge === 'pledge_wealth';
    const pledgeWealthMultiplier = isWealthPledge ? 1.15 : 1.0;
    const earnedCash = Math.round(baseEarned * techMultiplier * negotiationMultiplier * codeMultiplier * pledgeWealthMultiplier);

    const healthLevel = character.skills?.resilience_health?.level || 0;
    const burnoutReduction = healthLevel * 0.2; // 20% burnout reduction per level
    let burnoutGained = Math.max(4, Math.round(12 * (1 - burnoutReduction)));
    const hasStoicZen = (character.innate_traits || []).includes("stoic_zen");
    if (hasStoicZen) {
      burnoutGained = Math.max(2, Math.round(burnoutGained * 0.5)); // Giảm 50% kiệt sức khi cày việc (Stoic Zen)
    }
    const isWellnessPledge = character.active_pledge === 'pledge_wellness';
    if (isWellnessPledge) {
      burnoutGained = Math.max(1, Math.round(burnoutGained * 0.70)); // Kháng 30% Burnout khi cày việc
    }

    character.action_points -= 1;
    character.cash = Number(character.cash) + earnedCash;
    character.burnout = Math.min(100, character.burnout + burnoutGained);
    character.vitality = Math.max(10, character.vitality - (healthLevel >= 2 ? 1 : 3));

    // Award Life EXP for grinding hard
    awardLifeExp(character, 40, "Cày việc ngoài giờ thực chiến");

    const techBonusNote = techLevel > 0 ? ` (+${techLevel * 15}% Kỹ Năng Công Nghệ)` : '';
    const negotiationNote = hasNegotiation ? ' (+35% [Đàm Phán Khắc Nghiệt])' : '';
    const history = character.history_log || [];
    history.push({
      age: character.age,
      event: "Làm thêm giờ & Nhận dự án ngoài luồng (Overtime Grind)",
      choice: `Tiêu 1 AP: Kiếm thêm +$${earnedCash.toLocaleString()}${techBonusNote}${negotiationNote}, Burnout +${burnoutGained}`
    });
    character.history_log = history;
    await updateCharacter(character.id, character);
    recordPlayerAction("overtime", character);

    res.json({
      success: true,
      message: `Cày thêm việc thành công! Thu về ngay +$${earnedCash.toLocaleString()} tiền mặt${techBonusNote} (Burnout +${burnoutGained}).`,
      earnedCash,
      character
    });
  } catch (err) {
    res.status(500).json({ error: "Cày thêm việc thất bại", message: err.message });
  }
});

// POST /api/game/action/study - Invest in intellectual capital
router.post('/action/study', async (req, res) => {
  try {
    let character = await getLivingCharacter(res);
    if (!character) return;
    const costCash = 500;
    if (character.action_points < 1 || character.cash < costCash) {
      return res.status(400).json({ error: "Cần 1 AP và $500 để mua sách và tham gia khóa đào tạo chuyên sâu!" });
    }

    character.action_points -= 1;
    character.cash -= costCash;
    character.burnout = Math.max(0, character.burnout - 10);
    character.karma = Math.min(100, character.karma + 8);

    // Award Life EXP for studying
    awardLifeExp(character, 50, "Nghiên cứu tri thức chuyên sâu");

    const flags = new Set(character.hidden_flags || []);
    flags.add("intellectual_acumen");
    character.hidden_flags = Array.from(flags);

    const history = character.history_log || [];
    history.push({
      age: character.age,
      event: "Đọc sách nghiên cứu & Trau dồi tri thức",
      choice: `Chi $${costCash} & 1 AP: Khai mở trí tuệ (+8 Karma, nhận cờ Nhạy Bén Tri Thức)`
    });
    character.history_log = history;
    await updateCharacter(character.id, character);

    res.json({
      success: true,
      message: "Tư duy được khai mở sâu sắc! (-10 Burnout, +8 Karma, nhận cờ Nhạy Bén Tri Thức).",
      character
    });
  } catch (err) {
    res.status(500).json({ error: "Học tập thất bại", message: err.message });
  }
});

// POST /api/game/action/network - Expand social and business network
router.post('/action/network', async (req, res) => {
  try {
    let character = await getLivingCharacter(res);
    if (!character) return;
    const socialLevel = character.skills?.leadership_social?.level || 0;
    const socialDiscount = socialLevel === 1 ? 0.25 : socialLevel === 2 ? 0.50 : socialLevel >= 3 ? 0.70 : 0;
    const isSocialPledge = character.active_pledge === 'pledge_social';
    const pledgeDiscount = isSocialPledge ? 0.50 : 0.0;
    const combinedDiscount = Math.min(0.90, socialDiscount + pledgeDiscount);
    const costCash = Math.round(400 * (1 - combinedDiscount));

    if (character.action_points < 1 || character.cash < costCash) {
      return res.status(400).json({ error: `Cần 1 AP và $${costCash.toLocaleString()} để mời đối tác cà phê / tham dự sự kiện kết nối!` });
    }

    character.action_points -= 1;
    character.cash -= costCash;
    character.karma = Math.min(100, character.karma + 6);

    const npcs = await getNpcs(character.id);
    let message = "";

    if (npcs.length > 0 && getRandom() < (socialLevel >= 2 ? 0.80 : 0.65)) {
      const targetNpc = npcs[Math.floor(getRandom() * npcs.length)];
      targetNpc.affinity = Math.min(100, (Number(targetNpc.affinity) || 50) + (socialLevel >= 2 ? 22 : 15));
      await updateRelationship(targetNpc.id, { affinity: targetNpc.affinity });
      message = `Gặp gỡ giao lưu cùng ${targetNpc.name}: Tình bằng hữu thêm gắn kết (+${socialLevel >= 2 ? 22 : 15} Thân thiện)!`;
    } else {
      const vipRoles = ["Chủ tịch Tập đoàn Đầu tư", "Giám đốc Quỹ Mạo hiểm", "Quan chức Ban Kinh tế", "Chủ thương hội Quốc tế", "Luật sư danh tiếng"];
      const normalRoles = ["Bằng hữu thương trường", "Đối tác phân phối", "Cố vấn khởi nghiệp", "Chuyên viên tài chính"];
      const rolePool = socialLevel >= 2 ? vipRoles : normalRoles;
      const newContact = {
        character_id: character.id,
        name: ["Nguyễn Hoàng", "Trần Thảo", "Vũ Phong", "Phạm Linh", "Đặng Huy", "David Vance", "Alexander Chen"][Math.floor(getRandom() * 7)],
        role: rolePool[Math.floor(getRandom() * rolePool.length)],
        affinity: socialLevel >= 2 ? 80 : 70,
        status: "alive",
        memory_notes: "Gặp gỡ qua sự kiện giao lưu kết nối doanh nghiệp cấp cao.",
        avatar_color: socialLevel >= 2 ? "#eab308" : "#38bdf8"
      };
      await addNpc(newContact);
      message = `Kết giao thành công đối tác ${socialLevel >= 2 ? 'VIP' : 'mới'}: ${newContact.name} (${newContact.role})!`;
    }

    const discountMsg = socialDiscount > 0 ? ` (Tiết kiệm ${(socialDiscount * 100).toFixed(0)}% chi phí nhờ Kỹ Năng Ngoại Giao Lv${socialLevel})` : '';
    const history = character.history_log || [];
    history.push({
      age: character.age,
      event: "Mở rộng mạng lưới quan hệ (Networking)",
      choice: `${message}${discountMsg}`
    });
    character.history_log = history;
    await updateCharacter(character.id, character);

    res.json({
      success: true,
      message: `${message}${discountMsg}`,
      character,
      npcs: await getNpcs(character.id)
    });
  } catch (err) {
    res.status(500).json({ error: "Giao lưu mạng lưới thất bại", message: err.message });
  }
});

// POST /api/game/action/gamble - High-stakes speculative roll
router.post('/action/gamble', async (req, res) => {
  try {
    let character = await getLivingCharacter(res);
    if (!character) return;
    const costCash = 300;
    if (character.action_points < 1 || character.cash < costCash) {
      return res.status(400).json({ error: "Cần 1 AP và $300 để thử vận may mua vé số / đầu cơ lướt sóng!" });
    }

    const financeLevel = character.skills?.finance_market?.level || 0;
    // Finance Level 2+ lowers loss rate from 0.65 to 0.45
    const lossThreshold = financeLevel >= 2 ? 0.45 : financeLevel === 1 ? 0.55 : 0.65;

    character.action_points -= 1;
    character.cash -= costCash;

    const roll = getRandom();
    let message = "";
    let netGain = -costCash;

    if (roll < lossThreshold) {
      // Small loss
      message = "Không trúng số! Mất -$300 chi phí thử vận may, tự nhủ may mắn lần sau.";
    } else if (roll < 0.94) {
      // 3x win
      const win = financeLevel >= 2 ? 1200 : 900;
      character.cash += win;
      netGain = win - costCash;
      message = `Bắt đúng nhịp sóng nhỏ! Thắng giải thu về +$${win.toLocaleString()}!`;
    } else {
      // JACKPOT 50x
      const jackpot = 15000;
      character.cash += jackpot;
      netGain = jackpot - costCash;
      character.karma = Math.max(0, character.karma - 5);
      message = `🎆 TRÚNG ĐỘC ĐẮC! Bánh xe vận may mỉm cười, nhận ngay +$${jackpot.toLocaleString()} tiền mặt!`;
    }

    const history = character.history_log || [];
    history.push({
      age: character.age,
      event: "Thử vận may đầu cơ / Mua vé số kiến thiết",
      choice: message
    });
    character.history_log = history;
    await updateCharacter(character.id, character);
    recordPlayerAction("gamble", character);

    res.json({
      success: true,
      message,
      netGain,
      character
    });

    res.json({
      success: true,
      message,
      netGain,
      character
    });
  } catch (err) {
    res.status(500).json({ error: "Thử vận may thất bại", message: err.message });
  }
});

// POST /api/game/blessing - Invoke ancestral blessing using eternal karma
router.post('/blessing', async (req, res) => {
  try {
    const { blessing_type } = req.body;
    const account = await getPlayerAccount();
    let character = await getLatestCharacter();

    if (blessing_type === 'vitality_shield') {
      const cost = 15;
      if ((account.total_karma || 0) < cost) {
        return res.status(400).json({ error: `Không đủ Nghiệp Lực! Cần tối thiểu ${cost} Karma vĩnh cửu.` });
      }
      await updatePlayerAccount({ total_karma: account.total_karma - cost });
      character.vitality = Math.min(character.max_vitality || 100, character.vitality + 25);
      character.burnout = Math.max(0, character.burnout - 35);

      const history = character.history_log || [];
      history.push({
        age: character.age,
        event: "Cầu an tại Đền Thờ Nghiệp Quả: Hộ Thể Kim Thân",
        choice: `Dâng ${cost} Karma tiền kiếp: Hồi +25 Sinh lực, xóa -35 Burnout.`
      });
      character.history_log = history;
      await updateCharacter(character.id, character);

      return res.json({
        success: true,
        message: "Phước lành tiền kiếp che chở! Sinh lực tăng +25, tâm trí xả -35 Burnout.",
        character,
        player_account: await getPlayerAccount()
      });
    }

    if (blessing_type === 'benefactor_grace') {
      const cost = 25;
      if ((account.total_karma || 0) < cost) {
        return res.status(400).json({ error: `Không đủ Nghiệp Lực! Cần tối thiểu ${cost} Karma vĩnh cửu.` });
      }
      await updatePlayerAccount({ total_karma: account.total_karma - cost });
      character.karma = Math.min(100, character.karma + 20);

      const flags = new Set(character.hidden_flags || []);
      flags.add("ancestral_protection");
      character.hidden_flags = Array.from(flags);

      const history = character.history_log || [];
      history.push({
        age: character.age,
        event: "Cầu an tại Đền Thờ Nghiệp Quả: Quý Nhân Phù Trợ",
        choice: `Dâng ${cost} Karma: Nhận cờ Gia Tộc Hộ Mệnh (+20 Karma tại thế).`
      });
      character.history_log = history;
      await updateCharacter(character.id, character);

      return res.json({
        success: true,
        message: "Ánh sáng phước đức rọi soi! Nhận cờ Gia Tộc Hộ Mệnh (+20 Karma tại thế).",
        character,
        player_account: await getPlayerAccount()
      });
    }

    res.status(400).json({ error: "Loại phước lành không hợp lệ!" });
  } catch (err) {
    res.status(500).json({ error: "Thỉnh cầu phước lành thất bại", message: err.message });
  }
});

// POST /api/game/action/skill-train - Register for professional skill examination
router.post('/action/skill-train', async (req, res) => {
  try {
    const { skill_id } = req.body;
    let character = await getLivingCharacter(res);
    if (!character) return;
    if (!character) return res.status(404).json({ error: "Không tìm thấy dữ liệu nhân vật!" });

    if ((Number(character.age) || 0) < 6) {
      return res.status(400).json({ error: "Nhân vật dưới 6 tuổi chưa thể đăng ký thi sát hạch học viện chuyên môn!" });
    }

    const def = SKILL_DEFINITIONS[skill_id];
    if (!def) {
      return res.status(400).json({ error: `Kỹ năng [${skill_id}] không hợp lệ!` });
    }

    const currentLevel = character.skills?.[skill_id]?.level || 0;
    if (currentLevel >= 3) {
      return res.status(400).json({ error: `Kỹ năng ${def.name} đã đạt cảnh giới Đại Sư (Master Lv3) tối cao!` });
    }

    const targetLevel = currentLevel + 1;
    const tuitionFee = getTuitionFee(character, skill_id, targetLevel);
    const hasAffinity = checkGeneticAffinity(character, skill_id);

    if ((character.action_points || 0) < 1) {
      return res.status(400).json({ error: "Cần tối thiểu 1 Điểm Hành Động (AP) để tham gia đào tạo & thi sát hạch!" });
    }
    if ((Number(character.cash) || 0) < tuitionFee) {
      return res.status(400).json({
        error: `Không đủ học phí! Cần $${tuitionFee.toLocaleString()} (Hiện có $${(Number(character.cash) || 0).toLocaleString()}).`
      });
    }

    // Deduct 1 AP and tuition fee
    character.action_points -= 1;
    character.cash = Math.max(0, (Number(character.cash) || 0) - tuitionFee);

    const minigameType = getExamMinigameType(skill_id, character.age);

    character.pending_skill_exam = {
      id: crypto.randomUUID(),
      skill_id,
      target_level: targetLevel,
      minigame_type: minigameType,
      tuition_fee: tuitionFee,
      has_affinity: hasAffinity,
      timestamp: Date.now()
    };

    const history = character.history_log || [];
    history.push({
      age: character.age,
      event: `Đăng ký Kỳ Thi Sát Hạch [${def.name} - Cấp ${targetLevel}]`,
      choice: `Chi 1 AP & $${tuitionFee.toLocaleString()} học phí${hasAffinity ? ' (Được giảm 50% nhờ ưu thế Mã Gen)' : ''}. Bước vào kỳ sát hạch chuyên môn.`
    });
    character.history_log = history;

    await updateCharacter(character.id, character);

    res.json({
      success: true,
      message: `Đăng ký kỳ thi sát hạch ${def.name} Cấp ${targetLevel} thành công!`,
      exam: {
        id: character.pending_skill_exam.id,
        skill_id,
        skill_name: def.name,
        target_level: targetLevel,
        minigame_type: minigameType,
        tuition_paid: tuitionFee,
        has_affinity: hasAffinity
      },
      character
    });
  } catch (err) {
    res.status(500).json({ error: "Đăng ký rèn luyện kỹ năng thất bại", message: err.message });
  }
});

const MINIGAME_AGES = { plant_care_6yo: 6, logic_circuit_6yo: 6, stock_trader_20yo: 18,
  negotiation_duel: 18, survival_escape: 6, life_tightrope_35yo: 18, cardio_beat_55yo: 18, memory_mosaic_75yo: 18 };
router.post('/action/minigame-start', async (req, res) => {
  try {
    const c = await getLatestCharacter();
    const type = req.body.minigame_type;
    if (!c || c.is_deceased) throw new Error('Không có kiếp sống đang hoạt động.');
    if (!(type in MINIGAME_AGES) || c.age < MINIGAME_AGES[type]) throw new Error('Thử thách chưa phù hợp với độ tuổi.');
    if ((c.completed_minigames ?? []).includes(type)) throw new Error('Thử thách này đã được ghi nhận trong kiếp này.');
    if (c.pending_skill_exam) throw new Error('Hãy hoàn thành kỳ thi kỹ năng đang đăng ký trước.');
    c.pending_minigame = { id: crypto.randomUUID(), minigame_type: type, started_at: Date.now() };
    await updateCharacter(c.id, c);
    res.json({ success: true, challenge: c.pending_minigame });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// POST /api/game/action/minigame-result
router.post('/action/minigame-result', async (req, res) => {
  try {
    const minigame_id = req.body.minigame_id || req.body.minigame_type;
    const reportedOutcome = req.body.outcome ?? req.body.status ?? 'fair';
    const outcome = reportedOutcome === 'fail' ? 'failure' : reportedOutcome;
    const score = req.body.score || 0;
    let character = await getLivingCharacter(res);
    if (!character) return;
    if (!character || character.is_deceased) return res.status(409).json({ error: 'Không có kiếp sống đang hoạt động.' });
    if (!['success', 'fair', 'failure'].includes(outcome)) return res.status(400).json({ error: 'Kết quả thử thách không hợp lệ.' });
    const played = character.completed_minigames ?? [];
    if (!character.pending_skill_exam && played.includes(minigame_id)) return res.status(409).json({ error: 'Thử thách này đã được ghi nhận trong kiếp này.' });
    const history = character.history_log || [];
    const flags = new Set(character.hidden_flags || []);
    let feedback = "";

    const pendingExam = character.pending_skill_exam;
    const pendingChallenge = pendingExam ?? character.pending_minigame;
    if (!pendingChallenge || pendingChallenge.id !== req.body.challenge_id || pendingChallenge.minigame_type !== minigame_id)
      return res.status(409).json({ error: 'Kết quả không thuộc thử thách đang hoạt động.' });
    if (!Number.isFinite(Number(score)) || Number(score) < 0) return res.status(400).json({ error: 'Điểm không hợp lệ.' });

    const targetSkillId = req.body.skill_id || pendingExam?.skill_id;
    const hasEncyclopedic = (character.unlocked_skills || []).includes("encyclopedic_brain");
    const effectiveOutcome = (pendingExam && hasEncyclopedic) ? 'success' : outcome;

    if (pendingExam && (pendingExam.skill_id === targetSkillId || !targetSkillId)) {
      const activeSkillId = pendingExam.skill_id;
      const targetLevel = pendingExam.target_level;
      const def = SKILL_DEFINITIONS[activeSkillId];

      if (effectiveOutcome === 'success' || effectiveOutcome === 'fair') {
        if (!character.skills) character.skills = {};
        if (!character.skills[activeSkillId]) {
          character.skills[activeSkillId] = { level: 0, name: def.name };
        }
        character.skills[activeSkillId].level = targetLevel;

        const levelCfg = def?.levels?.find(l => l.level === targetLevel);
        if (levelCfg?.flag) {
          flags.add(levelCfg.flag);
        }

        // Permanent milestone bonuses
        if (activeSkillId === 'resilience_health' && targetLevel === 3) {
          character.max_vitality = Math.min(125, (character.max_vitality || 100) + 15);
          character.vitality = Math.min(character.max_vitality, character.vitality + 15);
        }

        const karmaGain = effectiveOutcome === 'success' ? 18 : 10;
        character.karma = Math.min(100, (character.karma || 100) + karmaGain);

        // Synergy with Aspiration
        if (character.aspiration) {
          const asp = (typeof character.aspiration === 'string' ? character.aspiration : character.aspiration.id) || '';
          const matchAsp = (activeSkillId === 'tech_logic' && (asp.includes('scholar') || asp.includes('tech'))) ||
                           (activeSkillId === 'finance_market' && (asp.includes('wealth') || asp.includes('empire') || asp.includes('gold'))) ||
                           (activeSkillId === 'resilience_health' && (asp.includes('zen') || asp.includes('monk') || asp.includes('longevity'))) ||
                           (activeSkillId === 'leadership_social' && (asp.includes('power') || asp.includes('dynasty') || asp.includes('fame')));
          if (matchAsp && character.aspiration.current_progress !== undefined) {
            character.aspiration.current_progress = Math.min(100, character.aspiration.current_progress + 12);
          }
        }

        const encyclopedicNote = (hasEncyclopedic && outcome !== 'success') ? ' 🌟 [Bách Khoa Toàn Thư Auto-Pass]' : '';
        feedback = `🎉 THI ĐỖ SÁT HẠCH! Bạn đã chính thức đạt chứng chỉ [${def?.name || activeSkillId} - ${levelCfg?.title || 'Cấp ' + targetLevel}]! Mở khóa vĩnh viễn: ${levelCfg?.perk_title || ''}${encyclopedicNote} (+${karmaGain} Karma).`;
      } else {
        character.burnout = Math.min(100, (character.burnout || 0) + 10);
        feedback = `Thi trượt sát hạch [${def?.name || activeSkillId} - Cấp ${targetLevel}]! Thiếu chút may mắn và sự tập trung (+10 Burnout). Hãy ôn luyện và thi lại sau.`;
      }

      character.pending_skill_exam = null;
    } else if (minigame_id === 'plant_care_6yo') {
      if (outcome === 'success') {
        character.vitality = Math.min(100, character.vitality + 15);
        character.karma = Math.min(100, character.karma + 20);
        flags.add("green_thumb");
        feedback = "Hạt mầm đầu đời đơm hoa xanh mướt! Bạn học được tính kiên nhẫn và sự trân trọng sự sống (+15 Sức sống, +20 Karma).";
      } else if (outcome === 'fair') {
        character.vitality = Math.min(100, character.vitality + 8);
        character.karma = Math.min(100, character.karma + 10);
        flags.add("patient_learner");
        feedback = "Mầm cây xanh tốt vừa độ dù gặp chút sâu rầy. Bạn rèn luyện đức tính nhẫn nại (+8 Sức sống, +10 Karma).";
      } else {
        character.vitality = Math.max(10, character.vitality - 5);
        character.karma = Math.max(0, character.karma - 5);
        flags.add("neglectful_past");
        feedback = "Mầm cây bị héo úng vì thiếu kiên nhẫn. Một bài học sâu sắc về sự thờ ơ (-5 Sức sống).";
      }
    } else if (minigame_id === 'logic_circuit_6yo') {
      if (outcome === 'success') {
        character.karma = Math.min(100, character.karma + 20);
        flags.add("logic_genius");
        feedback = "Thắp sáng vi mạch robot thành công! Bạn nhận cờ 'Thiên Tài Logic' (+20 Karma, tăng hiệu quả học tập và công nghệ).";
      } else if (outcome === 'fair') {
        character.karma = Math.min(100, character.karma + 10);
        flags.add("logical_mind");
        feedback = "Nắm bắt được tư duy thuật toán cơ bản (+10 Karma).";
      } else {
        character.vitality = Math.max(10, character.vitality - 5);
        feedback = "Đoản mạch vì sơ suất đấu dây. Rèn luyện thêm tính kiên nhẫn (-5 Sinh lực).";
      }
    } else if (minigame_id === 'stock_trader_20yo') {
      if (outcome === 'success') {
        const profit = 15000;
        character.cash = (Number(character.cash) || 0) + profit;
        flags.add("trader_instinct");
        feedback = `Chốt lời đỉnh sóng thị trường công nghệ ngoạn mục! Lợi nhuận ròng +$${profit.toLocaleString()}, nhận cờ Trực Giác Đầu Cơ.`;
      } else if (outcome === 'fair') {
        const profit = 5000;
        character.cash = (Number(character.cash) || 0) + profit;
        character.burnout = Math.max(0, character.burnout - 5);
        flags.add("prudent_investor");
        feedback = `Giao dịch bảo toàn vốn thận trọng! Thu về +$${profit.toLocaleString()} lợi nhuận an toàn.`;
      } else {
        const loss = Math.min(Math.max(2000, Number(character.cash)), 5000);
        character.cash = Math.max(0, (Number(character.cash) || 0) - loss);
        character.burnout = Math.min(100, character.burnout + 20);
        flags.add("market_scarred");
        feedback = `Đu đỉnh cắt lỗ thê thảm! Mất -$${loss.toLocaleString()} và tăng +20 Burnout. Bài học xương máu nơi thương trường.`;
      }
    } else if (minigame_id === 'life_tightrope_35yo') {
      if (outcome === 'success') {
        character.burnout = Math.max(0, character.burnout - 40);
        character.karma = Math.min(100, character.karma + 10);
        flags.add("master_of_balance");
        feedback = "Giữ thăng bằng xuất sắc giữa giông bão sự nghiệp và mái ấm gia đình! Thanh lọc -40 Burnout (+10 Karma).";
      } else if (outcome === 'fair') {
        character.burnout = Math.max(0, character.burnout - 20);
        flags.add("resilient_balancer");
        feedback = "Vượt qua chòng chành giữa hai ngả đường đời. Giữ được hòa khí cơ bản (-20 Burnout).";
      } else {
        character.burnout = Math.min(100, character.burnout + 25);
        character.vitality = Math.max(10, character.vitality - 5);
        feedback = "Mất thăng bằng cuộc đời! Áp lực công việc đè nát sự bình yên gia đạo (+25 Burnout, -5 Sức sống).";
      }
    } else if (minigame_id === 'cardio_beat_55yo') {
      if (outcome === 'success') {
        character.max_vitality = Math.min(100, (character.max_vitality || 80) + 10);
        character.vitality = Math.min(character.max_vitality, character.vitality + 15);
        flags.add("cardio_iron_heart");
        feedback = "Điều hòa nhịp tim và huyết áp thành công vượt qua cơn thắt ngực! (+10 Max Vitality, +15 Sức sống).";
      } else if (outcome === 'fair') {
        character.max_vitality = Math.min(100, (character.max_vitality || 80) + 5);
        character.vitality = Math.min(character.max_vitality, character.vitality + 8);
        flags.add("steady_pulse");
        feedback = "Kiểm soát được huyết áp tạm ổn sau cơn hồi hộp. Tăng thêm tuổi thọ an nhàn (+5 Max Vitality).";
      } else {
        character.vitality = Math.max(10, character.vitality - 12);
        character.burnout = Math.min(100, character.burnout + 15);
        character.cash = Math.max(0, (Number(character.cash) || 0) - 2000);
        feedback = "Cơn co thắt lồng ngực cấp cứu khẩn cấp! (-12 Sức sống, -$2.000 viện phí).";
      }
    } else if (minigame_id === 'memory_mosaic_75yo') {
      if (outcome === 'success') {
        character.karma = Math.min(100, character.karma + 35);
        character.vitality = Math.min(character.max_vitality || 60, character.vitality + 10);
        flags.add("lucid_mind");
        feedback = "Tìm lại trọn vẹn những mảnh ghép ký ức tươi đẹp cả đời! Tâm trí hoàn toàn minh mẫn (+35 Karma).";
      } else if (outcome === 'fair') {
        character.karma = Math.min(100, character.karma + 20);
        character.vitality = Math.min(character.max_vitality || 60, character.vitality + 5);
        flags.add("warm_memories");
        feedback = "Nhớ lại được những nụ cười thân thương bên người thân (+20 Karma).";
      } else {
        character.vitality = Math.max(10, character.vitality - 8);
        feedback = "Những mảnh ký ức dần tan thành làn sương trắng. Bình thản chấp nhận quy luật vô thường (-8 Sức sống).";
      }
    } else if (minigame_id === 'negotiation_duel') {
      if (outcome === 'success') {
        const bonusCash = 12000;
        character.cash = (Number(character.cash) || 0) + bonusCash;
        character.karma = Math.min(100, (character.karma || 100) + 15);
        flags.add("master_negotiator");
        feedback = `Thắng lợi vang dội trên bàn thương lượng! Nhận hoa hồng +$${bonusCash.toLocaleString()}, +15 Karma và nhận cờ 'Bậc Thầy Đàm Phán'.`;
      } else if (outcome === 'fair') {
        const bonusCash = 4000;
        character.cash = (Number(character.cash) || 0) + bonusCash;
        flags.add("prudent_negotiator");
        feedback = `Thỏa thuận đôi bên cùng có lợi thành công. Thu về +$${bonusCash.toLocaleString()} và giữ vững uy tín đối tác.`;
      } else {
        character.burnout = Math.min(100, (character.burnout || 0) + 15);
        feedback = `Đàm phán đổ vỡ vì bị đối tác ép giá. Tăng +15 Burnout và tổn hại uy tín thương trường.`;
      }
    } else if (minigame_id === 'survival_escape') {
      if (outcome === 'success') {
        character.vitality = Math.min(character.max_vitality || 100, (character.vitality || 80) + 20);
        character.karma = Math.min(100, (character.karma || 100) + 25);
        flags.add("survival_expert");
        feedback = `Chiến dịch sơ tán gia đình thành công ngoạn mục! Bảo vệ trọn vẹn người thân (+20 Sức sống, +25 Karma, nhận cờ 'Chuyên Gia Sinh Tồn').`;
      } else if (outcome === 'fair') {
        character.vitality = Math.min(character.max_vitality || 100, (character.vitality || 80) + 10);
        character.karma = Math.min(100, (character.karma || 100) + 10);
        feedback = `Đưa được gia đình đến vùng cứu trợ an toàn dù xây xát nhẹ (+10 Sức sống, +10 Karma).`;
      } else {
        character.vitality = Math.max(10, (character.vitality || 80) - 15);
        character.cash = Math.max(0, (Number(character.cash) || 0) - 3000);
        feedback = `Mắc kẹt giữa tâm chấn biến cố! Tổn thất -$3.000 nhu yếu phẩm dự trữ và bị thương (-15 Sức sống).`;
      }
    }

    history.push({
      age: character.age,
      event: `Thử thách kỹ năng [${minigame_id}]`,
      choice: feedback
    });
    const expGain = (effectiveOutcome === 'success') ? 120 : (effectiveOutcome === 'fair') ? 60 : 25;
    awardLifeExp(character, expGain, `Hoàn thành thử thách [${minigame_id || 'Sát Hạch'}]`);

    character.pending_minigame = null;
    if (!pendingExam) character.completed_minigames = [...new Set([...played, minigame_id])];
    character.history_log = history;
    character.hidden_flags = Array.from(flags);

    await updateCharacter(character.id, character);

    res.json({
      success: true,
      outcome,
      feedback,
      character
    });
  } catch (err) {
    res.status(500).json({ error: "Ghi nhận kết quả mini-game thất bại", message: err.message });
  }
});

// POST /api/game/action/breakthrough - Execute 2 AP Breakthrough Action
router.post('/action/breakthrough', async (req, res) => {
  try {
    let character = await getLivingCharacter(res);
    if (!character) return;
    if (!character) return res.status(400).json({ error: 'Không tìm thấy nhân vật' });
    const result = executeBreakthroughAction(character);
    await updateCharacter(character.id, character);
    res.json({ success: true, ...result, character });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/game/action/social-respond - Respond to Incoming NPC Event
router.post('/action/social-respond', async (req, res) => {
  try {
    const { option_id } = req.body;
    let character = await getLivingCharacter(res);
    if (!character) return;
    if (!character) return res.status(400).json({ error: 'Không tìm thấy nhân vật' });
    let relationships = await getRelationships(character.id);
    const incomingEvent = evaluateIncomingNpcEvent(character, relationships);
    const chosenOption = incomingEvent?.options?.find(o => o.id === option_id) || incomingEvent?.options?.[0];
    
    if (chosenOption) {
      if ((chosenOption.costAp || 0) > 0) {
        if ((character.action_points || 0) < chosenOption.costAp) {
          return res.status(400).json({ error: 'Không đủ AP để thực hiện lựa chọn này!' });
        }
        character.action_points -= chosenOption.costAp;
      }
      if ((chosenOption.costCash || 0) > 0) {
        if ((Number(character.cash) || 0) < chosenOption.costCash) {
          return res.status(400).json({ error: 'Không đủ tiền mặt!' });
        }
      }
      const msg = chosenOption.effect ? chosenOption.effect(character) : 'Đã phản hồi tương tác xã hội.';
      const history = character.history_log || [];
      history.push({
        age: character.age,
        event: `Tương tác với ${incomingEvent.npcName}: ${incomingEvent.title}`,
        choice: msg
      });
      character.history_log = history;
      await updateCharacter(character.id, character);
      return res.json({ success: true, message: msg, character });
    }
    res.json({ success: true, message: 'Đã ghi nhận phản hồi.', character });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/game/action/rpg-active-perk - Execute Active Perks unlocked by RPG tree
router.post('/action/rpg-active-perk', async (req, res) => {
  try {
    const { perk_type } = req.body;
    let character = await getLivingCharacter(res);
    if (!character) return;
    if (!character) return res.status(400).json({ error: 'Không tìm thấy nhân vật' });
    if ((character.action_points || 0) < 1) {
      return res.status(400).json({ error: 'Cần tối thiểu 1 AP để kích hoạt đặc quyền!' });
    }

    character.action_points -= 1;
    const history = character.history_log || [];
    let message = '';

    if (perk_type === 'stock_trading') {
      const isProfit = getRandom() < 0.70;
      const amount = Math.round(Math.max(2000, (Number(character.cash) || 5000) * 0.25));
      if (isProfit) {
        character.cash = (Number(character.cash) || 0) + amount;
        message = `Lướt sóng cổ phiếu thành công! Nhận thặng dư +${amount.toLocaleString()}.`;
      } else {
        character.cash = Math.max(0, (Number(character.cash) || 0) - Math.round(amount * 0.4));
        message = `Thị trường điều chỉnh nhẹ, cắt lỗ an toàn -${Math.round(amount * 0.4).toLocaleString()}.`;
      }
      awardLifeExp(character, 45, 'Lướt sóng thị trường vốn');
    } else if (perk_type === 'zen_meditation') {
      character.burnout = Math.max(0, (character.burnout || 0) - 45);
      character.vitality = Math.min(character.max_vitality || 100, (character.vitality || 80) + 15);
      character.karma = Math.min(100, (character.karma || 100) + 15);
      message = 'Thiền định siêu việt: Tâm thức thanh lọc tuyệt đối, xóa sạch 45% Stress, hồi phục 15 HP.';
      awardLifeExp(character, 40, 'Thiền định giác ngộ');
    } else if (perk_type === 'vip_networking') {
      character.cash = Math.max(0, (Number(character.cash) || 0) - 1500);
      character.karma = Math.min(100, (character.karma || 100) + 20);
      message = 'Dự tiệc Networking thượng lưu: Gặp gỡ các nhà đầu tư lớn, mở rộng mạng lưới uy tín (+20 Karma).';
      awardLifeExp(character, 50, 'Mạng lưới thượng lưu VIP');
    }

    history.push({
      age: character.age,
      event: `Đặc quyền RPG kích hoạt [${perk_type}]`,
      choice: message
    });
    character.history_log = history;
    await updateCharacter(character.id, character);
    res.json({ success: true, message, character });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/game/tick - Advance simulation
router.post('/tick', async (req, res) => {
  try {
    const { choice_id, interaction_type, type: rawType, interaction_result, advance_only, invested_ap = 0, pledge_id } = req.body;
    const previous_dilemma = advance_only ? null : (req.body.previous_dilemma || getSessionData().currentDilemma);
    let character = await getLivingCharacter(res);
    if (!character) return;
    if (!character) {
      return res.status(400).json({ error: "Không tìm thấy nhân vật đang hoạt động. Vui lòng bắt đầu kiếp sống mới!" });
    }
    if (character.is_deceased) return res.status(409).json({ error: 'Kiếp sống đã kết thúc.' });

    // Annual Pledge Registration (Tâm Nguyện Gieo Mầm Cuối Năm)
    if (pledge_id) {
      character.active_pledge = pledge_id;
      const pledgeNames = {
        pledge_wealth: "📈 Tâm Nguyện Thịnh Vượng (+15% Thu nhập & +10% Lợi tức đầu tư)",
        pledge_wellness: "🧘 Tâm Nguyện An Yên (Kháng 30% Burnout & x2 Dưỡng sinh)",
        pledge_social: "🤝 Tâm Nguyện Nhân Mạch (x2 EXP Quý Nhân & -50% Chi phí giao lưu)"
      };
      character.history_log = character.history_log || [];
      character.history_log.push({
        age: character.age,
        event: "Gieo Mầm Tâm Nguyện Giao Thừa",
        choice: pledgeNames[pledge_id] || pledge_id
      });
    }
    let assets = await getAssets(character.id);
    let relationships = await getRelationships(character.id);
    let npcs = await getNpcs(character.id);

    let lastChoiceOutcome = null;

    // 0. Active Phase - Support Non-Binary Interactions & Quick Time Skip
    if (previous_dilemma || interaction_type === "TIME_SKIP" || rawType === "TIME_SKIP") {
      const type = interaction_type || rawType || previous_dilemma?.interaction_type || "STANDARD";
      const historyLog = character.history_log || [];

      // Update anti-loop tag memory and experienced once-in-a-lifetime events
      if (previous_dilemma) {
        recordExperiencedScenario(character, previous_dilemma);
      }

      if (type === "SPECTRUM") {
        const val = typeof interaction_result?.slider_value === 'number' ? interaction_result.slider_value : 50;
        const workRatio = val / 100;
        const familyRatio = 1 - workRatio;

        const cashGained = Math.round(workRatio * 35000);
        const burnoutGained = Math.round(workRatio * 30) - 5;
        const vitalityLoss = Math.round(workRatio * 15);

        character.cash = Number(character.cash) + cashGained;
        character.burnout = Math.max(0, Math.min(100, character.burnout + burnoutGained));
        character.vitality = Math.max(10, character.vitality - vitalityLoss);

        lastChoiceOutcome = `Đánh đổi phân bổ: ${Math.round(workRatio * 100)}% Phải / ${Math.round(familyRatio * 100)}% Trái`;
        historyLog.push({
          age: character.age,
          event: previous_dilemma.title,
          choice: lastChoiceOutcome
        });
      } else if (type === "ILLUSION") {
        const strategyId = choice_id || interaction_result?.strategy_id || (interaction_result?.acknowledged ? "endure" : "pivot");

        if (strategyId === "fight") {
          // Aggressive / Assertive Counter Strategy
          const statPower = (character.vitality || 50) + (character.karma || 0) + (character.rpg_skills?.length || 0) * 10;
          const isSuccess = statPower >= 75 || getRandom() < 0.60;

          if (isSuccess) {
            const salvageCash = Math.round(Math.max(2000, character.cash) * 0.10);
            character.cash += salvageCash;
            character.karma = Math.min(100, character.karma + 15);
            character.rpg_exp = (character.rpg_exp || 0) + 25;
            if (!character.hidden_flags) character.hidden_flags = [];
            character.hidden_flags.push("courageous_fighter");
            lastChoiceOutcome = `Quyết liệt đấu tranh: Bạn dũng cảm đối diện nghịch cảnh, đòi lại công bằng danh dự (+${salvageCash.toLocaleString('vi-VN')}₫, +25 EXP RPG, +15 Karma).`;
          } else {
            const legalLoss = Math.round(Math.max(4000, character.cash) * 0.18);
            character.cash = Math.max(0, character.cash - legalLoss);
            character.vitality = Math.max(10, character.vitality - 5);
            character.karma = Math.min(100, character.karma + 10);
            lastChoiceOutcome = `Quyết liệt đấu tranh: Dù tốn phí tổn đối đầu (-${legalLoss.toLocaleString('vi-VN')}₫), bạn đã tôi luyện ý chí kiên định (+10 Karma).`;
          }
        } else if (strategyId === "pivot") {
          // Adaptive Pivot Strategy: Turn crisis into catalyst
          const pivotCost = Math.round(Math.max(2000, character.cash) * 0.08);
          character.cash = Math.max(0, character.cash - pivotCost);
          character.vitality = Math.max(10, character.vitality - 8);
          character.burnout = Math.min(100, (character.burnout || 0) + 8);
          character.rpg_exp = (character.rpg_exp || 0) + 35;
          if (!character.hidden_flags) character.hidden_flags = [];
          character.hidden_flags.push("crisis_pivot_survivor");
          lastChoiceOutcome = `Thích ứng & Đổi mới: Bạn thần tốc đổi hướng, biến nghịch cảnh thành bàn đạp để nâng cấp kỹ năng (+35 EXP RPG, mở khóa Sinh Tồn Nghịch Cảnh).`;
        } else {
          // Endure / Preserve Strength Strategy
          const drain = previous_dilemma.illusion_data?.drain_ratio || 0.15;
          const lossAmount = Math.round(Math.max(3000, character.cash) * drain);
          character.cash = Math.max(0, character.cash - lossAmount);
          const karmaReward = previous_dilemma.illusion_data?.karma_gain || 25;
          character.karma = Math.min(100, character.karma + karmaReward);
          lastChoiceOutcome = previous_dilemma.illusion_data?.button_text ? 
            `${previous_dilemma.illusion_data.button_text} (+${karmaReward} Karma)` : 
            `Nhẫn nhịn bảo toàn lực lượng, tích lũy bài học kinh nghiệm sâu sắc (+${karmaReward} Karma).`;
        }

        historyLog.push({
          age: character.age,
          event: previous_dilemma.title,
          choice: lastChoiceOutcome
        });
      } else if (type === "TRILEMMA" && previous_dilemma.trilemma_options) {
        const chosenId = choice_id || interaction_result?.choice_id || "TRI_A";
        const selected = previous_dilemma.trilemma_options.find(o => o.id === chosenId) || previous_dilemma.trilemma_options[0];
        let effects = { ...(selected.effects || {}) };
        const invested = Math.floor(Math.max(0, Number(invested_ap) || 0));
        let actualInvested = 0;
        if (invested > 0 && character.action_points >= invested) {
          actualInvested = invested;
          character.action_points -= actualInvested;
          if (effects.cash_delta && effects.cash_delta > 0) effects.cash_delta = Math.round(effects.cash_delta * (1 + 0.25 * actualInvested));
          if (effects.karma_delta && effects.karma_delta > 0) effects.karma_delta = Math.round(effects.karma_delta * (1 + 0.3 * actualInvested));
          if (effects.vitality_delta && effects.vitality_delta < 0) effects.vitality_delta = Math.round(effects.vitality_delta * 0.5);
          if (effects.burnout_delta && effects.burnout_delta > 0) effects.burnout_delta = Math.round(effects.burnout_delta * 0.5);
        }

        character.cash = Number(character.cash) + Number(effects.cash_delta || 0);
        character.vitality = Math.max(10, Math.min(100, character.vitality + Number(effects.vitality_delta || 0)));
        character.burnout = Math.max(0, Math.min(100, character.burnout + Number(effects.burnout_delta || 0)));
        character.karma = Math.max(0, Math.min(100, character.karma + Number(effects.karma_delta || 0)));

        if (effects.new_city) character.current_city = effects.new_city;
        if (effects.new_housing) character.housing = effects.new_housing;
        if (effects.occupation) character.occupation = effects.occupation;
        if (effects.flags) {
          const flagSet = new Set(character.hidden_flags || []);
          effects.flags.forEach(f => flagSet.add(f));
          character.hidden_flags = Array.from(flagSet);
        }
        if (effects.delayed_domino) {
          if (!Array.isArray(character.delayed_flags)) character.delayed_flags = [];
          character.delayed_flags.push({
            ...effects.delayed_domino,
            trigger_at_age: (character.age || 20) + (effects.delayed_domino.in_years || 2)
          });
        }

        lastChoiceOutcome = selected.action_title;
        const logEntry = {
          age: character.age,
          event: previous_dilemma.title,
          choice: lastChoiceOutcome
        };
        if (actualInvested > 0) {
          logEntry.note = `Nhờ đầu tư ${actualInvested} AP chuẩn bị kỹ lưỡng, bạn đã gia tăng tỷ lệ thành công và hạn chế tối đa rủi ro.`;
          logEntry.choice = `${lastChoiceOutcome} (⚡ Trợ lực +${actualInvested} AP)`;
        }
        historyLog.push(logEntry);
        if (actualInvested > 0) {
          historyLog.push({
            age: character.age,
            event: `[Trợ Lực Chiến Lược] ${previous_dilemma.title}`,
            choice: `Nhờ đầu tư ${actualInvested} AP chuẩn bị kỹ lưỡng, bạn đã gia tăng tỷ lệ thành công và hạn chế tối đa rủi ro.`
          });
        }
      } else if (type === "TIME_SKIP") {
        const skip = (previous_dilemma && previous_dilemma.time_skip_data) ? previous_dilemma.time_skip_data : {
          years_jump: 3,
          yearly_income_save: Math.max(2000, (character.occupation && character.occupation !== 'Lao động tự do' ? 5000 : 2500)),
          burnout_decay: 25
        };
        const strategy = interaction_result?.strategy || 'accumulate';
        const yearsJump = skip.years_jump || 3;
        character.age += yearsJump - 1; // 1 will be added in passive phase

        const isInfant = character.age < 6;
        const isMinor = character.age < 18;

        if (isInfant) {
          if (strategy === 'relax') {
            character.karma = Math.min(100, (character.karma || 100) + 15);
            character.burnout = 0;
            lastChoiceOutcome = `Trôi qua ${yearsJump} năm tuổi thơ ấm áp trong tình yêu thương của cha mẹ (+15 Karma)`;
          } else {
            character.vitality = Math.min(character.max_vitality || 100, (character.vitality || 80) + 15);
            character.max_vitality = Math.min(100, (character.max_vitality || 90) + 3);
            lastChoiceOutcome = `Ăn ngoan ngủ đẫy giấc suốt ${yearsJump} năm đầu đời, lớn nhanh như thổi (+15 Sinh lực, +3 Max HP)`;
          }
        } else if (isMinor) {
          if (strategy === 'relax') {
            character.vitality = Math.min(character.max_vitality || 100, (character.vitality || 80) + 15);
            character.burnout = Math.max(0, (character.burnout || 0) - 35);
            character.karma = Math.min(100, (character.karma || 100) + 10);
            lastChoiceOutcome = `Tận hưởng ${yearsJump} năm học trò năng động bên bạn bè trang lứa (+15 Sinh lực, -35 Stress)`;
          } else {
            character.karma = Math.min(100, (character.karma || 100) + 15);
            character.burnout = Math.max(0, (character.burnout || 0) - 15);
            lastChoiceOutcome = `Chuyên tâm học hành đèn sách suốt ${yearsJump} năm, gặt hái thành tích xuất sắc (+15 Karma tri thức)`;
          }
        } else {
          if (strategy === 'relax') {
            character.burnout = Math.max(0, character.burnout - 40);
            character.vitality = Math.min(character.max_vitality || 100, character.vitality + 15);
            character.karma = Math.min(100, character.karma + 15);
            character.cash += (skip.yearly_income_save || 1500) * yearsJump;
            lastChoiceOutcome = `Dành ${yearsJump} năm tĩnh tâm dưỡng sức, bồi đắp mái ấm (-40 Burnout, +15 Sinh lực)`;
          } else {
            character.cash += (skip.yearly_income_save || 3000) * yearsJump;
            character.burnout = Math.max(0, character.burnout - (skip.burnout_decay || 20));
            lastChoiceOutcome = `Chuyên tâm cày việc và tích lũy chuyên môn (+${((skip.yearly_income_save || 3000) * yearsJump).toLocaleString()} USD)`;
          }
        }

        historyLog.push({
          age: character.age,
          event: (previous_dilemma && previous_dilemma.title) ? previous_dilemma.title : `Tua nhanh thời gian (${yearsJump} năm êm đềm)`,
          choice: lastChoiceOutcome
        });
      } else if (choice_id && previous_dilemma.options) {
        const selectedOption = previous_dilemma.options.find(o => o.id === choice_id);
        if (selectedOption) {
          lastChoiceOutcome = selectedOption.action_title || selectedOption.label || "";
          const costAP = selectedOption.cost_ap ?? 1;
          const invested = Math.floor(Math.max(0, Number(invested_ap) || 0));

          if (character.action_points >= costAP) {
            let actualInvested = 0;
            if (invested > 0 && character.action_points >= (costAP + invested)) {
              actualInvested = invested;
              character.action_points -= actualInvested;
            }

            let effects = { ...(selectedOption.effects || {}) };

            if (actualInvested > 0) {
              if (effects.cash_delta && effects.cash_delta > 0) {
                effects.cash_delta = Math.round(effects.cash_delta * (1 + 0.25 * actualInvested));
              }
              if (effects.karma_delta) {
                if (effects.karma_delta > 0) {
                  effects.karma_delta = Math.round(effects.karma_delta * (1 + 0.3 * actualInvested));
                } else {
                  effects.karma_delta = Math.round(effects.karma_delta * 0.5);
                }
              } else {
                effects.karma_delta = 5 * actualInvested;
              }
              if (effects.vitality_delta && effects.vitality_delta < 0) {
                effects.vitality_delta = Math.round(effects.vitality_delta * 0.5);
              }
              if (effects.burnout_delta && effects.burnout_delta > 0) {
                effects.burnout_delta = Math.round(effects.burnout_delta * 0.5);
              }
            }

            character.cash = Number(character.cash) + Number(effects.cash_delta || 0);
            character.burnout = Math.max(0, Math.min(100, Number(character.burnout) + Number(effects.burnout_delta || 0)));
            character.karma = Math.max(0, Math.min(100, Number(character.karma) + Number(effects.karma_delta || 0)));
            character.action_points -= costAP;

            const curMax = calculateMaxVitality(character.age, character.transhuman_frozen_until_age);
            character.vitality = Math.max(0, Math.min(curMax, Number(character.vitality) + Number(effects.vitality_delta || 0)));

            const flagSet = new Set(character.hidden_flags || []);
            if (effects.add_flags) effects.add_flags.forEach(f => flagSet.add(f));
            if (effects.remove_flags) effects.remove_flags.forEach(f => flagSet.delete(f));
            if (effects.flags) effects.flags.forEach(f => flagSet.add(f));
            character.hidden_flags = Array.from(flagSet);

            if (effects.new_city) character.current_city = effects.new_city;
            if (effects.new_housing) character.housing = effects.new_housing;
            if (effects.occupation) character.occupation = effects.occupation;
            if (effects.delayed_domino) {
              if (!Array.isArray(character.delayed_flags)) character.delayed_flags = [];
              character.delayed_flags.push({
                ...effects.delayed_domino,
                trigger_at_age: (character.age || 20) + (effects.delayed_domino.in_years || 2)
              });
            }

            const choiceTitle = selectedOption.action_title || selectedOption.label;
            const logEntry = {
              age: character.age,
              event: previous_dilemma.title,
              choice: choiceTitle
            };
            if (actualInvested > 0) {
              logEntry.note = `Nhờ đầu tư ${actualInvested} AP chuẩn bị kỹ lưỡng, bạn đã gia tăng tỷ lệ thành công và hạn chế tối đa rủi ro.`;
              logEntry.choice = `${choiceTitle} (⚡ Trợ lực +${actualInvested} AP)`;
            }
            historyLog.push(logEntry);
            if (actualInvested > 0) {
              historyLog.push({
                age: character.age,
                event: `[Trợ Lực Chiến Lược] ${previous_dilemma.title}`,
                choice: `Nhờ đầu tư ${actualInvested} AP chuẩn bị kỹ lưỡng, bạn đã gia tăng tỷ lệ thành công và hạn chế tối đa rủi ro.`
              });
            }
          }
        }
      }

      character.history_log = historyLog;
      // Record resolved dilemma in anti-loop engine and update recent tags
      if (previous_dilemma) {
        recordExperiencedScenario(character, previous_dilemma);
      }
    }

    // Check Domino Fuses (Delayed time-bomb flags & story milestones)
    const { triggered: dominoTriggered, remaining: dominoRemaining } = checkDelayedDominoFuses(character);
    let delayedMilestoneMessages = [];
    if (dominoTriggered.length > 0) {
      character.delayed_flags = dominoRemaining;
      dominoTriggered.forEach(d => {
        if (d.flag && !character.hidden_flags.includes(d.flag)) character.hidden_flags.push(d.flag);
        if (d.cash_delta) {
          character.cash = Math.max(0, Number(character.cash || 0) + Number(d.cash_delta));
        }
        if (d.vitality_delta) {
          const curMax = calculateMaxVitality(character.age, character.transhuman_frozen_until_age);
          character.vitality = Math.max(10, Math.min(curMax, (character.vitality || 80) + Number(d.vitality_delta)));
        }
        if (d.burnout_delta) {
          character.burnout = Math.max(0, Math.min(100, (character.burnout || 0) + Number(d.burnout_delta)));
        }
        if (d.karma_delta) {
          character.karma = Math.max(0, Math.min(100, (character.karma || 80) + Number(d.karma_delta)));
        }
        if (d.occupation) {
          character.occupation = d.occupation;
        }

        const msg = d.milestone_summary || d.title || `Cột mốc định mệnh: ${d.flag}`;
        delayedMilestoneMessages.push(msg);

        if (!Array.isArray(character.history_log)) character.history_log = [];
        character.history_log.push({
          age: character.age,
          event: `[Cột Mốc Chín Muồi] ${d.title || 'Quả Báo/Trái Ngọt'}`,
          choice: d.milestone_summary || 'Thời gian đã trả lời cho lựa chọn năm xưa.'
        });
      });
    }

    // 1. Passive Phase
    const { updatedCharacter, passiveSummary } = await processPassivePhase(character, assets, relationships);
    character = updatedCharacter;
    if (character.household) {
      character.household.family_meals_available = 1;
    }

    // Award annual life EXP for living another year
    awardLifeExp(character, 100, `Trải nghiệm sống tuổi ${character.age}`);

    // Tự động giải ngân quỹ bảo trợ gia đình khi tròn 18 tuổi
    if (character.age >= 18 && Number(character.family_endowment ?? 0) > 0) {
      const endowment = Number(character.family_endowment || 0);
      character.cash = Number(character.cash || 0) + endowment;
      character.family_endowment = 0;
      const history = character.history_log || [];
      history.push({
        age: 18,
        event: "Cột Mốc Tuổi 18: Chính Thức Trưởng Thành & Độc Lập Tài Chính",
        choice: `Tiếp nhận toàn bộ khoản tiền bảo trợ gia đình tích lũy ($${endowment.toLocaleString()}) để tự do quyết định tương lai.`
      });
      character.history_log = history;
    }

    // Tự động ghi nhật ký biến cố gia đình & thần đồng tuổi thơ
    if (passiveSummary?.annual_digest?.childhood_event) {
      const chEvent = passiveSummary.annual_digest.childhood_event;
      const history = character.history_log || [];
      history.push({
        age: character.age,
        event: chEvent.title,
        choice: chEvent.narrative
      });
      character.history_log = history;
    }

    // Tự động ghi nhật ký biến cố vĩ mô ngẫu nhiên (Quyết định 3)
    if (passiveSummary?.macroShockNotice) {
      const history = character.history_log || [];
      history.push({
        age: character.age,
        event: "Biến Cố Vĩ Mô Thời Cuộc",
        choice: passiveSummary.macroShockNotice
      });
      character.history_log = history;
    }

    // Check if character died during passive phase or Reaper roll
    if (character.is_deceased) {
      await updateCharacter(character.id, character);
      // Transfer accumulated karma to eternal player_account (Doubled if Giác Ngộ Niết Bàn)
      const hasTranscendence = (character.unlocked_skills || []).includes("transcendence_sage");
      const karmaMultiplier = hasTranscendence ? 2 : 1;
      const karmaTransferred = Math.round((character.karma || 50) * karmaMultiplier);
      await addTotalKarma(karmaTransferred);
      const account = await getPlayerAccount();
      await updatePlayerAccount({
        lifetime_stats: {
          total_years_lived: (account.lifetime_stats?.total_years_lived || 0) + character.age,
          max_net_worth: Math.max(account.lifetime_stats?.max_net_worth || 0, (Number(character.cash) || 0)),
          total_deaths: (account.lifetime_stats?.total_deaths || 0) + 1
        }
      });

      const visuals = generateCharacterVisuals(character, assets);
      const children = relationships.filter(r => r.type === 'child');

      return res.json({
        success: true,
        character,
        visuals,
        is_game_over: true,
        death_cause: character.death_cause,
        death_age: character.death_age || character.age,
        has_children: children.length > 0,
        children,
        assets,
        relationships,
        npcs,
        dilemma: null,
        player_account: await getPlayerAccount(),
        passiveSummary
      });
    }

    evaluateCommitments(character, npcs);
    for (const npc of npcs) await updateNpc(npc.id, npc);
    resetAnnualActions(character);
    const incomingNpcEvent = evaluateIncomingNpcEvent(character, relationships);

    // 2. Check Long-term NPC Memory Arcs
    const npcArc = evaluateNpcLongTermArc(character, npcs);
    let dilemma = null;

    if (npcArc && getRandom() < 0.40) {
      dilemma = {
        ...npcArc,
        has_npc_interaction: true,
        active_npc: npcArc.npc
      };
    } else {
      // 3. Compile System Prompt & AI Generation
      const systemPrompt = compileSystemPrompt(character, assets, relationships, lastChoiceOutcome);
      dilemma = await generateDilemma(systemPrompt, character, assets, relationships);
    }

    getSessionData().currentDilemma = dilemma;

    // 4. Cache & Save
    await cacheTickEvent(character.id, character.age, dilemma);
    await updateCharacter(character.id, character);

    const visuals = generateCharacterVisuals(character, assets);
    const totalAssets = assets.reduce((sum, a) => sum + Number(a.current_value || 0), 0);
    const netWorth = (Number(character.cash) || 0) + totalAssets;
    const aspiration = evaluateAspirationProgress(character, assets, relationships);

    res.json({
      success: true,
      character,
      visuals,
      assets,
      relationships,
      npcs,
      dilemma,
      net_worth: netWorth,
      can_transhuman: character.age > 60 && netWorth > 15000000 && !character.is_transhuman,
      player_account: await getPlayerAccount(),
      passiveSummary,
      aspiration,
      scenario: getCurrentScenarioForCharacter(character),
      incoming_npc_event: incomingNpcEvent,
      breakthrough_action: getBreakthroughForAge(character.age),
      delayed_milestones: delayedMilestoneMessages
    });
  } catch (err) {
    console.error('Error during tick:', err);
    res.status(500).json({ error: 'Tick execution failed', message: err.message });
  }
});

// POST /api/game/reset
router.post('/reset', async (req, res) => {
  try {
    const { character, assets, relationships, npcs, player_account } = await startNewRebirthGame();
    const prompt = compileSystemPrompt(character, assets, relationships);
    getSessionData().currentDilemma = await generateDilemma(prompt, character, assets, relationships);
    await cacheTickEvent(character.id, character.age, getSessionData().currentDilemma);

    const visuals = generateCharacterVisuals(character, assets);

    res.json({
      success: true,
      character,
      player_account,
      visuals,
      assets,
      relationships,
      npcs,
      dilemma: getSessionData().currentDilemma,
      scenario: getCurrentScenarioForCharacter(character)
    });
  } catch (err) {
    console.error('Reset failed:', err);
    res.status(500).json({ error: 'Reset failed', message: err.message });
  }
});


// =========================================================================
// 2D INTERACTIVE SCENARIO & MIND STAGE ROUTES
// =========================================================================

async function scenarioNpcs(character, scenario) {
  const npcs = await getNpcs(character.id);
  for (const scene of scenario?.scenes ?? []) for (const hotspot of scene.hotspots) {
    if (!hotspot.npc_role || !hotspot.dialogue?.speaker) continue;
    if (!npcs.some(n => n.scenario_key === hotspot.id || n.name === hotspot.dialogue.speaker)) {
      npcs.push(await addNpc({ character_id: character.id, name: hotspot.dialogue.speaker,
        role: hotspot.npc_role, scenario_key: hotspot.id, status: 'alive', affinity: 50, trust: 50 }));
    }
  }
  return npcs;
}

router.get('/scenario/current', async (req, res) => {
  try {
    const character = await getLatestCharacter();
    if (!character) return res.status(400).json({ error: 'Không có nhân vật.' });
    const scenario = getCurrentScenarioForCharacter(character);
    const npcs = await getNpcs(character.id);
    const scene = scenario?.scenes.find(s => s.id === character.current_scene_id) ?? scenario?.scenes[0];
    res.json({ success: true, scenario, current_scene_id: scene?.id ?? null,
      knowledge_base: character.knowledge_base ?? [], commitments: character.commitments ?? [],
      action_points: character.action_points ?? 3, npcs,
      next_scenario_age: getNextScenarioAge(character),
      last_resolution: Object.values(character.scenario_resolutions ?? {}).at(-1) ?? null });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.post('/scenario/interact', async (req, res) => {
  try {
    const character = await getLatestCharacter();
    const npcs = await scenarioNpcs(character, getCurrentScenarioForCharacter(character));
    const result = interactWithHotspot(character, req.body.scene_id, req.body.hotspot_id, npcs);
    if (result.affected_npc) await updateNpc(result.affected_npc.id, result.affected_npc);
    await updateCharacter(character.id, character);
    res.json(result);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.post('/scenario/resolve-mindstage', async (req, res) => {
  try {
    const character = await getLatestCharacter();
    if (!character) return res.status(400).json({ error: "Không tìm thấy nhân vật." });
    const npcs = await scenarioNpcs(character, getCurrentScenarioForCharacter(character));
    const result = resolveMindStageChoice(
      character,
      req.body.choice_id,
      req.body.ap_investment ?? 0,
      npcs,
      req.body.safeguard_term ?? 'standard',
      req.body.scenario_id
    );
    for (const npc of result.npc_updates ?? []) await updateNpc(npc.id, npc);
    await updateCharacter(character.id, character);
    res.json(result);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.post('/scenario/commitment', async (req, res) => {
  try {
    const character = await getLatestCharacter();
    if (!character || character.is_deceased) return res.status(400).json({ error: 'Không có kiếp sống đang hoạt động.' });
    const npcs = await getNpcs(character.id);
    const result = fulfillCommitment(character, req.body.commitment_id, npcs);
    for (const npc of result.npc_updates ?? []) await updateNpc(npc.id, npc);
    await updateCharacter(character.id, character);
    res.json({ ...result, commitments: character.commitments, character_state: {
      action_points: character.action_points, karma: character.karma } });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.post('/scenario/transition', async (req, res) => {
  try {
    const character = await getLatestCharacter();
    const scenario = getCurrentScenarioForCharacter(character);
    if (!scenario?.scenes.some(s => s.id === req.body.scene_id)) throw new Error('Cảnh không thuộc kịch bản hiện tại.');
    character.current_scene_id = req.body.scene_id;
    await updateCharacter(character.id, character);
    res.json({ success: true, current_scene_id: character.current_scene_id });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

export default router;
