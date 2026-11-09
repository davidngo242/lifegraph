import { updateAsset, updateRelationship } from '../db/db.js';
import { generatePassiveChildhoodEvent } from './rebirthEngine.js';
import { getCountryBigData } from '../data/countryBigData.js';

// Calculate maximum vitality cap based on biological age
// If Transhumanism surgery was successful, decay is frozen until transhuman_frozen_until_age
// If transcendence_sage skill is unlocked, adds permanent +15 vitality cap bonus
// If iron_constitution trait is present, slows biological decay after age 60 by 40%
export function calculateMaxVitality(age, transhumanFrozenUntilAge = null, hasTranscendence = false, traits = []) {
  const traitList = Array.isArray(traits) ? traits : [];
  const hasIron = traitList.includes('iron_constitution');
  const hasLongevityAncestry = traitList.includes('longevity_ancestry') || traitList.includes('gen_trường_thọ_bách_niên');
  const transcendenceBonus = (hasTranscendence ? 15 : 0) + (hasLongevityAncestry ? 15 : 0);
  if (transhumanFrozenUntilAge && age <= transhumanFrozenUntilAge) {
    return 90 + transcendenceBonus; // Frozen from biological decay!
  }
  const decayMod = hasIron ? 0.60 : 1.0;
  let baseMax = 100;
  if (age <= 40) baseMax = 100;
  else if (age <= 60) baseMax = Math.round(100 - (age - 40) * 1.25); // 40->100, 60->75
  else if (age <= 80) baseMax = Math.round(75 - (age - 60) * 1.75 * decayMod);  // 60->75, 80->40
  else baseMax = Math.max(15, Math.round(40 - (age - 80) * 1.2 * decayMod));    // 80->40, 100->16
  return baseMax + transcendenceBonus;
}

// Biological Reaper Death Roll (Exponential mortality from age 70+)
// If transcendence_sage or longevity_ancestry is unlocked, grace period extended to 75+ and mortality risk halved
export function evaluateReaperRoll(age, currentVitality, hasTranscendence = false, traits = []) {
  const traitList = Array.isArray(traits) ? traits : [];
  const hasLongevityAncestry = traitList.includes('longevity_ancestry');
  const thresholdAge = (hasTranscendence || hasLongevityAncestry) ? 75 : 70;
  if (age < thresholdAge) return { died: false };

  let deathProbability = 0;

  if (age >= 100) {
    deathProbability = 0.99; // Only 1% survival chance past 100
  } else if (age >= 95) {
    deathProbability = 0.75 + (age - 95) * 0.048;
  } else if (age >= 85) {
    deathProbability = 0.30 + (age - 85) * 0.045;
  } else if (age >= 75) {
    deathProbability = 0.10 + (age - 75) * 0.02;
  } else {
    // 70 - 74
    deathProbability = 0.03 + (age - 70) * 0.014;
  }

  // Fragility penalty if vitality is low
  if (currentVitality < 25) {
    deathProbability += 0.20;
  }

  // Transcendence Sage perk / Longevity trait: Halves sudden death probability
  if (hasTranscendence || hasLongevityAncestry) {
    deathProbability *= 0.50;
  }

  const roll = Math.random();
  if (roll < deathProbability) {
    const causes = [
      "Suy tim do tuổi già và biến chứng mệt mỏi tích tụ",
      "Đột quỵ trong giấc ngủ yên bình",
      "Suy đa tạng sau một đợt cảm lạnh mùa đông",
      "Cơn đau thắt ngực cấp tính không kịp cấp cứu",
      "Ngừng tuần hoàn tự nhiên do cạn kiệt sinh lực"
    ];
    return {
      died: true,
      cause: causes[Math.floor(Math.random() * causes.length)],
      finalAge: age
    };
  }

  return { died: false };
}

export async function processPassivePhase(character, assets, relationships) {
  let { vitality, cash, burnout, karma, hidden_flags, age } = character;
  const flagsSet = new Set(Array.isArray(hidden_flags) ? hidden_flags : []);
  const unlockedSkills = Array.isArray(character.unlocked_skills) ? character.unlocked_skills : [];
  const hasTranscendence = unlockedSkills.includes("transcendence_sage");
  const hasStoicMind = unlockedSkills.includes("stoic_mind");
  const hasEncyclopedic = unlockedSkills.includes("encyclopedic_brain");
  const hasCapitalEngine = unlockedSkills.includes("capital_engine");
  const equippedPet = character.equipped_pet || 'none';
  const hasDragonProtection = equippedPet === 'dragon' || flagsSet.has("dragon_celestial_shield");

  // 1. Natural aging
  const traits = Array.isArray(character.innate_traits) ? character.innate_traits : [];
  age += 1;
  const maxVitality = calculateMaxVitality(age, character.transhuman_frozen_until_age, hasTranscendence, traits);

  const nationality = character.nationality || "Việt Nam";
  const countryData = getCountryBigData(nationality);
  const isTier3Country = (countryData?.tier === 'T3' || character.country_tier === 'T3');
  const hasVulnerableGenetics = traits.some(t => 
    ['hệ_miễn_dịch_yếu', 'tiền_sử_tim_mạch_di_truyền', 'weak_immune_system', 'delicate_health'].includes(t)
  );

  // 2. Check Reaper Death Roll from age 70+ (or 75+ if longevity_ancestry / transcendence)
  const reaperResult = evaluateReaperRoll(age, vitality, hasTranscendence, traits);
  if (reaperResult.died) {
    return {
      updatedCharacter: {
        ...character,
        age,
        vitality: 0,
        max_vitality: maxVitality,
        is_deceased: true,
        death_cause: reaperResult.cause,
        death_age: age
      },
      passiveSummary: {
        died: true,
        cause: reaperResult.cause,
        ageReached: age
      }
    };
  }

  // 3. Wealth & Asset Accounting
  const totalAssetValue = assets.reduce((sum, a) => sum + Number(a.current_value || 0), 0);
  const netWorth = (Number(cash) || 0) + totalAssetValue;

  // 4. Global Tipping Points (Butterfly Effect when Net Worth > $1M)
  let globalIndices = character.global_indices || { economy: 65, social: 65, environment: 65 };
  let macroCalamityNotice = null;

  if (netWorth > 1000000) {
    // Large capital operations subtly perturb global balance
    const ecoShift = (Math.random() * 4) - 2.5; // slight drag
    const socShift = (Math.random() * 4) - 2.5;
    const envShift = (Math.random() * 4) - 3.0; // industrial footprint

    globalIndices.economy = Math.max(10, Math.min(100, Math.round(globalIndices.economy + ecoShift)));
    globalIndices.social = Math.max(10, Math.min(100, Math.round(globalIndices.social + socShift)));
    globalIndices.environment = Math.max(10, Math.min(100, Math.round(globalIndices.environment + envShift)));

    // Check if any metric hit rock bottom (< 20%) -> Trigger Global Calamity
    if (globalIndices.economy < 20 || globalIndices.social < 20 || globalIndices.environment < 20) {
      const baseRatio = hasDragonProtection ? 0.14 : 0.20;
      const penalty = Math.round(netWorth * baseRatio);
      cash -= penalty;
      vitality = Math.max(10, vitality - (hasDragonProtection ? 10 : 15));
      burnout = Math.min(100, burnout + (hasDragonProtection ? 15 : 25));
      flagsSet.add("survived_global_calamity");
      macroCalamityNotice = hasDragonProtection
        ? "⚠️ THẢM HỌA VĨ MÔ TOÀN CẦU KÍCH HOẠT: Khủng hoảng chạm đáy đã làm bốc hơi 14% tài sản (Ấu Long Luân Hồi che chở giảm 30% tổn thất!)."
        : "⚠️ THẢM HỌA VĨ MÔ TOÀN CẦU KÍCH HOẠT: Khủng hoảng chạm đáy đã làm bốc hơi 20% tài sản và gây chấn động sức khỏe trầm trọng.";
      // Slightly reset metric above crisis threshold
      globalIndices.economy = Math.max(30, globalIndices.economy);
      globalIndices.social = Math.max(30, globalIndices.social);
      globalIndices.environment = Math.max(30, globalIndices.environment);
    }
  }

  // 5. Wealth Sink Mechanics (> 10 Million USD)
  let wealthDrainNotice = null;
  if (netWorth > 10000000) {
    const drainRatio = 0.15 + (Math.random() * 0.15);
    const drainAmount = Math.round(netWorth * drainRatio);

    if (Math.random() < 0.35) {
      flagsSet.add("antitrust_investigation");
      wealthDrainNotice = `Bị thanh tra đặc biệt & chế tài chống độc quyền: Bị phạt và phong tỏa $${drainAmount.toLocaleString()}`;
    } else if (Math.random() < 0.65) {
      flagsSet.add("hyper_inflation_target");
      wealthDrainNotice = `Lạm phát phi mã và sụp đổ thị trường tài sản: Thâm hụt $${drainAmount.toLocaleString()}`;
    } else {
      flagsSet.add("whale_fraud_target");
      wealthDrainNotice = `Bị mạng lưới lừa đảo xuyên quốc gia chiếm đoạt tài sản: Bốc hơi $${drainAmount.toLocaleString()}`;
    }

    if (cash > drainAmount) {
      cash -= drainAmount;
    } else {
      cash = Math.max(10000, cash - Math.round(drainAmount * 0.4));
      for (const asset of assets) {
        asset.current_value = Math.max(10000, Math.round(asset.current_value * (1 - drainRatio)));
        await updateAsset(asset.id, { current_value: asset.current_value });
      }
    }
  }

  // 5.5 Macro Economic Shocks (Quyết định 3: Biến cố vĩ mô ngẫu nhiên)
  let macroShockNotice = null;
  let macroShockType = null;
  if (age >= 22 && !macroCalamityNotice && !wealthDrainNotice && process.env.NODE_ENV !== 'test' && Math.random() < 0.15) {
    const shockTypes = ['bubble', 'crash', 'inflation', 'layoff'];
    const selected = shockTypes[Math.floor(Math.random() * shockTypes.length)];
    const dragonTag = hasDragonProtection ? " (Ấu Long che chở giảm 30% chấn động)" : "";

    if (selected === 'bubble') {
      macroShockType = 'macro_real_estate_bubble';
      flagsSet.add("macro_real_estate_bubble");
      const reDropRatio = hasDragonProtection ? 0.825 : 0.75;
      const reAssets = assets.filter(a => a.type === 'real_estate' || a.type === 'property' || (a.name || '').toLowerCase().includes('nhà') || (a.name || '').toLowerCase().includes('đất'));
      if (reAssets.length > 0) {
        for (const re of reAssets) {
          re.current_value = Math.max(5000, Math.round(re.current_value * reDropRatio));
          try { await updateAsset(re.id, { current_value: re.current_value }); } catch (_e) {}
        }
        macroShockNotice = `💥 BIẾN CỐ VĨ MÔ: Vỡ bong bóng địa ốc khiến giá trị bất động sản sụt giảm ${hasDragonProtection ? '17.5%' : '25%'}${dragonTag}!`;
      } else {
        const rawHike = Math.min(Math.round(cash * 0.08), 3500);
        const rentHike = hasDragonProtection ? Math.round(rawHike * 0.7) : rawHike;
        cash = Math.max(0, cash - rentHike);
        macroShockNotice = `💥 BIẾN CỐ VĨ MÔ: Cơn sốt đất ảo đẩy tiền thuê nhà phi mã, thâm hụt thêm $${rentHike.toLocaleString()} chi phí chỗ ở${dragonTag}!`;
      }
    } else if (selected === 'crash') {
      macroShockType = 'macro_crypto_stock_crash';
      flagsSet.add("macro_crypto_stock_crash");
      const stDropRatio = hasDragonProtection ? 0.755 : 0.65;
      const stAssets = assets.filter(a => a.type === 'stocks' || a.type === 'crypto' || (a.name || '').toLowerCase().includes('cổ phiếu') || (a.name || '').toLowerCase().includes('coin'));
      if (stAssets.length > 0) {
        for (const st of stAssets) {
          st.current_value = Math.max(1000, Math.round(st.current_value * stDropRatio));
          try { await updateAsset(st.id, { current_value: st.current_value }); } catch (_e) {}
        }
        macroShockNotice = `📉 BIẾN CỐ VĨ MÔ: Sập sàn tài chính khiến danh mục cổ phiếu/chứng khoán sụt giảm ${hasDragonProtection ? '24.5%' : '35%'}${dragonTag}!`;
      } else if (cash > 25000) {
        const bargainGain = Math.round(cash * (hasDragonProtection ? 0.11 : 0.08));
        cash += bargainGain;
        macroShockNotice = `📉 BIẾN CỐ VĨ MÔ: Sập sàn tài chính mở ra cơ hội vàng bắt đáy tài sản giá rẻ, thặng dư thêm +$${bargainGain.toLocaleString()}!`;
      } else {
        macroShockNotice = `📉 BIẾN CỐ VĨ MÔ: Sóng gió tài chính toàn cầu gây đóng băng tín dụng, môi trường kiếm tiền thắt chặt${dragonTag}!`;
      }
    } else if (selected === 'inflation') {
      macroShockType = 'macro_inflation_spike';
      flagsSet.add("macro_inflation_spike");
      const rawLoss = Math.round(cash * 0.12);
      const cashLoss = hasDragonProtection ? Math.round(rawLoss * 0.7) : rawLoss;
      cash = Math.max(0, cash - cashLoss);
      burnout = Math.min(100, burnout + (hasDragonProtection ? 6 : 10));
      macroShockNotice = `🔥 BIẾN CỐ VĨ MÔ: Bão giá & lạm phát phi mã làm sức mua tiền mặt sụt giảm $${cashLoss.toLocaleString()}${dragonTag}!`;
    } else {
      macroShockType = 'macro_tech_layoff_wave';
      flagsSet.add("macro_tech_layoff_wave");
      burnout = Math.min(100, burnout + (hasDragonProtection ? 12 : 18));
      vitality = Math.max(10, vitality - (hasDragonProtection ? 5 : 8));
      macroShockNotice = `⚡ BIẾN CỐ VĨ MÔ: Làn sóng sa thải AI quét qua thị trường việc làm, tăng áp lực công việc khốc liệt${dragonTag}!`;
    }
  }

  // 6. Asset maintenance & macro fluctuation with passive cash flow yield
  let totalAssetIncome = 0;
  let totalAssetMaintenance = 0;
  const econIndex = (globalIndices && typeof globalIndices.economy === 'number') ? globalIndices.economy : 50;
  const econMultiplier = Math.max(0.6, Math.min(1.5, econIndex / 50)); // 0.6x in crash, 1.4x in boom

  for (const asset of assets) {
    const baseCashFlow = Number(asset.annual_cash_flow || asset.cash_flow || 0);
    const effectiveCashFlow = Math.round(baseCashFlow * econMultiplier);
    totalAssetIncome += effectiveCashFlow;

    totalAssetMaintenance += Number(asset.maintenance_cost_per_tick || asset.maintenance_cost || 0);
    const macroRate = ((econIndex - 50) / 250) + ((Math.random() * 0.08) - 0.03);
    const newValue = Math.max(0, Math.round(asset.current_value * (1 + macroRate)));
    try {
      await updateAsset(asset.id, { current_value: newValue });
    } catch (_ignored) {
      // Allow unit tests or transient mock assets to evaluate without crashing
    }
    asset.current_value = newValue;
  }

  // Trait passive yields: green_thumb & market_intuition
  if (traits.includes('green_thumb')) {
    const agAssets = assets.filter(a => {
      const name = (a.name || '').toLowerCase();
      return name.includes('đồn điền') || name.includes('vườn') || name.includes('nông nghiệp') || name.includes('sinh thái');
    });
    if (agAssets.length > 0) {
      const agBonus = agAssets.length * 800;
      cash += agBonus;
      totalAssetIncome += agBonus;
    }
  }

  // Trinity Tree Resonance Synergies:
  const hasFamilyTrustFund = unlockedSkills.includes("leverage_power") && unlockedSkills.includes("negotiation_master");
  const hasTechUnicorn = unlockedSkills.includes("negotiation_master") && unlockedSkills.includes("encyclopedic_brain");
  const hasScholarlyDynasty = unlockedSkills.includes("leverage_power") && unlockedSkills.includes("encyclopedic_brain");
  const hasTrinityPerfection = unlockedSkills.includes("syndicate_kingmaker") && unlockedSkills.includes("capital_engine") && unlockedSkills.includes("transcendence_sage");

  // Annual Pledges Multipliers (Tâm Nguyện Năm Mới)
  const activePledge = character.active_pledge || null;
  if (activePledge === 'pledge_wealth') {
    if (totalAssetIncome > 0) {
      totalAssetIncome = Math.round(totalAssetIncome * 1.10); // +10% lợi tức đầu tư thụ động
    }
    const pledgeWealthBonus = Math.round(Math.max(300, Math.min(30000, (Number(cash) || 0) * 0.05)));
    cash += pledgeWealthBonus;
  }

  // Family Trust Fund (Gia Phong + Tư Bản): 50% discount on asset maintenance
  if (hasFamilyTrustFund && totalAssetMaintenance > 0) {
    totalAssetMaintenance = Math.round(totalAssetMaintenance * 0.5);
  }

  // Tech Unicorn (Tư Bản + Trí Tuệ): +15% dividend bonus on liquid/tech yield
  let techDividendBonus = 0;
  if (hasTechUnicorn && totalAssetIncome > 0) {
    techDividendBonus = Math.round(totalAssetIncome * 0.15);
    totalAssetIncome += techDividendBonus;
  }

  if (traits.includes('market_intuition')) {
    const stockAssets = assets.filter(a => a.type === 'stocks' || a.type === 'stock' || (a.name || '').toLowerCase().includes('cổ phiếu'));
    if (stockAssets.length > 0) {
      const stockBonus = Math.round(stockAssets.reduce((sum, s) => sum + Number(s.current_value || 0), 0) * 0.05);
      cash += stockBonus;
      totalAssetIncome += stockBonus;
    }
  }

  if (traits.includes('resilient_spirit')) {
    burnout = Math.max(0, burnout - 4);
  }

  // 6.5 Equipped Guardian Pet Passive Perks
  let petNotice = null;
  if (equippedPet === 'puppy') {
    burnout = Math.max(0, burnout - 8);
    for (const rel of relationships) {
      if (rel.status !== 'deceased') {
        rel.affection_level = Math.min(100, (Number(rel.affection_level) || 50) + 3);
      }
    }
    petNotice = "🐶 Cún Cỏ Trung Nghĩa: Quấn quýt sưởi ấm tâm hồn (-8% Burnout, +3 Tình cảm gia đình).";
  } else if (equippedPet === 'cat') {
    if (totalAssetIncome > 0) {
      totalAssetIncome = Math.round(totalAssetIncome * 1.05);
    }
    const catBonus = Math.max(150, Math.round((Number(cash) || 0) * 0.02));
    cash += catBonus;
    petNotice = `🐱 Mèo Thần Tài: Vẫy tay chiêu tài lộc (+5% lợi tức tài sản, +$${catBonus.toLocaleString()} tiền may mắn).`;
  } else if (equippedPet === 'fox') {
    flagsSet.add("fox_charm_aura");
    character.charm = Math.min(100, (Number(character.charm) || 50) + 5);
    petNotice = "🦊 Hồ Ly Cửu Vĩ: Vầng sáng mê hoặc quyến rũ (+5 Sức hút Charm, tăng cơ duyên quý nhân).";
  } else if (equippedPet === 'dragon') {
    karma = Math.min(100, (Number(karma) || 50) + 10);
    vitality = Math.min(maxVitality, vitality + 3);
    flagsSet.add("dragon_celestial_shield");
    petNotice = "🐉 Ấu Long Luân Hồi: Ngâm vang hộ mệnh trên đỉnh Thần Mộc (+10 Karma, +3 HP, giảm 30% sát thương biến cố).";
  }

  // 7. Family upkeep & affection + Child aging & unlocked AP
  let totalRelationshipCost = 0;
  let newlyAdultChildrenCount = 0;
  const childHealthEvents = [];

  for (const rel of relationships) {
    if (rel.status !== 'deceased') {
      const prevAge = typeof rel.age === 'number' ? rel.age : 0;
      rel.age = prevAge + 1;

      if (rel.type === 'child' && prevAge < 18 && rel.age >= 18) {
        newlyAdultChildrenCount++;
        flagsSet.add(`child_grown_up_${rel.id}`);
      }

      // Child Fever Risk (age < 10)
      if (rel.type === 'child' && rel.age < 10) {
        const feverRisk = isTier3Country ? 0.28 : 0.18;
        if (Math.random() < feverRisk) {
          const clinicFee = Math.round(35 * (countryData?.healthcare?.clinic_cost_factor || 1.0));
          const paidFee = cash > 0 ? Math.min(cash, clinicFee) : 0;
          cash -= paidFee;
          karma = Math.min(100, (Number(karma) || 50) + 5);
          rel.affection_level = Math.min(100, (Number(rel.affection_level) || 50) + 6);
          childHealthEvents.push(`🏥 Con của bạn (${rel.name}, ${rel.age} tuổi) bị sốt mọc răng/nhiễm lạnh. Bạn đã tận tình mua thuốc men chăm sóc ($${paidFee}), con đã bình phục an toàn (+5 Karma, +6 Hảo cảm).`);
        }
      }

      // Elderly parent natural passing
      if ((rel.type === 'parent' || rel.type === 'father' || rel.type === 'mother') && rel.age > 75) {
        const mortalityChance = Math.min(0.85, (rel.age - 75) * 0.045);
        if (Math.random() < mortalityChance) {
          rel.status = 'deceased';
          rel.death_age = rel.age;
          flagsSet.add("parent_passed_away");
        }
      }

      try {
        await updateRelationship(rel.id, {
          age: rel.age,
          status: rel.status,
          affection_level: rel.affection_level
        });
      } catch (_ignored) {
        // Allow unit tests or transient simulation to evaluate in-memory without crashing
      }
    }

    const isMinorCharacter = (character.age < 18);
    const isParentType = (rel.type === 'parent' || rel.type === 'father' || rel.type === 'mother');
    const cost = (isMinorCharacter && isParentType) ? 0 : (isParentType ? (Number(rel.monthly_cost || rel.monthly_upkeep) || 200) : Number(rel.monthly_cost || rel.monthly_upkeep || 0));
    totalRelationshipCost += cost;
    if (cash < -5000 && rel.affection_level > 20) {
      rel.affection_level = Math.max(10, rel.affection_level - 5);
      try {
        await updateRelationship(rel.id, { affection_level: rel.affection_level });
      } catch (_ignored) {}
    }
  }

  // Annual Pledge: Social Links & Family Warmth
  if (activePledge === 'pledge_social') {
    totalRelationshipCost = Math.round(totalRelationshipCost * 0.5); // Giảm 50% chi phí chăm sóc quan hệ
    for (const rel of relationships) {
      if (rel.status !== 'deceased') {
        rel.affection_level = Math.min(100, (Number(rel.affection_level) || 50) + 8);
      }
    }
  }

  // Synchronize Household Parents Lifecycle & Status Consistency
  if (character.household && character.household.parents_status !== 'deceased_or_abandoned') {
    const hh = character.household;
    hh.father_age = (hh.father_age || (character.age + 27)) + 1;
    hh.mother_age = (hh.mother_age || (character.age + 25)) + 1;

    // Check Father Mortality
    if (hh.father_name && hh.father_status !== 'deceased') {
      if (hh.father_age > 75) {
        const fatherMortality = Math.min(0.85, (hh.father_age - 75) * 0.05);
        if (Math.random() < fatherMortality) {
          hh.father_status = 'deceased';
          hh.father_death_age = hh.father_age;
          flagsSet.add('father_passed_away');
          flagsSet.add('parent_passed_away');
        }
      }
    }

    // Check Mother Mortality
    if (hh.mother_name && hh.mother_status !== 'deceased') {
      if (hh.mother_age > 75) {
        const motherMortality = Math.min(0.85, (hh.mother_age - 75) * 0.05);
        if (Math.random() < motherMortality) {
          hh.mother_status = 'deceased';
          hh.mother_death_age = hh.mother_age;
          flagsSet.add('mother_passed_away');
          flagsSet.add('parent_passed_away');
        }
      }
    }

    // Update Overall Parents Status
    const isFatherGone = !hh.father_name || hh.father_status === 'deceased';
    const isMotherGone = !hh.mother_name || hh.mother_status === 'deceased';

    if (isFatherGone && isMotherGone) {
      hh.parents_status = 'deceased';
      hh.annual_allowance = 0;
    } else if (isFatherGone) {
      hh.parents_status = 'single_mother';
      hh.annual_allowance = Math.round((hh.annual_allowance || 100) * 0.6);
    } else if (isMotherGone) {
      hh.parents_status = 'single_father';
      hh.annual_allowance = Math.round((hh.annual_allowance || 100) * 0.6);
    } else {
      hh.parents_status = 'alive';
    }
  }

  // Skill: Capital Engine passive yield (+$25,000/yr without AP/Vitality drain)
  const capitalEngineBonus = hasCapitalEngine ? 25000 : 0;

  // Skill: Encyclopedic Brain annual karma buff (+25 Karma/yr)
  if (hasEncyclopedic) {
    karma = Math.min(100, (Number(karma) || 50) + 25);
  }

  // Trinity Resonance: Scholarly Dynasty (+15 Karma/yr)
  if (hasScholarlyDynasty) {
    karma = Math.min(100, (Number(karma) || 50) + 15);
  }

  // Trinity Resonance: Trinity Perfection (+25 Karma/yr)
  if (hasTrinityPerfection) {
    karma = Math.min(100, (Number(karma) || 50) + 25);
  }

  // Net Passive Flow: Asset Yield + Capital Engine - Asset Maintenance - Family Upkeep
  const netPassiveFlow = totalAssetIncome + capitalEngineBonus - totalAssetMaintenance - totalRelationshipCost;
  cash += netPassiveFlow;

  // MINOR SHIELD: Minors (< 18) are protected from negative cash / personal debt
  if (age < 18) {
    cash = Math.max(0, cash);
    flagsSet.delete("high_debt");
  }

  // 8. Cash < 0 debt compounding & Burnout (Adults only)
  let burnoutChange = 0;
  let vitalityChange = 0;

  if (age >= 18 && cash < 0) {
    const interest = Math.round(Math.abs(cash) * 0.045);
    cash -= interest;
    const debtRatio = Math.min(30, Math.ceil(Math.abs(cash) / 2500));
    burnoutChange += (12 + debtRatio);
    flagsSet.add("high_debt");
  } else {
    burnoutChange -= 4;
    if (flagsSet.has("high_debt") && cash > 3000) {
      flagsSet.delete("high_debt");
    }
  }

  // Skill: Stoic Mind - Reduces burnout gain by 40%
  if (burnoutChange > 0 && hasStoicMind) {
    burnoutChange = Math.round(burnoutChange * 0.6);
  }

  // 9. Chronic Burnout damage
  if (burnout > 85) {
    vitalityChange -= 10;
  }

  // 10. Natural vitality decline with age & Childhood Health Emergency
  let childhoodHealthCrisisNotice = null;
  if (age < 6 && (hasVulnerableGenetics || isTier3Country)) {
    const feverTriggerChance = hasVulnerableGenetics ? 0.35 : 0.20;
    if (Math.random() < feverTriggerChance) {
      flagsSet.add("childhood_fever_experienced");
      const clinicCost = Math.round(40 * (countryData?.healthcare?.clinic_cost_factor || 1.0));
      const familySupport = (character.household?.annual_allowance || 0) > 0 || cash >= clinicCost || (character.family_background && character.family_background !== 'poor');

      if (familySupport) {
        if (cash >= clinicCost) cash -= clinicCost;
        vitalityChange += 2;
        karma = Math.min(100, (Number(karma) || 50) + 5);
        childhoodHealthCrisisNotice = `🏥 Sức khỏe ấu thơ: Năm ${age} tuổi, bạn trải qua cơn sốt co giật cấp tính. Nhờ gia đình tận tình chạy chữa và trạm xá tiếp ứng kịp thời ($${clinicCost}), bạn đã an toàn vượt qua nghịch cảnh.`;
      } else {
        // Severe untreated childhood illness in strained conditions
        vitalityChange -= 25;
        childhoodHealthCrisisNotice = `⚠️ Hiểm họa nhi khoa: Nơi bạn sinh sống thiếu thốn thuốc men y tế, cơn viêm phổi cấp tính đã bào mòn nghiêm trọng sinh lực non nớt (-25 HP).`;
      }
    }
  }

  if (age > 65) {
    vitalityChange -= 3;
  } else if (age > 50) {
    vitalityChange -= 2;
  }

  burnout = Math.max(0, Math.min(100, burnout + burnoutChange));
  // Vitality is strictly capped by maxVitality!
  vitality = Math.max(0, Math.min(maxVitality, vitality + vitalityChange));

  // If vitality hits 0, character dies
  if (vitality <= 0) {
    const isChildDeath = age < 6;
    const deathCause = isChildDeath
      ? "Biến chứng viêm phổi cấp tính thuở ấu thơ"
      : "Kiệt quệ sinh lực hoàn toàn (Vitality = 0)";
    const finalKarma = isChildDeath ? ((Number(karma) || 0) + 120) : karma;
    return {
      updatedCharacter: {
        ...character,
        age,
        vitality: 0,
        max_vitality: maxVitality,
        is_deceased: true,
        death_cause: deathCause,
        death_age: age,
        karma: finalKarma
      },
      passiveSummary: {
        died: true,
        cause: deathCause,
        ageReached: age,
        karmaReimbursed: isChildDeath ? 120 : 0
      }
    };
  }

  // 11. Append Timeline Snapshot for 15s Death Recap Video
  const timelineSnapshots = Array.isArray(character.timeline_snapshots) ? [...character.timeline_snapshots] : [];
  if (age % 5 === 0 || wealthDrainNotice || macroCalamityNotice || macroShockNotice) {
    timelineSnapshots.push({
      age,
      net_worth: netWorth,
      vitality,
      burnout,
      event: macroShockNotice || macroCalamityNotice || wealthDrainNotice || `Năm ${age} tuổi`
    });
  }

  // 12. Dynamic AP Economy (V7.5 Living Ecosystem)
  // Unused AP from previous year converts to peaceful recovery
  const unusedAP = Number(character.action_points) || 0;
  const isWellnessPledge = activePledge === 'pledge_wellness';
  const unusedApVitalityGain = unusedAP * (isWellnessPledge ? 4 : 2); // x2 hiệu quả khi có Tâm Nguyện An Yên
  const unusedApBurnoutRelief = unusedAP * (isWellnessPledge ? 8 : 5);
  const convertedApNotice = unusedAP > 0
    ? `🌿 Chuyển hóa ${unusedAP} AP dư thành Dưỡng Sinh${isWellnessPledge ? ' (x2 Tâm Nguyện An Yên)' : ''}: +${unusedApVitalityGain} HP & -${unusedApBurnoutRelief}% Burnout.`
    : null;

  if (unusedAP > 0) {
    vitality = Math.min(maxVitality, vitality + unusedApVitalityGain);
    burnout = Math.max(0, burnout - unusedApBurnoutRelief);
  }
  if (isWellnessPledge) {
    burnout = Math.max(0, burnout - 8); // Kháng 30% Burnout thụ động thường niên
  }

  // Base AP = 3
  let baseAP = 3;
  let bonusAP = 0;
  let penaltyAP = 0;
  let lockedAP = 0;
  const lockedReasons = [];

  // Bonus for High Vitality
  if (vitality > 80) {
    bonusAP += 1;
  }
  // Penalty for Low Vitality
  if (vitality < 30) {
    penaltyAP += 1;
  }
  // Ageing Penalty
  if (age > 60) {
    penaltyAP += 1;
  }

  // Locked AP: Children < 18 years old
  const minorChildren = (relationships || []).filter(r => r.type === 'child' && Number(r.age || 0) < 18 && r.status !== 'deceased');
  if (minorChildren.length > 0) {
    lockedAP += 1;
    lockedReasons.push("Nuôi dạy con nhỏ (<18t)");
  }

  // Locked AP: Asset Portfolio Management (> 3 asset categories)
  if ((assets || []).length > 3) {
    lockedAP += 1;
    lockedReasons.push("Quản trị danh mục tài sản lớn (>3 tài sản)");
  }

  const totalCapacityAP = Math.max(1, baseAP + bonusAP - penaltyAP);
  const freeAP = Math.max(0, totalCapacityAP - lockedAP);

  // Passive Childhood Chronicle Event (<18yo) - Automatic & Prodigy Milestones
  let childhoodPassiveEvent = null;
  if (age < 18) {
    childhoodPassiveEvent = generatePassiveChildhoodEvent(character);
    if (childhoodPassiveEvent) {
      if (childhoodPassiveEvent.effects.cash_delta) {
        cash = (Number(cash) || 0) + childhoodPassiveEvent.effects.cash_delta;
      }
      if (childhoodPassiveEvent.effects.karma_delta) {
        karma = Math.min(100, Math.max(0, karma + childhoodPassiveEvent.effects.karma_delta));
      }
      if (childhoodPassiveEvent.effects.vitality_delta) {
        vitality = Math.min(maxVitality, Math.max(10, vitality + childhoodPassiveEvent.effects.vitality_delta));
      }
      if (childhoodPassiveEvent.flag) {
        flagsSet.add(childhoodPassiveEvent.flag);
      }
    }
  }

  return {
    updatedCharacter: {
      ...character,
      age,
      vitality,
      max_vitality: maxVitality,
      cash,
      burnout,
      karma,
      action_points: freeAP,
      total_ap: totalCapacityAP,
      locked_ap: lockedAP,
      locked_reasons: lockedReasons,
      is_deceased: false,
      active_pledge: activePledge,
      hidden_flags: Array.from(flagsSet),
      global_indices: globalIndices,
      timeline_snapshots: timelineSnapshots
    },
    passiveSummary: {
      netPassiveFlow,
      totalPassiveCost: totalAssetMaintenance + totalRelationshipCost,
      totalAssetIncome,
      assetMaintenance: totalAssetMaintenance,
      relationshipCost: totalRelationshipCost,
      newlyAdultChildrenCount,
      burnoutDelta: burnoutChange,
      vitalityDelta: vitalityChange,
      ageReached: age,
      wealthDrainNotice,
      macroCalamityNotice,
      macroShockNotice,
      macroShockType,
      maxVitality,
      globalIndices,
      unused_ap_converted: unusedAP,
      unused_ap_vitality_gain: unusedApVitalityGain,
      unused_ap_burnout_relief: unusedApBurnoutRelief,
      converted_ap_notice: convertedApNotice,
      annual_digest: {
        age_reached: age,
        unused_ap_converted: unusedAP,
        unused_ap_vitality_gain: unusedApVitalityGain,
        unused_ap_burnout_relief: unusedApBurnoutRelief,
        converted_ap_notice: convertedApNotice,
        headline: age === 18 
          ? "🎓 Chính Thức Tròn 18 Tuổi: Bước Vào Đời & Tự Chủ Tài Chính"
          : age < 18 
          ? `🌱 Năm ${age} Tuổi: Những Năm Tháng Thiếu Thời Ấm Áp`
          : age >= 60
          ? (netPassiveFlow >= 0 
              ? `👴 Tuổi ${age} An Hưởng: Thu Nhập Hưu Trí & Cổ Tức Thặng Dư`
              : `⚠️ Tuổi ${age}: Áp Lực Chi Phí Y Tế & Dưỡng Lão`)
          : netPassiveFlow >= 0 
          ? `📈 Bước Sang Tuổi ${age}: Dòng Tiền Thặng Dư Ổn Định`
          : `⚠️ Bước Sang Tuổi ${age}: Áp Lực Thâm Hụt Chi Phí Sinh Hoạt`,
        cash_flow: {
          asset_yield: totalAssetIncome,
          capital_engine_bonus: capitalEngineBonus,
          maintenance: totalAssetMaintenance,
          family_cost: totalRelationshipCost,
          net_change: netPassiveFlow
        },
        childhood_event: childhoodPassiveEvent,
        family_events: [
          ...(convertedApNotice ? [convertedApNotice] : []),
          ...(childhoodHealthCrisisNotice ? [childhoodHealthCrisisNotice] : []),
          ...(petNotice ? [petNotice] : []),
          ...childHealthEvents,
          ...(capitalEngineBonus > 0 ? [`👑 Cỗ Máy Dòng Tiền: Thu về +$${capitalEngineBonus.toLocaleString()} lợi tức thụ động không hao tổn sinh lực.`] : []),
          ...(hasEncyclopedic ? [`📚 Bách Khoa Toàn Thư: Trí tuệ uyên thâm đem lại +25 Karma danh vọng học thuật.`] : []),
          ...(hasFamilyTrustFund ? ["🏛️ Quỹ Tín Thác Gia Tộc: Gia phong và tư bản cộng hưởng, giảm 50% chi phí duy trì dinh thự và tài sản."] : []),
          ...(techDividendBonus > 0 ? [`🚀 Kỳ Lân Đổi Mới: Trí tuệ và tư bản hợp nhất, sinh thêm +$${techDividendBonus.toLocaleString()} cổ tức công nghệ.`] : []),
          ...(hasScholarlyDynasty ? ["📜 Danh Gia Trí Thức: Gia tộc nề nếp đạo học vang danh, tích lũy thêm +15 Karma phước báo."] : []),
          ...(hasTrinityPerfection ? ["🌟 Tam Vị Nhất Thể: Đạt cảnh giới tối thượng, phước báo luân hồi bất diệt (+25 Karma)."] : []),
          ...(childhoodPassiveEvent ? [`${childhoodPassiveEvent.title}: ${childhoodPassiveEvent.narrative}`] : []),
          ...(newlyAdultChildrenCount > 0 ? [`🎉 Có ${newlyAdultChildrenCount} người con tròn 18 tuổi - Giải phóng 1 AP cầm tù!`] : []),
          ...(flagsSet.has("parent_passed_away") ? ["🕯️ Cha/mẹ già đã tạ thế bình yên theo quy luật tự nhiên."] : [])
        ],
        milestone_challenge: [6, 20, 35, 55, 75].includes(age) ? {
          age,
          game_type: age === 6 ? 'plant_care_6yo' : age === 20 ? 'stock_trader_20yo' : age === 35 ? 'life_tightrope_35yo' : age === 55 ? 'cardio_beat_55yo' : 'memory_mosaic_75yo',
          title: age === 6 ? 'Ươm Mầm Cây Xanh (6t)' : age === 20 ? 'Lướt Sóng Cổ Phiếu (20t)' : age === 35 ? 'Thăng Bằng Cuộc Đời (35t)' : age === 55 ? 'Nhịp Đập Tim Mạch (55t)' : 'Mảnh Ghép Ký Ức (75t)'
        } : null
      }
    }
  };
}
