import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const generator = fileURLToPath(new URL('../scripts/prepare-deployment.mjs', import.meta.url));
function runBuild(changes = {}) {
  const dir=mkdtempSync(join(tmpdir(),'onlybills-build-'));
  mkdirSync(join(dir,'src'));
  const env={...process.env,
    ONLYBILLS_ACCOUNTS_ENABLED:'',
    ONLYBILLS_PRIVATE_INTAKE_ENABLED:'',
    ONLYBILLS_PUBLIC_FEED_ENABLED:'',
    ONLYBILLS_SUPABASE_URL:'',
    ONLYBILLS_SUPABASE_PUBLISHABLE_KEY:'',
    ...changes,
  };
  try {
    const message=execFileSync(process.execPath,[generator],{cwd:dir,env,encoding:'utf8'});
    const script=readFileSync(join(dir,'src','runtime-config.js'),'utf8');
    return {message,script};
  } finally {rmSync(dir,{recursive:true,force:true})}
}

test('default deployment is safe demo mode', () => {
  const x=runBuild();
  assert.match(x.script,/enabled": false/);
  assert.match(x.script,/privateIntakeEnabled": false/);
  assert.match(x.script,/publicFeedEnabled": false/);
  assert.match(x.script,/export const RUNTIME_CONFIG/);
});

test('partial or secret credentials fail the build, rather than enabling uploads', () => {
  assert.throws(()=>runBuild({ONLYBILLS_ACCOUNTS_ENABLED:'1'}),/Command failed/);
  assert.throws(()=>runBuild({ONLYBILLS_PRIVATE_INTAKE_ENABLED:'1'}),/Command failed/);
  assert.throws(()=>runBuild({ONLYBILLS_PUBLIC_FEED_ENABLED:'1'}),/Command failed/);
  assert.throws(()=>runBuild({ONLYBILLS_ACCOUNTS_ENABLED:'1',ONLYBILLS_SUPABASE_URL:'http://localhost:54321',ONLYBILLS_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_testtoken0123456789012'}),/Command failed/);
  assert.throws(()=>runBuild({ONLYBILLS_ACCOUNTS_ENABLED:'1',ONLYBILLS_SUPABASE_URL:'https://validproject.supabase.co',ONLYBILLS_SUPABASE_PUBLISHABLE_KEY:'sb_secret_not_browser_safe_key_12345'}),/Command failed/);
});

test('account activation never implies opening uploads, public requests, or payments', () => {
  const vars={ONLYBILLS_ACCOUNTS_ENABLED:'1',ONLYBILLS_SUPABASE_URL:'https://onlybills-qa.supabase.co',ONLYBILLS_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_123456789012345678901234567890'};
  const result=runBuild(vars);
  assert.match(result.script,/enabled": true/);
  assert.match(result.script,/privateIntakeEnabled": false/);
  assert.match(result.script,/publicFeedEnabled": false/);
  assert.doesNotMatch(result.script,/service_role|sb_secret/);
  const intake=runBuild({...vars,ONLYBILLS_PRIVATE_INTAKE_ENABLED:'1'});
  assert.match(intake.script,/privateIntakeEnabled": true/);
  assert.match(intake.script,/publicFeedEnabled": false/);
});

test('schema isolates elevated functions and refuses fabricated funding records', () => {
  const sql=read('supabase/migrations/0001_onlybills.sql');
  assert.match(sql,/create schema if not exists private;/);
  assert.match(sql,/create or replace function private\.is_admin/);
  assert.match(sql,/create or replace function public\.is_admin\(\)[\s\S]+?security invoker/);
  assert.match(sql,/private\.check_bill_submission/);
  assert.match(sql,/storage\.objects[\s\S]+?owner_id = new\.user_id::text/);
  assert.match(sql,/count\(\*\)[\s\S]+?pending_review/);
  assert.match(sql,/revoke insert on public\.pledges from anon, authenticated/);
  assert.doesNotMatch(sql,/grant insert \(bill_id, donor_id, amount_cents\)/);
  assert.doesNotMatch(sql,/security definer set search_path = public/);
  assert.match(sql,/enable row level security/g);
  assert.match(sql,/Uploader may clean unused evidence/);
});

test('client enforces a closed pilot until the server and verified email are ready', () => {
  const backend=read('src/backend.js'),app=read('src/app.js'),config=read('src/config.js');
  assert.match(backend,/!CONFIG\.publicFeedEnabled/);
  assert.match(backend,/!CONFIG\.privateIntakeEnabled/);
  assert.match(backend,/currentUser\.email_confirmed_at/);
  assert.match(backend,/not accepting payment or funding pledges/);
  assert.match(config,/RUNTIME_CONFIG/);
  assert.match(app,/CLOSED INTAKE PILOT/);
  assert.match(app,/name="adult" type="checkbox" required/);
  assert.match(app,/Real accounts are coming/);
  assert.match(app,/canBrowseRealBills/);
});
