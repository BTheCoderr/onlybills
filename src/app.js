import { isDemo, initialize, user, accountName, signIn, signUp, signOut, resendConfirmation, requestPasswordReset, updatePassword, getPublicBills, getMyBills, getMyPledges, submitBill, submitPledge, simulateApproval, getAdminAccess, getPendingReviews, reviewBill, getReviewDocumentUrl } from './backend.js';
import { CATEGORY_ICONS, CATEGORY_TONES } from './data.js';
import { CATEGORIES, esc, initials, money, parseDollars, progress, remaining, shortDate } from './utils.js';

const app = document.querySelector('#app');
const state = { bills: [], myBills: [], pledges: [], filter: 'All bills', index: 0, selected: null, amount: null, custom: '', authMode: 'signup', authNext: 'dashboard', signupEmail: '', signupIntent: 'requester', loading: false, toast: '', admin: false, pending: [], feedError: '' };

const paths = ['home', 'discover', 'post', 'dashboard', 'how', 'auth', 'privacy', 'terms', 'admin'];
const glyphs = {
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  back: '<path d="M19 12H5m6 6-6-6 6-6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
  sparkle: '<path d="m12 3 1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8L12 3Z"/><path d="m19 18 .5 1.5L21 20l-1.5.5L19 22l-.5-1.5L17 20l1.5-.5L19 18Z"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  zap: '<path d="m13 2-9 12h7l-1 8 10-12h-7l0-8Z"/>',
  home: '<path d="m3 10 9-7 9 7v11H3V10Z"/><path d="M9 21v-8h6v8"/>',
  car: '<path d="m5 16-1 3v2h3v-2h10v2h3v-2l-1-3-2-8H7l-2 8Z"/><path d="M5 16h14M7 8l-1-3h12l-1 3"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/>',
  book: '<path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15"/>',
  'shopping-bag': '<path d="M4 8h16l-1 13H5L4 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>',
  upload: '<path d="M12 16V3m-5 5 5-5 5 5"/><path d="M4 15v6h16v-6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-5 3-8 8-8s8 3 8 8"/>',
  logout: '<path d="M10 17l5-5-5-5m5 5H3"/><path d="M13 3h7v18h-7"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-2c0-4 2-6 6-6s6 2 6 6v2"/><path d="M16 5c3 0 4 5 1 6m1 3c3 1 4 3 4 7"/>',
  lock: '<rect x="5" y="10" width="14" height="12" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  'credit-card': '<rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 10h20"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 11v6M12 7h.01"/>',
  gift: '<rect x="3" y="9" width="18" height="12" rx="1"/><path d="M12 9v12M3 13h18M12 9S5 8 6 4c2-3 6 1 6 5Zm0 0s7-1 6-5c-2-3-6 1-6 5Z"/>',
  filter: '<path d="M4 7h16M7 12h10M10 17h4"/>',
  refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5 9a8 8 0 0 1 14-2l1 5M4 12l1 5a8 8 0 0 0 14-2"/>',
};
function icon(name, size = 20, cls = '') { return `<svg class="ico ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${glyphs[name] || glyphs.heart}</svg>`; }
function brand() { return `<a class="brand" href="#/home" aria-label="OnlyBills home"><span class="brand-mark">${icon('receipt', 21)}</span><span>onlybills<span class="brand-dot">.</span></span></a>`; }
function route() { const key = (location.hash.split('?')[0].replace('#/', '') || 'home'); return paths.includes(key) ? key : 'home'; }
function link(to, content, cls = '', attrs = '') { return `<a href="#/${to}" class="${cls}" ${attrs}>${content}</a>`; }
function modeBanner() { return isDemo() ? `<div class="demo-banner">${icon('info',15)} <strong>Interactive demo</strong> &nbsp;·&nbsp; Sample stories are fictional. Pledges do not charge money. <a href="./join.html">Join early access</a></div>` : ''; }
function nav(active) {
  const signed = !!user();
  return `<header class="site-header"><div class="nav-inner">${brand()}
    <nav class="desktop-nav" aria-label="Main navigation">
      ${link('discover','Explore bills', active === 'discover' ? 'nav-link active' : 'nav-link')}
      ${link('how','How it works', active === 'how' ? 'nav-link active' : 'nav-link')}
      ${link('post','Post a bill', active === 'post' ? 'nav-link active' : 'nav-link')}
    </nav><div class="nav-actions">${signed ? `${link('dashboard', `<span class="small-avatar">${esc(initials(accountName()))}</span> My space`, 'account-link')}` : `${isDemo()?'<a class="nav-signin" href="#/discover">Explore demo</a>':link('auth','Sign in', 'nav-signin')}`}
    ${isDemo()?'<a class="btn btn-dark nav-get" href="./join.html">Join early access '+icon('arrow',17)+'</a>':link('post','Get help ' + icon('arrow',17), 'btn btn-dark nav-get')}
    <button type="button" class="mobile-menu" data-action="menu" aria-label="Open menu">${icon('menu',23)}</button></div></div>
    <div class="mobile-dropdown" id="mobile-dropdown">${link('discover', 'Explore bills')}${link('how','How it works')}${link('post','Post a bill')}${link('dashboard','My space')}${signed ? `<button data-action="logout">Sign out</button>` : isDemo()?'<a href="./join.html">Join early access</a><a href="#/discover">Explore demo</a>':link('auth','Sign in')}</div>
  </header>`;
}
function foot() { return `<footer class="footer"><div class="shell footer-grid"><div>${brand()}<p>Less scrolling past. More showing up.</p></div><div><span>Explore</span>${link('discover','Discover bills')}${link('post','Ask for help')}${link('how','How it works')}</div><div><span>Information</span><a href="./idea.html">Try the viral idea</a>${link('privacy','Privacy')}${link('terms','Terms')}${isDemo()?'<a href="./join.html">Join early access</a>':''}${link('dashboard','My space')}</div><div class="footer-end">${isDemo()?'Building it in public.':'Made for a kinder internet.'} <span class="footer-heart">♥</span><p>© ${new Date().getFullYear()} OnlyBills. MVP.</p></div></div><div class="footer-bottom shell">OnlyBills is ${isDemo()?'a fictional-scenario demo and early-access experiment':'a pledge-only prototype'}. No money is collected. Pledges are not payments or proof of bill settlement. Never share bill account numbers or sensitive identifiers. <a href="./contact.html" style="color:inherit;text-decoration:underline">Contact and privacy requests</a>.</div></footer>`; }
function bottomNav(active) { return `<nav class="bottom-nav" aria-label="Mobile navigation">
    ${link('home', `${icon('home',22)}<span>Home</span>`, active === 'home'?'current':'')}
    ${link('discover', `${icon('heart',22)}<span>Explore</span>`, active === 'discover'?'current':'')}
    ${link('post', `${icon('plus',23)}<span>Post bill</span>`, active === 'post'?'current':'')}
    ${link('dashboard', `${icon('user',22)}<span>My space</span>`, active === 'dashboard'?'current':'')}
  </nav>`; }
function layout(active, content) { return `${modeBanner()}${nav(active)}<main>${content}</main>${foot()}${bottomNav(active)}<div id="modal-layer"></div><div class="toast-region" aria-live="polite"></div>`; }

function avatar(alias, tone='purple', extra='') { return `<span class="avatar avatar-${tone} ${extra}" aria-hidden="true">${esc(initials(alias))}</span>`; }
function categoryPill(b) { return `<span class="category-pill tone-${CATEGORY_TONES[b.category] || 'purple'}">${icon(CATEGORY_ICONS[b.category],15)} ${esc(b.category)}</span>`; }
function progressBar(b) { return `<div class="progress-track"><span style="width:${progress(b)}%"></span></div>`; }
function miniCard(b) {
  if (isDemo()) return `<article class="preview-statement">
    <header class="preview-statement-top"><span class="preview-brand">onlybills<span>.</span></span><span class="preview-ref">SAMPLE · 001</span></header>
    <div class="preview-dash"></div>
    <span class="preview-warning">FICTIONAL BILL — PREVIEW ONLY</span>
    <h2>What if this<br>were a real bill?</h2>
    <p>Try the swipe idea using fictional requests. No account numbers, charges, or payments.</p>
    <dl><div><dt>Example category</dt><dd>${esc(b.category)}</dd></div><div><dt>Example amount</dt><dd>${money(b.amount_cents)}</dd></div><div><dt>Status</dt><dd>Demo</dd></div></dl>
    <div class="preview-total"><span>Sample amount due</span><strong>${money(b.amount_cents)}</strong></div>
    <div class="preview-bottom">No money collected · No bill submitted</div>
  </article>`;
  return `<article class="mini-request tone-bg-${CATEGORY_TONES[b.category] || 'purple'}">
    <div class="mini-top"><div>${categoryPill(b)}</div>${icon('heart',22)}</div>
    <div class="mini-middle"><div class="bill-mark">${icon(CATEGORY_ICONS[b.category],46)}</div><div class="vertical-spark">✳</div></div>
    <div class="mini-bottom"><div class="mini-person">${avatar(b.alias,CATEGORY_TONES[b.category] || 'purple')}<div><strong>${esc(b.alias)}</strong><span>${esc(b.city || 'United States')}</span></div></div>
    <h3>${esc(b.title)}</h3><div class="mini-money"><div><span>Amount needed</span><strong>${money(b.amount_cents)}</strong></div><span class="mini-arrow">${icon('arrow',22)}</span></div></div>
  </article>`;
}
function sectionLead(eyebrow, title, desc) { return `<div class="section-lead"><span class="eyebrow">${esc(eyebrow)}</span><h2>${title}</h2><p>${desc}</p></div>`; }
function homePage() {
  const bills = state.bills;
  const featured = bills.length ? bills[0] : { id:'sample', alias:'Alex J.', title:'A little help with the electric bill', story:'One small act could make a big difference.', category:'Utilities', city:'Somewhere, USA', amount_cents:28400, pledged_cents:8500 };
  return `<section class="hero"><div class="hero-bg-bubble bg-one"></div><div class="hero-bg-bubble bg-two"></div><div class="shell hero-grid">
    <div class="hero-copy"><span class="eyebrow hero-badge">${icon('sparkle',16)} BUILT FROM A COMMENT</span>
      <h1>${isDemo()?'I said I’d build it.<br/><span>Here’s the demo<span class="highlight-dot">.</span></span>':'Bills are real.<br/><span>So is kindness<span class="highlight-dot">.</span></span>'}</h1>
      <p>${isDemo()?'I took the swipe-right-to-help-with-bills idea and made a working prototype. Try sample requests, tell me what you’d change, and join the beta list if you’d use it.':'Got a bill weighing on you? Share it. Want to make someone\'s day? Swipe through real needs and pledge to help.'}</p>
      <div class="hero-buttons">${isDemo()?'<a href="./join.html" class="btn btn-lime btn-large">Join early access '+icon('arrow',18)+'</a>':link('post', 'I need a little help '+icon('arrow',18), 'btn btn-lime btn-large')}${link('discover', isDemo()?'Explore the demo '+icon('heart',17):'I want to help '+icon('heart',17), 'btn btn-ghost-light btn-large')}</div>
      ${isDemo()?'<p style="margin:13px 0 0;font-size:13px;color:#ecdfc7">Saw the bill-swipe joke? <a href="./idea.html" style="color:#d7f68b;text-decoration:underline;font-weight:800">Try 3 sample swipes + vote on the concept →</a></p>':''}
      ${isDemo()?'<div class="preview-authentic-note">Independent prototype · Fictional requests · No payments yet · <a href="./contact.html">Contact</a></div>':'<div class="hero-reassure"><span>Real people. A little hope.<br/><strong>No judgment here.</strong></span></div>'}
    </div>
    <div class="hero-art" aria-label="Example OnlyBills request card">${isDemo()?'':`<div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="float-note top-note">${icon('sparkle',21)} A better way to swipe</div>`}
       <div class="hero-shadow-card"></div>${miniCard(featured)}${isDemo()?'':`<div class="float-note bottom-note"><span class="note-circle">${icon('heart',19)}</span><span>Little acts.<br/><strong>Big relief.</strong></span></div>`}
       <div class="hero-gesture">← pass &nbsp;&nbsp;&nbsp; support →</div>
    </div>
  </div></section>
  <div class="trust-strip"><div class="shell trust-inner">${isDemo()?`<span>${icon('check',19)} Working swipe demo</span><span>${icon('lock',19)} No real documents collected here</span><span>${icon('info',19)} Payments not enabled</span>`:`<span>${icon('shield',19)} Proof reviewed before requests appear</span><span>${icon('lock',19)} Documents kept private</span><span>${icon('heart',19)} Kindness without the spotlight</span>`}</div></div>
  <section class="how-preview section-pad shell">${sectionLead('SIMPLE BY DESIGN','One small swipe.<br/>A whole lot of good.','There is no secret formula. Just people helping people, one bill at a time.')}
    <div class="steps-grid"><div class="step"><span class="step-num">01</span><span class="step-icon pink-icon">${icon('receipt',30)}</span><h3>Post your bill</h3><p>Tell your story, submit a bill privately, and choose a public display name.</p></div><div class="step"><span class="step-num">02</span><span class="step-icon purple-icon">${icon('shield',30)}</span><h3>Get reviewed</h3><p>Planned: a human reviews private proof before a real request appears.</p></div><div class="step"><span class="step-num">03</span><span class="step-icon lime-icon">${icon('heart',30)}</span><h3>Someone shows up</h3><p>Planned: supporters can help through a safe payment partner. Not enabled yet.</p></div></div>
  </section>
  <section class="featured-section"><div class="shell"><div class="feature-heading"><div><span class="eyebrow">${isDemo()?'FICTIONAL EXAMPLES':'THE HUMAN SIDE'}</span><h2>${isDemo()?'Here’s how a request<br/>could look.':'Behind every bill,<br/>there\'s a story.'}</h2></div>${link('discover', 'Explore the feed '+icon('arrow',18), 'text-link')}</div>
    <div class="feature-cards">${(bills.length ? bills : [featured]).slice(0,3).map((b,i) => `<article class="feature-card"><div class="feature-visual tone-bg-${CATEGORY_TONES[b.category] || 'purple'}"><div class="feature-art-icon">${icon(CATEGORY_ICONS[b.category],64)}</div>${categoryPill(b)}</div><div class="feature-card-body"><div class="feature-top">${avatar(b.alias,CATEGORY_TONES[b.category] || 'purple')}<span>${esc(b.alias)}</span><span class="feature-city">${icon('pin',14)} ${esc(b.city || '')}</span></div><h3>${esc(b.title)}</h3><p>${esc(b.story)}</p>${isDemo()?`<div class="feature-total"><span>Example amount</span><strong>${money(b.amount_cents)}</strong></div><a class="text-link feature-link" href="#/discover">Try sample feed ${icon('arrow',18)}</a>`:`<div class="feature-total"><span>${money(remaining(b))} still needed</span><strong>${progress(b)}% pledged</strong></div>${progressBar(b)}<button class="text-link feature-link" data-action="support" data-id="${esc(b.id)}">Pledge support ${icon('arrow',18)}</button>`}</div></article>`).join('')}
    </div>${isDemo()?'<p class="fiction-note">All names and stories shown here are fictional demo content.</p>':''}</div></section>
  <section class="closing-cta shell"><div class="closing-inner"><span class="cta-spark cta-spark-left">✳</span><div><span class="eyebrow">A BETTER KIND OF VIRAL</span><h2>Imagine if helping<br/>was the trend.</h2><p>You're a swipe away from making someone's day feel a little lighter.</p>${link('discover','Start swiping '+icon('arrow',19),'btn btn-dark btn-large')}</div><span class="cta-spark cta-spark-right">✳</span></div></section>`;
}
function discoverPage() {
  const filtered = state.bills.filter((b) => (state.filter === 'All bills' || b.category === state.filter) && remaining(b) > 0);
  if (state.index >= filtered.length) state.index = 0;
  const b = filtered[state.index];
  const next = filtered[(state.index + 1) % filtered.length];
  return `<section class="discover-head shell"><div><span class="eyebrow">${isDemo()?'INTERACTIVE PROTOTYPE':'YOUR NEXT GOOD DEED STARTS HERE'}</span><h1>${isDemo()?'Try the <em>swipe feed.</em>':'Swipe with <em>purpose.</em>'}</h1><p>${isDemo()?'Every request shown here is fictional. Try the controls; no money moves.':'Go through stories, not profiles. Swipe right to pledge support, left to see someone else.'}</p></div><div class="discover-counter"><span class="counter-dot"></span><strong>${filtered.length}</strong> ${isDemo()?'sample card':'request'}${filtered.length===1?'':'s'} to explore</div></section>
  <section class="shell discover-layout"><aside class="filter-panel"><h3>${icon('filter',19)} Find your cause</h3><p>Which kind of bill would you like to help with?</p>
    <div class="filter-list">${['All bills', ...CATEGORIES].map((cat) => `<button class="filter-button ${state.filter === cat ? 'selected' : ''}" data-action="filter" data-cat="${esc(cat)}">${cat === 'All bills' ? icon('heart',18) : icon(CATEGORY_ICONS[cat],18)}<span>${esc(cat)}</span>${state.filter === cat ? icon('check',16) : ''}</button>`).join('')}</div>
    <div class="filter-note">${icon('shield',22)}<p><strong>Privacy comes first.</strong><br/>${isDemo()?'These scenarios are fictional. No personal bill documents were uploaded.':'Only approved public stories appear here. Bill documents are never shown.'}</p></div>
  </aside><div class="swipe-area">
    ${b ? `<div class="swipe-stack" aria-label="Swipe through bills">
        ${next && next.id !== b.id ? `<div class="card-behind tone-bg-${CATEGORY_TONES[next.category] || 'purple'}"></div>` : ''}
        <article class="swipe-card" id="swipe-card" data-id="${esc(b.id)}"><div class="swipe-visual tone-bg-${CATEGORY_TONES[b.category] || 'purple'}"><span class="swipe-decor disc-1"></span><span class="swipe-decor disc-2"></span><div class="swipe-card-top">${categoryPill(b)}<span class="verified-chip">${icon('shield',15)} ${isDemo()?'Fictional sample':'Reviewed'}</span></div><div class="swipe-symbol">${icon(CATEGORY_ICONS[b.category],77)}</div><div class="stamp stamp-no">PASS</div><div class="stamp stamp-yes">SUPPORT</div><div class="swipe-card-lower">${avatar(b.alias,CATEGORY_TONES[b.category] || 'purple','big-avatar')}<div><strong>${esc(b.alias)}</strong><span>${icon('pin',15)} ${esc(b.city || 'United States')}</span></div></div></div>
          <div class="swipe-body"><div class="swipe-meta"><span>${icon('clock',16)} ${b.due_date ? 'Due '+shortDate(b.due_date) : 'No due date'}</span><span>${isDemo()?'Sample card':'Request'} ${state.index+1} of ${filtered.length}</span></div><h2>${esc(b.title)}</h2><p class="swipe-story">${esc(b.story)}</p>
          ${isDemo()?`<div class="swipe-progress-top"><span>Illustrative amount</span><strong>${money(b.amount_cents)}</strong></div><div class="swipe-total">Fictional request. Demo selections stay in this browser.</div>`:`<div class="swipe-progress-top"><span><strong>${money(remaining(b))}</strong> still needed</span><span>${progress(b)}% pledged</span></div>${progressBar(b)}<div class="swipe-total">${money(b.pledged_cents)} pledged toward ${money(b.amount_cents)}</div>`}</div>
        </article></div>
        <div class="swipe-buttons"><button class="round-action pass-action" data-action="pass" aria-label="Pass on this bill">${icon('x',28)}</button><button class="btn btn-lime support-action" data-action="support" data-id="${esc(b.id)}">${icon('heart',21)} ${isDemo()?'Try demo pledge':'Pledge support'}</button><button class="round-action next-action" data-action="pass" aria-label="Next request">${icon('arrow',26)}</button></div>
        <p class="swipe-hint">← Swipe left to pass <span>·</span> Swipe right to pledge →</p>
      ` : `<div class="empty-state discover-empty"><div class="empty-illustration">${icon('heart',45)}</div><h2>You've seen all the bills here.</h2><p>${state.bills.length ? 'Try another category or come back to explore new requests.' : 'No approved public requests yet. Be the first to submit one for review.'}</p><button class="btn btn-dark" data-action="reset-filter">${icon('refresh',17)} See all categories</button></div>`}
    </div><aside class="discovery-right"><div class="side-note"><span class="side-note-icon">${icon('sparkle',24)}</span><h3>${isDemo()?'Not real money.<br/>Not yet.':'Good people<br/>doing good things.'}</h3><p>${isDemo()?'This is a demo of how matching could feel. Help decide what comes next.':'You don\'t need to be rich to make a difference. Even the smallest pledge counts.'}</p><div class="side-rule"></div><span>${icon('heart',17)} Swipe with kindness.</span></div><div class="side-info">${icon('info',17)} Pledges are commitments only. No payments are collected in this MVP.</div></aside></section>`;
}
function postPage() {
  if (!user()) return `<section class="auth-gate shell"><div class="gate-orb">${icon('receipt',40)}</div><span class="eyebrow">YOUR STORY MATTERS</span><h1>Everyone needs a hand sometimes.</h1><p>${isDemo()?'Real bill submissions are not available yet. Join early access to hear when secure accounts and private bill uploads open.':'Sign in or create a free account to privately upload your bill and send it for review.'}</p>${isDemo()?'<a href="./join.html" class="btn btn-dark btn-large">Join early access '+icon('arrow',19)+'</a>':`<button class="btn btn-dark btn-large" data-action="go-auth" data-next="post">Create an account ${icon('arrow',19)}</button>`}<div class="gate-note">${icon('lock',17)} Your actual bill will never appear on public cards.</div></section>`;
  return `<section class="post-wrap shell"><div class="post-intro"><span class="eyebrow">ASKING IS A BRAVE FIRST STEP</span><h1>Get a little<br/><em>breathing room.</em></h1><p>Share what's going on. Keep it honest, keep it simple. There is no shame in needing help.</p><div class="post-illustration"><span class="post-illo-doc">${icon('receipt',84)}</span><span class="post-illo-heart">${icon('heart',42)}</span><div class="post-illo-caption">Your story deserves to be heard.</div></div><div class="post-info-card">${icon('shield',23)}<div><strong>Only the story is public.</strong><p>We privately store your bill so a reviewer can check it. Hide sensitive numbers in your upload when possible.</p></div></div></div>
  <div class="form-card"><div class="form-title"><span class="step-label">STEP 1 OF 1</span><h2>Tell us about your bill</h2><p>All fields marked * are required.</p></div>
  <form id="post-form"><div class="form-field"><label for="alias">Public display name *</label><input name="alias" id="alias" required maxlength="40" minlength="2" placeholder="e.g. Jordan P." value="${esc(accountName().split(' ')[0])}"/><small>Use a nickname. Never share your full legal name if you prefer privacy.</small></div>
  <div class="form-field"><label for="title">Give your request a title *</label><input id="title" name="title" required minlength="8" maxlength="90" placeholder="e.g. A hand with this month's utility bill"/></div>
  <div class="form-row"><div class="form-field"><label for="category">Bill category *</label><select id="category" name="category" required><option value="">Choose one</option>${CATEGORIES.map((c)=>`<option>${c}</option>`).join('')}</select></div><div class="form-field"><label for="amount">Amount due (USD) *</label><div class="dollar-input"><span>$</span><input id="amount" name="amount" type="number" required min="5" max="10000" step="0.01" placeholder="250.00"/></div></div></div>
  <div class="form-row"><div class="form-field"><label for="city">City, state <span class="optional">(optional)</span></label><input id="city" name="city" maxlength="60" placeholder="e.g. Providence, RI"/></div><div class="form-field"><label for="due_date">Due date <span class="optional">(optional)</span></label><input id="due_date" name="due_date" type="date"/></div></div>
  <div class="form-field"><label for="story">Your story *</label><textarea id="story" name="story" required minlength="35" maxlength="900" rows="5" placeholder="What would help with this bill mean for you? Keep identifying information out of your story."></textarea><small><span id="story-count">0</span> / 900 characters</small></div>
  <div class="form-field"><label>Upload your bill or invoice *</label><label class="upload-box" for="document"><span class="upload-icon">${icon('upload',27)}</span><strong id="file-label">Choose a PDF or image</strong><small>PDF, JPG or PNG up to 8MB. Visible only to authorized reviewers.</small></label><input class="visually-hidden" id="document" name="document" type="file" accept="application/pdf,image/png,image/jpeg" required/></div>
  <div class="privacy-check">${icon('info',19)}<span>Make sure your public story contains no account numbers, addresses, phone numbers, medical details, or other sensitive information. Approval is not guaranteed.</span></div>
  <label class="consent-row"><input type="checkbox" name="agree" required/><span>I confirm this request is genuine and agree to the <a href="#/terms">terms</a> and <a href="#/privacy">privacy notice</a>.</span></label>
  <div class="form-submit-row"><button type="submit" class="btn btn-dark btn-large" id="submit-post">Submit for review ${icon('arrow',18)}</button><span>${icon('lock',15)} Private and secure</span></div></form></div></section>`;
}
function badgeStatus(status) { const labels = {pending_review:'Under review',approved:'Approved',rejected:'Not approved'}; return `<span class="status-badge status-${esc(status)}">${status === 'approved' ? icon('check',14) : icon('clock',14)} ${labels[status] || esc(status)}</span>`; }
function dashboardPage() {
  if (!user()) return `<section class="auth-gate shell"><div class="gate-orb">${icon('user',40)}</div><span class="eyebrow">A LITTLE SPACE OF YOUR OWN</span><h1>All your good in one place.</h1><p>${isDemo()?'Real account dashboards are coming soon. Join early access to find out when they open.':'Sign in to track the requests you\'ve shared and pledges you\'ve made.'}</p>${isDemo()?'<a href="./join.html" class="btn btn-dark btn-large">Join early access '+icon('arrow',19)+'</a>':`<button class="btn btn-dark btn-large" data-action="go-auth" data-next="dashboard">Sign in ${icon('arrow',19)}</button>`}</section>`;
  const pending = state.myBills.filter((b) => b.status === 'pending_review').length;
  const totalPledged = state.pledges.filter(p => p.status === 'pledged').reduce((sum, p) => sum + p.amount_cents, 0);
  const all = [...state.myBills, ...state.bills];
  return `<section class="dash-head shell"><div><span class="eyebrow">YOUR LITTLE CORNER OF GOOD</span><h1>Hey, ${esc(accountName().split(' ')[0])} <span class="wave">✳</span></h1><p>Every act of asking and giving matters. Here's where things stand.</p></div><button class="outline-button" data-action="logout">${icon('logout',18)} Sign out</button></section>
  <section class="shell dash-section"><div class="dash-stats"><div class="stat-tile"><span class="stat-icon pink-icon">${icon('receipt',23)}</span><span>My requests</span><strong>${state.myBills.length}</strong></div><div class="stat-tile"><span class="stat-icon purple-icon">${icon('clock',23)}</span><span>Under review</span><strong>${pending}</strong></div><div class="stat-tile"><span class="stat-icon lime-icon">${icon('heart',23)}</span><span>My pledges</span><strong>${state.pledges.length}</strong></div><div class="stat-tile"><span class="stat-icon blue-icon">${icon('gift',23)}</span><span>Total pledged</span><strong>${money(totalPledged)}</strong></div></div>
  <div class="dash-two-cols"><div class="dash-panel"><div class="panel-heading"><h2>My bill requests</h2>${link('post','+ New request','panel-action')}</div>
    ${state.myBills.length ? state.myBills.map((b) => `<article class="dash-item"><span class="dash-item-icon tone-${CATEGORY_TONES[b.category] || 'purple'}">${icon(CATEGORY_ICONS[b.category],22)}</span><div class="dash-item-main"><h3>${esc(b.title)}</h3><span>${esc(b.category)} · ${money(b.amount_cents)}</span><div>${badgeStatus(b.status)} ${isDemo() && b.status === 'pending_review' ? `<button class="demo-review-btn" data-action="approve-demo" data-id="${esc(b.id)}">Simulate approval</button>`:''}</div></div></article>`).join('') : `<div class="empty-tile">${icon('receipt',31)}<h3>No requests yet</h3><p>When you need a little support, your story belongs here.</p>${link('post','Post your first bill '+icon('arrow',16),'text-link')}</div>`}</div>
  <div class="dash-panel"><div class="panel-heading"><h2>My pledges</h2>${link('discover','Explore more','panel-action')}</div>
    ${state.pledges.length ? state.pledges.map((p) => {const bill=all.find((b)=>b.id===p.bill_id);return `<article class="dash-item"><span class="dash-item-icon tone-purple">${icon('heart',22)}</span><div class="dash-item-main"><h3>${esc(bill?.title || 'Bill request')}</h3><span>${money(p.amount_cents)} pledged · Not charged</span><div><span class="status-badge status-approved">${icon('heart',14)} Pledge recorded</span></div></div></article>`;}).join('') : `<div class="empty-tile">${icon('heart',31)}<h3>No pledges yet</h3><p>Your first little act of kindness is waiting out there.</p>${link('discover','Explore bills '+icon('arrow',16),'text-link')}</div>`}</div></div>
  ${state.admin ? `<div class="admin-shortcut">${icon('shield',24)}<div><strong>Reviewer access enabled</strong><p>Review submitted bill documents in the private moderation queue.</p></div>${link('admin','Review queue '+icon('arrow',17),'btn btn-dark')}</div>` : ''}
  <div class="dash-notice">${icon('info',20)} Pledge totals do not mean funds were collected or bills were paid. This version has no payment collection.</div></section>`;
}
function howPage() { return `<section class="interior-hero shell"><span class="eyebrow">GOODNESS, MADE SIMPLE</span><h1>What if our feeds<br/>were full of <em>help?</em></h1><p>OnlyBills puts a little humanity back into scrolling. Here's exactly what happens, and what doesn't yet.</p></section>
  <section class="shell how-list"><article><div class="how-no">01</div><div class="how-text"><span class="eyebrow">IF YOU NEED A HAND</span><h2>Share a bill, not your entire life.</h2><p>Create an account, write a short story, choose a public nickname, and privately upload the invoice. We never put your uploaded document or account number on the feed.</p>${link('post','Post a bill '+icon('arrow',18),'text-link')}</div><div class="how-art how-art-one">${icon('receipt',100)}<span>It's okay to ask.</span></div></article>
  <article><div class="how-no">02</div><div class="how-text"><span class="eyebrow">A QUICK CHECK FIRST</span><h2>Every request gets reviewed.</h2><p>A reviewer can inspect the privately submitted proof and approve or decline the request. Approval confirms only that a document was reviewed; it isn't a guarantee that a bill or story is authentic.</p></div><div class="how-art how-art-two">${icon('shield',105)}<span>Privacy first.</span></div></article>
  <article><div class="how-no">03</div><div class="how-text"><span class="eyebrow">IF YOU WANT TO SHOW UP</span><h2>Swipe right on a need you care about.</h2><p>Browse reviewed requests, swipe left to keep going, or swipe right to choose an amount to pledge. A pledge is a promise of interest, not a charge and not a completed payment.</p>${link('discover','Start exploring '+icon('arrow',18),'text-link')}</div><div class="how-art how-art-three">${icon('heart',105)}<span>Give a little hope.</span></div></article></section>
  <section class="shell how-faq"><div><span class="eyebrow">THE IMPORTANT STUFF</span><h2>A few honest answers.</h2></div><div class="faq-list"><details open><summary>Does OnlyBills send money to billers?</summary><p>Not in this initial version. OnlyBills records nonbinding pledges; it does not collect or transfer money. Verified payment partnerships, fraud controls, and legal review are required before real bill payments launch.</p></details><details><summary>Can everyone see my uploaded bill?</summary><p>No. Files live in a private storage bucket when Supabase is configured. Authorized reviewers can access them for limited periods. The public feed includes only the nickname, story, category, general city and amount.</p></details><details><summary>What if a request is rejected?</summary><p>It remains private and doesn't appear in the discovery feed. Check your dashboard for its status. A production version would also add a formal appeal and resubmission process.</p></details><details><summary>Is the demo real?</summary><p>Demo cards are fictional, and demo accounts, requests, and pledges are saved only in your browser's local storage. Hooking up Supabase enables real accounts, document storage, review and synced requests.</p></details></div></section>`; }
function authPage() {
  const mode=state.authMode, signup=mode==='signup', signin=mode==='signin', special=!signup&&!signin;
  const titles={signup:'Make yourself at home.',signin:'Good to have you back.',forgot:'Reset your password.',verify:'Check your inbox.',reset:'Choose a new password.'};
  const descriptions={signup:'Create your account to share or support.',signin:'Sign in to keep the good going.',forgot:'Enter your email to request a secure reset link.',verify:'Open the confirmation email, verify your address and come back to sign in.',reset:'Use a new password of at least 10 characters.'};
  const passwordField=(label,name)=>`<div class="form-field"><label for="auth-${name}">${label}</label><input id="auth-${name}" name="${name}" type="password" required minlength="10" autocomplete="new-password" placeholder="At least 10 characters"></div>`;
  const emailField=(val='')=>`<div class="form-field"><label for="auth-email">Email address</label><input id="auth-email" name="email" type="email" autocomplete="email" required value="${val}" placeholder="you@example.com"></div>`;
  const submit=(label)=>`<button type="submit" class="btn btn-dark btn-large auth-submit">${label} ${icon('arrow',18)}</button>`;
  let form='';
  if(signup){
    form=`<form id="auth-form" data-mode="signup"><fieldset class="auth-intent"><legend>What brings you here?</legend>
      <label class="auth-intent-option"><input type="radio" name="intent" value="requester" required ${state.signupIntent==='requester'?'checked':''}><span>${icon('receipt',23)}<strong>I need help with a bill</strong><small>Share a request for review</small></span></label>
      <label class="auth-intent-option"><input type="radio" name="intent" value="supporter" ${state.signupIntent==='supporter'?'checked':''}><span>${icon('heart',23)}<strong>I want to help others</strong><small>Discover bills and pledge help</small></span></label></fieldset>
      <div class="form-field"><label for="auth-name">Your name</label><input id="auth-name" name="name" required minlength="2" maxlength="120" autocomplete="name" placeholder="e.g. Jordan"></div>
      ${emailField()}${passwordField('Create password','password')}${passwordField('Confirm password','confirm')}
      <p class="auth-password-tip">Use a unique password. Either type of account can request or offer help.</p>
      <label class="auth-consent"><input name="agree" type="checkbox" required><span>I agree to the <a href="#/terms">Terms</a> and <a href="#/privacy">Privacy Policy</a>. OnlyBills records pledges, not payments.</span></label>
      ${submit('Create my account')}</form>`;
  }else if(signin){
    form=`<form id="auth-form" data-mode="signin">${emailField()}<div class="auth-password-row"><label for="auth-password">Password</label><button type="button" data-action="auth-mode" data-mode="forgot">Forgot password?</button></div><div class="form-field"><input id="auth-password" name="password" type="password" required autocomplete="current-password" placeholder="Your password"></div>${submit('Sign in')}</form>`;
  }else if(mode==='forgot'){
    form=`<form id="auth-form" data-mode="forgot">${emailField(esc(state.signupEmail))}${submit('Send reset link')}</form><button type="button" class="auth-secondary" data-action="auth-mode" data-mode="signin">Back to sign in</button>`;
  }else if(mode==='verify'){
    form=`<div class="auth-verification">${icon('check',26)}<strong>${esc(state.signupEmail || 'Your email address')}</strong><p>Check your spam folder if you do not see the email. You will need to verify your address before signing in.</p></div><button type="button" class="btn btn-dark btn-large auth-submit" data-action="resend-verification" ${isDemo()?'disabled':''}>Resend verification email</button><button type="button" class="auth-secondary" data-action="auth-mode" data-mode="signin">I've verified. Sign in</button>`;
  }else{
    form=user()?`<form id="auth-form" data-mode="reset">${passwordField('New password','password')}${passwordField('Confirm new password','confirm')}${submit('Save new password')}</form>`:`<div class="auth-verification"><p>Your reset session expired or is missing. Ask for another link.</p></div><button type="button" class="auth-secondary" data-action="auth-mode" data-mode="forgot">Request a reset link</button>`;
  }
  return `<section class="auth-layout shell"><div class="auth-art"><div class="auth-art-top"><span class="eyebrow">GOOD PEOPLE ARE OUR THING</span><h1>Here's to<br/>showing up<br/>for each other<span>.</span></h1><p>You belong here whether you're giving help or asking for it.</p></div><div class="auth-art-bottom">${icon('heart',76)}<span>Kindness looks good on you.</span></div></div><div class="auth-form-outer"><div class="auth-form-title"><span class="eyebrow">WELCOME TO ONLYBILLS</span><h2>${titles[mode]||titles.signup}</h2><p>${descriptions[mode]||descriptions.signup}</p></div>${special?'':`<div class="auth-tabs"><button type="button" class="${signup?'selected':''}" data-action="auth-mode" data-mode="signup">Create account</button><button type="button" class="${signin?'selected':''}" data-action="auth-mode" data-mode="signin">Sign in</button></div>`}${form}<p class="auth-footnote">${icon('lock',16)} ${isDemo()?'Demo mode: no real account or email is created.':'Account security and email verification powered by Supabase Auth.'}</p></div></section>`;
}
function policyPage(type) {
  if (type === 'privacy') return `<section class="legal shell"><span class="eyebrow">PLAIN-LANGUAGE PRIVACY</span><h1>Your bill is your business.</h1><p><strong>Prototype privacy notice, updated October 2026.</strong> This notice is a starting point and must receive legal review before any public production launch.</p><h2>What we store</h2><p>When connected to Supabase, we store your account email, public display name, bill category, requested amount, general city, optional due date, story, and a private document upload. Your private upload is not part of public feeds.</p><h2>What other people see</h2><p>Approved public requests show your chosen nickname, story, amount, category, general location, and pledged total. Do not include full addresses, account numbers, medical diagnoses, or other private data in your story.</p><h2>Private verification</h2><p>Authorized reviewers may access your document to consider your request. Uploads use a private bucket and restricted access policies. A secure review link expires after a short period. Access logs, retention windows, and deletion tools must be finalized before public launch.</p><h2>Early-access waitlist</h2><p>Our Netlify-hosted waitlist collects your name, email, whether you want to request or offer help, and your consent to launch updates. It is not an OnlyBills account. This information is handled by Netlify Forms and is used only for beta and launch communications. Do not send passwords, bill images, account numbers or sensitive financial data. To request removal or correction of early-access details, use our <a href="./contact.html">contact and privacy request form</a>; requests are reviewed manually.</p><h2>Demo mode</h2><p>Demo data stays in this browser's local storage, not a server. Demo submissions, accounts, and pledges are not real.</p><h2>Contact and rights</h2><p>Before a production launch, the operator must publish a valid contact address, deletion instructions, retention schedule, data processor details, and jurisdiction-specific privacy disclosures.</p></section>`;
  return `<section class="legal shell"><span class="eyebrow">THE GROUND RULES</span><h1>Let's keep this genuine.</h1><p><strong>Prototype terms, updated October 2026.</strong> These are provisional and require legal review before any public release.</p><h2>Be truthful</h2><p>Do not submit fraudulent, altered, duplicate, or misleading bills. Don't publish someone else's confidential information, full account number, personal address, or protected information.</p><h2>What the product currently does</h2><p>OnlyBills provides bill-story submissions, human moderation, discovery and nonbinding pledges. It does not accept funds, promise charitable tax deductions, transmit money, settle debts, arrange loans, or guarantee that a request is genuine.</p><h2>Moderation</h2><p>Requests can be held, approved, or declined. Approval means the submission has been reviewed, not that the content has been independently guaranteed. Moderators are not financial advisers.</p><h2>Future payments</h2><p>Actual collection, payment to providers, refunds, chargebacks, fees, compliance, and identity verification require separate terms and technical launch controls. No real-money feature should be enabled until those requirements are satisfied.</p><h2>Age and conduct</h2><p>Account holders should be at least 18 and use the service lawfully. Public production terms must be finalized for the operator's jurisdiction.</p></section>`;
}
function adminPage() {
  if (!state.admin) return `<section class="auth-gate shell"><div class="gate-orb">${icon('lock',42)}</div><h1>Private review area</h1><p>This page is for authorized request reviewers only.</p>${link('dashboard','Back to my space','btn btn-dark')}</section>`;
  return `<section class="shell admin-page"><div class="admin-head"><div><span class="eyebrow">PRIVATE MODERATION</span><h1>Review queue</h1><p>Open private proof, compare the submission details, then approve or reject.</p></div><span class="status-badge status-pending_review">${state.pending.length} pending</span></div>${state.pending.length ? `<div class="admin-grid">${state.pending.map((b)=>`<article class="admin-card"><div>${categoryPill(b)} <span class="admin-amount">${money(b.amount_cents)}</span></div><h2>${esc(b.title)}</h2><p>${esc(b.alias)} · ${esc(b.city || 'No city provided')}</p><span class="admin-date">Submitted ${shortDate(b.created_at.slice(0,10))}</span><div class="admin-buttons"><button data-action="view-document" data-path="${esc(b.document_path)}" class="btn btn-outline">${icon('eye',17)} View proof</button><button data-action="review" data-id="${esc(b.id)}" data-decision="approved" class="btn btn-lime">Approve</button><button data-action="review" data-id="${esc(b.id)}" data-decision="rejected" class="btn btn-outline-danger">Reject</button></div></article>`).join('')}</div>` : `<div class="empty-state"><div class="empty-illustration">${icon('check',42)}</div><h2>Queue is clear.</h2><p>No submissions waiting for review.</p></div>`}</section>`;
}

function toast(message, error=false) {
  const region = document.querySelector('.toast-region'); if (!region) return;
  const el = document.createElement('div'); el.className=`toast ${error?'toast-error':''}`; el.innerHTML=`${icon(error?'info':'check',19)} <span>${esc(message)}</span>`;
  region.appendChild(el); setTimeout(()=>{el.classList.add('toast-out');setTimeout(()=>el.remove(),250);},5000);
}
function closeModal() { state.selected=null; state.amount=null; state.custom=''; const layer=document.querySelector('#modal-layer'); if(layer) layer.innerHTML=''; document.body.classList.remove('modal-open'); }
function openPledge(id) {
  const b=state.bills.find((b)=>b.id===id); if(!b) { toast('This request is unavailable.',true);return; }
  if (remaining(b)<100) {toast('This request has reached its pledge goal.');return;}
  state.selected=id; state.amount=remaining(b); state.custom=''; renderPledgeModal();
}
function renderPledgeModal() {
  const b=state.bills.find((b)=>b.id===state.selected); if(!b) return;
  const rem=remaining(b); const options=[2500,5000,10000,rem].filter((v,i,a)=>v<=rem && a.indexOf(v)===i && v>=100);
  const layer=document.querySelector('#modal-layer'); if(!layer) return;
  layer.innerHTML=`<div class="modal-backdrop" data-action="close-modal"><div class="pledge-modal" role="dialog" aria-modal="true" aria-labelledby="pledge-title"><button class="modal-close" data-action="close-modal" aria-label="Close">${icon('x',21)}</button><div class="pledge-head"><span class="pledge-icon">${icon('heart',24)}</span><span class="eyebrow">${isDemo()?'TRY THE PLEDGE FLOW':'A LITTLE KINDNESS GOES FAR'}</span><h2 id="pledge-title">${isDemo()?'A test pledge. <br/>Not a real payment.':'You could make<br/>their day.'}</h2><p>${isDemo()?'This is a fictional scenario. No real person is requesting this money.':`You’re pledging support for <strong>${esc(b.alias)}</strong> and their ${esc(b.category.toLowerCase())} bill.`}</p></div>
  <div class="pledge-request"><div>${categoryPill(b)}<h3>${esc(b.title)}</h3></div><strong>${money(rem)} left</strong></div>
  <form id="pledge-form"><label class="pledge-label">Choose a pledge amount</label><div class="pledge-options">${options.map((n)=>`<button type="button" class="pledge-choice ${state.amount===n ? 'selected':''}" data-action="pick-amount" data-amount="${n}">${n===rem?'Cover rest':money(n)}</button>`).join('')}<button type="button" class="pledge-choice ${state.amount === 'custom'?'selected':''}" data-action="pick-custom">Custom</button></div>${state.amount==='custom'?`<div class="custom-amount dollar-input"><span>$</span><input type="number" id="custom-pledge" placeholder="Your amount" min="1" max="${(rem/100).toFixed(2)}" step="0.01" required value="${esc(state.custom)}"/></div>`:''}
  <div class="pledge-notice">${icon('info',19)} <span><strong>${isDemo()?'Demo only, not a real pledge.':'This is a pledge, not a payment.'}</strong> No money is charged or transferred. ${isDemo()?'Test selections stay in your browser.':'Pledge totals only show interest in helping.'}</span></div><button type="submit" class="btn btn-dark btn-large pledge-submit">${isDemo()?'Save demo selection':'Record my pledge'} ${icon('arrow',18)}</button></form></div></div>`;
  document.body.classList.add('modal-open');
  const closeBtn=layer.querySelector('.modal-close'); closeBtn?.focus();
}
async function updateAll() {
  state.feedError='';
  try { state.bills=await getPublicBills(); } catch(e){state.feedError=e.message; state.bills=[];}
  if (user()) {
    try {
      const [mine,pledges,admin]=await Promise.all([getMyBills(),getMyPledges(),getAdminAccess()]);
      state.myBills=mine; state.pledges=pledges; state.admin=admin;
      state.pending=admin?await getPendingReviews():[];
    } catch(e) { console.error(e); state.myBills=[];state.pledges=[];state.admin=false;state.pending=[]; toast('Could not load your account data.', true); }
  } else {state.myBills=[];state.pledges=[];state.admin=false;state.pending=[];}
}
async function render() {
  const page=route();
  await updateAll();
  const pages={home:homePage, discover:discoverPage, post:postPage, dashboard:dashboardPage, how:howPage, auth:authPage, privacy:()=>policyPage('privacy'), terms:()=>policyPage('terms'), admin:adminPage};
  app.innerHTML=layout(page,pages[page]());
  if(state.feedError && (page==='discover'||page==='home')) toast('Unable to load requests: '+state.feedError,true);
  if (page==='discover') setupSwipe();
  closeModal();
}
function go(path) { const target='#/'+path; if(location.hash===target) render(); else location.hash=target; window.scrollTo({top:0,behavior:'instant'}); }
function nextCard() {const filtered=state.bills.filter((b)=>(state.filter==='All bills'||b.category===state.filter)&&remaining(b)>0);if(filtered.length>1)state.index=(state.index+1)%filtered.length; const area=document.querySelector('.discover-layout');if(area){area.outerHTML=discoverPage().match(/<section class="shell discover-layout">[\s\S]*?<\/section>/)?.[0]||area.outerHTML;setupSwipe();}}
function setupSwipe() {
  const card=document.querySelector('#swipe-card'); if(!card) return;
  let startX=0,startY=0,dragging=false,dx=0;
  card.addEventListener('pointerdown',(e)=>{if(e.target.closest('button, a'))return;startX=e.clientX;startY=e.clientY;dx=0;dragging=true;card.setPointerCapture(e.pointerId);card.classList.add('dragging');});
  card.addEventListener('pointermove',(e)=>{if(!dragging)return;dx=e.clientX-startX;const dy=e.clientY-startY;if(Math.abs(dy)>Math.abs(dx)*1.7)return;card.style.transform=`translateX(${dx}px) rotate(${dx/24}deg)`;card.querySelector('.stamp-yes').style.opacity=dx>35?Math.min(1,(dx-35)/60):0;card.querySelector('.stamp-no').style.opacity=dx< -35?Math.min(1,(-dx-35)/60):0;});
  const finish=()=>{if(!dragging)return;dragging=false;card.classList.remove('dragging');const moved=dx;card.style.transform='';card.querySelectorAll('.stamp').forEach((s)=>s.style.opacity=0);dx=0;if(moved>85)openPledge(card.dataset.id);else if(moved< -85)nextCard();};
  card.addEventListener('pointerup',finish);card.addEventListener('pointercancel',finish);
}

window.addEventListener('hashchange',()=>render());
window.addEventListener('onlybills:auth',(event)=>{
  if(event.detail?.event==='PASSWORD_RECOVERY'||(new URLSearchParams(location.search).get('reset')==='1'&&user())){
    state.authMode='reset'; window.history.replaceState({},'',location.pathname+'#/auth');
  }
  render();
});
document.addEventListener('keydown',(e)=>{if(e.key==='Escape')closeModal();if(route()==='discover'&&!state.selected&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){if(e.key==='ArrowLeft')nextCard();if(e.key==='ArrowRight'){const card=document.querySelector('#swipe-card');if(card)openPledge(card.dataset.id);}}});

document.addEventListener('input',(e)=>{if(e.target.id==='story') {const count=document.querySelector('#story-count');if(count)count.textContent=e.target.value.length; }if(e.target.id==='document'){const l=document.querySelector('#file-label');if(l)l.textContent=e.target.files?.[0]?.name||'Choose a PDF or image';}if(e.target.id==='custom-pledge')state.custom=e.target.value;});
document.addEventListener('click',async(e)=>{
  const control=e.target.closest('[data-action]'); if(!control)return;
  const action=control.dataset.action;
  if(action==='close-modal'){if(e.target.closest('.pledge-modal') && !e.target.closest('.modal-close'))return;closeModal();return;}
  if(action==='menu'){document.querySelector('#mobile-dropdown')?.classList.toggle('open');return;}
  if(action==='support'){openPledge(control.dataset.id);return;}
  if(action==='pass'){nextCard();return;}
  if(action==='filter'){state.filter=control.dataset.cat;state.index=0; const area=document.querySelector('.discover-layout');if(area){area.outerHTML=discoverPage().match(/<section class="shell discover-layout">[\s\S]*?<\/section>/)?.[0]||area.outerHTML;setupSwipe();}return;}
  if(action==='reset-filter'){state.filter='All bills';state.index=0;const area=document.querySelector('.discover-layout');if(area){area.outerHTML=discoverPage().match(/<section class="shell discover-layout">[\s\S]*?<\/section>/)?.[0]||area.outerHTML;setupSwipe();}return;}
  if(action==='go-auth'){if(isDemo()){window.location.assign('./join.html');return;}state.authNext=control.dataset.next||'dashboard';state.authMode='signup';go('auth');return;}
  if(action==='auth-mode'){state.authMode=control.dataset.mode;app.innerHTML=layout('auth',authPage());return;}
  if(action==='resend-verification'){
    control.disabled=true;
    try{const result=await resendConfirmation(state.signupEmail);toast(result.message);}catch(err){toast(err.message,true);}finally{control.disabled=false;}
    return;
  }
  if(action==='logout'){try{await signOut();go('home');toast('Signed out successfully.');}catch(err){toast(err.message,true);}return;}
  if(action==='pick-amount'){state.amount=Number(control.dataset.amount);renderPledgeModal();return;}
  if(action==='pick-custom'){state.amount='custom';renderPledgeModal();document.querySelector('#custom-pledge')?.focus();return;}
  if(action==='approve-demo'){try{await simulateApproval(control.dataset.id);await render();toast('Demo request approved. It now appears in the discovery feed.');}catch(err){toast(err.message,true);}return;}
  if(action==='view-document'){try{const url=await getReviewDocumentUrl(control.dataset.path);window.open(url,'_blank','noopener,noreferrer');}catch(err){toast(err.message,true);}return;}
  if(action==='review'){if(!confirm(`Are you sure you want to ${control.dataset.decision} this request?`))return;try{await reviewBill(control.dataset.id,control.dataset.decision);await render();toast(`Request ${control.dataset.decision}.`);}catch(err){toast(err.message,true);}return;}
});

document.addEventListener('submit',async(e)=>{
  if(e.target.id==='auth-form'){

  e.preventDefault();
  const form=e.target,data=new FormData(form),button=form.querySelector('button[type=submit]');
  const mode=form.dataset.mode,email=String(data.get('email')||'').trim(),password=String(data.get('password')||'');
  if(mode==='signup'||mode==='reset'){
    if(password.length<10){toast('Use a password of at least 10 characters.',true);return;}
    if(password!==String(data.get('confirm')||'')){toast('Passwords do not match.',true);return;}
  }
  if(mode==='signup'&&!data.has('agree')){toast('Agree to the terms and privacy policy to continue.',true);return;}
  button.disabled=true;button.textContent='One moment...';
  try{
    if(mode==='forgot'){
      const result=await requestPasswordReset(email);state.authMode='signin';app.innerHTML=layout('auth',authPage());toast(result.message);
    }else if(mode==='reset'){
      const result=await updatePassword(password);state.authMode='signin';go('dashboard');toast(result.message);
    }else{
      if(mode==='signup'){state.signupIntent=String(data.get('intent')||'requester');state.signupEmail=email;}
      const result=mode==='signup'?await signUp(String(data.get('name')||'').trim(),email,password,state.signupIntent):await signIn(email,password);
      if(user()){
        const next=mode==='signup'?(state.signupIntent==='requester'?'post':'discover'):state.authNext;
        state.authNext='dashboard';go(next);toast(result.message);
      }else if(mode==='signup'){
        state.authMode='verify';app.innerHTML=layout('auth',authPage());toast(result.message);
      }else{button.disabled=false;button.textContent='Sign in';toast(result.message);}
    }
  }catch(err){button.disabled=false;button.textContent=mode==='signup'?'Create my account':mode==='forgot'?'Send reset link':mode==='reset'?'Save new password':'Sign in';toast(err.message,true);}
  return;

  }
  if(e.target.id==='post-form'){
    e.preventDefault();const form=e.target, data=new FormData(form), button=form.querySelector('button[type=submit]');button.disabled=true;button.textContent='Submitting privately...';
    try {const input=Object.fromEntries(data.entries());await submitBill(input,form.querySelector('#document').files?.[0]);go('dashboard');toast(isDemo()?'Demo request saved! Simulate approval in your dashboard to publish it.':'Your request has been submitted for private review.');}
    catch(err){button.disabled=false;button.innerHTML=`Submit for review ${icon('arrow',18)}`;toast(err.message,true);}return;
  }
  if(e.target.id==='pledge-form'){
    e.preventDefault();const b=state.bills.find(b=>b.id===state.selected);if(!b)return;
    const dollars=state.amount==='custom'?parseDollars(state.custom):state.amount;
    if(!Number.isSafeInteger(dollars)||dollars<100||dollars>remaining(b)){toast('Choose an amount between $1 and the remaining balance.',true);return;}
    if(!isDemo()&&!user()){closeModal();state.authNext='discover';state.authMode='signup';go('auth');toast('Create an account or sign in to save your pledge.');return;}
    const button=e.target.querySelector('[type=submit]');button.disabled=true;button.textContent='Saving pledge...';
    try{await submitPledge(b.id,dollars);await updateAll();closeModal();toast(`You pledged ${money(dollars)}. No payment was collected.`);if(route()==='discover'){nextCard();}else if(route()==='home'){await render();}}
    catch(err){button.disabled=false;button.innerHTML=`Record my pledge ${icon('arrow',18)}`;toast(err.message,true);}return;
  }
});

(async()=>{try{await initialize();await render();}catch(err){console.error(err);app.innerHTML=`<div class="boot-error"><h1>Couldn't start OnlyBills</h1><p>${esc(err.message)}</p><p>Check your Supabase configuration in <code>src/config.js</code>, or remove the values to use demo mode.</p></div>`;}})();
