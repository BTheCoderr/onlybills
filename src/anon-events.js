/* OnlyBills, first-party anonymous funnel signals. No cookies, unique identifiers or financial data. */
(function(){
  'use strict';
  var approved=['demo-start','demo-complete','giver-click','giver-form-submit','business-form-submit'];
  function safe(v,fallback){return String(v||fallback).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,32)||fallback}
  function params(){return new URLSearchParams(window.location.search)}
  function context(){
    var p=params();
    return {source:safe(p.get('utm_source'),'direct'),campaign:safe(p.get('utm_campaign'),'organic')};
  }
  var pixels=[];
  function track(event){
    if(!approved.includes(event))return false;
    if(navigator.globalPrivacyControl===true||navigator.doNotTrack==='1'||window.ONLYBILLS_DISABLE_MEASUREMENT===true)return false;
    try {
      var ctx=context(),img=new Image();
      pixels.push(img);if(pixels.length>8)pixels.shift();
      img.src='/events/'+event+'.gif?source='+encodeURIComponent(ctx.source)+'&campaign='+encodeURIComponent(ctx.campaign);
      return true;
    }catch(_){return false}
  }
  function decorated(url,campaign){
    var path=new URL(url,window.location.origin);
    if(path.origin!==window.location.origin)return url;
    var p=params(),src=safe(p.get('utm_source'),'site'),camp=safe(p.get('utm_campaign'),campaign||'founding_givers');
    path.searchParams.set('utm_source',src);
    path.searchParams.set('utm_campaign',camp);
    return path.pathname+path.search+path.hash;
  }
  document.addEventListener('click',function(e){
    var anchor=e.target.closest('a[data-ob-funnel]');
    if(!anchor)return;
    track(anchor.dataset.obFunnel);
    var url=anchor.getAttribute('href');
    if(!url)return;
    anchor.href=decorated(url,anchor.dataset.obCampaign);
  });
  window.OnlyBillsMetrics={track:track,decorate:decorated};
})();