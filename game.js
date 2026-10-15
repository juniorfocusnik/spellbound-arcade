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
  {id:'scramble', lv:true, group:'puzzle', side:'spell', name:'Tile Scramble', blurb:'Put the jumbled tiles back in order.', c:'var(--coral)',
   art:'<div class="mini"><span>T</span><span>C</span><span>A</span></div>'},
  {id:'missing', lv:true, group:'puzzle', side:'spell', name:'Missing Letters', blurb:'Fill in the gaps to finish each word.', c:'var(--leaf)',
   art:'<div class="mini"><span>C</span><span class="dash">A</span><span>T</span></div>'},
  {id:'listen', lv:true, group:'puzzle', side:'spell', name:'Listen & Spell', blurb:'Hear the word, then type it.', c:'var(--sky)',
   art:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z" fill="#fff"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>'},
  {id:'flash', lv:true, group:'puzzle', side:'spell', name:'Flash Memory', blurb:'See it for a moment, then spell it from memory.', c:'var(--grape)',
   art:'<svg viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="#FFD45E" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>'},
  {id:'balloon', lv:true, group:'action', side:'spell', name:'Balloon Pop', blurb:'Pop the floating letters in the right order.', c:'var(--berry)',
   art:'<div class="minib"><i>B</i><i>O</i><i>P</i></div>'},
  {id:'search', lv:true, group:'puzzle', side:'spell', name:'Word Search', blurb:'Find every word hidden in the grid.', c:'var(--sun)',
   art:'<div class="minigrid"><span>Q</span><span class="hl">C</span><span>M</span><span>R</span><span>E</span><span>Z</span><span class="hl">A</span><span>L</span><span>W</span><span>K</span><span>D</span><span class="hl">T</span></div>'},
  {id:'whack', lv:true, group:'action', side:'spell', name:'Whack-a-Letter', blurb:'Bop the moles that pop up, in spelling order.', c:'var(--leaf)',
   art:'<svg viewBox="0 0 64 64"><ellipse cx="32" cy="54" rx="27" ry="8" fill="#7A5638"/><path d="M14 54V34a18 18 0 0 1 36 0v20z" fill="#9C6B47"/><circle cx="25" cy="31" r="3" fill="#1b1b1b"/><circle cx="39" cy="31" r="3" fill="#1b1b1b"/><ellipse cx="32" cy="39" rx="5" ry="4" fill="#F29BA6"/></svg>'},
  {id:'snowman', lv:true, group:'puzzle', side:'spell', name:'Save the Snowman', blurb:'Guess the letters before the snowman melts.', c:'var(--sky)',
   art:'<svg viewBox="0 0 64 64"><circle cx="32" cy="46" r="14" fill="#fff"/><circle cx="32" cy="25" r="10" fill="#fff"/><rect x="24" y="7" width="16" height="10" rx="1" fill="#1C2A36"/><rect x="19" y="16" width="26" height="3" rx="1" fill="#1C2A36"/><path d="M32 26l9 2-9 2z" fill="#FF6A48"/><circle cx="28" cy="23" r="1.6" fill="#1C2A36"/><circle cx="36" cy="23" r="1.6" fill="#1C2A36"/></svg>'},
  {id:'spot', group:'puzzle', side:'spell', name:'Spot the Mistake', blurb:'Is it spelled right or wrong? Decide fast!', c:'var(--berry)',
   art:'<svg viewBox="0 0 64 64"><circle cx="18" cy="32" r="13" fill="#fff"/><path d="M12 32l4.5 4.5L24 28" stroke="#1F9E5A" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="46" cy="32" r="13" fill="#fff"/><path d="M41 27l10 10M51 27l-10 10" stroke="#D9384F" stroke-width="4" stroke-linecap="round"/></svg>'},
  {id:'rocket', lv:true, group:'action', side:'spell', name:'Rocket Typer', blurb:'Type the word fast to launch the rocket.', c:'var(--grape)',
   art:'<svg viewBox="0 0 64 96" style="height:80px">' + ROCKET_SVG.slice(ROCKET_SVG.indexOf('>') + 1)},
  {id:'cards', group:'learn', side:'def', name:'Flashcards', blurb:'Flip each card and check whether you knew the meaning.', c:'var(--sky)',
   art:'<div class="minicards"><span>word</span><span>meaning</span></div>'},
  {id:'pickword', lv:true, group:'learn', side:'def', name:'Name That Word', blurb:'Read the meaning, then pick the right word.', c:'var(--coral)',
   art:'<div class="minipills"><i>tiny</i><i class="on">huge</i><i>old</i></div>'},
  {id:'pickdef', lv:true, group:'learn', side:'def', name:'What Does It Mean?', blurb:'Read the word, then pick the right meaning.', c:'var(--leaf)',
   art:'<div class="minipills"><i>to run</i><i class="on">very big</i><i>sad</i></div>'},
  {id:'clue', lv:true, group:'spell', side:'def', name:'Clue Speller', blurb:'Read the meaning, then spell the word.', c:'var(--grape)',
   art:'<div class="mini"><span>H</span><span class="dash">A</span><span class="dash">A</span></div>'},
  {id:'memory', lv:true, group:'learn', side:'def', name:'Memory Pairs', blurb:'Flip cards to pair each word with its meaning.', c:'var(--sun)',
   art:'<div class="minimem"><i></i><i>A</i><i></i><i></i><i></i><i>A</i></div>'},
  {id:'defballoon', lv:true, group:'learn', side:'def', name:'Meaning Balloons', blurb:'Pop the balloon carrying the word that matches.', c:'var(--berry)',
   art:'<div class="minib"><i class="w">huge</i><i class="w">old</i></div>'},
  {id:'matchup', lv:true, group:'learn', side:'def', name:'Match Up', blurb:'Connect each word to its meaning.', c:'var(--sky)',
   art:'<svg viewBox="0 0 64 64"><rect x="4" y="8" width="18" height="10" rx="3" fill="#FFD45E"/><rect x="4" y="27" width="18" height="10" rx="3" fill="#FFD45E"/><rect x="4" y="46" width="18" height="10" rx="3" fill="#FFD45E"/><rect x="40" y="8" width="20" height="10" rx="3" fill="#fff"/><rect x="40" y="27" width="20" height="10" rx="3" fill="#fff"/><rect x="40" y="46" width="20" height="10" rx="3" fill="#fff"/><path d="M22 13L40 51M22 32L40 13M22 51L40 32" stroke="#fff" stroke-width="2.5"/></svg>'},
  {id:'catcher', lv:true, group:'action', side:'spell', name:'Letter Catcher', blurb:'Slide the basket to catch falling letters in order.', c:'var(--sky)',
   art:'<svg viewBox="0 0 64 64"><circle cx="36" cy="15" r="11" fill="#fff"/><text x="36" y="21" text-anchor="middle" font-family="Lilita One, sans-serif" font-size="16" fill="#2F9BD0">A</text><circle cx="16" cy="30" r="7" fill="#FFD45E"/><path d="M8 40h48l-7 18H15z" fill="#B57A45" stroke="#7A5233" stroke-width="2.5" stroke-linejoin="round"/></svg>'},
  {id:'racer', lv:true, group:'action', side:'spell', name:'Lane Racer', blurb:'Steer your car through the right letter gates.', c:'var(--coral)',
   art:CAR_SVG.replace('<svg ', '<svg style="height:84px;width:auto" ')},
  {id:'frog', lv:true, group:'puzzle', side:'spell', name:'Frog Hop', blurb:'Help the frog hop across the right letters.', c:'var(--leaf)',
   art:FROG_SVG.replace('<svg ', '<svg style="width:84px;height:auto" ')},
  {id:'fish', lv:true, group:'action', side:'spell', name:'Fishing', blurb:'Catch the swimming fish in spelling order.', c:'var(--sky)',
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
  {id:'safe', lv:true, group:'puzzle', side:'spell', name:'Safe Cracker', blurb:'Remember the code, then turn the letter dials to open the safe.', c:'var(--grape)',
   art:'<svg viewBox="0 0 64 64"><rect x="8" y="8" width="48" height="48" rx="7" fill="#9FB3BB" stroke="#fff" stroke-width="3"/><circle cx="32" cy="32" r="13" fill="#fff"/><circle cx="32" cy="32" r="4" fill="#1C2A36"/><path d="M32 19v5M45 32h-5M32 45v-5M19 32h5" stroke="#1C2A36" stroke-width="2.5"/></svg>'},
  {id:'pickspell', lv:true, group:'puzzle', side:'spell', name:'Pick the Spelling', blurb:'Four spellings, one is right. Tap it!', c:'var(--sun)',
   art:'<div class="minipills"><i>frend</i><i class="on">friend</i><i>freind</i></div>'},
  {id:'oddone', lv:true, group:'puzzle', side:'spell', name:'Odd One Out', blurb:'One word is spelled wrong. Find it!', c:'var(--berry)',
   art:'<div class="minipills"><i>cat</i><i class="on">dgo</i><i>fish</i></div>'},
  {id:'path', lv:true, group:'puzzle', side:'spell', name:'Word Path', blurb:'Trace the word through a grid of touching letters.', c:'var(--leaf)',
   art:'<div class="minigrid"><span class="hl">C</span><span>M</span><span>R</span><span>E</span><span>Z</span><span class="hl">A</span><span>L</span><span>W</span><span>K</span><span>D</span><span class="hl">T</span><span>Q</span></div>'},
  {id:'robot', lv:true, group:'action', side:'spell', name:'Beat the Robot', blurb:'Race a robot to type the word first.', c:'var(--sky)',
   art:'<svg viewBox="0 0 64 64"><path d="M32 18v-8" stroke="#fff" stroke-width="3"/><circle cx="32" cy="9" r="4" fill="#FFD45E"/><rect x="12" y="18" width="40" height="32" rx="9" fill="#fff"/><circle cx="25" cy="32" r="5" fill="#2F9BD0"/><circle cx="39" cy="32" r="5" fill="#2F9BD0"/><rect x="24" y="42" width="16" height="3" rx="1.5" fill="#1C2A36"/></svg>'},
  {id:'truefalse', group:'learn', side:'def', name:'True or False', blurb:'Does this word match this meaning? Decide fast!', c:'var(--berry)',
   art:'<svg viewBox="0 0 64 64"><circle cx="18" cy="32" r="13" fill="#fff"/><path d="M12 32l4.5 4.5L24 28" stroke="#1F9E5A" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="46" cy="32" r="13" fill="#fff"/><path d="M41 27l10 10M51 27l-10 10" stroke="#D9384F" stroke-width="4" stroke-linecap="round"/></svg>'},
  {id:'builder', group:'learn', side:'def', name:'Meaning Builder', blurb:'Tap the words of the meaning back into order.', c:'var(--grape)',
   art:'<div class="minipills"><i>very</i><i class="on">big</i><i>and</i></div>'},
  {id:'d-safe', base:'safe', group:'spell', side:'def', name:'Clue Safe Cracker', blurb:'Read the meaning, then turn the dials to spell the word.', c:'var(--grape)'},
  {id:'d-pickspell', base:'pickspell', group:'spell', side:'def', name:'Clue Pick the Spelling', blurb:'Read the meaning, then pick the correct spelling.', c:'var(--sun)'},
  {id:'d-path', base:'path', group:'spell', side:'def', name:'Clue Word Path', blurb:'Read the meaning, then trace the word through the grid.', c:'var(--leaf)'},
  {id:'d-robot', base:'robot', group:'spell', side:'def', name:'Clue Robot Race', blurb:'Read the meaning, then type the word before the robot.', c:'var(--sky)'},
  {id:'vowels', lv:true, group:'puzzle', side:'spell', name:'Vowel Hunt', blurb:'The vowels ran away. Tap them back into the word.', c:'var(--sun)',
   art:'<div class="mini"><span>B</span><span class="dash">A</span><span>T</span><span class="dash">E</span></div>'},
  {id:'swapfix', lv:true, group:'puzzle', side:'spell', name:'Swap Fix', blurb:'Letters swapped places. Tap two tiles to swap them back.', c:'var(--coral)',
   art:'<div class="mini"><span>F</span><span style="background:#fff">S</span><span style="background:#fff">I</span><span>H</span></div>'},
  {id:'chunks', lv:true, group:'puzzle', side:'spell', name:'Chunk Builder', blurb:'Snap the word pieces together in the right order.', c:'var(--leaf)',
   art:'<div class="minipills" style="flex-direction:row"><i>beau</i><i class="on">ti</i><i>ful</i></div>'},
  {id:'fixit', lv:true, group:'puzzle', side:'spell', name:'Fix It', blurb:'The word is spelled wrong. Edit it to fix it.', c:'var(--sky)',
   art:'<svg viewBox="0 0 64 64"><rect x="6" y="20" width="40" height="24" rx="5" fill="#fff"/><text x="26" y="37" text-anchor="middle" font-family="Lilita One, sans-serif" font-size="13" fill="#D9384F">frend</text><path d="M44 46l14-14 5 5-14 14-7 2z" fill="#FFD45E" stroke="#3B2A00" stroke-width="1.5"/></svg>'},
  {id:'abc', lv:true, group:'puzzle', side:'spell', name:'ABC Order', blurb:'Tap the words in alphabetical order.', c:'var(--grape)',
   art:'<div class="minipills"><i>apple</i><i class="on">bear</i><i>cat</i></div>'},
  {id:'quiz', lv:true, group:'action', side:'spell', name:'Quiz Show', blurb:'Pick the right spelling. Use your 50:50 and Ask the Class lifelines once per round.', c:'var(--berry)',
   art:'<svg viewBox="0 0 64 64"><path d="M20 10h24v12a12 12 0 0 1-24 0z" fill="#FFD45E"/><path d="M20 14h-8a8 8 0 0 0 8 10M44 14h8a8 8 0 0 1-8 10" stroke="#FFD45E" stroke-width="4" fill="none"/><rect x="28" y="34" width="8" height="10" fill="#FFD45E"/><rect x="20" y="44" width="24" height="8" rx="2" fill="#fff"/></svg>'},
  {id:'d-vowels', base:'vowels', group:'spell', side:'def', name:'Clue Vowel Hunt', blurb:'Read the meaning, then put the vowels back.', c:'var(--sun)'},
  {id:'d-chunks', base:'chunks', group:'spell', side:'def', name:'Clue Chunk Builder', blurb:'Read the meaning, then snap the word pieces together.', c:'var(--leaf)'},
  {id:'d-quiz', base:'quiz', group:'learn', side:'def', name:'Meaning Quiz Show', blurb:'Pick the word for each meaning. Use your lifelines wisely.', c:'var(--berry)'},
  {id:'crossword', lv:true, group:'spell', side:'def', name:'Mini Crossword', blurb:'Solve a crossword where the clues are your meanings.', c:'var(--sky)',
   art:'<svg viewBox="0 0 64 64"><g fill="#fff"><rect x="8" y="8" width="12" height="12"/><rect x="21" y="8" width="12" height="12"/><rect x="34" y="8" width="12" height="12"/><rect x="21" y="21" width="12" height="12"/><rect x="21" y="34" width="12" height="12"/><rect x="34" y="34" width="12" height="12"/><rect x="47" y="34" width="12" height="12"/></g><text x="27" y="18" text-anchor="middle" font-family="Lilita One, sans-serif" font-size="10" fill="#1C2A36">A</text></svg>'},
  {id:'lightning', lv:true, group:'learn', side:'def', name:'Lightning Round', blurb:'Word and meaning: match or not? Answer as many as you can before time runs out.', c:'var(--grape)',
   art:'<svg viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="#FFD45E" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>'},
  {id:'snake', lv:true, group:'arcade', side:'spell', name:'Spelling Snake', blurb:'Steer the snake to gobble the letters in order. Wrong letters shrink you!', c:'var(--leaf)',
   art:'<svg viewBox="0 0 64 64"><path d="M10 44h22a8 8 0 0 0 0-16H24a8 8 0 0 1 0-16h22" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="48" cy="12" r="7" fill="#fff"/><circle cx="50" cy="10" r="2" fill="#1b1b1b"/><circle cx="50" cy="48" r="8" fill="#FFD45E"/><text x="50" y="52" text-anchor="middle" font-family="Lilita One, sans-serif" font-size="11" fill="#3B2A00">A</text></svg>'},
  {id:'blaster', lv:true, group:'arcade', side:'spell', name:'Letter Blaster', blurb:'Pilot your ship and blast the asteroids in spelling order.', c:'var(--grape)',
   art:'<svg viewBox="0 0 64 64"><circle cx="20" cy="16" r="9" fill="#9FB3BB"/><text x="20" y="20" text-anchor="middle" font-family="Lilita One, sans-serif" font-size="11" fill="#fff">B</text><circle cx="46" cy="22" r="7" fill="#9FB3BB"/><path d="M32 30v-8" stroke="#FFD45E" stroke-width="3"/><path d="M32 34l10 22H22z" fill="#fff"/><path d="M28 56h8l-4 6z" fill="#FF6A48"/></svg>'},
  {id:'invaders', lv:true, group:'arcade', side:'spell', name:'Word Invaders', blurb:'Words are falling! Type each one before it lands.', c:'var(--berry)',
   art:'<svg viewBox="0 0 64 64"><path d="M18 22h28v6h6v12h-6v6h-6v-6H24v6h-6v-6h-6V28h6z" fill="#fff"/><rect x="24" y="30" width="5" height="5" fill="#E2456A"/><rect x="35" y="30" width="5" height="5" fill="#E2456A"/><path d="M20 22l-4-8M44 22l4-8" stroke="#fff" stroke-width="3"/></svg>'},
  {id:'hopper', lv:true, group:'arcade', side:'spell', name:'Sky Hopper', blurb:'Tap to fly. Swoop through the gap with the next letter.', c:'var(--sky)',
   art:'<svg viewBox="0 0 64 64"><rect x="40" y="0" width="14" height="22" fill="#3FAE5A"/><rect x="40" y="38" width="14" height="26" fill="#3FAE5A"/><text x="47" y="34" text-anchor="middle" font-family="Lilita One, sans-serif" font-size="12" fill="#fff">C</text><circle cx="20" cy="32" r="10" fill="#FFD45E"/><circle cx="24" cy="29" r="2.5" fill="#1b1b1b"/><path d="M29 32l7 2-7 3z" fill="#FF6A48"/></svg>'},
  {id:'slice', lv:true, group:'arcade', side:'spell', name:'Letter Slice', blurb:'Letters fly up. Swipe to slice them in spelling order!', c:'var(--coral)',
   art:'<svg viewBox="0 0 64 64"><circle cx="24" cy="36" r="13" fill="#FFD45E"/><text x="24" y="41" text-anchor="middle" font-family="Lilita One, sans-serif" font-size="14" fill="#3B2A00">S</text><circle cx="46" cy="22" r="9" fill="#fff"/><path d="M6 54L58 8" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>'},
  {id:'d-snake', base:'snake', group:'arcade', side:'def', name:'Clue Snake', blurb:'Read the meaning, then steer the snake to eat the word’s letters.', c:'var(--leaf)'},
  {id:'d-blaster', base:'blaster', group:'arcade', side:'def', name:'Clue Blaster', blurb:'Read the meaning, then blast the word’s letters in order.', c:'var(--grape)'},
  {id:'d-invaders', base:'invaders', group:'arcade', side:'def', name:'Meaning Invaders', blurb:'Meanings are falling! Type the matching word before each one lands.', c:'var(--berry)'},
  {id:'d-hopper', base:'hopper', group:'arcade', side:'def', name:'Clue Sky Hopper', blurb:'Read the meaning, then fly through the word’s letters.', c:'var(--sky)'},
  {id:'d-slice', base:'slice', group:'arcade', side:'def', name:'Clue Slice', blurb:'Read the meaning, then slice the word’s letters in order.', c:'var(--coral)'},
  {id:'stack', lv:true, group:'arcade', side:'spell', name:'Chick Stack', blurb:'Tap the next letter to stack a tile under the chick and hop over the walls!', c:'var(--sun)',
   art:'<svg viewBox="0 0 64 64"><rect x="22" y="42" width="14" height="14" rx="2" fill="#fff"/><rect x="22" y="28" width="14" height="14" rx="2" fill="#fff"/><text x="29" y="53" text-anchor="middle" font-family="Lilita One, sans-serif" font-size="10" fill="#3B2A00">C</text><text x="29" y="39" text-anchor="middle" font-family="Lilita One, sans-serif" font-size="10" fill="#3B2A00">A</text><circle cx="29" cy="20" r="8" fill="#FFEFA8"/><circle cx="31" cy="18" r="1.6" fill="#1b1b1b"/><path d="M36 20l5 1.5-5 1.5z" fill="#FF6A48"/><rect x="46" y="36" width="12" height="20" fill="#B5654A"/><rect x="0" y="56" width="64" height="8" fill="#3FAE5A"/></svg>'},
  {id:'beats', lv:true, group:'arcade', side:'spell', name:'Letter Beats', blurb:'Letters slide down the lanes. Tap the lane when the right one hits the line!', c:'var(--grape)',
   art:'<svg viewBox="0 0 64 64"><path d="M21 6v52M43 6v52" stroke="#fff" stroke-opacity=".4" stroke-width="2"/><rect x="2" y="46" width="60" height="4" fill="#FFD45E"/><circle cx="11" cy="20" r="7" fill="#fff"/><circle cx="32" cy="38" r="7" fill="#FFD45E"/><circle cx="53" cy="12" r="7" fill="#fff"/></svg>'},
  {id:'darts', lv:true, group:'arcade', side:'spell', name:'Spin Darts', blurb:'Throw a dart when the next letter spins to the top.', c:'var(--berry)',
   art:'<svg viewBox="0 0 64 64"><circle cx="32" cy="34" r="24" fill="#fff"/><path d="M32 34L32 10A24 24 0 0 1 56 34z" fill="#FFD45E"/><path d="M32 34L8 34A24 24 0 0 1 32 10z" fill="#2F9BD0"/><circle cx="32" cy="34" r="4" fill="#1C2A36"/><path d="M28 2l4 7 4-7z" fill="#FF6A48"/></svg>'},
  {id:'road', lv:true, group:'arcade', side:'spell', name:'Road Hopper', blurb:'Dodge the traffic and hop onto the next letter across the road.', c:'var(--leaf)',
   art:'<svg viewBox="0 0 64 64"><rect x="0" y="16" width="64" height="32" fill="#46525D"/><path d="M0 32h64" stroke="#fff" stroke-dasharray="6 6" stroke-width="2"/><rect x="6" y="20" width="18" height="9" rx="3" fill="#FF6A48"/><rect x="38" y="35" width="18" height="9" rx="3" fill="#2F9BD0"/><circle cx="32" cy="56" r="6" fill="#FFD45E"/><circle cx="32" cy="8" r="6" fill="#fff"/></svg>'},
  {id:'runner', lv:true, group:'arcade', side:'spell', name:'Letter Runner', blurb:'Run, jump and grab the right letters. Leap over the wrong ones!', c:'var(--coral)',
   art:'<svg viewBox="0 0 64 64"><rect x="0" y="52" width="64" height="12" fill="#3FAE5A"/><circle cx="18" cy="30" r="9" fill="#fff"/><path d="M14 38l-4 12M22 38l4 12" stroke="#fff" stroke-width="4" stroke-linecap="round"/><circle cx="46" cy="20" r="7" fill="#FFD45E"/><circle cx="50" cy="45" r="7" fill="#9FB3BB"/></svg>'},
  {id:'jetpack', lv:true, group:'arcade', side:'spell', name:'Jetpack Letters', blurb:'Hold to fly up, let go to drop. Grab the letters in order!', c:'var(--sky)',
   art:'<svg viewBox="0 0 64 64"><circle cx="22" cy="26" r="9" fill="#fff"/><rect x="10" y="26" width="8" height="16" rx="3" fill="#9FB3BB"/><path d="M12 44l2 10 2-10z" fill="#FF6A48"/><circle cx="48" cy="20" r="7" fill="#FFD45E"/><circle cx="52" cy="44" r="7" fill="#fff"/></svg>'},
  {id:'claw', lv:true, group:'arcade', side:'spell', name:'Claw Grab', blurb:'Drop the claw at the right moment to grab the next letter.', c:'var(--grape)',
   art:'<svg viewBox="0 0 64 64"><path d="M6 6h52" stroke="#fff" stroke-width="3"/><path d="M32 6v22" stroke="#fff" stroke-width="2"/><path d="M24 34l8-6 8 6M24 34l2 6M40 34l-2 6" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="16" cy="54" r="7" fill="#FFD45E"/><circle cx="33" cy="54" r="7" fill="#fff"/><circle cx="50" cy="54" r="7" fill="#FF6A48"/></svg>'},
  {id:'penalty', lv:true, group:'arcade', side:'spell', name:'Penalty Kick', blurb:'Shoot at the right letter and dodge the goalkeeper!', c:'var(--leaf)',
   art:'<svg viewBox="0 0 64 64"><path d="M6 40V10h52v30" stroke="#fff" stroke-width="3" fill="none"/><rect x="26" y="20" width="10" height="20" rx="3" fill="#FF6A48"/><circle cx="31" cy="16" r="4" fill="#FF6A48"/><circle cx="14" cy="22" r="5" fill="#FFD45E"/><circle cx="48" cy="22" r="5" fill="#FFD45E"/><circle cx="32" cy="54" r="6" fill="#fff"/></svg>'},
  {id:'hoops', lv:true, group:'arcade', side:'spell', name:'Hoop Shot', blurb:'Line up under the right hoop and shoot before it slides away.', c:'var(--coral)',
   art:'<svg viewBox="0 0 64 64"><rect x="8" y="8" width="20" height="14" rx="2" fill="#fff"/><ellipse cx="18" cy="24" rx="9" ry="3" fill="none" stroke="#FFD45E" stroke-width="3"/><rect x="36" y="14" width="20" height="14" rx="2" fill="#fff"/><ellipse cx="46" cy="30" rx="9" ry="3" fill="none" stroke="#FFD45E" stroke-width="3"/><circle cx="30" cy="52" r="8" fill="#F4A51C"/></svg>'},
  {id:'launcher', lv:true, group:'arcade', side:'spell', name:'Letter Launcher', blurb:'Pull back the slingshot and fling it at the next letter crate.', c:'var(--sun)',
   art:'<svg viewBox="0 0 64 64"><path d="M12 58V40M12 40l-6-10M12 40l6-10" stroke="#7A5233" stroke-width="4" stroke-linecap="round"/><circle cx="12" cy="28" r="5" fill="#FF6A48"/><path d="M18 26q14-20 30-6" stroke="#fff" stroke-dasharray="3 4" stroke-width="2" fill="none"/><rect x="42" y="30" width="16" height="16" rx="2" fill="#fff"/><text x="50" y="42" text-anchor="middle" font-family="Lilita One, sans-serif" font-size="11" fill="#3B2A00">L</text></svg>'},
  {id:'typerace', lv:true, group:'arcade', side:'spell', name:'Type Racer', blurb:'Race three cars to the finish. Every word you type zooms you forward!', c:'var(--sky)',
   art:'<svg viewBox="0 0 64 64"><path d="M0 20h64M0 36h64M0 52h64" stroke="#fff" stroke-opacity=".4" stroke-width="2"/><rect x="34" y="23" width="18" height="10" rx="4" fill="#FF6A48"/><rect x="18" y="39" width="18" height="10" rx="4" fill="#FFD45E"/><rect x="8" y="7" width="18" height="10" rx="4" fill="#fff"/><path d="M58 4v56" stroke="#fff" stroke-width="3" stroke-dasharray="4 4"/></svg>'},
  {id:'d-stack', base:'stack', group:'arcade', side:'def', name:'Clue Chick Stack', blurb:'Read the meaning, then stack its letters to hop the walls.', c:'var(--sun)'},
  {id:'d-beats', base:'beats', group:'arcade', side:'def', name:'Clue Beats', blurb:'Read the meaning, then hit its letters on the beat.', c:'var(--grape)'},
  {id:'d-darts', base:'darts', group:'arcade', side:'def', name:'Clue Darts', blurb:'Read the meaning, then dart its letters as they spin to the top.', c:'var(--berry)'},
  {id:'d-road', base:'road', group:'arcade', side:'def', name:'Clue Road Hopper', blurb:'Read the meaning, then cross the road to its letters.', c:'var(--leaf)'},
  {id:'d-runner', base:'runner', group:'arcade', side:'def', name:'Clue Runner', blurb:'Read the meaning, then run and jump for its letters.', c:'var(--coral)'},
  {id:'d-jetpack', base:'jetpack', group:'arcade', side:'def', name:'Clue Jetpack', blurb:'Read the meaning, then fly to its letters.', c:'var(--sky)'},
  {id:'d-claw', base:'claw', group:'arcade', side:'def', name:'Clue Claw Grab', blurb:'Read the meaning, then grab its letters with the claw.', c:'var(--grape)'},
  {id:'d-penalty', base:'penalty', group:'arcade', side:'def', name:'Clue Penalty Kick', blurb:'Read the meaning, then score its letters past the goalie.', c:'var(--leaf)'},
  {id:'d-hoops', base:'hoops', group:'arcade', side:'def', name:'Clue Hoop Shot', blurb:'Read the meaning, then shoot its letters through the hoops.', c:'var(--coral)'},
  {id:'d-launcher', base:'launcher', group:'arcade', side:'def', name:'Clue Launcher', blurb:'Read the meaning, then fling at its letter crates.', c:'var(--sun)'},
  {id:'d-typerace', base:'typerace', group:'arcade', side:'def', name:'Meaning Racer', blurb:'Read each meaning and type the word to race ahead.', c:'var(--sky)'},
  {id:'jumper', lv:true, group:'arcade', side:'spell', name:'Sky Jumper', blurb:'Bounce up and up, landing on the platforms with the right letters.', c:'var(--sky)',
   art:'<svg viewBox="0 0 64 64"><rect x="6" y="50" width="22" height="5" rx="2.5" fill="#5FD07F"/><rect x="36" y="32" width="22" height="5" rx="2.5" fill="#5FD07F"/><rect x="10" y="14" width="22" height="5" rx="2.5" fill="#5FD07F"/><circle cx="47" cy="24" r="6" fill="#FFD45E"/><circle cx="22" cy="40" r="7" fill="#FFE27A"/></svg>'},
  {id:'ski', lv:true, group:'arcade', side:'spell', name:'Ski Slalom', blurb:'Steer down the mountain through the gate with the next letter.', c:'var(--sky)',
   art:'<svg viewBox="0 0 64 64"><path d="M32 6c-6 14 10 22 0 36" stroke="#fff" stroke-width="3" fill="none" stroke-dasharray="4 4"/><rect x="10" y="40" width="3" height="16" fill="#E2456A"/><rect x="28" y="40" width="3" height="16" fill="#E2456A"/><rect x="40" y="18" width="3" height="16" fill="#fff"/><rect x="56" y="18" width="3" height="16" fill="#fff"/><circle cx="32" cy="44" r="5" fill="#FFD45E"/></svg>'},
  {id:'batter', lv:true, group:'arcade', side:'spell', name:'Home Run', blurb:'Swing at the pitch with the next letter. Let the wrong ones fly past!', c:'var(--leaf)',
   art:'<svg viewBox="0 0 64 64"><rect x="8" y="30" width="40" height="7" rx="3.5" fill="#8B5A2B" transform="rotate(-30 8 34)"/><circle cx="48" cy="22" r="9" fill="#fff"/><path d="M42 16q6 6 0 12M54 16q-6 6 0 12" stroke="#D9384F" stroke-width="1.5" fill="none"/></svg>'},
  {id:'maze', lv:true, group:'arcade', side:'spell', name:'Maze Muncher', blurb:'Munch the letters in order round the maze and dodge the ghosts.', c:'var(--grape)',
   art:'<svg viewBox="0 0 64 64"><path d="M6 6h52v52H6zM20 6v20M20 40h24M44 20v20" stroke="#8FA7FF" stroke-width="3" fill="none"/><path d="M30 30l9-6a11 11 0 1 0 0 12z" fill="#FFE14D"/><path d="M48 44a6 6 0 0 1 12 0v8l-3-2-3 2-3-2-3 2z" fill="#FF5C8A"/></svg>'},
  {id:'bubbles', lv:true, group:'arcade', side:'spell', name:'Bubble Shooter', blurb:'Aim the cannon and pop the bubble with the next letter. Bounce off the walls!', c:'var(--berry)',
   art:'<svg viewBox="0 0 64 64"><circle cx="14" cy="12" r="8" fill="#FF6A48"/><circle cx="31" cy="12" r="8" fill="#2F9BD0"/><circle cx="48" cy="12" r="8" fill="#FFD45E"/><circle cx="22" cy="26" r="8" fill="#3FAE5A"/><circle cx="40" cy="26" r="8" fill="#fff"/><rect x="28" y="40" width="8" height="14" fill="#9FB3BB"/><circle cx="32" cy="56" r="8" fill="#C5D2DA"/></svg>'},
  {id:'golf', lv:true, group:'arcade', side:'spell', name:'Letter Golf', blurb:'Putt the ball into the hole with the next letter.', c:'var(--leaf)',
   art:'<svg viewBox="0 0 64 64"><ellipse cx="40" cy="22" rx="10" ry="5" fill="#123018"/><path d="M40 22V4" stroke="#fff" stroke-width="2"/><path d="M40 4l12 4-12 4z" fill="#FF6A48"/><circle cx="20" cy="50" r="6" fill="#fff"/><path d="M24 46l12-18" stroke="#fff" stroke-dasharray="3 4" stroke-width="2"/></svg>'},
  {id:'bomb', lv:true, group:'arcade', side:'spell', name:'Bomb Squad', blurb:'Cut the wires in spelling order before the timer hits zero!', c:'var(--coral)',
   art:'<svg viewBox="0 0 64 64"><rect x="8" y="8" width="48" height="14" rx="3" fill="#2B2F36"/><text x="32" y="19" text-anchor="middle" font-family="Lilita One, sans-serif" font-size="11" fill="#FF3B3B">00:09</text><path d="M16 26v30M28 26v30M40 26v12M40 44v12M52 26v30" stroke-width="4" stroke="#FFD45E"/><path d="M28 26v30" stroke="#2F9BD0" stroke-width="4"/><path d="M40 26v12M40 44v12" stroke="#fff" stroke-width="4"/></svg>'},
  {id:'swipe', lv:true, group:'arcade', side:'spell', name:'Letter Swipe', blurb:'Is it the next letter? Swipe yes or no as fast as you can.', c:'var(--grape)',
   art:'<svg viewBox="0 0 64 64"><rect x="20" y="12" width="26" height="34" rx="5" fill="#FFD45E" transform="rotate(10 33 29)"/><path d="M8 54h14M42 54h14" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M8 54l5-4M8 54l5 4M56 54l-5-4M56 54l-5 4" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>'},
  {id:'archery', lv:true, group:'arcade', side:'spell', name:'Archery', blurb:'Aim your bow and hit the moving target with the next letter.', c:'var(--sun)',
   art:'<svg viewBox="0 0 64 64"><ellipse cx="46" cy="32" rx="9" ry="20" fill="#fff"/><ellipse cx="46" cy="32" rx="6" ry="13" fill="#E2456A"/><ellipse cx="46" cy="32" rx="3" ry="6" fill="#fff"/><path d="M12 12q16 20 0 40" stroke="#7A5233" stroke-width="4" fill="none"/><path d="M12 32h30" stroke="#4A2E18" stroke-width="3"/></svg>'},
  {id:'bowling', lv:true, group:'arcade', side:'spell', name:'Letter Bowling', blurb:'Roll the ball when the arrow points at the pin with the next letter.', c:'var(--coral)',
   art:'<svg viewBox="0 0 64 64"><ellipse cx="18" cy="16" rx="5" ry="9" fill="#fff"/><ellipse cx="32" cy="16" rx="5" ry="9" fill="#fff"/><ellipse cx="46" cy="16" rx="5" ry="9" fill="#fff"/><circle cx="32" cy="50" r="9" fill="#2B3A67"/></svg>'},
  {id:'train', lv:true, group:'arcade', side:'spell', name:'Train Switch', blurb:'Flip the track switches to send the train to the next letter.', c:'var(--leaf)',
   art:'<svg viewBox="0 0 64 64"><path d="M4 34h20l10-18h26M24 34h36M34 34l8 14h18" stroke="#5B4636" stroke-width="5" fill="none"/><rect x="6" y="24" width="18" height="12" rx="3" fill="#E2456A"/></svg>'},
  {id:'aliens', lv:true, group:'arcade', side:'spell', name:'Alien Attack', blurb:'Blast the alien with the next letter and dodge their lasers.', c:'var(--grape)',
   art:'<svg viewBox="0 0 64 64"><rect x="6" y="10" width="14" height="10" rx="3" fill="#7CF27C"/><rect x="25" y="10" width="14" height="10" rx="3" fill="#7CF27C"/><rect x="44" y="10" width="14" height="10" rx="3" fill="#7CF27C"/><rect x="16" y="26" width="14" height="10" rx="3" fill="#7CF27C"/><rect x="34" y="26" width="14" height="10" rx="3" fill="#7CF27C"/><path d="M32 46l10 14H22z" fill="#5CE1E6"/><path d="M32 42v-6" stroke="#FFD45E" stroke-width="3"/></svg>'},
  {id:'d-jumper', base:'jumper', group:'arcade', side:'def', name:'Clue Sky Jumper', blurb:'Read the meaning, then bounce onto its letters.', c:'var(--sky)'},
  {id:'d-ski', base:'ski', group:'arcade', side:'def', name:'Clue Slalom', blurb:'Read the meaning, then ski through its letters.', c:'var(--sky)'},
  {id:'d-batter', base:'batter', group:'arcade', side:'def', name:'Clue Home Run', blurb:'Read the meaning, then hit its letters.', c:'var(--leaf)'},
  {id:'d-maze', base:'maze', group:'arcade', side:'def', name:'Clue Muncher', blurb:'Read the meaning, then munch its letters round the maze.', c:'var(--grape)'},
  {id:'d-bubbles', base:'bubbles', group:'arcade', side:'def', name:'Clue Bubbles', blurb:'Read the meaning, then pop its letters.', c:'var(--berry)'},
  {id:'d-golf', base:'golf', group:'arcade', side:'def', name:'Clue Golf', blurb:'Read the meaning, then putt into its letters.', c:'var(--leaf)'},
  {id:'d-bomb', base:'bomb', group:'arcade', side:'def', name:'Clue Bomb Squad', blurb:'Read the meaning, then cut its letters before the timer ends.', c:'var(--coral)'},
  {id:'d-swipe', base:'swipe', group:'arcade', side:'def', name:'Clue Swipe', blurb:'Read the meaning, then swipe yes for each next letter.', c:'var(--grape)'},
  {id:'d-archery', base:'archery', group:'arcade', side:'def', name:'Clue Archery', blurb:'Read the meaning, then shoot its letters.', c:'var(--sun)'},
  {id:'d-bowling', base:'bowling', group:'arcade', side:'def', name:'Clue Bowling', blurb:'Read the meaning, then bowl at its letters.', c:'var(--coral)'},
  {id:'d-train', base:'train', group:'arcade', side:'def', name:'Clue Train Switch', blurb:'Read the meaning, then route the train to its letters.', c:'var(--leaf)'},
  {id:'d-aliens', base:'aliens', group:'arcade', side:'def', name:'Clue Aliens', blurb:'Read the meaning, then blast its letters.', c:'var(--grape)'},
];
const gameById = id => GAMES.find(g => g.id === id);
const GROUPS = {spell:[['arcade','Arcade action'],['action','Action games'],['puzzle','Puzzles and practice']], def:[['arcade','Arcade action'],['learn','Learn the meanings'],['spell','Spell from the meaning']]};
const WHOLE_ROUND = new Set(['search', 'memory', 'matchup', 'abc', 'crossword', 'lightning', 'invaders', 'typerace']);
const isWhole = id => WHOLE_ROUND.has(gameById(id).base || id);
const gameLevel = id => clamp(+store.get('sa.level.' + id, store.get('sa.level', 1)) || 0, 0, 2);
const hasLevels = g => !!(g.lv || (g.base && gameById(g.base).lv));
const LEVELS = ['Easy', 'Medium', 'Hard'];
let level = clamp(+store.get('sa.level', 1) || 0, 0, 2);
const lv = (easy, medium, hard) => [easy, medium, hard][S ? S.level : level];
const bestKey = (id, l) => 'sa.pts.' + id + (hasLevels(gameById(id)) ? '.' + l : '');
const SLOW = new Set(['balloon','whack','catcher','racer','fish','frog','snake','blaster','hopper','slice','stack','beats','darts','road','runner','jetpack','claw','penalty','hoops','launcher','jumper','ski','batter','maze','bubbles','golf','bomb','swipe','archery','bowling','train','aliens']);

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
let skipped = 0, curGame = null;

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
  $('#wordCount').textContent = es.length ? `${es.length} word${es.length === 1 ? '' : 's'} ready` : '';
  store.set(KEY[mode], wordsEl.value);
  if(curGame && !$('#menu').hidden){ store.set('sa.count', n); store.set('sa.count.' + curGame, n); }
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
  loadMode();
});
wordsEl.addEventListener('input', syncSetup);
countEl.addEventListener('change', () => { countEl.value = clamp(parseInt(countEl.value, 10) || 1, 1, +countEl.max); syncSetup(); });
$('#minus').onclick = () => { countEl.value = clamp((+countEl.value || 1) - 1, 1, +countEl.max); syncSetup(); };
$('#plus').onclick = () => { countEl.value = clamp((+countEl.value || 0) + 1, 1, +countEl.max); syncSetup(); };
$('#all').onclick = () => { countEl.value = countEl.max; syncSetup(); };
langEl.onchange = () => store.set('sa.lang', langEl.value);
function paintLevel(){ document.querySelectorAll('#levels button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.level === level))); }
document.querySelectorAll('#levels button').forEach(b => b.onclick = () => { level = +b.dataset.level; store.set('sa.level', level); if(curGame) store.set('sa.level.' + curGame, level); sfx('tap'); paintLevel(); renderGameCards(); if(curGame && !$('#menu').hidden) renderBoard($('#menuBoard'), curGame, level); });
paintLevel();

function renderGameCards(){
  $('#games').innerHTML = GROUPS[mode].map(([grp, label]) => {
    const list = GAMES.filter(g => g.side === mode && g.group === grp);
    return `<h3 class="ghead">${esc(label)} <span>${list.length} games</span></h3><div class="games">` + list.map(g => {
      const gl = gameLevel(g.id), best = store.get(bestKey(g.id, gl), 0);
      const art = (g.base ? gameById(g.base).art + '<span class="cluebadge">Clue</span>' : g.art) + (hasLevels(g) ? `<span class="lvbadge l${gl}">${LEVELS[gl]}</span>` : '');
      return `<button class="game" data-id="${g.id}" type="button">
        <div class="art" style="--c:${g.c}">${art}</div>
        <div class="meta"><span class="name">${esc(g.name)}</span><span class="blurb">${esc(g.blurb)}</span>
        <span class="best">${best ? 'Best score ' + best : 'Not played yet'}${hasLevels(g) && best ? ' on ' + LEVELS[gl] : ''}</span></div></button>`;
    }).join('') + '</div>';
  }).join('');
}
$('#games').addEventListener('click', e => {
  const b = e.target.closest('.game'); if(!b) return;
  sfx('tap'); openMenu(b.dataset.id);
});
function openMenu(id){
  const g = gameById(id);
  curGame = id;
  const art = $('#menuArt');
  art.style.setProperty('--c', g.c);
  art.innerHTML = g.base ? gameById(g.base).art + '<span class="cluebadge">Clue</span>' : g.art;
  $('#menuName').textContent = g.name;
  $('#menuBlurb').textContent = g.blurb;
  $('#levelSet').hidden = !hasLevels(g);
  level = gameLevel(id); paintLevel();
  const es = parseList();
  countEl.max = Math.max(1, es.length);
  countEl.value = clamp(+store.get('sa.count.' + id, store.get('sa.count', 10)) || 10, 1, Math.max(1, es.length));
  syncSetup(); paintMute();
  $('#menuNote').textContent = isWhole(id) ? 'This game uses all the words in the round on one board.' : '';
  show('menu');
  renderBoard($('#menuBoard'), id, level);
}
$('#startBtn').onclick = () => { sfx('tap'); startGame(curGame); };
$('#backGallery').onclick = () => goGallery();
$('#toGallery').onclick = () => {
  if(!parseList().length){ $('#err').hidden = false; wordsEl.focus(); return; }
  sfx('tap'); goGallery();
};
$('#backWords').onclick = () => goWords();
document.querySelectorAll('#soundSeg button').forEach(b => b.onclick = () => { if((b.dataset.sound === 'off') !== muted) $('#mute').click(); });

/* ---------- sound ---------- */
let AC = null, muted = store.get('sa.muted', false);
function paintMute(){
  $('#mute').setAttribute('aria-pressed', String(muted)); $('#mutelbl').textContent = muted ? 'Sound off' : 'Sound on'; $('#wave').style.opacity = muted ? 0 : 1;
  document.querySelectorAll('#soundSeg button').forEach(b => b.setAttribute('aria-pressed', String((b.dataset.sound === 'off') === muted)));
}
$('#mute').onclick = () => {
  muted = !muted; store.set('sa.muted', muted); paintMute();
  if(muted){ try{ speechSynthesis.cancel(); }catch(e){} try{ AC && AC.suspend(); }catch(e){} }
  else { try{ AC && AC.resume(); }catch(e){} }
};
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
  if(muted) return false;
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
if(location.hostname === 'localhost') window.__saDbg = () => S && S.dbg ? S.dbg() : null;
function show(id){
  ['wordsScreen','gallery','menu','play','results'].forEach(s => $('#' + s).hidden = s !== id);
  const el = $('#' + id);
  window.scrollTo({top: id === 'wordsScreen' || id === 'gallery' ? 0 : Math.max(0, el.getBoundingClientRect().top + window.scrollY - 12)});
}
function stopCurrent(){ if(S && S.stop){ S.stop(); S.stop = null; } try{ speechSynthesis.cancel(); }catch(e){} }
function goGallery(){ stopCurrent(); S = null; $('#burst').hidden = true; renderGameCards(); show('gallery'); }
function goWords(){ stopCurrent(); S = null; $('#burst').hidden = true; show('wordsScreen'); }
const goHome = goGallery;
$('#home').onclick = () => goWords();
$('#quit').onclick = () => goGallery();

function startGame(id, list){
  const es = parseList();
  if(!list){
    if(!es.length){ goWords(); $('#err').hidden = false; wordsEl.focus(); return; }
    const n = clamp(parseInt(countEl.value, 10) || 1, 1, es.length);
    list = shuffle(es).slice(0, n);
  }
  stopCurrent();
  S = {game:id, list, pool: es.length ? es : list, i:0, score:0, streak:0, results:[], mistakes:0, locked:false, stop:null, key:null,
       level, life:{fifty:true, ask:true}, par: SLOW.has(gameById(id).base || id) ? 2.5 : 1, times:[], lastAward:performance.now(), t0:performance.now()};
  $('#gname').textContent = gameById(id).name + (hasLevels(gameById(id)) ? ' · ' + LEVELS[level] : '');
  $('#burst').hidden = true;
  show('play');
  const g0 = gameById(id);
  if(isWhole(id)) WHOLE[g0.base || id](!!g0.base); else nextWord();
}
function renderHud(){
  $('#score').textContent = S.score;
  $('#streak').textContent = S.streak;
  $('#streakbox').classList.toggle('hot', S.streak >= 3);
  $('#dots').innerHTML = S.list.map((e, k) => {
    const r = S.results[k];
    return `<i class="${r ? r.res : (k === S.i && !isWhole(S.game) ? 'cur' : '')}"></i>`;
  }).join('');
}
function nextWord(){
  if(S.i >= S.list.length) return finish();
  if(S.stop){ S.stop(); S.stop = null; }
  S.mistakes = 0; S.locked = false; S.key = null; S.keyup = null; S.answerAt = null;
  renderHud();
  stage.innerHTML = '';
  S.t0 = performance.now();
  const e = S.list[S.i], g = gameById(S.game);
  IMPL[g.base || g.id](e.w, e, !!g.base);
}
function shake(el){ if(!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
function wrong(el){ S.mistakes++; S.streak = 0; sfx('buzz'); shake(el || stage); renderHud(); }

/* Points = accuracy (right first time scores most) + speed bonus, multiplied by the streak. */
function scoreFor(res, secs, len, mistakes){
  if(res === 'missed') return {pts:0, speed:0, mult:1};
  const par = (S.par || 1) * (3 + 1.1 * len);
  const accuracy = res === 'perfect' ? 100 : Math.max(20, 60 - 15 * Math.max(0, mistakes - 1));
  const speed = Math.round(100 * clamp(1 - secs / par, 0, 1) * (res === 'perfect' ? 1 : .5));
  const mult = 1 + Math.min(S.streak, 10) * .1;
  return {pts:Math.round((accuracy + speed) * mult), speed, mult};
}
function award(k, res, secs){
  const now = performance.now();
  if(secs == null) secs = (now - (S.lastAward || now)) / 1000;
  S.lastAward = now;
  if(res === 'perfect') S.streak++; else S.streak = 0;
  const sc = scoreFor(res, secs, letters(S.list[k].w).length, res === 'tricky' ? 1 : 0);
  S.score += sc.pts;
  if(res !== 'missed') S.times.push(secs);
  return sc;
}
const PRAISE = ['Perfect!','Brilliant!','Spot on!','Superb!','Nailed it!','Fantastic!'];
const OKAY = ['Got it!','You did it!','Nice save!','Well done!'];
function resolve(kind, opt){
  opt = opt || {};
  if(S.locked) return;
  S.locked = true; S.key = null;
  const e = S.list[S.i], w = e.w, tok = S;
  let res;
  const secs = ((S.answerAt || performance.now()) - (S.t0 || performance.now())) / 1000;
  if(kind === 'skip'){ res = 'missed'; S.streak = 0; }
  else if(S.mistakes === 0){ res = 'perfect'; S.streak++; }
  else { res = 'tricky'; S.streak = 0; }
  const sc = scoreFor(res, secs, letters(w).length, S.mistakes), pts = sc.pts;
  S.score += pts;
  if(res !== 'missed') S.times.push(secs);
  S.results[S.i] = {word:w, e, res};
  renderHud();
  const b = $('#burst');
  b.className = 'burst ' + res;
  const head = opt.msg || (res === 'perfect' ? PRAISE[rand(PRAISE.length)] : OKAY[rand(OKAY.length)]);
  const detail = opt.detail ? `<small class="detail">${esc(opt.detail)}</small>` : '';
  b.innerHTML = res === 'missed'
    ? `<div><b>${esc(opt.msg || 'The word is')}</b><span class="w">${esc(w)}</span>${detail}<em>Tap to go on</em></div>`
    : `<div><b>${esc(head)}</b><small>+${pts} points · ${secs.toFixed(1)}s${sc.speed ? ' · speed +' + sc.speed : ''}${sc.mult > 1 ? ' · streak ×' + sc.mult.toFixed(1) : ''}</small>${detail}<em>Tap to go on</em></div>`;
  b.hidden = false;
  if(res === 'missed') sfx('miss'); else { sfx('ding'); confetti(res === 'perfect' ? 70 : 25); }
  let gone = false;
  const go = () => {
    if(gone || S !== tok) return;
    gone = true; clearTimeout(timer); S.advance = null;
    b.hidden = true;
    S.i++; nextWord();
  };
  const timer = setTimeout(go, (res === 'missed' ? 2200 : 1250) + (opt.extra || 0) + (opt.detail ? 1200 : 0));
  setTimeout(() => { if(!gone && S === tok) S.advance = go; }, 250);
}
$('#play').addEventListener('click', () => { if(S && S.locked && S.advance) S.advance(); });

function finish(){
  stopCurrent();
  const tot = S.list.length;
  const c = r => S.results.filter(x => x && x.res === r).length;
  const p = c('perfect'), t = c('tricky'), m = tot - p - t;
  const pct = tot ? (p + t * .5) / tot : 0;
  const stars = pct >= .9 ? 3 : pct >= .6 ? 2 : pct > 0 ? 1 : 0;
  const key = bestKey(S.game, S.level), prev = store.get(key, 0), isBest = S.score > prev;
  if(isBest) store.set(key, S.score);
  const star = on => `<svg class="${on ? 'on' : ''}" viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" stroke-linejoin="round"/></svg>`;
  const heads = ['Keep practising!','Good effort!','Great work!','Superstar!'];
  const retry = S.results.filter(r => r && r.res !== 'perfect').map(r => r.e);
  $('#resbox').innerHTML = `
    <h2>${heads[stars]}</h2>
    <p class="lead" style="margin:0">${esc(gameById(S.game).name)}${hasLevels(gameById(S.game)) ? ' · ' + LEVELS[S.level] : ''} · ${tot} word${tot === 1 ? '' : 's'}</p>
    <div class="stars" aria-label="${stars} of 3 stars">${star(stars >= 1)}${star(stars >= 2)}${star(stars >= 3)}</div>
    <div class="bigscore">${S.score}</div>
    <p class="lead" style="margin:0">${isBest ? 'New best score!' : 'Best score ' + prev}${S.times.length ? ` · ${(S.times.reduce((a, b) => a + b, 0) / S.times.length).toFixed(1)}s per word` : ''}</p>
    <p class="note" style="margin:0">Points come from getting words right first time, answering fast and keeping your streak going.</p>
    <div class="summary"><span style="background:var(--good)">${p} perfect</span><span style="background:var(--warn)">${t} with help</span><span style="background:var(--bad)">${m} missed</span></div>
    <div class="rlist">${S.results.filter(Boolean).map(r => `<span class="${r.res}"${r.e.d ? ` title="${esc(r.e.d)}"` : ''}>${esc(r.word)}</span>`).join('')}</div>
    <div class="actions" style="margin-top:8px">
      <button class="btn" id="again" type="button">Play again</button>
      <button class="btn blue" id="practice" type="button" ${retry.length ? '' : 'disabled'}>Practise tricky words${retry.length ? ' (' + retry.length + ')' : ''}</button>
      <button class="btn ghost" id="toGames" type="button">Back to games</button>
      <button class="btn ghost" id="toWords" type="button">Back to words</button>
    </div>
    <p class="lead" style="margin:0">All-time: <b id="resTotal"></b> points</p>
    <div class="board" id="resBoard" hidden></div>`;
  const g = S.game, gl = S.level;
  $('#again').onclick = () => { level = gl; startGame(g); };
  $('#practice').onclick = () => { level = gl; retry.length && startGame(g, shuffle(retry)); };
  $('#toGames').onclick = () => goGallery();
  $('#toWords').onclick = () => goWords();
  show('results');
  {
    const add = S.score;
    localTotal += add; store.set('sa.total', localTotal);
    $('#resTotal').textContent = fmtPts(myTotal() + (loggedIn() ? add : 0));
    if(loggedIn()) ACC.addPoints(add).then(() => { paintPoints(); const t = $('#resTotal'); if(t) t.textContent = fmtPts(myTotal()); }).catch(() => {});
    paintPoints();
  }
  if(ACC && ACC.enabled){
    const el = $('#resBoard'), score = S.score;
    if(ACC.user){
      el.hidden = false; el.innerHTML = '<p class="note">Saving your score…</p>';
      ACC.saveScore(boardId(g, gl), score)
        .then(best => renderBoard(el, g, gl, {note: best > score ? `Your best here is still ${best}.` : 'Your score is saved!'}))
        .catch(e => { el.innerHTML = `<p class="note err">${esc(ACC.friendly(e))}</p>`; });
    } else renderBoard(el, g, gl, {note:`Log in to save scores like this ${score}.`});
  }
  sfx('fanfare');
  if(stars === 3) confetti(220); else if(stars === 2) confetti(90);
}

document.addEventListener('keyup', e => { if(S && S.keyup && !$('#play').hidden) S.keyup(e); });
document.addEventListener('keydown', e => {
  if(S && S.locked && S.advance && !$('#play').hidden && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); S.advance(); return; }
  if(!S || !S.key || $('#play').hidden) return;
  if(e.target.matches && e.target.matches('input,textarea,select')) return;
  S.key(e);
});

/* ---------- shared bits ---------- */
function bindSkip(){ const b = stage.querySelector('#skip'); if(b) b.onclick = () => resolve('skip'); }
function bindHear(w){
  stage.querySelectorAll('[data-hear]').forEach(b => b.onclick = () => {
    if(muted){ const t = b.textContent; b.textContent = 'Sound is off'; b.disabled = true; setTimeout(() => { b.textContent = t; b.disabled = false; }, 1300); return; }
    speak(w, b.dataset.hear === 'slow' ? .55 : .85);
  });
}
const hearBtn = () => canSpeak ? `<button class="btn blue small" type="button" data-hear="normal">Hear it</button>` : '';
const skipBtn = (label) => `<button class="btn ghost small" type="button" id="skip">${label || 'Skip'}</button>`;
const tilesHtml = (w, cls) => [...w].map(c => c === ' ' ? '<span class="gap"></span>' : `<span class="tile${cls ? ' ' + cls : ''}">${esc(c)}</span>`).join('');
function typeBox(w, host, hintAt){
  if(hintAt == null) hintAt = 2;
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
      if(S.mistakes >= hintAt) showHint();
    }
  });
  function showHint(){ const ls = letters(w); hint.hidden = false; hint.textContent = `Hint: it starts with “${ls[0].toLocaleUpperCase()}” and has ${ls.length} letters.`; }
  if(hintAt === 0) showHint();
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
  return shuffle(S.pool.filter(x => lower(x.w) !== lower(e.w) && (!e.d || x.d !== e.d))).slice(0, n);
}
function variants(w, n){
  const out = new Set();
  const kinds = letters(w).length <= 4 ? [1, 4] : [0, 1, 2, 3];
  for(let t = 0; t < 60 && out.size < n; t++){ const m = misspell(w, kinds); if(m && lower(m) !== lower(w)) out.add(m); }
  return [...out];
}
const unreveal = (el, def) => { if(def){ el.textContent = ''; el.classList.add('slot'); } else el.classList.add('faded'); el.classList.remove('good'); };

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
function misspell(w, kinds){
  const target = lower(w);
  kinds = kinds || [0, 1, 2, 3];
  for(let t = 0; t < 30; t++){
    const a = [...w];
    const li = a.map((c, i) => i).filter(i => isL(a[i]));
    if(li.length < 2) return null;
    const kind = kinds[rand(kinds.length)];
    if(kind === 4){
      const last = li[li.length - 1];
      a.splice(last + 1, 0, lower(a[last]) === 'e' ? 'e' : 'e');
    } else if(kind === 0){
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
const WHOLE = {};

IMPL.scramble = (w, e, def) => {
  const ls = letters(w);
  let order = shuffle(ls.map((c, i) => i));
  for(let k = 0; k < 25 && ls.length > 1 && order.every((v, i) => ls[v] === ls[i]); k++) order = shuffle(order);
  const tiles = order.map(i => ({ch:ls[i], used:false}));
  const extra = decoyLetters(ls);
  for(let k = 0; k < lv(0, 0, 2); k++) tiles.splice(rand(tiles.length + 1), 0, {ch:extra[rand(extra.length)], used:false});
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
  if(S.level === 0 && ls.length > 2){ const t = tiles.find(t => t.ch === ls[0]); t.used = true; ans.push(t); draw(); }
};

IMPL.missing = w => {
  const chars = [...w];
  const idx = chars.map((c, i) => i).filter(i => isL(chars[i]));
  const k = Math.max(1, Math.round(idx.length * lv(.25, .4, .65)));
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
  stage.innerHTML = canSpeak && !muted
    ? `<button class="bigspeak" id="bigspeak" type="button" aria-label="Hear the word">${SPEAK_ICON}</button>
       <p class="prompt">Listen, then spell what you hear</p>
       <div class="actions"><button class="btn blue small" type="button" data-hear="slow">Say it slowly</button><button class="btn ghost small" type="button" id="peek">Peek</button>${skipBtn()}</div>`
    : `<p class="prompt">${muted ? 'Sound is off, so the word can’t be read aloud.' : 'This browser can’t read words aloud.'}</p><p class="sub">Tap Peek to see the word for a moment, then spell it.${muted ? ' Turn the sound on to hear words.' : ''}</p>
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
  typeBox(w, stage, lv(0, 2, 3));
  if(canSpeak && !muted) setTimeout(() => { if(S && S.list[S.i] && S.list[S.i].w === w && !S.locked) speak(w); }, 350);
};

IMPL.flash = w => {
  const ms = (1400 + 220 * letters(w).length) * lv(1.6, 1, .6);
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
    typeBox(w, stage, lv(1, 2, 3));
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
    n: sky.clientWidth < 480 ? 5 : 7, speed: lv(.7, 1, 1.4),
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
    m.t = later(() => { if(m.up) down(m); }, lv(2200, 1500, 1000));
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
  const iv = setInterval(popUp, lv(800, 650, 480));
  S.stop = () => { clearInterval(iv); timers.forEach(clearTimeout); timers.clear(); };
  bindSkip(); bindHear(w);
};

IMPL.snowman = (w, e, def) => {
  const chars = [...w], ls = letters(w);
  const keys = decoyLetters(ls);
  const guessed = new Set();
  const PARTS = ['p-hat','p-scarf','p-arms','p-buttons','p-nose','p-eyes'];
  const MAXM = lv(8, 6, 4);
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
    <p class="lives" id="lives">${MAXM} tries left</p>
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
        S.mistakes = misses <= lv(2, 1, 0) ? 0 : 1;
        resolve('done', {msg: misses === 0 ? 'Not a drop melted!' : 'Snowman saved!'});
      }
    } else {
      if(key) key.classList.add('miss');
      misses++;
      wrong(snow);
      const gone = Math.round(misses * PARTS.length / MAXM);
      PARTS.slice(0, gone).forEach(id => { const part = stage.querySelector('#' + id); if(part) part.style.opacity = 0; });
      snow.style.transform = `scaleY(${1 - (gone / PARTS.length) * .3})`;
      $('#lives').textContent = misses >= MAXM ? 'Oh no, it melted!' : `${MAXM - misses} ${MAXM - misses === 1 ? 'try' : 'tries'} left`;
      if(misses >= MAXM){
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
  const ms = (def ? 6000 + 600 * ls.length : 2500 + 450 * ls.length) * lv(1.5, 1, .65);
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
    drops.push({el, letter, x: rand(Math.max(1, W - DS)), y: -DS, v: (135 + Math.random() * 50) * lv(.7, 1, 1.35), done:false});
  }
  let last = performance.now(), raf = 0;
  function loop(t){
    const dt = Math.min(.05, (t - last) / 1000); last = t;
    if(!S.locked){
      spawnT -= dt;
      if(spawnT <= 0 && drops.length < 6){ spawn(); spawnT = lv(1, .8, .6); }
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
      row.y += (lv(120, 170, 230) + pos * 8) * dt;
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
    const need = ls[pos], n = lv(2, pond.clientWidth < 420 ? 3 : 4, pond.clientWidth < 420 ? 4 : 5);
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
    side: true, rows: 4, n: 8, speed: lv(.8, 1.1, 1.5),
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

IMPL.safe = (w, e, def) => {
  const ls = letters(w), decoys = decoyLetters(ls);
  const dials = ls.map(c => {
    const opts = shuffle([c, ...shuffle(decoys.filter(x => x !== c)).slice(0, lv(2, 3, 5))]);
    let i = rand(opts.length);
    if(opts[i] === c && opts.length > 1) i = (i + 1) % opts.length;
    return {c, opts, i};
  });
  let hidden = def || S.level === 0;
  stage.innerHTML = (def ? promptHtml(true, e, '', 'Crack the safe: spell the word that means…')
    : `<p class="prompt">Crack the safe: set the dials to the secret code</p>
       <div class="tiles" id="code">${tilesHtml(w, 'sm')}</div>
       <p class="sub" id="codehint" style="margin:0">${S.level === 0 ? 'Easy level: the code stays on screen.' : 'Remember the code. It hides when you turn a dial.'}</p>`) + `
    <div class="safebox" id="safe"><div class="dials" id="dials">${dials.map((d, k) => `<div class="dial" data-k="${k}">
      <button class="arr" type="button" data-d="-1" aria-label="Previous letter">▲</button>
      <button class="tile win" type="button" data-d="1" aria-label="Dial ${k + 1}">${esc(d.opts[d.i])}</button>
      <button class="arr" type="button" data-d="1" aria-label="Next letter">▼</button></div>`).join('')}</div></div>
    <div class="actions"><button class="btn green" type="button" id="open">Open the safe</button>${def ? '' : '<button class="btn ghost small" type="button" id="peek">Peek at the code</button>'}${hearIf(def)}${skipBtn()}</div>`;
  const safe = stage.querySelector('#safe'), dEls = [...stage.querySelectorAll('.dial')];
  function hide(){
    if(hidden) return;
    hidden = true;
    stage.querySelector('#code').style.visibility = 'hidden';
    stage.querySelector('#codehint').textContent = 'Tap "Peek at the code" if you need to see it again.';
  }
  stage.querySelector('#dials').onclick = ev => {
    const b = ev.target.closest('button'); if(!b || S.locked) return;
    const k = +b.closest('.dial').dataset.k, d = dials[k];
    d.i = (d.i + (+b.dataset.d) + d.opts.length) % d.opts.length;
    dEls[k].querySelector('.win').textContent = d.opts[d.i];
    dEls[k].classList.remove('bad');
    sfx('tap'); hide();
  };
  const peek = stage.querySelector('#peek');
  if(peek) peek.onclick = () => { S.mistakes++; hidden = false; stage.querySelector('#code').style.visibility = 'visible'; };
  stage.querySelector('#open').onclick = () => {
    if(S.locked) return;
    const bad = dials.map((d, k) => d.opts[d.i] !== d.c ? k : -1).filter(k => k >= 0);
    if(!bad.length){ safe.classList.add('open'); sfx('whoosh'); resolve('done', {msg:'Safe cracked!'}); }
    else { bad.forEach(k => dEls[k].classList.add('bad')); wrong(safe); }
  };
  bindSkip(); bindHear(w);
};

IMPL.pickspell = (w, e, def) => {
  const opts = shuffle([e, ...variants(w, lv(2, 3, 5)).map(v => ({w:v}))]);
  choiceGame(e, def ? promptHtml(true, e, '', 'Which is the correct spelling of the word that means…')
    : `<p class="prompt">Which spelling is correct?</p>`, opts, true);
  if(def) stage.querySelectorAll('[data-hear]').forEach(b => b.remove());
  else if(canSpeak && !muted) setTimeout(() => { if(S && !S.locked && S.list[S.i] === e) speak(w); }, 300);
};

IMPL.oddone = (w, e) => {
  const bad = {w: misspell(w) || (w + w.slice(-1))};
  const opts = shuffle([bad, ...otherEntries(e, lv(2, 3, 5))]);
  choiceGame(e, `<p class="prompt">One of these words is spelled wrong. Tap it!</p>`, opts, true, bad, {msg:'Found it!', detail:`The right spelling is ${w}`});
  stage.querySelectorAll('[data-hear]').forEach(b => b.remove());
};

IMPL.path = (w, e, def) => {
  const ls = letters(w).slice(0, 36), L = ls.length;
  const base = L <= 9 ? 4 : L <= 16 ? 5 : 6;
  const n = S.level === 0 && (base - 1) * (base - 1) >= L + 2 ? base - 1 : S.level === 2 ? base + 1 : base, N = n * n;
  const nb = i => { const r = Math.floor(i / n), c = i % n, out = [];
    for(let dr = -1; dr <= 1; dr++) for(let dc = -1; dc <= 1; dc++){ if(!dr && !dc) continue; const rr = r + dr, cc = c + dc; if(rr >= 0 && rr < n && cc >= 0 && cc < n) out.push(rr * n + cc); }
    return out; };
  let budget = 0;
  function dfs(p){
    if(p.length === L) return p;
    if(++budget > 20000) return null;
    for(const x of shuffle(nb(p[p.length - 1]))) if(!p.includes(x)){ const r = dfs([...p, x]); if(r) return r; }
    return null;
  }
  let route = null;
  for(let t = 0; t < 30 && !route; t++){ budget = 0; route = dfs([rand(N)]); }
  const decoys = decoyLetters(ls);
  const grid = Array.from({length:N}, () => decoys[rand(decoys.length)]);
  (route || []).forEach((ci, k) => grid[ci] = ls[k]);
  const sel = [];
  stage.innerHTML = promptHtml(def, e, 'Trace the word through the grid', 'Trace the word that means… through the grid') + `
    ${targetHtml(ls, def)}
    <p class="sub" style="margin:0">Each letter must touch the one before it, even corner to corner. Tap the last letter again to undo.</p>
    <div class="pgrid" id="pgrid" style="--n:${n}">${grid.map((c, i) => `<button class="pcell" type="button" data-i="${i}">${esc(c)}</button>`).join('')}</div>
    <div class="actions"><button class="btn ghost small" type="button" id="clr">Start again</button>${hearIf(def)}${skipBtn()}</div>`;
  const cells = [...stage.querySelectorAll('.pcell')], target = [...stage.querySelectorAll('#target .tile')];
  function undo(){ const i = sel.pop(); cells[i].classList.remove('on'); delete cells[i].dataset.n; unreveal(target[sel.length], def); }
  stage.querySelector('#pgrid').onclick = ev => {
    const b = ev.target.closest('.pcell'); if(!b || S.locked) return;
    const i = +b.dataset.i;
    if(sel.length && sel[sel.length - 1] === i){ undo(); return; }
    if(sel.includes(i)) return;
    if(grid[i] === ls[sel.length] && (!sel.length || nb(sel[sel.length - 1]).includes(i))){
      sel.push(i); b.classList.add('on'); b.dataset.n = sel.length; sfx('tap');
      reveal(target[sel.length - 1], ls[sel.length - 1]);
      if(sel.length === L){ target.forEach(t => t.classList.add('good')); resolve('done'); }
    } else {
      b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); wrong(null);
    }
  };
  stage.querySelector('#clr').onclick = () => { while(sel.length) undo(); };
  bindSkip(); bindHear(w);
};

IMPL.robot = (w, e, def) => {
  const ls = letters(w), goal = ls.join('');
  const step = (def ? 1100 : 650) * lv(1.6, 1, .6), delay = (def ? 2500 : 1200) * lv(1.5, 1, .7);
  stage.innerHTML = promptHtml(def, e, 'Type the word before the robot does!', 'Type the word that means… before the robot does!') + `
    <div class="race">
      <div class="lane"><b>You</b><div class="tiles" id="you">${ls.map(c => def ? '<span class="tile sm slot"></span>' : `<span class="tile sm faded">${esc(c)}</span>`).join('')}</div></div>
      <div class="lane"><b>Robot</b><div class="tiles" id="bot">${ls.map(() => '<span class="tile sm slot"></span>').join('')}</div></div>
    </div>
    <div class="typebox"><input class="answer" id="answer" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Type the word" placeholder="Start typing"></div>
    <p class="sub" id="rmsg" style="margin:0">Ready, steady, type!</p>
    <div class="actions">${hearIf(def)}${skipBtn()}</div>`;
  const inp = stage.querySelector('#answer'), you = [...stage.querySelectorAll('#you .tile')], bot = [...stage.querySelectorAll('#bot .tile')];
  const tok = S, wi = S.i;
  let bp = 0, botWon = false, iv = null, ok = true;
  const t0 = setTimeout(() => {
    iv = setInterval(() => {
      if(S !== tok || S.i !== wi || S.locked){ clearInterval(iv); return; }
      reveal(bot[bp], ls[bp]); bot[bp].classList.add('robot'); bp++;
      if(bp >= ls.length){
        clearInterval(iv); botWon = true; S.mistakes++; S.streak = 0; renderHud();
        stage.querySelector('#rmsg').textContent = 'The robot won this time. Finish the word anyway!';
        sfx('miss');
      }
    }, step);
  }, delay);
  S.stop = () => { clearTimeout(t0); clearInterval(iv); };
  inp.addEventListener('input', () => {
    if(S.locked) return;
    const v = norm(inp.value), nowOk = goal.startsWith(v);
    you.forEach((el, k) => { if(nowOk && k < v.length){ reveal(el, ls[k]); el.classList.add('good'); } else unreveal(el, def); });
    inp.classList.toggle('off', !nowOk);
    if(!nowOk && ok) wrong(inp);
    ok = nowOk;
    if(v === goal){ S.stop(); inp.disabled = true; resolve('done', {msg: botWon ? 'Done!' : 'You beat the robot!'}); }
  });
  bindSkip(); bindHear(w);
  setTimeout(() => inp.focus(), 60);
};

IMPL.truefalse = (w, e) => {
  const others = otherEntries(e, 1);
  const real = !others.length || Math.random() < .5;
  stage.innerHTML = `<p class="prompt">Does this word match this meaning?</p>
    <div class="tiles">${tilesHtml(w)}</div>
    <div class="defbox">${esc(real ? e.d : others[0].d)}</div>
    <div class="actions"><button class="btn green big" type="button" id="yes">Yes, it matches</button><button class="btn big" type="button" id="no">No, it doesn't</button></div>
    <div class="actions">${hearBtn()}</div>`;
  function answer(saysYes){
    if(S.locked) return;
    stage.querySelectorAll('#yes,#no').forEach(b => b.disabled = true);
    if(saysYes === real) resolve('done', {msg: real ? 'Yes, it matches!' : 'Good catch!', detail: real ? '' : `${w} means: ${e.d}`});
    else { wrong(null); resolve('skip', {msg: real ? 'It did match!' : 'That was a different meaning.', detail:`It means: ${e.d}`}); }
  }
  stage.querySelector('#yes').onclick = () => answer(true);
  stage.querySelector('#no').onclick = () => answer(false);
  S.key = ev => { const k = lower(ev.key); if(k === 'y' || ev.key === 'ArrowLeft') answer(true); if(k === 'n' || ev.key === 'ArrowRight') answer(false); };
  bindHear(w);
};

IMPL.builder = (w, e) => {
  const toks = e.d.split(/\s+/).filter(Boolean).slice(0, 20);
  let order = shuffle(toks.map((t, i) => i));
  for(let k = 0; k < 20 && toks.length > 1 && order.every((v, i) => toks[v] === toks[i]); k++) order = shuffle(order);
  let built = 0;
  stage.innerHTML = `<p class="prompt">Build the meaning of this word</p>
    <div class="tiles">${tilesHtml(w)}</div>
    <div class="built" id="built"><span class="ph">Tap the words in the right order</span></div>
    <div class="wchips" id="wc">${order.map(i => `<button class="wchip" type="button" data-i="${i}">${esc(toks[i])}</button>`).join('')}</div>
    <div class="actions">${hearBtn()}${skipBtn()}</div>`;
  const out = stage.querySelector('#built');
  stage.querySelector('#wc').onclick = ev => {
    const b = ev.target.closest('.wchip'); if(!b || S.locked || b.classList.contains('used')) return;
    if(b.textContent === toks[built]){
      if(!built) out.innerHTML = '';
      b.classList.add('used'); out.insertAdjacentHTML('beforeend', `<span>${esc(toks[built])}</span>`); built++; sfx('tap');
      if(built === toks.length){ out.classList.add('done'); resolve('done', {msg:'Meaning built!'}); }
    } else wrong(b);
  };
  bindSkip(); bindHear(w);
};

const VOWELS = 'aeiouyæøåäöü';
IMPL.vowels = (w, e, def) => {
  const chars = [...w];
  let blanks = chars.map((c, i) => i).filter(i => VOWELS.includes(lower(chars[i])));
  if(!blanks.length){ const li = chars.map((c, i) => i).filter(i => isL(chars[i])); blanks = shuffle(li).slice(0, Math.min(2, li.length)).sort((a, b) => a - b); }
  const needed = [...new Set(blanks.map(i => lower(chars[i])))];
  const keys = (S.level === 0
    ? [...new Set([...needed, ...shuffle([...'aeiou'].filter(v => !needed.includes(v))).slice(0, 1)])]
    : [...new Set([...'aeiou', ...needed, ...(S.level === 2 ? ['y'] : [])])]).sort();
  let pos = 0;
  stage.innerHTML = promptHtml(def, e, 'Tap the missing vowels in order', 'Put the vowels back in the word that means…') + `
    <div class="tiles" id="row">${chars.map((c, i) => c === ' ' ? '<span class="gap"></span>' : blanks.includes(i) ? '<span class="tile slot" data-b></span>' : `<span class="tile">${esc(c)}</span>`).join('')}</div>
    <div class="keys" id="keys">${keys.map(k => `<button class="key" type="button" data-k="${esc(k)}">${esc(k)}</button>`).join('')}</div>
    <div class="actions">${hearIf(def)}${skipBtn()}</div>`;
  const slots = [...stage.querySelectorAll('[data-b]')];
  if(slots[0]) slots[0].classList.add('cur');
  function press(k){
    if(S.locked || pos >= blanks.length) return;
    if(k === lower(chars[blanks[pos]])){
      reveal(slots[pos], chars[blanks[pos]]); slots[pos].classList.remove('cur'); pos++; sfx('tap');
      if(pos === blanks.length){ stage.querySelectorAll('#row .tile').forEach(t => t.classList.add('good')); resolve('done'); }
      else slots[pos].classList.add('cur');
    } else wrong(slots[pos]);
  }
  stage.querySelector('#keys').onclick = ev => { const b = ev.target.closest('.key'); if(b) press(b.dataset.k); };
  S.key = ev => { const k = lower(ev.key); if(k.length === 1 && keys.includes(k)) press(k); };
  bindSkip(); bindHear(w);
};

IMPL.swapfix = (w, e, def) => {
  const ls = letters(w), goal = ls.join('');
  const swapsN = S.level === 2 && ls.length > 3 ? 2 : 1;
  let cur = ls.slice();
  for(let t = 0; t < 60; t++){
    cur = ls.slice();
    for(let k = 0; k < swapsN; k++){
      let i, j;
      if(S.level === 0){ i = rand(Math.max(1, ls.length - 1)); j = i + 1; } else { i = rand(ls.length); j = rand(ls.length); }
      if(j < ls.length) [cur[i], cur[j]] = [cur[j], cur[i]];
    }
    if(cur.join('') !== goal) break;
  }
  let sel = -1, moves = 0;
  stage.innerHTML = promptHtml(def, e, 'Letters swapped places. Tap two tiles to swap them back.', 'Fix the word that means… by swapping two tiles') + `
    <div class="tiles" id="sw"></div>
    <p class="sub" style="margin:0">${swapsN === 2 ? 'Two swaps will fix it.' : 'One swap will fix it.'}</p>
    <div class="actions">${hearIf(def)}${skipBtn()}</div>`;
  const row = stage.querySelector('#sw');
  const draw = () => { row.innerHTML = cur.map((c, k) => `<button class="tile${k === sel ? ' sel' : ''}" type="button" data-k="${k}">${esc(c)}</button>`).join(''); };
  draw();
  row.onclick = ev => {
    const b = ev.target.closest('.tile'); if(!b || S.locked) return;
    const k = +b.dataset.k;
    if(sel < 0){ sel = k; sfx('tap'); draw(); return; }
    if(sel === k){ sel = -1; draw(); return; }
    [cur[sel], cur[k]] = [cur[k], cur[sel]]; sel = -1; moves++;
    draw();
    if(cur.join('') === goal){ row.querySelectorAll('.tile').forEach(t => t.classList.add('good')); resolve('done', {msg:'Fixed!'}); }
    else if(moves >= swapsN) wrong(row); else sfx('tap');
  };
  bindSkip(); bindHear(w);
};

IMPL.chunks = (w, e, def) => {
  const ls = letters(w);
  const [lo, hi] = lv([3, 4], [2, 3], [1, 2]);
  let chunks = [];
  for(let i = 0; i < ls.length;){ const n = lo + rand(hi - lo + 1); chunks.push(ls.slice(i, i + n).join('')); i += n; }
  if(chunks.length < 2 && ls.length > 1){ const h = Math.ceil(ls.length / 2); chunks = [ls.slice(0, h).join(''), ls.slice(h).join('')]; }
  let order = shuffle(chunks.map((c, i) => i));
  for(let k = 0; k < 20 && chunks.length > 1 && order.every((v, i) => chunks[v] === chunks[i]); k++) order = shuffle(order);
  let built = 0;
  stage.innerHTML = promptHtml(def, e, 'Snap the pieces together to spell the word', 'Snap the pieces together to spell the word that means…') + `
    <div class="built word" id="built"><span class="ph">Tap the pieces in order</span></div>
    <div class="wchips" id="wc">${order.map(i => `<button class="wchip piece" type="button">${esc(chunks[i])}</button>`).join('')}</div>
    <div class="actions">${hearIf(def)}${skipBtn()}</div>`;
  const out = stage.querySelector('#built');
  stage.querySelector('#wc').onclick = ev => {
    const b = ev.target.closest('.wchip'); if(!b || S.locked || b.classList.contains('used')) return;
    if(b.textContent === chunks[built]){
      if(!built) out.innerHTML = '';
      b.classList.add('used'); out.insertAdjacentHTML('beforeend', `<span>${esc(chunks[built])}</span>`); built++; sfx('tap');
      if(built === chunks.length){ out.classList.add('done'); resolve('done'); }
    } else wrong(b);
  };
  bindSkip(); bindHear(w);
};

IMPL.fixit = (w, e) => {
  let bad = misspell(w) || (w + w.slice(-1));
  if(S.level === 2){ const b2 = misspell(bad); if(b2 && lower(b2) !== lower(w)) bad = b2; }
  stage.innerHTML = `<p class="prompt">This word is spelled wrong. Fix it!</p>
    <form class="typebox" id="tb" autocomplete="off">
      <input class="answer" id="answer" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Fix the word" value="${esc(bad)}">
      <button class="btn" type="submit">Check</button></form>
    <p class="sub" style="margin:0">${S.level === 0 ? `It should have ${letters(w).length} letters.` : S.level === 2 ? 'Hard level: there may be two mistakes.' : 'Change the letters, then tap Check.'}</p>
    <p class="hint" id="hint" hidden></p>
    <div class="actions">${hearBtn()}${skipBtn()}</div>`;
  const f = stage.querySelector('#tb'), inp = f.querySelector('input'), hint = stage.querySelector('#hint');
  f.addEventListener('submit', ev => {
    ev.preventDefault();
    if(S.locked) return;
    if(norm(inp.value) === norm(w)){ inp.classList.add('good'); inp.disabled = true; resolve('done', {msg:'Fixed!'}); return; }
    if(norm(inp.value) === norm(bad)){ hint.hidden = false; hint.textContent = 'Change something first. The word is spelled wrong right now.'; return; }
    wrong(inp);
    if(S.mistakes >= 2){ hint.hidden = false; hint.textContent = `Hint: it starts with “${letters(w)[0].toLocaleUpperCase()}” and has ${letters(w).length} letters.`; }
  });
  setTimeout(() => { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }, 60);
  bindSkip(); bindHear(w);
};

IMPL.quiz = (w, e, def) => {
  const n = lv(3, 4, 6);
  const opts = def ? shuffle([e, ...otherEntries(e, n - 1)]) : shuffle([e, ...variants(w, n - 1).map(v => ({w:v}))]);
  const head = `<div class="quizhead"><span>Question ${S.i + 1} of ${S.list.length}</span><span>Streak ${S.streak}</span></div>` +
    (def ? `<p class="prompt">Which word means this?</p><div class="defbox">${esc(e.d)}</div>` : `<p class="prompt">Which is the correct spelling?</p>`);
  choiceGame(e, head, opts, true);
  if(def) stage.querySelectorAll('[data-hear]').forEach(b => b.remove());
  stage.querySelector('.opts').insertAdjacentHTML('afterend', `<div class="actions lifelines">
    <button class="btn ghost small" type="button" id="fifty" ${S.life.fifty ? '' : 'disabled'}>50:50</button>
    <button class="btn ghost small" type="button" id="ask" ${S.life.ask ? '' : 'disabled'}>Ask the class</button></div>`);
  const btns = [...stage.querySelectorAll('.opt')];
  stage.querySelector('#fifty').onclick = ev => {
    if(S.locked || !S.life.fifty) return;
    S.life.fifty = false; ev.currentTarget.disabled = true; sfx('flip');
    const wrongs = shuffle(btns.filter((b, k) => opts[k] !== e && !b.disabled));
    wrongs.slice(0, Math.max(1, wrongs.length - 1)).forEach(b => { b.disabled = true; b.classList.add('gone'); });
  };
  stage.querySelector('#ask').onclick = ev => {
    if(S.locked || !S.life.ask) return;
    S.life.ask = false; ev.currentTarget.disabled = true; sfx('flip');
    const live = btns.map((b, k) => ({b, k})).filter(o => !o.b.disabled);
    let left = 100;
    const right = lv(70, 55, 40) + rand(15);
    const shares = live.map(o => opts[o.k] === e ? right : 0);
    left -= right;
    const others = live.filter(o => opts[o.k] !== e);
    others.forEach((o, i) => { const v = i === others.length - 1 ? left : rand(left + 1); shares[live.indexOf(o)] = v; left -= v; });
    live.forEach((o, i) => o.b.insertAdjacentHTML('beforeend', `<span class="poll"><i style="width:${shares[i]}%"></i><b>${shares[i]}%</b></span>`));
  };
};

WHOLE.abc = () => {
  const cmp = new Intl.Collator(langEl.value, {sensitivity:'base'}).compare;
  const per = lv(3, 4, 6);
  const sets = [];
  for(let i = 0; i < S.list.length; i += per) sets.push(S.list.slice(i, i + per).map((e, j) => i + j));
  if(sets.length > 1 && sets[sets.length - 1].length === 1) sets[sets.length - 2].push(sets.pop()[0]);
  S.results = []; renderHud();
  const slipped = new Set();
  let setNo = 0;
  function render(){
    const ks = sets[setNo];
    const want = [...ks].sort((a, b) => cmp(S.list[a].w, S.list[b].w));
    let next = 0;
    stage.innerHTML = `<p class="prompt">Tap the words in ABC order</p>
      <p class="sub">${sets.length > 1 ? `Set ${setNo + 1} of ${sets.length}. ` : ''}Start with the one that comes first in the alphabet.</p>
      <div class="built" id="built"><span class="ph">Your order shows here</span></div>
      <div class="opts" id="abc">${shuffle(ks).map(k => `<button class="opt word" type="button" data-k="${k}">${esc(S.list[k].w)}</button>`).join('')}</div>
      <div class="actions">${skipBtn('Show answers')}</div>`;
    const out = stage.querySelector('#built');
    stage.querySelector('#abc').onclick = ev => {
      const b = ev.target.closest('.opt'); if(!b || b.disabled) return;
      const k = +b.dataset.k;
      if(k === want[next]){
        if(!next) out.innerHTML = '';
        b.disabled = true; b.classList.add('good');
        out.insertAdjacentHTML('beforeend', `<span>${next + 1}. ${esc(S.list[k].w)}</span>`);
        const res = slipped.has(k) ? 'tricky' : 'perfect';
        S.results[k] = {word:S.list[k].w, e:S.list[k], res};
        award(k, res);
        renderHud(); sfx('tap'); next++;
        if(next === ks.length){
          sfx('ding'); confetti(40);
          const tok = S;
          setTimeout(() => { if(S !== tok) return; setNo++; if(setNo < sets.length) render(); else finish(); }, 500);
        }
      } else {
        slipped.add(want[next]); slipped.add(k);
        S.streak = 0; renderHud(); sfx('buzz'); shake(b);
      }
    };
    stage.querySelector('#skip').onclick = () => {
      S.list.forEach((e, k) => { if(!S.results[k]) S.results[k] = {word:e.w, e, res:'missed'}; });
      renderHud(); sfx('miss');
      stage.innerHTML = `<p class="prompt">The right order</p><div class="built">${want.map((k, i) => `<span>${i + 1}. ${esc(S.list[k].w)}</span>`).join('')}</div>
        <div class="actions"><button class="btn" type="button" id="cont">See results</button></div>`;
      stage.querySelector('#cont').onclick = () => finish();
    };
  }
  render();
};

WHOLE.crossword = () => {
  const max = lv(4, 6, 8);
  const items = S.list.map(e => ({e, ls:letters(e.w)})).filter(o => o.ls.length >= 2).slice(0, 14);
  const key = (r, c) => r + ',' + c;
  function build(order){
    const G = new Map(), placed = [];
    const get = (r, c) => G.get(key(r, c));
    function fits(ls, r, c, dir){
      const [dr, dc] = dir === 'a' ? [0, 1] : [1, 0];
      if(get(r - dr, c - dc) || get(r + dr * ls.length, c + dc * ls.length)) return 0;
      let cross = 0;
      for(let k = 0; k < ls.length; k++){
        const rr = r + dr * k, cc = c + dc * k, ex = get(rr, cc);
        if(ex){ if(ex.ch !== ls[k] || ex.dirs.has(dir)) return 0; cross++; }
        else if(get(rr + dc, cc + dr) || get(rr - dc, cc - dr)) return 0;
      }
      return cross;
    }
    function put(o, r, c, dir){
      const [dr, dc] = dir === 'a' ? [0, 1] : [1, 0];
      o.ls.forEach((ch, k) => { const kk = key(r + dr * k, c + dc * k); let cell = G.get(kk); if(!cell){ cell = {ch, dirs:new Set()}; G.set(kk, cell); } cell.dirs.add(dir); });
      placed.push({...o, r, c, dir});
    }
    put(order[0], 0, 0, Math.random() < .5 ? 'a' : 'd');
    for(const o of order.slice(1)){
      if(placed.length >= max) break;
      const spots = [];
      for(const [kk, cell] of G){
        const [r, c] = kk.split(',').map(Number);
        o.ls.forEach((ch, k) => {
          if(ch !== cell.ch) return;
          for(const dir of ['a', 'd']){
            if(cell.dirs.has(dir)) continue;
            const r0 = dir === 'a' ? r : r - k, c0 = dir === 'a' ? c - k : c;
            if(fits(o.ls, r0, c0, dir)) spots.push({r:r0, c:c0, dir});
          }
        });
      }
      if(spots.length){
        const cells = [...G.keys()].map(kk => kk.split(',').map(Number));
        const size = sp => { let r0 = Infinity, c0 = Infinity, r1 = -Infinity, c1 = -Infinity;
          const add = (r, c) => { r0 = Math.min(r0, r); c0 = Math.min(c0, c); r1 = Math.max(r1, r); c1 = Math.max(c1, c); };
          cells.forEach(([r, c]) => add(r, c)); add(sp.r, sp.c); add(sp.r + (sp.dir === 'd' ? o.ls.length - 1 : 0), sp.c + (sp.dir === 'a' ? o.ls.length - 1 : 0));
          return Math.max(r1 - r0, c1 - c0) + Math.random() * .5; };
        const sp = spots.reduce((best, x) => size(x) < size(best) ? x : best);
        put(o, sp.r, sp.c, sp.dir);
      }
    }
    return placed;
  }
  let placed = [];
  if(items.length) for(let t = 0; t < 40; t++){
    const pl = build(shuffle(items));
    const span = list => { let r0 = Infinity, c0 = Infinity, r1 = -Infinity, c1 = -Infinity; list.forEach(p => { r0 = Math.min(r0, p.r); c0 = Math.min(c0, p.c); r1 = Math.max(r1, p.r + (p.dir === 'd' ? p.ls.length - 1 : 0)); c1 = Math.max(c1, p.c + (p.dir === 'a' ? p.ls.length - 1 : 0)); }); return Math.max(r1 - r0, c1 - c0); };
    if(pl.length > placed.length || (pl.length === placed.length && span(pl) < span(placed))) placed = pl;
  }
  if(!placed.length){
    stage.innerHTML = `<p class="prompt">Add words with at least two letters to make a crossword.</p><div class="actions"><button class="btn" type="button" id="back">Choose another game</button></div>`;
    stage.querySelector('#back').onclick = goHome; return;
  }
  let minR = Infinity, minC = Infinity, maxR = -Infinity, maxC = -Infinity;
  placed.forEach(p => { const L2 = p.ls.length - 1; minR = Math.min(minR, p.r); minC = Math.min(minC, p.c); maxR = Math.max(maxR, p.r + (p.dir === 'd' ? L2 : 0)); maxC = Math.max(maxC, p.c + (p.dir === 'a' ? L2 : 0)); });
  placed.forEach(p => { p.r -= minR; p.c -= minC; p.cells = p.ls.map((_, k) => key(p.r + (p.dir === 'd' ? k : 0), p.c + (p.dir === 'a' ? k : 0))); });
  const H = maxR - minR + 1, W = maxC - minC + 1;
  const starts = [...new Set(placed.map(p => key(p.r, p.c)))].sort((a, b) => { const [ar, ac] = a.split(',').map(Number), [br, bc] = b.split(',').map(Number); return ar - br || ac - bc; });
  placed.forEach(p => p.num = starts.indexOf(key(p.r, p.c)) + 1);
  const letterAt = new Map(); placed.forEach(p => p.cells.forEach((kk, i) => letterAt.set(kk, p.ls[i])));
  S.list = placed.map(p => p.e); S.results = []; renderHud();
  const slipped = new Set();
  const clue = dir => placed.map((p, k) => ({p, k})).filter(o => o.p.dir === dir).sort((a, b) => a.p.num - b.p.num)
    .map(o => `<li data-k="${o.k}"><b>${o.p.num}</b> ${esc(o.p.e.d)} <small>(${o.p.ls.length})</small></li>`).join('');
  let cellsHtml = '';
  for(let r = 0; r < H; r++) for(let c = 0; c < W; c++){
    const kk = key(r, c);
    if(letterAt.has(kk)){ const num = starts.indexOf(kk) + 1; cellsHtml += `<div class="xcell">${num ? `<span class="num">${num}</span>` : ''}<input maxlength="2" data-kk="${kk}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Crossword square"></div>`; }
    else cellsHtml += '<div class="xblank"></div>';
  }
  stage.innerHTML = `<p class="prompt">Mini Crossword</p>
    <p class="sub">Tap a clue or a square, then type. The clues are the meanings.</p>
    <div class="xwrap"><div class="xgrid" style="--w:${W}">${cellsHtml}</div>
      <div class="xclues">${placed.some(p => p.dir === 'a') ? `<h4>Across</h4><ol>${clue('a')}</ol>` : ''}${placed.some(p => p.dir === 'd') ? `<h4>Down</h4><ol>${clue('d')}</ol>` : ''}</div></div>
    <div class="actions"><button class="btn" type="button" id="check">Check answers</button><button class="btn ghost small" type="button" id="giveup">Show answers</button></div>`;
  const inputs = new Map([...stage.querySelectorAll('.xgrid input')].map(i => [i.dataset.kk, i]));
  let active = 0;
  function setActive(k){
    active = k;
    stage.querySelectorAll('.xcell').forEach(x => x.classList.remove('hl'));
    placed[k].cells.forEach(kk => inputs.get(kk).parentNode.classList.add('hl'));
    stage.querySelectorAll('.xclues li').forEach(li => li.classList.toggle('on', +li.dataset.k === k));
  }
  stage.querySelector('.xclues').onclick = ev => {
    const li = ev.target.closest('li'); if(!li) return;
    const k = +li.dataset.k; setActive(k);
    const first = placed[k].cells.find(kk => !inputs.get(kk).value) || placed[k].cells[0];
    inputs.get(first).focus();
  };
  inputs.forEach((inp, kk) => {
    inp.addEventListener('focus', () => {
      if(!placed[active].cells.includes(kk)){ const k = placed.findIndex(p => p.cells.includes(kk)); setActive(k); }
      inp.select();
    });
    inp.addEventListener('input', () => {
      inp.value = [...inp.value].filter(isL).pop() || '';
      inp.parentNode.classList.remove('bad');
      if(inp.value){
        const cells = placed[active].cells, i = cells.indexOf(kk);
        if(i >= 0 && i < cells.length - 1) inputs.get(cells[i + 1]).focus();
        if([...inputs.values()].every(x => x.value)) check();
      }
    });
    inp.addEventListener('keydown', ev => {
      if(ev.key === 'Backspace' && !inp.value){
        const cells = placed[active].cells, i = cells.indexOf(kk);
        if(i > 0){ ev.preventDefault(); inputs.get(cells[i - 1]).focus(); }
      }
      if(ev.key === 'Enter') check();
    });
  });
  function check(){
    let allRight = true;
    placed.forEach((p, k) => {
      const typed = p.cells.map(kk => lower(inputs.get(kk).value)).join('');
      if(typed === p.ls.join('')){
        if(!S.results[k]){
          const res = slipped.has(k) ? 'tricky' : 'perfect';
          S.results[k] = {word:p.e.w, e:p.e, res};
          award(k, res);
          p.cells.forEach(kk => inputs.get(kk).parentNode.classList.add('good'));
          stage.querySelector(`.xclues li[data-k="${k}"]`).classList.add('done');
        }
      } else {
        allRight = false;
        if(p.cells.every(kk => inputs.get(kk).value)){ slipped.add(k); p.cells.forEach(kk => { const x = inputs.get(kk).parentNode; if(!x.classList.contains('good')) x.classList.add('bad'); }); }
      }
    });
    renderHud();
    if(allRight){ sfx('ding'); confetti(120); const tok = S; setTimeout(() => S === tok && finish(), 900); }
    else sfx('buzz');
  }
  stage.querySelector('#check').onclick = check;
  stage.querySelector('#giveup').onclick = () => {
    inputs.forEach((inp, kk) => { if(lower(inp.value) !== letterAt.get(kk)){ inp.value = letterAt.get(kk); inp.parentNode.classList.add('bad'); } });
    S.list.forEach((e, k) => { if(!S.results[k]) S.results[k] = {word:e.w, e, res:'missed'}; });
    renderHud(); sfx('miss');
    const tok = S; setTimeout(() => S === tok && finish(), 2600);
  };
  setActive(0);
};

WHOLE.lightning = () => {
  const secs = lv(60, 45, 30);
  const stats = S.list.map(() => ({right:0, wrong:0, seen:false}));
  let left = secs * 1000, iv = null, cur = null, answered = 0;
  stage.innerHTML = `<p class="prompt">Lightning Round</p>
    <p class="sub">You get ${secs} seconds. Does the word match the meaning? Answer as fast as you can!</p>
    <div class="actions"><button class="btn big" type="button" id="go">Start</button></div>`;
  S.results = []; renderHud();
  stage.querySelector('#go').onclick = begin;
  function begin(){
    stage.innerHTML = `<div class="quizhead"><span id="ltime">${secs}s left</span><span id="lcount">0 answered</span></div>
      <div class="timer"><i id="lbar" style="width:100%"></i></div>
      <div class="tiles" id="lword"></div><div class="defbox" id="ldef"></div>
      <div class="actions"><button class="btn green big" type="button" id="yes">Match</button><button class="btn big" type="button" id="no">No match</button></div>
      <p class="sub" style="margin:0">Keys: Y for match, N for no match.</p>`;
    next(); S.lastAward = performance.now();
    const t0 = performance.now();
    iv = setInterval(() => {
      left = secs * 1000 - (performance.now() - t0);
      const sec = Math.max(0, Math.ceil(left / 1000));
      const tEl = stage.querySelector('#ltime'); if(tEl) tEl.textContent = sec + 's left';
      const bar = stage.querySelector('#lbar'); if(bar) bar.style.width = Math.max(0, left / (secs * 10)) + '%';
      if(left <= 0) end();
    }, 100);
    S.stop = () => clearInterval(iv);
    stage.querySelector('#yes').onclick = () => answer(true);
    stage.querySelector('#no').onclick = () => answer(false);
    S.key = ev => { const k = lower(ev.key); if(k === 'y' || ev.key === 'ArrowLeft') answer(true); if(k === 'n' || ev.key === 'ArrowRight') answer(false); };
  }
  function next(){
    const k = rand(S.list.length), e = S.list[k];
    const others = otherEntries(e, 1);
    const real = !others.length || Math.random() < .5;
    cur = {k, real};
    stage.querySelector('#lword').innerHTML = tilesHtml(e.w, 'sm');
    stage.querySelector('#ldef').textContent = real ? e.d : others[0].d;
  }
  function answer(yes){
    if(!cur || left <= 0) return;
    const st = stats[cur.k]; st.seen = true; answered++;
    const now = performance.now(), secs = (now - (S.lastAward || now)) / 1000; S.lastAward = now;
    if(yes === cur.real){ st.right++; S.streak++; S.score += Math.round((40 + 60 * clamp(1 - secs / 3, 0, 1)) * (1 + Math.min(S.streak, 10) * .1)); S.times.push(secs); sfx('ding'); }
    else { st.wrong++; S.streak = 0; sfx('buzz'); shake(stage.querySelector('#ldef')); }
    stage.querySelector('#lcount').textContent = answered + ' answered';
    renderHud(); next();
  }
  function end(){
    clearInterval(iv); S.key = null; cur = null;
    const keep = S.list.map((e, k) => ({e, st:stats[k]})).filter(o => o.st.seen);
    S.list = keep.map(o => o.e);
    S.results = keep.map(o => ({word:o.e.w, e:o.e, res: o.st.wrong === 0 ? 'perfect' : o.st.right ? 'tricky' : 'missed'}));
    finish();
  }
};

/* ---------- arcade games (canvas) ---------- */
const FONT = '"Lilita One","Arial Rounded MT Bold","Trebuchet MS",sans-serif';
function themeColors(){
  const cs = getComputedStyle(document.documentElement), g = n => cs.getPropertyValue(n).trim();
  return {card:g('--card'), bg:g('--bg'), ink:g('--ink'), muted:g('--muted'), line:g('--line'), tile:g('--tile'), tileInk:g('--tile-ink'),
    coral:g('--coral'), sky:g('--sky'), leaf:g('--leaf'), grape:g('--grape'), sun:g('--sun'), berry:g('--berry'), good:g('--good'), bad:g('--bad'),
    skyTop:g('--sky-top'), skyBot:g('--sky-bot')};
}
function canvasIn(host, aspect, maxH, maxW){
  const W = Math.round(Math.min(host.clientWidth || 320, maxW || 9999));
  const H = Math.round(Math.min(maxH, W * aspect));
  const cv = document.createElement('canvas'), dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; cv.className = 'gamecv';
  host.appendChild(cv);
  const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
  return {cv, ctx, W, H};
}
function ball(ctx, x, y, r, ch, fill, ink){
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
  ctx.fillStyle = ink || '#fff'; ctx.font = `${Math.round(r * 1.15)}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(ch.toLocaleUpperCase(), x, y + r * .06);
}
function runLoop(step){
  let last = performance.now(), raf = 0, on = true;
  const f = t => { if(!on) return; const dt = Math.min(.05, Math.max(0, (t - last) / 1000)); last = t; step(dt); raf = requestAnimationFrame(f); };
  raf = requestAnimationFrame(f);
  return () => { on = false; cancelAnimationFrame(raf); };
}
const cvPoint = (cv, ev) => { const r = cv.getBoundingClientRect(); return {x: (ev.clientX - r.left) * (cv.clientWidth / r.width), y: (ev.clientY - r.top) * (cv.clientHeight / r.height)}; };

IMPL.snake = (w, e, def) => {
  const ls = letters(w), decoys = decoyLetters(ls);
  let pos = 0;
  stage.innerHTML = promptHtml(def, e, 'Steer the snake to eat the letters in order', 'Steer the snake to eat the letters of the word that means…') + `
    ${targetHtml(ls, def)}
    <div class="cvbox" id="box"></div>
    <p class="sub" id="smsg" style="margin:0">Press an arrow key, swipe on the board or tap the arrows to start. Hold to speed up.</p>
    <div class="dpad" id="dpad"><button type="button" data-d="up" aria-label="Up">▲</button><button type="button" data-d="left" aria-label="Left">◀</button><button type="button" data-d="down" aria-label="Down">▼</button><button type="button" data-d="right" aria-label="Right">▶</button></div>
    <div class="actions">${hearIf(def)}${skipBtn()}</div>`;
  const box = stage.querySelector('#box'), msg = stage.querySelector('#smsg'), target = [...stage.querySelectorAll('#target .tile')];
  const N = 13, {cv, ctx, W} = canvasIn(box, 1, 440, 440), cs = W / N, C = themeColors();
  const tick = lv(.34, .27, .21), wrap = S.level === 0;
  let boost = false, holdT = 0;
  const DIRS = {up:{x:0, y:-1}, down:{x:0, y:1}, left:{x:-1, y:0}, right:{x:1, y:0}};
  let snake, dir, nextDir, started = false, items = [], acc = 0, flash = 0;
  function reset(){ snake = [{x:4, y:6}, {x:3, y:6}, {x:2, y:6}]; dir = {x:1, y:0}; nextDir = dir; started = false; acc = 0; }
  reset();
  function setDir(d){
    const v = DIRS[d]; if(!v || S.locked) return;
    if(v.x === -dir.x && v.y === -dir.y) return;
    nextDir = v;
    if(!started){ started = true; msg.textContent = 'Eat the next letter. Hold a direction to zoom!'; }
  }
  function freeCell(){
    const cells = [];
    for(let y = 0; y < N; y++) for(let x = 0; x < N; x++)
      if(!snake.some(s => s.x === x && s.y === y) && !items.some(it => it.x === x && it.y === y) && Math.abs(x - snake[0].x) + Math.abs(y - snake[0].y) > 2) cells.push({x, y});
    return cells[rand(cells.length)];
  }
  const decoyFor = () => { const d = decoys.filter(c => c !== ls[pos]); return d[rand(d.length)] || ls[pos]; };
  function layout(){
    items = [];
    if(pos >= ls.length) return;
    const n = lv(3, 4, 6), others = shuffle(decoys.filter(c => c !== ls[pos]));
    [ls[pos], ...others.slice(0, n - 1)].forEach(ch => { const c = freeCell(); if(c) items.push({...c, ch}); });
  }
  layout();
  function step(){
    dir = nextDir;
    let hx = snake[0].x + dir.x, hy = snake[0].y + dir.y;
    if(wrap){ hx = (hx + N) % N; hy = (hy + N) % N; }
    if(hx < 0 || hy < 0 || hx >= N || hy >= N || snake.slice(0, -1).some(s => s.x === hx && s.y === hy)){
      wrong(null); flash = .4; reset(); msg.textContent = 'Crash! Press a direction to go again.'; return;
    }
    snake.unshift({x:hx, y:hy});
    const k = items.findIndex(it => it.x === hx && it.y === hy);
    if(k >= 0){
      if(items[k].ch === ls[pos]){
        sfx('pop'); reveal(target[pos], ls[pos]); pos++;
        if(pos === ls.length){ target.forEach(t => t.classList.add('good')); resolve('done'); } else layout();
        return;
      }
      wrong(null); flash = .3; items.splice(k, 1);
      const c = freeCell(); if(c) items.push({...c, ch:decoyFor()});
      snake.pop(); if(snake.length > 2) snake.pop();
      return;
    }
    snake.pop();
  }
  function draw(){
    for(let y = 0; y < N; y++) for(let x = 0; x < N; x++){ ctx.fillStyle = (x + y) % 2 ? C.card : C.bg; ctx.fillRect(x * cs, y * cs, cs, cs); }
    items.forEach(it => ball(ctx, it.x * cs + cs / 2, it.y * cs + cs / 2, cs * .44, it.ch, C.tile, C.tileInk));
    snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? C.good : C.leaf;
      const pad = i === 0 ? 1 : 3;
      ctx.beginPath(); ctx.roundRect(s.x * cs + pad, s.y * cs + pad, cs - pad * 2, cs - pad * 2, cs * .3); ctx.fill();
    });
    const h = snake[0];
    ctx.fillStyle = '#fff';
    [[-.18, -.12], [.18, -.12]].forEach(([ox, oy]) => { ctx.beginPath(); ctx.arc(h.x * cs + cs / 2 + (dir.x ? dir.x * cs * .15 : ox * cs), h.y * cs + cs / 2 + (dir.y ? dir.y * cs * .15 : oy * cs) + (dir.x ? ox * cs : 0), cs * .1, 0, Math.PI * 2); ctx.fill(); });
    if(flash > 0){ ctx.fillStyle = `rgba(217,56,79,${flash})`; ctx.fillRect(0, 0, W, W); }
    if(!started && !S.locked){ ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, W / 2 - 26, W, 52); ctx.fillStyle = '#fff'; ctx.font = `22px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Pick a direction to go!', W / 2, W / 2); }
  }
  S.stop = runLoop(dt => {
    if(started && !S.locked){ acc += dt; const tk = boost ? tick * .4 : tick; while(acc >= tk && started && !S.locked){ acc -= tk; step(); } }
    flash = Math.max(0, flash - dt); draw();
  });
  S.dbg = () => ({snake, items, need:ls[pos], N, started, cs, boost, tick});
  const stopBoost = () => { clearTimeout(holdT); boost = false; };
  const pad = stage.querySelector('#dpad');
  pad.addEventListener('pointerdown', ev => { const b = ev.target.closest('button'); if(!b) return; ev.preventDefault(); setDir(b.dataset.d); clearTimeout(holdT); holdT = setTimeout(() => boost = true, 220); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => pad.addEventListener(t, stopBoost));
  pad.addEventListener('click', ev => { if(ev.detail === 0){ const b = ev.target.closest('button'); if(b) setDir(b.dataset.d); } });
  const KEYS = {ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right', w:'up', s:'down', a:'left', d:'right'};
  S.key = ev => { const d = KEYS[ev.key] || KEYS[lower(ev.key)]; if(d){ ev.preventDefault(); if(ev.repeat) boost = true; else setDir(d); } };
  S.keyup = ev => { if(KEYS[ev.key] || KEYS[lower(ev.key)]) boost = false; };
  let sw = null;
  cv.addEventListener('pointerdown', ev => { sw = cvPoint(cv, ev); clearTimeout(holdT); holdT = setTimeout(() => { if(started) boost = true; }, 300); });
  ['pointerleave', 'pointercancel'].forEach(t => cv.addEventListener(t, stopBoost));
  cv.addEventListener('pointerup', ev => {
    const held = boost; stopBoost();
    if(!sw) return; const p = cvPoint(cv, ev), dx = p.x - sw.x, dy = p.y - sw.y; sw = null;
    if(held) return;
    if(Math.max(Math.abs(dx), Math.abs(dy)) < 12){
      const hx = snake[0].x * cs + cs / 2, hy = snake[0].y * cs + cs / 2, tx = p.x - hx, ty = p.y - hy;
      setDir(Math.abs(tx) > Math.abs(ty) ? (tx > 0 ? 'right' : 'left') : (ty > 0 ? 'down' : 'up'));
    } else setDir(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  });
  bindSkip(); bindHear(w);
};

IMPL.blaster = (w, e, def) => {
  const ls = letters(w), decoys = decoyLetters(ls);
  let pos = 0;
  stage.innerHTML = promptHtml(def, e, 'Blast the letters in spelling order', 'Blast the letters of the word that means…') + `
    ${targetHtml(ls, def)}
    <div class="cvbox" id="box"></div>
    <p class="sub" style="margin:0">Move with your mouse, finger or the arrow keys. Tap or press Space to fire.</p>
    <div class="actions">${hearIf(def)}${skipBtn()}</div>`;
  const box = stage.querySelector('#box'), target = [...stage.querySelectorAll('#target .tile')];
  const {cv, ctx, W, H} = canvasIn(box, box.clientWidth < 520 ? 1.15 : .72, 440, 680);
  const maxRocks = lv(5, 7, 9), speed = lv(32, 50, 75), C2 = themeColors();
  const stars = Array.from({length:50}, () => ({x:Math.random() * W, y:Math.random() * H, s:Math.random() * 1.6 + .4}));
  let shipX = W / 2, shots = [], rocks = [], booms = [], cool = 0;
  function spawn(initial){
    const need = ls[pos];
    const has = rocks.some(r => r.ch === need && r.y > 10 && r.y < H - 110);
    const ch = need != null && (!has || Math.random() < .25) ? need : decoys[rand(decoys.length)];
    rocks.push({x:26 + Math.random() * (W - 52), y: initial ? 26 + Math.random() * H * .5 : -26, v: speed * (.7 + Math.random() * .6), ch, r:22});
  }
  for(let i = 0; i < maxRocks; i++) spawn(true);
  S.dbg = () => ({shipX, rocks, need:ls[pos], W, H});
  function fire(){ if(S.locked || cool > 0) return; shots.push({x:shipX, y:H - 52}); cool = .18; sfx('tap'); }
  cv.addEventListener('pointermove', ev => { shipX = clamp(cvPoint(cv, ev).x, 20, W - 20); });
  cv.addEventListener('pointerdown', ev => { shipX = clamp(cvPoint(cv, ev).x, 20, W - 20); fire(); });
  S.key = ev => {
    if(ev.key === 'ArrowLeft'){ ev.preventDefault(); shipX = clamp(shipX - 28, 20, W - 20); }
    if(ev.key === 'ArrowRight'){ ev.preventDefault(); shipX = clamp(shipX + 28, 20, W - 20); }
    if(ev.key === ' ' || ev.key === 'ArrowUp'){ ev.preventDefault(); fire(); }
  };
  S.stop = runLoop(dt => {
    cool = Math.max(0, cool - dt);
    shots.forEach(s => s.y -= 560 * dt);
    rocks.forEach(r => r.y += r.v * dt);
    if(!S.locked) for(const s of shots){
      const r = rocks.find(r => Math.hypot(r.x - s.x, r.y - s.y) < r.r + 4);
      if(!r) continue;
      s.dead = true; r.dead = true;
      if(r.ch === ls[pos]){
        booms.push({x:r.x, y:r.y, t:0, good:true}); sfx('pop'); reveal(target[pos], ls[pos]); pos++;
        if(pos === ls.length){ target.forEach(t => t.classList.add('good')); resolve('done'); break; }
      } else { booms.push({x:r.x, y:r.y, t:0, good:false}); wrong(null); }
    }
    shots = shots.filter(s => !s.dead && s.y > -10);
    rocks = rocks.filter(r => !r.dead && r.y < H + 30);
    while(rocks.length < maxRocks && pos < ls.length) spawn(false);
    booms.forEach(b => b.t += dt); booms = booms.filter(b => b.t < .4);
    ctx.fillStyle = '#0E1A2B'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,.7)'; stars.forEach(st => { st.y = (st.y + st.s * 20 * dt) % H; ctx.fillRect(st.x, st.y, st.s, st.s); });
    rocks.forEach(r => ball(ctx, r.x, r.y, r.r, r.ch, '#5C6E80', '#fff'));
    ctx.fillStyle = C2.sun; shots.forEach(s => ctx.fillRect(s.x - 2, s.y - 10, 4, 14));
    booms.forEach(b => { ctx.strokeStyle = b.good ? C2.good : C2.bad; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(b.x, b.y, 10 + b.t * 90, 0, Math.PI * 2); ctx.stroke(); });
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(shipX, H - 54); ctx.lineTo(shipX + 18, H - 16); ctx.lineTo(shipX - 18, H - 16); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C2.coral; ctx.fillRect(shipX - 6, H - 16, 12, 6 + Math.random() * 6);
  });
  bindSkip(); bindHear(w);
};

IMPL.hopper = (w, e, def) => {
  const ls = letters(w), decoys = decoyLetters(ls);
  let pos = 0;
  stage.innerHTML = promptHtml(def, e, 'Fly through the gap with the next letter', 'Fly through the letters of the word that means…') + `
    ${targetHtml(ls, def)}
    <div class="cvbox" id="box"></div>
    <p class="sub" style="margin:0">Tap the sky, click or press Space to flap.</p>
    <div class="actions">${hearIf(def)}${skipBtn()}</div>`;
  const box = stage.querySelector('#box'), target = [...stage.querySelectorAll('#target .tile')];
  const {cv, ctx, W, H} = canvasIn(box, box.clientWidth < 520 ? 1.1 : .62, 420, 720), C = themeColors();
  const g = lv(850, 1050, 1250), jump = lv(320, 350, 380), sp = lv(115, 145, 180), gap = H * lv(.27, .23, .2), CW = 54;
  const centers = [H * .2, H * .5, H * .8];
  const bird = {x:W * .25, y:H / 2, vy:0, r:14};
  let cols = [], started = false, flash = 0;
  const labelsFor = () => { const need = ls[pos], o = shuffle(decoys.filter(c => c !== need)).slice(0, 2); return shuffle([need, ...o]); };
  function spawn(x){ cols.push({x, labels:labelsFor(), passed:false}); }
  spawn(W + 40);
  function flap(){ if(S.locked) return; started = true; bird.vy = -jump; }
  S.dbg = () => ({bird, cols, centers, gap, need:ls[pos], W, H, CW, sp});
  cv.addEventListener('pointerdown', ev => { ev.preventDefault(); flap(); });
  S.key = ev => { if(ev.key === ' ' || ev.key === 'ArrowUp'){ ev.preventDefault(); flap(); } };
  S.stop = runLoop(dt => {
    if(started && !S.locked){
      bird.vy += g * dt; bird.y += bird.vy * dt;
      if(bird.y < bird.r){ bird.y = bird.r; bird.vy = 0; }
      if(bird.y > H - bird.r){ bird.y = H - bird.r; bird.vy = -jump * .7; }
      cols.forEach(c => {
        const before = c.x;
        c.x -= sp * dt;
        if(!c.passed && before + CW / 2 >= bird.x && c.x + CW / 2 < bird.x){
          c.passed = true;
          const i = centers.findIndex(cy => Math.abs(bird.y - cy) < gap / 2);
          if(i >= 0 && c.labels[i] === ls[pos]){
            c.hit = i; sfx('pop'); reveal(target[pos], ls[pos]); pos++;
            if(pos === ls.length){ target.forEach(t => t.classList.add('good')); resolve('done'); }
            else cols.filter(o => !o.passed).forEach(o => o.labels = labelsFor());
          } else { c.miss = i; flash = .35; wrong(null); }
        }
      });
      cols = cols.filter(c => c.x > -CW - 10);
      const last = cols[cols.length - 1];
      if(!last || last.x < W - Math.min(sp * lv(2.1, 1.75, 1.5), W * .62)) spawn(W + 10);
    }
    flash = Math.max(0, flash - dt);
    const grd = ctx.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, C.skyTop); grd.addColorStop(1, C.skyBot);
    ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
    cols.forEach(c => {
      ctx.fillStyle = C.leaf;
      let y = 0;
      centers.forEach(cy => { ctx.fillRect(c.x, y, CW, cy - gap / 2 - y); y = cy + gap / 2; });
      ctx.fillRect(c.x, y, CW, H - y);
      centers.forEach((cy, i) => ball(ctx, c.x + CW / 2, cy, 17, c.labels[i], c.hit === i ? C.good : c.miss === i ? C.bad : C.tile, c.hit === i || c.miss === i ? '#fff' : C.tileInk));
    });
    ctx.fillStyle = C.sun; ctx.beginPath(); ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bird.x + 5, bird.y - 4, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1b1b1b'; ctx.beginPath(); ctx.arc(bird.x + 6, bird.y - 4, 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.coral; ctx.beginPath(); ctx.moveTo(bird.x + 12, bird.y); ctx.lineTo(bird.x + 22, bird.y + 3); ctx.lineTo(bird.x + 12, bird.y + 6); ctx.fill();
    if(flash > 0){ ctx.fillStyle = `rgba(217,56,79,${flash})`; ctx.fillRect(0, 0, W, H); }
    if(!started && !S.locked){ ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, H / 2 - 24, W, 48); ctx.fillStyle = '#fff'; ctx.font = `22px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Tap to fly!', W / 2, H / 2); }
  });
  bindSkip(); bindHear(w);
};

IMPL.slice = (w, e, def) => {
  const ls = letters(w), decoys = decoyLetters(ls);
  let pos = 0;
  stage.innerHTML = promptHtml(def, e, 'Slice the letters in spelling order', 'Slice the letters of the word that means…') + `
    ${targetHtml(ls, def)}
    <div class="cvbox" id="box"></div>
    <p class="sub" style="margin:0">Swipe across a letter, or tap it, to slice it.</p>
    <div class="actions">${hearIf(def)}${skipBtn()}</div>`;
  const box = stage.querySelector('#box'), target = [...stage.querySelectorAll('#target .tile')];
  const {cv, ctx, W, H} = canvasIn(box, box.clientWidth < 520 ? 1.15 : .7, 440, 720), C = themeColors();
  const G = lv(480, 620, 780), every = lv(1, .78, .58), colors = [C.coral, C.sky, C.grape, C.berry, C.leaf];
  let items = [], bits = [], trail = [], launchT = 0, down = false, lastP = null;
  function launch(){
    const need = ls[pos];
    const has = items.some(it => it.ch === need);
    const n = 1 + rand(lv(1, 2, 2) + 1);
    for(let k = 0; k < n; k++){
      const ch = (!has && k === 0) || Math.random() < .3 ? need : decoys[rand(decoys.length)];
      const x0 = W * (.15 + .7 * Math.random());
      const vy = -Math.sqrt(2 * G * H * (.55 + Math.random() * .3));
      items.push({x:x0, y:H + 28, vx:(W / 2 - x0) * (.3 + Math.random() * .5), vy, ch, r:27, c:colors[rand(colors.length)]});
    }
  }
  S.dbg = () => ({items, need:ls[pos], W, H});
  function cut(it){
    it.dead = true;
    bits.push({x:it.x, y:it.y, vx:-60, vy:-60, c:it.c, t:0}, {x:it.x, y:it.y, vx:60, vy:-60, c:it.c, t:0});
    if(it.ch === ls[pos]){
      sfx('pop'); reveal(target[pos], ls[pos]); pos++;
      if(pos === ls.length){ target.forEach(t => t.classList.add('good')); resolve('done'); }
    } else wrong(null);
  }
  const segDist = (p, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy; let t = L2 ? ((p.x - a.x) * dx + (p.y - a.y) * dy) / L2 : 0; t = clamp(t, 0, 1); return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy)); };
  function swipe(p){
    if(S.locked) return;
    const a = lastP || p;
    items.forEach(it => { if(!it.dead && !S.locked && segDist(it, a, p) < it.r) cut(it); });
    trail.push({...p, t:0}); lastP = p;
  }
  cv.addEventListener('pointerdown', ev => { ev.preventDefault(); down = true; lastP = null; swipe(cvPoint(cv, ev)); });
  cv.addEventListener('pointermove', ev => { if(down) swipe(cvPoint(cv, ev)); });
  addEventListener('pointerup', function up(){ if(!cv.isConnected){ removeEventListener('pointerup', up); return; } down = false; lastP = null; });
  S.stop = runLoop(dt => {
    if(!S.locked && pos < ls.length){ launchT -= dt; if(launchT <= 0){ launch(); launchT = every; } }
    items.forEach(it => { it.vy += G * dt; it.x += it.vx * dt; it.y += it.vy * dt; });
    items = items.filter(it => !it.dead && !(it.vy > 0 && it.y > H + 40));
    bits.forEach(b => { b.vy += G * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.t += dt; }); bits = bits.filter(b => b.t < .8);
    trail.forEach(t => t.t += dt); trail = trail.filter(t => t.t < .18);
    const grd = ctx.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, '#2A1E3D'); grd.addColorStop(1, '#3E2C57');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
    items.forEach(it => ball(ctx, it.x, it.y, it.r, it.ch, it.c, '#fff'));
    bits.forEach(b => { ctx.fillStyle = b.c; ctx.beginPath(); ctx.arc(b.x, b.y, 14, 0, Math.PI); ctx.fill(); });
    if(trail.length > 1){ ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); trail.forEach((t, i) => i ? ctx.lineTo(t.x, t.y) : ctx.moveTo(t.x, t.y)); ctx.stroke(); }
  });
  bindSkip(); bindHear(w);
};

WHOLE.invaders = def => {
  const hearts0 = lv(5, 4, 3);
  let hearts = hearts0, queue = shuffle(S.list.map((e, k) => k)), alive = [], spawnT = .3, done = 0, over = false;
  const every = lv(3.4, 2.6, 1.9) * (def ? 1.25 : 1), maxAlive = lv(3, 4, 5), fall = lv(16, 24, 34) * (def ? .8 : 1);
  const hideAt = lv(Infinity, 3, 1.6);
  S.results = []; renderHud();
  stage.innerHTML = `<p class="prompt">${def ? 'Type the word for each meaning before it lands!' : 'Type each word before it lands!'}</p>
    <div class="hearts" id="hearts"></div>
    <div class="invfield" id="field"></div>
    <div class="typebox"><input class="answer" id="answer" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Type a word" placeholder="Type here"></div>
    <p class="sub" id="imsg" style="margin:0">${def ? 'Each falling card is a meaning.' : S.level ? 'Watch out: the letters hide as the words fall.' : 'Easy level: the words stay visible.'}</p>
    <div class="actions">${skipBtn('Stop')}</div>`;
  const field = stage.querySelector('#field'), inp = stage.querySelector('#answer'), msg = stage.querySelector('#imsg');
  const paintHearts = () => { stage.querySelector('#hearts').innerHTML = 'Lives ' + Array.from({length:hearts0}, (_, i) => `<i class="${i < hearts ? '' : 'lost'}"></i>`).join(''); };
  paintHearts();
  const mask = w => { const a = [...w]; return a.map((c, i) => !isL(c) || i === 0 || (S.level === 1 && i === a.length - 1) ? c : '•').join(''); };
  function spawn(){
    const k = queue.shift(); const e = S.list[k];
    const el = document.createElement('div');
    el.className = 'enemy' + (def ? '' : ' word');
    el.textContent = def ? e.d : e.w;
    field.appendChild(el);
    const x = Math.random() * Math.max(0, field.clientWidth - el.offsetWidth - 8) + 4;
    alive.push({k, e, el, x, y:-el.offsetHeight, age:0, masked:false});
  }
  function kill(a, res){
    alive = alive.filter(o => o !== a); done++;
    S.results[a.k] = {word:a.e.w, e:a.e, res};
    renderHud();
  }
  function end(){
    if(over) return; over = true; S.stop && S.stop();
    S.list.forEach((e, k) => { if(!S.results[k]) S.results[k] = {word:e.w, e, res:'missed'}; });
    renderHud();
    const tok = S; setTimeout(() => S === tok && finish(), 900);
  }
  inp.addEventListener('input', () => {
    if(over) return;
    const v = norm(inp.value);
    alive.forEach(a => a.el.classList.toggle('aim', !!v && norm(a.e.w).startsWith(v)));
    const a = v && alive.find(o => norm(o.e.w) === v);
    if(a){
      a.el.classList.add('boom'); a.el.classList.remove('aim'); const el = a.el; setTimeout(() => el.remove(), 320);
      award(a.k, a.slip ? 'tricky' : 'perfect', a.age); sfx('ding'); confetti(15);
      kill(a, a.slip ? 'tricky' : 'perfect');
      inp.value = ''; alive.forEach(o => o.el.classList.remove('aim'));
      msg.textContent = def ? `${a.e.w}: ${a.e.d}` : 'Zapped!';
    }
  });
  inp.addEventListener('keydown', ev => {
    if(ev.key !== 'Enter' || over) return;
    ev.preventDefault();
    if(norm(inp.value)){ S.streak = 0; sfx('buzz'); shake(inp); alive.forEach(a => { if(norm(a.e.w).startsWith(norm(inp.value).slice(0, 1))) a.slip = true; }); renderHud(); }
  });
  field.addEventListener('pointerdown', () => setTimeout(() => inp.focus(), 0));
  S.stop = runLoop(dt => {
    if(over) return;
    spawnT -= dt;
    if(spawnT <= 0 && queue.length && alive.length < maxAlive){ spawn(); spawnT = every; }
    const H = field.clientHeight;
    alive.slice().forEach(a => {
      a.y += fall * dt; a.age += dt;
      if(!def && !a.masked && a.age > hideAt){ a.masked = true; a.el.textContent = mask(a.e.w); }
      a.el.style.transform = `translate(${a.x}px, ${a.y}px)`;
      if(a.y + a.el.offsetHeight >= H - 10){
        a.el.classList.add('landed'); a.el.textContent = a.e.w; const el = a.el; setTimeout(() => el.remove(), 900);
        hearts--; S.streak = 0; sfx('miss'); paintHearts();
        kill(a, 'missed');
        msg.textContent = `Missed: ${a.e.w}`;
        if(hearts <= 0){ msg.textContent = 'Out of lives!'; end(); }
      }
    });
    if(!queue.length && !alive.length) end();
  });
  stage.querySelector('#skip').onclick = () => end();
  setTimeout(() => inp.focus(), 60);
};

/* ---------- agile arcade games ---------- */
/* Shared frame for a letter-by-letter canvas game: prompt, target tiles, canvas, hint, skip. */
function shell(w, e, def, o){
  const ls = letters(w);
  stage.innerHTML = promptHtml(def, e, o.spell, o.def) + `
    ${targetHtml(ls, def)}
    <div class="cvbox" id="box"></div>
    ${o.controls || ''}
    <p class="sub" id="gmsg" style="margin:0">${o.hint}</p>
    <div class="actions">${hearIf(def)}${skipBtn()}</div>`;
  const box = stage.querySelector('#box');
  const narrow = box.clientWidth < 520;
  const c = canvasIn(box, narrow ? (o.narrow || 1.1) : (o.wide || .62), o.maxH || 420, o.maxW || 720);
  const target = [...stage.querySelectorAll('#target .tile')];
  const g = {ls, pos:0, decoys:decoyLetters(ls), target, C:themeColors(), flash:0, cv:c.cv, ctx:c.ctx, W:c.W, H:c.H,
    get need(){ return this.pos < ls.length ? ls[this.pos] : null; },
    msg(t){ const m = stage.querySelector('#gmsg'); if(m) m.textContent = t; },
    pick(n){ const need = this.need; return shuffle([need, ...shuffle(this.decoys.filter(x => x !== need)).slice(0, n - 1)]); },
    decoy(){ const d = this.decoys.filter(x => x !== this.need); return d[rand(d.length)] || this.need; },
    hit(){
      sfx('pop'); reveal(target[this.pos], ls[this.pos]); this.pos++;
      if(this.pos === ls.length){ target.forEach(t => t.classList.add('good')); resolve('done'); return true; }
      return false;
    },
    miss(){ this.flash = .35; wrong(null); },
    banner(t){ const {ctx, W, H} = this; ctx.fillStyle = 'rgba(0,0,0,.42)'; ctx.fillRect(0, H / 2 - 24, W, 48); ctx.fillStyle = '#fff'; ctx.font = `21px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, W / 2, H / 2); },
    loop(fn){ S.stop = runLoop(dt => { this.flash = Math.max(0, this.flash - dt); fn(dt); if(this.flash > 0){ this.ctx.fillStyle = `rgba(217,56,79,${this.flash})`; this.ctx.fillRect(0, 0, this.W, this.H); } }); }
  };
  bindSkip(); bindHear(w);
  return g;
}
function sky(g, top, bottom){ const grd = g.ctx.createLinearGradient(0, 0, 0, g.H); grd.addColorStop(0, top || g.C.skyTop); grd.addColorStop(1, bottom || g.C.skyBot); g.ctx.fillStyle = grd; g.ctx.fillRect(0, 0, g.W, g.H); }
function tileAt(ctx, x, y, s, ch, fill, ink, edge){
  ctx.fillStyle = edge || 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.roundRect(x, y + 3, s, s - 2, 6); ctx.fill();
  ctx.fillStyle = fill; ctx.beginPath(); ctx.roundRect(x, y, s, s - 3, 6); ctx.fill();
  if(ch){ ctx.fillStyle = ink; ctx.font = `${Math.round(s * .58)}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ch.toLocaleUpperCase(), x + s / 2, y + s / 2); }
}
function chick(ctx, x, y, r, t){
  ctx.fillStyle = '#FFE27A'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#F4C430'; ctx.beginPath(); ctx.ellipse(x - r * .3, y + r * .2, r * .45, r * .3, Math.sin((t || 0) * 12) * .4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1b1b1b'; ctx.beginPath(); ctx.arc(x + r * .35, y - r * .25, r * .14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FF6A48'; ctx.beginPath(); ctx.moveTo(x + r * .8, y - r * .05); ctx.lineTo(x + r * 1.35, y + r * .12); ctx.lineTo(x + r * .8, y + r * .3); ctx.fill();
}
const choiceRow = id => `<div class="choices" id="${id}"></div>`;

IMPL.stack = (w, e, def) => {
  const g = shell(w, e, def, {spell:'Tap the letters to stack the whole word under the chick', def:'Stack the letters of the word that means…',
    hint:'Spell the word to build your tower, then the walls knock the tiles off. Hold the game, Space or → to zoom.', controls:choiceRow('ch'), narrow:1, wide:.5, maxH:360});
  const {ctx, W, H, C} = g;
  const T = Math.min(34, Math.floor(H / Math.max(9, g.ls.length + 3))), ground = H - 22, cx = Math.round(W * .3), speed = lv(75, 100, 125), nCh = lv(2, 3, 4);
  let stack = [], walls = [], opts = [], started = false, t = 0, fast = false, spelled = false;
  const clouds = Array.from({length:4}, () => ({x:Math.random() * W, y:14 + Math.random() * H * .25}));
  const chEl = stage.querySelector('#ch');
  function renderChoices(){ opts = g.need ? g.pick(nCh) : []; chEl.innerHTML = opts.map((c, k) => `<button class="tile choice" type="button" data-k="${k}">${esc(c)}</button>`).join(''); }
  function lay(k){
    if(S.locked || spelled || !opts[k]) return;
    if(!started){ started = true; g.msg('Keep stacking! Each wall knocks tiles off your tower.'); }
    if(opts[k] !== g.need){ g.miss(); shake(chEl.children[k]); return; }
    stack.push(g.need); sfx('pop'); reveal(g.target[g.pos], g.ls[g.pos]); g.pos++;
    if(g.pos === g.ls.length){
      spelled = true; S.answerAt = performance.now(); chEl.innerHTML = '';
      g.target.forEach(x => x.classList.add('good'));
      g.msg('Word spelled! Hold the game, Space or → to zoom through the walls.');
    } else renderChoices();
  }
  chEl.onclick = ev => { const b = ev.target.closest('.choice'); if(b) lay(+b.dataset.k); };
  S.key = ev => {
    if(ev.key === ' ' || ev.key === 'ArrowRight'){ ev.preventDefault(); if(started) fast = true; return; }
    const k = opts.indexOf(lower(ev.key)); if(k >= 0) lay(k); else if(/^[1-4]$/.test(ev.key)) lay(+ev.key - 1);
  };
  S.keyup = ev => { if(ev.key === ' ' || ev.key === 'ArrowRight') fast = false; };
  g.cv.addEventListener('pointerdown', ev => { ev.preventDefault(); if(started) fast = true; });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(tp => g.cv.addEventListener(tp, () => fast = false));
  function addWall(x){
    const owed = walls.filter(wl => !wl.passed).reduce((a, wl) => a + wl.h, 0);
    const left = g.ls.length - g.pos + stack.length - owed;
    if(left <= 0) return false;
    walls.push({x, h:clamp(1 + rand(lv(2, 3, 3)), 1, left), passed:false});
    return true;
  }
  addWall(W + 30);
  renderChoices();
  g.loop(dt => {
    t += dt;
    if(started && !S.locked){
      const v = speed * (fast ? 3.2 : 1);
      walls.forEach(wl => wl.x -= v * dt);
      clouds.forEach(c => { c.x -= v * .3 * dt; if(c.x < -70) c.x = W + 40; });
      walls.forEach(wl => {
        if(!wl.passed && wl.x <= cx + T / 2){
          wl.passed = true;
          if(stack.length >= wl.h){ wl.kept = stack.splice(0, wl.h); sfx('tap'); }
          else { wl.bonk = true; g.miss(); g.msg('Bonk! Tap letters faster to stack before the wall.'); }
        }
      });
      walls = walls.filter(wl => wl.x > -T * 2);
      const last = walls[walls.length - 1];
      if(!last || last.x < W - lv(210, 185, 165)) addWall(W + 20);
      if(spelled && !stack.length){ g.msg('All tiles knocked off!'); resolve('done'); }
    }
    sky(g);
    ctx.fillStyle = 'rgba(255,255,255,.75)'; clouds.forEach(c => { ctx.beginPath(); ctx.arc(c.x, c.y, 14, 0, 7); ctx.arc(c.x + 16, c.y + 4, 11, 0, 7); ctx.arc(c.x - 16, c.y + 4, 10, 0, 7); ctx.fill(); });
    ctx.fillStyle = C.leaf; ctx.fillRect(0, ground, W, H - ground);
    walls.forEach(wl => {
      for(let i = 0; i < wl.h; i++){ ctx.globalAlpha = wl.bonk ? .35 : 1; ctx.fillStyle = '#B5654A'; ctx.fillRect(wl.x, ground - (i + 1) * T, T, T - 2); ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.strokeRect(wl.x + .5, ground - (i + 1) * T + .5, T - 1, T - 3); }
      ctx.globalAlpha = 1;
      (wl.kept || []).forEach((ch, i) => tileAt(ctx, wl.x, ground - (wl.h + i + 1) * T, T, ch, C.tile, C.tileInk));
      if(!wl.passed){ ctx.fillStyle = '#fff'; ctx.font = `14px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText(wl.h, wl.x + T / 2, ground - wl.h * T - 8); }
    });
    stack.forEach((ch, i) => tileAt(ctx, cx - T / 2, ground - (i + 1) * T, T, ch, C.tile, C.tileInk));
    chick(ctx, cx, ground - stack.length * T - T * .45, T * .45, started ? t * (fast ? 2.5 : 1) : 0);
    if(fast && started){ ctx.fillStyle = 'rgba(255,255,255,.5)'; for(let i = 0; i < 4; i++) ctx.fillRect((W - ((t * 900 + i * 170) % (W + 60))), 30 + i * 40, 40, 2); }
    if(!started && !S.locked) g.banner('Tap a letter to start running!');
  });
  S.dbg = () => ({stack:stack.length, walls:walls.map(wl => ({x:wl.x, h:wl.h, passed:wl.passed})), need:g.need, opts, cx, started, spelled, fast});
};

IMPL.beats = (w, e, def) => {
  const lanes = lv(3, 3, 4), KEYS = 'asdf';
  const g = shell(w, e, def, {spell:'Hit the next letter as it crosses the line', def:'Hit the letters of the word that means… on the beat',
    hint:`Tap a lane, or press ${[...KEYS.slice(0, lanes)].map(k => k.toUpperCase()).join(' ')}, when the right letter crosses the yellow line.`,
    controls:`<div class="lanebtns">${Array.from({length:lanes}, (_, i) => `<button type="button" class="btn blue" data-l="${i}">${KEYS[i].toUpperCase()}</button>`).join('')}</div>`,
    narrow:1.25, wide:.75, maxH:440, maxW:520});
  const {ctx, W, H, C} = g;
  const LW = W / lanes, lineY = H - 56, speed = lv(125, 170, 220), win = 30;
  let notes = [], spawnT = .3, glow = [];
  function spawn(){
    const need = g.need, has = notes.some(n => n.ch === need && !n.done && n.y < lineY - 40);
    const lane = rand(lanes);
    if(notes.some(n => n.lane === lane && n.y < 30)) return;
    notes.push({lane, y:-28, ch: !has || Math.random() < .35 ? need : g.decoy()});
  }
  function press(l){
    if(S.locked) return;
    glow.push({l, t:0});
    const n = notes.filter(n => n.lane === l && !n.done && Math.abs(n.y - lineY) < win).sort((a, b) => Math.abs(a.y - lineY) - Math.abs(b.y - lineY))[0];
    if(!n) return;
    n.done = true;
    if(n.ch === g.need){
      n.good = true;
      if(!g.hit()){
        const up = notes.filter(o => !o.done && o.y < lineY - 50 && o.y > 0).sort((a, b) => b.y - a.y)[0];
        if(up && !notes.some(o => !o.done && o.ch === g.need && o.y < lineY - 50)) up.ch = g.need;
      }
    } else { n.bad = true; g.miss(); }
  }
  stage.querySelector('.lanebtns').addEventListener('pointerdown', ev => { const b = ev.target.closest('[data-l]'); if(b){ ev.preventDefault(); press(+b.dataset.l); } });
  g.cv.addEventListener('pointerdown', ev => press(clamp(Math.floor(cvPoint(g.cv, ev).x / LW), 0, lanes - 1)));
  S.key = ev => { const k = KEYS.indexOf(lower(ev.key)); if(k >= 0 && k < lanes) press(k); else if(/^[1-4]$/.test(ev.key) && +ev.key <= lanes) press(+ev.key - 1); };
  g.loop(dt => {
    if(!S.locked){ spawnT -= dt; if(spawnT <= 0){ spawn(); spawnT = lv(.8, .62, .48); } }
    notes.forEach(n => n.y += speed * dt);
    notes.forEach(n => { if(!n.done && n.y > lineY + win && n.ch === g.need && !S.locked){ n.done = true; n.lost = true; if(S.level === 2) g.miss(); } });
    notes = notes.filter(n => n.y < H + 30);
    glow.forEach(x => x.t += dt); glow = glow.filter(x => x.t < .2);
    ctx.fillStyle = '#1B1430'; ctx.fillRect(0, 0, W, H);
    for(let i = 1; i < lanes; i++){ ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(i * LW - 1, 0, 2, H); }
    glow.forEach(x => { ctx.fillStyle = `rgba(255,212,94,${.35 - x.t})`; ctx.fillRect(x.l * LW, 0, LW, H); });
    ctx.fillStyle = C.sun; ctx.fillRect(0, lineY - 3, W, 6);
    notes.forEach(n => { if(n.done && !n.good && !n.bad) return; ball(ctx, n.lane * LW + LW / 2, n.y, 24, n.ch, n.good ? C.good : n.bad ? C.bad : '#7B5CD6', '#fff'); });
  });
  S.dbg = () => ({notes, need:g.need, lineY, win, lanes});
};

IMPL.darts = (w, e, def) => {
  const N = lv(4, 6, 8);
  const g = shell(w, e, def, {spell:'Throw when the next letter is at the top', def:'Dart the letters of the word that means…',
    hint:'Tap the board, press Space, or use the Throw button when the right letter reaches the arrow.',
    controls:'<div class="actions"><button class="btn big" type="button" id="throw">Throw</button></div>', narrow:1, wide:.62, maxH:420, maxW:640});
  const {ctx, W, H, C} = g;
  const cx = W / 2, cy = H * .55, R = Math.min(W, H) * .38, step = Math.PI * 2 / N;
  const cols = [C.coral, C.sky, C.leaf, C.grape, C.sun, C.berry];
  let ang = 0, spd = lv(1.1, 1.7, 2.4), dir = 1, labels = [], dart = null, stuck = [], flipT = 2 + Math.random() * 2;
  const relabel = () => { labels = g.pick(N); };
  relabel();
  function throwDart(){ if(S.locked || dart) return; dart = {t:0}; sfx('tap'); }
  stage.querySelector('#throw').onclick = throwDart;
  g.cv.addEventListener('pointerdown', ev => { ev.preventDefault(); throwDart(); });
  S.key = ev => { if(ev.key === ' ' || ev.key === 'Enter' || ev.key === 'ArrowUp'){ ev.preventDefault(); throwDart(); } };
  g.loop(dt => {
    if(!S.locked){
      ang += spd * dir * dt;
      if(S.level === 2){ flipT -= dt; if(flipT <= 0){ dir *= -1; flipT = 1.5 + Math.random() * 2.5; } }
    }
    if(dart){
      dart.t += dt;
      if(dart.t >= .2){
        const s2 = Math.floor((((-Math.PI / 2 - ang) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / step);
        const ch = labels[s2];
        stuck.push({t:0, good: ch === g.need});
        dart = null;
        if(ch === g.need){ if(!g.hit()) relabel(); } else g.miss();
      }
    }
    stuck.forEach(s3 => s3.t += dt); stuck = stuck.filter(s3 => s3.t < .4);
    sky(g, '#24384A', '#1A2733');
    for(let i = 0; i < N; i++){
      const a0 = ang + i * step;
      ctx.fillStyle = cols[i % cols.length]; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, a0, a0 + step); ctx.closePath(); ctx.fill();
      const am = a0 + step / 2;
      ctx.fillStyle = '#fff'; ctx.font = `${Math.round(R * .26)}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(labels[i].toLocaleUpperCase(), cx + Math.cos(am) * R * .66, cy + Math.sin(am) * R * .66);
    }
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy, 8, 0, 7); ctx.fill();
    ctx.fillStyle = C.sun; ctx.beginPath(); ctx.moveTo(cx - 12, cy - R - 22); ctx.lineTo(cx + 12, cy - R - 22); ctx.lineTo(cx, cy - R - 4); ctx.fill();
    const dy = dart ? (H - 20) - (H - 20 - (cy - R + 14)) * (dart.t / .2) : null;
    if(dart){ ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx, dy); ctx.lineTo(cx, dy + 34); ctx.stroke(); }
    stuck.forEach(s3 => { ctx.strokeStyle = s3.good ? C.good : C.bad; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, cy - R + 14, 12 + s3.t * 60, 0, 7); ctx.stroke(); });
  });
  S.dbg = () => ({ang, labels, need:g.need, N, dart:!!dart, spd, dir});
};

IMPL.road = (w, e, def) => {
  const COLS = 7, lanesN = lv(2, 3, 4), ROWS = lanesN + 2;
  const g = shell(w, e, def, {spell:'Cross the road to the next letter', def:'Cross the road to the letters of the word that means…',
    hint:'Arrow keys, swipe, tap a side of the chick, or use the buttons. Watch out for cars!',
    controls:'<div class="dpad" id="dpad"><button type="button" data-d="up" aria-label="Up">▲</button><button type="button" data-d="left" aria-label="Left">◀</button><button type="button" data-d="down" aria-label="Down">▼</button><button type="button" data-d="right" aria-label="Right">▶</button></div>',
    narrow:ROWS / COLS, wide:ROWS / COLS, maxH:460, maxW:500});
  const {ctx, W, H, C} = g;
  const cs = W / COLS, rh = H / ROWS, pads = [1, 3, 5];
  let labels = [], player = {x:3, y:ROWS - 1}, hopT = 0;
  const lanes = Array.from({length:lanesN}, (_, i) => {
    const dir = i % 2 ? -1 : 1, v = lv(1.1, 1.6, 2.2) * (.7 + Math.random() * .6), count = lv(1, 1, 2), len = 1 + (Math.random() < .4 ? 1 : 0);
    return {dir, v, len, color:[C.coral, C.sky, C.grape, C.berry, C.sun][i % 5], cars:Array.from({length:count}, (_, k) => k * (COLS + 2) / count)};
  });
  const relabel = () => { labels = g.pick(3); };
  relabel();
  const home = () => { player = {x:3, y:ROWS - 1}; };
  function move(dx, dy){
    if(S.locked) return;
    const nx = player.x + dx, ny = player.y + dy;
    if(nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return;
    if(ny === 0){
      const k = pads.indexOf(nx);
      if(k < 0) return;
      if(labels[k] === g.need){ home(); if(!g.hit()) relabel(); }
      else { g.miss(); g.msg('Wrong letter! Back to the start.'); home(); }
      return;
    }
    player = {x:nx, y:ny}; hopT = .12; sfx('tap');
  }
  const D = {up:[0, -1], down:[0, 1], left:[-1, 0], right:[1, 0]};
  const KEYS = {ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right', w:'up', s:'down', a:'left', d:'right'};
  S.key = ev => { const d = KEYS[ev.key] || KEYS[lower(ev.key)]; if(d){ ev.preventDefault(); move(...D[d]); } };
  stage.querySelector('#dpad').addEventListener('pointerdown', ev => { const b = ev.target.closest('button'); if(b){ ev.preventDefault(); move(...D[b.dataset.d]); } });
  let sw = null;
  g.cv.addEventListener('pointerdown', ev => { sw = cvPoint(g.cv, ev); });
  g.cv.addEventListener('pointerup', ev => {
    if(!sw) return; const p = cvPoint(g.cv, ev); let dx = p.x - sw.x, dy = p.y - sw.y; sw = null;
    if(Math.max(Math.abs(dx), Math.abs(dy)) < 12){ dx = p.x - (player.x + .5) * cs; dy = p.y - (player.y + .5) * rh; }
    if(Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 1 : -1, 0); else move(0, dy > 0 ? 1 : -1);
  });
  g.loop(dt => {
    hopT = Math.max(0, hopT - dt);
    lanes.forEach(l => { l.cars = l.cars.map(x => { let nx = x + l.dir * l.v * dt; if(nx > COLS + 1) nx -= COLS + 2 + l.len; if(nx < -1 - l.len) nx += COLS + 2 + l.len; return nx; }); });
    if(!S.locked && player.y > 0 && player.y < ROWS - 1){
      const l = lanes[player.y - 1];
      if(l.cars.some(x => player.x + .8 > x && player.x + .2 < x + l.len)){ g.miss(); g.msg('Splat! Back to the start.'); home(); }
    }
    ctx.fillStyle = '#2E7D46'; ctx.fillRect(0, 0, W, rh);
    pads.forEach((x, k) => ball(ctx, (x + .5) * cs, rh / 2, Math.min(cs, rh) * .4, labels[k], C.tile, C.tileInk));
    ctx.fillStyle = '#46525D'; ctx.fillRect(0, rh, W, rh * lanesN);
    for(let i = 1; i < lanesN; i++){ ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.setLineDash([10, 10]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, rh * (i + 1)); ctx.lineTo(W, rh * (i + 1)); ctx.stroke(); }
    ctx.setLineDash([]);
    lanes.forEach((l, i) => l.cars.forEach(x => { ctx.fillStyle = l.color; ctx.beginPath(); ctx.roundRect(x * cs + 3, rh * (i + 1) + rh * .18, l.len * cs - 6, rh * .64, 8); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(x * cs + (l.dir > 0 ? l.len * cs - 16 : 8), rh * (i + 1) + rh * .3, 8, rh * .4); }));
    ctx.fillStyle = '#8E9DA8'; ctx.fillRect(0, rh * (ROWS - 1), W, rh);
    chick(ctx, (player.x + .5) * cs, (player.y + .5) * rh - hopT * 40, Math.min(cs, rh) * .32, 0);
  });
  S.dbg = () => ({player, lanes:lanes.map(l => ({cars:l.cars, len:l.len, dir:l.dir, v:l.v})), labels, pads, need:g.need, ROWS, COLS});
};

IMPL.runner = (w, e, def) => {
  const g = shell(w, e, def, {spell:'Grab the next letter: run through it or jump for it', def:'Grab the letters of the word that means…',
    hint:'Tap, click or press Space to jump. Jump over wrong letters on the ground!', narrow:.9, wide:.5, maxH:380});
  const {ctx, W, H, C} = g;
  const ground = H - 36, rx = W * .2, speed = lv(170, 220, 270), grav = 1700, jumpV = 560;
  const lowY = ground - 22, highY = ground - 104;
  let ry = ground - 18, vy = 0, items = [], spawnT = .6, t = 0, started = false;
  function spawnPair(){
    const highNeed = Math.random() < .5;
    items.push({x:W + 30, y:lowY, ch: highNeed ? g.decoy() : g.need, hi:false}, {x:W + 30, y:highY, ch: highNeed ? g.need : g.decoy(), hi:true});
  }
  function relabelAhead(){
    const ahead = items.filter(it => !it.done && it.x > rx + 40);
    const xs = [...new Set(ahead.map(it => it.x))];
    xs.forEach(x => { const pair = ahead.filter(it => it.x === x); const k = rand(pair.length); pair.forEach((it, i) => it.ch = i === k ? g.need : g.decoy()); });
  }
  function jump(){ if(S.locked) return; started = true; if(ry >= ground - 18 - .5){ vy = -jumpV; } }
  g.cv.addEventListener('pointerdown', ev => { ev.preventDefault(); jump(); });
  S.key = ev => { if(ev.key === ' ' || ev.key === 'ArrowUp' || lower(ev.key) === 'w'){ ev.preventDefault(); jump(); } };
  g.loop(dt => {
    if(started && !S.locked){
      t += dt;
      vy += grav * dt; ry += vy * dt; if(ry > ground - 18){ ry = ground - 18; vy = 0; }
      spawnT -= dt; if(spawnT <= 0){ spawnPair(); spawnT = lv(1.5, 1.2, .95); }
      items.forEach(it => it.x -= speed * dt);
      for(const it of items){
        if(it.done || S.locked) continue;
        if(Math.abs(it.x - rx) < 26 && Math.abs(it.y - ry) < 30){
          it.done = true;
          if(it.ch === g.need){ it.good = true; if(!g.hit()) relabelAhead(); } else { it.bad = true; g.miss(); }
        }
      }
      items = items.filter(it => it.x > -30);
    }
    sky(g);
    ctx.fillStyle = C.leaf; ctx.fillRect(0, ground, W, H - ground);
    ctx.fillStyle = 'rgba(0,0,0,.12)'; for(let x = -((t * speed) % 40); x < W; x += 40) ctx.fillRect(x, ground + 10, 20, 4);
    items.forEach(it => { if(it.done) return; ball(ctx, it.x, it.y, 20, it.ch, it.hi ? C.sky : C.coral, '#fff'); });
    const legs = started && ry >= ground - 18.5 ? Math.sin(t * 18) * 8 : 4;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(rx - 4, ry + 8); ctx.lineTo(rx - 4 - legs, ry + 18); ctx.moveTo(rx + 4, ry + 8); ctx.lineTo(rx + 4 + legs, ry + 18); ctx.stroke();
    chick(ctx, rx, ry - 4, 15, t);
    if(!started && !S.locked) g.banner('Tap to start running!');
  });
  S.dbg = () => ({items, ry, rx, ground, need:g.need, started, highY, lowY, speed});
};

IMPL.jetpack = (w, e, def) => {
  const g = shell(w, e, def, {spell:'Fly into the letters in spelling order', def:'Fly into the letters of the word that means…',
    hint:'Hold the mouse, your finger or Space to fly up. Let go to drop. Avoid the wrong letters!', narrow:1.05, wide:.55, maxH:400});
  const {ctx, W, H, C} = g;
  const px = W * .2, speed = lv(140, 180, 220);
  let py = H / 2, vy = 0, thrust = false, items = [], spawnT = .4, started = false, t = 0;
  function spawn(){
    const need = g.need, has = items.some(it => it.ch === need && !it.done && it.x > px + 30);
    items.push({x:W + 26, y:30 + Math.random() * (H - 60), ch: !has || Math.random() < .3 ? need : g.decoy()});
  }
  const on = () => { if(S.locked) return; thrust = true; started = true; }, off = () => { thrust = false; };
  g.cv.addEventListener('pointerdown', ev => { ev.preventDefault(); on(); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(tp => g.cv.addEventListener(tp, off));
  S.key = ev => { if(ev.key === ' ' || ev.key === 'ArrowUp'){ ev.preventDefault(); on(); } };
  S.keyup = ev => { if(ev.key === ' ' || ev.key === 'ArrowUp') off(); };
  g.loop(dt => {
    t += dt;
    if(started && !S.locked){
      vy += (thrust ? -lv(1150, 1250, 1350) : 900) * dt; vy = clamp(vy, -420, 420); py += vy * dt;
      if(py < 18){ py = 18; vy = 0; } if(py > H - 18){ py = H - 18; vy = 0; }
      spawnT -= dt; if(spawnT <= 0){ spawn(); spawnT = lv(.7, .55, .42); }
      items.forEach(it => it.x -= speed * dt);
      for(const it of items){
        if(it.done || S.locked) continue;
        if(Math.hypot(it.x - px, it.y - py) < 36){
          it.done = true;
          if(it.ch === g.need){
            if(!g.hit() && !items.some(o => !o.done && o.ch === g.need && o.x > px + 60)){
              const ahead = items.filter(o => !o.done && o.x > px + 80).sort((a, b) => a.x - b.x)[0];
              if(ahead) ahead.ch = g.need;
            }
          } else g.miss();
        }
      }
      items = items.filter(it => it.x > -30 && !it.done);
    }
    sky(g, '#1E3B5C', '#3E6E99');
    items.forEach(it => ball(ctx, it.x, it.y, 20, it.ch, C.tile, C.tileInk));
    if(thrust && started){ ctx.fillStyle = C.coral; ctx.beginPath(); ctx.moveTo(px - 16, py + 10); ctx.lineTo(px - 10, py + 26 + Math.random() * 10); ctx.lineTo(px - 4, py + 10); ctx.fill(); }
    ctx.fillStyle = '#9FB3BB'; ctx.fillRect(px - 18, py - 10, 10, 22);
    chick(ctx, px, py, 15, t);
    if(!started && !S.locked) g.banner('Hold to fly!');
  });
  S.dbg = () => ({items, py, px, vy, thrust, need:g.need, H, started});
};

IMPL.claw = (w, e, def) => {
  const n = lv(4, 5, 6);
  const g = shell(w, e, def, {spell:'Drop the claw on the next letter', def:'Grab the letters of the word that means…',
    hint:'Tap, click, press Space or use the Drop button when the claw is above the right letter.',
    controls:'<div class="actions"><button class="btn big" type="button" id="drop">Drop</button></div>', narrow:1, wide:.6, maxH:400, maxW:640});
  const {ctx, W, H, C} = g;
  const top = 26, floor = H - 40, R = Math.min(26, W / (n * 2.6));
  let clawX = W / 2, dir = 1, state = 'move', depth = top, grabbed = null, prizes = [];
  const speed = lv(170, 220, 270), slide = S.level === 2 ? 30 : 0;
  function layout(){ const labels = g.pick(n); prizes = labels.map((ch, i) => ({x:(i + .5) * W / n, ch})); }
  layout();
  function drop(){ if(S.locked || state !== 'move') return; state = 'down'; sfx('tap'); }
  stage.querySelector('#drop').onclick = drop;
  g.cv.addEventListener('pointerdown', ev => { ev.preventDefault(); drop(); });
  S.key = ev => { if(ev.key === ' ' || ev.key === 'Enter' || ev.key === 'ArrowDown'){ ev.preventDefault(); drop(); } };
  g.loop(dt => {
    if(!S.locked){
      if(state === 'move'){ clawX += dir * speed * dt; if(clawX > W - 20){ clawX = W - 20; dir = -1; } if(clawX < 20){ clawX = 20; dir = 1; } }
      if(slide) prizes.forEach(p => { if(p !== grabbed){ p.x += slide * dt; if(p.x > W + R) p.x -= W + 2 * R; } });
      if(state === 'down'){ depth += 950 * dt; if(depth >= floor - R){ depth = floor - R; grabbed = prizes.find(p => Math.abs(p.x - clawX) < R + 4) || null; state = 'up'; } }
      if(state === 'up'){
        depth -= 850 * dt;
        if(grabbed) grabbed.x = clawX;
        if(depth <= top){
          depth = top; state = 'move';
          if(grabbed){
            const ch = grabbed.ch; grabbed = null;
            if(ch === g.need){ if(!g.hit()) layout(); }
            else { g.miss(); layout(); }
          }
        }
      }
    }
    ctx.fillStyle = '#2A2140'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fillRect(10, 10, W - 20, H - 20);
    ctx.fillStyle = '#4A3A6E'; ctx.fillRect(0, floor + R - 4, W, H - floor - R + 4);
    ctx.fillStyle = '#9FB3BB'; ctx.fillRect(0, top - 14, W, 6);
    prizes.forEach(p => { const py = p === grabbed ? depth + R + 6 : floor; ball(ctx, p.x, py, R, p.ch, C.tile, C.tileInk); });
    ctx.strokeStyle = '#D7E0E5'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(clawX, top - 10); ctx.lineTo(clawX, depth); ctx.stroke();
    ctx.lineWidth = 5; ctx.lineCap = 'round'; const open = state === 'down' ? 1 : .55;
    ctx.beginPath(); ctx.moveTo(clawX, depth); ctx.lineTo(clawX - 16 * open - 4, depth + 14); ctx.lineTo(clawX - 8, depth + 26); ctx.moveTo(clawX, depth); ctx.lineTo(clawX + 16 * open + 4, depth + 14); ctx.lineTo(clawX + 8, depth + 26); ctx.stroke();
  });
  S.dbg = () => ({clawX, state, prizes, need:g.need, R, dir, speed});
};

IMPL.penalty = (w, e, def) => {
  const g = shell(w, e, def, {spell:'Shoot at the next letter and beat the goalie', def:'Score the letters of the word that means…',
    hint:'Tap a letter in the goal, or press 1, 2 or 3. Shoot when the goalie is away!', narrow:.95, wide:.55, maxH:400, maxW:680});
  const {ctx, W, H, C} = g;
  const gx = W * .1, gw = W * .8, gy = H * .1, gh = H * .42, kw = gw * lv(.2, .25, .3);
  const targets = [gx + gw * .17, gx + gw * .5, gx + gw * .83], ty = gy + gh * .55;
  let labels = [], keeper = gx + gw / 2, kdir = 1, ball2 = null, note = null;
  const kspeed = gw * lv(.45, .7, 1);
  const relabel = () => { labels = g.pick(3); };
  relabel();
  function shoot(k){ if(S.locked || ball2) return; ball2 = {k, t:0}; sfx('tap'); }
  g.cv.addEventListener('pointerdown', ev => { const p = cvPoint(g.cv, ev); let best = 0; targets.forEach((x, i) => { if(Math.abs(p.x - x) < Math.abs(p.x - targets[best])) best = i; }); shoot(best); });
  S.key = ev => { if(/^[1-3]$/.test(ev.key)) shoot(+ev.key - 1); if(ev.key === 'ArrowLeft') shoot(0); if(ev.key === 'ArrowUp') shoot(1); if(ev.key === 'ArrowRight') shoot(2); const k = labels.indexOf(lower(ev.key)); if(k >= 0) shoot(k); };
  g.loop(dt => {
    if(!S.locked){ keeper += kdir * kspeed * dt; if(keeper > gx + gw - kw / 2){ keeper = gx + gw - kw / 2; kdir = -1; } if(keeper < gx + kw / 2){ keeper = gx + kw / 2; kdir = 1; } if(Math.random() < dt * .6) kdir *= -1; }
    if(ball2){
      ball2.t += dt;
      if(ball2.t >= .35){
        const k = ball2.k; ball2 = null;
        if(Math.abs(keeper - targets[k]) < kw / 2 + 14){ note = {txt:'Saved!', t:0}; sfx('miss'); S.streak = 0; renderHud(); }
        else if(labels[k] === g.need){ note = {txt:'Goal!', t:0}; if(!g.hit()) relabel(); }
        else { note = {txt:'Wrong letter', t:0}; g.miss(); }
      }
    }
    if(note){ note.t += dt; if(note.t > .8) note = null; }
    ctx.fillStyle = '#2E8B4F'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,.08)'; for(let x = 0; x < W; x += 60) ctx.fillRect(x, 0, 30, H);
    ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(gx, gy, gw, gh);
    ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 1; for(let x = gx; x < gx + gw; x += 14){ ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x, gy + gh); ctx.stroke(); }
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(gx, gy + gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.lineTo(gx + gw, gy + gh); ctx.stroke();
    ctx.fillStyle = C.coral; ctx.beginPath(); ctx.roundRect(keeper - kw / 2, gy + gh * .25, kw, gh * .7, 10); ctx.fill();
    ctx.fillStyle = '#FFD9B8'; ctx.beginPath(); ctx.arc(keeper, gy + gh * .18, 13, 0, 7); ctx.fill();
    targets.forEach((x, i) => { const blocked = Math.abs(keeper - x) < kw / 2 + 14; ctx.globalAlpha = blocked ? .55 : 1; ball(ctx, x, ty, 22, labels[i], C.tile, C.tileInk); ctx.globalAlpha = 1; });
    const bx0 = W / 2, by0 = H - 34;
    const bp = ball2 ? {x:bx0 + (targets[ball2.k] - bx0) * ball2.t / .35, y:by0 + (ty - by0) * ball2.t / .35, r:14 - 6 * ball2.t / .35} : {x:bx0, y:by0, r:14};
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bp.x, bp.y, bp.r, 0, 7); ctx.fill(); ctx.strokeStyle = '#1b1b1b'; ctx.lineWidth = 2; ctx.stroke();
    if(note){ ctx.fillStyle = '#fff'; ctx.font = `28px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText(note.txt, W / 2, gy + gh + 50); }
  });
  S.dbg = () => ({keeper, kw, targets, labels, need:g.need, busy:!!ball2});
};

IMPL.hoops = (w, e, def) => {
  const g = shell(w, e, def, {spell:'Shoot through the hoop with the next letter', def:'Shoot the letters of the word that means…',
    hint:'Move with your mouse, finger or arrow keys. Tap or press Space to shoot.', narrow:1.1, wide:.6, maxH:420, maxW:680});
  const {ctx, W, H, C} = g;
  const hy = H * .22, hw = 60, n = lv(2, 3, 3);
  let hoops = [], bx = W / 2, shot = null, note = null;
  function layout(){ const labels = g.pick(n); hoops = labels.map((ch, i) => ({x:(i + .5) * W / n, v:(Math.random() < .5 ? -1 : 1) * lv(45, 75, 110) * (.7 + Math.random() * .6), ch})); }
  layout();
  function fire(){ if(S.locked || shot) return; shot = {x:bx, y:H - 40}; sfx('tap'); }
  g.cv.addEventListener('pointermove', ev => { if(!shot) bx = clamp(cvPoint(g.cv, ev).x, 20, W - 20); });
  g.cv.addEventListener('pointerdown', ev => { if(!shot) bx = clamp(cvPoint(g.cv, ev).x, 20, W - 20); fire(); });
  S.key = ev => {
    if(ev.key === 'ArrowLeft'){ ev.preventDefault(); if(!shot) bx = clamp(bx - 30, 20, W - 20); }
    if(ev.key === 'ArrowRight'){ ev.preventDefault(); if(!shot) bx = clamp(bx + 30, 20, W - 20); }
    if(ev.key === ' ' || ev.key === 'ArrowUp'){ ev.preventDefault(); fire(); }
  };
  g.loop(dt => {
    if(!S.locked) hoops.forEach(h => { h.x += h.v * dt; if(h.x > W - hw / 2){ h.x = W - hw / 2; h.v *= -1; } if(h.x < hw / 2){ h.x = hw / 2; h.v *= -1; } });
    if(shot){
      shot.y -= 620 * dt;
      if(shot.y <= hy){
        const h = hoops.find(h => Math.abs(h.x - shot.x) < hw / 2 - 6);
        shot = null;
        if(h){ if(h.ch === g.need){ note = {txt:'Swish!', t:0}; if(!g.hit()) layout(); } else { note = {txt:'Wrong hoop', t:0}; g.miss(); } }
        else note = {txt:'Missed the hoop', t:0};
      }
    }
    if(note){ note.t += dt; if(note.t > .7) note = null; }
    ctx.fillStyle = '#3B2A50'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#C9864B'; ctx.fillRect(0, H - 60, W, 60);
    hoops.forEach(h => {
      ctx.fillStyle = '#fff'; ctx.fillRect(h.x - 34, hy - 52, 68, 44);
      ctx.fillStyle = C.tileInk; ctx.font = `26px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(h.ch.toLocaleUpperCase(), h.x, hy - 30);
      ctx.strokeStyle = C.coral; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(h.x, hy, hw / 2, 7, 0, 0, 7); ctx.stroke();
    });
    const by = shot ? shot.y : H - 40, bxx = shot ? shot.x : bx;
    ctx.fillStyle = '#F4A51C'; ctx.beginPath(); ctx.arc(bxx, by, 15, 0, 7); ctx.fill(); ctx.strokeStyle = '#7A4A10'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bxx - 15, by); ctx.lineTo(bxx + 15, by); ctx.stroke();
    if(!shot){ ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.setLineDash([6, 8]); ctx.beginPath(); ctx.moveTo(bx, H - 58); ctx.lineTo(bx, hy + 10); ctx.stroke(); ctx.setLineDash([]); }
    if(note){ ctx.fillStyle = '#fff'; ctx.font = `24px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText(note.txt, W / 2, H * .55); }
  });
  S.dbg = () => ({hoops, bx, busy:!!shot, need:g.need, hw});
};

IMPL.launcher = (w, e, def) => {
  const g = shell(w, e, def, {spell:'Fling the ball at the next letter crate', def:'Hit the letter crates of the word that means…',
    hint:'Drag back from anywhere on the field (you can drag outside it too), aim, and let go to launch.', narrow:.95, wide:.55, maxH:400, maxW:720});
  const {ctx, W, H, C} = g;
  const sx = Math.max(54, W * .12), sy = H - 80, k = 6.4, grav = 620, CR = Math.min(26, W * .045), MAXPULL = 150;
  let crates = [], pull = null, shot = null, note = null, t = 0;
  function layout(){
    const labels = g.pick(lv(2, 3, 4));
    crates = labels.map((ch, i) => ({ch, x:W * (.5 + .45 * (i + .5) / labels.length), y:H * (.3 + Math.random() * .45), bob:S.level === 2 ? Math.random() * 6 : 0}));
  }
  layout();
  const start = p => { if(S.locked || shot) return; pull = {x:p.x, y:p.y, cx:p.x, cy:p.y}; };
  g.cv.addEventListener('pointerdown', ev => { ev.preventDefault(); try{ g.cv.setPointerCapture(ev.pointerId); }catch(err){} start(cvPoint(g.cv, ev)); });
  addEventListener('pointermove', function mv(ev){ if(!g.cv.isConnected){ removeEventListener('pointermove', mv); return; } if(pull){ const p = cvPoint(g.cv, ev); pull.cx = p.x; pull.cy = p.y; } });
  addEventListener('pointerup', function up(){
    if(!g.cv.isConnected){ removeEventListener('pointerup', up); return; }
    if(!pull) return;
    let dx = pull.x - pull.cx, dy = pull.y - pull.cy; const L = Math.hypot(dx, dy); pull = null;
    if(L < 12) return;
    const m = Math.min(L, MAXPULL) / L; dx *= m; dy *= m;
    shot = {x:sx, y:sy, vx:dx * k, vy:dy * k}; sfx('whoosh');
  });
  g.loop(dt => {
    t += dt;
    crates.forEach(c => { if(c.bob) c.y += Math.sin(t * 2 + c.bob) * 18 * dt; });
    if(shot && !S.locked){
      shot.vy += grav * dt; shot.x += shot.vx * dt; shot.y += shot.vy * dt;
      const c = crates.find(c => Math.abs(shot.x - c.x) < CR + 10 && Math.abs(shot.y - c.y) < CR + 10);
      if(c){ shot = null; if(c.ch === g.need){ note = {txt:'Smash!', t:0}; if(!g.hit()) layout(); } else { note = {txt:'Wrong crate', t:0}; g.miss(); } }
      else if(shot.x > W + 30 || shot.y > H + 30 || shot.x < -30){ shot = null; note = {txt:'Missed', t:0}; }
    }
    if(note){ note.t += dt; if(note.t > .7) note = null; }
    sky(g);
    ctx.fillStyle = C.leaf; ctx.fillRect(0, H - 30, W, 30);
    crates.forEach(c => { ctx.fillStyle = '#8B5A2B'; ctx.fillRect(c.x - 3, c.y + CR, 6, H - 30 - c.y - CR); tileAt(ctx, c.x - CR, c.y - CR, CR * 2, c.ch, C.tile, C.tileInk); });
    ctx.strokeStyle = '#7A5233'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(sx, H - 30); ctx.lineTo(sx, sy + 20); ctx.lineTo(sx - 16, sy - 10); ctx.moveTo(sx, sy + 20); ctx.lineTo(sx + 16, sy - 10); ctx.stroke();
    let bxp = sx, byp = sy;
    if(pull){
      let dx = pull.x - pull.cx, dy = pull.y - pull.cy; const L = Math.hypot(dx, dy) || 1; const m = Math.min(L, MAXPULL) / L; dx *= m; dy *= m;
      bxp = sx - dx * .4; byp = sy - dy * .4;
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      let px = sx, py = sy, vx = dx * k, vy = dy * k;
      for(let i = 0; i < lv(14, 8, 4); i++){ for(let j = 0; j < 4; j++){ vy += grav * .016; px += vx * .016; py += vy * .016; } ctx.beginPath(); ctx.arc(px, py, 3, 0, 7); ctx.fill(); }
      ctx.strokeStyle = '#4A2E18'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx - 16, sy - 10); ctx.lineTo(bxp, byp); ctx.lineTo(sx + 16, sy - 10); ctx.stroke();
    }
    if(shot){ bxp = shot.x; byp = shot.y; }
    ctx.fillStyle = C.coral; ctx.beginPath(); ctx.arc(bxp, byp, 11, 0, 7); ctx.fill();
    if(note){ ctx.fillStyle = '#fff'; ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 4; ctx.font = `26px ${FONT}`; ctx.textAlign = 'center'; ctx.strokeText(note.txt, W / 2, 40); ctx.fillText(note.txt, W / 2, 40); }
  });
  S.dbg = () => ({crates, sx, sy, k, grav, CR, busy:!!shot, need:g.need, MAXPULL, pulling:!!pull});
};

WHOLE.typerace = def => {
  const total = S.list.length, botSpeed = lv(1 / 7, 1 / 5, 1 / 3.4) * (def ? .7 : 1);
  const bots = [{name:'Zippy', c:'var(--sky)'}, {name:'Turbo', c:'var(--grape)'}, {name:'Dash', c:'var(--leaf)'}].map(b => ({...b, d:0, v:botSpeed * (.8 + Math.random() * .4), done:null}));
  let i = 0, started = performance.now(), wordStart = performance.now(), slipped = false, ok = true, over = false, hideT = null;
  S.results = []; renderHud();
  stage.innerHTML = `<p class="prompt">${def ? 'Type the word for each meaning to race ahead!' : 'Type each word to race ahead!'}</p>
    <div class="track" id="track">
      <div class="tlane you"><span class="tname">You</span><span class="rcar" style="--cc:var(--coral)"></span><i class="flag"></i></div>
      ${bots.map(b => `<div class="tlane"><span class="tname">${b.name}</span><span class="rcar" style="--cc:${b.c}"></span><i class="flag"></i></div>`).join('')}
    </div>
    <div id="tword"></div>
    <div class="typebox"><input class="answer" id="answer" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Type the word" placeholder="Type here"></div>
    <p class="sub" id="tmsg" style="margin:0">Word 1 of ${total}</p>
    <div class="actions">${skipBtn('Skip word')}</div>`;
  const cars = [...stage.querySelectorAll('.rcar')], inp = stage.querySelector('#answer'), wordEl = stage.querySelector('#tword'), msg = stage.querySelector('#tmsg');
  function showWord(){
    clearTimeout(hideT);
    const e = S.list[i];
    wordEl.innerHTML = def ? `<div class="defbox">${esc(e.d)}</div>` : `<div class="tiles">${tilesHtml(e.w)}</div>`;
    if(!def && S.level > 0) hideT = setTimeout(() => { if(S && wordEl.isConnected && !over) wordEl.innerHTML = `<div class="tiles">${[...e.w].map(c => c === ' ' ? '<span class="gap"></span>' : '<span class="tile slot"></span>').join('')}</div>`; }, S.level === 1 ? 2500 : 1300);
    msg.textContent = `Word ${i + 1} of ${total}`;
    wordStart = performance.now(); slipped = false; ok = true;
  }
  function advance(res){
    award(i, res, (performance.now() - wordStart) / 1000);
    S.results[i] = {word:S.list[i].w, e:S.list[i], res};
    renderHud();
    i++; inp.value = '';
    if(i >= total){ finishRace(); return; }
    showWord();
  }
  function finishRace(){
    over = true; clearTimeout(hideT); inp.disabled = true;
    const myTime = (performance.now() - started) / 1000;
    const place = 1 + bots.filter(b => b.done != null && b.done < myTime).length;
    const names = ['1st', '2nd', '3rd', '4th'];
    if(place === 1){ S.score += 150; confetti(160); sfx('fanfare'); }
    renderHud();
    wordEl.innerHTML = `<p class="prompt">You finished ${names[place - 1]}!${place === 1 ? ' +150 bonus points' : ''}</p>`;
    msg.textContent = `Time: ${myTime.toFixed(1)}s`;
    const tok = S; setTimeout(() => S === tok && finish(), 1600);
  }
  inp.addEventListener('input', () => {
    if(over) return;
    const goal = norm(S.list[i].w), v = norm(inp.value), nowOk = goal.startsWith(v);
    inp.classList.toggle('off', !nowOk);
    if(!nowOk && ok){ slipped = true; S.streak = 0; sfx('buzz'); renderHud(); }
    ok = nowOk;
    if(v === goal){ sfx('ding'); advance(slipped ? 'tricky' : 'perfect'); }
  });
  stage.querySelector('#skip').onclick = () => { if(!over){ advance('missed'); } };
  S.stop = runLoop(dt => {
    const now = (performance.now() - started) / 1000;
    bots.forEach(b => { if(b.done == null){ b.d += b.v * dt; if(b.d >= total){ b.d = total; b.done = now; } } });
    const pct = d => Math.min(100, d / total * 100);
    cars[0].style.left = `calc(${pct(i)}% * .88)`;
    bots.forEach((b, k) => cars[k + 1].style.left = `calc(${pct(b.d)}% * .88)`);
  });
  showWord();
  setTimeout(() => inp.focus(), 60);
};

/* ---------- agile arcade games, set 2 ---------- */
const holdKeys = (onDown, onUp, keys) => ({
  key: ev => { if(keys[ev.key] != null){ ev.preventDefault(); onDown(keys[ev.key]); return true; } return false; },
  up: ev => { if(keys[ev.key] != null) onUp(keys[ev.key]); }
});

IMPL.jumper = (w, e, def) => {
  const g = shell(w, e, def, {spell:'Bounce onto the platform with the next letter', def:'Bounce onto the letters of the word that means…',
    hint:'Move with your mouse, finger or the arrow keys. Land on the right letters, and don’t fall!', narrow:1.3, wide:.8, maxH:470, maxW:520});
  const {ctx, W, H, C} = g;
  const grav = 1300, jump = 710, gap = 74, PW = lv(84, 74, 64);
  let px = W / 2, py = H - 60, vy = -jump, cam = 0, targetX = null, keyDir = 0, plats = [], topY = H - 20, started = false;
  function row(y, forceNeed){
    const n = 1 + rand(2), lane = W / n;
    for(let i = 0; i < n; i++){
      const p = {x:i * lane + Math.random() * (lane - PW), y, ch:null};
      if(Math.random() < .55) p.ch = Math.random() < .5 ? g.need : g.decoy();
      plats.push(p);
    }
    if(forceNeed){ const p = plats[plats.length - 1]; p.ch = g.need; }
  }
  plats.push({x:W / 2 - PW / 2, y:H - 20, ch:null});
  while(topY > -H){ topY -= gap; row(topY, false); }
  function ensureNeed(){
    const ahead = plats.filter(p => p.y < py - 30 && p.y > cam - H * .2 && p.ch === g.need && !p.used);
    if(!ahead.length){ const c = plats.filter(p => p.y < py - 40 && p.y > py - 260 && !p.used); if(c.length) c[rand(c.length)].ch = g.need; }
  }
  ensureNeed();
  g.cv.addEventListener('pointermove', ev => { targetX = cvPoint(g.cv, ev).x; if(!S.locked) started = true; });
  g.cv.addEventListener('pointerdown', ev => { targetX = cvPoint(g.cv, ev).x; started = true; });
  const hk = holdKeys(d => { keyDir = d; targetX = null; started = true; }, () => keyDir = 0, {ArrowLeft:-1, ArrowRight:1, a:-1, d:1});
  S.key = ev => hk.key(ev); S.keyup = ev => hk.up(ev);
  g.loop(dt => {
    if(started && !S.locked){
      if(keyDir) px += keyDir * 380 * dt; else if(targetX != null) px += clamp(targetX - px, -420 * dt, 420 * dt);
      if(px < -15) px = W + 15; if(px > W + 15) px = -15;
      const prev = py; vy += grav * dt; py += vy * dt;
      if(vy > 0){
        const p = plats.find(p => prev <= p.y - 14 && py >= p.y - 14 && px > p.x - 8 && px < p.x + PW + 8 && !p.broken);
        if(p){
          py = p.y - 14; vy = -jump; sfx('tap');
          if(p.ch && !p.used){
            p.used = true;
            if(p.ch === g.need){ p.good = true; if(!g.hit()){ plats.filter(o => o.ch && !o.used && o.y < py).forEach(o => o.ch = Math.random() < .5 ? g.need : g.decoy()); ensureNeed(); } }
            else { p.broken = true; g.miss(); }
          }
        }
      }
      if(py < cam + H * .4) cam = py - H * .4;
      while(topY > cam - 40){ topY -= gap; row(topY, false); }
      plats = plats.filter(p => p.y < cam + H + 40);
      if(py > cam + H + 20){
        g.miss(); g.msg('You fell! Bounce back up.');
        const p = plats.filter(p => p.y < cam + H - 40 && p.y > cam + H * .5).sort((a, b) => b.y - a.y)[0];
        if(p){ px = p.x + PW / 2; py = p.y - 14; } else { py = cam + H - 60; plats.push({x:px - PW / 2, y:cam + H - 40, ch:null}); }
        vy = -jump;
      }
      ensureNeed();
    }
    sky(g, '#1D2D4A', '#3A5A8C');
    plats.forEach(p => {
      const y = p.y - cam;
      ctx.globalAlpha = p.broken ? .3 : 1;
      ctx.fillStyle = p.good ? C.good : '#5FD07F'; ctx.beginPath(); ctx.roundRect(p.x, y, PW, 12, 6); ctx.fill();
      ctx.globalAlpha = 1;
      if(p.ch && !p.used) ball(ctx, p.x + PW / 2, y - 16, 15, p.ch, C.tile, C.tileInk);
    });
    chick(ctx, px, py - cam, 14, started ? performance.now() / 1000 : 0);
    if(!started && !S.locked) g.banner('Move to start bouncing!');
  });
  S.dbg = () => ({px, py, vy, cam, plats, need:g.need, started, PW, W});
};

IMPL.ski = (w, e, def) => {
  const g = shell(w, e, def, {spell:'Ski through the gate with the next letter', def:'Ski through the letters of the word that means…',
    hint:'Steer with your mouse, finger or the arrow keys.', narrow:1.25, wide:.75, maxH:460, maxW:540});
  const {ctx, W, H, C} = g;
  const sy = H * .22, speed = lv(120, 160, 205), gw = lv(84, 70, 58);
  let sx = W / 2, targetX = null, keyDir = 0, rows = [], spawnT = .2, trail = [], started = false;
  function spawn(){
    const n = lv(2, 3, 3), labels = g.pick(n), lane = W / n;
    rows.push({y:H + 30, gates:labels.map((ch, i) => ({x:i * lane + lane / 2 + (Math.random() - .5) * (lane - gw - 10), ch})), done:false});
  }
  g.cv.addEventListener('pointermove', ev => { targetX = cvPoint(g.cv, ev).x; if(!S.locked) started = true; });
  g.cv.addEventListener('pointerdown', ev => { targetX = cvPoint(g.cv, ev).x; started = true; });
  const hk = holdKeys(d => { keyDir = d; targetX = null; started = true; }, () => keyDir = 0, {ArrowLeft:-1, ArrowRight:1, a:-1, d:1});
  S.key = ev => hk.key(ev); S.keyup = ev => hk.up(ev);
  g.loop(dt => {
    if(started && !S.locked){
      const before = sx;
      if(keyDir) sx += keyDir * 260 * dt; else if(targetX != null) sx += clamp(targetX - sx, -300 * dt, 300 * dt);
      sx = clamp(sx, 12, W - 12);
      trail.push({x:sx, y:sy}); trail.forEach(p => p.y -= speed * dt); trail = trail.filter(p => p.y > -10);
      spawnT -= dt; if(spawnT <= 0){ spawn(); spawnT = lv(2.1, 1.7, 1.35); }
      rows.forEach(r => r.y -= speed * dt);
      rows.forEach(r => {
        if(!r.done && r.y <= sy){
          r.done = true;
          const gate = r.gates.find(gt => Math.abs(gt.x - sx) < gw / 2);
          if(gate){ r.hit = gate; if(gate.ch === g.need){ gate.good = true; if(!g.hit()) rows.filter(o => !o.done).forEach(o => { const labels = g.pick(o.gates.length); o.gates.forEach((gt, i) => gt.ch = labels[i]); }); } else { gate.bad = true; g.miss(); } }
          else if(S.level === 2){ g.miss(); g.msg('Missed the gates!'); }
        }
      });
      rows = rows.filter(r => r.y > -40);
    }
    ctx.fillStyle = '#F4F8FB'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(47,155,208,.35)'; ctx.lineWidth = 3; ctx.beginPath(); trail.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.stroke();
    rows.forEach(r => r.gates.forEach(gt => {
      const col = gt.good ? C.good : gt.bad ? C.bad : '#E2456A';
      ctx.fillStyle = col; ctx.fillRect(gt.x - gw / 2 - 3, r.y - 22, 5, 26); ctx.fillRect(gt.x + gw / 2 - 2, r.y - 22, 5, 26);
      ctx.beginPath(); ctx.moveTo(gt.x - gw / 2 + 2, r.y - 22); ctx.lineTo(gt.x - gw / 2 + 16, r.y - 16); ctx.lineTo(gt.x - gw / 2 + 2, r.y - 10); ctx.fill();
      ball(ctx, gt.x, r.y - 6, 15, gt.ch, C.tile, C.tileInk);
    }));
    ctx.fillStyle = C.sky; ctx.beginPath(); ctx.roundRect(sx - 12, sy - 18, 24, 26, 8); ctx.fill();
    ctx.strokeStyle = '#1C2A36'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx - 8, sy + 10); ctx.lineTo(sx - 8, sy + 26); ctx.moveTo(sx + 8, sy + 10); ctx.lineTo(sx + 8, sy + 26); ctx.stroke();
    ctx.fillStyle = '#FFD9B8'; ctx.beginPath(); ctx.arc(sx, sy - 24, 8, 0, 7); ctx.fill();
    if(!started && !S.locked) g.banner('Move to start skiing!');
  });
  S.dbg = () => ({sx, sy, rows, need:g.need, gw, started, speed});
};

IMPL.batter = (w, e, def) => {
  const g = shell(w, e, def, {spell:'Swing only at the pitch with the next letter', def:'Hit the letters of the word that means…',
    hint:'Tap, click or press Space to swing when the right letter reaches the bat. Let the wrong ones go by!',
    controls:'<div class="actions"><button class="btn big" type="button" id="swing">Swing</button></div>', narrow:.8, wide:.45, maxH:360});
  const {ctx, W, H, C} = g;
  const batX = W * .18, groundY = H - 40, ballY = groundY - 50, speed = lv(230, 300, 380), zone = 34;
  let balls = [], spawnT = .5, swingT = 0, flying = [], note = null;
  function pitch(){ const need = g.need; const has = balls.some(b => b.ch === need && !b.done); balls.push({x:W + 20, ch: !has && Math.random() < .7 || Math.random() < .3 ? need : g.decoy(), done:false}); }
  function swing(){
    if(S.locked || swingT > 0) return;
    swingT = .25; sfx('tap');
    const b = balls.filter(b => !b.done && Math.abs(b.x - batX) < zone).sort((a, c) => Math.abs(a.x - batX) - Math.abs(c.x - batX))[0];
    if(!b) return;
    b.done = true; flying.push({x:b.x, y:ballY, vx:420, vy:-520, ch:b.ch, good:b.ch === g.need});
    if(b.ch === g.need){
      note = {txt:'Home run!', t:0};
      if(!g.hit() && !balls.some(o => !o.done && o.ch === g.need)){ const nxt = balls.filter(o => !o.done && o.x > batX + 60).sort((x, y) => x.x - y.x)[0]; if(nxt) nxt.ch = g.need; }
    } else { note = {txt:'Wrong letter!', t:0}; g.miss(); }
  }
  stage.querySelector('#swing').onclick = swing;
  g.cv.addEventListener('pointerdown', ev => { ev.preventDefault(); swing(); });
  S.key = ev => { if(ev.key === ' ' || ev.key === 'Enter'){ ev.preventDefault(); swing(); } };
  g.loop(dt => {
    swingT = Math.max(0, swingT - dt);
    if(!S.locked){ spawnT -= dt; if(spawnT <= 0){ pitch(); spawnT = lv(1.4, 1.1, .85); } }
    balls.forEach(b => { if(!b.done) b.x -= speed * dt; });
    balls.forEach(b => { if(!b.done && b.x < batX - zone){ b.done = true; b.passed = true; if(b.ch === g.need && S.level === 2 && !S.locked) g.miss(); } });
    balls = balls.filter(b => !b.done || b.passed && b.x > -20);
    balls.forEach(b => { if(b.passed) b.x -= speed * dt; });
    flying.forEach(f => { f.vy += 700 * dt; f.x += f.vx * dt; f.y += f.vy * dt; }); flying = flying.filter(f => f.y < H + 30 && f.x < W + 30);
    if(note){ note.t += dt; if(note.t > .7) note = null; }
    sky(g, '#7FC6EA', '#CDEBF7');
    ctx.fillStyle = '#3FAE5A'; ctx.fillRect(0, groundY, W, H - groundY);
    ctx.fillStyle = '#C9864B'; ctx.beginPath(); ctx.ellipse(batX + 40, groundY + 10, 90, 14, 0, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,212,94,.35)'; ctx.fillRect(batX - zone, ballY - 26, zone * 2, 52);
    ctx.fillStyle = C.coral; ctx.beginPath(); ctx.roundRect(batX - 30, groundY - 70, 22, 50, 8); ctx.fill();
    ctx.fillStyle = '#FFD9B8'; ctx.beginPath(); ctx.arc(batX - 19, groundY - 80, 11, 0, 7); ctx.fill();
    ctx.save(); ctx.translate(batX - 12, groundY - 56); ctx.rotate(swingT > 0 ? .2 : -1.1); ctx.fillStyle = '#8B5A2B'; ctx.fillRect(0, -4, 52, 8); ctx.restore();
    balls.forEach(b => { if(!b.done || b.passed) ball(ctx, b.x, ballY, 17, b.ch, '#fff', '#1C2A36'); });
    flying.forEach(f => ball(ctx, f.x, f.y, 14, f.ch, f.good ? C.good : C.bad, '#fff'));
    if(note){ ctx.fillStyle = '#1C2A36'; ctx.font = `26px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText(note.txt, W / 2, 40); }
  });
  S.dbg = () => ({balls, batX, zone, need:g.need, swingT});
};

IMPL.maze = (w, e, def) => {
  const N = lv(7, 9, 9);
  const g = shell(w, e, def, {spell:'Munch the letters in spelling order. Dodge the ghosts!', def:'Munch the letters of the word that means…',
    hint:'Arrow keys, swipe or the buttons to move. Ghosts send you back to the start.',
    controls:'<div class="dpad" id="dpad"><button type="button" data-d="up" aria-label="Up">▲</button><button type="button" data-d="left" aria-label="Left">◀</button><button type="button" data-d="down" aria-label="Down">▼</button><button type="button" data-d="right" aria-label="Right">▶</button></div>',
    narrow:1, wide:1, maxH:440, maxW:440});
  const {ctx, W, C} = g;
  const cs = W / N;
  // maze: walls between cells; carve with a random depth-first search, then knock out extra walls for loops
  const open = Array.from({length:N * N}, () => ({u:false, d:false, l:false, r:false}));
  const seen = new Set([0]), stack2 = [0];
  while(stack2.length){
    const c = stack2[stack2.length - 1], x = c % N, y = Math.floor(c / N);
    const nb = [[0, -1, 'u', 'd'], [0, 1, 'd', 'u'], [-1, 0, 'l', 'r'], [1, 0, 'r', 'l']].filter(([dx, dy]) => x + dx >= 0 && x + dx < N && y + dy >= 0 && y + dy < N && !seen.has((y + dy) * N + x + dx));
    if(!nb.length){ stack2.pop(); continue; }
    const [dx, dy, a, b] = nb[rand(nb.length)], n = (y + dy) * N + x + dx;
    open[c][a] = true; open[n][b] = true; seen.add(n); stack2.push(n);
  }
  for(let i = 0; i < N * 4; i++){ const x = rand(N - 1), y = rand(N); open[y * N + x].r = true; open[y * N + x + 1].l = true; const x2 = rand(N), y2 = rand(N - 1); open[y2 * N + x2].d = true; open[(y2 + 1) * N + x2].u = true; }
  const DIRS = {up:[0, -1, 'u'], down:[0, 1, 'd'], left:[-1, 0, 'l'], right:[1, 0, 'r']};
  const canGo = (x, y, d) => open[y * N + x][DIRS[d][2]];
  const start = {x:0, y:N - 1};
  let me = {...start, fx:0, fy:N - 1, dir:null, want:null}, items = [], ghosts = [], started = false;
  const mspd = lv(5, 6, 7), gspd = lv(2.2, 3.2, 4.2);
  function reachable(from, goal, blocked){
    const seen2 = new Set([from.x + ',' + from.y]), q = [[from.x, from.y]];
    while(q.length){
      const [x, y] = q.shift();
      if(x === goal.x && y === goal.y) return true;
      for(const d of Object.keys(DIRS)){
        if(!canGo(x, y, d)) continue;
        const nx = x + DIRS[d][0], ny = y + DIRS[d][1], k = nx + ',' + ny;
        if(seen2.has(k) || blocked.has(k)) continue;
        seen2.add(k); q.push([nx, ny]);
      }
    }
    return false;
  }
  function layout(){
    items = [];
    if(!g.need) return;
    const cells = [];
    for(let y = 0; y < N; y++) for(let x = 0; x < N; x++) if(Math.abs(x - me.x) + Math.abs(y - me.y) > 3) cells.push({x, y});
    for(let tries = 0; tries < 60; tries++){
      const pickC = shuffle(cells).slice(0, lv(3, 4, 5));
      const blocked = new Set(pickC.slice(1).map(c => c.x + ',' + c.y));
      if(reachable(me, pickC[0], blocked) || tries === 59){ items = pickC.map((c, i) => ({...c, ch: i === 0 ? g.need : g.decoy()})); return; }
    }
  }
  layout();
  for(let i = 0; i < lv(1, 2, 3); i++) ghosts.push({x:N - 1 - i, y:0, fx:N - 1 - i, fy:0, dir:null, prog:0});
  function setWant(d){ if(S.locked) return; me.want = d; started = true; }
  const KEYS = {ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right', w:'up', s:'down', a:'left', d:'right'};
  S.key = ev => { const d = KEYS[ev.key] || KEYS[lower(ev.key)]; if(d){ ev.preventDefault(); setWant(d); } };
  stage.querySelector('#dpad').addEventListener('pointerdown', ev => { const b = ev.target.closest('button'); if(b){ ev.preventDefault(); setWant(b.dataset.d); } });
  let sw = null;
  g.cv.addEventListener('pointerdown', ev => { sw = cvPoint(g.cv, ev); });
  g.cv.addEventListener('pointerup', ev => { if(!sw) return; const p = cvPoint(g.cv, ev); let dx = p.x - sw.x, dy = p.y - sw.y; sw = null; if(Math.max(Math.abs(dx), Math.abs(dy)) < 12){ dx = p.x - (me.fx + .5) * cs; dy = p.y - (me.fy + .5) * cs; } setWant(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up')); });
  let prog = 0, safeT = 1.5;
  g.loop(dt => {
    safeT = Math.max(0, safeT - dt);
    if(started && !S.locked){
      if(!me.dir || prog === 0){
        if(me.want && canGo(me.x, me.y, me.want)) me.dir = me.want;
        else if(me.dir && !canGo(me.x, me.y, me.dir)) me.dir = null;
      }
      if(me.dir){
        prog += mspd * dt;
        const [dx, dy] = DIRS[me.dir];
        if(prog >= 1){
          prog = 0; me.x += dx; me.y += dy;
          const k = items.findIndex(it => it.x === me.x && it.y === me.y);
          if(k >= 0){ if(items[k].ch === g.need){ items.splice(k, 1); if(!g.hit()) layout(); } else { items.splice(k, 1); g.miss(); } }
        }
        me.fx = me.x + dx * prog; me.fy = me.y + dy * prog;
      } else { me.fx = me.x; me.fy = me.y; }
      ghosts.forEach(gh => {
        if(gh.prog === 0){
          const opts = Object.keys(DIRS).filter(d => canGo(gh.x, gh.y, d));
          const back = gh.dir && {up:'down', down:'up', left:'right', right:'left'}[gh.dir];
          let choices = opts.length > 1 ? opts.filter(d => d !== back) : opts;
          if(S.level === 2 && Math.random() < .6) choices = choices.slice().sort((a, b) => { const da = Math.abs(gh.x + DIRS[a][0] - me.x) + Math.abs(gh.y + DIRS[a][1] - me.y), db = Math.abs(gh.x + DIRS[b][0] - me.x) + Math.abs(gh.y + DIRS[b][1] - me.y); return da - db; }).slice(0, 1);
          gh.dir = choices[rand(choices.length)];
        }
        gh.prog += gspd * dt;
        const [dx, dy] = DIRS[gh.dir];
        if(gh.prog >= 1){ gh.prog = 0; gh.x += dx; gh.y += dy; }
        gh.fx = gh.x + dx * gh.prog; gh.fy = gh.y + dy * gh.prog;
        if(safeT <= 0 && Math.hypot(gh.fx - me.fx, gh.fy - me.fy) < .6){ g.miss(); g.msg('A ghost got you! Back to the start.'); me = {...start, fx:start.x, fy:start.y, dir:null, want:null}; prog = 0; safeT = 1.5; }
      });
    }
    ctx.fillStyle = '#10142B'; ctx.fillRect(0, 0, W, W);
    ctx.strokeStyle = '#3D5AFE'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for(let y = 0; y < N; y++) for(let x = 0; x < N; x++){
      const o = open[y * N + x], X = x * cs, Y = y * cs;
      ctx.beginPath();
      if(!o.u){ ctx.moveTo(X, Y); ctx.lineTo(X + cs, Y); }
      if(!o.l){ ctx.moveTo(X, Y); ctx.lineTo(X, Y + cs); }
      if(y === N - 1 && !o.d){ ctx.moveTo(X, Y + cs); ctx.lineTo(X + cs, Y + cs); }
      if(x === N - 1 && !o.r){ ctx.moveTo(X + cs, Y); ctx.lineTo(X + cs, Y + cs); }
      ctx.stroke();
    }
    items.forEach(it => ball(ctx, (it.x + .5) * cs, (it.y + .5) * cs, cs * .36, it.ch, C.tile, C.tileInk));
    ghosts.forEach((gh, i) => { const X = (gh.fx + .5) * cs, Y = (gh.fy + .5) * cs, r = cs * .36; ctx.fillStyle = ['#FF5C8A', '#5CE1E6', '#FFA94D'][i % 3]; ctx.beginPath(); ctx.arc(X, Y - r * .2, r, Math.PI, 0); ctx.lineTo(X + r, Y + r * .8); ctx.lineTo(X - r, Y + r * .8); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(X - r * .35, Y - r * .25, r * .22, 0, 7); ctx.arc(X + r * .35, Y - r * .25, r * .22, 0, 7); ctx.fill(); });
    const mouth = .25 + Math.abs(Math.sin(performance.now() / 120)) * .25, ang = {right:0, down:Math.PI / 2, left:Math.PI, up:-Math.PI / 2}[me.dir || 'right'];
    ctx.globalAlpha = safeT > 0 && Math.floor(safeT * 8) % 2 ? .35 : 1;
    ctx.fillStyle = '#FFE14D'; ctx.beginPath(); ctx.moveTo((me.fx + .5) * cs, (me.fy + .5) * cs); ctx.arc((me.fx + .5) * cs, (me.fy + .5) * cs, cs * .38, ang + mouth, ang - mouth + Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    if(!started && !S.locked) g.banner('Pick a direction to start!');
  });
  S.dbg = () => ({me, items, ghosts, need:g.need, N, open, started});
};

IMPL.bubbles = (w, e, def) => {
  const g = shell(w, e, def, {spell:'Pop the bubble with the next letter', def:'Pop the letters of the word that means…',
    hint:'Aim with your mouse or finger and tap to shoot. Bounce shots off the walls!', narrow:1.25, wide:.8, maxH:460, maxW:520});
  const {ctx, W, H, C} = g;
  const R = Math.min(22, W / 16), cx = W / 2, cy = H - 30, cols = [C.coral, C.sky, C.leaf, C.grape, C.berry];
  let aim = -Math.PI / 2, bubbles = [], shot = null, drop = 0, note = null;
  function fill(){
    bubbles = [];
    const rows = lv(2, 3, 3), per = Math.floor(W / (R * 2.1));
    for(let r = 0; r < rows; r++) for(let i = 0; i < per - (r % 2); i++) bubbles.push({x:R * 1.1 + i * R * 2.1 + (r % 2) * R, y:R + 10 + r * R * 1.8, ch:g.decoy(), c:cols[rand(cols.length)]});
    relabel();
  }
  const HIT = 1.6;
  function clearShot(t){
    const dx = t.x - cx, dy = t.y + drop - cy, L = Math.hypot(dx, dy);
    return !bubbles.some(o => { if(o === t) return false; const ox = o.x - cx, oy = o.y + drop - cy, proj = (ox * dx + oy * dy) / L; if(proj < 0 || proj > L - R) return false; return Math.abs(ox * dy - oy * dx) / L < R * (HIT + .15); });
  }
  function relabel(){
    if(!g.need) return;
    bubbles.forEach(b => b.ch = g.decoy());
    const reach = bubbles.filter(clearShot);
    const pickFrom = reach.length ? reach : bubbles;
    for(let i = 0; i < lv(2, 1, 1); i++) pickFrom[rand(pickFrom.length)].ch = g.need;
  }
  fill();
  const setAim = ev => { const p = cvPoint(g.cv, ev); aim = clamp(Math.atan2(p.y - cy, p.x - cx), -Math.PI + .2, -.2); };
  g.cv.addEventListener('pointermove', setAim);
  function fire(){ if(S.locked || shot) return; shot = {x:cx, y:cy, vx:Math.cos(aim) * 640, vy:Math.sin(aim) * 640}; sfx('tap'); }
  g.cv.addEventListener('pointerdown', ev => { setAim(ev); fire(); });
  S.key = ev => { if(ev.key === 'ArrowLeft'){ ev.preventDefault(); aim = clamp(aim - .08, -Math.PI + .2, -.2); } if(ev.key === 'ArrowRight'){ ev.preventDefault(); aim = clamp(aim + .08, -Math.PI + .2, -.2); } if(ev.key === ' ' || ev.key === 'ArrowUp'){ ev.preventDefault(); fire(); } };
  g.loop(dt => {
    if(!S.locked){
      drop += lv(2, 4, 7) * dt;
      if(bubbles.some(b => b.y + drop > cy - 60)){ g.miss(); g.msg('The bubbles reached you! New bubbles coming.'); drop = 0; fill(); }
    }
    if(shot){
      shot.x += shot.vx * dt; shot.y += shot.vy * dt;
      if(shot.x < R){ shot.x = R; shot.vx *= -1; } if(shot.x > W - R){ shot.x = W - R; shot.vx *= -1; }
      const b = bubbles.find(b => Math.hypot(b.x - shot.x, b.y + drop - shot.y) < R * HIT);
      if(b){
        shot = null; bubbles = bubbles.filter(o => o !== b);
        if(b.ch === g.need){ note = {txt:'Pop!', t:0, x:b.x, y:b.y + drop}; if(!g.hit()){ if(bubbles.length < 6){ drop = 0; fill(); } else relabel(); } }
        else { note = {txt:'Wrong!', t:0, x:b.x, y:b.y + drop}; g.miss(); if(bubbles.length < 6){ drop = 0; fill(); } else if(!bubbles.some(o => o.ch === g.need)) relabel(); }
      } else if(shot.y < 0) shot = null;
    }
    if(note){ note.t += dt; if(note.t > .5) note = null; }
    ctx.fillStyle = '#1A2B45'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(217,56,79,.25)'; ctx.fillRect(0, cy - 60, W, 2);
    bubbles.forEach(b => ball(ctx, b.x, b.y + drop, R, b.ch, b.c, '#fff'));
    ctx.setLineDash([4, 8]); ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(aim) * lv(220, 150, 90), cy + Math.sin(aim) * lv(220, 150, 90)); ctx.stroke(); ctx.setLineDash([]);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(aim); ctx.fillStyle = '#9FB3BB'; ctx.fillRect(0, -9, 36, 18); ctx.restore();
    ctx.fillStyle = '#C5D2DA'; ctx.beginPath(); ctx.arc(cx, cy, 20, 0, 7); ctx.fill();
    if(shot){ ctx.fillStyle = C.sun; ctx.beginPath(); ctx.arc(shot.x, shot.y, R * .8, 0, 7); ctx.fill(); }
    if(note){ ctx.fillStyle = '#fff'; ctx.font = `20px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText(note.txt, note.x, note.y - 24 - note.t * 30); }
  });
  S.dbg = () => ({aim, bubbles, drop, cx, cy, R, need:g.need, busy:!!shot, W});
};

IMPL.golf = (w, e, def) => {
  const g = shell(w, e, def, {spell:'Putt into the hole with the next letter', def:'Putt into the letters of the word that means…',
    hint:'Drag back from the ball (you can drag outside the green), aim, and let go. Gentle putts drop in!', narrow:1.2, wide:.7, maxH:460, maxW:560});
  const {ctx, W, H, C} = g;
  const BR = 9, HR = 17, fric = lv(1.5, 1.35, 1.2), k = 4.6, MAXPULL = 160;
  let ball2 = {x:W / 2, y:H - 40, vx:0, vy:0}, holes = [], walls = [], pull = null, note = null;
  function layout(){
    const labels = g.pick(lv(2, 3, 3));
    holes = labels.map((ch, i) => ({ch, x:W * (.2 + .6 * (i + .5) / labels.length) + (Math.random() - .5) * 40, y:H * (.15 + Math.random() * .3)}));
    walls = S.level < 2 ? [] : Array.from({length:2}, (_, i) => ({x:W * (i ? .55 : .12) + Math.random() * W * .08, y:H * (.45 + Math.random() * .2), w:W * .25, h:12}));
  }
  layout();
  const moving = () => Math.hypot(ball2.vx, ball2.vy) > 4;
  g.cv.addEventListener('pointerdown', ev => { if(S.locked || moving()) return; ev.preventDefault(); try{ g.cv.setPointerCapture(ev.pointerId); }catch(err){} const p = cvPoint(g.cv, ev); pull = {x:p.x, y:p.y, cx:p.x, cy:p.y}; });
  addEventListener('pointermove', function mv(ev){ if(!g.cv.isConnected){ removeEventListener('pointermove', mv); return; } if(pull){ const p = cvPoint(g.cv, ev); pull.cx = p.x; pull.cy = p.y; } });
  addEventListener('pointerup', function up(){
    if(!g.cv.isConnected){ removeEventListener('pointerup', up); return; }
    if(!pull) return;
    let dx = pull.x - pull.cx, dy = pull.y - pull.cy; const L = Math.hypot(dx, dy); pull = null;
    if(L < 8) return;
    const m = Math.min(L, MAXPULL) / L; ball2.vx = dx * m * k; ball2.vy = dy * m * k; sfx('tap');
  });
  g.loop(dt => {
    if(!S.locked && moving()){
      ball2.x += ball2.vx * dt; ball2.y += ball2.vy * dt;
      const f = Math.exp(-fric * dt); ball2.vx *= f; ball2.vy *= f;
      if(ball2.x < BR){ ball2.x = BR; ball2.vx *= -.8; } if(ball2.x > W - BR){ ball2.x = W - BR; ball2.vx *= -.8; }
      if(ball2.y < BR){ ball2.y = BR; ball2.vy *= -.8; } if(ball2.y > H - BR){ ball2.y = H - BR; ball2.vy *= -.8; }
      walls.forEach(wl => { if(ball2.x > wl.x - BR && ball2.x < wl.x + wl.w + BR && ball2.y > wl.y - BR && ball2.y < wl.y + wl.h + BR){ const fromTop = ball2.vy > 0 ? ball2.y - (wl.y - BR) : (wl.y + wl.h + BR) - ball2.y; const fromSide = ball2.vx > 0 ? ball2.x - (wl.x - BR) : (wl.x + wl.w + BR) - ball2.x; if(fromTop < fromSide){ ball2.vy *= -.8; ball2.y += ball2.vy > 0 ? 2 : -2; } else { ball2.vx *= -.8; ball2.x += ball2.vx > 0 ? 2 : -2; } } });
      const sp = Math.hypot(ball2.vx, ball2.vy);
      const h = holes.find(h => Math.hypot(h.x - ball2.x, h.y - ball2.y) < HR - 2 && sp < lv(520, 420, 340));
      if(h){
        ball2 = {x:W / 2, y:H - 40, vx:0, vy:0};
        if(h.ch === g.need){ note = {txt:'In the hole!', t:0}; if(!g.hit()) layout(); } else { note = {txt:'Wrong hole', t:0}; g.miss(); }
      } else if(!moving()){ ball2.vx = 0; ball2.vy = 0; }
    }
    if(note){ note.t += dt; if(note.t > .8) note = null; }
    ctx.fillStyle = '#3E9E57'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,.06)'; for(let y = 0; y < H; y += 40) ctx.fillRect(0, y, W, 20);
    walls.forEach(wl => { ctx.fillStyle = '#8B5A2B'; ctx.fillRect(wl.x, wl.y, wl.w, wl.h); });
    holes.forEach(h => { ctx.fillStyle = '#123018'; ctx.beginPath(); ctx.arc(h.x, h.y, HR, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(h.x, h.y); ctx.lineTo(h.x, h.y - 46); ctx.stroke(); tileAt(ctx, h.x + 1, h.y - 48, 26, h.ch, C.tile, C.tileInk); });
    if(pull){
      let dx = pull.x - pull.cx, dy = pull.y - pull.cy; const L = Math.hypot(dx, dy) || 1; const m = Math.min(L, MAXPULL) / L;
      ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.setLineDash([5, 6]); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ball2.x, ball2.y); ctx.lineTo(ball2.x + dx * m * lv(1.6, 1.1, .7), ball2.y + dy * m * lv(1.6, 1.1, .7)); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ball2.x, ball2.y, BR, 0, 7); ctx.fill();
    if(note){ ctx.fillStyle = '#fff'; ctx.font = `24px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText(note.txt, W / 2, H - 70); }
  });
  S.dbg = () => ({ball:ball2, holes, walls, need:g.need, k, MAXPULL, fric, HR, W, H});
};

IMPL.bomb = (w, e, def) => {
  const ls = letters(w);
  const g = shell(w, e, def, {spell:'Cut the wires in spelling order before the bomb goes off!', def:'Cut the letters of the word that means… before it goes off!',
    hint:'Tap a wire to cut it. Wrong wires take time off the clock.', narrow:.95, wide:.55, maxH:380, maxW:640});
  const {ctx, W, H, C} = g;
  let left = lv(14, 10, 7) + ls.length * lv(2.5, 2, 1.5), wires = [], snip = null, boom = 0;
  const colors = [C.coral, C.sky, C.leaf, C.sun, C.grape, C.berry, '#fff'];
  function layout(){ const labels = g.pick(lv(4, 5, 7)); wires = labels.map((ch, i) => ({ch, x:W * (.12 + .76 * (i + .5) / labels.length), c:colors[i % colors.length], cut:false})); }
  layout();
  function cut(k){
    const wr = wires[k]; if(!wr || wr.cut || S.locked || boom) return;
    wr.cut = true; snip = {k, t:0}; sfx('tap');
    if(wr.ch === g.need){ if(!g.hit()) setTimeout(() => { if(!S.locked) layout(); }, 180); }
    else { g.miss(); left = Math.max(0, left - 3); g.msg('Wrong wire! −3 seconds.'); }
  }
  g.cv.addEventListener('pointerdown', ev => { const p = cvPoint(g.cv, ev); let best = -1, bd = 1e9; wires.forEach((wr, i) => { const d = Math.abs(wr.x - p.x); if(d < bd){ bd = d; best = i; } }); if(bd < W / wires.length / 2 + 4) cut(best); });
  S.key = ev => { const k = wires.findIndex(wr => !wr.cut && wr.ch === lower(ev.key)); if(k >= 0) cut(k); else if(/^[1-7]$/.test(ev.key)) cut(+ev.key - 1); };
  g.loop(dt => {
    if(!S.locked && !boom){ left -= dt; if(left <= 0){ left = 0; boom = .01; sfx('miss'); g.target.forEach((t, i) => { if(t.classList.contains('slot') || t.classList.contains('faded')) reveal(t, ls[i]); }); resolve('skip', {msg:'Boom! The word was'}); } }
    if(boom) boom += dt;
    if(snip){ snip.t += dt; if(snip.t > .3) snip = null; }
    ctx.fillStyle = '#2B2F36'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#3B414B'; ctx.beginPath(); ctx.roundRect(W * .08, 14, W * .84, H * .2, 12); ctx.fill();
    ctx.fillStyle = left < 5 && Math.floor(left * 4) % 2 ? C.bad : '#FF3B3B'; ctx.font = `${Math.round(H * .13)}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`00:${String(Math.ceil(left)).padStart(2, '0')}`, W / 2, 14 + H * .1);
    const y0 = H * .32, y1 = H * .9;
    wires.forEach((wr, i) => {
      ctx.strokeStyle = wr.c; ctx.lineWidth = 7; ctx.lineCap = 'round';
      if(wr.cut){ ctx.beginPath(); ctx.moveTo(wr.x, y0); ctx.lineTo(wr.x, (y0 + y1) / 2 - 10); ctx.moveTo(wr.x, (y0 + y1) / 2 + 10); ctx.lineTo(wr.x, y1); ctx.stroke(); }
      else { ctx.beginPath(); ctx.moveTo(wr.x, y0); ctx.quadraticCurveTo(wr.x + 14 * Math.sin(i), (y0 + y1) / 2, wr.x, y1); ctx.stroke(); ball(ctx, wr.x, (y0 + y1) / 2, 17, wr.ch, '#fff', '#1C2A36'); }
    });
    ctx.fillStyle = '#4A505B'; ctx.fillRect(W * .06, y0 - 10, W * .88, 12); ctx.fillRect(W * .06, y1 - 2, W * .88, 12);
    if(boom){ ctx.fillStyle = `rgba(255,170,60,${Math.max(0, .9 - boom)})`; ctx.beginPath(); ctx.arc(W / 2, H / 2, 40 + boom * 600, 0, 7); ctx.fill(); }
  });
  S.dbg = () => ({wires, left, need:g.need, W});
};

IMPL.swipe = (w, e, def) => {
  const g = shell(w, e, def, {spell:'Is this the next letter? Swipe right for yes, left for no.', def:'Is this the next letter of the word that means…?',
    hint:'Swipe or press → for yes and ← for no. Be quick before the card flies away!',
    controls:'<div class="actions"><button class="btn big" type="button" id="no">← No</button><button class="btn green big" type="button" id="yes">Yes →</button></div>', narrow:.75, wide:.45, maxH:320, maxW:560});
  const {ctx, W, H, C} = g;
  const life = lv(2.4, 1.7, 1.15);
  let card = null, fling = null, start = null;
  function next(){ if(!g.need) return; card = {ch: Math.random() < .45 ? g.need : g.decoy(), t:0}; }
  next();
  function answer(yes){
    if(!card || S.locked) return;
    const right = card.ch === g.need;
    fling = {ch:card.ch, dir:yes ? 1 : -1, t:0, ok: yes === right};
    card = null;
    if(yes && right){ if(g.hit()) return; }
    else if(yes || right){ g.miss(); }
    else sfx('tap');
    next();
  }
  stage.querySelector('#yes').onclick = () => answer(true);
  stage.querySelector('#no').onclick = () => answer(false);
  S.key = ev => { if(ev.key === 'ArrowRight' || lower(ev.key) === 'y'){ ev.preventDefault(); answer(true); } if(ev.key === 'ArrowLeft' || lower(ev.key) === 'n'){ ev.preventDefault(); answer(false); } };
  g.cv.addEventListener('pointerdown', ev => { start = cvPoint(g.cv, ev); });
  g.cv.addEventListener('pointerup', ev => { if(!start) return; const p = cvPoint(g.cv, ev), dx = p.x - start.x; start = null; if(Math.abs(dx) > 30) answer(dx > 0); });
  g.loop(dt => {
    if(card && !S.locked){ card.t += dt; if(card.t >= life){ const wasRight = card.ch === g.need; fling = {ch:card.ch, dir:0, t:0, ok:!wasRight}; card = null; if(wasRight) g.miss(); next(); } }
    if(fling){ fling.t += dt; if(fling.t > .35) fling = null; }
    ctx.fillStyle = '#20324A'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(217,56,79,.25)'; ctx.fillRect(0, 0, W * .18, H); ctx.fillStyle = 'rgba(31,158,90,.25)'; ctx.fillRect(W * .82, 0, W * .18, H);
    ctx.fillStyle = '#fff'; ctx.font = `22px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('No', W * .09, H / 2); ctx.fillText('Yes', W * .91, H / 2);
    const cw = Math.min(150, W * .32), ch2 = cw * 1.25;
    if(fling){ ctx.globalAlpha = 1 - fling.t / .35; tileAt(ctx, W / 2 - cw / 2 + fling.dir * fling.t * 900, H / 2 - ch2 / 2 + (fling.dir ? 0 : -fling.t * 400), cw, fling.ch, fling.ok ? C.good : C.bad, '#fff'); ctx.globalAlpha = 1; }
    if(card){
      tileAt(ctx, W / 2 - cw / 2, H / 2 - cw / 2, cw, card.ch, C.tile, C.tileInk);
      ctx.fillStyle = C.coral; ctx.fillRect(W / 2 - cw / 2, H / 2 + cw / 2 + 8, cw * (1 - card.t / life), 6);
    }
  });
  S.dbg = () => ({card, need:g.need, life});
};

IMPL.archery = (w, e, def) => {
  const g = shell(w, e, def, {spell:'Shoot an arrow into the target with the next letter', def:'Shoot the letters of the word that means…',
    hint:'Aim by moving your mouse or finger up and down. Tap or press Space to shoot.', narrow:.95, wide:.55, maxH:400, maxW:720});
  const {ctx, W, H, C} = g;
  const bx = 40, by = H / 2, speed = 1150, grav = lv(0, 220, 380);
  let aim = 0, arrows = [], targets = [], note = null, t = 0;
  function layout(){ const labels = g.pick(3); targets = labels.map((ch, i) => ({ch, x:W * (.55 + .14 * i), base:H * (.25 + .5 * Math.random()), amp:H * lv(.07, .13, .2), sp:lv(.8, 1.2, 1.7) * (.7 + Math.random() * .6), ph:Math.random() * 6, y:0})); }
  layout();
  const setAim = ev => { const p = cvPoint(g.cv, ev); aim = clamp(Math.atan2(p.y - by, Math.max(40, p.x - bx)), -.9, .9); };
  g.cv.addEventListener('pointermove', setAim);
  function shoot(){ if(S.locked || arrows.length) return; arrows.push({x:bx + 20, y:by, vx:Math.cos(aim) * speed, vy:Math.sin(aim) * speed}); sfx('whoosh'); }
  g.cv.addEventListener('pointerdown', ev => { setAim(ev); shoot(); });
  S.key = ev => { if(ev.key === 'ArrowUp'){ ev.preventDefault(); aim = clamp(aim - .05, -.9, .9); } if(ev.key === 'ArrowDown'){ ev.preventDefault(); aim = clamp(aim + .05, -.9, .9); } if(ev.key === ' '){ ev.preventDefault(); shoot(); } };
  g.loop(dt => {
    t += dt;
    targets.forEach(tg => tg.y = tg.base + Math.sin(t * tg.sp + tg.ph) * tg.amp);
    arrows.forEach(a => { a.vy += grav * dt; a.x += a.vx * dt; a.y += a.vy * dt; });
    for(const a of arrows){
      const tg = targets.find(tg => Math.abs(a.x - tg.x) < 12 && Math.abs(a.y - tg.y) < 30);
      if(tg && !S.locked){ a.dead = true; if(tg.ch === g.need){ note = {txt:'Bullseye!', t:0}; if(!g.hit()) layout(); } else { note = {txt:'Wrong target', t:0}; g.miss(); } }
      if(a.x > W + 20 || a.y < -20 || a.y > H + 20) a.dead = true;
    }
    arrows = arrows.filter(a => !a.dead);
    if(note){ note.t += dt; if(note.t > .7) note = null; }
    sky(g, '#9ED8F0', '#E4F5DD');
    ctx.fillStyle = '#5BAF5E'; ctx.fillRect(0, H - 18, W, 18);
    targets.forEach(tg => { [[26, '#fff'], [20, C.berry], [13, '#fff'], [7, C.berry]].forEach(([r, c]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(tg.x, tg.y, r * .45, r, 0, 0, 7); ctx.fill(); }); ball(ctx, tg.x + 26, tg.y, 14, tg.ch, C.tile, C.tileInk); });
    ctx.strokeStyle = '#7A5233'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(bx, by, 30, aim - 1.2, aim + 1.2); ctx.stroke();
    ctx.strokeStyle = 'rgba(28,42,54,.35)'; ctx.setLineDash([4, 6]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(aim) * lv(240, 140, 70), by + Math.sin(aim) * lv(240, 140, 70)); ctx.stroke(); ctx.setLineDash([]);
    arrows.forEach(a => { const ang = Math.atan2(a.vy, a.vx); ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(ang); ctx.fillStyle = '#4A2E18'; ctx.fillRect(-26, -1.5, 26, 3); ctx.fillStyle = '#9FB3BB'; ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(8, 0); ctx.lineTo(0, 4); ctx.fill(); ctx.restore(); });
    if(note){ ctx.fillStyle = '#1C2A36'; ctx.font = `24px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText(note.txt, W / 2, 34); }
  });
  S.dbg = () => ({aim, targets, need:g.need, bx, by, speed, grav, busy:arrows.length > 0});
};

IMPL.bowling = (w, e, def) => {
  const g = shell(w, e, def, {spell:'Bowl at the pin with the next letter', def:'Bowl at the letters of the word that means…',
    hint:'The arrow swings across the lane. Tap or press Space to roll when it points at the right pin.', narrow:1.25, wide:.75, maxH:440, maxW:420});
  const {ctx, W, H, C} = g;
  const n = lv(3, 4, 5), laneL = W * .12, laneR = W * .88;
  let arrow = .5, dir = 1, pins = [], ball2 = null, note = null;
  const sweep = lv(.55, .8, 1.1);
  function layout(){ const labels = g.pick(n); pins = labels.map((ch, i) => ({ch, x:laneL + (laneR - laneL) * (i + .5) / n, down:false})); }
  layout();
  function roll(){ if(S.locked || ball2) return; ball2 = {x:laneL + (laneR - laneL) * arrow, y:H - 40, curve:S.level === 2 ? (Math.random() - .5) * 60 : 0}; sfx('tap'); }
  g.cv.addEventListener('pointerdown', ev => { ev.preventDefault(); roll(); });
  S.key = ev => { if(ev.key === ' ' || ev.key === 'Enter' || ev.key === 'ArrowUp'){ ev.preventDefault(); roll(); } };
  g.loop(dt => {
    if(!ball2 && !S.locked){ arrow += dir * sweep * dt; if(arrow > 1){ arrow = 1; dir = -1; } if(arrow < 0){ arrow = 0; dir = 1; } }
    if(ball2){
      ball2.y -= 520 * dt; ball2.x += ball2.curve * dt;
      if(ball2.y <= H * .18){
        const p = pins.slice().sort((a, b) => Math.abs(a.x - ball2.x) - Math.abs(b.x - ball2.x))[0];
        const hitIt = Math.abs(p.x - ball2.x) < (laneR - laneL) / n / 2;
        ball2 = null;
        if(hitIt){ p.down = true; if(p.ch === g.need){ note = {txt:'Strike!', t:0}; if(!g.hit()) setTimeout(() => { if(!S.locked) layout(); }, 250); } else { note = {txt:'Wrong pin', t:0}; g.miss(); setTimeout(() => { if(!S.locked) layout(); }, 250); } }
        else note = {txt:'Gutter ball', t:0};
      }
    }
    if(note){ note.t += dt; if(note.t > .7) note = null; }
    ctx.fillStyle = '#1F2633'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#D9A86C'; ctx.fillRect(laneL, 0, laneR - laneL, H);
    ctx.fillStyle = 'rgba(0,0,0,.08)'; for(let x = laneL; x < laneR; x += 14) ctx.fillRect(x, 0, 1, H);
    pins.forEach(p => { if(p.down) return; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(p.x, H * .14, 13, 20, 0, 0, 7); ctx.fill(); ctx.fillStyle = C.bad; ctx.fillRect(p.x - 12, H * .12, 24, 4); ball(ctx, p.x, H * .26, 15, p.ch, C.tile, C.tileInk); });
    const ax = laneL + (laneR - laneL) * arrow;
    if(!ball2){ ctx.fillStyle = C.sky; ctx.beginPath(); ctx.moveTo(ax, H - 70); ctx.lineTo(ax - 10, H - 52); ctx.lineTo(ax + 10, H - 52); ctx.fill(); }
    const bxp = ball2 ? ball2.x : ax, byp = ball2 ? ball2.y : H - 34;
    ctx.fillStyle = '#2B3A67'; ctx.beginPath(); ctx.arc(bxp, byp, 15, 0, 7); ctx.fill();
    if(note){ ctx.fillStyle = '#fff'; ctx.font = `24px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText(note.txt, W / 2, H * .5); }
  });
  S.dbg = () => ({arrow, dir, pins, need:g.need, busy:!!ball2, laneL, laneR, n});
};

IMPL.train = (w, e, def) => {
  const g = shell(w, e, def, {spell:'Flip the switches to send the train to the next letter', def:'Send the train to the letters of the word that means…',
    hint:'Tap a switch (or press 1 and 2) to change where the tracks go.',
    controls:'<div class="actions"><button class="btn blue" type="button" data-sw="0">Switch 1</button><button class="btn blue" type="button" data-sw="1">Switch 2</button></div>', narrow:.9, wide:.5, maxH:380, maxW:720});
  const {ctx, W, H, C} = g;
  const x0 = -lv(300, 210, 140), xs1 = W * .32, xs2 = W * .58, xEnd = W - 70, yTop = H * .2, yMid = H * .5, yBot = H * .8;
  const speed = lv(190, 250, 310);
  let sw = [0, 0], labels = [], train = null, note = null;
  const relabel = () => { labels = g.pick(3); };
  relabel();
  const newTrain = () => { train = {d:0}; };
  newTrain();
  function path(){
    const pts = [[x0, yMid], [xs1, yMid]];
    if(sw[0] === 0){ pts.push([xs1 + 50, yTop], [xEnd, yTop]); return {pts, dest:0}; }
    pts.push([xs2, yMid]);
    if(sw[1] === 0){ pts.push([xs2 + 50, yMid], [xEnd, yMid]); return {pts, dest:1}; }
    pts.push([xs2 + 50, yBot], [xEnd, yBot]); return {pts, dest:2};
  }
  const len = pts => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
  const at = (pts, d) => { for(let i = 1; i < pts.length; i++){ const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if(d <= L){ const f = d / L; return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f]; } d -= L; } return pts[pts.length - 1]; };
  function flip(k){
    if(S.locked) return;
    const pos = train ? at(path().pts, train.d) : [0, 0];
    const locked = k === 0 ? pos[0] > xs1 - 4 : pos[0] > xs2 - 4 && sw[0] === 1;
    if(locked){ g.msg('Too late, the train already passed that switch!'); return; }
    sw[k] ^= 1; sfx('tap');
  }
  stage.querySelectorAll('[data-sw]').forEach(b => b.onclick = () => flip(+b.dataset.sw));
  g.cv.addEventListener('pointerdown', ev => { const p = cvPoint(g.cv, ev); flip(Math.abs(p.x - xs1) < Math.abs(p.x - xs2) ? 0 : 1); });
  S.key = ev => { if(ev.key === '1' || ev.key === 'ArrowUp'){ ev.preventDefault(); flip(0); } if(ev.key === '2' || ev.key === 'ArrowDown'){ ev.preventDefault(); flip(1); } };
  g.loop(dt => {
    const P = path();
    if(train && !S.locked){
      train.d += speed * dt;
      if(train.d >= len(P.pts)){
        const ch = labels[P.dest];
        if(ch === g.need){ note = {txt:'All aboard!', t:0}; if(!g.hit()){ relabel(); newTrain(); } }
        else { note = {txt:'Wrong station', t:0}; g.miss(); relabel(); newTrain(); }
      }
    }
    if(note){ note.t += dt; if(note.t > .8) note = null; }
    ctx.fillStyle = '#6FB76F'; ctx.fillRect(0, 0, W, H);
    const drawTrack = (pts, on) => { ctx.strokeStyle = on ? '#5B4636' : 'rgba(91,70,54,.35)'; ctx.lineWidth = 10; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); ctx.strokeStyle = on ? '#C9CED4' : 'rgba(201,206,212,.35)'; ctx.lineWidth = 3; ctx.stroke(); };
    drawTrack([[x0, yMid], [xs1, yMid], [xs1 + 50, yTop], [xEnd, yTop]], sw[0] === 0);
    drawTrack([[xs1, yMid], [xs2, yMid], [xs2 + 50, yMid], [xEnd, yMid]], sw[0] === 1 && sw[1] === 0);
    drawTrack([[xs2, yMid], [xs2 + 50, yBot], [xEnd, yBot]], sw[0] === 1 && sw[1] === 1);
    drawTrack([[x0, yMid], [xs1, yMid]], true);
    [[xs1, sw[0], '1'], [xs2, sw[1], '2']].forEach(([x, v, n2]) => { ctx.fillStyle = v ? C.sky : C.coral; ctx.beginPath(); ctx.arc(x, yMid, 16, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = `15px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(n2, x, yMid + 1); });
    [yTop, yMid, yBot].forEach((y, i) => { ctx.fillStyle = '#8B5A2B'; ctx.fillRect(xEnd, y - 26, 56, 52); tileAt(ctx, xEnd + 10, y - 18, 36, labels[i], C.tile, C.tileInk); });
    if(train){ const [tx, ty] = at(P.pts, train.d); ctx.fillStyle = C.berry; ctx.beginPath(); ctx.roundRect(tx - 18, ty - 14, 36, 24, 6); ctx.fill(); ctx.fillStyle = '#1C2A36'; ctx.fillRect(tx + 6, ty - 22, 8, 10); ctx.fillStyle = '#fff'; ctx.fillRect(tx - 12, ty - 9, 10, 8); }
    if(note){ ctx.fillStyle = '#fff'; ctx.font = `24px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText(note.txt, W / 2, 26); }
  });
  S.dbg = () => ({sw, labels, need:g.need, train, dest:path().dest, xs1, xs2});
};

IMPL.aliens = (w, e, def) => {
  const g = shell(w, e, def, {spell:'Blast the alien with the next letter. Dodge their lasers!', def:'Blast the letters of the word that means…',
    hint:'Move with your mouse, finger or arrow keys. Tap or press Space to fire.', narrow:1.2, wide:.72, maxH:440, maxW:640});
  const {ctx, W, H, C} = g;
  const rows = lv(2, 3, 3), per = Math.min(6, Math.floor(W / 70)), AW = 40;
  let shipX = W / 2, keyDir = 0, aliens = [], ox = 0, oy = 30, dir = 1, shots = [], bombs = [], bombT = 1.5, cool = 0;
  function fill(){
    aliens = [];
    for(let r = 0; r < rows; r++) for(let i = 0; i < per; i++) aliens.push({r, i, ch:g.decoy(), alive:true});
    ox = 0; oy = 30; relabel();
  }
  function relabel(){
    const alive = aliens.filter(a => a.alive);
    alive.forEach(a => a.ch = g.decoy());
    const front = alive.filter(a => !alive.some(o => o.i === a.i && o.r > a.r));
    for(let k = 0; k < lv(2, 1, 1) && front.length; k++) front[rand(front.length)].ch = g.need;
  }
  fill();
  const pos = a => ({x:30 + a.i * (W - 60) / Math.max(1, per - 1) * .8 + ox, y:oy + a.r * 46});
  function fire(){ if(S.locked || cool > 0) return; shots.push({x:shipX, y:H - 46}); cool = .3; sfx('tap'); }
  g.cv.addEventListener('pointermove', ev => { shipX = clamp(cvPoint(g.cv, ev).x, 20, W - 20); });
  g.cv.addEventListener('pointerdown', ev => { shipX = clamp(cvPoint(g.cv, ev).x, 20, W - 20); fire(); });
  S.key = ev => { if(ev.key === 'ArrowLeft'){ ev.preventDefault(); keyDir = -1; } if(ev.key === 'ArrowRight'){ ev.preventDefault(); keyDir = 1; } if(ev.key === ' ' || ev.key === 'ArrowUp'){ ev.preventDefault(); fire(); } };
  S.keyup = ev => { if(ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') keyDir = 0; };
  g.loop(dt => {
    cool = Math.max(0, cool - dt);
    if(!S.locked){
      shipX = clamp(shipX + keyDir * 300 * dt, 20, W - 20);
      ox += dir * lv(30, 45, 65) * dt;
      const xs = aliens.filter(a => a.alive).map(a => pos(a).x);
      if(Math.max(...xs) > W - 22 && dir > 0 || Math.min(...xs) < 22 && dir < 0){ dir *= -1; oy += 12; }
      if(aliens.some(a => a.alive && pos(a).y > H - 90)){ g.miss(); g.msg('The aliens landed! New wave incoming.'); fill(); }
      bombT -= dt;
      if(bombT <= 0){ const al = aliens.filter(a => a.alive); if(al.length){ const a = al[rand(al.length)], p = pos(a); bombs.push({x:p.x, y:p.y + 14}); } bombT = lv(2.2, 1.6, 1.1); }
    }
    shots.forEach(s => s.y -= 820 * dt); bombs.forEach(b => b.y += lv(140, 180, 230) * dt);
    if(!S.locked) for(const s of shots){
      const a = aliens.find(a => a.alive && Math.abs(pos(a).x - s.x) < AW / 2 + 4 && Math.abs(pos(a).y - s.y) < 20);
      if(!a) continue;
      s.dead = true; a.alive = false;
      if(a.ch === g.need){ if(!g.hit()){ if(aliens.filter(o => o.alive).length < 3) fill(); else relabel(); } }
      else { g.miss(); if(!aliens.some(o => o.alive && o.ch === g.need)) relabel(); }
    }
    for(const b of bombs){ if(!S.locked && Math.abs(b.x - shipX) < 18 && b.y > H - 50 && b.y < H - 20){ b.dead = true; g.miss(); g.msg('Ouch! Dodge the alien lasers.'); } }
    shots = shots.filter(s => !s.dead && s.y > -10); bombs = bombs.filter(b => !b.dead && b.y < H + 10);
    ctx.fillStyle = '#0B1026'; ctx.fillRect(0, 0, W, H);
    aliens.forEach(a => { if(!a.alive) return; const p = pos(a); ctx.fillStyle = '#7CF27C'; ctx.beginPath(); ctx.roundRect(p.x - AW / 2, p.y - 14, AW, 28, 8); ctx.fill(); ctx.fillStyle = '#0B1026'; ctx.font = `18px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(a.ch.toLocaleUpperCase(), p.x, p.y + 1); ctx.fillStyle = '#7CF27C'; ctx.fillRect(p.x - AW / 2 + 4, p.y + 14, 5, 6); ctx.fillRect(p.x + AW / 2 - 9, p.y + 14, 5, 6); });
    ctx.fillStyle = C.sun; shots.forEach(s => ctx.fillRect(s.x - 2, s.y - 10, 4, 12));
    ctx.fillStyle = '#FF5C5C'; bombs.forEach(b => ctx.fillRect(b.x - 2, b.y - 8, 4, 12));
    ctx.fillStyle = '#5CE1E6'; ctx.beginPath(); ctx.moveTo(shipX, H - 52); ctx.lineTo(shipX + 20, H - 22); ctx.lineTo(shipX - 20, H - 22); ctx.fill();
  });
  S.dbg = () => ({shipX, aliens:aliens.map(a => ({...a, ...pos(a)})), need:g.need, bombs, cool, dir, H});
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

function choiceGame(e, head, options, isWord, answer, doneOpt){
  answer = answer || e;
  stage.innerHTML = head + `<div class="opts" id="opts">${options.map((o, k) =>
    `<button class="opt${isWord ? ' word' : ''}" type="button" data-k="${k}">${esc(isWord ? o.w : o.d)}</button>`).join('')}</div>
    <div class="actions">${hearBtn()}${skipBtn()}</div>`;
  const btns = [...stage.querySelectorAll('.opt')];
  function choose(k){
    const b = btns[k]; if(!b || b.disabled || S.locked) return;
    if(options[k] === answer){
      b.classList.add('good'); btns.forEach(x => x.disabled = true); resolve('done', doneOpt);
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
    shuffle([e, ...otherEntries(e, lv(2, 3, 5))]), true);
};
IMPL.pickdef = (w, e) => {
  choiceGame(e, `<p class="prompt">What does this word mean?</p><div class="tiles">${tilesHtml(w)}</div>`,
    shuffle([e, ...otherEntries(e, lv(2, 3, 5))]), false);
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
  typeBox(w, stage, lv(1, 2, 3));
  if(S.level === 0){ slots[0].textContent = realChars[0]; slots[0].classList.remove('slot'); shown = 1; }
};

IMPL.defballoon = (w, e) => {
  stage.innerHTML = `<p class="prompt">Pop the word that means…</p>
    <div class="defbox">${esc(e.d)}</div>
    <div class="skybox" id="sky"></div>
    <div class="actions">${skipBtn()}</div>`;
  const sky = stage.querySelector('#sky');
  const others = S.pool.filter(x => lower(x.w) !== lower(w)).map(x => x.w);
  S.stop = balloonField(sky, {
    n: sky.clientWidth < 480 ? 3 : 4, wide: true, speed: lv(.6, .8, 1.1),
    need: () => S.locked ? null : w,
    decoy: () => others.length ? others[rand(others.length)] : w,
    hit: label => { if(label !== w) return false; resolve('done'); return true; }
  });
  bindSkip();
};

/* ---------- whole-round games ---------- */


WHOLE.search = () => {
  let items = S.list.map(e => ({w:e.w, e, ls:letters(e.w)})).filter(o => o.ls.length);
  const longest = Math.max(...items.map(o => o.ls.length));
  const total = items.reduce((a, o) => a + o.ls.length, 0);
  let size = clamp(Math.max(longest, Math.ceil(Math.sqrt(total * 2.2))) + lv(0, 0, 2), 8, 15);
  const tooLong = items.filter(o => o.ls.length > 15);
  items = items.filter(o => o.ls.length <= 15);
  const dirs = lv([[0,1],[1,0]], [[0,1],[1,0],[1,1],[-1,1]], [[0,1],[1,0],[1,1],[-1,1],[0,-1],[-1,0],[-1,-1],[1,-1]]);
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
        if(r1 < 0 || r1 >= size || c1 < 0 || c1 >= size) continue;
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
    S.results[k] = {word:p.w, e:p.e, res:'perfect'}; award(k, 'perfect'); renderHud();
    sfx('ding'); confetti(30);
    if(placed.every(p => p.found)){ S.score += 100; renderHud(); const tok = S; setTimeout(() => S === tok && finish(), 900); }
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
  const maxPairs = lv(6, 8, 10);
  const trimmed = S.list.length > maxPairs;
  S.list = S.list.slice(0, maxPairs);
  S.results = [];
  renderHud();
  const cards = shuffle(S.list.flatMap((e, k) => [{k, t:'w'}, {k, t:'d'}]));
  const slipped = new Set();
  let open = [], busy = false;
  stage.innerHTML = `<p class="prompt">Match each word with its meaning</p>
    <p class="sub">Flip two cards at a time.${trimmed ? ` This board uses ${maxPairs} of your words.` : ''}</p>
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
      award(a.k, res);
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
  const per = lv(3, 5, 6);
  for(let i = 0; i < S.list.length; i += per) sets.push(S.list.slice(i, i + per).map((e, j) => i + j));
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
        award(k, res);
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

/* ---------- accounts & leaderboards ---------- */
const ACC = window.SpellAccounts;
const boardId = (id, l) => id + '~' + (hasLevels(gameById(id)) ? l : 0);
let authTab = 'login';
function paintAccount(){
  const box = $('#acct');
  if(!ACC || !ACC.enabled){ box.hidden = true; return; }
  box.hidden = false;
  const u = ACC.user;
  if(ACC.status === 'error'){
    box.innerHTML = '<button class="iconbtn" id="loginBtn" type="button" title="Why can’t I log in?">Accounts offline</button>';
    $('#loginBtn').onclick = () => openAuth('login');
    return;
  }
  box.innerHTML = u
    ? `<span class="who" title="Logged in">${esc(u.username)}</span><button class="iconbtn" id="logoutBtn" type="button">Log out</button>`
    : `<button class="iconbtn" id="loginBtn" type="button">Log in</button><button class="iconbtn" id="signupBtn" type="button">Sign up</button>`;
  if(u) $('#logoutBtn').onclick = async () => { await ACC.logOut(); };
  else { $('#loginBtn').onclick = () => openAuth('login'); $('#signupBtn').onclick = () => openAuth('signup'); }
}
function setTab(tab){
  authTab = tab;
  document.querySelectorAll('#authTabs button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tab === tab)));
  $('#authTitle').textContent = tab === 'login' ? 'Log in' : 'Make an account';
  $('#authGo').textContent = tab === 'login' ? 'Log in' : 'Sign up';
  $('#authConfirmWrap').hidden = tab === 'login';
  $('#authPass').setAttribute('autocomplete', tab === 'login' ? 'current-password' : 'new-password');
  $('#authErr').hidden = true;
}
function openAuth(tab){
  setTab(tab || 'login');
  $('#authModal').hidden = false;
  if(ACC && ACC.status === 'error'){ $('#authErr').hidden = false; $('#authErr').textContent = ACC.statusMsg; }
  setTimeout(() => $('#authUser').focus(), 30);
}
function closeAuth(){ $('#authModal').hidden = true; $('#authPass').value = ''; $('#authPass2').value = ''; }
document.querySelectorAll('#authTabs button').forEach(b => b.onclick = () => setTab(b.dataset.tab));
$('#authCancel').onclick = closeAuth;
$('#authModal').addEventListener('pointerdown', ev => { if(ev.target.id === 'authModal') closeAuth(); });
document.addEventListener('keydown', ev => { if(ev.key === 'Escape' && !$('#authModal').hidden) closeAuth(); });
$('#authForm').addEventListener('submit', async ev => {
  ev.preventDefault();
  const name = $('#authUser').value.trim(), pw = $('#authPass').value, err = $('#authErr');
  const say = t => { err.hidden = false; err.textContent = t; };
  err.hidden = true;
  if(!ACC.validUsername(name)) return say('Usernames need 3–16 letters, numbers or _ (no spaces).');
  if(pw.length < 6) return say('Your password needs at least 6 characters.');
  if(authTab === 'signup' && pw !== $('#authPass2').value) return say('The two passwords don’t match.');
  const go = $('#authGo'); go.disabled = true; go.textContent = authTab === 'login' ? 'Logging in…' : 'Signing up…';
  try{
    if(authTab === 'login') await ACC.logIn(name, pw); else await ACC.signUp(name, pw);
    closeAuth(); sfx('ding');
  }catch(e){ say(ACC.friendly(e)); }
  finally{ go.disabled = false; go.textContent = authTab === 'login' ? 'Log in' : 'Sign up'; }
});
async function renderBoard(el, id, l, opts){
  if(!el) return;
  if(!ACC || !ACC.enabled){ el.hidden = true; return; }
  el.hidden = false;
  const g = gameById(id);
  const head = `<h4>Leaderboard${hasLevels(g) ? ' · ' + LEVELS[l] : ''}</h4>${opts && opts.note ? `<p class="note">${esc(opts.note)}</p>` : ''}`;
  el.innerHTML = head + '<p class="note">Loading scores…</p>';
  try{
    const rows = await ACC.top(boardId(id, l), 10);
    const me = ACC.user && ACC.user.uid;
    el.innerHTML = head + (rows.length
      ? `<ol>${rows.map((r, i) => `<li class="${r.uid === me ? 'me' : ''}"><span class="rk">${i + 1}</span><span class="nm">${esc(r.username)}</span><b>${r.score}</b></li>`).join('')}</ol>`
      : '<p class="note">No scores yet. Be the first!</p>')
      + (ACC.user ? '' : '<p class="note"><button class="linkbtn" type="button" data-login>Log in</button> or <button class="linkbtn" type="button" data-signup>sign up</button> to get on the leaderboard.</p>');
  }catch(e){ el.innerHTML = head + `<p class="note err">${esc(ACC.friendly(e))}</p>`; }
  const li = el.querySelector('[data-login]'), su = el.querySelector('[data-signup]');
  if(li) li.onclick = () => openAuth('login');
  if(su) su.onclick = () => openAuth('signup');
}
/* ---------- all-time points ---------- */
const fmtPts = n => Math.round(n || 0).toLocaleString();
let localTotal = +store.get('sa.total', 0) || 0;
const loggedIn = () => !!(ACC && ACC.status === 'ready' && ACC.user);
const myTotal = () => loggedIn() ? (ACC.user.total || 0) : localTotal;
function paintPoints(){
  const el = $('#pts');
  el.innerHTML = `<b>${fmtPts(myTotal())}</b> points`;
  el.title = loggedIn() ? 'Your all-time points. Tap to see the top players.'
    : ACC && ACC.enabled ? 'Points on this device. Log in to save them and join the all-time leaderboard.' : 'Your all-time points on this device.';
}
async function openAllTime(){
  const box = $('#allTimeList');
  $('#boardModal').hidden = false;
  if(!ACC || !ACC.enabled || ACC.status !== 'ready'){
    box.innerHTML = `<p class="lead">You have <b>${fmtPts(localTotal)}</b> points on this device.</p>`
      + `<p class="note">${ACC && ACC.status === 'error' ? esc(ACC.statusMsg) : 'The all-time leaderboard needs accounts, which work on the hosted copy of the game.'}</p>`;
    return;
  }
  box.innerHTML = '<p class="note">Loading the top players…</p>';
  try{
    const rows = await ACC.allTime(20), me = ACC.user && ACC.user.uid;
    const mine = rows.findIndex(r => r.uid === me);
    box.innerHTML = (rows.length
      ? `<ol>${rows.map((r, i) => `<li class="${r.uid === me ? 'me' : ''}"><span class="rk">${i + 1}</span><span class="nm">${esc(r.username)}</span><b>${fmtPts(r.total)}</b></li>`).join('')}</ol>`
      : '<p class="note">No points yet. Play a round to be the first!</p>')
      + (ACC.user ? (mine < 0 ? `<p class="note">You have <b>${fmtPts(ACC.user.total)}</b> points. Keep playing to reach the top 20!</p>` : '')
        : `<p class="note">You have ${fmtPts(localTotal)} points on this device. <button class="linkbtn" type="button" id="atLogin">Log in</button> or <button class="linkbtn" type="button" id="atSignup">sign up</button> to join the leaderboard.</p>`);
    const li = $('#atLogin'), su = $('#atSignup');
    if(li) li.onclick = () => { closeAllTime(); openAuth('login'); };
    if(su) su.onclick = () => { closeAllTime(); openAuth('signup'); };
  }catch(e){ box.innerHTML = `<p class="note err">${esc(ACC.friendly(e))}</p>`; }
}
function closeAllTime(){ $('#boardModal').hidden = true; }
$('#pts').onclick = openAllTime;
$('#boardClose').onclick = closeAllTime;
$('#boardModal').addEventListener('pointerdown', ev => { if(ev.target.id === 'boardModal') closeAllTime(); });
document.addEventListener('keydown', ev => { if(ev.key === 'Escape' && !$('#boardModal').hidden) closeAllTime(); });

if(ACC) ACC.onChange(() => {
  paintAccount(); paintPoints();
  if(!$('#menu').hidden && curGame) renderBoard($('#menuBoard'), curGame, level);
});
paintAccount(); paintPoints();

loadMode();
show('wordsScreen');
})();
