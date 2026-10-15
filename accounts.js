/* Spellbound Arcade accounts: username + password sign-up and log-in through Firebase,
   plus per-game leaderboards stored in Cloud Firestore. Turned on by firebase-config.js. */
(() => {
'use strict';
const cfg = window.SPELLBOUND_FIREBASE;
const FIREBASE_VERSION = '10.12.2';
const EMAIL_DOMAIN = 'players.spellbound.example.com';
const USERNAME_RE = /^[A-Za-z0-9_]{3,16}$/;

let backend = null, user = null, status = 'off', statusMsg = '';
const listeners = [];
const emit = () => listeners.forEach(fn => { try{ fn(user, status); }catch(e){} });
const toEmail = name => name.trim().toLowerCase() + '@' + EMAIL_DOMAIN;

function friendly(err){
  const code = (err && err.code) || '';
  if(code === 'auth/email-already-in-use') return 'That username is taken. Try another one.';
  if(code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found' || code === 'auth/invalid-login-credentials') return 'Wrong username or password.';
  if(code === 'auth/weak-password') return 'Your password needs at least 6 characters.';
  if(code === 'auth/too-many-requests') return 'Too many tries. Wait a minute, then try again.';
  if(code === 'auth/network-request-failed' || code === 'unavailable') return 'Can’t reach the account server. Accounts only work on the hosted copy of the game, not on the claude.ai link.';
  if(code === 'permission-denied') return 'The leaderboard refused that save. Check the Firestore rules from the setup steps.';
  if(/api-key-not-valid|invalid-api-key/.test(code)) return 'The Firebase settings look wrong. Check that firebase-config.js has your config pasted in exactly.';
  if(code === 'auth/operation-not-allowed' || code === 'auth/configuration-not-found') return 'Username sign-in is switched off. In Firebase, turn on Authentication → Sign-in method → Email/Password.';
  if(code === 'auth/unauthorized-domain') return 'This website isn’t allowed to log in yet. Add it under Authentication → Settings → Authorized domains in Firebase.';
  return (err && err.message) || 'Something went wrong. Please try again.';
}

function loadScript(src){
  return new Promise((ok, fail) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => fail(new Error('Could not load ' + src)); document.head.appendChild(s); });
}

/* ---------- Firebase backend ---------- */
async function firebaseBackend(){
  const base = `https://cdn.jsdelivr.net/npm/firebase@${FIREBASE_VERSION}/`;
  await loadScript(base + 'firebase-app-compat.js');
  await loadScript(base + 'firebase-auth-compat.js');
  await loadScript(base + 'firebase-firestore-compat.js');
  const fb = window.firebase;
  const app = fb.apps.length ? fb.app() : fb.initializeApp(cfg);
  const auth = fb.auth(app), db = fb.firestore(app);
  const stamp = () => fb.firestore.FieldValue.serverTimestamp();
  async function profile(u){
    try{ const d = await db.collection('players').doc(u.uid).get(); if(d.exists) return {uid:u.uid, username:d.data().username, total:d.data().total || 0}; }catch(e){}
    return {uid:u.uid, username:(u.email || '').split('@')[0], total:0};
  }
  auth.onAuthStateChanged(async u => { user = u ? await profile(u) : null; emit(); });
  return {
    async signUp(name, pw){
      const cred = await auth.createUserWithEmailAndPassword(toEmail(name), pw);
      await db.collection('players').doc(cred.user.uid).set({username:name.trim(), created:stamp(), total:0});
      user = {uid:cred.user.uid, username:name.trim(), total:0}; emit();
    },
    async logIn(name, pw){ const cred = await auth.signInWithEmailAndPassword(toEmail(name), pw); user = await profile(cred.user); emit(); },
    async logOut(){ await auth.signOut(); user = null; emit(); },
    async saveScore(board, score){
      const ref = db.collection('boards').doc(board).collection('scores').doc(user.uid);
      const snap = await ref.get();
      const prev = snap.exists ? snap.data().score : -1;
      if(score > prev) await ref.set({username:user.username, score, at:stamp()});
      return Math.max(score, prev);
    },
    async top(board, n){
      const q = await db.collection('boards').doc(board).collection('scores').orderBy('score', 'desc').limit(n).get();
      return q.docs.map(d => ({uid:d.id, username:d.data().username, score:d.data().score}));
    },
    async addPoints(n){
      await db.collection('players').doc(user.uid).update({total:fb.firestore.FieldValue.increment(n)});
      user.total = (user.total || 0) + n; emit();
      return user.total;
    },
    async allTime(n){
      const q = await db.collection('players').orderBy('total', 'desc').limit(n).get();
      return q.docs.map(d => ({uid:d.id, username:d.data().username, total:d.data().total || 0}));
    }
  };
}

/* ---------- local test backend (only on localhost, only when switched on) ---------- */
function mockBackend(){
  const load = () => { try{ return JSON.parse(localStorage.getItem('sa.mockdb') || '{"users":{},"boards":{}}'); }catch(e){ return {users:{}, boards:{}}; } };
  const save = d => { try{ localStorage.setItem('sa.mockdb', JSON.stringify(d)); }catch(e){} };
  const fail = code => { const e = new Error(code); e.code = code; throw e; };
  try{ const s = JSON.parse(localStorage.getItem('sa.mocksession') || 'null'); if(s) user = s; }catch(e){}
  setTimeout(emit, 0);
  const setSession = u => { user = u; try{ localStorage.setItem('sa.mocksession', JSON.stringify(u)); }catch(e){} emit(); };
  return {
    async signUp(name, pw){ const d = load(), k = name.toLowerCase(); if(d.users[k]) fail('auth/email-already-in-use'); if(pw.length < 6) fail('auth/weak-password'); d.users[k] = {uid:'u_' + k, username:name, pw, total:0}; save(d); setSession({uid:'u_' + k, username:name, total:0}); },
    async logIn(name, pw){ const d = load(), u = d.users[name.toLowerCase()]; if(!u || u.pw !== pw) fail('auth/invalid-credential'); setSession({uid:u.uid, username:u.username, total:u.total || 0}); },
    async logOut(){ try{ localStorage.removeItem('sa.mocksession'); }catch(e){} user = null; emit(); },
    async saveScore(board, score){ const d = load(); d.boards[board] = d.boards[board] || {}; const prev = d.boards[board][user.uid] ? d.boards[board][user.uid].score : -1; if(score > prev) d.boards[board][user.uid] = {username:user.username, score}; save(d); return Math.max(score, prev); },
    async top(board, n){ const d = load(); return Object.entries(d.boards[board] || {}).map(([uid, v]) => ({uid, ...v})).sort((a, b) => b.score - a.score).slice(0, n); },
    async addPoints(n){ const d = load(), u = Object.values(d.users).find(x => x.uid === user.uid); u.total = (u.total || 0) + n; save(d); setSession({...user, total:u.total}); return u.total; },
    async allTime(n){ const d = load(); return Object.values(d.users).map(u => ({uid:u.uid, username:u.username, total:u.total || 0})).sort((a, b) => b.total - a.total).slice(0, n); }
  };
}

const testing = location.hostname === 'localhost' && (() => { try{ return localStorage.getItem('sa.mockAccounts') === '1'; }catch(e){ return false; } })();
if(testing){ backend = mockBackend(); status = 'ready'; }
else if(cfg && cfg.apiKey){
  status = 'loading';
  /* Check the database is reachable: claude.ai and some school networks block Firebase. */
  firebaseBackend().then(async b => {
    backend = b;
    try{
      await Promise.race([b.top('probe~0', 1), new Promise((_, no) => setTimeout(() => no({code:'unavailable'}), 8000))]);
      status = 'ready';
    }catch(err){
      if(err && err.code === 'permission-denied'){ status = 'ready'; }
      else { status = 'error'; statusMsg = friendly(err); }
    }
    emit();
  })
    .catch(err => { status = 'error'; statusMsg = friendly(err); emit(); });
}

window.SpellAccounts = {
  get enabled(){ return status !== 'off'; },
  get status(){ return status; },
  get statusMsg(){ return statusMsg; },
  get user(){ return user; },
  onChange(fn){ listeners.push(fn); fn(user, status); },
  validUsername: n => USERNAME_RE.test((n || '').trim()),
  friendly,
  async signUp(name, pw){ if(!backend) throw new Error(statusMsg || 'Accounts are still loading.'); return backend.signUp(name, pw); },
  async logIn(name, pw){ if(!backend) throw new Error(statusMsg || 'Accounts are still loading.'); return backend.logIn(name, pw); },
  async logOut(){ if(backend) return backend.logOut(); },
  async saveScore(board, score){ if(!backend || !user) return null; return backend.saveScore(board, score); },
  async top(board, n){ if(!backend) return []; return backend.top(board, n || 10); },
  async addPoints(n){ if(!backend || !user || !(n > 0)) return user ? user.total : 0; return backend.addPoints(Math.round(n)); },
  async allTime(n){ if(!backend) return []; return backend.allTime(n || 20); }
};
})();
