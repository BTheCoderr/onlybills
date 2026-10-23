import test from 'node:test';
import assert from 'node:assert/strict';
import { money, moneyExact, parseDollars, remaining, progress, esc, validateRequest, validateDocument } from '../src/utils.js';

const good = { alias: 'Jordan P.', title: 'A little help with utilities', story: 'An emergency repair left me short this month and some support would really help.', category: 'Utilities', amount: '250.00', city: 'Providence, RI', due_date: '2026-11-15' };
test('money and input conversion', () => {
  assert.equal(money(25000), '$250');
  assert.equal(moneyExact(115), '$1.15');
  assert.equal(parseDollars('$1,234.56'), 123456);
  assert.equal(parseDollars('garbage'), NaN);
});
test('pledge progress boundaries', () => {
  const bill = { amount_cents: 20000, pledged_cents: 3500 };
  assert.equal(remaining(bill), 16500);
  assert.equal(progress(bill), 18);
  assert.equal(remaining({ amount_cents: 100, pledged_cents: 150 }), 0);
});
test('text is HTML escaped', () => {
  assert.equal(esc('<script>"x" & y</script>'), '&lt;script&gt;&quot;x&quot; &amp; y&lt;/script&gt;');
});
test('request checks', () => {
  assert.equal(validateRequest(good), null);
  assert.match(validateRequest({ ...good, amount: '0' }), /between/);
  assert.match(validateRequest({ ...good, story: 'hi' }), /35/);
  assert.match(validateRequest({ ...good, category: 'Crypto' }), /category/);
});
test('document rejects missing, unknown or oversized files', () => {
  assert.match(validateDocument(null), /Upload/);
  assert.match(validateDocument({type:'text/html',size:100}), /PDF/);
  assert.match(validateDocument({type:'application/pdf',size:9000000}), /8 MB/);
  assert.equal(validateDocument({type:'application/pdf',size:2000}), null);
});
