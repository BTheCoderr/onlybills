import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script, runInNewContext } from 'node:vm';

const page = readFileSync(new URL('../join.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const script = page.match(/<script>([\s\S]*?)<\/script>/)?.[1];

test('a single consent-based Netlify waitlist captures four genuinely useful audiences', () => {
  assert.ok(script);
  assert.doesNotThrow(() => new Script(script));
  assert.match(page, /<form name="onlybills-early-access"[^>]*data-netlify="true"/);
  assert.match(page, /action="\/thanks"/);
  assert.match(page, /name="email"[^>]*required/);
  assert.match(page, /name="consent" value="yes" required/);
  assert.match(page, /netlify-honeypot="bot-field"/);
  for (const type of ['need-help','want-to-help','business-creator','curious']) {
    assert.match(page, new RegExp('name="intent" value="' + type + '"'));
    assert.match(page, new RegExp('data-segment="' + type + '"'));
  }
  for(const field of ['expense_category','urgency','support_preference','comfortable_amount','pilot_interest','organization','state_region','referrer','campaign']) {
    assert.match(page, new RegExp('name="' + field + '"'));
  }
  assert.match(page, /This is not a donation, authorization, or commitment to pay/);
  assert.match(page, /not an application for funds or emergency assistance/);
  assert.doesNotMatch(page, /name="password"|name="ssn"|name="account_number"|name="income"|name="bank_account"/);
});

test('relevant questions are shown and others are disabled for each role', () => {
  const roleNames=['need-help','want-to-help','business-creator','curious'];
  const roleInputs=roleNames.map(value=>({value,checked:false,events:{},addEventListener(type,fn){this.events[type]=fn}}));
  const sections=roleNames.map(role=>{
    const fieldsets=[];
    if(role==='need-help')fieldsets.push('expense_category','urgency');
    if(role==='want-to-help')fieldsets.push('support_preference');
    if(role==='business-creator')fieldsets.push('pilot_interest');
    const groups=fieldsets.map(name=>{
      const radios=[0,1,2].map(()=>({type:'radio',value:name,disabled:false,required:false,checked:false}));
      return {querySelectorAll(selector){assert.equal(selector,'input[type="radio"]');return radios},radios};
    });
    const options=groups.flatMap(g=>g.radios);
    if(role==='want-to-help')options.push({type:'select-one',value:'',disabled:false,required:false});
    if(role==='business-creator')options.push({type:'text',value:'',disabled:false,required:false});
    return {dataset:{segment:role},hidden:true,options,groups,querySelectorAll(selector){
      return selector==='input,select,textarea'?options:selector==='fieldset'?groups:[];
    }};
  });
  const attrs={'signup-source':{value:''},'signup-campaign':{value:''}};
  const document={
    getElementById(id){assert.ok(attrs[id],id);return attrs[id]},
    querySelectorAll(selector){
      if(selector==='input[name="intent"]')return roleInputs;
      if(selector==='[data-segment]')return sections;
      return [];
    },
    querySelector(selector) {
      const picked=roleInputs.find(x=>x.checked);
      if(selector==='input[name="intent"]:checked')return picked||null;
      const match=selector.match(/^input\[name="intent"\]\[value="([^"]+)"\]$/);
      return match?roleInputs.find(x=>x.value===match[1]):null;
    }
  };
  class Params {constructor(s){this.params=Object.fromEntries(String(s).replace(/^\?/,'').split('&').map(v=>v.split('=')))}get(k){return this.params[k]||null}}
  runInNewContext(script,{document,window:{location:{search:'?utm_source=instagram&utm_campaign=comment&intent=need-help'}},URLSearchParams:Params});
  assert.equal(attrs['signup-source'].value,'instagram');
  assert.equal(attrs['signup-campaign'].value,'comment');
  assert.equal(sections.filter(s=>!s.hidden).length,1);
  assert.equal(sections[0].hidden,false);
  assert.ok(sections[0].options.every(f=>!f.disabled));
  assert.ok(sections[1].options.every(f=>f.disabled));
  assert.ok(sections[0].groups.every(g=>g.radios.filter(f=>f.required).length===1));
  for(const role of ['want-to-help','business-creator','curious']){
    roleInputs.forEach(x=>x.checked=x.value===role);
    roleInputs.find(x=>x.value===role).events.change();
    assert.equal(sections.filter(s=>!s.hidden).length,1);
    assert.equal(sections.find(s=>!s.hidden).dataset.segment,role);
    assert.ok(sections.filter(s=>s.hidden).flatMap(s=>s.options).every(f=>f.disabled));
  }
});

test('account pilot never claims payment, uploads, or confirmed email delivery', () => {
  assert.match(app,/Private requests are not open yet/);
  assert.match(app,/No money is collected, and private bill uploads are not open yet/);
  assert.match(app,/next=mode==='signup'\?'dashboard'/);
  assert.match(app,/Real accounts are coming/);
  assert.match(app,/Account pilot uses Supabase Auth/);
});
