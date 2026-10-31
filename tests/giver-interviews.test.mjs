import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('givers.html'), thanks=read('giver-thanks.html'), net=read('netlify.toml');

test('short pilot interview form is captured by Netlify and does not ask for financial data',()=>{
  assert.equal((html.match(/<form\b/g)||[]).length,1);
  assert.match(html,/<form class="lead-form" name="onlybills-giver-interviews" method="POST" action="\/giver-thanks" data-netlify="true" netlify-honeypot="bot-field">/);
  for(const f of ["form-name","giver_role","trust_priority","consideration_range","interview_interest","name","organization","email","consent","updates","bot-field","source","campaign"]){
    assert.match(html,new RegExp('name="'+f+'"'));
  }
  assert.match(html,/name="email"[^>]*required/);
  assert.match(html,/name="consent" value="yes" required/);
  assert.match(html,/name="updates" value="yes"/);
  assert.match(html,/name="interview_interest" id="interview" required/);
  assert.match(html,/not a donation request/);
  assert.doesNotMatch(html,/type="file"|name="card_number"|name="account_number"|name="bank_account"|name="ssn"/);
  assert.match(net,/from = "\/giver-thanks"\s+to = "\/giver-thanks\.html"\s+status = 200/);
});
test('all signup calls to action scroll to the page form without redirecting to generic beta signup',()=>{
  const linkTags=[...html.matchAll(/<a\b[^>]*data-role-pick="(individual|business)"[^>]*>/g)];
  assert.ok(linkTags.length>=4,'expected multiple in-page links');
  linkTags.forEach(m=>{assert.match(m[0],/href="#founding-join"/);assert.doesNotMatch(m[0],/data-ob-funnel/);});
  assert.match(html,/id="founding-join"/);
  assert.match(html,/link\.addEventListener\('click'/);
  assert.match(html,/window\.OnlyBillsMetrics\.track\('giver-click'\)/);
  const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length,1);
  assert.doesNotThrow(()=>new Script(scripts[0][1]));
});
test('thank-you copy does not falsely claim successful donations or guaranteed pilot access',()=>{
  assert.match(thanks,/If your submission was accepted/);
  assert.match(thanks,/This isn't a donation or financial commitment/);
  assert.match(thanks,/no money has been collected/);
  assert.match(thanks,/<meta name="robots" content="noindex"/);
});
