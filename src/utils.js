export const CATEGORIES = ['Housing', 'Utilities', 'Transportation', 'Medical', 'Education', 'Essentials'];

export function money(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format((Number(cents) || 0) / 100);
}

export function moneyExact(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((Number(cents) || 0) / 100);
}

export function parseDollars(input) {
  const n = Number(String(input ?? '').replace(/[$,\s]/g, ''));
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
}

export function shortDate(date) {
  if (!date) return 'No date set';
  const d = new Date(`${date}T12:00:00`);
  return Number.isNaN(d.valueOf()) ? 'No date set' : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d);
}

export function remaining(bill) {
  return Math.max(0, (Number(bill.amount_cents) || 0) - (Number(bill.pledged_cents) || 0));
}

export function progress(bill) {
  if (!bill.amount_cents) return 0;
  return Math.min(100, Math.round(((bill.pledged_cents || 0) / bill.amount_cents) * 100));
}

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (s) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[s]);
}

export function initials(name) {
  return String(name || 'A').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}

export function validateRequest(input) {
  const title = String(input.title || '').trim();
  const story = String(input.story || '').trim();
  const alias = String(input.alias || '').trim();
  const city = String(input.city || '').trim();
  const amount = parseDollars(input.amount);
  if (alias.length < 2 || alias.length > 40) return 'Use a public display name between 2 and 40 characters.';
  if (title.length < 8 || title.length > 90) return 'Give your request a title between 8 and 90 characters.';
  if (story.length < 35 || story.length > 900) return 'Please share 35 to 900 characters of context.';
  if (!CATEGORIES.includes(input.category)) return 'Choose a bill category.';
  if (!Number.isFinite(amount) || amount < 500 || amount > 1000000) return 'Bill amount must be between $5 and $10,000.';
  if (city.length > 60) return 'City is too long.';
  if (input.due_date && !/^\d{4}-\d{2}-\d{2}$/.test(input.due_date)) return 'Enter a valid due date.';
  return null;
}

export function validateDocument(file) {
  if (!file) return 'Upload the bill or invoice so a reviewer can check the request.';
  if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) return 'Upload a PDF, JPG, or PNG.';
  if (file.size > 8 * 1024 * 1024) return 'Document must be smaller than 8 MB.';
  if (file.size === 0) return 'Document cannot be empty.';
  return null;
}
