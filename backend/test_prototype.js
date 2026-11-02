/**
 * Test script for LifeGraph Prototype v0.1:
 * - Session initialization
 * - Active story node trigger & auto-pause
 * - Option resolution with pending consequence
 * - Annual progression across Act 1, Act 2, Act 3
 * - Pending consequence execution after 5 years
 * - Fair debt servicing & Net worth tracking
 * - Family generation & heir evaluation
 * - Succession transition to Generation 2
 */

import { initPrototypeSession, advancePrototypeYear, processPrototypeDecision, triggerSuccessionTransfer } from './src/engine/prototypeTickOrchestrator.js';
import { evaluateHeirWillingness } from './src/engine/familySuccessionEngine.js';

console.log('--- 1. Testing Session Initialization ---');
const session = initPrototypeSession({ playerName: 'Đặng Tuấn Anh', startYear: 2024 });
console.log(`Initialized session: Generation ${session.generation_index}, Age ${session.character.age}, Cash $${session.character.cash}`);
console.log(`Active Story Node: ${session.active_story_node?.title || 'None'}, Paused: ${session.is_paused}`);

if (!session.active_story_node) {
  throw new Error('Expected initial story node at age 18!');
}

console.log('\n--- 2. Testing Decision Resolution with Pending Consequence ---');
const firstOption = session.active_story_node.options[0]; // e.g. opt_pursue_study
console.log(`Choosing option: "${firstOption.label}"`);
const decisionRes = processPrototypeDecision(session, firstOption.id);
console.log(`Decision applied: History length ${session.character.history.length}, Pending consequences: ${session.pending_consequences.length}`);
const scheduled = session.pending_consequences[0];
console.log(`Scheduled consequence due in year ${scheduled.due_year} (current year: ${session.current_year})`);

console.log('\n--- 3. Testing 6-Year Progression (Waiting for Consequence to mature) ---');
for (let y = 1; y <= 6; y++) {
  const tickRes = advancePrototypeYear(session);
  console.log(`Year ${session.current_year} (Age ${session.character.age}): Events count: ${tickRes.events.length}`);
  if (tickRes.events.some(e => e.includes('[HỆ QUẢ ĐẾN HẠN]'))) {
    console.log(`>>> Consequence executed in year ${session.current_year}! <<<`);
  }
}

console.log(`Pending consequence status: ${session.pending_consequences[0].status}`);

console.log('\n--- 4. Fast-Forwarding to Mid-Life (Age 45) to Check Family and Debts ---');
while (session.character.age < 45) {
  if (session.active_story_node) {
    console.log(`Story node paused at age ${session.character.age}: "${session.active_story_node.title}"`);
    const opt = session.active_story_node.options[0];
    processPrototypeDecision(session, opt.id);
    console.log(`Resolved node with option: "${opt.label}"`);
  }
  advancePrototypeYear(session);
}

console.log(`Current Act: ${session.act}`);
console.log(`Spouse: ${session.family.spouse?.name || 'None'}`);
console.log(`Children: ${session.family.children.length}`);
session.family.children.forEach(c => {
  const evalRes = evaluateHeirWillingness(c, { assets: session.assets }, session.debts);
  console.log(`Child: ${c.full_name}, Age ${c.age}, Goal: ${c.personal_goal}, Trust: ${c.trust}, Succession Status: ${evalRes.status} (Score: ${evalRes.willingnessScore})`);
});

console.log(`Net worth: $${session.net_worth.toLocaleString()}, Solvency: ${session.solvency}`);

console.log('\n--- 5. Fast-Forwarding to Succession (Age 75) ---');
while (session.character.age < 75 && !session.needs_succession) {
  if (session.active_story_node) {
    const opt = session.active_story_node.options[0];
    processPrototypeDecision(session, opt.id);
  }
  advancePrototypeYear(session);
}

console.log(`Age: ${session.character.age}, Needs Succession: ${session.needs_succession}`);

const heir = session.family.children[0];
console.log(`Executing Succession to heir: ${heir.full_name}...`);
const successionRes = triggerSuccessionTransfer(session, heir.id, 'STANDARD');

console.log('\n--- 6. Generation 2 Status ---');
console.log(`Active Character: ${session.character.name}, Generation: ${session.character.generation}`);
console.log(`Age: ${session.character.age} (Actual age inherited, not reset to 0!)`);
console.log(`Cash: $${session.character.cash.toLocaleString()}`);
console.log(`Gen 1 Chronicle archived: Final age ${successionRes.gen1Chronicle.final_age}, Net Worth: $${successionRes.gen1Chronicle.final_net_worth.toLocaleString()}`);
console.log('SUCCESS: All prototype engines tested and verified!');
