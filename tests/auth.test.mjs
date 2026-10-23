import test from 'node:test';
import assert from 'node:assert/strict';
import { initialize, isDemo, user, signUp, signOut, requestPasswordReset, resendConfirmation, updatePassword } from '../src/backend.js';

const memory = new Map();
global.localStorage = { getItem: key => memory.get(key) ?? null, setItem: (key, val) => memory.set(key,val), removeItem: key => memory.delete(key) };
await initialize();

test('demo signup remembers a non-privileged onboarding preference', async () => {
  await assert.rejects(signUp('Admin Test','admin@onlybills.test','longpassword','admin'),/Choose how/);
  await signUp('Requester Test','requester@onlybills.test','longpassword','requester');
  assert.equal(user().signup_intent, 'requester');
  await signOut();
  await signUp('Supporter Test','supporter@onlybills.test','longpassword','supporter');
  assert.equal(user().signup_intent, 'supporter');
});

test('demo mode never claims it sent a recovery or verification email', async () => {
  assert.equal(isDemo(), true);
  await assert.rejects(requestPasswordReset('someone@example.com'), /requires a connected Supabase/);
  await assert.rejects(resendConfirmation('someone@example.com'), /Connect Supabase/);
  await assert.rejects(updatePassword('newpassword123'), /requires a connected Supabase/);
});
