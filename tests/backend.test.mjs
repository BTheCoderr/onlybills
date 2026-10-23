import test from 'node:test';
import assert from 'node:assert/strict';
import { initialize, isDemo, signUp, signOut, getMyBills, getPublicBills, getMyPledges, submitBill, submitPledge, simulateApproval } from '../src/backend.js';

const mem = new Map();
global.localStorage = { getItem: k => mem.get(k) || null, setItem: (k,v) => mem.set(k,v), removeItem: k => mem.delete(k) };
await initialize();

test('demo starts with fictional browseable requests', async()=>{
  assert.equal(isDemo(),true);
  assert.ok((await getPublicBills()).length >= 8);
});
test('submit, approval, pledge flow with separate demo accounts', async()=>{
  await signUp('Alice Example','alice@example.com','password');
  await submitBill({alias:'Alice E.',title:'A little help with the electric bill',story:'I had a surprise expense this month and help with utilities would keep me on track.',category:'Utilities',city:'Providence, RI',amount:'120',due_date:'2026-11-10'}, {type:'application/pdf',size:2000,name:'evidence.pdf'});
  let mine=await getMyBills();
  assert.equal(mine.length,1);
  assert.equal(mine[0].status,'pending_review');
  assert.equal((await getPublicBills()).some(b=>b.id===mine[0].id),false);
  await simulateApproval(mine[0].id);
  mine=await getMyBills();
  assert.equal(mine[0].status,'approved');
  await assert.rejects(submitPledge(mine[0].id,1000),/own bill/);
  await signOut();
  await signUp('Bob Example','bob@example.com','password');
  const pledged=await submitPledge(mine[0].id,2500);
  assert.ok(pledged.id);
  assert.equal((await getMyPledges()).length,1);
  const publicBill=(await getPublicBills()).find(b=>b.id===mine[0].id);
  assert.equal(publicBill.pledged_cents,2500);
  await assert.rejects(submitPledge(mine[0].id,10000),/exceed/);
});
