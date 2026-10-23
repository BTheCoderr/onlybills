// Public browser configuration. The anon key is intentionally public; database safety comes from RLS.
// Copy this file's sample values into a deployment-specific edit. NEVER put a service_role key here.
export const CONFIG = {
  supabaseUrl: '',
  supabaseAnonKey: '',
  // Set to true ONLY for local demos. Production switches automatically to Supabase when configured.
  siteName: 'OnlyBills',
};
export const IS_DEMO = !(CONFIG.supabaseUrl && CONFIG.supabaseAnonKey);
