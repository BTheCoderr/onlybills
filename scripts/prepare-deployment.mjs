// Netlify deployment-time configuration. This file writes PUBLIC browser settings only.
// Fail closed. Never emit service-role, sb_secret, JWT secret, or SMTP credentials.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const env = process.env;
const enabled = env.ONLYBILLS_ACCOUNTS_ENABLED === '1';
const intake = env.ONLYBILLS_PRIVATE_INTAKE_ENABLED === '1';
const feed = env.ONLYBILLS_PUBLIC_FEED_ENABLED === '1';
const value = {
  enabled: false,
  supabaseUrl: '',
  supabasePublishableKey: '',
  privateIntakeEnabled: false,
  publicFeedEnabled: false,
};
const fail = (reason) => { throw new Error('OnlyBills safe build blocked: ' + reason); };

if (intake && !enabled) fail('private uploads require ONLYBILLS_ACCOUNTS_ENABLED=1');
if (feed && !enabled) fail('public feed requires ONLYBILLS_ACCOUNTS_ENABLED=1');

if (enabled) {
  const url = (env.ONLYBILLS_SUPABASE_URL || '').trim();
  const key = (env.ONLYBILLS_SUPABASE_PUBLISHABLE_KEY || '').trim();

  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url)) {
    fail('set a valid HTTPS OnlyBills Supabase project URL');
  }
  if (!/^sb_publishable_[A-Za-z0-9_-]{15,}$/.test(key)) {
    fail('use a Supabase publishable browser key (sb_publishable_...), never a secret or service key');
  }
  if (Object.keys(env).some((name)=>name.startsWith('ONLYBILLS_') &&
    /(SERVICE_ROLE|SB_SECRET|JWT_SECRET|PRIVATE_KEY|SMTP_PASSWORD)/.test(name))) {
    fail('server-only credential found with an OnlyBills deployment prefix; do not mix it into static hosting');
  }
  Object.assign(value, {
    enabled: true,
    supabaseUrl: url.replace(/\/$/, ''),
    supabasePublishableKey: key,
    privateIntakeEnabled: intake,
    publicFeedEnabled: feed,
  });
}

const out = join(process.cwd(), 'src', 'runtime-config.js');
writeFileSync(out, '// Generated at deploy. Public config only.\nexport const RUNTIME_CONFIG = ' + JSON.stringify(value, null, 2) + ';\n', 'utf8');
console.log(enabled ? 'OnlyBills: account features configured (public feed and uploads remain separately gated).' : 'OnlyBills: safe public demo mode; no accounts or uploads.');
