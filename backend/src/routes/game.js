import express from 'express';
import {
  getLatestCharacter,
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
  addAncestralMemorial
} from '../db/db.js';
import { processPassivePhase, calculateMaxVitality } from '../engine/tickEngine.js';
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
  SKILL_DEFINITIONS,
  getExamMinigameType,
  checkGeneticAffinity,
  getTuitionFee
} from '../engine/skillEngine.js';

const router = express.Router();
let currentDilemma = null;

// GET /api/game/diagnostic
router.get('/diagnostic', async (req, res) => {
  try {
    const character = await getLatestCharacter();
    const account = await getPlayerAccount();
    res.json({
      status: 'online',
      version: 'v6.0-ultimate-narrative',
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
    const isStaleDilemma = currentDilemma && (
      (currentDilemma.id === 'ill_parent_passing' && character.age >= 60) ||
      (currentDilemma.min_age && character.age < currentDilemma.min_age) ||
      (currentDilemma.max_age && character.age > currentDilemma.max_age)
    );

    if ((!currentDilemma || isStaleDilemma) && !character.is_deceased) {
      const prompt = compileSystemPrompt(character, assets, relationships);
      currentDilemma = await generateDilemma(prompt, character, assets, relationships);
      await cacheTickEvent(character.id, character.age, currentDilemma);
    }

    const visuals = generateCharacterVisuals(character, assets);

    // Can access Transhumanism surgery?
    const canTranshuman = character.age > 60 && netWorth > 15000000 && !character.is_transhuman;

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
      dilemma: currentDilemma,
      net_worth: netWorth,
      can_transhuman: canTranshuman,
      aspiration
    });
  } catch (err) {
    console.error('Error fetching game state:', err);
    res.status(500).json({ error: 'Failed to fetch game state', message: err.message });
  }
});

// POST /api/game/start - Procedural Rebirth from Age 0
router.post('/start', async (req, res) => {
  try {
    const { karma_perks = {}, lineage_parent_id = null, starter_pack = 'standard' } = req.body;

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
    const { milestone_choices = [], target_age = 18 } = req.body;
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

    const finalAge = Math.max(6, Math.min(18, Number(target_age) || 18));
    character.age = finalAge;
    character.max_vitality = calculateMaxVitality(finalAge);
    character.hidden_flags = Array.from(flagSet);
    character.personality_flags = Array.from(personalitySet);
    character.history_log = history;

    if (finalAge >= 18) {
      // UNLOCK PERSONAL CASH AT AGE 18!
      character.cash = Number(character.family_endowment || 0);
      character.family_endowment = 0;
    } else {
      // Retain family endowment safely until age 18, provide living allowance
      character.cash = Math.max(150, character.household?.annual_allowance || 200);
    }

    await updateCharacter(character.id, character);

    // Generate dilemma matching new age
    const prompt = compileSystemPrompt(character, assets, relationships);
    currentDilemma = await generateDilemma(prompt, character, assets, relationships);
    await cacheTickEvent(character.id, character.age, currentDilemma);

    const visuals = generateCharacterVisuals(character, assets);

    res.json({
      success: true,
      character,
      visuals,
      assets,
      relationships,
      npcs,
      dilemma: currentDilemma
    });
  } catch (err) {
    console.error('Childhood fastforward error:', err);
    res.status(500).json({ error: 'Fastforward failed', message: err.message });
  }
});

// POST /api/game/rebirth - Direct Rebirth Execution & State Synchronization
router.post('/rebirth', async (req, res) => {
  try {
    const { karma_perks = {}, lineage_parent_id = null, character: directChar } = req.body;
    
    // If client already fast-forwarded and sent the complete new character, sync and return
    if (directChar && directChar.id) {
      await updateCharacter(directChar.id, directChar);
      const assets = await getAssets(directChar.id);
      const relationships = await getRelationships(directChar.id);
      const npcs = await getNpcs(directChar.id);
      const visuals = generateCharacterVisuals(directChar, assets);
      const account = await getPlayerAccount();
      
      const prompt = compileSystemPrompt(directChar, assets, relationships);
      currentDilemma = await generateDilemma(prompt, directChar, assets, relationships);
      await cacheTickEvent(directChar.id, directChar.age, currentDilemma);

      return res.json({
        success: true,
        character: directChar,
        player_account: account,
        visuals,
        assets,
        relationships,
        npcs,
        dilemma: currentDilemma
      });
    }

    // Otherwise, perform fresh rebirth
    let lineageParent = null;
    if (lineage_parent_id) {
      const char = await getLatestCharacter();
      if (char && char.id === lineage_parent_id) lineageParent = char;
    }

    const { character, assets, relationships, npcs, player_account } = await startNewRebirthGame(karma_perks, lineageParent);
    const visuals = generateCharacterVisuals(character, assets);
    const prompt = compileSystemPrompt(character, assets, relationships);
    currentDilemma = await generateDilemma(prompt, character, assets, relationships);
    await cacheTickEvent(character.id, character.age, currentDilemma);

    res.json({
      success: true,
      character,
      player_account,
      visuals,
      assets,
      relationships,
      npcs,
      dilemma: currentDilemma
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

    let parentAssets = await getAssets(parent.id);
    let parentRelationships = await getRelationships(parent.id);
    let parentNpcs = await getNpcs(parent.id);

    // Find chosen child or first living child
    let childRecord = (parentRelationships || []).find(r => r.id === child_id && r.type === 'child');
    if (!childRecord) {
      childRecord = (parentRelationships || []).find(r => r.type === 'child' && r.status !== 'deceased');
    }

    const childName = childRecord?.name || "Hậu Duệ Thừa Kế";
    const childAge = typeof childRecord?.age === 'number' ? childRecord.age : 0;

    // 1. Calculate 30% Inheritance Tax (V7.5 Specification)
    const totalAssetValue = parentAssets.reduce((sum, a) => sum + Number(a.current_value || 0), 0);
    const parentNetWorth = Math.max(0, (Number(parent.cash) || 0) + totalAssetValue);
    const estateTax = Math.round(parentNetWorth * 0.30);
    const inheritedNetWorth = Math.max(1000, parentNetWorth - estateTax);

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
      gender: childRecord?.gender || (Math.random() > 0.5 ? "Nam" : "Nữ"),
      nationality: parent.nationality || "Việt Nam",
      country_tier: parent.country_tier || "Tier 2",
      background: `Hậu duệ gia tộc thế hệ ${generation} (Thừa kế từ ${parent.name})`,
      background_type: inheritedNetWorth > 500000 ? "super_rich" : "middle_class",
      age: childAge,
      vitality: 95,
      max_vitality: calculateMaxVitality(childAge),
      // Cash locked in family_endowment until age 18 if minor
      cash: isAdult ? inheritedNetWorth : 0,
      family_endowment: isAdult ? 0 : inheritedNetWorth,
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
          choice: `Kế thừa $${inheritedNetWorth.toLocaleString()} sau khi nộp 30% Thuế Thừa Kế ($${estateTax.toLocaleString()}).`
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
        id: crypto.randomUUID(),
        character_id: newCharacter.id,
        name: `${asset.name} (Thừa kế đời ${generation})`,
        type: asset.type,
        buy_price: discountedValue,
        current_value: discountedValue,
        annual_cash_flow: Math.round(Number(asset.annual_cash_flow || 0) * 0.70),
        maintenance_cost: Number(asset.maintenance_cost || 0),
        age_acquired: childAge
      };
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
    currentDilemma = await generateDilemma(prompt, newCharacter, childAssets, childRelationships);
    await cacheTickEvent(newCharacter.id, newCharacter.age, currentDilemma);

    res.json({
      success: true,
      character: newCharacter,
      visuals,
      assets: childAssets,
      relationships: childRelationships,
      npcs: inheritedNpcs,
      childhood_milestones: milestones,
      dilemma: currentDilemma,
      player_account: await getPlayerAccount(),
      inheritance_summary: {
        parent_name: parent.name,
        generation,
        estate_tax: estateTax,
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
    const failureRoll = Math.random();

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
    let character = await getLatestCharacter();

    if ((Number(character.age) || 0) < 18) {
      return res.status(400).json({
        error: `Chưa đủ 18 tuổi (${character.age} tuổi)! Bạn chưa có tư cách pháp nhân để tự ý giao dịch sàn tài sản hay đứng tên sở hữu thương mại.`
      });
    }

    const actualType = asset_type || type || 'stocks';
    const actualCostAp = Number(ap_cost || cost_ap || 1);
    const actualMaintenance = Number(maintenance_cost ?? maintenance ?? 0);
    const actualCashFlow = Number(annual_cash_flow || cash_flow || 0);

    const financeLevel = character.skills?.finance_market?.level || 0;
    const discountRate = financeLevel === 1 ? 0.10 : financeLevel === 2 ? 0.20 : financeLevel >= 3 ? 0.25 : 0;
    const finalCost = Math.round(cost * (1 - discountRate));

    if ((character.action_points || 0) < actualCostAp) {
      return res.status(400).json({ error: "Không đủ Điểm Hành Động (AP)!" });
    }
    if ((Number(character.cash) || 0) < finalCost) {
      return res.status(400).json({ error: `Không đủ tiền mặt! Cần $${finalCost.toLocaleString()} (Hiện có $${(Number(character.cash) || 0).toLocaleString()}).` });
    }

    character.action_points -= actualCostAp;
    character.cash -= finalCost;

    const newAsset = await addAsset({
      character_id: character.id,
      type: actualType,
      name,
      current_value: cost, // Keeps intrinsic asset value!
      liquidity_status: actualType === 'stock' || actualType === 'stocks' || actualType === 'gold' ? 'liquid' : 'illiquid',
      maintenance_cost_per_tick: actualMaintenance,
      maintenance_cost: actualMaintenance,
      annual_cash_flow: actualCashFlow
    });

    const discountNote = discountRate > 0 ? ` (Được chiết khấu ${(discountRate * 100).toFixed(0)}% nhờ Kỹ Năng Tài Chính Cấp ${financeLevel})` : '';
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
    let character = await getLatestCharacter();

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
router.post('/action/childhood', async (req, res) => {
  try {
    const { action_id } = req.body;
    let character = await getLatestCharacter();
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
    }
    // Hành động bẩm sinh / thần đồng (Prodigy actions)
    else if (action_id === 'prodigy_trade') {
      const earnings = 60;
      character.cash = (Number(character.cash) || 0) + earnings;
      flags.add("young_entrepreneur");
      feedback = `Trổ tài buôn bán truyện tranh cũ và đồ chơi! Thu về +$${earnings} tiền túi, nhận cờ 'Thương Nhân Nhí'.`;
    } else if (action_id === 'prodigy_math') {
      character.karma = Math.min(100, (character.karma || 100) + 18);
      flags.add("math_prodigy");
      feedback = "Giải đề thi cờ thế và toán học nâng cao! Nhận học bổng khen thưởng tuổi thơ (+18 Karma).";
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
router.post('/action/custom-resolve', async (req, res) => {
  try {
    const { user_action_text, cost_ap = 1 } = req.body;
    let character = await getLatestCharacter();
    if (!character) return res.status(404).json({ error: "Không tìm thấy nhân vật!" });

    if ((character.action_points || 0) < cost_ap) {
      return res.status(400).json({ error: "Không đủ Điểm Hành Động (AP) để thực hiện quyết định này!" });
    }

    const resolution = await resolveCustomAction({
      character,
      dilemma: currentDilemma,
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
    let character = await getLatestCharacter();
    let assets = await getAssets(character.id);

    if ((character.action_points || 0) < cost_ap) {
      return res.status(400).json({ error: "Không đủ Điểm Hành Động (AP)!" });
    }

    const targetAsset = assets.find(a => a.id === asset_id);
    if (!targetAsset) {
      return res.status(404).json({ error: "Không tìm thấy tài sản trong danh mục!" });
    }

    const saleAmount = Number(targetAsset.current_value) || 0;
    character.action_points -= cost_ap;
    character.cash = (Number(character.cash) || 0) + saleAmount;

    await deleteAsset(asset_id);

    const history = character.history_log || [];
    history.push({
      age: character.age,
      event: `Thanh lý tài sản: ${targetAsset.name}`,
      choice: `Thu về $${saleAmount.toLocaleString()} tiền mặt (Tốn ${cost_ap} AP)`
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
    let character = await getLatestCharacter();
    let relationships = await getRelationships(character.id);
    const history = character.history_log || [];

    if (action_type === 'date') {
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
        const partnerAge = Math.max(18, (character.age || 18) + (Math.floor(Math.random() * 5) - 2));
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
        const partnerAge = Math.max(18, (character.age || 18) + (Math.floor(Math.random() * 5) - 2));
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
      const costAP = 2;
      const costCash = 8000;
      if (character.action_points < costAP || character.cash < costCash) {
        return res.status(400).json({ error: "Cần tối thiểu 2 AP và $8.000 để chăm sóc thai kỳ & đón con chào đời!" });
      }

      // Kế thừa Họ cha theo tập tục văn hóa từng quốc gia
      const fatherFullName = character.gender === 'male' ? character.name : (relationships.find(r => r.type === 'spouse')?.name || character.name);
      const fatherSurname = extractFamilySurname(fatherFullName, character.nationality);
      const childGender = Math.random() < 0.5 ? 'male' : 'female';
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

    if (action_type === 'family_meal') {
      if (!character.household || character.household.parents_status === 'deceased_or_abandoned' || character.household.parents_status === 'deceased') {
        return res.status(400).json({ error: "Cha mẹ đã khuất núi, không còn bữa cơm sum vầy gia đình." });
      }
      if (character.household.family_meals_available === 0) {
        return res.status(400).json({ error: "Năm nay bạn đã dùng bữa cơm gia đình rồi. Hãy đợi sang tuổi tiếp theo!" });
      }

      character.burnout = Math.max(0, (character.burnout || 0) - 15);
      character.karma = Math.min(100, (character.karma || 50) + 5);
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

// POST /api/game/action/wellness
router.post('/action/wellness', async (req, res) => {
  try {
    const action_type = req.body.action_type || req.body.therapy_type || 'meditation_retreat';
    let character = await getLatestCharacter();
    const history = character.history_log || [];
    const healthLevel = character.skills?.resilience_health?.level || 0;
    const bonusVit = healthLevel >= 2 ? (healthLevel === 2 ? 10 : 15) : 0;
    const bonusBurnoutRelief = healthLevel >= 1 ? (healthLevel === 1 ? 5 : healthLevel === 2 ? 15 : 25) : 0;

    if (action_type === 'medical_checkup') {
      const costAP = 1;
      const costCash = 3000;
      if (character.action_points < costAP || character.cash < costCash) {
        return res.status(400).json({ error: "Cần 1 AP và $3.000 để khám tổng quát tại bệnh viện quốc tế!" });
      }

      character.action_points -= costAP;
      character.cash -= costCash;
      const maxV = character.max_vitality || 100;
      const vitGained = 20 + bonusVit;
      const burnoutRelief = 25 + bonusBurnoutRelief;
      character.vitality = Math.min(maxV, character.vitality + vitGained);
      character.burnout = Math.max(0, character.burnout - burnoutRelief);

      const healthPerkMsg = healthLevel > 0 ? ` (Kỹ Năng Sinh Lực Lv${healthLevel} tăng thêm +${bonusVit} HP, -${bonusBurnoutRelief} Burnout)` : '';
      history.push({
        age: character.age,
        event: "Khám sức khỏe tổng quát & Trị liệu dưỡng sinh",
        choice: `Chi $${costCash.toLocaleString()} & ${costAP} AP (+${vitGained} Sinh lực, -${burnoutRelief} Burnout)${healthPerkMsg}`
      });
      character.history_log = history;
      await updateCharacter(character.id, character);

      return res.json({
        success: true,
        message: `Trị liệu y tế phục hồi thể trạng thành công! (+${vitGained} Sinh lực, -${burnoutRelief} Burnout)${healthPerkMsg}`,
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
      const vitGained = 15 + bonusVit;
      const burnoutRelief = 35 + bonusBurnoutRelief;
      character.burnout = Math.max(0, character.burnout - burnoutRelief);
      character.vitality = Math.min(character.max_vitality || 100, character.vitality + vitGained);
      character.karma = Math.min(100, character.karma + 10);

      const healthPerkMsg = healthLevel > 0 ? ` (Kỹ Năng Sinh Lực Lv${healthLevel} tăng thêm +${bonusVit} HP, -${bonusBurnoutRelief} Burnout)` : '';
      history.push({
        age: character.age,
        event: "Khóa tu tĩnh tâm / Du lịch hòa mình vào thiên nhiên",
        choice: `Chi $${costCash.toLocaleString()} & ${costAP} AP (+${vitGained} Sinh lực, -${burnoutRelief} Burnout)${healthPerkMsg}`
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
    let character = await getLatestCharacter();
    const age = typeof character.age === 'number' ? character.age : 25;
    if (age < 18) {
      return res.status(400).json({ error: "Chưa đủ 18 tuổi để tham gia lao động cày việc ngoài luồng!" });
    }
    if (character.action_points < 1) {
      return res.status(400).json({ error: "Cần tối thiểu 1 AP để cày việc kiếm thêm thu nhập!" });
    }

    const techLevel = character.skills?.tech_logic?.level || 0;
    const techMultiplier = 1 + (techLevel * 0.15); // +15% per tech level
    const baseEarned = Math.round(1500 + (age * 120) + (Math.random() * 800));
    const earnedCash = Math.round(baseEarned * techMultiplier);

    const healthLevel = character.skills?.resilience_health?.level || 0;
    const burnoutReduction = healthLevel * 0.2; // 20% burnout reduction per level
    const burnoutGained = Math.max(4, Math.round(12 * (1 - burnoutReduction)));

    character.action_points -= 1;
    character.cash = Number(character.cash) + earnedCash;
    character.burnout = Math.min(100, character.burnout + burnoutGained);
    character.vitality = Math.max(10, character.vitality - (healthLevel >= 2 ? 1 : 3));

    const techBonusNote = techLevel > 0 ? ` (+${techLevel * 15}% nhờ Kỹ Năng Công Nghệ Lv${techLevel})` : '';
    const history = character.history_log || [];
    history.push({
      age: character.age,
      event: "Làm thêm giờ & Nhận dự án ngoài luồng (Overtime Grind)",
      choice: `Tiêu 1 AP: Kiếm thêm +$${earnedCash.toLocaleString()}${techBonusNote}, Burnout +${burnoutGained}`
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
    let character = await getLatestCharacter();
    const costCash = 500;
    if (character.action_points < 1 || character.cash < costCash) {
      return res.status(400).json({ error: "Cần 1 AP và $500 để mua sách và tham gia khóa đào tạo chuyên sâu!" });
    }

    character.action_points -= 1;
    character.cash -= costCash;
    character.burnout = Math.max(0, character.burnout - 10);
    character.karma = Math.min(100, character.karma + 8);

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
    let character = await getLatestCharacter();
    const socialLevel = character.skills?.leadership_social?.level || 0;
    const socialDiscount = socialLevel === 1 ? 0.25 : socialLevel === 2 ? 0.50 : socialLevel >= 3 ? 0.70 : 0;
    const costCash = Math.round(400 * (1 - socialDiscount));

    if (character.action_points < 1 || character.cash < costCash) {
      return res.status(400).json({ error: `Cần 1 AP và $${costCash.toLocaleString()} để mời đối tác cà phê / tham dự sự kiện kết nối!` });
    }

    character.action_points -= 1;
    character.cash -= costCash;
    character.karma = Math.min(100, character.karma + 6);

    const npcs = await getNpcs(character.id);
    let message = "";

    if (npcs.length > 0 && Math.random() < (socialLevel >= 2 ? 0.80 : 0.65)) {
      const targetNpc = npcs[Math.floor(Math.random() * npcs.length)];
      targetNpc.affinity = Math.min(100, (Number(targetNpc.affinity) || 50) + (socialLevel >= 2 ? 22 : 15));
      await updateRelationship(targetNpc.id, { affinity: targetNpc.affinity });
      message = `Gặp gỡ giao lưu cùng ${targetNpc.name}: Tình bằng hữu thêm gắn kết (+${socialLevel >= 2 ? 22 : 15} Thân thiện)!`;
    } else {
      const vipRoles = ["Chủ tịch Tập đoàn Đầu tư", "Giám đốc Quỹ Mạo hiểm", "Quan chức Ban Kinh tế", "Chủ thương hội Quốc tế", "Luật sư danh tiếng"];
      const normalRoles = ["Bằng hữu thương trường", "Đối tác phân phối", "Cố vấn khởi nghiệp", "Chuyên viên tài chính"];
      const rolePool = socialLevel >= 2 ? vipRoles : normalRoles;
      const newContact = {
        character_id: character.id,
        name: ["Nguyễn Hoàng", "Trần Thảo", "Vũ Phong", "Phạm Linh", "Đặng Huy", "David Vance", "Alexander Chen"][Math.floor(Math.random() * 7)],
        role: rolePool[Math.floor(Math.random() * rolePool.length)],
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
    let character = await getLatestCharacter();
    const costCash = 300;
    if (character.action_points < 1 || character.cash < costCash) {
      return res.status(400).json({ error: "Cần 1 AP và $300 để thử vận may mua vé số / đầu cơ lướt sóng!" });
    }

    const financeLevel = character.skills?.finance_market?.level || 0;
    // Finance Level 2+ lowers loss rate from 0.65 to 0.45
    const lossThreshold = financeLevel >= 2 ? 0.45 : financeLevel === 1 ? 0.55 : 0.65;

    character.action_points -= 1;
    character.cash -= costCash;

    const roll = Math.random();
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
    let character = await getLatestCharacter();
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

// POST /api/game/action/minigame-result
router.post('/action/minigame-result', async (req, res) => {
  try {
    const minigame_id = req.body.minigame_id || req.body.minigame_type;
    const outcome = req.body.outcome || req.body.status || 'fair';
    const score = req.body.score || 0;
    let character = await getLatestCharacter();
    const history = character.history_log || [];
    const flags = new Set(character.hidden_flags || []);
    let feedback = "";

    const pendingExam = character.pending_skill_exam;
    const targetSkillId = req.body.skill_id || pendingExam?.skill_id;

    if (pendingExam && (pendingExam.skill_id === targetSkillId || !targetSkillId)) {
      const activeSkillId = pendingExam.skill_id;
      const targetLevel = pendingExam.target_level;
      const def = SKILL_DEFINITIONS[activeSkillId];

      if (outcome === 'success' || outcome === 'fair') {
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

        const karmaGain = outcome === 'success' ? 18 : 10;
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

        feedback = `🎉 THI ĐỖ SÁT HẠCH! Bạn đã chính thức đạt chứng chỉ [${def?.name || activeSkillId} - ${levelCfg?.title || 'Cấp ' + targetLevel}]! Mở khóa vĩnh viễn: ${levelCfg?.perk_title || ''} (+${karmaGain} Karma).`;
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

// POST /api/game/tick - Advance simulation
router.post('/tick', async (req, res) => {
  try {
    const { choice_id, interaction_type, interaction_result, previous_dilemma } = req.body;
    let character = await getLatestCharacter();
    if (!character) {
      return res.status(400).json({ error: "Không tìm thấy nhân vật đang hoạt động. Vui lòng bắt đầu kiếp sống mới!" });
    }
    let assets = await getAssets(character.id);
    let relationships = await getRelationships(character.id);
    let npcs = await getNpcs(character.id);

    let lastChoiceOutcome = null;

    // 0. Active Phase - Support Non-Binary Interactions
    if (previous_dilemma) {
      const type = interaction_type || previous_dilemma.interaction_type || "STANDARD";
      const historyLog = character.history_log || [];

      // Update anti-loop tag memory and experienced once-in-a-lifetime events
      recordExperiencedScenario(character, previous_dilemma);

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
        const drain = previous_dilemma.illusion_data?.drain_ratio || 0.25;
        const lossAmount = Math.round(Math.max(5000, character.cash) * drain);
        character.cash = Math.max(1000, character.cash - lossAmount);
        character.karma = Math.min(100, character.karma + (previous_dilemma.illusion_data?.karma_gain || 10));

        lastChoiceOutcome = previous_dilemma.illusion_data?.button_text || "Tiếp nhận hiện thực";
        historyLog.push({
          age: character.age,
          event: previous_dilemma.title,
          choice: lastChoiceOutcome
        });
      } else if (type === "TRILEMMA" && previous_dilemma.trilemma_options) {
        const chosenId = choice_id || interaction_result?.choice_id || "TRI_A";
        const selected = previous_dilemma.trilemma_options.find(o => o.id === chosenId) || previous_dilemma.trilemma_options[0];
        const effects = selected.effects || {};

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

        lastChoiceOutcome = selected.action_title;
        historyLog.push({
          age: character.age,
          event: previous_dilemma.title,
          choice: lastChoiceOutcome
        });
      } else if (type === "TIME_SKIP" && previous_dilemma.time_skip_data) {
        const skip = previous_dilemma.time_skip_data;
        const strategy = interaction_result?.strategy || 'accumulate';
        const yearsJump = skip.years_jump || 3;
        character.age += yearsJump - 1; // 1 will be added in passive phase

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

        historyLog.push({
          age: character.age,
          event: previous_dilemma.title,
          choice: lastChoiceOutcome
        });
      } else if (choice_id && previous_dilemma.options) {
        const selectedOption = previous_dilemma.options.find(o => o.id === choice_id);
        if (selectedOption) {
          lastChoiceOutcome = selectedOption.action_title || selectedOption.label || "";
          const costAP = selectedOption.cost_ap || 1;

          if (character.action_points >= costAP) {
            const effects = selectedOption.effects || {};
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

            historyLog.push({
              age: character.age,
              event: previous_dilemma.title,
              choice: selectedOption.action_title || selectedOption.label
            });
          }
        }
      }

      character.history_log = historyLog;
      // Record resolved dilemma in anti-loop engine and update recent tags
      recordExperiencedScenario(character, previous_dilemma);
    }

    // Check Domino Fuses (Delayed time-bomb flags)
    const { triggered: dominoTriggered, remaining: dominoRemaining } = checkDelayedDominoFuses(character);
    if (dominoTriggered.length > 0) {
      character.delayed_flags = dominoRemaining;
      dominoTriggered.forEach(d => {
        if (!character.hidden_flags.includes(d.flag)) character.hidden_flags.push(d.flag);
      });
    }

    // 1. Passive Phase
    const { updatedCharacter, passiveSummary } = await processPassivePhase(character, assets, relationships);
    character = updatedCharacter;
    if (character.household) {
      character.household.family_meals_available = 1;
    }

    // Tự động giải ngân quỹ bảo trợ gia đình khi tròn 18 tuổi
    if (character.age === 18 && Number(character.family_endowment || 0) > 0) {
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

    // Check if character died during passive phase or Reaper roll
    if (character.is_deceased) {
      await updateCharacter(character.id, character);
      // Transfer accumulated karma to eternal player_account
      await addTotalKarma(character.karma || 50);
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

    // 2. Check Long-term NPC Memory Arcs
    const npcArc = evaluateNpcLongTermArc(character, npcs);
    let dilemma = null;

    if (npcArc && Math.random() < 0.40) {
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

    currentDilemma = dilemma;

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
      aspiration
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
    currentDilemma = await generateDilemma(prompt, character, assets, relationships);
    await cacheTickEvent(character.id, character.age, currentDilemma);

    const visuals = generateCharacterVisuals(character, assets);

    res.json({
      success: true,
      character,
      player_account,
      visuals,
      assets,
      relationships,
      npcs,
      dilemma: currentDilemma
    });
  } catch (err) {
    console.error('Reset failed:', err);
    res.status(500).json({ error: 'Reset failed', message: err.message });
  }
});

export default router;
