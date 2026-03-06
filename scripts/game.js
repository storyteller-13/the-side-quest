// ─── Constants ───────────────────────────────────────────────────────────────
let W = window.innerWidth, H = window.innerHeight;
const TILE = 32;
const COLS = 50, ROWS = 35;
const T = { ROAD: 0, WALL: 1, GRASS: 2, PARK: 3, ROSE: 4, HEART_TILE: 5, CASTLE: 6 };

// ─── Audio ───────────────────────────────────────────────────────────────────
let audioCtx = null;
function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playNote(freq, delay, duration, type = 'sine', vol = 0.25) {
  try {
    const ac = getAudio();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ac.currentTime + delay);
    gain.gain.linearRampToValueAtTime(vol, ac.currentTime + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + duration);
    osc.start(ac.currentTime + delay);
    osc.stop(ac.currentTime + delay + duration + 0.01);
  } catch(e) {}
}
function playNoise(duration, freq = 400, vol = 0.4) {
  try {
    const ac = getAudio();
    const buf = ac.createBuffer(1, ac.sampleRate * duration, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = ac.createBufferSource(); src.buffer = buf;
    const filt = ac.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = freq;
    const gain = ac.createGain();
    src.connect(filt); filt.connect(gain); gain.connect(ac.destination);
    gain.gain.setValueAtTime(vol, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
    src.start();
  } catch(e) {}
}
function playSound(type) {
  try {
    switch(type) {
      case 'hit':
        playNote(220, 0, 0.08, 'square', 0.2);
        playNote(110, 0.05, 0.08, 'sawtooth', 0.15);
        break;
      case 'flee':
        playNote(880, 0,    0.08, 'sine', 0.3);
        playNote(1100, 0.08, 0.08, 'sine', 0.3);
        playNote(660, 0.16,  0.15, 'sine', 0.25);
        playNote(440, 0.28,  0.2,  'sine', 0.15);
        break;
      case 'explode':
        playNoise(0.4, 600, 0.5);
        playNote(80, 0, 0.3, 'sawtooth', 0.4);
        break;
      case 'heart':
        playNote(523, 0,    0.12, 'sine', 0.2);
        playNote(659, 0.1,  0.12, 'sine', 0.2);
        playNote(784, 0.2,  0.15, 'sine', 0.2);
        break;
      case 'lovemeter':
        playNote(784, 0,    0.1, 'sine', 0.15);
        playNote(988, 0.1,  0.1, 'sine', 0.15);
        playNote(1175, 0.2, 0.2, 'sine', 0.15);
        break;
      case 'taunt':
        playNote(660, 0,   0.06, 'square', 0.1);
        playNote(550, 0.07, 0.06, 'square', 0.1);
        break;
      case 'win':
        playNote(523, 0,    0.2, 'sine', 0.3);
        playNote(659, 0.2,  0.2, 'sine', 0.3);
        playNote(784, 0.4,  0.2, 'sine', 0.3);
        playNote(1047, 0.6, 0.4, 'sine', 0.35);
        playNote(784, 1.0,  0.2, 'sine', 0.25);
        playNote(880, 1.2,  0.2, 'sine', 0.25);
        playNote(1047, 1.4, 0.6, 'sine', 0.4);
        break;
      case 'kiss':
        playNote(523,  0,   0.15, 'sine', 0.3);
        playNote(659,  0.1, 0.15, 'sine', 0.3);
        playNote(784,  0.2, 0.15, 'sine', 0.3);
        playNote(1047, 0.3, 0.3,  'sine', 0.4);
        playNote(1319, 0.5, 0.5,  'sine', 0.35);
        playNoise(0.15, 2000, 0.15);
        break;
    }
  } catch(e) {}
}

// ─── Canvas Setup ────────────────────────────────────────────────────────────
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const minimapCanvas = document.getElementById('minimap');
const mctx = minimapCanvas.getContext('2d');

function resizeCanvas() {
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = W; canvas.height = H;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ─── Init text from config ────────────────────────────────────────────────────
function initTextFromConfig() {
  document.title = CONFIG.title;
  document.getElementById('healthLabel').textContent = CONFIG.hud.health;
  document.getElementById('loveLabel').textContent = CONFIG.hud.loveMeter;
  document.getElementById('ammoLabel').textContent = CONFIG.hud.ammo;
  document.getElementById('ammoDisplay').textContent = CONFIG.hud.ammoFormat.replace('%d', '5');
  document.getElementById('pauseBtn').textContent = CONFIG.buttons.pause;
  document.getElementById('scoreDisplay').textContent = '0';
  document.getElementById('levelDisplay').textContent = CONFIG.zones[0].name + '  [1/' + CONFIG.zones.length + ']';
  document.getElementById('wantedStars').textContent = CONFIG.hud.wantedStar.repeat(5);
  document.getElementById('overlayTitle').textContent = CONFIG.overlayTitle;
  document.getElementById('overlaySubtitle').textContent = CONFIG.subtitle;
  const controlsEl = document.getElementById('overlayControls');
  controlsEl.innerHTML = CONFIG.controls.map(c => `<span>${c.keys}</span> — ${c.action}<br>`).join('');
  document.getElementById('startBtn').textContent = CONFIG.startButton;
}
initTextFromConfig();

// ─── State ───────────────────────────────────────────────────────────────────
let state = 'menu';
let paused = false;
let score = 0;
let zone = 0;
let frameCount = 0;
let showMessage = '';
let messageTimer = 0;
let loveMeter = 0;
let loveSoundPlayed = false;
let zoneTransitionTimer = 0;
let cutsceneTimer = 0;
let winFloaters = [];

// ─── Input ───────────────────────────────────────────────────────────────────
const keys = {};
const mouse = { x: 0, y: 0, left: false, right: false };
document.addEventListener('keydown', e => {
  if (e.code === 'Escape' && state === 'playing') {
    paused = !paused;
    const btn = document.getElementById('pauseBtn');
    if (btn) btn.textContent = paused ? CONFIG.buttons.resume : CONFIG.buttons.pause;
    e.preventDefault();
    return;
  }
  keys[e.code] = true;
  e.preventDefault();
});
document.addEventListener('keyup',   e => { keys[e.code] = false; });
canvas.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
});
canvas.addEventListener('mousedown', e => {
  if (e.button === 0) mouse.left = true;
  if (e.button === 2) mouse.right = true;
  e.preventDefault();
});
canvas.addEventListener('mouseup', e => {
  if (e.button === 0) mouse.left = false;
  if (e.button === 2) mouse.right = false;
});
canvas.addEventListener('contextmenu', e => e.preventDefault());

// ─── World ───────────────────────────────────────────────────────────────────
let tilemap = [];
let monsters = [];
let projectiles = [];
let particles = [];
let roses = [];
let shockwaves = [];
let prince = null;
let player = null;
let camera = { x: 0, y: 0 };
let screenShake = 0;

function generateMap() {
  tilemap = [];
  for (let r = 0; r < ROWS; r++) { tilemap[r] = []; for (let c = 0; c < COLS; c++) tilemap[r][c] = T.WALL; }
  const hRoads = [2, 8, 14, 20, 26, 32];
  const vRoads = [2, 9, 16, 23, 30, 37, 44];
  for (const row of hRoads) for (let c = 0; c < COLS; c++) {
    tilemap[row][c] = T.ROAD;
    if (row+1 < ROWS) tilemap[row+1][c] = T.ROAD;
    if (row+2 < ROWS) tilemap[row+2][c] = T.ROAD;
  }
  for (const col of vRoads) for (let r = 0; r < ROWS; r++) {
    tilemap[r][col] = T.ROAD;
    if (col+1 < COLS) tilemap[r][col+1] = T.ROAD;
  }
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (tilemap[r][c] === T.WALL) {
      const rnd = Math.random();
      if (rnd < 0.05) tilemap[r][c] = T.PARK;
      else if (rnd < 0.08) tilemap[r][c] = T.ROSE;
    }
  }
  for (let r = 12; r < 22; r++) for (let c = 42; c < 49; c++) tilemap[r][c] = T.CASTLE;
  for (let c = 37; c < 49; c++) { tilemap[16][c] = T.ROAD; tilemap[17][c] = T.ROAD; tilemap[18][c] = T.ROAD; }
}

function isWalkable(wx, wy, radius = 10) {
  const pts = [[wx-radius,wy-radius],[wx+radius,wy-radius],[wx-radius,wy+radius],[wx+radius,wy+radius]];
  for (const [cx,cy] of pts) {
    const col = Math.floor(cx/TILE), row = Math.floor(cy/TILE);
    if (row<0||row>=ROWS||col<0||col>=COLS) return false;
    if (tilemap[row][col] === T.WALL) return false;
  }
  return true;
}

// ─── Player ──────────────────────────────────────────────────────────────────
function createPlayer() {
  return {
    x: 3*TILE+TILE/2, y: 9*TILE+TILE/2,
    speed: 2.8, hp: 100, maxHp: 100, ammo: 5,
    facing: 0, attackTimer: 0, attackCooldown: 20,
    heartCooldown: 0, chargeTime: 0, wasChargingHeart: false,
    ammoRegenTimer: 0, invincible: 0, dead: false,
  };
}

// ─── Monsters ────────────────────────────────────────────────────────────────
function spawnMonsters(zoneIdx) {
  monsters = [];
  const ZONES = CONFIG.zones;
  const MONSTER_TYPES = CONFIG.monsterTypes;
  const count = ZONES[zoneIdx].monsterCount;
  const spd   = ZONES[zoneIdx].monsterSpeed;
  const roadCells = [];
  for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++)
    if (tilemap[r][c] === T.ROAD && c > 5) roadCells.push([r,c]);
  for (let i=0;i<count;i++) {
    const typeIdx = Math.floor(Math.random() * Math.min(zoneIdx+2, MONSTER_TYPES.length));
    const type = MONSTER_TYPES[typeIdx];
    const cell = roadCells[Math.floor(Math.random()*roadCells.length)];
    monsters.push({
      x: cell[1]*TILE+TILE/2, y: cell[0]*TILE+TILE/2,
      hp: type.hp*(1+zoneIdx*0.3), maxHp: type.hp*(1+zoneIdx*0.3),
      speed: type.speed*spd, damage: type.damage, size: type.size,
      color: type.color, eyeColor: type.eyeColor, loot: type.loot, name: type.name,
      state:'patrol', patrolAngle: Math.random()*Math.PI*2, patrolTimer:0,
      attackTimer:0, facing:0, alertTimer:0,
      meleeHits:0, hitFlash:0, exploding:false, explodeTimer:0, dead:false,
    });
  }
}

function spawnPrince() {
  prince = {
    x: 42*TILE, y: 17*TILE, size:18, bobTimer:0, reached:false,
    fleeing:false, fleeVx:0, fleeVy:0,
    speech:'', speechTimer:0,
    tauntTimer: 300 + Math.random()*200,
  };
}

// ─── Particles ───────────────────────────────────────────────────────────────
function spawnParticles(x, y, color, count=6, speed=3) {
  for (let i=0;i<count;i++) {
    const angle = (Math.PI*2*i)/count + Math.random()*0.5;
    particles.push({
      x, y,
      vx: Math.cos(angle)*speed*(0.5+Math.random()),
      vy: Math.sin(angle)*speed*(0.5+Math.random()),
      color, life:30+Math.random()*20, maxLife:50, size:4+Math.random()*4,
    });
  }
}
function spawnHearts(x, y, count=8, spd=3) {
  for (let i=0;i<count;i++) {
    const angle = (Math.PI*2*i)/count;
    particles.push({
      x, y, vx:Math.cos(angle)*spd, vy:Math.sin(angle)*spd,
      color:'#ff69b4', life:40, maxLife:40, size:8, heart:true,
    });
  }
}

// ─── Draw helpers ────────────────────────────────────────────────────────────
function drawHeart(ctx, x, y, size, color='#ff1493', alpha=1) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y+size*0.25);
  ctx.bezierCurveTo(x,y, x-size,y, x-size,y+size*0.4);
  ctx.bezierCurveTo(x-size,y+size*0.75, x,y+size, x,y+size);
  ctx.bezierCurveTo(x,y+size, x+size,y+size*0.75, x+size,y+size*0.4);
  ctx.bezierCurveTo(x+size,y, x,y, x,y+size*0.25);
  ctx.fill(); ctx.restore();
}

function worldToScreen(wx, wy) {
  const sx = screenShake>0?(Math.random()-0.5)*screenShake:0;
  const sy = screenShake>0?(Math.random()-0.5)*screenShake:0;
  return [wx-camera.x+sx, wy-camera.y+sy];
}

// ─── Tile Rendering ──────────────────────────────────────────────────────────
const tileColors = {
  [T.ROAD]:  ['#2d1b3d','#251530'], [T.WALL]:  ['#1a0028','#150020'],
  [T.GRASS]: ['#1a2e1a','#162614'], [T.PARK]:  ['#0f2010','#0c1a0c'],
  [T.ROSE]:  ['#2d0a1a','#200812'], [T.CASTLE]:['#2a1a3a','#1e1228'],
};
function mixHex(hex1, hex2, t) {
  const parse = (h) => ({ r: parseInt(h.slice(1,3),16), g: parseInt(h.slice(3,5),16), b: parseInt(h.slice(5,7),16) });
  const a = parse(hex1), b = parse(hex2);
  const r = Math.round(a.r*(1-t)+b.r*t), g = Math.round(a.g*(1-t)+b.g*t), b_ = Math.round(a.b*(1-t)+b.b*t);
  return '#'+[r,g,b_].map(x=>Math.max(0,Math.min(255,x)).toString(16).padStart(2,'0')).join('');
}
function drawTile(r, c) {
  const t = tilemap[r][c];
  const [sx,sy] = worldToScreen(c*TILE, r*TILE);
  if (sx>W||sy>H||sx<-TILE||sy<-TILE) return;
  const zoneBg = CONFIG.zones[zone].bg;
  const baseColors = tileColors[t]||tileColors[T.WALL];
  const colors = [mixHex(baseColors[0], zoneBg, 0.35), mixHex(baseColors[1], zoneBg, 0.35)];
  ctx.fillStyle = colors[(r+c)%2];
  ctx.fillRect(sx, sy, TILE, TILE);
  if (t===T.ROAD) {
    if (c%9===4) { ctx.fillStyle='#3d2855'; ctx.fillRect(sx+TILE/2-1,sy,2,TILE); }
    if (r%7===3) { ctx.fillStyle='#3d2855'; ctx.fillRect(sx,sy+TILE/2-1,TILE,2); }
  } else if (t===T.WALL) {
    ctx.strokeStyle='#2a1040'; ctx.lineWidth=0.5;
    ctx.strokeRect(sx+2,sy+2,TILE-4,TILE-4);
    if ((r*7+c*13)%17===0) { ctx.fillStyle='rgba(255,200,100,0.15)'; ctx.fillRect(sx+8,sy+6,6,8); ctx.fillRect(sx+18,sy+6,6,8); }
  } else if (t===T.ROSE) {
    ctx.fillStyle='#ff1493'; ctx.beginPath(); ctx.arc(sx+TILE/2,sy+TILE/2,5,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#2d5a1b'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(sx+TILE/2,sy+TILE/2+5); ctx.lineTo(sx+TILE/2,sy+TILE-4); ctx.stroke();
  } else if (t===T.CASTLE) {
    ctx.strokeStyle='#c084fc'; ctx.lineWidth=0.5; ctx.strokeRect(sx+1,sy+1,TILE-2,TILE-2);
    if (r%2===0&&c%2===0) { ctx.fillStyle='rgba(192,132,252,0.1)'; ctx.fillRect(sx+4,sy+4,TILE-8,TILE-8); }
    if (r===12&&c>=42) { ctx.fillStyle='#c084fc'; for (let i=0;i<3;i++) ctx.fillRect(sx+2+i*10,sy,6,8); }
  }
}

// ─── Draw Player ─────────────────────────────────────────────────────────────
function drawPlayer(p) {
  const [sx,sy] = worldToScreen(p.x, p.y);
  ctx.save(); ctx.translate(sx,sy); ctx.rotate(p.facing);
  if (p.invincible>0 && Math.floor(p.invincible/4)%2===0) ctx.globalAlpha=0.4;
  ctx.fillStyle='#0d0d0d';
  ctx.beginPath(); ctx.moveTo(-9,4); ctx.lineTo(9,4); ctx.lineTo(12,20); ctx.lineTo(-12,20); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#4a0080';
  ctx.beginPath(); ctx.moveTo(-12,17); ctx.lineTo(12,17); ctx.lineTo(13,20); ctx.lineTo(-13,20); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#1a001a';
  ctx.beginPath(); ctx.moveTo(-2,4); ctx.lineTo(2,4); ctx.lineTo(3,18); ctx.lineTo(-3,18); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#111'; ctx.beginPath(); ctx.ellipse(0,0,9,11,0,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#4a0080'; ctx.lineWidth=1;
  for(let i=-3;i<=3;i+=2){ctx.beginPath();ctx.moveTo(-4,i);ctx.lineTo(4,i);ctx.stroke();}
  ctx.fillStyle='#0d0d0d'; ctx.fillRect(-6,-14,12,3);
  ctx.fillStyle='#9900ff'; ctx.beginPath(); ctx.arc(0,-13,2,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#e8d5d5'; ctx.beginPath(); ctx.ellipse(0,-12,4,3,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#e8d5d5'; ctx.beginPath(); ctx.arc(0,-4,7,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#0d0d0d';
  ctx.beginPath(); ctx.ellipse(0,-10,9,6,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-9,-6); ctx.quadraticCurveTo(-12,2,-11,12); ctx.lineTo(-9,12); ctx.quadraticCurveTo(-10,2,-7,-6); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(9,-6); ctx.quadraticCurveTo(12,2,11,12); ctx.lineTo(9,12); ctx.quadraticCurveTo(10,2,7,-6); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#1a001a'; ctx.beginPath(); ctx.ellipse(-3,-5,3.5,2,0,0,Math.PI*2); ctx.ellipse(3,-5,3.5,2,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#d8b4fe'; ctx.beginPath(); ctx.ellipse(-3,-5,2,1.8,0,0,Math.PI*2); ctx.ellipse(3,-5,2,1.8,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#6600cc'; ctx.beginPath(); ctx.arc(-3,-5,1,0,Math.PI*2); ctx.arc(3,-5,1,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#000'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(-6,-5); ctx.lineTo(-7.5,-3.5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(6,-5); ctx.lineTo(7.5,-3.5); ctx.stroke();
  ctx.fillStyle='#4a0033';
  ctx.beginPath(); ctx.moveTo(-3,-1); ctx.quadraticCurveTo(0,1,3,-1); ctx.quadraticCurveTo(0,-2,-3,-1); ctx.closePath(); ctx.fill();
  if (p.attackTimer>p.attackCooldown-8) {
    ctx.strokeStyle='#9900ff'; ctx.lineWidth=3; ctx.shadowColor='#9900ff'; ctx.shadowBlur=12;
    ctx.beginPath(); ctx.moveTo(8,-2); ctx.lineTo(28,-10); ctx.stroke();
    ctx.fillStyle='#4a0080'; ctx.beginPath(); ctx.arc(28,-10,5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#cc00ff'; ctx.beginPath(); ctx.arc(28,-10,3,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
  } else {
    ctx.strokeStyle='#333'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(8,0); ctx.lineTo(20,-6); ctx.stroke();
    ctx.fillStyle='#4a0080'; ctx.beginPath(); ctx.arc(20,-6,3,0,Math.PI*2); ctx.fill();
  }
  ctx.restore();
  if (p.chargeTime>0) {
    ctx.save();
    const charge=p.chargeTime/60;
    ctx.strokeStyle=charge>=1?'#ffd700':'#ff69b4'; ctx.lineWidth=2+charge*3;
    ctx.globalAlpha=0.4+charge*0.5+Math.sin(frameCount*0.2)*0.3;
    ctx.shadowColor=charge>=1?'#ffd700':'#ff1493'; ctx.shadowBlur=16;
    ctx.beginPath(); ctx.arc(sx,sy,24+charge*20,-Math.PI/2,-Math.PI/2+Math.PI*2*charge); ctx.stroke();
    ctx.restore();
  }
  const grd=ctx.createRadialGradient(sx,sy,0,sx,sy,28);
  grd.addColorStop(0,'rgba(120,0,200,0.18)'); grd.addColorStop(1,'rgba(120,0,200,0)');
  ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(sx,sy,28,0,Math.PI*2); ctx.fill();
}

// ─── Draw Monster ─────────────────────────────────────────────────────────────
function drawMonster(m) {
  if (m.dead) return;
  const [sx,sy] = worldToScreen(m.x, m.y);
  if (sx<-50||sx>W+50||sy<-50||sy>H+50) return;
  if (m.exploding) {
    const t=m.explodeTimer/20;
    ctx.save(); ctx.globalAlpha=1-t; ctx.translate(sx,sy); ctx.scale(1+t*5,1+t*5);
    ctx.fillStyle=t<0.4?'#ffffff':'#ffd700'; ctx.beginPath(); ctx.arc(0,0,m.size,0,Math.PI*2); ctx.fill();
    ctx.restore(); return;
  }
  ctx.save(); ctx.translate(sx,sy); ctx.rotate(m.facing);
  ctx.fillStyle='rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(0,m.size+2,m.size*0.8,4,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=m.color; ctx.beginPath(); ctx.arc(0,0,m.size,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.arc(-m.size*0.3,-m.size*0.2,m.size*0.4,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=m.eyeColor; ctx.beginPath(); ctx.arc(-m.size*0.35,-m.size*0.2,m.size*0.2,0,Math.PI*2); ctx.arc(m.size*0.35,-m.size*0.2,m.size*0.2,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#000'; ctx.beginPath(); ctx.arc(-m.size*0.35,-m.size*0.2,m.size*0.08,0,Math.PI*2); ctx.arc(m.size*0.35,-m.size*0.2,m.size*0.08,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle=m.alertTimer>0?'#ff0000':'#000'; ctx.lineWidth=2;
  ctx.beginPath();
  if (m.alertTimer>0) { ctx.moveTo(-m.size*0.4,m.size*0.3); ctx.lineTo(m.size*0.4,m.size*0.3); }
  else ctx.arc(0,m.size*0.1,m.size*0.3,0.1,Math.PI-0.1);
  ctx.stroke();
  if (m.hitFlash>0) { ctx.fillStyle=`rgba(255,255,255,${m.hitFlash/8*0.6})`; ctx.beginPath(); ctx.arc(0,0,m.size,0,Math.PI*2); ctx.fill(); m.hitFlash--; }
  ctx.restore();
  if (m.hp<m.maxHp) {
    const bw=m.size*2.5,bh=4,bx=sx-bw/2,by=sy-m.size-10;
    ctx.fillStyle='#1a0020'; ctx.fillRect(bx,by,bw,bh);
    ctx.fillStyle='#ff1493'; ctx.fillRect(bx,by,bw*(m.hp/m.maxHp),bh);
  }
  if (m.alertTimer>30) { ctx.fillStyle='#ff0000'; ctx.font='bold 14px monospace'; ctx.textAlign='center'; ctx.fillText('!',sx,sy-m.size-14); }
  if (m.meleeHits>0) {
    const startX=sx-((m.meleeHits-1)*8)/2;
    for (let i=0;i<m.meleeHits;i++) {
      ctx.fillStyle=i===m.meleeHits-1?'#ffd700':'#ff69b4';
      ctx.beginPath(); ctx.arc(startX+i*8,sy+m.size+10,3.5,0,Math.PI*2); ctx.fill();
    }
  }
}

// ─── Draw Prince ─────────────────────────────────────────────────────────────
function drawPrince(p) {
  if (!p) return;
  const [sx,sy] = worldToScreen(p.x, p.y);
  if (sx<-80||sx>W+80||sy<-80||sy>H+80) return;
  p.bobTimer++;
  const bob = p.fleeing ? 0 : Math.sin(p.bobTimer*0.05)*3;
  ctx.save(); ctx.translate(sx, sy+bob);
  const grd=ctx.createRadialGradient(0,0,0,0,0,44);
  grd.addColorStop(0,'rgba(100,160,255,0.35)'); grd.addColorStop(1,'rgba(100,160,255,0)');
  ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(0,0,44,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#cc0000';
  ctx.beginPath(); ctx.moveTo(-9,2); ctx.lineTo(9,2); ctx.quadraticCurveTo(20,10,16,26); ctx.quadraticCurveTo(0,22,-16,26); ctx.quadraticCurveTo(-20,10,-9,2); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#ff3333';
  ctx.beginPath(); ctx.moveTo(-2,2); ctx.quadraticCurveTo(6,12,4,26); ctx.quadraticCurveTo(0,22,-2,26); ctx.quadraticCurveTo(-4,12,-2,2); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#1a3aaa';
  ctx.fillRect(-8,10,7,16); ctx.fillRect(1,10,7,16);
  ctx.fillStyle='#cc0000';
  ctx.fillRect(-9,22,8,6); ctx.fillRect(1,22,8,6);
  ctx.fillStyle='#1a4acc';
  ctx.beginPath(); ctx.ellipse(0,1,12,14,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#cc0000'; ctx.fillRect(-12,9,24,4);
  ctx.fillStyle='#ffd700'; ctx.fillRect(-4,9,8,4);
  ctx.fillStyle='#ffd700';
  ctx.beginPath(); ctx.moveTo(0,-10); ctx.lineTo(8,-5); ctx.lineTo(8,4); ctx.lineTo(0,9); ctx.lineTo(-8,4); ctx.lineTo(-8,-5); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#cc0000';
  ctx.beginPath(); ctx.moveTo(0,-8); ctx.lineTo(6,-4); ctx.lineTo(6,3); ctx.lineTo(0,7); ctx.lineTo(-6,3); ctx.lineTo(-6,-4); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#ffd700'; ctx.font='bold 9px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('S', 0, -1);
  ctx.textBaseline='alphabetic';
  ctx.fillStyle='#fcd5ce'; ctx.beginPath(); ctx.ellipse(0,-13,4,3,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#fcd5ce'; ctx.beginPath(); ctx.arc(0,-21,10,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#1a1a2e';
  ctx.beginPath(); ctx.ellipse(0,-29,9,6,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0,-23); ctx.quadraticCurveTo(5,-26,4,-30); ctx.quadraticCurveTo(3,-32,-1,-29); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#fff'; ctx.beginPath(); ctx.ellipse(-4,-22,3,2,0,0,Math.PI*2); ctx.ellipse(4,-22,3,2,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#1565c0'; ctx.beginPath(); ctx.arc(-4,-22,1.5,0,Math.PI*2); ctx.arc(4,-22,1.5,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#c97a5a'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(0,-18,4,0.2,Math.PI-0.2); ctx.stroke();
  ctx.strokeStyle='#d4905a'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(0,-14); ctx.lineTo(0,-12); ctx.stroke();
  ctx.restore();
  if (!p.fleeing) {
    for (let i=0;i<3;i++) {
      const t=(frameCount*0.02+i*2.1)%(Math.PI*2);
      drawHeart(ctx, sx+Math.cos(t+i*2)*35, sy-30+Math.sin(t*0.7)*15-i*12, 5,'#ff69b4',0.6+Math.sin(t)*0.3);
    }
  }
  if (p.speech && p.speechTimer > 0 && !p.fleeing) {
    const alpha = Math.min(1, p.speechTimer / 30);
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.font = 'bold 15px monospace'; ctx.textAlign = 'center';
    const tw = ctx.measureText(p.speech).width;
    const bw = tw + 28, bh = 32, bx = sx - bw/2, by = sy - p.size - 80;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 6); ctx.fill();
    ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx-8,by+bh); ctx.lineTo(sx+8,by+bh); ctx.lineTo(sx,by+bh+10); ctx.closePath();
    ctx.fillStyle='#fff'; ctx.fill(); ctx.strokeStyle='#c084fc'; ctx.stroke();
    ctx.fillStyle = '#1a0028'; ctx.fillText(p.speech, sx, by + 21);
    ctx.restore();
  }
  if (!p.fleeing && !p.speechTimer) {
    ctx.fillStyle='#ffd700'; ctx.font='bold 13px monospace'; ctx.textAlign='center';
    ctx.shadowColor='#ffd700'; ctx.shadowBlur=8;
    ctx.fillText(CONFIG.messages.reachMe, sx, sy-p.size-50); ctx.shadowBlur=0;
  }
}

function drawProjectile(proj) {
  if (proj.trail) {
    for (let i=0;i<proj.trail.length;i++) {
      const t=proj.trail[i];
      const [tx,ty]=worldToScreen(t.x,t.y);
      ctx.globalAlpha=(i/proj.trail.length)*0.5;
      ctx.fillStyle=proj.charge>=1?'#ffd700':'#ff69b4';
      ctx.beginPath(); ctx.arc(tx,ty,(proj.size||8)*(i/proj.trail.length)*0.35,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;
  }
  const [sx,sy]=worldToScreen(proj.x,proj.y);
  const size=proj.size||8;
  ctx.save(); ctx.translate(sx,sy); ctx.rotate(proj.spin||0);
  if (proj.type==='heart') {
    ctx.shadowColor=proj.charge>=1?'#ffd700':'#ff1493';
    ctx.shadowBlur=14+(proj.charge||0)*16;
    drawHeart(ctx,0,-size*0.5,size,proj.charge>=1?'#ffd700':'#ff1493',1);
    ctx.shadowBlur=6; drawHeart(ctx,0,-size*0.5,size,'#ff69b4',0.4); ctx.shadowBlur=0;
  }
  ctx.restore();
}

function drawParticle(p) {
  const [sx,sy]=worldToScreen(p.x,p.y);
  const alpha=p.life/p.maxLife;
  ctx.globalAlpha=alpha;
  if (p.heart) drawHeart(ctx,sx,sy,p.size*alpha,p.color,1);
  else { ctx.fillStyle=p.color; ctx.beginPath(); ctx.arc(sx,sy,p.size*alpha,0,Math.PI*2); ctx.fill(); }
  ctx.globalAlpha=1;
}

// ─── Game Logic ──────────────────────────────────────────────────────────────
function updatePlayer(p) {
  if (p.dead) return;
  const [mx,my]=[mouse.x-W/2+camera.x, mouse.y-H/2+camera.y];
  p.facing=Math.atan2(my-p.y, mx-p.x)+Math.PI/2;
  let dx=0,dy=0;
  if (keys['ArrowLeft'] ||keys['KeyA']) dx-=1;
  if (keys['ArrowRight']||keys['KeyD']) dx+=1;
  if (keys['ArrowUp']   ||keys['KeyW']) dy-=1;
  if (keys['ArrowDown'] ||keys['KeyS']) dy+=1;
  if (dx||dy) {
    const len=Math.sqrt(dx*dx+dy*dy);
    const nx=(dx/len)*p.speed, ny=(dy/len)*p.speed;
    if (isWalkable(p.x+nx,p.y,10)) p.x+=nx;
    if (isWalkable(p.x,p.y+ny,10)) p.y+=ny;
  }
  if (p.attackTimer>0) p.attackTimer--;
  if (p.invincible>0) p.invincible--;
  if (p.heartCooldown>0) p.heartCooldown--;
  if (p.ammo<10) {
    p.ammoRegenTimer++;
    if (p.ammoRegenTimer>=300) { p.ammo++; p.ammoRegenTimer=0; showFloatingText(p.x,p.y-20,CONFIG.messages.heartPickup,'#ff69b4'); }
  }
  if ((keys['Space']||mouse.left)&&p.attackTimer===0) {
    p.attackTimer=p.attackCooldown; p.invincible=p.attackCooldown; doMeleeAttack(p); keys['Space']=false;
  }
  const heartHeld=keys['KeyE']||mouse.right;
  if (heartHeld&&p.heartCooldown===0&&p.ammo>0) {
    p.chargeTime=Math.min(p.chargeTime+1,60); p.wasChargingHeart=true;
  } else if (p.wasChargingHeart&&p.chargeTime>0) {
    const charge=p.chargeTime/60;
    const angle=p.facing-Math.PI/2;
    p.ammo--;
    projectiles.push({
      x:p.x,y:p.y, vx:Math.cos(angle)*(7+charge*6), vy:Math.sin(angle)*(7+charge*6),
      angle,spin:0,type:'heart',owner:'player',damage:35+charge*80,
      size:8+charge*14, pierce:charge>=0.95, pierceCount:charge>=0.95?3:0,
      charge, life:100+charge*40, trail:[],
    });
    spawnParticles(p.x,p.y,'#ff69b4',4+Math.floor(charge*8),3+charge*3);
    playSound('heart');
    p.chargeTime=0; p.wasChargingHeart=false; p.heartCooldown=15;
    mouse.right=false; keys['KeyE']=false;
  } else if (!heartHeld) { p.wasChargingHeart=false; p.chargeTime=0; }
}

function doMeleeAttack(p) {
  const angle=p.facing-Math.PI/2;
  const ax=p.x+Math.cos(angle)*25, ay=p.y+Math.sin(angle)*25;
  let hit=false;
  for (const m of monsters) {
    if (m.dead||m.exploding) continue;
    const dx=m.x-ax,dy=m.y-ay;
    if (Math.sqrt(dx*dx+dy*dy)<50) {
      m.meleeHits++; m.hitFlash=8;
      if (m.meleeHits>=5) explodeMonster(m);
      else { damageMonster(m,40+Math.random()*20); showFloatingText(m.x,m.y-m.size-6,'★'.repeat(m.meleeHits),'#ffd700'); }
      hit=true; playSound('hit');
    }
  }
  if (hit) spawnParticles(ax,ay,'#ffd700',8,5);
  spawnParticles(ax,ay,'#ff69b4',5,3);
}

function explodeMonster(m) {
  if (m.dead||m.exploding) return;
  m.exploding=true; m.explodeTimer=0;
  score+=m.loot*3; screenShake=30; playSound('explode');
  shockwaves.push({x:m.x,y:m.y,radius:m.size,    maxRadius:320,life:40,maxLife:40,color:m.color,   delay:0});
  shockwaves.push({x:m.x,y:m.y,radius:m.size*0.6, maxRadius:260,life:36,maxLife:36,color:'#ffd700', delay:4});
  shockwaves.push({x:m.x,y:m.y,radius:0,           maxRadius:200,life:30,maxLife:30,color:'#ff69b4', delay:8});
  shockwaves.push({x:m.x,y:m.y,radius:0,           maxRadius:150,life:24,maxLife:24,color:'#ffffff', delay:12});
  shockwaves.push({x:m.x,y:m.y,radius:0,           maxRadius:100,life:20,maxLife:20,color:'#ff1493', delay:16});
  spawnParticles(m.x,m.y,m.color,60,16); spawnParticles(m.x,m.y,'#ffd700',50,20);
  spawnParticles(m.x,m.y,'#ff1493',50,14); spawnParticles(m.x,m.y,'#ffffff',40,22);
  spawnParticles(m.x,m.y,'#c084fc',30,18);
  for (let ring=0;ring<2;ring++) {
    const cnt=ring===0?20:12, baseSpd=ring===0?12:7;
    for (let i=0;i<cnt;i++) {
      const angle=(Math.PI*2*i)/cnt+ring*0.3, spd=baseSpd+Math.random()*6;
      particles.push({x:m.x,y:m.y,vx:Math.cos(angle)*spd,vy:Math.sin(angle)*spd,
        color:ring===0?'#ff69b4':'#ffd700',life:80+ring*20,maxLife:80+ring*20,size:14+Math.random()*12,heart:true});
    }
  }
  showFloatingText(m.x,m.y-m.size-10,CONFIG.messages.boom,'#ffd700');
  roses.push({x:m.x,y:m.y,life:180});
}

function damageMonster(m, dmg) {
  m.hp-=dmg; spawnParticles(m.x,m.y,m.color,5,4);
  if (m.hp<=0&&!m.dead&&!m.exploding) {
    m.dead=true; score+=m.loot;
    if (Math.random()<0.3) { player.ammo=Math.min(player.ammo+1,10); showFloatingText(m.x,m.y,CONFIG.messages.heartPickup,'#ff69b4'); }
    spawnHearts(m.x,m.y); spawnParticles(m.x,m.y,m.color,15,6);
    roses.push({x:m.x,y:m.y,life:180});
  }
}

const floatingTexts=[];
function showFloatingText(x,y,text,color) { floatingTexts.push({x,y,text,color,life:60,maxLife:60}); }

function updateMonster(m) {
  if (m.dead) return;
  if (m.exploding) { m.explodeTimer++; if (m.explodeTimer>=20) m.dead=true; return; }
  const dx=player.x-m.x, dy=player.y-m.y;
  const dist=Math.sqrt(dx*dx+dy*dy);
  m.facing=Math.atan2(dy,dx)+Math.PI/2;
  if (dist<280) { m.alertTimer=90; m.state='chase'; }
  else if (m.alertTimer<=0) m.state='patrol';
  if (m.alertTimer>0) m.alertTimer--;
  if (m.state==='chase') {
    const nx=(dx/dist)*m.speed, ny=(dy/dist)*m.speed;
    if (isWalkable(m.x+nx,m.y,m.size-2)) m.x+=nx;
    if (isWalkable(m.x,m.y+ny,m.size-2)) m.y+=ny;
    if (dist<30&&m.attackTimer===0) {
      m.attackTimer=45;
      if (player.invincible===0) {
        player.hp-=m.damage; player.invincible=30;
        spawnParticles(player.x,player.y,'#ff0000',6,4);
        if (player.hp<=0) { player.dead=true; state='dead'; }
      }
    }
  } else {
    m.patrolTimer++;
    if (m.patrolTimer>80) { m.patrolAngle+=(Math.random()-0.5)*Math.PI; m.patrolTimer=0; }
    const nx=Math.cos(m.patrolAngle)*m.speed*0.5, ny=Math.sin(m.patrolAngle)*m.speed*0.5;
    if (!isWalkable(m.x+nx,m.y,m.size-2)) m.patrolAngle+=Math.PI*0.5; else m.x+=nx;
    if (!isWalkable(m.x,m.y+ny,m.size-2)) m.patrolAngle+=Math.PI*0.5; else m.y+=ny;
  }
  if (m.attackTimer>0) m.attackTimer--;
}

function updateProjectiles() {
  for (let i=projectiles.length-1;i>=0;i--) {
    const p=projectiles[i];
    if (p.trail) { p.trail.push({x:p.x,y:p.y}); if (p.trail.length>12) p.trail.shift(); }
    p.x+=p.vx; p.y+=p.vy; p.spin=(p.spin||0)+0.18; p.life--;
    if (p.life<=0||!isWalkable(p.x,p.y,4)) {
      spawnParticles(p.x,p.y,p.charge>=1?'#ffd700':'#ff69b4',8,4);
      projectiles.splice(i,1); continue;
    }
    if (p.owner==='player') {
      for (const m of monsters) {
        if (m.dead||m.exploding) continue;
        const dx=m.x-p.x,dy=m.y-p.y;
        if (Math.sqrt(dx*dx+dy*dy)<m.size+(p.size||8)) {
          damageMonster(m,p.damage);
          if (p.pierce&&p.pierceCount>0) { p.pierceCount--; p.vx*=0.85; p.vy*=0.85; }
          else { projectiles.splice(i,1); break; }
        }
      }
    }
  }
}

function updateParticles() {
  for (let i=particles.length-1;i>=0;i--) {
    const p=particles[i]; p.x+=p.vx; p.y+=p.vy; p.vx*=0.92; p.vy*=0.92; p.life--;
    if (p.life<=0) particles.splice(i,1);
  }
}
function updateFloatingTexts() {
  for (let i=floatingTexts.length-1;i>=0;i--) {
    const ft=floatingTexts[i]; ft.y-=0.5; ft.life--;
    if (ft.life<=0) floatingTexts.splice(i,1);
  }
}
function updateCamera() {
  let tx, ty;
  if (prince && prince.fleeing && prince.speechTimer > 0) {
    const midX = (player.x + prince.x) / 2;
    const midY = (player.y + prince.y) / 2;
    tx = midX - W / 2;
    ty = midY - H / 2;
  } else {
    tx = player.x - W / 2;
    ty = player.y - H / 2;
  }
  camera.x += (tx - camera.x) * 0.1;
  camera.y += (ty - camera.y) * 0.1;
  camera.x = Math.max(0, Math.min(COLS*TILE - W, camera.x));
  camera.y = Math.max(0, Math.min(ROWS*TILE - H, camera.y));
}

function checkWin() {
  if (!prince||player.dead||prince.fleeing) return;
  const ZONES = CONFIG.zones;
  const dx=player.x-prince.x, dy=player.y-prince.y;
  const dist=Math.sqrt(dx*dx+dy*dy);
  const maxDist=600;
  const newLove=Math.max(0,Math.min(100,(1-dist/maxDist)*100));
  if (newLove>loveMeter+5&&loveMeter<95) loveSoundPlayed=false;
  if (newLove>=100&&!loveSoundPlayed) { playSound('lovemeter'); loveSoundPlayed=true; }
  loveMeter+=(newLove-loveMeter)*0.05;

  if (dist<80) {
    if (zone>=CONFIG.zones.length-1) {
      state='cutscene'; cutsceneTimer=0; playSound('win');
    } else {
      prince.fleeing=true;
      prince.speech=ZONES[zone].excuse;
      prince.speechTimer=360;
      const len=Math.sqrt(dx*dx+dy*dy)||1;
      const fleeSpd=ZONES[zone].fleeSpeed;
      prince.fleeVx=-(dx/len)*fleeSpd;
      prince.fleeVy=-(dy/len)*fleeSpd;
      spawnHearts(prince.x,prince.y);
      screenShake=8; playSound('flee');
    }
  }
}

function updatePrince() {
  if (!prince) return;
  if (prince.fleeing) {
    prince.x+=prince.fleeVx; prince.y+=prince.fleeVy;
    prince.fleeVx*=0.98; prince.fleeVy*=0.98;
    if (prince.speechTimer>0) prince.speechTimer--;
    if (zoneTransitionTimer===0&&prince.speechTimer<120) zoneTransitionTimer=160;
    return;
  }
  if (prince.tauntTimer>0) prince.tauntTimer--;
  if (prince.tauntTimer<=0&&!prince.speech) {
    const taunts=CONFIG.zones[zone].taunts;
    prince.speech=taunts[Math.floor(Math.random()*taunts.length)];
    prince.speechTimer=120;
    prince.tauntTimer=400+Math.random()*400;
    playSound('taunt');
  }
  if (prince.speechTimer>0) prince.speechTimer--;
  else if (prince.speechTimer===0&&prince.speech) prince.speech='';
}

// ─── Minimap ─────────────────────────────────────────────────────────────────
function drawMinimap() {
  const mw=minimapCanvas.width, mh=minimapCanvas.height;
  const sx=mw/(COLS*TILE), sy=mh/(ROWS*TILE);
  mctx.fillStyle='#0a0010'; mctx.fillRect(0,0,mw,mh);
  for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) {
    const t=tilemap[r][c];
    mctx.fillStyle=t===T.ROAD?'#2d1b3d':t===T.CASTLE?'#c084fc':'#150020';
    mctx.fillRect(c*sx*TILE,r*sy*TILE,sx*TILE+1,sy*TILE+1);
  }
  if (prince) { mctx.fillStyle='#ffd700'; mctx.beginPath(); mctx.arc(prince.x*sx,prince.y*sy,3,0,Math.PI*2); mctx.fill(); }
  mctx.fillStyle='#ff4444';
  for (const m of monsters) if (!m.dead) { mctx.beginPath(); mctx.arc(m.x*sx,m.y*sy,2,0,Math.PI*2); mctx.fill(); }
  mctx.fillStyle='#ff69b4'; mctx.beginPath(); mctx.arc(player.x*sx,player.y*sy,3,0,Math.PI*2); mctx.fill();
  mctx.strokeStyle='rgba(255,255,255,0.3)'; mctx.lineWidth=0.5;
  mctx.strokeRect(camera.x*sx,camera.y*sy,W*sx,H*sy);
}

// ─── HUD ─────────────────────────────────────────────────────────────────────
function updateHUD() {
  document.getElementById('healthFill').style.width=Math.max(0,player.hp/player.maxHp*100)+'%';
  document.getElementById('loveFill').style.width=loveMeter+'%';
  document.getElementById('scoreDisplay').textContent=score.toString().padStart(6,'0');
  document.getElementById('ammoDisplay').textContent=CONFIG.hud.ammoFormat.replace('%d', player.ammo);
  document.getElementById('levelDisplay').textContent=CONFIG.zones[zone].name+'  ['+(zone+1)+'/'+CONFIG.zones.length+']';
  const alive=monsters.filter(m=>!m.dead).length;
  const pct=1-(alive/monsters.length);
  document.getElementById('wantedStars').textContent=CONFIG.hud.wantedStar.repeat(Math.min(Math.floor(pct*5)+1,5));
}

// ─── Render ──────────────────────────────────────────────────────────────────
function render() {
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=CONFIG.zones[zone].bg; ctx.fillRect(0,0,W,H);
  const sc=Math.floor(camera.x/TILE), ec=Math.min(COLS,sc+Math.ceil(W/TILE)+2);
  const sr=Math.floor(camera.y/TILE), er=Math.min(ROWS,sr+Math.ceil(H/TILE)+2);
  for (let r=sr;r<er;r++) for (let c=sc;c<ec;c++) drawTile(r,c);
  for (const rose of roses) {
    const [rsx,rsy]=worldToScreen(rose.x,rose.y);
    ctx.fillStyle='#ff1493'; ctx.globalAlpha=rose.life/180;
    ctx.beginPath(); ctx.arc(rsx,rsy,5,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
  }
  for (const sw of shockwaves) {
    if (sw.delay>0) continue;
    const [swx,swy]=worldToScreen(sw.x,sw.y);
    ctx.save(); ctx.globalAlpha=(sw.life/sw.maxLife)*0.7;
    ctx.strokeStyle=sw.color; ctx.lineWidth=4+(1-sw.life/sw.maxLife)*8;
    ctx.shadowColor=sw.color; ctx.shadowBlur=20;
    ctx.beginPath(); ctx.arc(swx,swy,sw.radius,0,Math.PI*2); ctx.stroke();
    ctx.restore();
  }
  drawPrince(prince);
  for (const m of monsters) drawMonster(m);
  drawPlayer(player);
  if (state === 'winScreen') {
    const [sx, sy] = worldToScreen(player.x, player.y);
    ctx.font = '28px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💀', sx, sy - 24);
  }
  for (const proj of projectiles) drawProjectile(proj);
  for (const p of particles) drawParticle(p);
  for (const ft of floatingTexts) {
    const [ftx,fty]=worldToScreen(ft.x,ft.y);
    ctx.globalAlpha=ft.life/ft.maxLife; ctx.fillStyle=ft.color;
    ctx.font='bold 14px monospace'; ctx.textAlign='center';
    ctx.fillText(ft.text,ftx,fty); ctx.globalAlpha=1;
  }
  const vg=ctx.createRadialGradient(W/2,H/2,H*0.3,W/2,H/2,H*0.8);
  vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,0.5)');
  ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);
  if (player.hp<30) {
    const pulse=(Math.sin(frameCount*0.08)+1)/2;
    ctx.fillStyle=`rgba(255,0,0,${0.05+pulse*0.1})`; ctx.fillRect(0,0,W,H);
  }
}

function drawOverlay(title, sub, btnText, btnId) {
  const ov=document.getElementById('overlay');
  ov.innerHTML=`<h1>${title}</h1><div class="subtitle">${sub}</div>
    <div style="color:#c084fc;font-size:18px;font-weight:bold;margin-bottom:24px;">${CONFIG.hud.scoreLabel} ${score.toString().padStart(6,'0')}</div>
    <button id="${btnId}" style="background:linear-gradient(135deg,#ff1493,#c084fc);border:none;color:white;padding:14px 48px;font-size:18px;font-weight:bold;font-family:'Courier New',monospace;letter-spacing:3px;cursor:pointer;text-transform:uppercase;border-radius:12px;box-shadow:0 0 20px rgba(255,20,147,0.5);pointer-events:all;">${btnText}</button>`;
  if (btnId === 'winBtn') {
    ensureWinFloatersCanvas();
    winFloaters = [];
  }
  if (btnId === 'winBtn' && CONFIG.cutscene.winMusicVideoId && !ov.querySelector('iframe')) {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', `https://www.youtube.com/embed/${CONFIG.cutscene.winMusicVideoId}?autoplay=1`);
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.setAttribute('allowfullscreen', '');
    iframe.style.cssText = 'position:absolute;bottom:24px;left:50%;transform:translateX(-50%);width:320px;height:180px;border-radius:4px;pointer-events:auto;';
    ov.appendChild(iframe);
  }
  ov.style.display='flex';
}

let winFloatersCanvas = null;

function ensureWinFloatersCanvas() {
  if (winFloatersCanvas && winFloatersCanvas.parentNode) return;
  winFloatersCanvas = document.createElement('canvas');
  winFloatersCanvas.id = 'winFloatersCanvas';
  winFloatersCanvas.style.cssText = 'position:absolute;inset:0;z-index:100;pointer-events:none';
  document.getElementById('gameContainer').appendChild(winFloatersCanvas);
}

function updateAndDrawWinFloaters() {
  ensureWinFloatersCanvas();
  const cw = W;
  const ch = H;
  if (winFloatersCanvas.width !== cw || winFloatersCanvas.height !== ch) {
    winFloatersCanvas.width = cw;
    winFloatersCanvas.height = ch;
  }
  winFloatersCanvas.style.display = 'block';
  if (frameCount % 2 === 0) {
    const chars = ['♥', '💀'];
    for (let i = 0; i < 2; i++) {
      if (Math.random() >= 0.725) {
        winFloaters.push({
          x: Math.random() * cw,
          y: ch + 20,
          char: chars[Math.floor(Math.random() * chars.length)],
          speed: 0.8 + Math.random() * 1.2,
          size: 18 + Math.random() * 22,
          opacity: 0.5 + Math.random() * 0.5
        });
      }
    }
  }
  for (let i = winFloaters.length - 1; i >= 0; i--) {
    winFloaters[i].y -= winFloaters[i].speed;
    if (winFloaters[i].y < -40) winFloaters.splice(i, 1);
  }
  const fctx = winFloatersCanvas.getContext('2d');
  fctx.clearRect(0, 0, cw, ch);
  fctx.font = '24px sans-serif';
  fctx.textAlign = 'center';
  fctx.textBaseline = 'middle';
  for (const f of winFloaters) {
    fctx.save();
    fctx.globalAlpha = f.opacity * Math.min(1, (ch - f.y) / 80);
    fctx.font = `${Math.round(f.size)}px sans-serif`;
    if (f.char === '♥') {
      fctx.fillStyle = '#000';
      fctx.shadowColor = '#333';
    } else {
      fctx.fillStyle = '#e2e8f0';
      fctx.shadowColor = '#94a3b8';
    }
    fctx.shadowBlur = 8;
    fctx.fillText(f.char, f.x, f.y);
    fctx.restore();
  }
}

// ─── Init / Start ─────────────────────────────────────────────────────────────
function initZone(zoneIdx) {
  generateMap();
  player=createPlayer(); projectiles=[]; particles=[]; roses=[]; shockwaves=[];
  floatingTexts.length=0; camera={x:0,y:0}; zoneTransitionTimer=0;
  loveMeter=0; loveSoundPlayed=false;
  spawnMonsters(zoneIdx); spawnPrince();
}

function startGame() {
  score=0; zone=0; initZone(0);
  paused=false;
  const fill=document.getElementById('healthFill');
  fill.style.transition='none'; fill.style.width='100%';
  requestAnimationFrame(()=>fill.style.transition='');
  document.getElementById('overlay').style.display='none';
  if (winFloatersCanvas) winFloatersCanvas.style.display = 'none';
  state='playing';
}

// ─── Game Loop ────────────────────────────────────────────────────────────────
function gameLoop() {
  requestAnimationFrame(gameLoop);
  frameCount++;

  if (state==='playing') {
    if (!paused) {
      updatePlayer(player);
      for (const m of monsters) updateMonster(m);
      updateProjectiles(); updateParticles(); updateFloatingTexts();
      updateCamera(); updatePrince(); checkWin();
    for (let i=roses.length-1;i>=0;i--) { roses[i].life--; if (roses[i].life<=0) roses.splice(i,1); }
    if (screenShake>0) screenShake=Math.max(0,screenShake-1.2);
    for (let i=shockwaves.length-1;i>=0;i--) {
      const sw=shockwaves[i];
      if (sw.delay>0){sw.delay--;continue;}
      sw.radius+=(sw.maxRadius-sw.radius)*0.14; sw.life--;
      if (sw.life<=0) shockwaves.splice(i,1);
    }
    }
    if (zoneTransitionTimer>0) {
      zoneTransitionTimer--;
      const t=zoneTransitionTimer;
      if (t===80) { zone++; initZone(zone); }
      if (t>=80&&t<130) {
        ctx.fillStyle='rgba(0,0,0,0.92)'; ctx.fillRect(0,0,W,H);
        ctx.fillStyle='#ff69b4'; ctx.font='bold 28px monospace'; ctx.textAlign='center';
        ctx.shadowColor='#ff69b4'; ctx.shadowBlur=20;
        ctx.fillText(CONFIG.messages.ranAway, W/2, H/2-24);
        ctx.fillStyle='#c084fc'; ctx.font='bold 14px monospace'; ctx.shadowColor='#c084fc';
        ctx.fillText(CONFIG.messages.entering.replace('%s', CONFIG.zones[Math.min(zone,CONFIG.zones.length-1)].name), W/2, H/2+18);
        ctx.shadowBlur=0;
      } else if (t<80) {
        const a=1-t/80; ctx.fillStyle=`rgba(0,0,0,${a})`; ctx.fillRect(0,0,W,H);
      }
    }
    render(); updateHUD(); drawMinimap();
    // Prince excuses (fleeing): dialogue balloon + Superman emoji
    if (prince && prince.fleeing && prince.speech && prince.speechTimer > 0) {
      const alpha = Math.min(1, prince.speechTimer / 25) * (1 - Math.max(0, (prince.speechTimer - 340) / 20) * 0.3);
      const msg = prince.speech;
      ctx.save();
      ctx.globalAlpha = alpha;
      const cx = W / 2, cy = H / 2;
      const padX = 48, padY = 28;
      ctx.font = 'bold 28px monospace';
      const tw = ctx.measureText(msg).width;
      const bubbleW = Math.max(tw + padX * 2, 280);
      const bubbleH = 72;
      const radius = 20;
      const bubbleX = cx - bubbleW / 2;
      const bubbleY = cy - bubbleH - 100;
      const tailY = bubbleY + bubbleH;
      const r = radius;
      const tailW = 18;
      const tailH = 22;
      // Single path: balloon + tail so stroke doesn't cross at the junction
      ctx.fillStyle = '#fffef9';
      ctx.strokeStyle = '#ff69b4';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bubbleX + r, bubbleY);
      ctx.lineTo(bubbleX + bubbleW - r, bubbleY);
      ctx.quadraticCurveTo(bubbleX + bubbleW, bubbleY, bubbleX + bubbleW, bubbleY + r);
      ctx.lineTo(bubbleX + bubbleW, bubbleY + bubbleH - r);
      ctx.quadraticCurveTo(bubbleX + bubbleW, tailY, bubbleX + bubbleW - r, tailY);
      ctx.lineTo(cx + tailW, tailY);
      ctx.lineTo(cx, tailY + tailH);
      ctx.lineTo(cx - tailW, tailY);
      ctx.lineTo(bubbleX + r, tailY);
      ctx.quadraticCurveTo(bubbleX, tailY, bubbleX, bubbleY + bubbleH - r);
      ctx.lineTo(bubbleX, bubbleY + r);
      ctx.quadraticCurveTo(bubbleX, bubbleY, bubbleX + r, bubbleY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Text inside balloon
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#2d0a1a';
      ctx.font = 'bold 28px monospace';
      ctx.fillText(msg, cx, bubbleY + bubbleH / 2);
      // Superman emoji (large, below balloon — he's "talking")
      ctx.font = '120px sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillText('🦸🏻‍♂️', cx, cy + 20);
      ctx.restore();
    }
    if (paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#ff69b4';
      ctx.font = 'bold 36px monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#ff69b4';
      ctx.shadowBlur = 20;
      ctx.fillText(CONFIG.messages.paused, W/2, H/2 - 20);
      ctx.fillStyle = '#c084fc';
      ctx.font = '14px monospace';
      ctx.shadowBlur = 0;
      ctx.fillText(CONFIG.messages.pressResume, W/2, H/2 + 20);
    }

  } else if (state==='cutscene') {
    cutsceneTimer++;
    updateParticles(); updateFloatingTexts();
    if (screenShake>0) screenShake=Math.max(0,screenShake-1.2);
    for (let i=shockwaves.length-1;i>=0;i--) {
      const sw=shockwaves[i]; if (sw.delay>0){sw.delay--;continue;}
      sw.radius+=(sw.maxRadius-sw.radius)*0.14; sw.life--; if (sw.life<=0) shockwaves.splice(i,1);
    }
    if (cutsceneTimer<90) {
      const dx=prince.x-player.x, dy=prince.y-player.y;
      const dist=Math.sqrt(dx*dx+dy*dy);
      if (dist>40) { player.x+=dx/dist*3; player.y+=dy/dist*3; }
    }
    if (cutsceneTimer===90) {
      playSound('kiss');
      for (let i=0;i<5;i++) spawnHearts(prince.x,prince.y,16,8+i*2);
      spawnParticles(prince.x,prince.y,'#ffd700',50,12);
      spawnParticles(prince.x,prince.y,'#ff69b4',50,10);
      screenShake=20;
      shockwaves.push({x:prince.x,y:prince.y,radius:0,maxRadius:400,life:50,maxLife:50,color:'#ffd700',delay:0});
      shockwaves.push({x:prince.x,y:prince.y,radius:0,maxRadius:300,life:40,maxLife:40,color:'#ff69b4',delay:6});
    }
    if (cutsceneTimer>90&&cutsceneTimer<300&&frameCount%3===0) {
      particles.push({
        x:Math.random()*W+camera.x, y:camera.y-20,
        vx:(Math.random()-0.5)*2, vy:2+Math.random()*2,
        color:Math.random()<0.5?'#ff69b4':'#ffd700',
        life:180,maxLife:180,size:6+Math.random()*8,heart:true,
      });
    }
    updateCamera();
    render();
    if (cutsceneTimer>100) {
      const a=Math.min(1,(cutsceneTimer-100)/40);
      ctx.save(); ctx.globalAlpha=a;
      ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#ffd700'; ctx.font=`bold ${Math.floor(36+Math.sin(cutsceneTimer*0.05)*4)}px monospace`;
      ctx.textAlign='center'; ctx.shadowColor='#ffd700'; ctx.shadowBlur=30;
      ctx.fillText(CONFIG.cutscene.finally, W/2, H/2-40); ctx.shadowBlur=0;
      if (cutsceneTimer>160) {
        ctx.fillStyle='#ff69b4'; ctx.font='bold 48px monospace';
        ctx.shadowColor='#ff69b4'; ctx.shadowBlur=40;
        ctx.fillText(CONFIG.cutscene.trueLove, W/2, H/2+20); ctx.shadowBlur=0;
      }
      ctx.restore();
    }
    if (cutsceneTimer===300) {
      drawOverlay(CONFIG.cutscene.trueLove, CONFIG.cutscene.winSubtitle, CONFIG.cutscene.playAgain, 'winBtn');
      document.getElementById('winBtn').addEventListener('click', startGame);
      state='winScreen';
    }
    drawMinimap();

  } else if (state==='dead') {
    render();
    drawOverlay(CONFIG.death.title, CONFIG.death.subtitle, CONFIG.death.retry, 'retryBtn');
    document.getElementById('retryBtn').addEventListener('click', startGame);
    state='deadScreen';
  } else if (state==='winScreen') {
    document.getElementById('overlay').style.display = 'flex';
    if (!document.getElementById('winBtn')) {
      drawOverlay(CONFIG.cutscene.trueLove, CONFIG.cutscene.winSubtitle, CONFIG.cutscene.playAgain, 'winBtn');
      document.getElementById('winBtn').addEventListener('click', startGame);
    }
    updateAndDrawWinFloaters();
    render();
  } else {
    if (state!=='menu') render();
  }
}

const pauseBtn = document.getElementById('pauseBtn');
function setPauseButtonVisible(visible) {
  pauseBtn.style.display = visible ? 'block' : 'none';
}
setPauseButtonVisible(false);

document.getElementById('startBtn').addEventListener('click', () => {
  startGame();
  setPauseButtonVisible(true);
  pauseBtn.textContent = CONFIG.buttons.pause;
});

pauseBtn.addEventListener('click', () => {
  if (state !== 'playing') return;
  paused = !paused;
  pauseBtn.textContent = paused ? CONFIG.buttons.resume : CONFIG.buttons.pause;
});

gameLoop();
