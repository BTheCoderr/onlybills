// This file contains public flags only. Never add Supabase secrets to client code.
import { RUNTIME_CONFIG } from './runtime-config.js';

export const CONFIG = Object.freeze({
  siteName: 'OnlyBills',
  supabaseUrl: RUNTIME_CONFIG.supabaseUrl || '',
  supabaseAnonKey: RUNTIME_CONFIG.supabasePublishableKey || '',
  privateIntakeEnabled: RUNTIME_CONFIG.enabled === true && RUNTIME_CONFIG.privateIntakeEnabled === true,
  publicFeedEnabled: RUNTIME_CONFIG.enabled === true && RUNTIME_CONFIG.publicFeedEnabled === true,
});
export const IS_DEMO = RUNTIME_CONFIG.enabled !== true;
