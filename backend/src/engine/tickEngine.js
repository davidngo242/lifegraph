import { updateAsset, updateRelationship } from '../db/db.js';
import { generatePassiveChildhoodEvent } from './rebirthEngine.js';

// Calculate maximum vitality cap based on biological age
// If Transhumanism surgery was successful, decay is frozen until transhuman_frozen_until_age
// If transcendence_sage skill is unlocked, adds permanent +15 vitality cap bonus
export function calculateMaxVitality(age, transhumanFrozenUntilAge = null, hasTranscendence = false) {
  const transcendenceBonus = hasTranscendence ? 15 : 0;
  if (transhumanFrozenUntilAge && age <= transhumanFrozenUntilAge) {
    return 90 + transcendenceBonus; // Frozen from biological decay!
  }
  let baseMax = 100;
  if (age <= 40) baseMax = 100;
  else if (age <= 60) baseMax = Math.round(100 - (age - 40) * 1.25); // 40->100, 60->75
  else if (age <= 80) baseMax = Math.round(75 - (age - 60) * 1.75);  // 60->75, 80->40
  else baseMax = Math.max(15, Math.round(40 - (age - 80) * 1.2));    // 80->40, 100->16
  return baseMax + transcendenceBonus;
}

// Biological Reaper Death Roll (Exponential mortality from age 70+)
// If transcendence_sage is unlocked, grace period extended to 75+ and mortality risk halved
export function evaluateReaperRoll(age, currentVitality, hasTranscendence = false) {
  const thresholdAge = hasTranscendence ? 75 : 70;
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

  // Transcendence Sage perk: Halves sudden death probability
  if (hasTranscendence) {
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

  // 1. Natural aging
  age += 1;
  const maxVitality = calculateMaxVitality(age, character.transhuman_frozen_until_age, hasTranscendence);

  // 2. Check Reaper Death Roll from age 70+
  const reaperResult = evaluateReaperRoll(age, vitality, hasTranscendence);
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
      const penalty = Math.round(netWorth * 0.20);
      cash -= penalty;
      vitality = Math.max(10, vitality - 15);
      burnout = Math.min(100, burnout + 25);
      flagsSet.add("survived_global_calamity");
      macroCalamityNotice = "⚠️ THẢM HỌA VĨ MÔ TOÀN CẦU KÍCH HOẠT: Khủng hoảng chạm đáy đã làm bốc hơi 20% tài sản và gây chấn động sức khỏe trầm trọng.";
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
    await updateAsset(asset.id, { current_value: newValue });
    asset.current_value = newValue;
  }

  // 7. Family upkeep & affection + Child aging & unlocked AP
  let totalRelationshipCost = 0;
  let newlyAdultChildrenCount = 0;

  for (const rel of relationships) {
    if (rel.status !== 'deceased') {
      const prevAge = typeof rel.age === 'number' ? rel.age : 0;
      rel.age = prevAge + 1;

      if (rel.type === 'child' && prevAge < 18 && rel.age >= 18) {
        newlyAdultChildrenCount++;
        flagsSet.add(`child_grown_up_${rel.id}`);
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

      await updateRelationship(rel.id, {
        age: rel.age,
        status: rel.status,
        affection_level: rel.affection_level
      });
    }

    const isMinorCharacter = (character.age < 18);
    const isParentType = (rel.type === 'parent' || rel.type === 'father' || rel.type === 'mother');
    const cost = (isMinorCharacter && isParentType) ? 0 : Number(rel.monthly_cost || rel.monthly_upkeep || 0);
    totalRelationshipCost += cost;
    if (cash < -5000 && rel.affection_level > 20) {
      rel.affection_level = Math.max(10, rel.affection_level - 5);
      await updateRelationship(rel.id, { affection_level: rel.affection_level });
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

  // 10. Natural vitality decline with age
  if (age > 65) {
    vitalityChange -= 3;
  } else if (age > 50) {
    vitalityChange -= 2;
  }

  burnout = Math.max(0, Math.min(100, burnout + burnoutChange));
  // Vitality is strictly capped by maxVitality!
  vitality = Math.max(0, Math.min(maxVitality, vitality + vitalityChange));

  // If vitality hits 0, character dies of exhaustion
  if (vitality <= 0) {
    return {
      updatedCharacter: {
        ...character,
        age,
        vitality: 0,
        max_vitality: maxVitality,
        is_deceased: true,
        death_cause: "Kiệt quệ sinh lực hoàn toàn (Vitality = 0)",
        death_age: age
      },
      passiveSummary: {
        died: true,
        cause: "Kiệt quệ sinh lực hoàn toàn",
        ageReached: age
      }
    };
  }

  // 11. Append Timeline Snapshot for 15s Death Recap Video
  const timelineSnapshots = Array.isArray(character.timeline_snapshots) ? [...character.timeline_snapshots] : [];
  if (age % 5 === 0 || wealthDrainNotice || macroCalamityNotice) {
    timelineSnapshots.push({
      age,
      net_worth: netWorth,
      vitality,
      burnout,
      event: macroCalamityNotice || wealthDrainNotice || `Năm ${age} tuổi`
    });
  }

  // 12. Dynamic AP Economy (V7.5 Living Ecosystem)
  // Unused AP from previous year converts to peaceful recovery
  const unusedAP = Number(character.action_points) || 0;
  if (unusedAP > 0) {
    vitality = Math.min(maxVitality, vitality + (unusedAP * 2));
    burnout = Math.max(0, burnout - (unusedAP * 5));
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
      maxVitality,
      globalIndices,
      annual_digest: {
        age_reached: age,
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
          ...(capitalEngineBonus > 0 ? [`👑 Cỗ Máy Dòng Tiền: Thu về +$${capitalEngineBonus.toLocaleString()} lợi tức thụ động không hao tổn sinh lực.`] : []),
          ...(hasEncyclopedic ? [`📚 Bách Khoa Toàn Thư: Trí tuệ uyên thâm đem lại +25 Karma danh vọng học thuật.`] : []),
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
