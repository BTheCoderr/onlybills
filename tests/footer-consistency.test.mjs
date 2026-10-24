import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const staticPages=['join.html','idea.html','impact.html','resources.html','contact.html'];
const requiredPaths=['/try','/#/how','/impact','/beta','/idea.html#vote','/help','/contact.html','/#/privacy','/#/terms'];

test('brand footer is consistent across interactive and static public pages',()=>{
 const app=read('src/app.js');
 const footerStart=app.indexOf('function foot()');
 const footerEnd=app.indexOf('function bottomNav(',footerStart);
 assert.ok(footerStart>=0&&footerEnd>footerStart);
 const footer=app.slice(footerStart,footerEnd);
 assert.match(footer,/class="obf obf--app"/);
 assert.match(footer,/Building a simpler, safer way for people to help/);
 assert.match(footer,/Currently a concept preview/);
 for(const path of requiredPaths)assert.ok(footer.includes('href="'+path+'"'),path);
 assert.doesNotMatch(footer,/OnlyBills\. MVP\.|Building it in public\.|pledge-only prototype/);
 for(const p of staticPages){
  const html=read(p);
  assert.equal((html.match(/<footer\b/g)||[]).length,1,'single footer: '+p);
  assert.match(html,/<link rel="stylesheet" href="\/brand-footer\.css">/,'stylesheet '+p);
  assert.match(html,/<footer class="obf"/,'footer '+p);
  assert.match(html,/© 2026 OnlyBills/,'copyright '+p);
  assert.match(html,/No payments, donations, or real bill uploads are available/,'honest disclosure '+p);
  for(const path of requiredPaths)assert.ok(html.includes('href="'+path+'"'),'link '+path+' on '+p);
  assert.doesNotMatch(html,/© 2026 OnlyBills\. MVP\./);
 }
 const index=read('index.html');
 assert.match(index,/href="\/brand-footer\.css"/);
});

test('footer CSS includes accessible controls, contrast-aware mobile layout and bottom-nav spacing',()=>{
 const css=read('brand-footer.css');
 assert.match(css,/\.obf__top\{display:grid/);
 assert.match(css,/\.obf__bottom\{display:grid/);
 assert.match(css,/@media\(max-width:620px\)/);
 assert.match(css,/\.obf\.obf--app\{padding-bottom:calc\(67px \+ env\(safe-area-inset-bottom\)\)/);
 assert.match(css,/:focus-visible/);
 assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length);
});

test('privacy and terms reflect the actual stage and waitlist data, not real transactions',()=>{
 const app=read('src/app.js');
 for(const phrase of ['role-specific answers','account access and private document intake are disabled','reviewed manually','No actual bill payment','A demo swipe or pledge is only an illustration']){
   assert.ok(app.includes(phrase),'missing '+phrase);
 }
 assert.doesNotMatch(app,/OnlyBills provides bill-story submissions, human moderation, discovery and nonbinding pledges/);
 assert.doesNotMatch(app,/the waitlist collects your name, email, whether you want to request or offer help/);
});
