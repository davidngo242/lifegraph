// test_gender_and_delayed_consequences.mjs
const BASE_URL = 'http://localhost:10000';
const _f = globalThis.fetch;
globalThis.fetch = (u, o = {}) => _f(u, { ...o, headers: { 'x-session-id': 'gender_test_sess', ...(o.headers || {}) } });

async function test() {
  console.log('=== TEST 1: Rebirth with Female Preference ===');
  const resFemale = await fetch(`${BASE_URL}/api/game/rebirth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preferred_gender: 'female' })
  });
  const dataFemale = await resFemale.json();
  console.log('Female Character Name:', dataFemale.character?.name);
  console.log('Female Character Gender:', dataFemale.character?.gender);
  if (dataFemale.character?.gender !== 'female') {
    throw new Error(`Expected female gender, got ${dataFemale.character?.gender}`);
  }
  console.log('Visuals portrait generated:', dataFemale.visuals?.portrait_url?.slice(0, 50));

  console.log('\n=== TEST 2: Rebirth with Male Preference ===');
  const resMale = await fetch(`${BASE_URL}/api/game/rebirth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preferred_gender: 'male' })
  });
  const dataMale = await resMale.json();
  console.log('Male Character Name:', dataMale.character?.name);
  console.log('Male Character Gender:', dataMale.character?.gender);
  if (dataMale.character?.gender !== 'male') {
    throw new Error(`Expected male gender, got ${dataMale.character?.gender}`);
  }

  console.log('\n=== TEST 3: Delayed Domino Progression ===');
  // Trigger a tick with a trilemma choice that sets delayed_domino
  const resTick = await fetch(`${BASE_URL}/api/game/tick`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      choice_id: 'TRI_YOUTH_A',
      type: 'TRILEMMA',
      previous_dilemma: {
        id: 'tri_career_love_study',
        title: 'Tam Giác Tuổi 20',
        trilemma_options: [
          {
            id: 'TRI_YOUTH_A',
            action_title: 'Xách Ba Lô Đi Du Học',
            effects: {
              cash_delta: -4000,
              delayed_domino: {
                in_years: 2,
                flag: 'abroad_graduation_honor',
                cash_delta: 20000,
                title: 'Tốt Nghiệp Thủ Khoa Du Học',
                milestone_summary: 'Tốt nghiệp xuất sắc và nhận học bổng tiến sĩ!'
              }
            }
          }
        ]
      }
    })
  });
  const tickData = await resTick.json();
  console.log('Delayed flags stored:', tickData.character?.delayed_flags);
  if (!tickData.character?.delayed_flags || tickData.character.delayed_flags.length === 0) {
    throw new Error('Delayed flags not recorded in character state!');
  }

  const triggerAge = tickData.character.delayed_flags[0].trigger_at_age;
  console.log(`Domino fuse armed to detonate at age ${triggerAge} (current age: ${tickData.character.age})`);

  // Fast forward ticks until domino triggers
  let currentAge = tickData.character.age;
  let triggered = false;
  while (currentAge <= triggerAge + 1) {
    const jumpRes = await fetch(`${BASE_URL}/api/game/tick`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'TIME_SKIP' })
    });
    const jumpData = await jumpRes.json();
    currentAge = jumpData.character.age;
    console.log(`Advanced to age ${currentAge}, cash: ${jumpData.character.cash}, flags:`, jumpData.character.hidden_flags);
    if (jumpData.character.hidden_flags?.includes('abroad_graduation_honor')) {
      console.log('🎯 Domino successfully detonated and applied delayed consequences at age', currentAge);
      console.log('Delayed milestone notifications:', jumpData.delayed_milestones);
      triggered = true;
      break;
    }
  }

  if (!triggered) {
    throw new Error('Delayed domino did not detonate at expected age!');
  }

  console.log('\n✅ ALL VERIFICATION TESTS PASSED PERFECTLY!');
}

test().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
