import { CONFIG, IS_DEMO } from './config.js';
import { SEED_BILLS } from './data.js';
import { parseDollars, validateDocument, validateRequest, remaining } from './utils.js';

const STORAGE_KEY = 'onlybills_demo_v1';
let client = null;
let currentUser = null;

function readDemo() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      bills: Array.isArray(stored.bills) ? stored.bills : structuredClone(SEED_BILLS),
      pledges: Array.isArray(stored.pledges) ? stored.pledges : [],
      user: stored.user || null,
    };
  } catch { return { bills: structuredClone(SEED_BILLS), pledges: [], user: null }; }
}
function writeDemo(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

export async function initialize() {
  if (IS_DEMO) { currentUser = readDemo().user; return; }
  // Dynamically loaded only for a configured Supabase project; no dependency for local demo.
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.57.0');
  client = createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey, {
    auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
  });
  const { data, error } = await client.auth.getUser();
  if (!error) currentUser = data.user || null;
  client.auth.onAuthStateChange((event, session) => { currentUser = session?.user || null; window.dispatchEvent(new CustomEvent('onlybills:auth', { detail: { event } })); });
}

export function isDemo() { return IS_DEMO; }
export function user() { return currentUser; }
export function accountName() { return currentUser?.user_metadata?.full_name || currentUser?.name || currentUser?.email?.split('@')[0] || 'Friend'; }

export async function signIn(email, password) {
  if (IS_DEMO) {
    const d = readDemo(); const normalized = email.trim().toLowerCase(); d.user = { id: `demo:${normalized}`, email: normalized, name: normalized.split('@')[0] }; writeDemo(d); currentUser = d.user;
    return { message: 'You are signed in to a local demo account.' };
  }
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error; currentUser = data.user;
  return { message: 'Welcome back.' };
}
export async function signUp(name, email, password, intent = 'requester') {
  if (!['requester','supporter'].includes(intent)) throw new Error('Choose how you want to get started.');
  if (IS_DEMO) {
    const d = readDemo(); const normalized = email.trim().toLowerCase(); d.user = { id: `demo:${normalized}`, email: normalized, name, signup_intent: intent }; writeDemo(d); currentUser = d.user;
    return { message: 'Demo account ready. No email was sent.' };
  }
  const { data, error } = await client.auth.signUp({ email, password, options: { data: { full_name: name, signup_intent: intent }, emailRedirectTo: `${window.location.origin}${window.location.pathname}#/auth` } });
  if (error) throw error; currentUser = data.session ? data.user : null;
  return { message: data.session ? 'Account created.' : 'Check your email to confirm your account, then sign in.' };
}
export async function resendConfirmation(email) {
  if (IS_DEMO) throw new Error('Connect Supabase before sending verification emails.');
  const { error } = await client.auth.resend({ type: 'signup', email,
    options: { emailRedirectTo: `${window.location.origin}${window.location.pathname}#/auth` } });
  if (error) throw error;
  return { message: 'If this email needs verification, another confirmation link has been requested.' };
}
export async function requestPasswordReset(email) {
  if (IS_DEMO) throw new Error('Password recovery requires a connected Supabase project.');
  const redirectTo = `${window.location.origin}${window.location.pathname}?reset=1`;
  const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
  return { message: 'If an account exists, a password reset link will be sent.' };
}
export async function updatePassword(password) {
  if (IS_DEMO) throw new Error('Password recovery requires a connected Supabase project.');
  if (!currentUser) throw new Error('Open your password reset link again.');
  const { error } = await client.auth.updateUser({ password });
  if (error) throw error;
  return { message: 'Password updated. Your account is ready.' };
}

export async function signOut() {
  if (IS_DEMO) { const d = readDemo(); d.user = null; writeDemo(d); currentUser = null; return; }
  const { error } = await client.auth.signOut(); if (error) throw error; currentUser = null;
}

export async function getPublicBills() {
  if (IS_DEMO) return readDemo().bills.filter((b) => b.status === 'approved').sort((a, b) => b.created_at.localeCompare(a.created_at));
  const { data, error } = await client.from('public_bills').select('*').order('created_at', { ascending: false }).limit(100);
  if (error) throw error;
  return data;
}
export async function getMyBills() {
  if (!currentUser) return [];
  if (IS_DEMO) return readDemo().bills.filter((b) => b.user_id === currentUser.id).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const { data, error } = await client.from('bills').select('id,alias,title,story,category,city,amount_cents,pledged_cents,due_date,status,created_at').eq('user_id', currentUser.id).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
export async function getMyPledges() {
  if (!currentUser) return [];
  if (IS_DEMO) return readDemo().pledges.filter((p) => p.donor_id === currentUser.id).sort((a,b) => b.created_at.localeCompare(a.created_at));
  const { data, error } = await client.from('pledges').select('id,bill_id,amount_cents,created_at,status').eq('donor_id', currentUser.id).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function submitBill(input, document) {
  if (!currentUser) throw new Error('Please sign in before submitting a bill.');
  const formError = validateRequest(input); if (formError) throw new Error(formError);
  const docError = validateDocument(document); if (docError) throw new Error(docError);
  const bill = {
    alias: input.alias.trim(), title: input.title.trim(), story: input.story.trim(),
    category: input.category, city: (input.city || '').trim(), due_date: input.due_date || null,
    amount_cents: parseDollars(input.amount),
  };
  if (IS_DEMO) {
    const d = readDemo(); d.bills.unshift({ ...bill, id: crypto.randomUUID(), user_id: currentUser.id,
      document_filename: document.name, pledged_cents: 0, status: 'pending_review', created_at: new Date().toISOString() });
    writeDemo(d); return;
  }
  const ext = document.type === 'application/pdf' ? 'pdf' : document.type === 'image/png' ? 'png' : 'jpg';
  const path = `${currentUser.id}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await client.storage.from('bill-documents').upload(path, document, { contentType: document.type, upsert: false });
  if (uploadError) throw uploadError;
  const { error } = await client.from('bills').insert({ ...bill, user_id: currentUser.id, document_path: path });
  if (error) {
    await client.storage.from('bill-documents').remove([path]).catch(() => {});
    throw error;
  }
}

export async function submitPledge(billId, amountCents) {
  if (!Number.isSafeInteger(amountCents) || amountCents < 100) throw new Error('The minimum pledge is $1.');
  if (IS_DEMO) {
    const d = readDemo(); const bill = d.bills.find((b) => b.id === billId && b.status === 'approved');
    if (!bill) throw new Error('This request is no longer available.');
    if (amountCents > remaining(bill)) throw new Error('Pledge cannot exceed the remaining amount.');
    if (bill.user_id && currentUser?.id === bill.user_id) throw new Error('You cannot pledge to your own bill.');
    const pledge = { id: crypto.randomUUID(), bill_id: billId, donor_id: currentUser?.id || 'demo-guest', amount_cents: amountCents, created_at: new Date().toISOString(), status: 'pledged' };
    d.pledges.push(pledge); bill.pledged_cents += amountCents; writeDemo(d); return pledge;
  }
  if (!currentUser) throw new Error('Please sign in before pledging.');
  const { data, error } = await client.from('pledges').insert({ bill_id: billId, donor_id: currentUser.id, amount_cents: amountCents }).select('id').single();
  if (error) throw error; return data;
}

export async function simulateApproval(id) {
  if (!IS_DEMO) throw new Error('Review actions are only available in demo mode.');
  const d = readDemo(), bill = d.bills.find((b) => b.id === id && b.user_id === currentUser?.id);
  if (!bill) throw new Error('Bill not found.');
  bill.status = 'approved'; writeDemo(d);
}

export async function getAdminAccess() {
  if (IS_DEMO || !currentUser) return false;
  const { data, error } = await client.rpc('is_admin');
  if (error) throw error;
  return !!data;
}
export async function getPendingReviews() {
  if (!await getAdminAccess()) return [];
  const { data, error } = await client.from('bills').select('id,alias,title,category,amount_cents,document_path,created_at,city').eq('status','pending_review').order('created_at');
  if (error) throw error;
  return data;
}
export async function reviewBill(billId, action) {
  if (!['approved','rejected'].includes(action)) throw new Error('Invalid review action.');
  if (!await getAdminAccess()) throw new Error('Admin access required.');
  const { error } = await client.from('bills').update({ status: action }).eq('id', billId).eq('status', 'pending_review');
  if (error) throw error;
}
export async function getReviewDocumentUrl(path) {
  if (!await getAdminAccess()) throw new Error('Admin access required.');
  const { data, error } = await client.storage.from('bill-documents').createSignedUrl(path, 60);
  if (error) throw error;
  return data.signedUrl;
}
