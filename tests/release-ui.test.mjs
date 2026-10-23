import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';

const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

test('release assets and honest metadata', () => {
  const index = read('index.html');
  assert.match(index, /release-ui\.css/);
  assert.match(index, /prototype/i);
  assert.match(index, /No payments yet/i);
  const manifest = JSON.parse(read('manifest.webmanifest'));
  assert.match(manifest.description, /payments not enabled/i);
  assert.match(read('assets/icon.svg'), /#20312b/);
});

test('campaign provides functional examples and a Netlify research form', () => {
  const html = read('idea.html');
  assert.match(html, /campaign\.css/);
  assert.match(html, /id="lp-pass"/);
  assert.match(html, /id="lp-support"/);
  assert.match(html, /role="status"/);
  assert.match(html, /<form name="onlybills-concept-pulse"[^>]+data-netlify="true"/);
  assert.match(html, /action="\/poll-thanks"/);
  for (const field of ['form-name','role','interest','trust','campaign','referrer']) {
    assert.match(html, new RegExp('name="' + field + '"'));
  }
  assert.match(html, /fictional/i);
  assert.doesNotMatch(html, /type="password"/);
  const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script);
  assert.doesNotThrow(() => new Script(script));
});

test('email waitlist keeps consent and supports role preselection', () => {
  const html = read('join.html');
  assert.match(html, /campaign\.css/);
  assert.match(html, /<form name="onlybills-early-access"[^>]+data-netlify="true"/);
  assert.match(html, /action="\/thanks"/);
  assert.match(html, /type="email"/);
  assert.match(html, /name="consent"[^>]+required/);
  assert.match(html, /params\.get\("intent"\)/);
  assert.doesNotMatch(html, /type="password"/);
  assert.doesNotThrow(() => new Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]));
});

test('home route keeps swipe experience and fictional disclosures', () => {
  const js = read('src/app.js');
  assert.match(js, /function newLaunchHomePage\(/);
  assert.match(js, /return isDemo\(\) \? newLaunchHomePage\(\) : legacyHomePage\(\)/);
  assert.match(js, /Fictional requests/);
  assert.match(js, /No payments/);
  assert.match(js, /#\/discover/);
  assert.match(js, /intent=need-help/);
  assert.match(js, /intent=want-to-help/);
});

test('short links and responsive release CSS are present', () => {
  const netlify = read('netlify.toml');
  assert.match(netlify, /from = "\/try"/);
  assert.match(netlify, /from = "\/beta"/);
  for (const content of [read('release-ui.css'),read('campaign.css')]) {
    assert.equal((content.match(/\{/g) || []).length, (content.match(/\}/g) || []).length);
    assert.match(content, /@media/);
  }
});
