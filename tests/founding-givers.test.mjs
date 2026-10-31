import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext,Script} from 'node:vm';

const read = path => readFileSync(new URL('../'+path, import.meta.url), 'utf8');
const giver=read('givers.html'), idea=read('idea.html'), join=read('join.html');
const app=read('src/app.js'), net=read('netlify.toml'), events=read('src/anon-events.js');

test('Founding Givers explains the pilot without collecting or promising payments',()=>{
  assert.match(giver,/Join as a potential Giver/);
  assert.match(giver,/approved partner/);
  assert.match(giver,/not a donation request/);
  assert.match(giver,/This is a research invitation/);
  assert.match(giver,/data-role-pick="business"/);
  assert.match(giver,/data-role-pick="individual"/);
  assert.match(giver,/href="#founding-join"/);
  assert.match(giver,/class="obf"/);
  assert.match(giver,/href="\/brand-footer\.css"/);
  assert.equal((giver.match(/<form\b/g)||[]).length,1,'Only one Netlify-native interview form');
  assert.match(giver,/name="onlybills-giver-interviews" method="POST" action="\/giver-thanks" data-netlify="true"/);
  assert.match(giver,/name="consent" value="yes" required/);
  assert.doesNotMatch(giver,/name="card"|stripe|paypal/i);
  assert.match(net,/from = "\/givers"\s+to = "\/givers\.html"\s+status = 200/);
});
test('home, demo and beta all expose the Giver path',()=>{
  assert.match(app,/data-ob-funnel="giver-click"/);
  assert.match(app,/data-ob-funnel="source-bridge"/);
  assert.match(app,/href="\/givers"/);
  assert.match(idea,/href="\/givers"/);
  assert.match(join,/name="intent" value="want-to-help"/);
  assert.match(join,/name="intent" value="business-creator"/);
  assert.match(idea,/demo-start/);
  assert.match(idea,/demo-complete/);
  assert.match(join,/giver-form-submit/);
  assert.match(join,/business-form-submit/);
});
test('Netlify serves events as static first-party pixels with no dynamic endpoint',()=>{
  assert.match(events,/globalPrivacyControl/);
  assert.match(events,/doNotTrack/);
  assert.match(events,/source/);
  assert.match(events,/campaign/);
  assert.doesNotMatch(events,/localStorage|sessionStorage|userId|fingerprint|document\.cookie|email|phoneNumber/);
  for(const name of ['demo-start','demo-complete','giver-click','giver-form-submit','business-form-submit']){
    assert.match(net,new RegExp('from = "/events/'+name+'\\.gif"'));
  }
  assert.match(net,/to = "\/assets\/pixel\.gif"/);
  assert.match(net,/Cache-Control = "no-store, max-age=0"/);
  assert.doesNotThrow(()=>new Script(events));
});
test('anonymous source/campaign survive page changes and only allowed events are requested',()=>{
  const listeners={};
  let requests=[];
  function ImageStub(){Object.defineProperty(this,'src',{set(v){requests.push(v)}})}
  const window={location:{search:'?utm_source=instagram&utm_campaign=founding_givers&utm_content=external&fbclid=SECRET',origin:'https://onlybillss.netlify.app'}};
  const document={addEventListener(name,fn){listeners[name]=fn}};
  const navigator={globalPrivacyControl:false,doNotTrack:'0'};
  runInNewContext(events,{window,document,navigator,URL,URLSearchParams,Image:ImageStub,encodeURIComponent});
  assert.equal(window.OnlyBillsMetrics.decorate('/givers','founding_givers'),'/givers?utm_source=instagram&utm_campaign=founding_givers');
  assert.equal(window.OnlyBillsMetrics.decorate('/beta?intent=want-to-help','founding_givers'),'/beta?intent=want-to-help&utm_source=instagram&utm_campaign=founding_givers');
  assert.equal(window.OnlyBillsMetrics.track('wrong'),false);
  assert.equal(requests.length,0);
  assert.equal(window.OnlyBillsMetrics.track('demo-start'),true);
  assert.equal(requests.length,1);
  assert.match(requests[0],/^\/events\/demo-start\.gif\?source=instagram&campaign=founding_givers$/);
  navigator.globalPrivacyControl=true;
  assert.equal(window.OnlyBillsMetrics.track('demo-complete'),false);
  assert.equal(requests.length,1);
});
test('icons, sitemap and crawl settings exist; unwanted 404 targets fixed',()=>{
  const png=readFileSync(new URL('../apple-touch-icon.png',import.meta.url));
  const gif=readFileSync(new URL('../assets/pixel.gif',import.meta.url));
  assert.equal(png.toString('hex',0,8),'89504e470d0a1a0a');
  assert.equal(gif.toString('ascii',0,6),'GIF89a');
  assert.match(read('index.html'),/rel="apple-touch-icon"/);
  assert.match(read('manifest.webmanifest'),/apple-touch-icon\.png/);
  assert.match(net,/from = "\/apple-touch-icon-precomposed\.png"/);
  assert.match(read('robots.txt'),/Sitemap: https:\/\/onlybillss\.netlify\.app\/sitemap\.xml/);
  assert.match(read('sitemap.xml'),/https:\/\/onlybillss\.netlify\.app\/givers/);
});
test('production is a prototype: genuine uploads and bill payments remain disabled by default',()=>{
  const cfg=read('src/runtime-config.js');
  assert.match(cfg,/enabled: false/);
  assert.match(cfg,/privateIntakeEnabled: false/);
  assert.match(cfg,/publicFeedEnabled: false/);
  assert.match(giver,/No payments, donations, or real bill uploads are available/);
});
