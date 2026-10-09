(() => {
'use strict';
const $ = s => document.querySelector(s);
const store = {
  get(k, d){ try{ const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
};
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rand = n => Math.floor(Math.random() * n);
const shuffle = a => { a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const isL = c => /\p{L}/u.test(c);
const letters = w => [...w.toLocaleLowerCase()].filter(isL);
const norm = s => letters(s).join('');
const lower = s => s.toLocaleLowerCase();
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = ms => new Promise(r => setTimeout(r, ms));

const SPEAK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>';
const ROCKET_SVG = '<svg viewBox="0 0 64 96"><path d="M32 4c11 10 15 26 12 46H20C17 30 21 14 32 4z" fill="#fff" stroke="#9FB3BB" stroke-width="2"/><circle cx="32" cy="30" r="7" fill="#2F9BD0" stroke="#1E7099" stroke-width="2"/><path d="M20 44l-11 14h12zM44 44l11 14H43z" fill="#FF6A48"/><path d="M25 52h14l-7 22z" fill="#FFD45E"/><path d="M28 54h8l-4 12z" fill="#FF6A48"/></svg>';

const CAR_SVG = '<svg viewBox="0 0 60 96"><rect x="2" y="14" width="9" height="20" rx="3" fill="#1b1b1b"/><rect x="49" y="14" width="9" height="20" rx="3" fill="#1b1b1b"/><rect x="2" y="62" width="9" height="20" rx="3" fill="#1b1b1b"/><rect x="49" y="62" width="9" height="20" rx="3" fill="#1b1b1b"/><rect x="8" y="4" width="44" height="88" rx="16" fill="#FF6A48"/><rect x="14" y="24" width="32" height="18" rx="5" fill="#BFE6F7"/><rect x="14" y="64" width="32" height="12" rx="4" fill="#BFE6F7" opacity=".75"/><rect x="26" y="4" width="8" height="88" fill="#fff" opacity=".35"/></svg>';
const FROG_SVG = '<svg viewBox="0 0 84 70"><ellipse cx="16" cy="63" rx="11" ry="6" fill="#3AA857"/><ellipse cx="68" cy="63" rx="11" ry="6" fill="#3AA857"/><ellipse cx="42" cy="44" rx="30" ry="22" fill="#4CC36B"/><circle cx="26" cy="19" r="12" fill="#4CC36B"/><circle cx="58" cy="19" r="12" fill="#4CC36B"/><circle cx="26" cy="19" r="7" fill="#fff"/><circle cx="58" cy="19" r="7" fill="#fff"/><circle cx="27" cy="20" r="3.5" fill="#1b1b1b"/><circle cx="59" cy="20" r="3.5" fill="#1b1b1b"/><path d="M29 46q13 9 26 0" stroke="#1E7A47" stroke-width="3" fill="none" stroke-linecap="round"/></svg>';
const BASKET_SVG = '<svg viewBox="0 0 96 50"><path d="M4 8h88l-10 38H14z" fill="#B57A45" stroke="#7A5233" stroke-width="3" stroke-linejoin="round"/><path d="M16 18h64M20 28h56M24 38h48" stroke="#7A5233" stroke-width="2.5"/></svg>';

/* ---------- game catalogue ---------- */
const GAMES = [
  {id:'scramble', group:'puzzle', side:'spell', name:'Tile Scramble', blurb:'Put the jumbled tiles back in order.', c:'var(--coral)',
   art:'<div class="mini"><span>T</span><span>C</span><span>A</span></div>'},
  {id:'missing', group:'puzzle', side:'spell', name:'Missing Letters', blurb:'Fill in the gaps to finish each word.', c:'var(--leaf)',
   art:'<div class="mini"><span>C</span><span class="dash">A</span><span>T</span></div>'},
  {id:'listen', group:'puzzle', side:'spell', name:'Listen & Spell', blurb:'Hear the word, then type it.', c:'var(--sky)',
   art:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z" fill="#fff"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>'},
  {id:'flash', group:'puzzle', side:'spell', name:'Flash Memory', blurb:'See it for a moment, then spell it from memory.', c:'var(--grape)',
   art:'<svg viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="#FFD45E" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>'},
  {id:'balloon', group:'action', side:'spell', name:'Balloon Pop', blurb:'Pop the floating letters in the right order.', c:'var(--berry)',
   art:'<div class="minib"><i>B</i><i>O</i><i>P</i></div>'},
  {id:'search', group:'puzzle', side:'spell', name:'Word Search', blurb:'Find every word hidden in the grid.', c:'var(--sun)',
   art:'<div class="minigrid"><span>Q</span><span class="hl">C</span><span>M</span><span>R</span><span>E</span><span>Z</span><span class="hl">A</span><span>L</span><span>W</span><span>K</span><span>D</span><span class="hl">T</span></div>'},
  {id:'whack', group:'action', side:'spell', name:'Whack-a-Letter', blurb:'Bop the moles that pop up, in spelling order.', c:'var(--leaf)',
   art:'<svg viewBox="0 0 64 64"><ellipse cx="32" cy="54" rx="27" ry="8" fill="#7A5638"/><path d="M14 54V34a18 18 0 0 1 36 0v20z" fill="#9C6B47"/><circle cx="25" cy="31" r="3" fill="#1b1b1b"/><circle cx="39" cy="31" r="3" fill="#1b1b1b"/><ellipse cx="32" cy="39" rx="5" ry="4" fill="#F29BA6"/></svg>'},
  {id:'snowman', group:'puzzle', side:'spell', name:'Save the Snowman', blurb:'Guess the letters before the snowman melts.', c:'var(--sky)',
   art:'<svg viewBox="0 0 64 64"><circle cx="32" cy="46" r="14" fill="#fff"/><circle cx="32" cy="25" r="10" fill="#fff"/><rect x="24" y="7" width="16" height="10" rx="1" fill="#1C2A36"/><rect x="19" y="16" width="26" height="3" rx="1" fill="#1C2A36"/><path d="M32 26l9 2-9 2z" fill="#FF6A48"/><circle cx="28" cy="23" r="1.6" fill="#1C2A36"/><circle cx="36" cy="23" r="1.6" fill="#1C2A36"/></svg>'},
  {id:'spot', group:'puzzle', side:'spell', name:'Spot the Mistake', blurb:'Is it spelled right or wrong? Decide fast!', c:'var(--berry)',
   art:'<svg viewBox="0 0 64 64"><circle cx="18" cy="32" r="13" fill="#fff"/><path d="M12 32l4.5 4.5L24 28" stroke="#1F9E5A" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="46" cy="32" r="13" fill="#fff"/><path d="M41 27l10 10M51 27l-10 10" stroke="#D9384F" stroke-width="4" stroke-linecap="round"/></svg>'},
  {id:'rocket', group:'action', side:'spell', name:'Rocket Typer', blurb:'Type the word fast to launch the rocket.', c:'var(--grape)',
   art:'<svg viewBox="0 0 64 96" style="height:80px">' + ROCKET_SVG.slice(ROCKET_SVG.indexOf('>') + 1)},
  {id:'cards', group:'learn', side:'def', name:'Flashcards', blurb:'Flip each card and check whether you knew the meaning.', c:'var(--sky)',
   art:'<div class="minicards"><span>word</span><span>meaning</span></div>'},
  {id:'pickword', group:'learn', side:'def', name:'Name That Word', blurb:'Read the meaning, then pick the right word.', c:'var(--coral)',
   art:'<div class="minipills"><i>tiny</i><i class="on">huge</i><i>old</i></div>'},
  {id:'pickdef', group:'learn', side:'def', name:'What Does It Mean?', blurb:'Read the word, then pick the right meaning.', c:'var(--leaf)',
   art:'<div class="minipills"><i>to run</i><i class="on">very big</i><i>sad</i></div>'},
  {id:'clue', group:'spell', side:'def', name:'Clue Speller', blurb:'Read the meaning, then spell the word.', c:'var(--grape)',
   art:'<div class="mini"><span>H</span><span class="dash">A</span><span class="dash">A</span></div>'},
  {id:'memory', group:'learn', side:'def', name:'Memory Pairs', blurb:'Flip cards to pair each word with its meaning.', c:'var(--sun)',
   art:'<div class="minimem"><i></i><i>A</i><i></i><i></i><i></i><i>A</i></div>'},
  {id:'defballoon', group:'learn', side:'def', name:'Meaning Balloons', blurb:'Pop the balloon carrying the word that matches.', c:'var(--berry)',
   art:'<div class="minib"><i class="w">huge</i><i class="w">old</i></div>'},
  {id:'matchup', group:'learn', side:'def', name:'Match Up', blurb:'Connect each word to its meaning.', c:'var(--sky)',
   art:'<svg viewBox="0 0 64 64"><rect x="4" y="8" width="18" height="10" rx="3" fill="#FFD45E"/><rect x="4" y="27" width="18" height="10" rx="3" fill="#FFD45E"/><rect x="4" y="46" width="18" height="10" rx="3" fill="#FFD45E"/><rect x="40" y="8" width="20" height="10" rx="3" fill="#fff"/><rect x="40" y="27" width="20" height="10" rx="3" fill="#fff"/><rect x="40" y="46" width="20" height="10" rx="3" fill="#fff"/><path d="M22 13L40 51M22 32L40 13M22 51L40 32" stroke="#fff" stroke-width="2.5"/></svg>'},
  {id:'catcher', group:'action', side:'spell', name:'Letter Catcher', blurb:'Slide the basket to catch falling letters in order.', c:'var(--sky)',
   art:'<svg viewBox="0 0 64 64"><circle cx="36" cy="15" r="11" fill="#fff"/><text x="36" y="21" text-anchor="middle" font-family="Lilita One, sans-serif" font-size="16" fill="#2F9BD0">A</text><circle cx="16" cy="30" r="7" fill="#FFD45E"/><path d="M8 40h48l-7 18H15z" fill="#B57A45" stroke="#7A5233" stroke-width="2.5" stroke-linejoin="round"/></svg>'},
  {id:'racer', group:'action', side:'spell', name:'Lane Racer', blurb:'Steer your car through the right letter gates.', c:'var(--coral)',
   art:CAR_SVG.replace('<svg ', '<svg style="height:84px;width:auto" ')},
  {id:'frog', group:'puzzle', side:'spell', name:'Frog Hop', blurb:'Help the frog hop across the right letters.', c:'var(--leaf)',
   art:FROG_SVG.replace('<svg ', '<svg style="width:84px;height:auto" ')},
  {id:'fish', group:'action', side:'spell', name:'Fishing', blurb:'Catch the swimming fish in spelling order.', c:'var(--sky)',
   art:'<svg viewBox="0 0 64 40" style="width:90px"><path d="M4 8l14 12L4 32z" fill="#FFD45E"/><ellipse cx="38" cy="20" rx="24" ry="15" fill="#FFD45E"/><circle cx="50" cy="16" r="3" fill="#1b1b1b"/><text x="36" y="26" text-anchor="middle" font-family="Lilita One, sans-serif" font-size="15" fill="#3B2A00">F</text></svg>'},
  {id:'d-scramble', base:'scramble', group:'spell', side:'def', name:'Clue Scramble', blurb:'Read the meaning, then unjumble the tiles.', c:'var(--coral)'},
  {id:'d-balloon', base:'balloon', group:'spell', side:'def', name:'Clue Balloon Pop', blurb:'Read the meaning, then pop its letters in order.', c:'var(--berry)'},
  {id:'d-whack', base:'whack', group:'spell', side:'def', name:'Clue Whack-a-Letter', blurb:'Read the meaning, then bop its letters in order.', c:'var(--leaf)'},
  {id:'d-snowman', base:'snowman', group:'spell', side:'def', name:'Clue Snowman', blurb:'Use the meaning to guess the word before the snowman melts.', c:'var(--sky)'},
  {id:'d-rocket', base:'rocket', group:'spell', side:'def', name:'Clue Rocket', blurb:'Read the meaning and type the word to launch the rocket.', c:'var(--grape)'},
  {id:'d-catcher', base:'catcher', group:'spell', side:'def', name:'Clue Catcher', blurb:'Read the meaning, then catch its falling letters.', c:'var(--sky)'},
  {id:'d-racer', base:'racer', group:'spell', side:'def', name:'Clue Racer', blurb:'Read the meaning, then drive through its letters.', c:'var(--coral)'},
  {id:'d-frog', base:'frog', group:'spell', side:'def', name:'Clue Frog Hop', blurb:'Read the meaning, then hop across its letters.', c:'var(--leaf)'},
  {id:'d-fish', base:'fish', group:'spell', side:'def', name:'Clue Fishing', blurb:'Read the meaning, then catch the fish with its letters.', c:'var(--sky)'},
];
const gameById = id => GAMES.find(g => g.id === id);
const GROUPS = {spell:[['action','Action games'],['puzzle','Puzzles and practice']], def:[['learn','Learn the meanings'],['spell','Spell from the meaning']]};
const WHOLE_ROUND = new Set(['search', 'memory', 'matchup']);

/* ---------- setup ---------- */
const SAMPLES = {
  spell: 'because\nfriend\nbeautiful\nnecessary\nrhythm\nlibrary\nseparate\nknight\nexcited\nWednesday',
  def: 'enormous - very big\nancient - very old\nfragile - easily broken\ncurious - wanting to know or learn about something\ngenerous - happy to give things to other people\nbrave - ready to face danger without being afraid\ntimid - shy and easily frightened\nvanish - to disappear suddenly\ngleaming - shining brightly\nexhausted - very, very tired'
};
const TEXT = {
  spell: {title:'Your words', lead:'Type or paste your spelling list. Put each word on its own line, or separate them with commas.',
    label:'Spelling list', ph:'because\nfriend\nbeautiful', games:'Each round picks words at random from your list.'},
  def: {title:'Your words and meanings', lead:'Put each word on its own line, then a dash and what it means. For example: enormous - very big',
    label:'Words and meanings', ph:'enormous - very big\nancient - very old', games:'Games for learning what your words mean. Each round picks words at random from your list.'}
};
const KEY = {spell:'sa.words', def:'sa.defs'};
let mode = store.get('sa.mode', 'spell');
if(!KEY[mode]) mode = 'spell';
const wordsEl = $('#words'), countEl = $('#count'), langEl = $('#lang');
countEl.value = store.get('sa.count', 10);
langEl.value = store.get('sa.lang', 'en-US');
let skipped = 0;

function splitDef(line){
  let m = line.match(/^(.+?)\s*(?:\t|\s[-–—]\s|:|=)\s*(.+)$/);
  if(!m) m = line.match(/^([^-–—]+?)\s*[-–—]\s*(.+\s.+)$/);
  return m ? {w:m[1].trim().replace(/\s+/g, ' '), d:m[2].trim().replace(/\s+/g, ' ')} : null;
}
function parseList(){
  const seen = new Set(), out = [];
  skipped = 0;
  const parts = mode === 'spell' ? wordsEl.value.split(/[\n,;]+/) : wordsEl.value.split(/\n+/);
  for(const raw of parts){
    const p = raw.trim();
    if(!p) continue;
    let e;
    if(mode === 'spell') e = {w:p.replace(/\s+/g, ' '), d:''};
    else { e = splitDef(p); if(!e || !e.d){ skipped++; continue; } }
    if(!/\p{L}/u.test(e.w)){ if(mode === 'def') skipped++; continue; }
    const k = lower(e.w);
    if(seen.has(k)) continue;
    seen.add(k); out.push(e);
  }
  return out.slice(0, 300);
}
function syncSetup(){
  const es = parseList();
  $('#chips').innerHTML = es.map(e => `<span class="chip"${e.d ? ` title="${esc(e.d)}"` : ''}>${esc(e.w)}</span>`).join('');
  $('#sampleNote').hidden = wordsEl.value.trim() !== SAMPLES[mode].trim();
  const sk = $('#skipNote');
  sk.hidden = !(mode === 'def' && skipped);
  sk.textContent = `${skipped} line${skipped === 1 ? ' has' : 's have'} no meaning yet and will be left out. Write them like this: enormous - very big`;
  if(es.length) $('#err').hidden = true;
  const max = Math.max(1, es.length);
  countEl.max = max;
  const n = clamp(parseInt(countEl.value, 10) || 1, 1, max);
  if(String(n) !== countEl.value && document.activeElement !== countEl) countEl.value = n;
  $('#of').textContent = `of ${es.length} word${es.length === 1 ? '' : 's'}`;
  store.set(KEY[mode], wordsEl.value);
  store.set('sa.count', n);
}
function loadMode(){
  const t = TEXT[mode];
  document.querySelectorAll('.mode').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
  $('#wordsTitle').textContent = t.title;
  $('#wordsLead').textContent = t.lead;
  $('#wordsLbl').textContent = t.label;
  $('#gamesLead').textContent = t.games;
  wordsEl.placeholder = t.ph;
  wordsEl.value = store.get(KEY[mode], SAMPLES[mode]);
  renderGameCards();
  syncSetup();
}
document.querySelectorAll('.mode').forEach(b => b.onclick = () => {
  if(b.dataset.mode === mode) return;
  store.set(KEY[mode], wordsEl.value);
  mode = b.dataset.mode;
  store.set('sa.mode', mode);
  sfx('tap');
  if(!$('#setup').hidden) loadMode(); else { goHome(); loadMode(); }
});
wordsEl.addEventListener('input', syncSetup);
countEl.addEventListener('change', () => { countEl.value = clamp(parseInt(countEl.value, 10) || 1, 1, +countEl.max); syncSetup(); });
$('#minus').onclick = () => { countEl.value = clamp((+countEl.value || 1) - 1, 1, +countEl.max); syncSetup(); };
$('#plus').onclick = () => { countEl.value = clamp((+countEl.value || 0) + 1, 1, +countEl.max); syncSetup(); };
$('#all').onclick = () => { countEl.value = countEl.max; syncSetup(); };
langEl.onchange = () => store.set('sa.lang', langEl.value);

function renderGameCards(){
  $('#games').innerHTML = GROUPS[mode].map(([grp, label]) => {
    const list = GAMES.filter(g => g.side === mode && g.group === grp);
    return `<h3 class="ghead">${esc(label)} <span>${list.length} games</span></h3><div class="games">` + list.map(g => {
      const best = store.get('sa.best.' + g.id, 0);
      const art = g.base ? gameById(g.base).art + '<span class="cluebadge">Clue</span>' : g.art;
      return `<button class="game" data-id="${g.id}" type="button">
        <div class="art" style="--c:${g.c}">${art}</div>
        <div class="meta"><span class="name">${esc(g.name)}</span><span class="blurb">${esc(g.blurb)}</span>
        <span class="best">${best ? 'Best score ' + best : 'Not played yet'}</span></div></button>`;
    }).join('') + '</div>';
  }).join('');
}
$('#games').addEventListener('click', e => {
  const b = e.target.closest('.game'); if(!b) return;
  sfx('tap'); startGame(b.dataset.id);
});

/* ---------- sound ---------- */
let AC = null, muted = store.get('sa.muted', false);
function paintMute(){ $('#mute').setAttribute('aria-pressed', String(muted)); $('#mutelbl').textContent = muted ? 'Sound off' : 'Sound on'; $('#wave').style.opacity = muted ? 0 : 1; }
$('#mute').onclick = () => { muted = !muted; store.set('sa.muted', muted); paintMute(); };
paintMute();
function sfx(kind){
  if(muted) return;
  try{
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const now = AC.currentTime;
    const seq = {ding:[[660,0],[990,.09]], pop:[[740,0],[520,.04]], buzz:[[170,0],[130,.11]], miss:[[330,0],[247,.16]],
      fanfare:[[523,0],[659,.13],[784,.26],[1047,.4]], tap:[[880,0]], flip:[[520,0],[700,.05]], whoosh:[[300,0],[500,.1],[800,.2],[1200,.3]]}[kind] || [];
    seq.forEach(([f, t]) => {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = kind === 'buzz' ? 'square' : 'triangle'; o.frequency.value = f;
      const len = kind === 'tap' ? .06 : kind === 'fanfare' ? .35 : .22;
      g.gain.setValueAtTime(.0001, now + t);
      g.gain.exponentialRampToValueAtTime(kind === 'buzz' ? .06 : .2, now + t + .012);
      g.gain.exponentialRampToValueAtTime(.0001, now + t + len);
      o.connect(g).connect(AC.destination); o.start(now + t); o.stop(now + t + len + .05);
    });
  }catch(e){}
}
const canSpeak = 'speechSynthesis' in window;
function speak(w, rate){
  try{
    const s = window.speechSynthesis; if(!s) return false;
    s.cancel();
    const u = new SpeechSynthesisUtterance(w);
    u.lang = langEl.value; u.rate = rate || .85;
    const code = langEl.value.toLowerCase();
    const vs = s.getVoices();
    const v = vs.find(v => v.lang.replace('_','-').toLowerCase() === code) || vs.find(v => v.lang.toLowerCase().startsWith(code.slice(0,2)));
    if(v) u.voice = v;
    const btn = $('#bigspeak');
    if(btn){ btn.classList.add('talking'); u.onend = u.onerror = () => btn.classList.remove('talking'); }
    s.speak(u); return true;
  }catch(e){ return false; }
}

/* ---------- confetti ---------- */
const cv = $('#confetti'), cx = cv.getContext('2d');
let parts = [], craf = 0;
function confetti(n){
  if(reduce) return;
  if(!craf){ cv.width = innerWidth; cv.height = innerHeight; }
  const cs = getComputedStyle(document.documentElement);
  const cols = ['--coral','--sky','--leaf','--grape','--sun','--berry','--tile'].map(v => cs.getPropertyValue(v).trim());
  for(let i = 0; i < n; i++) parts.push({x: cv.width/2 + (Math.random()-.5)*cv.width*.35, y: cv.height*.42, vx:(Math.random()-.5)*14, vy:-Math.random()*13-4,
    s:6+Math.random()*7, r:Math.random()*6, vr:(Math.random()-.5)*.35, c:cols[rand(cols.length)]});
  if(!craf) craf = requestAnimationFrame(stepConfetti);
}
function stepConfetti(){
  cx.clearRect(0, 0, cv.width, cv.height);
  parts.forEach(p => { p.vy += .38; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
    cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.fillRect(-p.s/2, -p.s/3, p.s, p.s*.66); cx.restore(); });
  parts = parts.filter(p => p.y < cv.height + 30);
  craf = parts.length ? requestAnimationFrame(stepConfetti) : (cx.clearRect(0,0,cv.width,cv.height), 0);
}

/* ---------- screens & round flow ---------- */
const stage = $('#stage');
let S = null;
function show(id){
  ['setup','play','results'].forEach(s => $('#' + s).hidden = s !== id);
  $('#modes').hidden = id !== 'setup';
  const el = $('#' + id);
  window.scrollTo({top: id === 'setup' ? 0 : Math.max(0, el.getBoundingClientRect().top + window.scrollY - 12)});
}
function stopCurrent(){ if(S && S.stop){ S.stop(); S.stop = null; } try{ speechSynthesis.cancel(); }catch(e){} }
function goHome(){ stopCurrent(); S = null; $('#burst').hidden = true; renderGameCards(); show('setup'); }
$('#home').onclick = goHome;
$('#quit').onclick = goHome;

function startGame(id, list){
  const es = parseList();
  if(!list){
    if(!es.length){ $('#err').hidden = false; wordsEl.focus(); return; }
    const n = clamp(parseInt(countEl.value, 10) || 1, 1, es.length);
    list = shuffle(es).slice(0, n);
  }
  stopCurrent();
  S = {game:id, list, pool: es.length ? es : list, i:0, score:0, streak:0, results:[], mistakes:0, locked:false, stop:null, key:null};
  $('#gname').textContent = gameById(id).name;
  $('#burst').hidden = true;
  show('play');
  if(WHOLE_ROUND.has(id)) WHOLE[id](); else nextWord();
}
function renderHud(){
  $('#score').textContent = S.score;
  $('#streak').textContent = S.streak;
  $('#streakbox').classList.toggle('hot', S.streak >= 3);
  $('#dots').innerHTML = S.list.map((e, k) => {
    const r = S.results[k];
    return `<i class="${r ? r.res : (k === S.i && !WHOLE_ROUND.has(S.game) ? 'cur' : '')}"></i>`;
  }).join('');
}
function nextWord(){
  if(S.i >= S.list.length) return finish();
  if(S.stop){ S.stop(); S.stop = null; }
  S.mistakes = 0; S.locked = false; S.key = null;
  renderHud();
  stage.innerHTML = '';
  const e = S.list[S.i], g = gameById(S.game);
  IMPL[g.base || g.id](e.w, e, !!g.base);
}
function shake(el){ if(!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
function wrong(el){ S.mistakes++; S.streak = 0; sfx('buzz'); shake(el || stage); renderHud(); }

const PRAISE = ['Perfect!','Brilliant!','Spot on!','Superb!','Nailed it!','Fantastic!'];
const OKAY = ['Got it!','You did it!','Nice save!','Well done!'];
function resolve(kind, opt){
  opt = opt || {};
  if(S.locked) return;
  S.locked = true; S.key = null;
  const e = S.list[S.i], w = e.w, tok = S;
  let res, pts = 0;
  if(kind === 'skip'){ res = 'missed'; S.streak = 0; }
  else if(S.mistakes === 0){ res = 'perfect'; S.streak++; pts = 10 + Math.min(S.streak - 1, 5) * 2; }
  else { res = 'tricky'; pts = 5; S.streak = 0; }
  S.score += pts;
  S.results[S.i] = {word:w, e, res};
  renderHud();
  const b = $('#burst');
  b.className = 'burst ' + res;
  const head = opt.msg || (res === 'perfect' ? PRAISE[rand(PRAISE.length)] : OKAY[rand(OKAY.length)]);
  b.innerHTML = res === 'missed'
    ? `<div><b>${esc(opt.msg || 'The word is')}</b><span class="w">${esc(w)}</span></div>`
    : `<div><b>${esc(head)}</b><small>+${pts} points${res === 'perfect' && S.streak >= 3 ? ' · ' + S.streak + ' in a row' : ''}</small></div>`;
  b.hidden = false;
  if(res === 'missed') sfx('miss'); else { sfx('ding'); confetti(res === 'perfect' ? 70 : 25); }
  setTimeout(() => {
    if(S !== tok) return;
    b.hidden = true;
    S.i++; nextWord();
  }, (res === 'missed' ? 2200 : 1250) + (opt.extra || 0));
}

function finish(){
  stopCurrent();
  const tot = S.list.length;
  const c = r => S.results.filter(x => x && x.res === r).length;
  const p = c('perfect'), t = c('tricky'), m = tot - p - t;
  const pct = tot ? (p + t * .5) / tot : 0;
  const stars = pct >= .9 ? 3 : pct >= .6 ? 2 : pct > 0 ? 1 : 0;
  const key = 'sa.best.' + S.game, prev = store.get(key, 0), isBest = S.score > prev;
  if(isBest) store.set(key, S.score);
  const star = on => `<svg class="${on ? 'on' : ''}" viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" stroke-linejoin="round"/></svg>`;
  const heads = ['Keep practising!','Good effort!','Great work!','Superstar!'];
  const retry = S.results.filter(r => r && r.res !== 'perfect').map(r => r.e);
  $('#resbox').innerHTML = `
    <h2>${heads[stars]}</h2>
    <p class="lead" style="margin:0">${esc(gameById(S.game).name)} · ${tot} word${tot === 1 ? '' : 's'}</p>
    <div class="stars" aria-label="${stars} of 3 stars">${star(stars >= 1)}${star(stars >= 2)}${star(stars >= 3)}</div>
    <div class="bigscore">${S.score}</div>
    <p class="lead" style="margin:0">${isBest ? 'New best score!' : 'Best score ' + prev}</p>
    <div class="summary"><span style="background:var(--good)">${p} perfect</span><span style="background:var(--warn)">${t} with help</span><span style="background:var(--bad)">${m} missed</span></div>
    <div class="rlist">${S.results.filter(Boolean).map(r => `<span class="${r.res}"${r.e.d ? ` title="${esc(r.e.d)}"` : ''}>${esc(r.word)}</span>`).join('')}</div>
    <div class="actions" style="margin-top:8px">
      <button class="btn" id="again" type="button">Play again</button>
      <button class="btn blue" id="practice" type="button" ${retry.length ? '' : 'disabled'}>Practise tricky words${retry.length ? ' (' + retry.length + ')' : ''}</button>
      <button class="btn ghost" id="other" type="button">Choose another game</button>
    </div>`;
  const g = S.game;
  $('#again').onclick = () => startGame(g);
  $('#practice').onclick = () => retry.length && startGame(g, shuffle(retry));
  $('#other').onclick = goHome;
  show('results');
  sfx('fanfare');
  if(stars === 3) confetti(220); else if(stars === 2) confetti(90);
}

document.addEventListener('keydown', e => {
  if(!S || !S.key || $('#play').hidden) return;
  if(e.target.matches('input,textarea,select')) return;
  S.key(e);
});

/* ---------- shared bits ---------- */
function bindSkip(){ const b = stage.querySelector('#skip'); if(b) b.onclick = () => resolve('skip'); }
function bindHear(w){ stage.querySelectorAll('[data-hear]').forEach(b => b.onclick = () => speak(w, b.dataset.hear === 'slow' ? .55 : .85)); }
const hearBtn = () => canSpeak ? `<button class="btn blue small" type="button" data-hear="normal">Hear it</button>` : '';
const skipBtn = (label) => `<button class="btn ghost small" type="button" id="skip">${label || 'Skip'}</button>`;
const tilesHtml = (w, cls) => [...w].map(c => c === ' ' ? '<span class="gap"></span>' : `<span class="tile${cls ? ' ' + cls : ''}">${esc(c)}</span>`).join('');
function typeBox(w, host){
  host.insertAdjacentHTML('beforeend', `<form class="typebox" id="tb" autocomplete="off">
    <input class="answer" id="answer" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Type the word" placeholder="Type the word">
    <button class="btn" type="submit">Check</button></form><p class="hint" id="hint" hidden></p>`);
  const f = host.querySelector('#tb'), inp = f.querySelector('input'), hint = host.querySelector('#hint');
  f.addEventListener('submit', e => {
    e.preventDefault();
    if(S.locked) return;
    if(!norm(inp.value)){ inp.focus(); return; }
    if(norm(inp.value) === norm(w)){ inp.classList.add('good'); inp.disabled = true; resolve('done'); }
    else {
      wrong(inp); inp.select();
      if(S.mistakes >= 2){ const ls = letters(w); hint.hidden = false; hint.textContent = `Hint: it starts with “${ls[0].toLocaleUpperCase()}” and has ${ls.length} letters.`; }
    }
  });
  setTimeout(() => inp.focus(), 60);
  return inp;
}
/* Prompt, optional meaning clue, and the row of letter tiles to fill. */
const promptHtml = (def, e, spellText, defText) => `<p class="prompt">${def ? defText : spellText}</p>` + (def ? `<div class="defbox">${esc(e.d)}</div>` : '');
const targetHtml = (ls, def) => `<div class="tiles" id="target">${ls.map(c => def ? '<span class="tile slot"></span>' : `<span class="tile faded">${esc(c)}</span>`).join('')}</div>`;
const reveal = (el, ch) => { el.textContent = ch; el.classList.remove('faded', 'slot'); };
const hearIf = def => def ? '' : hearBtn();
function decoyLetters(ls){
  const latin = ls.every(c => /[a-z]/.test(c));
  const own = [...new Set(S.pool.flatMap(e => letters(e.w)))];
  return latin ? [...new Set([...'abcdefghijklmnopqrstuvwxyz', ...own])] : own;
}
function otherEntries(e, n){
  return shuffle(S.pool.filter(x => lower(x.w) !== lower(e.w) && x.d !== e.d)).slice(0, n);
}

/* Floating balloons, shared by Balloon Pop and Meaning Balloons. */
function balloonField(sky, cfg){
  const colors = ['--coral','--sky','--leaf','--grape','--sun','--berry'];
  const n = cfg.n, bs = [], side = !!cfg.side, rows = cfg.rows || 1;
  if(cfg.wide){ sky.classList.add('wide'); sky.style.setProperty('--bw', Math.min(180, sky.clientWidth / n - 12) + 'px'); }
  for(let i = 0; i < n; i++){
    const el = document.createElement('button');
    el.className = side ? 'fish' : 'balloon'; el.type = 'button'; el.innerHTML = '<span class="b"></span>';
    sky.appendChild(el);
    bs.push({el, lane:i, busy:false, label:null, x:0, y:0, v:0});
  }
  const onScreen = o => { const W = sky.clientWidth, H = sky.clientHeight; return side ? o.x > -40 && o.x < W - 40 : o.y > -60 && o.y < H - 40; };
  function place(b, initial){
    const W = sky.clientWidth, H = sky.clientHeight, bw = b.el.offsetWidth || 62;
    if(side){
      const row = b.lane % rows, rowH = H / rows;
      b.dir = row % 2 ? -1 : 1;
      b.y = row * rowH + Math.max(0, (rowH - (b.el.offsetHeight || 48)) / 2);
      b.x = initial ? (b.lane < rows ? 0 : W / 2) + Math.random() * Math.max(0, W / 2 - bw) : (b.dir > 0 ? -bw - 10 : W + 10);
      b.el.classList.toggle('l', b.dir < 0);
    } else {
      const lane = W / n;
      b.x = b.lane * lane + Math.random() * Math.max(0, lane - bw);
      b.y = initial ? Math.random() * H * .75 : -90;
    }
    b.v = (cfg.speed || 1) * (38 + Math.random() * 42);
    const need = cfg.need();
    const missing = need != null && !bs.some(o => o !== b && o.label === need && onScreen(o));
    b.label = need != null && (missing || Math.random() < .3) ? need : cfg.decoy(need);
    b.el.querySelector('.b').textContent = b.label;
    b.el.style.setProperty('--bc', `var(${colors[rand(colors.length)]})`);
    b.el.setAttribute('aria-label', (side ? 'Fish ' : 'Balloon ') + b.label);
    b.el.classList.remove('pop', 'no');
  }
  bs.forEach(b => place(b, true));
  sky.addEventListener('click', e => {
    const el = e.target.closest('.balloon, .fish'); if(!el || S.locked) return;
    const b = bs.find(o => o.el === el); if(!b || b.busy) return;
    if(cfg.hit(b.label)){
      b.busy = true; el.classList.add('pop'); sfx('pop');
      setTimeout(() => { b.busy = false; place(b); }, 260);
    } else {
      el.classList.remove('no'); void el.offsetWidth; el.classList.add('no'); wrong(null);
    }
  });
  let last = performance.now(), raf = 0;
  function loop(t){
    const dt = Math.min(.05, (t - last) / 1000); last = t;
    const H = sky.clientHeight, W = sky.clientWidth;
    bs.forEach(b => {
      if(!b.busy){
        if(side){ b.x += b.dir * b.v * dt; if((b.dir > 0 && b.x > W + 20) || (b.dir < 0 && b.x < -(b.el.offsetWidth || 84) - 20)) place(b); }
        else { b.y += b.v * dt; if(b.y > H + 20) place(b); }
      }
      b.el.style.transform = side ? `translate(${b.x}px, ${b.y}px)` : `translate(${b.x}px, ${-b.y}px)`;
    });
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(raf);
}

/* A plausible misspelling of a word, or null if none can be made. */
function misspell(w){
  const target = lower(w);
  for(let t = 0; t < 30; t++){
    const a = [...w];
    const li = a.map((c, i) => i).filter(i => isL(a[i]));
    if(li.length < 2) return null;
    const kind = rand(4);
    if(kind === 0){
      const opts = li.filter(i => li.includes(i + 1) && lower(a[i]) !== lower(a[i + 1]));
      if(!opts.length) continue;
      const i = opts[rand(opts.length)]; [a[i], a[i + 1]] = [a[i + 1], a[i]];
    } else if(kind === 1){
      const i = li[1 + rand(li.length - 1)]; a.splice(i, 0, a[i]);
    } else if(kind === 2){
      if(li.length < 4) continue;
      a.splice(li[1 + rand(li.length - 1)], 1);
    } else {
      const vs = li.filter(i => 'aeiou'.includes(lower(a[i])));
      if(!vs.length) continue;
      const i = vs[rand(vs.length)], others = [...'aeiou'].filter(v => v !== lower(a[i]));
      a[i] = others[rand(others.length)];
    }
    const out = a.join('');
    if(lower(out) !== target) return out;
  }
  return null;
}

/* ---------- spelling games ---------- */
const IMPL = {};

IMPL.scramble = (w, e, def) => {
  const ls = letters(w);
  let order = shuffle(ls.map((c, i) => i));
  for(let k = 0; k < 25 && ls.length > 1 && order.every((v, i) => ls[v] === ls[i]); k++) order = shuffle(order);
  const tiles = order.map(i => ({ch:ls[i], used:false}));
  let ans = [];
  stage.innerHTML = promptHtml(def, e, 'Tap the tiles to spell the word', 'Unjumble the word that means…') + `
    <div class="tiles" id="slots"></div><div class="tiles" id="pool"></div>
    <div class="actions">${hearIf(def)}<button class="btn ghost small" type="button" id="clr">Clear</button>${skipBtn()}</div>`;
  const slots = stage.querySelector('#slots'), pool = stage.querySelector('#pool');
  function draw(){
    slots.innerHTML = ls.map((_, k) => ans[k] ? `<button class="tile" type="button" data-a="${k}">${esc(ans[k].ch)}</button>` : `<span class="tile slot"></span>`).join('');
    pool.innerHTML = tiles.map((t, k) => `<button class="tile${t.used ? ' ghost' : ''}" type="button" data-t="${k}" ${t.used ? 'tabindex="-1" aria-hidden="true"' : ''}>${esc(t.ch)}</button>`).join('');
  }
  function pick(t){ if(S.locked || t.used) return; t.used = true; ans.push(t); sfx('tap'); draw(); if(ans.length === ls.length) check(); }
  function unpick(k){ if(S.locked) return; ans.splice(k).forEach(t => t.used = false); draw(); }
  function check(){
    if(ans.map(t => t.ch).join('') === ls.join('')){
      slots.querySelectorAll('.tile').forEach(e => e.classList.add('good')); resolve('done');
    } else {
      wrong(slots);
      setTimeout(() => { if(S.locked) return; tiles.forEach(t => t.used = false); ans = []; draw(); }, 650);
    }
  }
  pool.onclick = e => { const b = e.target.closest('[data-t]'); if(b) pick(tiles[+b.dataset.t]); };
  slots.onclick = e => { const b = e.target.closest('[data-a]'); if(b) unpick(+b.dataset.a); };
  stage.querySelector('#clr').onclick = () => unpick(0);
  S.key = e => {
    if(e.key === 'Backspace'){ e.preventDefault(); if(ans.length) unpick(ans.length - 1); return; }
    const k = lower(e.key);
    if(k.length === 1){ const t = tiles.find(t => !t.used && t.ch === k); if(t) pick(t); }
  };
  draw(); bindSkip(); bindHear(w);
};

IMPL.missing = w => {
  const chars = [...w];
  const idx = chars.map((c, i) => i).filter(i => isL(chars[i]));
  const k = Math.max(1, Math.round(idx.length * .4));
  const blanks = new Set(shuffle(idx).slice(0, Math.min(k, idx.length)));
  stage.innerHTML = `<p class="prompt">Fill in the missing letters</p>
    <div class="tiles" id="row">${chars.map((c, i) => blanks.has(i)
      ? `<input class="tile" maxlength="2" data-i="${i}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Missing letter ${i + 1}">`
      : c === ' ' ? '<span class="gap"></span>' : `<span class="tile">${esc(c)}</span>`).join('')}</div>
    <div class="actions">${hearBtn()}<button class="btn" type="button" id="chk">Check</button>${skipBtn()}</div>`;
  const row = stage.querySelector('#row'), ins = [...row.querySelectorAll('input')];
  function check(){
    if(S.locked) return;
    const empty = ins.find(x => !x.value); if(empty){ empty.focus(); return; }
    const bad = ins.filter(x => lower(x.value) !== lower(chars[+x.dataset.i]));
    if(!bad.length){ ins.forEach(x => { x.disabled = true; x.classList.add('good'); }); resolve('done'); }
    else { bad.forEach(x => x.classList.add('bad')); wrong(row); bad[0].focus(); bad[0].select(); }
  }
  ins.forEach((inp, n) => {
    inp.addEventListener('input', () => {
      inp.classList.remove('bad');
      inp.value = [...inp.value].filter(isL).pop() || '';
      if(inp.value){ if(ins[n + 1]) ins[n + 1].focus(); if(ins.every(x => x.value)) check(); }
    });
    inp.addEventListener('focus', () => inp.select());
    inp.addEventListener('keydown', e => {
      if(e.key === 'Backspace' && !inp.value && ins[n - 1]){ e.preventDefault(); ins[n - 1].focus(); }
      if(e.key === 'Enter') check();
    });
  });
  stage.querySelector('#chk').onclick = check;
  bindSkip(); bindHear(w);
  setTimeout(() => ins[0] && ins[0].focus(), 60);
};

IMPL.listen = w => {
  stage.innerHTML = canSpeak
    ? `<button class="bigspeak" id="bigspeak" type="button" aria-label="Hear the word">${SPEAK_ICON}</button>
       <p class="prompt">Listen, then spell what you hear</p>
       <div class="actions"><button class="btn blue small" type="button" data-hear="slow">Say it slowly</button><button class="btn ghost small" type="button" id="peek">Peek</button>${skipBtn()}</div>`
    : `<p class="prompt">This browser can’t read words aloud.</p><p class="sub">Tap Peek to see the word for a moment, then spell it.</p>
       <div class="actions"><button class="btn blue small" type="button" id="peek">Peek</button>${skipBtn()}</div>`;
  const big = stage.querySelector('#bigspeak');
  if(big) big.onclick = () => speak(w);
  const peekBtn = stage.querySelector('#peek');
  peekBtn.onclick = () => {
    S.mistakes++;
    peekBtn.textContent = w; peekBtn.disabled = true;
    setTimeout(() => { peekBtn.textContent = 'Peek'; peekBtn.disabled = false; }, 1200);
  };
  bindHear(w); bindSkip();
  typeBox(w, stage);
  if(canSpeak) setTimeout(() => { if(S && S.list[S.i] && S.list[S.i].w === w && !S.locked) speak(w); }, 350);
};

IMPL.flash = w => {
  const ms = 1400 + 220 * letters(w).length;
  function flash(){
    stage.innerHTML = `<p class="prompt">Remember this word!</p>
      <div class="tiles">${tilesHtml(w)}</div>
      <div class="timer"><i id="bar"></i></div>`;
    const bar = stage.querySelector('#bar');
    bar.style.transition = `width ${ms}ms linear`;
    requestAnimationFrame(() => requestAnimationFrame(() => bar.style.width = '0%'));
    const tok = S, wi = S.i;
    const t = setTimeout(() => { if(S === tok && S.i === wi && !S.locked) ask(); }, ms);
    S.stop = () => clearTimeout(t);
  }
  function ask(){
    stage.innerHTML = `<p class="prompt">Now spell it from memory</p>
      <div class="actions"><button class="btn ghost small" type="button" id="again">Show me again</button>${skipBtn()}</div>`;
    stage.querySelector('#again').onclick = () => { S.mistakes++; flash(); };
    bindSkip();
    typeBox(w, stage);
  }
  flash();
};

IMPL.balloon = (w, e, def) => {
  const ls = letters(w);
  let pos = 0;
  const decoys = decoyLetters(ls);
  stage.innerHTML = promptHtml(def, e, 'Pop the letters in order', 'Pop the letters of the word that means…') + `
    ${targetHtml(ls, def)}
    <div class="skybox" id="sky"></div>
    <div class="actions">${hearIf(def)}${skipBtn()}</div>`;
  const sky = stage.querySelector('#sky'), target = [...stage.querySelectorAll('#target .tile')];
  S.stop = balloonField(sky, {
    n: sky.clientWidth < 480 ? 5 : 7,
    need: () => pos < ls.length ? ls[pos] : null,
    decoy: () => decoys[rand(decoys.length)],
    hit: label => {
      if(label !== ls[pos]) return false;
      reveal(target[pos], ls[pos]); pos++;
      if(pos === ls.length){ target.forEach(t => t.classList.add('good')); resolve('done'); }
      return true;
    }
  });
  bindSkip(); bindHear(w);
};

IMPL.whack = (w, e, def) => {
  const ls = letters(w);
  let pos = 0;
  const decoys = decoyLetters(ls);
  stage.innerHTML = promptHtml(def, e, 'Bop the moles in spelling order', 'Bop the letters of the word that means…') + `
    ${targetHtml(ls, def)}
    <div class="holes" id="holes">${Array.from({length:9}, (_, i) => `<div class="hole"><button class="mole" type="button" data-h="${i}" tabindex="-1"></button></div>`).join('')}</div>
    <div class="actions">${hearIf(def)}${skipBtn()}</div>`;
  const target = [...stage.querySelectorAll('#target .tile')];
  const moles = [...stage.querySelectorAll('.mole')].map(el => ({el, up:false, letter:'', t:0}));
  const timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
  function down(m){ m.up = false; m.el.classList.remove('up'); m.el.tabIndex = -1; later(() => { if(!m.up) m.el.classList.remove('bonk', 'no'); }, 200); }
  function popUp(){
    if(S.locked || pos >= ls.length) return;
    const free = moles.filter(m => !m.up);
    if(!free.length) return;
    const m = free[rand(free.length)];
    const need = ls[pos];
    const showing = moles.some(o => o.up && o.letter === need);
    m.letter = (!showing && Math.random() < .65) || Math.random() < .2 ? need : decoys[rand(decoys.length)];
    m.el.textContent = m.letter;
    m.el.setAttribute('aria-label', 'Mole ' + m.letter);
    m.el.classList.remove('bonk', 'no');
    m.up = true; m.el.classList.add('up'); m.el.tabIndex = 0;
    clearTimeout(m.t);
    m.t = later(() => { if(m.up) down(m); }, 1500);
  }
  stage.querySelector('#holes').addEventListener('click', e => {
    const el = e.target.closest('.mole'); if(!el || S.locked) return;
    const m = moles[+el.dataset.h]; if(!m.up) return;
    if(m.letter === ls[pos]){
      m.el.classList.add('bonk'); sfx('pop');
      reveal(target[pos], ls[pos]); pos++;
      clearTimeout(m.t); m.up = false; later(() => down(m), 220);
      if(pos === ls.length){ target.forEach(t => t.classList.add('good')); resolve('done'); }
    } else {
      m.el.classList.add('no'); wrong(null);
      clearTimeout(m.t); m.up = false; later(() => down(m), 300);
    }
  });
  popUp(); later(popUp, 300);
  const iv = setInterval(popUp, 650);
  S.stop = () => { clearInterval(iv); timers.forEach(clearTimeout); timers.clear(); };
  bindSkip(); bindHear(w);
};

IMPL.snowman = (w, e, def) => {
  const chars = [...w], ls = letters(w);
  const keys = decoyLetters(ls);
  const guessed = new Set();
  const PARTS = ['p-hat','p-scarf','p-arms','p-buttons','p-nose','p-eyes'];
  let misses = 0;
  stage.innerHTML = promptHtml(def, e, 'Guess the letters to save the snowman', 'Guess the word that means…') + `
    <svg class="snowman" id="snow" viewBox="0 0 120 140" aria-hidden="true">
      <ellipse cx="60" cy="132" rx="46" ry="6" fill="var(--line)"/>
      <circle cx="60" cy="100" r="30" fill="#fff" stroke="var(--muted)" stroke-width="2"/>
      <circle cx="60" cy="56" r="21" fill="#fff" stroke="var(--muted)" stroke-width="2"/>
      <g id="p-arms" stroke="#7A5233" stroke-width="4" stroke-linecap="round"><path d="M32 92L8 74M14 78L6 82"/><path d="M88 92l24-18M106 78l8 4"/></g>
      <g id="p-buttons" fill="#1C2A36"><circle cx="60" cy="90" r="3"/><circle cx="60" cy="102" r="3"/><circle cx="60" cy="114" r="3"/></g>
      <g id="p-scarf" fill="var(--coral)"><rect x="38" y="72" width="44" height="8" rx="4"/><rect x="66" y="74" width="9" height="22" rx="3"/></g>
      <g id="p-eyes" fill="#1C2A36"><circle cx="53" cy="51" r="2.6"/><circle cx="67" cy="51" r="2.6"/></g>
      <path id="p-nose" d="M60 57l16 4-16 4z" fill="var(--sun)"/>
      <g id="p-hat" fill="#1C2A36" stroke="var(--muted)" stroke-width="1"><rect x="44" y="18" width="32" height="20" rx="2"/><rect x="36" y="36" width="48" height="5" rx="2"/><rect x="44" y="31" width="32" height="4" fill="var(--berry)" stroke="none"/></g>
    </svg>
    <p class="lives" id="lives">6 tries left</p>
    <div class="tiles" id="sw">${chars.map(c => c === ' ' ? '<span class="gap"></span>' : isL(c) ? `<span class="tile slot sm" data-c="${esc(lower(c))}"></span>` : `<span class="tile sm">${esc(c)}</span>`).join('')}</div>
    <div class="keys" id="keys">${keys.map(k => `<button class="key" type="button" data-k="${esc(k)}">${esc(k)}</button>`).join('')}</div>
    <div class="actions">${hearIf(def)}${skipBtn('Give up')}</div>`;
  const snow = stage.querySelector('#snow'), slots = [...stage.querySelectorAll('#sw [data-c]')];
  function guess(c){
    if(S.locked || guessed.has(c)) return;
    guessed.add(c);
    const key = stage.querySelector(`.key[data-k="${CSS.escape(c)}"]`);
    if(key) key.disabled = true;
    if(ls.includes(c)){
      if(key) key.classList.add('hit');
      sfx('tap');
      slots.forEach((s, i) => { if(s.dataset.c === c){ s.textContent = chars.filter(isL)[i]; s.classList.remove('slot'); } });
      if(ls.every(l => guessed.has(l))){
        slots.forEach(s => s.classList.add('good'));
        S.mistakes = misses <= 1 ? 0 : 1;
        resolve('done', {msg: misses === 0 ? 'Not a drop melted!' : 'Snowman saved!'});
      }
    } else {
      if(key) key.classList.add('miss');
      misses++;
      wrong(snow);
      const part = stage.querySelector('#' + PARTS[misses - 1]);
      if(part) part.style.opacity = 0;
      snow.style.transform = `scaleY(${1 - misses * .05})`;
      $('#lives').textContent = misses >= PARTS.length ? 'Oh no, it melted!' : `${PARTS.length - misses} ${PARTS.length - misses === 1 ? 'try' : 'tries'} left`;
      if(misses >= PARTS.length){
        slots.forEach((s, i) => { if(s.classList.contains('slot')){ s.textContent = chars.filter(isL)[i]; s.classList.remove('slot'); s.classList.add('lost'); } });
        resolve('skip', {msg:'It melted! The word is'});
      }
    }
  }
  stage.querySelector('#keys').onclick = e => { const b = e.target.closest('.key'); if(b) guess(b.dataset.k); };
  S.key = e => { const k = lower(e.key); if(k.length === 1 && isL(k)) guess(k); };
  bindSkip(); bindHear(w);
};

IMPL.spot = w => {
  const bad = Math.random() < .5 ? misspell(w) : null;
  const shown = bad || w;
  stage.innerHTML = `<p class="prompt">Is this word spelled correctly?</p>
    <div class="tiles">${tilesHtml(shown)}</div>
    <div class="actions"><button class="btn green big" type="button" id="yes">Spelled right</button><button class="btn big" type="button" id="no">Spelled wrong</button></div>
    <p class="sub" id="fix" hidden></p>
    <div class="actions">${hearBtn()}</div>`;
  function answer(saysRight){
    if(S.locked) return;
    const correct = saysRight === !bad;
    stage.querySelectorAll('#yes,#no').forEach(b => b.disabled = true);
    if(bad){ const f = stage.querySelector('#fix'); f.hidden = false; f.innerHTML = `Correct spelling: <b>${esc(w)}</b>`; }
    if(correct) resolve('done', {msg: bad ? 'Good eye!' : 'Correct!', extra: bad ? 500 : 0});
    else { wrong(null); resolve('skip', {msg: bad ? 'That one had a mistake. The word is' : 'That one was right! The word is'}); }
  }
  stage.querySelector('#yes').onclick = () => answer(true);
  stage.querySelector('#no').onclick = () => answer(false);
  S.key = e => { if(e.key === 'ArrowLeft' || lower(e.key) === 'r') answer(true); if(e.key === 'ArrowRight' || lower(e.key) === 'w') answer(false); };
  bindHear(w);
};

IMPL.rocket = (w, e, def) => {
  const ls = letters(w), goal = ls.join('');
  const ms = def ? 6000 + 600 * ls.length : 2500 + 450 * ls.length;
  stage.innerHTML = `<p class="prompt" id="rp">${def ? 'Type the word that means…' : 'Type it before the fuel runs out!'}</p>
    ${def ? `<div class="defbox">${esc(e.d)}</div>` : ''}
    <div class="tiles" id="rt">${ls.map(c => def ? '<span class="tile sm slot"></span>' : `<span class="tile sm">${esc(c)}</span>`).join('')}</div>
    <div class="launch"><div class="rocket" id="rk">${ROCKET_SVG}</div></div>
    <div class="timer"><i id="bar"></i></div>
    <div class="typebox"><input class="answer" id="answer" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Type the word" placeholder="Start typing"></div>
    <div class="actions">${skipBtn()}</div>`;
  const inp = stage.querySelector('#answer'), rk = stage.querySelector('#rk'), tiles = [...stage.querySelectorAll('#rt .tile')], bar = stage.querySelector('#bar');
  bar.style.transition = `width ${ms}ms linear`;
  requestAnimationFrame(() => requestAnimationFrame(() => bar.style.width = '0%'));
  let ok = true, slow = false;
  const tok = S, wi = S.i;
  const t = setTimeout(() => {
    if(S !== tok || S.i !== wi || S.locked) return;
    slow = true; S.mistakes++; S.streak = 0; renderHud();
    stage.querySelector('#rp').textContent = 'Out of fuel! Finish the word anyway.';
  }, ms);
  S.stop = () => clearTimeout(t);
  inp.addEventListener('input', () => {
    if(S.locked) return;
    const v = norm(inp.value);
    const nowOk = goal.startsWith(v);
    tiles.forEach((el, k) => {
      const show = nowOk && k < v.length;
      el.classList.toggle('good', show);
      if(def){ el.textContent = show ? ls[k] : ''; el.classList.toggle('slot', !show); }
    });
    inp.classList.toggle('off', !nowOk);
    if(!nowOk && ok) wrong(inp);
    ok = nowOk;
    if(nowOk) rk.style.transform = `translateY(${-(v.length / goal.length) * 120}px)`;
    if(v === goal){
      clearTimeout(t); inp.disabled = true;
      rk.classList.add('go'); sfx('whoosh');
      resolve('done', {msg: slow ? 'Lift off!' : 'Blast off!'});
    }
  });
  bindSkip();
  setTimeout(() => inp.focus(), 60);
};

IMPL.catcher = (w, e, def) => {
  const ls = letters(w);
  let pos = 0;
  const decoys = decoyLetters(ls);
  const colors = ['--coral','--sky','--leaf','--grape','--berry'];
  stage.innerHTML = promptHtml(def, e, 'Catch the letters in spelling order', 'Catch the letters of the word that means…') + `
    ${targetHtml(ls, def)}
    <div class="field" id="field" aria-label="Move the basket with your mouse, finger or arrow keys"><div class="basket" id="basket">${BASKET_SVG}</div></div>
    <p class="sub" style="margin:0">Move the basket with your mouse, finger or the arrow keys.</p>
    <div class="actions">${hearIf(def)}${skipBtn()}</div>`;
  const field = stage.querySelector('#field'), basket = stage.querySelector('#basket'), target = [...stage.querySelectorAll('#target .tile')];
  const BW = 96, DS = 50;
  let bx = field.clientWidth / 2, drops = [], spawnT = .6;
  const setBasket = x => { bx = clamp(x, BW / 2, field.clientWidth - BW / 2); basket.style.left = (bx - BW / 2) + 'px'; };
  setBasket(bx);
  const move = ev => { const r = field.getBoundingClientRect(); setBasket(ev.clientX - r.left); };
  field.addEventListener('pointermove', move);
  field.addEventListener('pointerdown', ev => { move(ev); });
  S.key = ev => {
    if(ev.key === 'ArrowLeft'){ ev.preventDefault(); setBasket(bx - 40); }
    if(ev.key === 'ArrowRight'){ ev.preventDefault(); setBasket(bx + 40); }
  };
  function spawn(){
    const W = field.clientWidth, need = ls[pos];
    const showing = drops.some(d => d.letter === need && !d.done);
    const letter = !showing || Math.random() < .3 ? need : decoys[rand(decoys.length)];
    const el = document.createElement('div');
    el.className = 'drop'; el.textContent = letter;
    el.style.setProperty('--dc', `var(${colors[rand(colors.length)]})`);
    field.appendChild(el);
    drops.push({el, letter, x: rand(Math.max(1, W - DS)), y: -DS, v: 135 + Math.random() * 50, done:false});
  }
  let last = performance.now(), raf = 0;
  function loop(t){
    const dt = Math.min(.05, (t - last) / 1000); last = t;
    if(!S.locked){
      spawnT -= dt;
      if(spawnT <= 0 && drops.length < 6){ spawn(); spawnT = .8; }
    }
    const H = field.clientHeight, catchTop = H - 8 - 46;
    drops.forEach(d => {
      d.y += d.v * dt;
      d.el.style.transform = `translate(${d.x}px, ${d.y}px)`;
      if(!d.done && !S.locked && d.y + DS >= catchTop + 10 && d.y + DS <= H){
        if(Math.abs(d.x + DS / 2 - bx) < BW / 2 + 6){
          d.done = true; d.el.remove();
          if(d.letter === ls[pos]){
            sfx('pop'); reveal(target[pos], ls[pos]); pos++;
            if(pos === ls.length){ target.forEach(x => x.classList.add('good')); resolve('done'); }
          } else wrong(basket);
        }
      }
    });
    drops = drops.filter(d => { if(d.y > H + 10){ d.el.remove(); return false; } return !d.done; });
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);
  S.stop = () => cancelAnimationFrame(raf);
  bindSkip(); bindHear(w);
};

IMPL.racer = (w, e, def) => {
  const ls = letters(w);
  let pos = 0, lane = 1, row = null;
  const decoys = decoyLetters(ls);
  stage.innerHTML = promptHtml(def, e, 'Drive through the letters in spelling order', 'Drive through the letters of the word that means…') + `
    ${targetHtml(ls, def)}
    <div class="road" id="road"><i class="ll" style="left:33.33%"></i><i class="ll" style="left:66.66%"></i><div class="car" id="car">${CAR_SVG}</div></div>
    <div class="actions"><button class="btn blue" type="button" id="left">Left</button><button class="btn blue" type="button" id="right">Right</button></div>
    <p class="sub" style="margin:0">Tap a lane, use the buttons, or press the arrow keys.</p>
    <div class="actions">${hearIf(def)}${skipBtn()}</div>`;
  const road = stage.querySelector('#road'), car = stage.querySelector('#car'), target = [...stage.querySelectorAll('#target .tile')];
  const laneW = () => road.clientWidth / 3;
  const cw = () => Math.min(64, laneW() * .55);
  function setLane(l){ lane = clamp(l, 0, 2); car.style.width = cw() + 'px'; car.style.left = (lane * laneW() + (laneW() - cw()) / 2) + 'px'; }
  setLane(1);
  stage.querySelector('#left').onclick = () => setLane(lane - 1);
  stage.querySelector('#right').onclick = () => setLane(lane + 1);
  road.addEventListener('pointerdown', ev => { const r = road.getBoundingClientRect(); setLane(Math.floor((ev.clientX - r.left) / laneW())); });
  S.key = ev => {
    if(ev.key === 'ArrowLeft'){ ev.preventDefault(); setLane(lane - 1); }
    if(ev.key === 'ArrowRight'){ ev.preventDefault(); setLane(lane + 1); }
  };
  function spawn(){
    const need = ls[pos];
    const others = shuffle(decoys.filter(c => c !== need)).slice(0, 2);
    const letters3 = shuffle([need, ...others]);
    const el = document.createElement('div');
    el.className = 'gaterow';
    el.innerHTML = letters3.map(c => `<div class="gate"><span>${esc(c)}</span></div>`).join('');
    road.appendChild(el);
    row = {el, letters:letters3, y:-60, hit:false};
  }
  spawn();
  let last = performance.now(), raf = 0;
  function loop(t){
    const dt = Math.min(.05, (t - last) / 1000); last = t;
    const H = road.clientHeight;
    if(row){
      row.y += (170 + pos * 8) * dt;
      row.el.style.transform = `translateY(${row.y}px)`;
      const carTop = H - 14 - car.offsetHeight;
      if(!row.hit && !S.locked && row.y + 52 >= carTop + 8){
        row.hit = true;
        const gate = row.el.children[lane];
        if(row.letters[lane] === ls[pos]){
          gate.classList.add('good'); sfx('pop'); reveal(target[pos], ls[pos]); pos++;
          if(pos === ls.length){ target.forEach(x => x.classList.add('good')); resolve('done'); }
        } else { gate.classList.add('bad'); wrong(car); }
      }
      if(row.y > H + 10){ row.el.remove(); row = null; if(!S.locked && pos < ls.length) spawn(); }
    }
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);
  S.stop = () => cancelAnimationFrame(raf);
  bindSkip(); bindHear(w);
};

IMPL.frog = (w, e, def) => {
  const ls = letters(w);
  let pos = 0, busy = false;
  const decoys = decoyLetters(ls);
  stage.innerHTML = promptHtml(def, e, 'Hop on the next letter of the word', 'Hop across the letters of the word that means…') + `
    ${targetHtml(ls, def)}
    <div class="pond" id="pond"><div class="pads" id="pads"></div><div class="homepad"></div><div class="frog" id="frog">${FROG_SVG}</div></div>
    <div class="actions">${hearIf(def)}${skipBtn()}</div>`;
  const pond = stage.querySelector('#pond'), pads = stage.querySelector('#pads'), frog = stage.querySelector('#frog'), target = [...stage.querySelectorAll('#target .tile')];
  let opts = [];
  function step(){
    const need = ls[pos], n = pond.clientWidth < 420 ? 3 : 4;
    opts = shuffle([need, ...shuffle(decoys.filter(c => c !== need)).slice(0, n - 1)]);
    pads.innerHTML = opts.map((c, k) => `<button class="pad" type="button" data-k="${k}" aria-label="Lily pad ${esc(c)}">${esc(c)}</button>`).join('');
  }
  function choose(k){
    const pad = pads.children[k]; if(!pad || busy || S.locked) return;
    if(opts[k] === ls[pos]){
      busy = true;
      const pr = pad.getBoundingClientRect(), fr = frog.getBoundingClientRect();
      frog.style.transform = `translate(${pr.left + pr.width / 2 - (fr.left + fr.width / 2)}px, ${pr.top + pr.height / 2 - (fr.top + fr.height / 2) - 10}px)`;
      sfx('pop'); reveal(target[pos], ls[pos]); pos++;
      const tok = S;
      setTimeout(() => {
        if(S !== tok) return;
        frog.classList.add('nojump'); frog.style.transform = ''; void frog.offsetWidth; frog.classList.remove('nojump');
        busy = false;
        if(pos === ls.length){ target.forEach(x => x.classList.add('good')); resolve('done'); }
        else step();
      }, 420);
    } else {
      pad.classList.add('no'); pad.disabled = true; wrong(frog);
    }
  }
  pads.onclick = ev => { const b = ev.target.closest('.pad'); if(b) choose(+b.dataset.k); };
  S.key = ev => { const k = opts.indexOf(lower(ev.key)); if(k >= 0) choose(k); };
  step();
  bindSkip(); bindHear(w);
};

IMPL.fish = (w, e, def) => {
  const ls = letters(w);
  let pos = 0;
  const decoys = decoyLetters(ls);
  stage.innerHTML = promptHtml(def, e, 'Catch the fish in spelling order', 'Catch the letters of the word that means…') + `
    ${targetHtml(ls, def)}
    <div class="pond fishpond" id="sky"></div>
    <div class="actions">${hearIf(def)}${skipBtn()}</div>`;
  const sky = stage.querySelector('#sky'), target = [...stage.querySelectorAll('#target .tile')];
  S.stop = balloonField(sky, {
    side: true, rows: 4, n: 8, speed: 1.1,
    need: () => pos < ls.length ? ls[pos] : null,
    decoy: () => decoys[rand(decoys.length)],
    hit: label => {
      if(label !== ls[pos]) return false;
      reveal(target[pos], ls[pos]); pos++;
      if(pos === ls.length){ target.forEach(t => t.classList.add('good')); resolve('done'); }
      return true;
    }
  });
  bindSkip(); bindHear(w);
};

/* ---------- definition games ---------- */
IMPL.cards = (w, e) => {
  stage.innerHTML = `<button class="flip" id="card" type="button" aria-label="Flip the card">
      <div class="inner">
        <div class="face front"><small>Word</small><b>${esc(w)}</b><span class="tapnote">Tap to see the meaning</span></div>
        <div class="face back"><small>Meaning</small><p>${esc(e.d)}</p></div>
      </div></button>
    <p class="sub" id="ask" style="margin:0">Say the meaning out loud, then flip the card to check.</p>
    <div class="actions" id="grade" hidden><button class="btn green" type="button" id="knew">I knew it</button><button class="btn ghost" type="button" id="learn">Still learning</button></div>
    <div class="actions">${hearBtn()}</div>`;
  const card = stage.querySelector('#card');
  function flip(){
    card.classList.toggle('on'); sfx('flip');
    stage.querySelector('#grade').hidden = false;
    stage.querySelector('#ask').textContent = 'Did you know it?';
  }
  card.onclick = flip;
  stage.querySelector('#knew').onclick = () => resolve('done', {msg:'You knew it!'});
  stage.querySelector('#learn').onclick = () => { S.mistakes = 1; resolve('done', {msg:'Keep practising!'}); };
  S.key = ev => { if(ev.key === ' ' || ev.key === 'Enter'){ ev.preventDefault(); flip(); } };
  bindHear(w);
};

function choiceGame(e, head, options, isWord){
  stage.innerHTML = head + `<div class="opts" id="opts">${options.map((o, k) =>
    `<button class="opt${isWord ? ' word' : ''}" type="button" data-k="${k}">${esc(isWord ? o.w : o.d)}</button>`).join('')}</div>
    <div class="actions">${hearBtn()}${skipBtn()}</div>`;
  const btns = [...stage.querySelectorAll('.opt')];
  function choose(k){
    const b = btns[k]; if(!b || b.disabled || S.locked) return;
    if(options[k] === e){
      b.classList.add('good'); btns.forEach(x => x.disabled = true); resolve('done');
    } else {
      b.classList.add('bad'); b.disabled = true; wrong(b);
    }
  }
  stage.querySelector('#opts').onclick = ev => { const b = ev.target.closest('.opt'); if(b) choose(+b.dataset.k); };
  S.key = ev => { const n = parseInt(ev.key, 10); if(n >= 1 && n <= btns.length) choose(n - 1); };
  bindSkip(); bindHear(e.w);
}
IMPL.pickword = (w, e) => {
  choiceGame(e, `<p class="prompt">Which word means this?</p><div class="defbox">${esc(e.d)}</div>`,
    shuffle([e, ...otherEntries(e, 3)]), true);
};
IMPL.pickdef = (w, e) => {
  choiceGame(e, `<p class="prompt">What does this word mean?</p><div class="tiles">${tilesHtml(w)}</div>`,
    shuffle([e, ...otherEntries(e, 3)]), false);
};

IMPL.clue = (w, e) => {
  const ls = letters(w);
  let shown = 0;
  stage.innerHTML = `<p class="prompt">Spell the word that means…</p>
    <div class="defbox">${esc(e.d)}</div>
    <div class="tiles" id="cl">${[...w].map(c => c === ' ' ? '<span class="gap"></span>' : '<span class="tile sm slot"></span>').join('')}</div>
    <p class="sub" style="margin:0">${ls.length} letters</p>
    <div class="actions"><button class="btn ghost small" type="button" id="hintbtn">Show a letter</button>${skipBtn()}</div>`;
  const slots = [...stage.querySelectorAll('#cl .tile')], realChars = [...w].filter(c => c !== ' ');
  stage.querySelector('#hintbtn').onclick = () => {
    if(shown >= slots.length - 1 || S.locked) return;
    S.mistakes++;
    slots[shown].textContent = realChars[shown]; slots[shown].classList.remove('slot'); shown++;
  };
  bindSkip();
  typeBox(w, stage);
};

IMPL.defballoon = (w, e) => {
  stage.innerHTML = `<p class="prompt">Pop the word that means…</p>
    <div class="defbox">${esc(e.d)}</div>
    <div class="skybox" id="sky"></div>
    <div class="actions">${skipBtn()}</div>`;
  const sky = stage.querySelector('#sky');
  const others = S.pool.filter(x => lower(x.w) !== lower(w)).map(x => x.w);
  S.stop = balloonField(sky, {
    n: sky.clientWidth < 480 ? 3 : 4, wide: true, speed: .8,
    need: () => S.locked ? null : w,
    decoy: () => others.length ? others[rand(others.length)] : w,
    hit: label => { if(label !== w) return false; resolve('done'); return true; }
  });
  bindSkip();
};

/* ---------- whole-round games ---------- */
const WHOLE = {};

WHOLE.search = () => {
  let items = S.list.map(e => ({w:e.w, e, ls:letters(e.w)})).filter(o => o.ls.length);
  const longest = Math.max(...items.map(o => o.ls.length));
  const total = items.reduce((a, o) => a + o.ls.length, 0);
  let size = clamp(Math.max(longest, Math.ceil(Math.sqrt(total * 2.2))), 8, 15);
  const tooLong = items.filter(o => o.ls.length > 15);
  items = items.filter(o => o.ls.length <= 15);
  const dirs = [[0,1],[1,0],[1,1],[-1,1]];
  let grid, placed;
  for(let attempt = 0; attempt < 60; attempt++){
    if(attempt && attempt % 12 === 0 && size < 15) size++;
    grid = Array(size * size).fill(null); placed = [];
    let ok = true;
    for(const o of [...items].sort((a, b) => b.ls.length - a.ls.length)){
      let done = false;
      for(let t = 0; t < 400 && !done; t++){
        const [dr, dc] = dirs[rand(dirs.length)], L = o.ls.length;
        const r0 = rand(size), c0 = rand(size), r1 = r0 + dr * (L - 1), c1 = c0 + dc * (L - 1);
        if(r1 < 0 || r1 >= size || c1 >= size) continue;
        const cells = o.ls.map((_, k) => (r0 + dr * k) * size + c0 + dc * k);
        if(cells.every((ci, k) => grid[ci] === null || grid[ci] === o.ls[k])){
          cells.forEach((ci, k) => grid[ci] = o.ls[k]); placed.push({...o, cells, found:false}); done = true;
        }
      }
      if(!done){ ok = false; break; }
    }
    if(ok) break;
  }
  const latin = items.every(o => o.ls.every(c => /[a-z]/.test(c)));
  const fill = latin ? [...'abcdefghijklmnopqrstuvwxyz'] : [...new Set(items.flatMap(o => o.ls))];
  grid = grid.map(c => c || fill[rand(fill.length)]);
  S.list = placed.map(p => p.e);
  S.results = [];
  renderHud();
  stage.innerHTML = `<p class="prompt">Find all ${placed.length} word${placed.length === 1 ? '' : 's'}</p>
    <p class="sub">Drag across a word, or tap its first and last letter.${tooLong.length ? ' Too long for the grid: ' + tooLong.map(o => esc(o.w)).join(', ') + '.' : ''}</p>
    <div class="search">
      <div class="grid" id="grid" style="--n:${size}">${grid.map((c, i) => `<div class="cell" data-i="${i}">${esc(c)}</div>`).join('')}</div>
      <ul class="wlist">${placed.map((p, k) => `<li data-k="${k}">${esc(p.w)}</li>`).join('')}</ul>
    </div>
    <div class="actions"><button class="btn ghost small" type="button" id="giveup">Show answers</button></div>`;
  const gEl = stage.querySelector('#grid'), cells = [...gEl.children];
  let anchor = null, dragging = false, colorN = 0;
  const cellAt = e => { const el = document.elementFromPoint(e.clientX, e.clientY); const c = el && el.closest('.cell'); return c && gEl.contains(c) ? +c.dataset.i : null; };
  function line(a, b){
    const r1 = Math.floor(a / size), c1 = a % size, r2 = Math.floor(b / size), c2 = b % size;
    if(!(r1 === r2 || c1 === c2 || Math.abs(r2 - r1) === Math.abs(c2 - c1))) return null;
    const dr = Math.sign(r2 - r1), dc = Math.sign(c2 - c1), L = Math.max(Math.abs(r2 - r1), Math.abs(c2 - c1));
    return Array.from({length:L + 1}, (_, k) => (r1 + dr * k) * size + c1 + dc * k);
  }
  function preview(a, b){ cells.forEach(c => c.classList.remove('pv')); (line(a, b) || [a]).forEach(i => cells[i].classList.add('pv')); }
  function clearPv(){ cells.forEach(c => c.classList.remove('pv')); }
  function tryLine(a, b){
    const ln = line(a, b); clearPv(); if(!ln) return;
    const key = ln.join(','), rkey = [...ln].reverse().join(',');
    const k = placed.findIndex(p => !p.found && (p.cells.join(',') === key || p.cells.join(',') === rkey));
    if(k < 0){ sfx('buzz'); shake(gEl); return; }
    const p = placed[k]; p.found = true;
    p.cells.forEach(i => cells[i].classList.add('f' + (colorN % 6))); colorN++;
    stage.querySelector(`li[data-k="${k}"]`).classList.add('done');
    S.results[k] = {word:p.w, e:p.e, res:'perfect'}; S.score += 10; S.streak++; renderHud();
    sfx('ding'); confetti(30);
    if(placed.every(p => p.found)){ S.score += 20; renderHud(); const tok = S; setTimeout(() => S === tok && finish(), 900); }
  }
  gEl.addEventListener('pointerdown', e => {
    const c = cellAt(e); if(c == null) return;
    e.preventDefault();
    if(anchor != null && anchor !== c){ tryLine(anchor, c); anchor = null; return; }
    if(anchor === c){ anchor = null; clearPv(); return; }
    anchor = c; dragging = true; preview(c, c);
  });
  gEl.addEventListener('pointermove', e => { if(!dragging) return; const c = cellAt(e); if(c != null) preview(anchor, c); });
  addEventListener('pointerup', function up(e){
    if(!gEl.isConnected){ removeEventListener('pointerup', up); return; }
    if(!dragging) return; dragging = false;
    const c = cellAt(e);
    if(c != null && c !== anchor){ tryLine(anchor, c); anchor = null; }
  });
  stage.querySelector('#giveup').onclick = () => {
    placed.forEach((p, k) => { if(!p.found){ p.cells.forEach(i => cells[i].classList.add('reveal')); S.results[k] = {word:p.w, e:p.e, res:'missed'}; } });
    S.streak = 0; renderHud(); sfx('miss');
    const tok = S; setTimeout(() => S === tok && finish(), 2200);
  };
};

WHOLE.memory = () => {
  const trimmed = S.list.length > 8;
  S.list = S.list.slice(0, 8);
  S.results = [];
  renderHud();
  const cards = shuffle(S.list.flatMap((e, k) => [{k, t:'w'}, {k, t:'d'}]));
  const slipped = new Set();
  let open = [], busy = false;
  stage.innerHTML = `<p class="prompt">Match each word with its meaning</p>
    <p class="sub">Flip two cards at a time.${trimmed ? ' This board uses 8 of your words.' : ''}</p>
    <div class="mem" id="mem">${cards.map((c, i) => `<button class="mcard" type="button" data-i="${i}" aria-label="Card ${i + 1}">
      <div class="inner"><div class="face cover">?</div><div class="face show${c.t === 'w' ? ' w' : ''}">${esc(c.t === 'w' ? S.list[c.k].w : S.list[c.k].d)}</div></div></button>`).join('')}</div>
    <div class="actions"><button class="btn ghost small" type="button" id="giveup">Show answers</button></div>`;
  const els = [...stage.querySelectorAll('.mcard')];
  stage.querySelector('#mem').onclick = ev => {
    const el = ev.target.closest('.mcard'); if(!el || busy) return;
    const i = +el.dataset.i;
    if(el.classList.contains('done') || open.includes(i)) return;
    el.classList.add('on'); sfx('flip');
    el.setAttribute('aria-label', (cards[i].t === 'w' ? 'Word: ' : 'Meaning: ') + el.querySelector('.show').textContent);
    open.push(i);
    if(open.length < 2) return;
    const [a, b] = open.map(n => cards[n]);
    if(a.k === b.k && a.t !== b.t){
      open.forEach(n => els[n].classList.add('done'));
      const res = slipped.has(a.k) ? 'tricky' : 'perfect';
      S.results[a.k] = {word:S.list[a.k].w, e:S.list[a.k], res};
      if(res === 'perfect'){ S.streak++; S.score += 10 + Math.min(S.streak - 1, 5) * 2; } else S.score += 5;
      renderHud(); sfx('ding'); confetti(30);
      open = [];
      if(S.results.filter(Boolean).length === S.list.length){ const tok = S; setTimeout(() => S === tok && finish(), 1000); }
    } else {
      slipped.add(a.k); slipped.add(b.k);
      S.streak = 0; renderHud(); sfx('buzz');
      busy = true;
      const pair = open; open = [];
      setTimeout(() => { pair.forEach(n => els[n].classList.remove('on')); busy = false; }, 1100);
    }
  };
  stage.querySelector('#giveup').onclick = () => {
    els.forEach((el, n) => { if(!el.classList.contains('done')){ el.classList.add('on', 'reveal'); } });
    S.list.forEach((e, k) => { if(!S.results[k]) S.results[k] = {word:e.w, e, res:'missed'}; });
    renderHud(); sfx('miss');
    const tok = S; setTimeout(() => S === tok && finish(), 2600);
  };
};

WHOLE.matchup = () => {
  S.results = [];
  renderHud();
  const sets = [];
  for(let i = 0; i < S.list.length; i += 5) sets.push(S.list.slice(i, i + 5).map((e, j) => i + j));
  const slipped = new Set();
  let setNo = 0, colorN = 0;
  function render(){
    const ks = sets[setNo];
    stage.innerHTML = `<p class="prompt">Connect each word to its meaning</p>
      <p class="sub">Tap a word, then tap its meaning.${sets.length > 1 ? ` Set ${setNo + 1} of ${sets.length}.` : ''}</p>
      <div class="match">
        <div class="col">${shuffle(ks).map(k => `<button class="mi w" type="button" data-t="w" data-k="${k}">${esc(S.list[k].w)}</button>`).join('')}</div>
        <div class="col">${shuffle(ks).map(k => `<button class="mi" type="button" data-t="d" data-k="${k}">${esc(S.list[k].d)}</button>`).join('')}</div>
      </div>
      <div class="actions"><button class="btn ghost small" type="button" id="giveup">Show answers</button></div>`;
    let sel = null;
    stage.querySelector('.match').onclick = ev => {
      const b = ev.target.closest('.mi'); if(!b || b.disabled) return;
      if(!sel || sel.dataset.t === b.dataset.t){
        if(sel) sel.classList.remove('sel');
        sel = sel === b ? null : b;
        if(sel){ sel.classList.add('sel'); sfx('tap'); }
        return;
      }
      const a = sel; sel = null; a.classList.remove('sel');
      if(a.dataset.k === b.dataset.k){
        const k = +a.dataset.k, cls = 'm' + (colorN++ % 5);
        [a, b].forEach(x => { x.classList.add(cls, 'matched'); x.disabled = true; });
        const res = slipped.has(k) ? 'tricky' : 'perfect';
        S.results[k] = {word:S.list[k].w, e:S.list[k], res};
        if(res === 'perfect'){ S.streak++; S.score += 10 + Math.min(S.streak - 1, 5) * 2; } else S.score += 5;
        renderHud(); sfx('ding'); confetti(25);
        if(ks.every(k => S.results[k])){
          const tok = S;
          setTimeout(() => { if(S !== tok) return; setNo++; if(setNo < sets.length) render(); else finish(); }, 900);
        }
      } else {
        slipped.add(+a.dataset.k); slipped.add(+b.dataset.k);
        S.streak = 0; renderHud(); sfx('buzz'); shake(a); shake(b);
      }
    };
    stage.querySelector('#giveup').onclick = () => {
      S.list.forEach((e, k) => { if(!S.results[k]) S.results[k] = {word:e.w, e, res:'missed'}; });
      renderHud(); sfx('miss');
      stage.innerHTML = `<p class="prompt">Here are the answers</p><div class="opts">${ks.map(k => `<div class="opt"><b>${esc(S.list[k].w)}</b>: ${esc(S.list[k].d)}</div>`).join('')}</div>`;
      const tok = S; setTimeout(() => S === tok && finish(), 3500);
    };
  }
  render();
};

loadMode();
})();
