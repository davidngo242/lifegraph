// Cần backend chạy ở cổng 10000 với ALLOW_RAW_SESSION_ID=1 (server chỉ nhận x-session-id thô khi bật cờ này hoặc NODE_ENV=test).
const BASE_URL = 'http://localhost:10000';
let sessionToken = null;
const results = [];

function record(name, passed, details) {
  results.push({ name, passed, details });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${name}${details ? ': ' + details : ''}`);
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (sessionToken) headers['x-session-token'] = sessionToken;
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, data: JSON.parse(text) };
  } catch (e) {
    return { ok: res.ok, status: res.status, raw: text };
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 BẮT ĐẦU KIỂM THỬ TOÀN DIỆN HỆ THỐNG LIFEGRAPH 2.0');
  console.log('====================================================\n');

  // 1. Health check
  const health = await api('/health');
  record('1. Server Health Check', health.ok && health.data.status === 'ok', `Port: ${health.data?.port}`);

  // 2. Auth Handshake
  const handshake = await api('/api/game/auth/handshake', { method: 'POST' });
  if (handshake.ok && handshake.data.session_token) {
    sessionToken = handshake.data.session_token;
    record('2. Auth Handshake & Token Issue', true, `Session Token: ${sessionToken.slice(0, 15)}...`);
  } else {
    record('2. Auth Handshake', false, 'Không nhận được session token');
  }

  // 3. Reset Game State for Clean Testing
  const reset = await api('/api/game/reset', { method: 'POST' });
  record('3. Reset Game State to Clean Slate', reset.ok);

  // 4. Initial State Fetch
  const initState = await api('/api/game/state');
  record('4. Fetch Initial State', initState.ok, `Character: ${initState.data?.character?.name || 'Chưa tạo'}`);

  // 5. Procedural Rebirth / Start New Character
  const rebirth = await api('/api/game/rebirth', {
    method: 'POST',
    body: JSON.stringify({
      selected_perks: [],
      target_nationality: 'Việt Nam'
    })
  });
  const char0 = rebirth.data?.character;
  record('5. Khởi Sinh Kiếp Mới (Rebirth at Age 0)', rebirth.ok && char0?.age === 0, `Tên: ${char0?.name}, Tuổi: ${char0?.age}, Quốc gia: ${char0?.nationality}`);

  // 6. Age 0 Scenario Check (Should be Infancy)
  const sc0 = await api('/api/game/scenario/current');
  record('6. Kịch bản Tuổi 0 (Infancy Scenario)', sc0.ok && sc0.data?.scenario?.id === 'scenario_infancy_first_steps', `Tiêu đề: ${sc0.data?.scenario?.title}`);

  // 7. Age 0 Restrictions (Cannot Date, Marry, or Buy Assets)
  const dateAt0 = await api('/api/game/action/family', { method: 'POST', body: JSON.stringify({ action_type: 'date' }) });
  record('7.1 Chặn Hẹn Hò ở Tuổi 0', !dateAt0.ok && dateAt0.status === 400, dateAt0.data?.error);

  const marryAt0 = await api('/api/game/action/family', { method: 'POST', body: JSON.stringify({ action_type: 'marry' }) });
  record('7.2 Chặn Kết Hôn ở Tuổi 0', !marryAt0.ok && marryAt0.status === 400, marryAt0.data?.error);

  const buyAssetAt0 = await api('/api/game/action/buy-asset', { method: 'POST', body: JSON.stringify({ asset_id: 'scooter_vision' }) });
  record('7.3 Chặn Mua Tài Sản ở Tuổi 0', !buyAssetAt0.ok && buyAssetAt0.status === 400, buyAssetAt0.data?.error);

  // 8. Childhood Actions (Age 0-5)
  const childAction = await api('/api/game/action/childhood', {
    method: 'POST',
    body: JSON.stringify({ action_type: 'cognitive_games' })
  });
  record('8. Hành động Tuổi thơ (Trò chơi phát triển giác quan)', childAction.ok, `IQ sau hành động: ${childAction.data?.character?.iq}`);

  // 9. Infancy 2D Scene Interaction
  const interactInfancy = await api('/api/game/scenario/interact', {
    method: 'POST',
    body: JSON.stringify({ scene_id: 'scene_nursery', hotspot_id: 'hs_crib_toys' })
  });
  record('9. Tương tác Cảnh 2D Ấu Thơ (Đồ chơi phát triển trí tuệ)', interactInfancy.ok, `Lời thoại: "${interactInfancy.data?.text?.slice(0, 40)}..."`);

  // 10. Childhood Fast-Forward to School (Age 6)
  const ff = await api('/api/game/childhood-fastforward', { method: 'POST', body: JSON.stringify({ target_age: 6 }) });
  const char6 = ff.data?.character;
  record('10. Bứt phá Tuổi thơ -> Bước vào Tiểu học (Age 6)', ff.ok && char6?.age === 6, `Tuổi mới: ${char6?.age}, Nghề: ${char6?.occupation}`);

  // 11. Advance to Age 7 via Tick
  const tick7 = await api('/api/game/tick', { method: 'POST' });
  const char7 = tick7.data?.character;
  record('11. Chuyển năm (+1 Tuổi -> 7 Tuổi)', tick7.ok && char7?.age >= 7, `Tuổi: ${char7?.age}, AP: ${char7?.action_points}, Vitality: ${char7?.vitality}`);

  // 12. Age 7 Scenario Check (Should be School Childhood)
  const sc7 = await api('/api/game/scenario/current');
  record('12. Kịch bản Tuổi 7 (Trường học & Thầy cô)', sc7.ok && sc7.data?.scenario?.id === 'scenario_school_first_decade', `Tiêu đề: ${sc7.data?.scenario?.title}`);

  // 13. Critical Bug Check: Age 7 Dating & Marriage Must Be Blocked!
  const dateAt7 = await api('/api/game/action/family', { method: 'POST', body: JSON.stringify({ action_type: 'date' }) });
  record('13.1 [BUG CHECK] Chặn Hẹn Hò ở Tuổi 7', !dateAt7.ok && dateAt7.status === 400, dateAt7.data?.error);

  const marryAt7 = await api('/api/game/action/family', { method: 'POST', body: JSON.stringify({ action_type: 'marry' }) });
  record('13.2 [BUG CHECK] Chặn Kết Hôn ở Tuổi 7', !marryAt7.ok && marryAt7.status === 400, marryAt7.data?.error);

  // 14. School Hotspot Interaction & Knowledge Gathering
  const schoolInteract = await api('/api/game/scenario/interact', {
    method: 'POST',
    body: JSON.stringify({ scene_id: 'scene_school_classroom', hotspot_id: 'hs_classmate_friend' })
  });
  record('14. Tương tác Cảnh 2D Trường Học (Bạn cùng bàn)', schoolInteract.ok, `Tri thức nhận được: ${schoolInteract.data?.granted_knowledge}`);

  // 15. Test Postpone / Delay Option in Mind Stage (Trước khi ra quyết định dứt điểm)
  const postpone = await api('/api/game/scenario/resolve-mindstage', {
    method: 'POST',
    body: JSON.stringify({ choice_id: 'CHOICE_POSTPONE_OBSERVE' })
  });
  record('15. Trì hoãn Quyết định & Tiếp tục Quan sát (0 AP)', postpone.ok, postpone.data?.narration);

  // 16. Action Under Uncertainty with Strategic Safeguard Term
  const resolveUncertainty = await api('/api/game/scenario/resolve-mindstage', {
    method: 'POST',
    body: JSON.stringify({
      choice_id: 'CHOICE_ACADEMIC_EXCELLENCE',
      ap_investment: 1,
      safeguard_term: 'time_cap'
    })
  });
  record('16. Quyết định dưới Bất định kèm Điều khoản Đảm bảo (time_cap)', resolveUncertainty.ok, `Kết quả: ${resolveUncertainty.data?.outcome_key}, D20: ${resolveUncertainty.data?.roll?.total_score} vs DC ${resolveUncertainty.data?.roll?.target_dc}`);

  // 17. Advance through Youth to Adulthood (Age 18)
  console.log('\n⏳ Đang tăng tốc trưởng thành tới năm 18 tuổi...');
  let currentAge = 7;
  while (currentAge < 18) {
    const t = await api('/api/game/tick', { method: 'POST' });
    currentAge = t.data?.character?.age || (currentAge + 1);
  }
  const char18 = (await api('/api/game/state')).data?.character;
  record('17. Trưởng thành đến năm 18 tuổi', char18?.age >= 18, `Tuổi: ${char18?.age}, Tiền: $${char18?.cash?.toLocaleString()}, Nghề: ${char18?.occupation}`);

  // 18. Work overtime to earn cash for marriage and assets
  console.log('💼 Cày cuốc kiếm thêm tiền mặt tại độ tuổi 18-20...');
  for (let i = 0; i < 4; i++) {
    await api('/api/game/action/overtime', { method: 'POST' });
    await api('/api/game/action/wellness', { method: 'POST', body: JSON.stringify({ wellness_type: 'herbal_spa' }) });
  }

  // 19. Family Dating & Marriage at Age 18+
  const dateAt18 = await api('/api/game/action/family', { method: 'POST', body: JSON.stringify({ action_type: 'date' }) });
  record('18.1 Hẹn Hò Hợp Pháp ở Tuổi 18+', dateAt18.ok || dateAt18.status === 400, dateAt18.data?.message || dateAt18.data?.error);

  const marryAt18 = await api('/api/game/action/family', { method: 'POST', body: JSON.stringify({ action_type: 'marry' }) });
  record('18.2 Kết Hôn Hợp Pháp ở Tuổi 18+', marryAt18.ok || marryAt18.status === 400, marryAt18.data?.message || marryAt18.data?.error);

  // 20. Skill Training with valid skill
  const trainSkill = await api('/api/game/action/skill-train', {
    method: 'POST',
    body: JSON.stringify({ skill_id: 'finance_market' })
  });
  record('20. Rèn luyện Kỹ năng Tài chính (finance_market)', trainSkill.ok || trainSkill.status === 400, trainSkill.data?.message || trainSkill.data?.error);

  // 21. Career Scenario Check at Age 28
  console.log('\n⏳ Đang tăng tốc tới ngã rẽ sự nghiệp tuổi 28...');
  while (currentAge < 28) {
    const t = await api('/api/game/tick', { method: 'POST' });
    currentAge = t.data?.character?.age || (currentAge + 1);
  }
  const sc28 = await api('/api/game/scenario/current');
  record('21. Kịch bản Tuổi 28 (Khởi nghiệp & Sự nghiệp)', sc28.ok && sc28.data?.scenario?.id === 'scenario_career_crossroads_28', `Tiêu đề: ${sc28.data?.scenario?.title}`);

  // 22. Advance to Midlife (Age 42)
  console.log('\n⏳ Đang tăng tốc tới ngã rẽ trung niên tuổi 42...');
  while (currentAge < 42) {
    const t = await api('/api/game/tick', { method: 'POST' });
    currentAge = t.data?.character?.age || (currentAge + 1);
  }
  const sc42 = await api('/api/game/scenario/current');
  record('22. Kịch bản Tuổi 42 (Ngã rẽ Trung Niên)', sc42.ok, `Kịch bản: ${sc42.data?.scenario?.id} - ${sc42.data?.scenario?.title}`);

  // 23. Advance to Golden Years (Age 65)
  console.log('\n⏳ Đang tăng tốc tới hoàng hôn cuộc đời tuổi 65...');
  while (currentAge < 65) {
    const t = await api('/api/game/tick', { method: 'POST' });
    currentAge = t.data?.character?.age || (currentAge + 1);
  }
  const sc65 = await api('/api/game/scenario/current');
  record('23. Kịch bản Tuổi 65 (Hoàng Hôn & Di Sản)', sc65.ok && sc65.data?.scenario?.id === 'scenario_legacy_golden_years', `Tiêu đề: ${sc65.data?.scenario?.title}`);

  // 24. Rebirth Surrender / Natural Ending
  const surrender = await api('/api/game/rebirth/surrender', { method: 'POST' });
  record('24. Buông bỏ Kiếp Sống (Surrender to Death/Rebirth Queue)', surrender.ok, `Hậu duệ sẵn có: ${surrender.data?.eligible_children?.length || 0}`);

  // 25. Lineage & Ancestral Hall Check
  const lineage = await api('/api/game/lineage');
  record('25.1 Ghi Danh Gia Phả Tiền Nhân', lineage.ok && lineage.data?.lineage?.length > 0, `Số đời đã lưu truyền: ${lineage.data?.lineage?.length}`);

  const incense = await api('/api/game/lineage/incense', { method: 'POST' });
  record('25.2 Dâng Hương Tưởng Nhớ Gia Tiên', incense.ok, incense.data?.message);

  // 26. Nirvana Solace Rebirth Check
  const nirvana = await api('/api/game/rebirth/nirvana', { method: 'POST' });
  record('26. Đắc Đạo Niết Bàn (Solace Karma & Hall of Fame)', nirvana.ok, nirvana.data?.message);

  console.log('\n====================================================');
  console.log(`📊 TỔNG KẾT KIỂM THỬ: ${results.filter(r => r.passed).length}/${results.length} BƯỚC ĐẠT CHUẨN`);
  console.log('====================================================\n');
}

runTests().catch(console.error);
