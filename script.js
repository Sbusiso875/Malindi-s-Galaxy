/* ============================================================
   GLOBAL UTILITIES
============================================================ */
function starfield(canvasId, count, opts){
  const c = document.getElementById(canvasId);
  const ctx = c.getContext('2d');
  let w,h,stars=[];
  function resize(){
    w = c.width = c.offsetWidth;
    h = c.height = c.offsetHeight;
  }
  function init(){
    resize();
    stars = [];
    for(let i=0;i<count;i++){
      stars.push({
        x:Math.random()*w, y:Math.random()*h,
        r:Math.random()*1.4+0.3,
        a:Math.random(), da:(Math.random()*0.02+0.005)*(Math.random()<0.5?-1:1)
      });
    }
  }
  function draw(){
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = opts && opts.color ? opts.color : '#ffffff';
    for(const s of stars){
      s.a += s.da;
      if(s.a<=0.1||s.a>=1) s.da*=-1;
      ctx.globalAlpha = Math.max(0.1,s.a);
      ctx.beginPath();
      ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fill();
    }
    ctx.globalAlpha=1;
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize);
  init();
  draw();
}
starfield('stars-enter', 140);
starfield('stars-password', 140);
starfield('stars-cake', 100);

/* ============================================================
   ANNIVERSARY PLANET UNLOCK STATE
   (unlocks only after all 30 love messages AND the letter have been read)
============================================================ */
let allMessagesViewed = false;
let letterHasBeenRead = false;
let anniversaryPlanetReveal = null; // assigned inside drawGalaxyCanvas()
function maybeUnlockAnniversaryPlanet(){
  if(allMessagesViewed && letterHasBeenRead && anniversaryPlanetReveal){
    anniversaryPlanetReveal();
  }
}

/* ============================================================
   SCREEN NAVIGATION
============================================================ */
function goTo(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

document.getElementById('enter-btn').addEventListener('click', ()=>{
  goTo('screen-password');
  document.getElementById('pw-input').focus();
});

/* ---------- Password logic ---------- */
const pwInput = document.getElementById('pw-input');
const pwHint = document.getElementById('pw-hint');
const pwCard = document.querySelector('#screen-password .glow-card');

function tryUnlock(){
  const val = pwInput.value.trim().toLowerCase();
  if(val === 'malindi'){
    pwHint.textContent = 'welcome in, my love 💫';
    stopHeartRain();
    playBackgroundSong();
    setTimeout(()=>{ goTo('screen-cake'); }, 500);
  } else {
    pwHint.textContent = 'not quite… try again ✨';
    pwCard.classList.remove('shake');
    void pwCard.offsetWidth;
    pwCard.classList.add('shake');
  }
}
document.getElementById('pw-submit').addEventListener('click', tryUnlock);
pwInput.addEventListener('keydown', e=>{ if(e.key==='Enter') tryUnlock(); });

/* ---------- Background song: starts at 0:25 once unlocked ---------- */
function playBackgroundSong(){
  const audio = document.getElementById('bg-audio');
  const fallbackBtn = document.getElementById('music-fallback-btn');
  if(!audio) return;
  const start = ()=>{
    audio.currentTime = 25;
    audio.play().catch(()=>{ fallbackBtn.style.display='flex'; fallbackBtn.style.alignItems='center'; fallbackBtn.style.justifyContent='center'; });
  };
  if(audio.readyState >= 1){ start(); }
  else { audio.addEventListener('loadedmetadata', start, { once:true }); }
}
document.getElementById('music-fallback-btn').addEventListener('click', ()=>{
  const audio = document.getElementById('bg-audio');
  audio.currentTime = 25;
  audio.play();
  document.getElementById('music-fallback-btn').style.display='none';
});

/* ---------- Heart rain (reusable) ---------- */
let heartRainInterval = null;
function startHeartRain(layerId){
  const layer = document.getElementById(layerId);
  const hearts = ['💗','💕','💜','💖','❤️'];
  heartRainInterval = setInterval(()=>{
    const h = document.createElement('div');
    h.className = 'heart-fall';
    h.textContent = hearts[Math.floor(Math.random()*hearts.length)];
    h.style.left = Math.random()*100+'%';
    const dur = 4+Math.random()*4;
    h.style.animationDuration = dur+'s';
    h.style.fontSize = (12+Math.random()*14)+'px';
    layer.appendChild(h);
    setTimeout(()=>h.remove(), dur*1000+200);
  }, 260);
}
function stopHeartRain(){
  if(heartRainInterval){ clearInterval(heartRainInterval); heartRainInterval=null; }
}
// start heart rain once password screen becomes active
const pwObserver = new MutationObserver(()=>{
  if(document.getElementById('screen-password').classList.contains('active')){
    if(!heartRainInterval) startHeartRain('heart-rain');
  }
});
pwObserver.observe(document.getElementById('screen-password'), {attributes:true, attributeFilter:['class']});

/* ============================================================
   CAKE SCREEN
============================================================ */
const flame = document.getElementById('flame');
const cakeEl = document.getElementById('cake');
const blowHint = document.getElementById('blow-hint');
const continueBtn = document.getElementById('continue-btn');
let blownOut = false;

function spawnSprinkles(){
  const colors = ['#ffe3a8','#ff9ec7','#c89bff','#fff7c0','#8fe3c0'];
  for(let i=0;i<26;i++){
    const sp = document.createElement('div');
    sp.className='sprinkle';
    sp.style.background = colors[Math.floor(Math.random()*colors.length)];
    sp.style.left = (10+Math.random()*200)+'px';
    sp.style.bottom = (8+Math.random()*120)+'px';
    sp.style.transform = `rotate(${Math.random()*360}deg)`;
    cakeEl.appendChild(sp);
  }
}
spawnSprinkles();

function confettiBurst(){
  const colors = ['#ff8fc6','#c89bff','#ffd27a','#8fe3c0','#fff7c0','#ff5da2'];
  const container = document.body;
  for(let i=0;i<90;i++){
    const piece = document.createElement('div');
    const size = 6+Math.random()*6;
    piece.style.position='fixed';
    piece.style.zIndex=999;
    piece.style.width=size+'px';
    piece.style.height=(size*0.4)+'px';
    piece.style.background = colors[Math.floor(Math.random()*colors.length)];
    piece.style.left = (45+Math.random()*10)+'%';
    piece.style.top = '40%';
    piece.style.opacity = '0.95';
    piece.style.borderRadius='2px';
    const angle = Math.random()*Math.PI*2;
    const dist = 200+Math.random()*420;
    const dx = Math.cos(angle)*dist;
    const dy = Math.sin(angle)*dist - 150;
    const rot = Math.random()*720-360;
    piece.animate([
      { transform:`translate(0,0) rotate(0deg)`, opacity:1 },
      { transform:`translate(${dx}px, ${dy+500}px) rotate(${rot}deg)`, opacity:0 }
    ], { duration: 1800+Math.random()*900, easing:'cubic-bezier(.2,.7,.3,1)' });
    container.appendChild(piece);
    setTimeout(()=>piece.remove(), 2800);
  }
}

flame.addEventListener('click', ()=>{
  if(blownOut) return;
  blownOut = true;
  flame.classList.add('out');
  blowHint.textContent = 'your wish is on its way to the stars 🌠';
  confettiBurst();
  continueBtn.style.display='inline-block';
});

continueBtn.addEventListener('click', ()=>{
  goTo('screen-flowers');
  initFlowersScreen();
});

/* ============================================================
   HIDDEN POSTAL LETTER (opened only from the 30th love card)
============================================================ */
const envelope = document.getElementById('envelope');
const envHint = document.getElementById('env-hint');
const letterCloseBtn = document.getElementById('letter-close-btn');
const letterModal = document.getElementById('letter-modal');
let envelopeOpened = false;

function openLetterModal(){
  letterModal.classList.add('open');
  startHeartRain('heart-rain-letter');
}

envelope.addEventListener('click', ()=>{
  if(envelopeOpened) return;
  envelopeOpened = true;
  envelope.classList.add('open');
  envHint.style.opacity = '0';
  setTimeout(()=>{ letterCloseBtn.style.display='inline-block'; }, 900);
});

letterCloseBtn.addEventListener('click', ()=>{
  stopHeartRain();
  letterModal.classList.remove('open');
  letterHasBeenRead = true;
  maybeUnlockAnniversaryPlanet();
});

/* ============================================================
   FLOWER FARM SCENE
============================================================ */
let flowersInited = false;
function initFlowersScreen(){
  if(flowersInited) return;
  flowersInited = true;
  buildGarden();
  buildFarmPixies();
  runFarmChoreography();
}

function buildGarden(){
  const patch = document.getElementById('garden-patch');
  const kinds = ['🌷','🌻','🌼','🌸','🌹'];
  const count = 10;
  for(let i=0;i<count;i++){
    const f = document.createElement('div');
    f.className = 'garden-flower';
    f.textContent = kinds[i % kinds.length];
    f.style.left = (i*19)+'px';
    f.style.animationDelay = (i*0.25)+'s';
    patch.appendChild(f);
  }
}

function buildFarmPixies(){
  const layer = document.getElementById('farm-pixie-layer');
  const count = 16;
  for(let i=0;i<count;i++){
    const p = document.createElement('div');
    p.className = 'farm-pixie';
    p.style.left = (4 + Math.random()*92) + '%';
    p.style.top = (38 + Math.random()*46) + '%';
    const dur = 4.5 + Math.random()*3;
    p.style.animationDuration = dur+'s, '+dur+'s';
    p.style.animationDelay = (Math.random()*5)+'s, '+(Math.random()*5)+'s';
    layer.appendChild(p);
  }
}

function runFarmChoreography(){
  const male = document.getElementById('farm-male');
  const female = document.getElementById('farm-female');
  const maleFlower = document.getElementById('male-flower');
  const femaleFlower = document.getElementById('female-flower');
  const kissHeart = document.getElementById('kiss-heart');
  const swing = document.getElementById('swing');
  const continueBtn2 = document.getElementById('flowers-continue-btn');

  function setPos(el, leftPct){ el.style.left = leftPct+'%'; }

  // starting spots, walking side by side
  setPos(male, 12); setPos(female, 22);
  male.classList.add('walking'); female.classList.add('walking');

  // ---- phase 1: walk around together for ~10s (shuttle back and forth) ----
  const shuttleStops = [ [30,40], [10,20], [34,44], [16,26] ];
  shuttleStops.forEach((pair,i)=>{
    setTimeout(()=>{
      setPos(male, pair[0]);
      setPos(female, pair[1]);
    }, 300 + i*2400);
  });

  // ---- phase 2: head to the garden (~10s mark) ----
  setTimeout(()=>{
    setPos(male, 46);
    setPos(female, 54);
  }, 10000);

  // ---- phase 3: male steps to the flower patch and picks one (~11.8s) ----
  setTimeout(()=>{
    male.classList.remove('walking');
    setPos(male, 40);
  }, 11800);

  setTimeout(()=>{
    maleFlower.classList.add('show');
  }, 13000);

  // ---- phase 4: male walks to female and hands her the flower (~13.8s) ----
  setTimeout(()=>{
    male.classList.add('walking');
    setPos(male, 49);
  }, 13800);

  setTimeout(()=>{
    male.classList.remove('walking');
    maleFlower.classList.remove('show');
    femaleFlower.classList.add('show');
  }, 15500);

  // ---- phase 5: kiss (~16.5s) ----
  setTimeout(()=>{
    setPos(male, 51);
    setPos(female, 55);
  }, 16500);

  setTimeout(()=>{
    kissHeart.classList.add('pop');
  }, 17600);

  // ---- phase 6: head to the swing (~19s) ----
  setTimeout(()=>{
    kissHeart.classList.remove('pop');
    male.classList.add('walking'); female.classList.add('walking');
    setPos(male, 44);
    setPos(female, 50);
  }, 19200);

  // ---- phase 7: sit on the swing and swing together (~21.2s) ----
  setTimeout(()=>{
    male.classList.remove('walking'); female.classList.remove('walking');
    swing.classList.add('swing-swinging');
    continueBtn2.classList.add('show');
  }, 21200);
}

document.getElementById('flowers-continue-btn').addEventListener('click', ()=>{
  goTo('screen-lovetree');
  initLoveTreeScreen();
});

/* ============================================================
   LOVE TREE COUNTER SCREEN (seed -> heart tree -> counting numbers)
============================================================ */
const LT_START_DATE = new Date("2025-11-08T00:20:00"); // edit to your real date

function ltPad(n){ return String(n).padStart(2,'0'); }

function ltGetElapsedParts(){
  const now = new Date();
  let diff = Math.max(0, now - LT_START_DATE);
  const days = Math.floor(diff / 86400000);
  diff -= days * 86400000;
  const hours = Math.floor(diff / 3600000);
  diff -= hours * 3600000;
  const minutes = Math.floor(diff / 60000);
  diff -= minutes * 60000;
  const seconds = Math.floor(diff / 1000);
  return { days, hours, minutes, seconds };
}

function ltTick(){
  const p = ltGetElapsedParts();
  document.getElementById('lt-cd-days').textContent = p.days;
  document.getElementById('lt-cd-hours').textContent = ltPad(p.hours);
  document.getElementById('lt-cd-minutes').textContent = ltPad(p.minutes);
  document.getElementById('lt-cd-seconds').textContent = ltPad(p.seconds);
}

function ltAnimateValue(el, end, duration, delay, useDoubleDigit){
  setTimeout(()=>{
    const startTime = performance.now();
    function frame(now){
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(end * eased);
      el.textContent = useDoubleDigit ? ltPad(value) : value;
      if(progress < 1) requestAnimationFrame(frame);
      else el.textContent = useDoubleDigit ? ltPad(end) : end;
    }
    requestAnimationFrame(frame);
  }, delay);
}

function ltStartCountUp(){
  const target = ltGetElapsedParts();
  ltAnimateValue(document.getElementById('lt-cd-days'), target.days, 900, 0, false);
  ltAnimateValue(document.getElementById('lt-cd-hours'), target.hours, 900, 140, true);
  ltAnimateValue(document.getElementById('lt-cd-minutes'), target.minutes, 900, 280, true);
  ltAnimateValue(document.getElementById('lt-cd-seconds'), target.seconds, 900, 420, true);
  setTimeout(()=>{ ltTick(); ltTickInterval = setInterval(ltTick, 1000); }, 1450);
}

// small hearts arranged in concentric shells along a parametric heart curve,
// forming one clean, dense, big heart shape
function ltBuildCanopy(){
  const canopy = document.getElementById('lt-canopy');
  const palette = ['#ff4d6d','#ff8fa3','#ffb703','#ff7096','#e63950','#ffa5ab','#ff9770'];
  const shells = [0.28, 0.42, 0.56, 0.7, 0.83, 0.94, 1.0];
  const perShell = 13;
  const hearts = [];

  shells.forEach((fillLevel)=>{
    for(let i=0;i<perShell;i++){
      const t = (i / perShell) * Math.PI * 2 + (Math.random()-0.5)*0.18;
      const hx = 16 * Math.pow(Math.sin(t), 3) * fillLevel;
      const hy = -(13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t)) * fillLevel;
      const scale = 2.35;
      const jitter = (1 - fillLevel) * 2.9;
      const cx = 59 + hx * scale + (Math.random()-0.5) * jitter;
      const cy = 52 + hy * scale + (Math.random()-0.5) * jitter;

      const span = document.createElement('span');
      span.className = 'lt-mini-heart';
      span.textContent = '♥';
      span.style.left = cx + 'px';
      span.style.top = cy + 'px';
      span.style.color = palette[Math.floor(Math.random() * palette.length)];
      span.style.fontSize = (5 + Math.random() * 4) + 'px';
      canopy.appendChild(span);
      hearts.push(span);
    }
  });
  return hearts;
}

let ltInited = false;
let ltTickInterval = null;
function initLoveTreeScreen(){
  if(ltInited) return;
  ltInited = true;

  const canopyHearts = ltBuildCanopy();
  const seed = document.getElementById('lt-seed');
  const trunk = document.getElementById('lt-trunk');
  const textCol = document.getElementById('lt-textCol');

  setTimeout(()=>{
    textCol.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    textCol.style.opacity = '1';
    textCol.style.transform = 'translateY(0)';
  }, 200);

  requestAnimationFrame(()=>{
    seed.style.transition = 'top 0.6s cubic-bezier(.5,0,.7,1)';
    seed.style.top = 'calc(100% - 12px)';
  });

  setTimeout(()=>{
    seed.style.transition = 'opacity 0.25s ease';
    seed.style.opacity = '0';
    trunk.style.transition = 'transform 0.45s cubic-bezier(.34,1.56,.64,1)';
    trunk.style.transform = 'translateX(-50%) scaleY(1)';
  }, 650);

  setTimeout(()=>{
    canopyHearts.forEach((h, i)=>{
      setTimeout(()=>{
        h.style.transition = 'transform 0.3s cubic-bezier(.34,1.56,.64,1), opacity 0.25s ease';
        h.style.transform = 'scale(1)';
        h.style.opacity = '1';
      }, i * 9);
    });
  }, 1050);

  setTimeout(ltStartCountUp, 1500);
}

document.getElementById('lovetree-continue-btn').addEventListener('click', ()=>{
  if(ltTickInterval) clearInterval(ltTickInterval);
  goTo('screen-proposal');
});

/* ============================================================
   PROPOSAL SCREEN
============================================================ */
const noBtn = document.getElementById('no-btn');
const yesBtn = document.getElementById('yes-btn');
let noScale = 1;

noBtn.addEventListener('click', ()=>{
  noScale = Math.max(0.18, noScale - 0.13);
  noBtn.style.transform = `scale(${noScale})`;
});

yesBtn.addEventListener('click', ()=>{
  runVortexTransition();
});

function runVortexTransition(){
  const layer = document.getElementById('vortex-layer');
  layer.classList.add('active');
  const hearts = ['💗','💕','💜','💖','❤️','✨','💘'];
  const count = 170;
  const cx = window.innerWidth/2, cy = window.innerHeight/2;
  const frag = document.createDocumentFragment();
  for(let i=0;i<count;i++){
    const el = document.createElement('div');
    el.className = 'vortex-heart';
    el.textContent = hearts[Math.floor(Math.random()*hearts.length)];
    el.style.fontSize = (12+Math.random()*22)+'px';
    const angle = Math.random()*Math.PI*2;
    const dist = 160+Math.random()*Math.max(window.innerWidth,window.innerHeight)*0.75;
    const startX = cx + Math.cos(angle)*dist;
    const startY = cy + Math.sin(angle)*dist;
    el.style.left = startX+'px';
    el.style.top = startY+'px';
    el.style.opacity = '0';
    frag.appendChild(el);
    const spins = 2+Math.random()*3;
    el.animate([
      { transform:`translate(0,0) rotate(0deg) scale(1)`, opacity:0 },
      { transform:`translate(${(cx-startX)*0.6}px, ${(cy-startY)*0.6}px) rotate(${spins*180}deg) scale(1.15)`, opacity:1, offset:0.5 },
      { transform:`translate(${cx-startX}px, ${cy-startY}px) rotate(${spins*360}deg) scale(0.15)`, opacity:0 }
    ], { duration: 1300+Math.random()*600, easing:'cubic-bezier(.3,.6,.2,1)', delay: Math.random()*400 });
  }
  layer.appendChild(frag);
  setTimeout(()=>{
    goTo('screen-galaxy');
    initGalaxyScreen();
    setTimeout(()=>{
      layer.classList.remove('active');
      layer.innerHTML = '';
    }, 700);
  }, 2100);
}

/* ============================================================
   FINAL GALAXY SCREEN
============================================================ */
const galaxyMessages = [
 "TE AMO💖","LOVE U TO THE MOON AND BACK💗","PARA SIEMPRE💖","MI ESPOSA💕",
  "YOU ARE MY MAGIC ∞","LOVE U LOADSSSSSSS💕","MSHADO💘","MY INFINITE LOVE💖",
  "FOREVER MINE💘","MASTOLE KA LUKHELA💕","MI VIDA💖","ALMA GEMELA💗", "iRUlER LAMI💕"  
];

let galaxyInited = false;
function initGalaxyScreen(){
  if(galaxyInited) return;
  galaxyInited = true;
  drawGalaxyCanvas();
  scatterFloatingMessages();
  startShootingStars();
  setTimeout(()=>{
    document.getElementById('reveal-btn-wrap').classList.add('show');
  }, 2600);
}

function drawHeartPoint(t, scale){
  // parametric heart curve, returns {x,y} centered at 0,0
  const x = 16*Math.pow(Math.sin(t),3);
  const y = 13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t);
  return { x: x*scale, y: -y*scale };
}

function drawTinyHeart(ctx, x, y, size, alpha){
  ctx.save();
  ctx.translate(x,y);
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  const s = size;
  ctx.moveTo(0, s*0.3);
  ctx.bezierCurveTo(-s, -s*0.6, -s*1.6, s*0.4, 0, s*1.3);
  ctx.bezierCurveTo(s*1.6, s*0.4, s, -s*0.6, 0, s*0.3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawGalaxyCanvas(){
  const canvasEl = document.getElementById('galaxy-canvas');
  let w = canvasEl.offsetWidth || window.innerWidth;
  let h = canvasEl.offsetHeight || window.innerHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, w/h, 0.1, 2000);
  camera.position.set(0, 46, 145);
  camera.lookAt(0, 18, 0);

  const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h, false);

  window.addEventListener('resize', ()=>{
    w = canvasEl.offsetWidth; h = canvasEl.offsetHeight;
    camera.aspect = w/h; camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  });

  // soft round glow sprite
  function makeGlowTexture(){
    const size = 128;
    const cv = document.createElement('canvas'); cv.width = cv.height = size;
    const ctx = cv.getContext('2d');
    const g = ctx.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
    g.addColorStop(0,'rgba(255,255,255,1)');
    g.addColorStop(0.25,'rgba(255,255,255,0.9)');
    g.addColorStop(0.6,'rgba(255,255,255,0.25)');
    g.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0,0,size,size);
    return new THREE.CanvasTexture(cv);
  }
  const glowTex = makeGlowTexture();

  // tiny heart sprite texture (reuses the site's heart-drawing style)
  function makeHeartTexture(color){
    const size = 128;
    const cv = document.createElement('canvas'); cv.width = cv.height = size;
    const hctx = cv.getContext('2d');
    hctx.translate(size/2, size/2+10);
    hctx.scale(3.6,3.6);
    hctx.beginPath();
    hctx.moveTo(0,6);
    hctx.bezierCurveTo(-14,-8,-14,-20,0,-12);
    hctx.bezierCurveTo(14,-20,14,-8,0,6);
    hctx.closePath();
    hctx.fillStyle = color; hctx.shadowColor = color; hctx.shadowBlur = 12;
    hctx.fill();
    return new THREE.CanvasTexture(cv);
  }

  // ---- background starfield ----
  (function(){
    const count = 1600;
    const pos = new Float32Array(count*3);
    for(let i=0;i<count;i++){
      const r = 300+Math.random()*700;
      const th = Math.random()*Math.PI*2;
      const ph = Math.acos(2*Math.random()-1);
      pos[i*3]   = r*Math.sin(ph)*Math.cos(th);
      pos[i*3+1] = r*Math.cos(ph);
      pos[i*3+2] = r*Math.sin(ph)*Math.sin(th);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
    const mat = new THREE.PointsMaterial({ size:1.3, map:glowTex, transparent:true, depthWrite:false, color:0xffffff, opacity:0.75, blending:THREE.AdditiveBlending });
    scene.add(new THREE.Points(geo, mat));
  })();

  const galaxyGroup = new THREE.Group();
  scene.add(galaxyGroup);

  // ---- spiral galaxy, colored from the page's own palette ----
  (function(){
    const count = 14000, arms = 4;
    const pos = new Float32Array(count*3), col = new Float32Array(count*3);
    const cCore = new THREE.Color(0xfff2d8);   // warm gold-white core
    const cMid  = new THREE.Color(0xff5da2);   // --rose
    const cEdge = new THREE.Color(0x8b5cf6);   // --violet
    const cOuter= new THREE.Color(0x3d0420);   // --crimson
    for(let i=0;i<count;i++){
      const t = Math.random();
      const radius = t*58*(0.3+Math.random()*0.7);
      const armOffset = (i%arms)*(Math.PI*2/arms);
      const spin = radius*0.17;
      const spread = (1-t)*0.6+0.05;
      const angle = armOffset+spin+(Math.random()-0.5)*spread;
      const x = Math.cos(angle)*radius + (Math.random()-0.5)*(2+t*3);
      const z = Math.sin(angle)*radius + (Math.random()-0.5)*(2+t*3);
      const y = (Math.random()-0.5)*(1.1*(1-t)+0.3)*3;
      pos[i*3]=x; pos[i*3+1]=y; pos[i*3+2]=z;
      let c;
      if(t<0.15) c = cCore.clone().lerp(cMid, t/0.15);
      else if(t<0.45) c = cMid.clone().lerp(cEdge, (t-0.15)/0.3);
      else c = cEdge.clone().lerp(cOuter, (t-0.45)/0.55);
      col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
    geo.setAttribute('color', new THREE.BufferAttribute(col,3));
    const mat = new THREE.PointsMaterial({ size:0.75, map:glowTex, transparent:true, depthWrite:false, vertexColors:true, opacity:0.9, blending:THREE.AdditiveBlending });
    galaxyGroup.add(new THREE.Points(geo, mat));
  })();

  // ---- black hole core + halo ----
  (function(){
    const core = new THREE.Mesh(new THREE.SphereGeometry(3,32,32), new THREE.MeshBasicMaterial({ color:0x000000 }));
    galaxyGroup.add(core);
    const halo = new THREE.Mesh(new THREE.RingGeometry(3.2,6.2,64), new THREE.MeshBasicMaterial({ color:0xffd27a, side:THREE.DoubleSide, transparent:true, opacity:0.55 }));
    halo.rotation.x = Math.PI/2;
    galaxyGroup.add(halo);
  })();

  // ---- heart-shaped particle jet rising from the core ----
  let heartPts, heartBase;
  (function(){
    const count = 5000;
    const pos = new Float32Array(count*3), col = new Float32Array(count*3), base = new Float32Array(count*3);
    const pink = new THREE.Color(0xffb3d9), hot = new THREE.Color(0xff5da2);
    for(let i=0;i<count;i++){
      const t = Math.random()*Math.PI*2;
      const hx = 16*Math.pow(Math.sin(t),3);
      const hy = 13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t);
      const scale = 1.05;
      const jitter = 1.0+Math.random()*1.3;
      const x = hx*scale*(0.85+Math.random()*0.3);
      const y = 26 + hy*scale*(0.85+Math.random()*0.3);
      const z = (Math.random()-0.5)*jitter*2;
      pos[i*3]=x; pos[i*3+1]=y; pos[i*3+2]=z;
      base[i*3]=x; base[i*3+1]=y; base[i*3+2]=z;
      const c = pink.clone().lerp(hot, Math.random());
      col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
    geo.setAttribute('color', new THREE.BufferAttribute(col,3));
    const mat = new THREE.PointsMaterial({ size:1.0, map:glowTex, transparent:true, depthWrite:false, vertexColors:true, opacity:0.95, blending:THREE.AdditiveBlending });
    heartPts = new THREE.Points(geo, mat);
    heartBase = base;
    galaxyGroup.add(heartPts);
  })();

  // ---- connecting stream between core and heart base ----
  (function(){
    const count = 900;
    const pos = new Float32Array(count*3);
    for(let i=0;i<count;i++){
      const y = Math.random()*24;
      const spread = 0.4+(y/24)*1.5;
      pos[i*3] = (Math.random()-0.5)*spread;
      pos[i*3+1] = y+3;
      pos[i*3+2] = (Math.random()-0.5)*spread;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
    const mat = new THREE.PointsMaterial({ size:0.65, map:glowTex, color:0xff8fc6, transparent:true, depthWrite:false, opacity:0.85, blending:THREE.AdditiveBlending });
    galaxyGroup.add(new THREE.Points(geo, mat));
  })();

  // ---- floor of small stars & hearts spiraling inward into the black hole, spread across the whole disc ----
  const infallers = [];
  function resetInfaller(s){
    s.userData.angle = Math.random()*Math.PI*2;
    s.userData.radius = 66+Math.random()*26;
  }
  (function(){
    const total = 165;
    const heartColors = ['#ff5da2','#ffb3d9','#ffd27a'];
    for(let i=0;i<total;i++){
      const isHeart = Math.random()<0.45;
      let sprite;
      if(isHeart){
        const tex = makeHeartTexture(heartColors[i%heartColors.length]);
        sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map:tex, transparent:true, depthWrite:false }));
        const s = 1.2+Math.random()*1.4; sprite.scale.set(s,s,1);
      } else {
        sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map:glowTex, color:0xffe9f5, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending }));
        const s = 0.8+Math.random()*1.0; sprite.scale.set(s,s,1);
      }
      sprite.userData.angle = Math.random()*Math.PI*2;
      sprite.userData.radius = 4+Math.random()*88;
      sprite.userData.speed = (0.004+Math.random()*0.008)*(Math.random()<0.5?1:-1);
      sprite.userData.fall = 0.01+Math.random()*0.017;
      galaxyGroup.add(sprite);
      infallers.push(sprite);
    }
  })();

  // ---- orbiting love-message text, parented to galaxyGroup so it rotates WITH the heart ----
  function makeTextSprite(message, color){
    const cv = document.createElement('canvas');
    const tctx = cv.getContext('2d');
    const fontSize = 46;
    tctx.font = `bold ${fontSize}px "Trebuchet MS", "Segoe UI", sans-serif`;
    const textWidth = tctx.measureText(message).width;
    cv.width = textWidth + 40;
    cv.height = fontSize + 40;
    tctx.font = `bold ${fontSize}px "Trebuchet MS", "Segoe UI", sans-serif`;
    tctx.textBaseline = 'middle';
    tctx.shadowColor = color;
    tctx.shadowBlur = 18;
    tctx.fillStyle = color;
    tctx.fillText(message, 20, cv.height/2);
    const tex = new THREE.CanvasTexture(cv);
    const mat = new THREE.SpriteMaterial({ map:tex, transparent:true, depthWrite:false });
    const sprite = new THREE.Sprite(mat);
    const s = 0.052;
    sprite.scale.set(cv.width*s, cv.height*s, 1);
    return sprite;
  }
  (function(){
    const count = galaxyMessages.length;
    // three interleaved radii + alternating heights so labels never overlap or bunch together
    const radii = [50, 62, 74];
    galaxyMessages.forEach((msg, i)=>{
      const angle = (i/count)*Math.PI*2;
      const radius = radii[i % radii.length];
      const height = 3 + (i % 2)*7;
      const sprite = makeTextSprite(msg, i % 2 === 0 ? '#ff5da2' : '#ffe9f5');
      sprite.position.set(Math.cos(angle)*radius, height, Math.sin(angle)*radius);
      galaxyGroup.add(sprite);
    });
  })();

  // ---- hidden anniversary planet: gray, rotates with the galaxy, unlocked after the 30 messages + letter ----
  function makePlanetTexture(){
    const size = 256;
    const cv = document.createElement('canvas'); cv.width = cv.height = size;
    const pctx = cv.getContext('2d');
    const g = pctx.createRadialGradient(size*0.36, size*0.34, size*0.05, size*0.5, size*0.5, size*0.62);
    g.addColorStop(0, '#e4e4e8');
    g.addColorStop(0.45, '#aeaeb6');
    g.addColorStop(0.8, '#75757e');
    g.addColorStop(1, '#4c4c54');
    pctx.fillStyle = g;
    pctx.fillRect(0,0,size,size);
    // a few soft crater-like speckles for texture
    for(let i=0;i<28;i++){
      const rx = Math.random()*size, ry = Math.random()*size, rr = 4+Math.random()*10;
      pctx.beginPath();
      pctx.fillStyle = `rgba(0,0,0,${0.05+Math.random()*0.08})`;
      pctx.arc(rx, ry, rr, 0, Math.PI*2);
      pctx.fill();
    }
    return new THREE.CanvasTexture(cv);
  }

  const planetGroup = new THREE.Group();
  planetGroup.position.set(52, 11, 28);
  planetGroup.scale.setScalar(0.001);
  galaxyGroup.add(planetGroup);

  const planetMesh = new THREE.Mesh(
    new THREE.SphereGeometry(3.4, 32, 32),
    new THREE.MeshBasicMaterial({ map: makePlanetTexture() })
  );
  planetGroup.add(planetMesh);

  const planetRing = new THREE.Mesh(
    new THREE.RingGeometry(5.0, 6.2, 48),
    new THREE.MeshBasicMaterial({ color:0xcfcfd8, side:THREE.DoubleSide, transparent:true, opacity:0.45 })
  );
  planetRing.rotation.x = Math.PI/2.4;
  planetGroup.add(planetRing);

  // tiny stars + hearts orbiting the planet locally, in shades of gray
  const planetOrbiters = [];
  (function(){
    const grayPalette = ['#e8e8ee','#c7c7d1','#9d9da6'];
    for(let i=0;i<10;i++){
      const isHeart = i % 3 === 0;
      let sprite;
      if(isHeart){
        const tex = makeHeartTexture(grayPalette[i % grayPalette.length]);
        sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map:tex, transparent:true, depthWrite:false }));
        sprite.scale.set(1.0, 1.0, 1);
      } else {
        sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map:glowTex, color:0xd8d8e0, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending }));
        sprite.scale.set(0.6, 0.6, 1);
      }
      sprite.userData.angle = Math.random()*Math.PI*2;
      sprite.userData.radius = 7 + Math.random()*3;
      sprite.userData.tilt = (Math.random()-0.5)*0.6;
      sprite.userData.speed = 0.006 + Math.random()*0.01;
      planetGroup.add(sprite);
      planetOrbiters.push(sprite);
    }
  })();

  let planetRevealed = false;   // taps become active once true
  let planetRevealing = false;  // grow-in animation in progress
  anniversaryPlanetReveal = function(){
    if(planetRevealed) return;
    planetRevealed = true;
    planetRevealing = true;
    const hint = document.getElementById('planet-hint');
    if(hint) hint.classList.add('show');
  };

  // tap / click detection on the gray planet -> opens the anniversary PIN
  const raycaster = new THREE.Raycaster();
  const mouseVec = new THREE.Vector2();
  let lastPlanetTapTime = 0;
  function tryPlanetTap(clientX, clientY){
    if(!planetRevealed) return;
    if(document.getElementById('pin-modal').classList.contains('open')) return;
    const now = performance.now();
    if(now - lastPlanetTapTime < 400) return; // debounce
    lastPlanetTapTime = now;
    const rect = canvasEl.getBoundingClientRect();
    mouseVec.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouseVec.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouseVec, camera);
    const hits = raycaster.intersectObject(planetMesh);
    if(hits.length){
      openAnniversaryPin();
    }
  }
  canvasEl.addEventListener('click', (e)=>tryPlanetTap(e.clientX, e.clientY));
  canvasEl.addEventListener('touchend', (e)=>{
    if(e.changedTouches && e.changedTouches[0]){
      tryPlanetTap(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    }
  });

  const clock = new THREE.Clock();
  function animate(){
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    galaxyGroup.rotation.y = elapsed*0.12;

    // heart jet shimmer
    const posAttr = heartPts.geometry.attributes.position;
    for(let i=0;i<posAttr.count;i++){
      const bx = heartBase[i*3], by = heartBase[i*3+1], bz = heartBase[i*3+2];
      const wob = Math.sin(elapsed*3+i)*0.13;
      posAttr.array[i*3]   = bx+wob;
      posAttr.array[i*3+1] = by+Math.sin(elapsed*2+i*0.5)*0.18;
      posAttr.array[i*3+2] = bz+wob;
    }
    posAttr.needsUpdate = true;

    // spiral small stars/hearts inward toward the black hole, then respawn
    infallers.forEach(s=>{
      s.userData.angle += s.userData.speed;
      s.userData.radius -= s.userData.fall;
      if(s.userData.radius <= 2) resetInfaller(s);
      const r = s.userData.radius;
      s.position.set(Math.cos(s.userData.angle)*r, 0.6+Math.sin(elapsed*2+r)*0.4, Math.sin(s.userData.angle)*r*0.94);
    });

    // hidden anniversary planet: grow-in reveal, gentle spin, orbiting mini stars/hearts
    if(planetRevealing){
      const currentScale = planetGroup.scale.x;
      const nextScale = currentScale + (1 - currentScale) * 0.05;
      planetGroup.scale.setScalar(nextScale);
      if(Math.abs(1 - nextScale) < 0.01){
        planetGroup.scale.setScalar(1);
        planetRevealing = false;
      }
    }
    if(planetRevealed){
      planetMesh.rotation.y = elapsed * 0.25;
      planetRing.rotation.z = elapsed * 0.1;
      planetOrbiters.forEach(o=>{
        o.userData.angle += o.userData.speed;
        const r = o.userData.radius;
        o.position.set(
          Math.cos(o.userData.angle)*r,
          Math.sin(o.userData.angle*0.7)*r*o.userData.tilt,
          Math.sin(o.userData.angle)*r
        );
      });
    }

    renderer.render(scene, camera);
  }
  animate();
}

function scatterFloatingMessages(){
  // messages now live inside the 3D scene (see drawGalaxyCanvas) so they
  // rotate together with the galaxy instead of sitting on a flat overlay.
  // kept as a no-op so initGalaxyScreen() doesn't need to change.
}

/* ---------- Shooting stars ---------- */
let shootingInterval = null;
function startShootingStars(){
  const layer = document.getElementById('shooting-layer');
  function spawn(){
    const star = document.createElement('div');
    const startX = Math.random()*window.innerWidth*0.7;
    const startY = Math.random()*window.innerHeight*0.35;
    const length = 90+Math.random()*60;
    const angle = 25+Math.random()*15;
    star.style.position='absolute';
    star.style.left = startX+'px';
    star.style.top = startY+'px';
    star.style.width = length+'px';
    star.style.height = '2px';
    star.style.background = 'linear-gradient(90deg, #fff, rgba(255,255,255,0))';
    star.style.borderRadius='2px';
    star.style.transform = `rotate(${angle}deg)`;
    star.style.boxShadow = '0 0 8px #fff, 0 0 16px rgba(255,255,255,0.7)';
    star.style.opacity='0';
    layer.appendChild(star);
    const dist = 260+Math.random()*180;
    const rad = angle*Math.PI/180;
    star.animate([
      { transform:`rotate(${angle}deg) translateX(0)`, opacity:0 },
      { transform:`rotate(${angle}deg) translateX(${dist*0.15}px)`, opacity:1, offset:0.12 },
      { transform:`rotate(${angle}deg) translateX(${dist}px)`, opacity:0 }
    ], { duration: 900+Math.random()*500, easing:'ease-in' });
    setTimeout(()=>star.remove(), 1500);
  }
  shootingInterval = setInterval(()=>{
    if(Math.random()<0.85) spawn();
  }, 1400);
}

/* ============================================================
   30 LOVE MESSAGES (EN + ES)
============================================================ */
const loveMessages = [
  {lang:'EN', text:"Happy birthday, Malindi. You are the brightest star in my universe."},
  {lang:'ES', text:"Feliz cumpleaños, mi amor. Eres la estrella más brillante de mi universo."},
  {lang:'EN', text:"Every year with you feels like a new galaxy waiting to be explored."},
  {lang:'ES', text:"Cada año a tu lado es una nueva galaxia por descubrir."},
  {lang:'EN', text:"I love you more than all the stars combined."},
  {lang:'ES', text:"Te amo más que a todas las estrellas juntas."},
  {lang:'EN', text:"You are my favorite person in this whole universe."},
  {lang:'ES', text:"Eres mi persona favorita en todo el universo."},
  {lang:'EN', text:"Today the whole sky celebrates because you were born."},
  {lang:'ES', text:"Hoy el cielo entero celebra porque tú naciste."},
  {lang:'EN', text:"With you, even ordinary days feel magical."},
  {lang:'ES', text:"Contigo hasta los días comunes se vuelven mágicos."},
  {lang:'EN', text:"You are my forever and my always."},
  {lang:'ES', text:"Eres mi para siempre."},
  {lang:'EN', text:"I promise to love you across every galaxy, every lifetime."},
  {lang:'ES', text:"Prometo amarte en cada galaxia, en cada vida."},
  {lang:'EN', text:"Happy birthday to the woman who lights up my whole world."},
  {lang:'ES', text:"Feliz cumpleaños a la mujer que ilumina mi mundo entero."},
  {lang:'EN', text:"You make my heart orbit around you completely."},
  {lang:'ES', text:"Mi corazón gira completamente alrededor tuyo."},
  {lang:'EN', text:"I'm endlessly grateful the universe gave me you."},
  {lang:'ES', text:"Estoy eternamente agradecido de que el universo te trajera a mí."},
  {lang:'EN', text:"May this year bring you as much joy as you bring me."},
  {lang:'ES', text:"Que este año te traiga tanta alegría como tú me traes a mí."},
  {lang:'EN', text:"You are proof that magic is real."},
  {lang:'ES', text:"Eres la prueba de que la magia existe."},
  {lang:'EN', text:"My love for you grows infinitely, like the universe itself."},
  {lang:'ES', text:"Mi amor por ti crece infinitamente, como el universo mismo."},
  {lang:'EN', text:"Here's to another year of loving you more every single day, Malindi."},
  {lang:'ES', text:"Brindo por otro año amándote más cada día, mi Malindi."}
];

let msgIndex = 0;
function showMessage(i){
  const m = loveMessages[i];
  const isLast = i === loveMessages.length-1;
  document.getElementById('msg-count').textContent = (i+1)+' / '+loveMessages.length;
  document.getElementById('msg-text').textContent = m.text;
  document.getElementById('msg-lang').textContent = m.lang === 'EN' ? 'English' : 'Español';
  document.getElementById('next-msg-btn').style.display = isLast ? 'none' : 'inline-block';
  document.getElementById('last-card-actions').style.display = isLast ? 'flex' : 'none';
  const card = document.getElementById('msg-card');
  card.style.animation='none';
  void card.offsetWidth;
  card.style.animation='msgIn 0.5s cubic-bezier(.2,.8,.3,1.2) forwards';
  if(isLast){
    allMessagesViewed = true;
    maybeUnlockAnniversaryPlanet();
  }
}

document.getElementById('reveal-btn').addEventListener('click', ()=>{
  msgIndex = 0;
  showMessage(msgIndex);
  document.getElementById('cards-modal').classList.add('open');
});
document.getElementById('next-msg-btn').addEventListener('click', ()=>{
  msgIndex = Math.min(msgIndex+1, loveMessages.length-1);
  showMessage(msgIndex);
});
document.getElementById('close-cards').addEventListener('click', ()=>{
  document.getElementById('cards-modal').classList.remove('open');
});
document.getElementById('close-cards-final-btn').addEventListener('click', ()=>{
  document.getElementById('cards-modal').classList.remove('open');
});
document.getElementById('open-letter-btn').addEventListener('click', ()=>{
  document.getElementById('cards-modal').classList.remove('open');
  openLetterModal();
});

/* ============================================================
   ANNIVERSARY PIN
============================================================ */
const pinModal = document.getElementById('pin-modal');
const pinInput = document.getElementById('pin-input');
const pinHint = document.getElementById('pin-hint');
const pinCard = document.querySelector('.pin-card');

function openAnniversaryPin(){
  pinModal.classList.add('open');
  pinInput.value = '';
  pinHint.textContent = '4 digits ✨';
  setTimeout(()=>pinInput.focus(), 300);
}

function tryPinUnlock(){
  const val = pinInput.value.trim();
  if(val === '1208'){
    pinHint.textContent = 'the stars remember ✨';
    setTimeout(()=>{
      pinModal.classList.remove('open');
      goTo('screen-aurora');
      initAuroraScreen();
    }, 500);
  } else {
    pinHint.textContent = 'not quite… try again';
    pinCard.classList.remove('shake');
    void pinCard.offsetWidth;
    pinCard.classList.add('shake');
  }
}
document.getElementById('pin-submit').addEventListener('click', tryPinUnlock);
pinInput.addEventListener('keydown', e=>{ if(e.key==='Enter') tryPinUnlock(); });
document.getElementById('pin-close-btn').addEventListener('click', ()=>{
  pinModal.classList.remove('open');
});

/* ============================================================
   AURORA / ARCHIPELAGO / SHOOTING STAR / LETTER FINALE (3D, Three.js)
============================================================ */
let auroraInited = false;
let auroraProgress = 0;
const AURORA_MAX_STEPS = 6;
let auroraWalkingActive = false;

function initAuroraScreen(){
  if(auroraInited) return;
  auroraInited = true;

  const canvasEl = document.getElementById('aurora-canvas-3d');
  let w = canvasEl.offsetWidth || window.innerWidth;
  let h = canvasEl.offsetHeight || window.innerHeight;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x03040a, 0.0022);

  const camera = new THREE.PerspectiveCamera(58, w/h, 0.1, 3000);
  const camStart = { pos:new THREE.Vector3(0, 24, 74), look:new THREE.Vector3(0, 8, -50) };
  const camEnd   = { pos:new THREE.Vector3(0, 11, 14), look:new THREE.Vector3(0, 5, -60) };
  camera.position.copy(camStart.pos);
  let currentLook = camStart.look.clone();
  camera.lookAt(currentLook);

  const renderer = new THREE.WebGLRenderer({ canvas:canvasEl, antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h, false);

  window.addEventListener('resize', ()=>{
    w = canvasEl.offsetWidth; h = canvasEl.offsetHeight;
    camera.aspect = w/h; camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  });

  // ---- lighting so the 3D islands actually read as 3D, not flat silhouettes ----
  scene.add(new THREE.HemisphereLight(0x7fa7c9, 0x02030a, 0.75));
  const moonLight = new THREE.DirectionalLight(0xbfd6ff, 0.55);
  moonLight.position.set(-40, 90, 30);
  scene.add(moonLight);

  // ---- glow sprite texture, reused for stars / trail / burst particles ----
  function makeGlowTexture(){
    const size = 128;
    const cv = document.createElement('canvas'); cv.width = cv.height = size;
    const ctx = cv.getContext('2d');
    const g = ctx.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
    g.addColorStop(0,'rgba(255,255,255,1)');
    g.addColorStop(0.3,'rgba(255,255,255,0.85)');
    g.addColorStop(0.65,'rgba(200,225,255,0.25)');
    g.addColorStop(1,'rgba(200,225,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0,0,size,size);
    return new THREE.CanvasTexture(cv);
  }
  const glowTex = makeGlowTexture();

  // ---- starfield ----
  (function(){
    const count = 900;
    const pos = new Float32Array(count*3);
    for(let i=0;i<count;i++){
      const r = 400+Math.random()*700;
      const th = Math.random()*Math.PI*2;
      const ph = Math.acos(Math.random()*0.85); // upper hemisphere only
      pos[i*3]   = r*Math.sin(ph)*Math.cos(th);
      pos[i*3+1] = Math.abs(r*Math.cos(ph)) + 20;
      pos[i*3+2] = r*Math.sin(ph)*Math.sin(th) - 100;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
    const mat = new THREE.PointsMaterial({ size:1.4, map:glowTex, transparent:true, depthWrite:false, color:0xffffff, opacity:0.85, blending:THREE.AdditiveBlending });
    scene.add(new THREE.Points(geo, mat));
  })();

  // ---- aurora ribbons: curtains of light, waving in 3D, colored like the reference photo ----
  function makeAuroraTexture(colorA, colorB){
    const cv = document.createElement('canvas'); cv.width=64; cv.height=256;
    const ctx = cv.getContext('2d');
    const g = ctx.createLinearGradient(0,0,0,256);
    g.addColorStop(0,'rgba(0,0,0,0)');
    g.addColorStop(0.15, colorA);
    g.addColorStop(0.55, colorB);
    g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0,0,64,256);
    return new THREE.CanvasTexture(cv);
  }
  const auroraRibbons = [];
  const ribbonDefs = [
    { color:['rgba(15,174,116,0.75)','rgba(189,250,224,0.5)'], x:-30, y:95, z:-220, rotY:0.3, w:260, hgt:130 },
    { color:['rgba(122,74,156,0.7)','rgba(215,156,240,0.5)'],  x:35,  y:105, z:-240, rotY:-0.25, w:230, hgt:150 },
    { color:['rgba(23,201,143,0.55)','rgba(141,230,196,0.4)'], x:-60, y:80, z:-200, rotY:0.5, w:200, hgt:100 }
  ];
  ribbonDefs.forEach((def)=>{
    const tex = makeAuroraTexture(def.color[0], def.color[1]);
    const geo = new THREE.PlaneGeometry(def.w, def.hgt, 32, 12);
    const mat = new THREE.MeshBasicMaterial({ map:tex, transparent:true, side:THREE.DoubleSide, blending:THREE.AdditiveBlending, depthWrite:false });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(def.x, def.y, def.z);
    mesh.rotation.y = def.rotY;
    mesh.userData.basePos = geo.attributes.position.array.slice();
    scene.add(mesh);
    auroraRibbons.push(mesh);
  });

  // ---- 3D archipelago: winding peninsula landmasses, viewed from an elevated edge ----
  function buildLandShape(points){
    const shape = new THREE.Shape();
    const vecs = points.map(p => new THREE.Vector2(p[0], p[1]));
    shape.moveTo(vecs[0].x, vecs[0].y);
    shape.splineThru(vecs.slice(1));
    const last = points[points.length-1];
    shape.lineTo(last[0], -60);
    shape.lineTo(points[0][0], -60);
    shape.closePath();
    return shape;
  }
  const landDefs = [
    { z:-190, y:-3, scale:1.5, color:0x0d1a2c, pts:[[-110,4],[-70,22],[-30,-8],[10,12],[40,32],[70,4],[100,20],[110,10]] },
    { z:-120, y:-1.5, scale:1.35, color:0x081220, pts:[[-100,10],[-60,-10],[-20,26],[20,4],[55,-14],[85,18],[105,2],[115,14]] },
    { z:-55, y:0, scale:1.2, color:0x030608, pts:[[-95,18],[-55,-22],[-15,30],[25,-6],[60,24],[90,-8],[112,16],[120,6]] }
  ];
  landDefs.forEach((def)=>{
    const shape = buildLandShape(def.pts);
    const geo = new THREE.ExtrudeGeometry(shape, { depth:6, bevelEnabled:true, bevelThickness:1, bevelSize:1, bevelSegments:1 });
    const mat = new THREE.MeshStandardMaterial({ color:def.color, roughness:0.95, metalness:0.05 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI/2;
    mesh.scale.set(def.scale, def.scale, 1);
    mesh.position.set(0, def.y, def.z);
    scene.add(mesh);
  });

  // ---- sea ----
  const seaGeo = new THREE.PlaneGeometry(1000, 500, 1, 1);
  const seaMat = new THREE.MeshStandardMaterial({ color:0x0a1622, roughness:0.35, metalness:0.4 });
  const sea = new THREE.Mesh(seaGeo, seaMat);
  sea.rotation.x = -Math.PI/2;
  sea.position.set(0, -3.2, -150);
  scene.add(sea);

  // ---- cliff foreground she's standing on ----
  const cliffShape = new THREE.Shape();
  cliffShape.moveTo(-140,0);
  cliffShape.bezierCurveTo(-90,10,-40,-6,0,6);
  cliffShape.bezierCurveTo(40,14,90,0,140,8);
  cliffShape.lineTo(140,-40);
  cliffShape.lineTo(-140,-40);
  cliffShape.closePath();
  const cliffGeo = new THREE.ExtrudeGeometry(cliffShape, { depth:30, bevelEnabled:false });
  const cliffMat = new THREE.MeshStandardMaterial({ color:0x020306, roughness:1 });
  const cliffMesh = new THREE.Mesh(cliffGeo, cliffMat);
  cliffMesh.rotation.x = -Math.PI/2;
  cliffMesh.position.set(0, -6, 26);
  scene.add(cliffMesh);

  // ---- tap-to-walk: dolly the camera forward toward the cliff edge ----
  function tweenCamera(duration){
    const startPos = camera.position.clone();
    const startLook = currentLook.clone();
    const t = Math.min(auroraProgress / AURORA_MAX_STEPS, 1);
    const targetPos = camStart.pos.clone().lerp(camEnd.pos, t);
    const targetLook = camStart.look.clone().lerp(camEnd.look, t);
    const st = performance.now();
    function frame(now){
      const p = Math.min((now-st)/duration, 1);
      const eased = 1 - Math.pow(1-p, 3);
      camera.position.lerpVectors(startPos, targetPos, eased);
      currentLook.lerpVectors(startLook, targetLook, eased);
      camera.lookAt(currentLook);
      if(p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function onAuroraTap(clientX, clientY){
    // if the star has arrived, a tap first checks whether she tapped the star itself
    if(starArrived && starSprite){
      const rect = canvasEl.getBoundingClientRect();
      mouseVec.x = ((clientX-rect.left)/rect.width)*2-1;
      mouseVec.y = -((clientY-rect.top)/rect.height)*2+1;
      raycaster.setFromCamera(mouseVec, camera);
      const hits = raycaster.intersectObject(starSprite);
      if(hits.length){ onStarTap(); return; }
    }
    if(!auroraWalkingActive) return;

    auroraProgress++;
    tweenCamera(650);

    const hint = document.getElementById('aurora-tap-hint');
    if(auroraProgress === 1){ hint.textContent = 'Keep walking...'; }
    if(auroraProgress === AURORA_MAX_STEPS - 1){ hint.textContent = 'Almost at the edge...'; }

    if(auroraProgress >= AURORA_MAX_STEPS){
      auroraWalkingActive = false;
      hint.style.opacity = '0';
      setTimeout(startShootingStarSequence, 1000);
    }
  }
  canvasEl.addEventListener('click', (e)=>onAuroraTap(e.clientX, e.clientY));
  canvasEl.addEventListener('touchend', (e)=>{
    if(e.changedTouches && e.changedTouches[0]){
      onAuroraTap(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    }
  });
  auroraProgress = 0;
  auroraWalkingActive = true;

  // ---- shooting star: real 3D flight path + trailing particles ----
  const raycaster = new THREE.Raycaster();
  const mouseVec = new THREE.Vector2();
  let starSprite = null;
  let starArrived = false;
  let starGlowT = 0;
  const trailParticles = [];
  const burstParticles = [];

  function quadBezierPt3D(p0, p1, p2, t){
    const mt = 1 - t;
    return new THREE.Vector3(
      mt*mt*p0.x + 2*mt*t*p1.x + t*t*p2.x,
      mt*mt*p0.y + 2*mt*t*p1.y + t*t*p2.y,
      mt*mt*p0.z + 2*mt*t*p1.z + t*t*p2.z
    );
  }

  function spawnTrailParticle(pos){
    const mat = new THREE.SpriteMaterial({ map:glowTex, color:0xcfe6ff, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, opacity:0.8 });
    const sp = new THREE.Sprite(mat);
    sp.scale.set(1.6, 1.6, 1);
    sp.position.copy(pos);
    sp.userData.life = 1.0;
    scene.add(sp);
    trailParticles.push(sp);
  }

  function startShootingStarSequence(){
    const tex = glowTex;
    const mat = new THREE.SpriteMaterial({ map:tex, color:0xffffff, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending });
    starSprite = new THREE.Sprite(mat);
    starSprite.scale.set(2.2, 2.2, 1);
    scene.add(starSprite);

    const p0 = new THREE.Vector3(160, 90, -420);
    const p1 = new THREE.Vector3(70, 40, -160);
    const p2 = new THREE.Vector3(0, 9, -18);

    const duration = 4400;
    const st = performance.now();

    function frame(now){
      const rawT = Math.min((now-st)/duration, 1);
      const t = 1 - Math.pow(1-rawT, 2);
      const pt = quadBezierPt3D(p0, p1, p2, t);
      starSprite.position.copy(pt);
      const scale = 1.2 + t*2.2;
      starSprite.scale.set(scale, scale, 1);

      if(Math.random() < 0.7) spawnTrailParticle(pt);

      if(rawT < 1){
        requestAnimationFrame(frame);
      } else {
        starArrived = true;
      }
    }
    requestAnimationFrame(frame);
  }

  function onStarTap(){
    if(!starArrived) return;
    starArrived = false; // stop glow pulse / disable further taps on it
    openStarLetter();
  }

  function openStarLetter(){
    document.getElementById('star-letter-modal').classList.add('open');
  }

  document.getElementById('star-letter-close-btn').addEventListener('click', ()=>{
    document.getElementById('star-letter-modal').classList.remove('open');
    runStarDepartureAndBurst();
  });

  function runStarDepartureAndBurst(){
    if(!starSprite) return;
    const startPos = starSprite.position.clone();
    const endPos = new THREE.Vector3(30, 110, -260);
    const duration = 800;
    const st = performance.now();

    function frame(now){
      const t = Math.min((now-st)/duration, 1);
      const eased = t*t;
      starSprite.position.lerpVectors(startPos, endPos, eased);
      const scale = 3.4 - eased*2.4;
      starSprite.scale.set(scale, scale, 1);
      if(t < 1){
        requestAnimationFrame(frame);
      } else {
        spawnBurst(starSprite.position.clone());
        scene.remove(starSprite);
        starSprite = null;
        setTimeout(()=>{ goTo('screen-galaxy'); }, 2000);
      }
    }
    requestAnimationFrame(frame);
  }

  function spawnBurst(origin){
    const count = 34;
    for(let i=0;i<count;i++){
      const mat = new THREE.SpriteMaterial({ map:glowTex, color:0xffffff, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending });
      const sp = new THREE.Sprite(mat);
      const s = 0.8 + Math.random()*1.2;
      sp.scale.set(s, s, 1);
      sp.position.copy(origin);
      const angle = Math.random()*Math.PI*2;
      const speed = 0.6 + Math.random()*1.4;
      sp.userData.vel = new THREE.Vector3(Math.cos(angle)*speed, -(0.4+Math.random()*1.4), Math.sin(angle)*speed*0.6);
      sp.userData.life = 1.0;
      sp.userData.decay = 0.006 + Math.random()*0.008;
      scene.add(sp);
      burstParticles.push(sp);
    }
  }

  // ---- render loop ----
  const clock = new THREE.Clock();
  function animate(){
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    auroraRibbons.forEach((mesh, mi)=>{
      const posAttr = mesh.geometry.attributes.position;
      const base = mesh.userData.basePos;
      for(let i=0;i<posAttr.count;i++){
        const bx = base[i*3], by = base[i*3+1], bz = base[i*3+2];
        posAttr.array[i*3+2] = bz + Math.sin(elapsed*0.6 + bx*0.02 + mi*2) * 6;
      }
      posAttr.needsUpdate = true;
    });

    if(starSprite && starArrived){
      starGlowT += 0.06;
      const pulse = 1 + Math.sin(starGlowT)*0.28;
      const baseScale = 3.4;
      starSprite.scale.set(baseScale*pulse, baseScale*pulse, 1);
    }

    for(let i=trailParticles.length-1;i>=0;i--){
      const p = trailParticles[i];
      p.userData.life -= 0.03;
      p.material.opacity = Math.max(0, p.userData.life*0.8);
      p.scale.multiplyScalar(0.97);
      if(p.userData.life <= 0){
        scene.remove(p);
        trailParticles.splice(i,1);
      }
    }

    for(let i=burstParticles.length-1;i>=0;i--){
      const p = burstParticles[i];
      p.position.add(p.userData.vel.clone().multiplyScalar(0.35));
      p.userData.vel.y -= 0.02; // gentle gravity
      p.userData.life -= p.userData.decay;
      p.material.opacity = Math.max(0, p.userData.life);
      if(p.userData.life <= 0){
        scene.remove(p);
        burstParticles.splice(i,1);
      }
    }

    renderer.render(scene, camera);
  }
  animate();
}