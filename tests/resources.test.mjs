import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext, Script } from 'node:vm';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const html = read('resources.html');

test('seven public U.S. resource cards, safe outbound links, and no data collection', () => {
  assert.equal((html.match(/<article class="help-card" data-resource/g)||[]).length, 7);
  assert.match(html, /211\.org\/about-us\/your-local-211/);
  for (const domain of ['usa.gov','cms.gov','hud.gov','211.org']) {
    assert.ok(html.includes(domain), 'expected '+domain);
  }
  assert.doesNotMatch(html, /<form\b/i);
  assert.doesNotMatch(html, /type="password"|name="account_number"|name="ssn"/i);
  const targets=[...html.matchAll(/<a\s+[^>]*target="_blank"[^>]*href="([^"]+)"/g)];
  assert.ok(targets.length>=7);
  targets.forEach(x=>{const u=new URL(x[1]);assert.equal(u.protocol,'https:');assert.ok(['usa.gov','www.usa.gov','www.cms.gov','www.hud.gov','211.org','www.211.org'].includes(u.hostname));});
});
test('real resources are prominently linked on the landing, campaign and early-access pages', () => {
  assert.match(read('src/app.js'), /id="ob-help-hub"/);
  assert.match(read('src/app.js'), /href="\.\/help"/);
  assert.match(read('idea.html'), /href="\/help"/);
  assert.match(read('join.html'), /href="\/help"/);
  assert.match(read('netlify.toml'), /from = "\/help"\s+to = "\/resources\.html"/);
  assert.match(read('netlify.toml'), /from = "\/resources"\s+to = "\/resources\.html"/);
});
test('category filters, text search and reset behave as expected', () => {
  const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];assert.ok(js);
  assert.doesNotThrow(()=>new Script(js));
  const cardEntries=[...html.matchAll(/<article class="help-card" data-resource data-category="([^"]+)" data-tags="([^"]+)" data-search="([^"]+)"/g)];
  const cards=cardEntries.map(([_,category,tags,search])=>({dataset:{category,tags,search},hidden:false}));
  const categories=['All','Utilities','Housing','Food','Medical','Phone','Transportation'];
  const buttons=categories.map(filter=>({dataset:{filter},attrs:{},on:{},setAttribute(k,v){this.attrs[k]=v},addEventListener(k,cb){this.on[k]=cb}}));
  const input={value:'',listeners:{},addEventListener(k,cb){this.listeners[k]=cb},focus(){}};
  const count={textContent:''},empty={hidden:true};
  const clear={cb:null,addEventListener(k,cb){this.cb=cb}};
  const showAll={cb:null,addEventListener(k,cb){this.cb=cb}};
  const els={'resource-search':input,'result-count':count,'empty-results':empty,'clear-search':clear,'show-all':showAll};
  const document={getElementById(id){assert.ok(els[id],'id '+id);return els[id]},querySelectorAll(q){return q==='[data-filter]'?buttons:q==='[data-resource]'?cards:[]}};
  runInNewContext(js,{document,window:{location:{search:'?category=Utilities'}},URLSearchParams,console});
  assert.equal(cards.filter(c=>!c.hidden).length,2,'211 + energy for utilities');
  buttons.find(b=>b.dataset.filter==='Phone').on.click();
  input.value='lifeline';input.listeners.input();
  assert.equal(cards.filter(c=>!c.hidden).length,1,'phone discount result');
  assert.match(count.textContent,/1 resource shown/);
  input.value='nonexistent';input.listeners.input();
  assert.equal(empty.hidden,false);
  clear.cb();
  assert.equal(cards.filter(c=>!c.hidden).length,7,'reset to all');
  assert.equal(buttons[0].attrs['aria-pressed'],'true');
  buttons.find(b=>b.dataset.filter==='Transportation').on.click();
  assert.equal(cards.filter(c=>!c.hidden).length,1,'211 for local transportation referrals');
});
test('no visitor search query is submitted or persisted',()=>{
  const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.doesNotMatch(script, /localStorage|sessionStorage|fetch\(|XMLHttpRequest|navigator\.sendBeacon/);
  assert.match(html,/Search and filters run only in your browser/);
});
