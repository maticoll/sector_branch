import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const RoundState = {
  MENU: "MENU",
  BUY_PHASE: "BUY_PHASE",
  PLAYING: "PLAYING",
  BOMB_PLANTED: "BOMB_PLANTED",
  ROUND_WIN_ATTACKERS: "ROUND_WIN_ATTACKERS",
  ROUND_WIN_DEFENDERS: "ROUND_WIN_DEFENDERS",
  GAME_OVER: "GAME_OVER",
};

const BotState = {
  SPAWN: "SPAWN",
  MOVE_TO_SITE: "MOVE_TO_SITE",
  FOLLOW_PLAYER: "FOLLOW_PLAYER",
  PATROL: "PATROL",
  HOLD_POSITION: "HOLD_POSITION",
  ENGAGE_ENEMY: "ENGAGE_ENEMY",
  TAKE_COVER: "TAKE_COVER",
  PLANT_BOMB: "PLANT_BOMB",
  DEFUSE_BOMB: "DEFUSE_BOMB",
  ROTATE_TO_BOMB: "ROTATE_TO_BOMB",
  DEAD: "DEAD",
};

const BombState = {
  CARRIED: "CARRIED",
  DROPPED: "DROPPED",
  PLANTING: "PLANTING",
  PLANTED: "PLANTED",
  DEFUSING: "DEFUSING",
  EXPLODED: "EXPLODED",
  DEFUSED: "DEFUSED",
};

const TEAM = { ATTACKERS: "attackers", DEFENDERS: "defenders" };

const ASSET_PATHS = {
  characters: {
    ally: "./assets/characters/ally/soldier.glb",
    enemy: "./assets/characters/enemy/soldier.glb",
  },
  maps: {
    warehouse: "./assets/maps/map_warehouse/scene.glb",
    desert: "./assets/maps/map_desert/scene.glb",
    container_yard: "./assets/maps/map_container_yard/scene.glb",
  },
  sounds: {
    pistol: "./assets/sounds/pistol_shot.mp3",
    smg: "./assets/sounds/smg_shot.mp3",
    rifle: "./assets/sounds/rifle_shot.mp3",
    sniper: "./assets/sounds/sniper_shot.mp3",
    shotgun: "./assets/sounds/shotgun_shot.mp3",
    reload: "./assets/sounds/reload.mp3",
    empty: "./assets/sounds/empty_click.mp3",
    hit: "./assets/sounds/hit_enemy.mp3",
    headshot: "./assets/sounds/headshot.mp3",
    wall: "./assets/sounds/impact_wall.mp3",
    plant: "./assets/sounds/bomb_plant.mp3",
    defuse: "./assets/sounds/bomb_defuse.mp3",
    explosion: "./assets/sounds/explosion.mp3",
    win: "./assets/sounds/win.mp3",
    lose: "./assets/sounds/lose.mp3",
    step: "./assets/sounds/footsteps.mp3",
  },
};

const WEAPONS = {
  pistol: {
    key: "pistol", slot: "1", name: "P-9", type: "pistol", price: 0,
    modelUrl: "./assets/weapons/pistol/weapon.glb", soundKey: "pistol",
    damage: 28, fireDelay: 0.32, magazineSize: 12, reserveMags: 4, reloadTime: 1.2,
    baseSpread: 0.006, movingSpread: 0.035, runSpread: 0.06, jumpSpread: 0.08,
    recoilKick: 0.022, recoilHeat: 0.012, recoilRecovery: 4.3, automatic: false, pellets: 1,
  },
  smg: {
    key: "smg", slot: "2", name: "Viper SMG", type: "smg", price: 650,
    modelUrl: "./assets/weapons/smg/weapon.glb", soundKey: "smg",
    damage: 19, fireDelay: 0.078, magazineSize: 25, reserveMags: 4, reloadTime: 1.55,
    baseSpread: 0.013, movingSpread: 0.05, runSpread: 0.075, jumpSpread: 0.1,
    recoilKick: 0.014, recoilHeat: 0.008, recoilRecovery: 5.4, automatic: true, pellets: 1,
  },
  rifle: {
    key: "rifle", slot: "3", name: "R-47", type: "rifle", price: 2700,
    modelUrl: "./assets/weapons/rifle/weapon.glb", soundKey: "rifle",
    damage: 34, fireDelay: 0.11, magazineSize: 30, reserveMags: 3, reloadTime: 2.1,
    baseSpread: 0.009, movingSpread: 0.06, runSpread: 0.09, jumpSpread: 0.12,
    recoilKick: 0.033, recoilHeat: 0.018, recoilRecovery: 3.5, automatic: true, pellets: 1,
  },
  sentinel: {
    key: "sentinel", slot: "4", name: "Sentinel Rifle", type: "rifle", price: 3200,
    modelUrl: "./assets/weapons/sentinel/weapon.glb", soundKey: "rifle",
    damage: 42, fireDelay: 0.15, magazineSize: 20, reserveMags: 3, reloadTime: 2.25,
    baseSpread: 0.006, movingSpread: 0.052, runSpread: 0.08, jumpSpread: 0.105,
    recoilKick: 0.038, recoilHeat: 0.02, recoilRecovery: 3.2, automatic: true, pellets: 1,
  },
  sniper: {
    key: "sniper", slot: "5", name: "Longshot", type: "sniper", price: 4100,
    modelUrl: "./assets/weapons/sniper/weapon.glb", soundKey: "sniper",
    damage: 92, fireDelay: 1.05, magazineSize: 5, reserveMags: 4, reloadTime: 2.6,
    baseSpread: 0.002, movingSpread: 0.09, runSpread: 0.14, jumpSpread: 0.18,
    recoilKick: 0.075, recoilHeat: 0.026, recoilRecovery: 2.4, automatic: false, pellets: 1,
  },
  shotgun: {
    key: "shotgun", slot: "6", name: "Bulldog Shotgun", type: "shotgun", price: 1800,
    modelUrl: "./assets/weapons/shotgun/weapon.glb", soundKey: "shotgun",
    damage: 13, fireDelay: 0.72, magazineSize: 7, reserveMags: 4, reloadTime: 2.0,
    baseSpread: 0.045, movingSpread: 0.08, runSpread: 0.11, jumpSpread: 0.14,
    recoilKick: 0.06, recoilHeat: 0.018, recoilRecovery: 3.0, automatic: false, pellets: 8,
  },
};

const MAPS = [
  {
    id: "warehouse",
    name: "Warehouse",
    modelUrl: ASSET_PATHS.maps.warehouse,
    theme: "warehouse",
    attackerSpawn: new THREE.Vector3(-18, 1.65, 14),
    defenderSpawn: new THREE.Vector3(18, 1.65, -14),
    bombSites: { A: new THREE.Vector3(12, 0, -11), B: new THREE.Vector3(9, 0, 12) },
    bounds: { minX: -24, maxX: 24, minZ: -24, maxZ: 24 },
  },
  {
    id: "desert",
    name: "Desert Outpost",
    modelUrl: ASSET_PATHS.maps.desert,
    theme: "desert",
    attackerSpawn: new THREE.Vector3(-18, 1.65, -15),
    defenderSpawn: new THREE.Vector3(18, 1.65, 15),
    bombSites: { A: new THREE.Vector3(9, 0, -10), B: new THREE.Vector3(13, 0, 9) },
    bounds: { minX: -25, maxX: 25, minZ: -25, maxZ: 25 },
  },
  {
    id: "container_yard",
    name: "Container Yard",
    modelUrl: ASSET_PATHS.maps.container_yard,
    theme: "containers",
    attackerSpawn: new THREE.Vector3(0, 1.65, 19),
    defenderSpawn: new THREE.Vector3(0, 1.65, -19),
    bombSites: { A: new THREE.Vector3(-12, 0, -9), B: new THREE.Vector3(13, 0, -5) },
    bounds: { minX: -26, maxX: 26, minZ: -26, maxZ: 26 },
  },
];

function makeTexture(size, painter) {
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d");
  painter(ctx, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function concreteTexture(base = "#3f463e") {
  return makeTexture(512, (ctx, w, h) => {
    ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 1800; i++) {
      const s = 35 + Math.random() * 70;
      ctx.fillStyle = `rgba(${s},${s + 8},${s},0.14)`;
      ctx.fillRect(Math.random() * w, Math.random() * h, rand(1, 5), rand(1, 5));
    }
    ctx.strokeStyle = "rgba(230,240,220,0.08)";
    for (let i = 0; i < w; i += 128) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke(); }
    for (let i = 0; i < h; i += 128) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke(); }
  });
}

function ribbedTexture(color = "#53646a") {
  return makeTexture(512, (ctx, w, h) => {
    ctx.fillStyle = color; ctx.fillRect(0, 0, w, h);
    for (let x = 18; x < w; x += 54) {
      ctx.fillStyle = "rgba(255,255,255,0.07)"; ctx.fillRect(x, 0, 12, h);
      ctx.fillStyle = "rgba(0,0,0,0.2)"; ctx.fillRect(x + 13, 0, 5, h);
    }
    ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 8; ctx.strokeRect(8, 8, w - 16, h - 16);
  });
}

class AssetManager {
  constructor() {
    this.gltf = new GLTFLoader();
    this.draco = new DRACOLoader();
    this.draco.setDecoderPath("https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/");
    this.gltf.setDRACOLoader(this.draco);
    this.rgbe = new RGBELoader();
    this.audio = new Map();
    this.models = new Map();
  }

  loadModel(url, fallbackFactory, onReady) {
    if (!url) {
      console.warn("Model URL missing, using fallback.");
      onReady(fallbackFactory());
      return;
    }
    this.gltf.load(url, (gltf) => {
      const model = gltf.scene;
      model.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });
      onReady(model);
    }, undefined, (error) => {
      console.warn(`Could not load model ${url}; using fallback.`, error);
      onReady(fallbackFactory());
    });
  }

  loadSound(key, url) {
    if (!url) return;
    const audio = new Audio();
    audio.src = url;
    audio.preload = "auto";
    audio.addEventListener("canplaythrough", () => this.audio.set(key, audio), { once: true });
    audio.addEventListener("error", () => console.warn(`Could not load sound ${url}; using procedural fallback.`), { once: true });
    audio.load();
  }

  playSound(key, volume = 0.8) {
    const src = this.audio.get(key);
    if (!src) return false;
    const clone = src.cloneNode();
    clone.volume = volume;
    clone.play().catch(() => {});
    return true;
  }
}

class AudioManager {
  constructor(assets) {
    this.assets = assets;
    this.ctx = null;
    this.stepTimer = 0;
  }

  resume() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === "suspended") this.ctx.resume();
  }

  tone(freq, dur, type = "sine", gain = 0.07, slide = 0) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), now + dur);
    amp.gain.setValueAtTime(gain, now);
    amp.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(amp).connect(this.ctx.destination);
    osc.start(now); osc.stop(now + dur);
  }

  noise(dur, gain, freq = 900, type = "bandpass") {
    if (!this.ctx) return;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const amp = this.ctx.createGain();
    filter.type = type; filter.frequency.value = freq;
    amp.gain.setValueAtTime(gain, this.ctx.currentTime);
    amp.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    src.buffer = buf; src.connect(filter).connect(amp).connect(this.ctx.destination); src.start();
  }

  gun(weapon) {
    if (this.assets.playSound(weapon.soundKey, 0.75)) return;
    const p = {
      pistol: [0.07, 0.18, 1100, 120],
      smg: [0.045, 0.12, 1450, 155],
      rifle: [0.065, 0.22, 1250, 86],
      sniper: [0.14, 0.32, 720, 68],
      shotgun: [0.11, 0.28, 620, 74],
    }[weapon.type] || [0.06, 0.16, 900, 100];
    this.noise(p[0], p[1], p[2]); this.tone(p[3], p[0] + 0.03, "sawtooth", p[1] * 0.42, -55);
  }

  event(key) {
    if (this.assets.playSound(key, 0.75)) return;
    const map = {
      reload: () => { this.tone(320, 0.08, "triangle", 0.055, 80); setTimeout(() => this.tone(220, 0.08, "triangle", 0.05, -55), 250); },
      empty: () => this.tone(220, 0.035, "square", 0.04, -90),
      hit: () => this.tone(760, 0.045, "square", 0.055, 120),
      headshot: () => this.tone(980, 0.06, "triangle", 0.07, 210),
      wall: () => this.noise(0.035, 0.04, 360, "lowpass"),
      plant: () => this.tone(440, 0.22, "triangle", 0.07, 80),
      defuse: () => this.tone(520, 0.18, "triangle", 0.07, -80),
      explosion: () => { this.noise(0.55, 0.35, 130, "lowpass"); this.tone(55, 0.45, "sawtooth", 0.18, -20); },
      win: () => { this.tone(480, 0.1, "triangle", 0.08, 250); setTimeout(() => this.tone(720, 0.12, "triangle", 0.07, 120), 110); },
      lose: () => this.tone(160, 0.28, "sawtooth", 0.08, -80),
      hurt: () => this.tone(75, 0.16, "sawtooth", 0.1, -20),
      round: () => this.tone(430, 0.09, "triangle", 0.07, 120),
    };
    map[key]?.();
  }

  footsteps(dt, speed, crouch) {
    if (!this.ctx || speed < 0.35) return;
    this.stepTimer -= dt * (crouch ? 0.55 : 1);
    if (this.stepTimer <= 0) {
      this.stepTimer = clamp(0.42 - speed * 0.025, 0.22, 0.46);
      if (!this.assets.playSound("step", crouch ? 0.15 : 0.25)) this.noise(0.035, crouch ? 0.015 : 0.03, 180, "lowpass");
    }
  }
}

class HUD {
  constructor() {
    this.root = document.querySelector("#hud");
    this.healthText = document.querySelector("#health-text");
    this.healthFill = document.querySelector("#health-fill");
    this.armorText = document.querySelector("#armor-text");
    this.weaponText = document.querySelector("#weapon-text");
    this.ammoText = document.querySelector("#ammo-text");
    this.moneyText = document.querySelector("#money-text");
    this.roundText = document.querySelector("#round-text");
    this.aliveText = document.querySelector("#alive-text");
    this.phaseLabel = document.querySelector("#phase-label");
    this.timerText = document.querySelector("#timer-text");
    this.objectiveTitle = document.querySelector("#objective-title");
    this.objectiveText = document.querySelector("#objective-text");
    this.objectiveProgress = document.querySelector("#objective-progress");
    this.hitMarker = document.querySelector("#hit-marker");
    this.headshotMarker = document.querySelector("#headshot-marker");
    this.damage = document.querySelector("#damage-vignette");
    this.toast = document.querySelector("#status-toast");
    this.buyPanel = document.querySelector("#buy-panel");
    this.shop = document.querySelector("#weapon-shop");
    this.startScreen = document.querySelector("#start-screen");
    this.roundScreen = document.querySelector("#round-screen");
    this.roundKicker = document.querySelector("#round-kicker");
    this.roundTitle = document.querySelector("#round-title");
    this.roundCopy = document.querySelector("#round-copy");
    this.nextRoundButton = document.querySelector("#next-round-button");
    this.debugPanel = document.querySelector("#debug-panel");
    this.scoreboard = document.querySelector("#scoreboard");
    this.attackersList = document.querySelector("#attackers-list");
    this.defendersList = document.querySelector("#defenders-list");
    this.scoreboardFooter = document.querySelector("#scoreboard-footer");
  }

  buildShop(weapons, onBuy) {
    this.shop.innerHTML = "";
    Object.values(weapons).forEach((w) => {
      const btn = document.createElement("button");
      btn.className = "shop-item";
      btn.type = "button";
      btn.setAttribute("aria-label", `Comprar ${w.name} por ${w.price}`);
      btn.dataset.weapon = w.key;
      btn.innerHTML = `<div class="shop-main"><span>${w.slot}. ${w.name}</span><b>$${w.price}</b></div>
        <div class="shop-stats">Daño ${w.damage} · Cargador ${w.magazineSize} · ${w.automatic ? "Auto" : "Semi"} · ${w.type}</div>`;
      btn.addEventListener("click", () => onBuy(w.key));
      this.shop.appendChild(btn);
    });
  }

  update(state) {
    const health = clamp(state.health, 0, 100);
    this.healthText.textContent = Math.ceil(health);
    this.healthFill.style.width = `${health}%`;
    this.healthFill.style.background = health < 35 ? "linear-gradient(90deg,#ff5248,#f3b45d)" : "linear-gradient(90deg,#b6f45a,#e8db68)";
    this.armorText.textContent = Math.ceil(state.armor);
    this.weaponText.textContent = state.weaponName;
    this.ammoText.textContent = `${state.ammo} / ${state.reserve}`;
    this.moneyText.textContent = `$${state.money}`;
    this.roundText.textContent = state.round;
    this.aliveText.textContent = `${state.attackersAlive}v${state.defendersAlive}`;
    this.phaseLabel.textContent = state.phaseLabel;
    this.timerText.textContent = state.timer;
    this.objectiveTitle.textContent = state.objectiveTitle;
    this.objectiveText.textContent = state.objectiveText;
    this.objectiveProgress.style.width = `${clamp(state.objectiveProgress, 0, 1) * 100}%`;
    this.root.style.setProperty("--spread", `${clamp(state.crosshairSpread, 7, 30)}px`);
    for (const item of this.shop.querySelectorAll(".shop-item")) {
      const key = item.dataset.weapon;
      item.classList.toggle("owned", key === state.weaponKey);
      item.disabled = state.money < WEAPONS[key].price && key !== state.weaponKey && !state.ownedWeapons.includes(key);
    }
  }

  setBuyVisible(v) { this.buyPanel.classList.toggle("hidden", !v); }
  hideStart() { this.startScreen.classList.add("hidden"); }
  hideRoundScreen() { this.roundScreen.classList.add("hidden"); }

  showRoundScreen(winner, text) {
    const atk = winner === TEAM.ATTACKERS;
    this.roundKicker.textContent = atk ? "ATACANTES GANAN" : "DEFENSORES GANAN";
    this.roundTitle.textContent = atk ? "Objetivo cumplido" : "Zona defendida";
    this.roundCopy.textContent = text;
    this.roundScreen.classList.remove("hidden");
  }

  toastMessage(text, ms = 900) {
    this.toast.textContent = text;
    this.toast.classList.add("active");
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.classList.remove("active"), ms);
  }

  showHit(headshot = false) {
    this.hitMarker.classList.add("active");
    clearTimeout(this.hitTimer);
    this.hitTimer = setTimeout(() => this.hitMarker.classList.remove("active"), 95);
    if (headshot) {
      this.headshotMarker.classList.add("active");
      clearTimeout(this.headTimer);
      this.headTimer = setTimeout(() => this.headshotMarker.classList.remove("active"), 520);
    }
  }

  showDamage() {
    this.damage.classList.add("active");
    clearTimeout(this.damageTimer);
    this.damageTimer = setTimeout(() => this.damage.classList.remove("active"), 160);
  }

  updateDebug(text, visible) {
    this.debugPanel.classList.toggle("hidden", !visible);
    if (visible) this.debugPanel.textContent = text;
  }

  updateScoreboard(game, visible) {
    this.scoreboard.classList.toggle("hidden", !visible);
    if (!visible) return;
    const row = (m) => `<div class="score-row ${m.alive ? "" : "dead"}"><span>${m.name}</span><b>${m.kills} K · ${m.alive ? "VIVO" : "FUERA"}</b></div>`;
    this.attackersList.innerHTML = game.teams.attackers.members.map(row).join("");
    this.defendersList.innerHTML = game.teams.defenders.members.map(row).join("");
    this.scoreboardFooter.textContent = `Rondas ${game.round.attackWins}-${game.round.defenseWins} · Dinero $${game.economy.money} · Bomba ${game.bomb.state}`;
  }
}

class InputManager {
  constructor(game) {
    this.game = game;
    this.keys = new Set();
    this.mouseDown = false;
    this.isPointerLocked = false;
    this.scoreboard = false;
    this.bind();
  }

  bind() {
    window.addEventListener("keydown", (e) => {
      this.keys.add(e.code);
      if (["Space", "ControlLeft", "Tab", "F3"].includes(e.code)) e.preventDefault();
      if (e.code === "KeyR") this.game.weapons.reload();
      if (e.code === "KeyB") this.game.toggleBuyPanel();
      if (e.code === "KeyE") this.game.interactHeld = true;
      if (e.code === "Tab") this.scoreboard = true;
      if (e.code === "F3") this.game.debugVisible = !this.game.debugVisible;
      if (/^Digit[1-6]$/.test(e.code)) this.game.handleWeaponHotkey(e.code.replace("Digit", ""));
    });
    window.addEventListener("keyup", (e) => {
      this.keys.delete(e.code);
      if (e.code === "KeyE") this.game.interactHeld = false;
      if (e.code === "Tab") this.scoreboard = false;
    });
    document.addEventListener("pointerlockchange", () => {
      this.isPointerLocked = document.pointerLockElement === this.game.renderer.domElement || document.pointerLockElement === document.body;
    });
    document.addEventListener("mousemove", (e) => {
      if (!this.isPointerLocked || this.game.round.state === RoundState.MENU) return;
      this.game.player.look(e.movementX, e.movementY);
    });
    document.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      this.game.lockPointerAndStart();
    });
    document.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      this.mouseDown = true;
      if (this.isPointerLocked) this.game.weapons.triggerDown();
    });
    document.addEventListener("mouseup", () => {
      this.mouseDown = false;
      this.game.weapons.triggerUp();
    });
  }

  get movement() {
    return {
      forward: (this.keys.has("KeyW") ? 1 : 0) + (this.keys.has("KeyS") ? -1 : 0),
      right: (this.keys.has("KeyD") ? 1 : 0) + (this.keys.has("KeyA") ? -1 : 0),
      slow: this.keys.has("ShiftLeft") || this.keys.has("ShiftRight"),
      crouch: this.keys.has("ControlLeft") || this.keys.has("ControlRight"),
      jump: this.keys.has("Space"),
    };
  }
}

class CollisionSystem {
  constructor() { this.colliders = []; }
  clear() { this.colliders = []; }
  addBox(x, y, z, w, h, d) {
    this.colliders.push(new THREE.Box3(new THREE.Vector3(x - w / 2, y - h / 2, z - d / 2), new THREE.Vector3(x + w / 2, y + h / 2, z + d / 2)));
  }
  collides(pos, radius) {
    return this.colliders.some((box) => {
      const x = clamp(pos.x, box.min.x, box.max.x);
      const z = clamp(pos.z, box.min.z, box.max.z);
      const dx = pos.x - x, dz = pos.z - z;
      return dx * dx + dz * dz < radius * radius && pos.y > box.min.y - 0.3;
    });
  }
  raycast(origin, dir, maxDist) {
    const ray = new THREE.Ray(origin, dir);
    let best = null, bestDist = maxDist;
    for (const box of this.colliders) {
      const hit = ray.intersectBox(box, new THREE.Vector3());
      if (!hit) continue;
      const dist = hit.distanceTo(origin);
      if (dist < bestDist) { bestDist = dist; best = hit.clone(); }
    }
    return best;
  }
}

class EconomyManager {
  constructor() {
    this.money = 800;
    this.ownedWeapons = new Set(["pistol"]);
    this.armor = 50;
  }
  canBuy(key) { return this.ownedWeapons.has(key) || this.money >= WEAPONS[key].price; }
  buy(key) {
    if (this.ownedWeapons.has(key)) return true;
    const price = WEAPONS[key].price;
    if (this.money < price) return false;
    this.money -= price;
    this.ownedWeapons.add(key);
    return true;
  }
  award(reason, amount) { this.money = clamp(this.money + amount, 0, 16000); return reason; }
}

function createWeaponFallback(type) {
  const g = new THREE.Group();
  const colors = { pistol: 0x303832, smg: 0x2d4850, rifle: 0x3d4532, sniper: 0x22272d, shotgun: 0x5a3d2d };
  const dark = new THREE.MeshStandardMaterial({ color: colors[type] || 0x303832, roughness: 0.48, metalness: 0.38 });
  const accent = new THREE.MeshStandardMaterial({ color: 0xb9d39a, roughness: 0.6, metalness: 0.15 });
  const len = type === "sniper" ? 0.95 : type === "shotgun" ? 0.82 : type === "pistol" ? 0.46 : 0.68;
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.16, len), dark);
  const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.08, len * 0.72), dark);
  barrel.position.set(0, 0.03, -len * 0.52);
  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, 0.14), accent);
  grip.position.set(0.02, -0.22, 0.12);
  grip.rotation.x = -0.2;
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.045, 0.16), accent);
  rail.position.set(0, 0.12, -0.08);
  const flash = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.3, 9), new THREE.MeshBasicMaterial({ color: 0xffd36a, transparent: true, opacity: 0 }));
  flash.name = "muzzleFlash";
  flash.rotation.x = Math.PI / 2;
  flash.position.set(0, 0.03, -len * 0.93);
  g.add(body, barrel, grip, rail, flash);
  return g;
}

function createSoldierFallback(team) {
  const g = new THREE.Group();
  const main = team === TEAM.ATTACKERS ? 0x2f6d87 : 0x80362f;
  const suit = new THREE.MeshStandardMaterial({ color: main, roughness: 0.72, metalness: 0.05 });
  const armor = new THREE.MeshStandardMaterial({ color: 0x202723, roughness: 0.55, metalness: 0.2 });
  const visor = new THREE.MeshStandardMaterial({ color: team === TEAM.ATTACKERS ? 0x7dd9d2 : 0xf3b45d, emissive: team === TEAM.ATTACKERS ? 0x0a4a50 : 0x5a2a00, emissiveIntensity: 0.32 });
  const parts = [
    ["legs", new THREE.BoxGeometry(0.5, 0.62, 0.3), suit, [0, 0.35, 0], "legs"],
    ["torso", new THREE.CapsuleGeometry(0.34, 0.62, 8, 14), suit, [0, 1.0, 0], "torso"],
    ["vest", new THREE.BoxGeometry(0.64, 0.52, 0.24), armor, [0, 1.03, -0.04], "torso"],
    ["head", new THREE.SphereGeometry(0.24, 18, 12), armor, [0, 1.58, 0], "head"],
    ["leftArm", new THREE.BoxGeometry(0.14, 0.52, 0.16), suit, [-0.43, 1.05, -0.04], "torso"],
    ["rightArm", new THREE.BoxGeometry(0.14, 0.52, 0.16), suit, [0.43, 1.05, -0.04], "torso"],
  ];
  for (const [name, geo, mat, pos, zone] of parts) {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = name; mesh.position.set(...pos); mesh.castShadow = true; mesh.receiveShadow = true; mesh.userData.zone = zone; g.add(mesh);
  }
  const visorMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.075, 0.045), visor);
  visorMesh.position.set(0, 1.61, -0.225); g.add(visorMesh);
  const rifle = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.1, 0.68), armor);
  rifle.name = "botWeapon"; rifle.position.set(0.31, 1.05, -0.38); g.add(rifle);
  const flash = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 8), new THREE.MeshBasicMaterial({ color: 0xffc65a, transparent: true, opacity: 0 }));
  flash.name = "botMuzzleFlash"; flash.rotation.x = Math.PI / 2; flash.position.set(0.31, 1.05, -0.78); g.add(flash);
  return g;
}

class WeaponManager {
  constructor(game) {
    this.game = game;
    this.currentKey = "pistol";
    this.current = WEAPONS.pistol;
    this.inventory = {};
    this.triggerHeld = false;
    this.lastShot = -99;
    this.recoilHeat = 0;
    this.visualRecoil = 0;
    this.reloadTimer = 0;
    this.isReloading = false;
    this.flash = null;
    this.model = new THREE.Group();
    this.game.camera.add(this.model);
    this.resetInventory();
    this.loadWeaponModel("pistol");
  }
  resetInventory() {
    Object.values(WEAPONS).forEach((w) => this.inventory[w.key] = { ammo: w.magazineSize, reserve: w.magazineSize * w.reserveMags });
  }
  loadWeaponModel(key) {
    const w = WEAPONS[key];
    this.model.clear();
    this.game.assets.loadModel(w.modelUrl, () => createWeaponFallback(w.type), (model) => {
      model.scale.setScalar(1);
      model.position.set(0.34, -0.28, -0.64);
      model.rotation.set(0, 0, 0);
      this.model.add(model);
      this.flash = model.getObjectByName("muzzleFlash");
    });
  }
  switchTo(key) {
    if (!this.game.economy.ownedWeapons.has(key)) return false;
    this.currentKey = key; this.current = WEAPONS[key]; this.isReloading = false; this.reloadTimer = 0; this.loadWeaponModel(key); this.game.hud.toastMessage(this.current.name, 650); return true;
  }
  buyOrSwitch(key) {
    if (!WEAPONS[key]) return;
    if (!this.game.economy.buy(key)) { this.game.hud.toastMessage("Dinero insuficiente"); this.game.audio.event("empty"); return; }
    this.switchTo(key);
  }
  triggerDown() { this.triggerHeld = true; this.tryShoot(); }
  triggerUp() { this.triggerHeld = false; }
  reload() {
    const clip = this.inventory[this.currentKey];
    if (this.isReloading || clip.ammo === this.current.magazineSize || clip.reserve <= 0) return;
    this.isReloading = true; this.reloadTimer = this.current.reloadTime; this.game.hud.toastMessage("Recargando", this.current.reloadTime * 1000); this.game.audio.event("reload");
  }
  tryShoot() {
    if (![RoundState.PLAYING, RoundState.BOMB_PLANTED].includes(this.game.round.state)) return;
    const now = performance.now() / 1000;
    if (this.isReloading || now - this.lastShot < this.current.fireDelay) return;
    const clip = this.inventory[this.currentKey];
    if (clip.ammo <= 0) { this.game.audio.event("empty"); this.game.hud.toastMessage("Sin municion", 500); return; }
    clip.ammo--; this.lastShot = now; this.recoilHeat += this.current.recoilHeat; this.visualRecoil = Math.min(1, this.visualRecoil + this.current.recoilKick * 10);
    if (this.flash) this.flash.material.opacity = 0.95;
    this.game.audio.gun(this.current);
    this.game.fireWeapon(this.game.player, this.current, this.getSpread());
  }
  getSpread() {
    const p = this.game.player;
    let spread = this.current.baseSpread + this.recoilHeat;
    if (!p.onGround) spread += this.current.jumpSpread;
    else if (p.speed > 4.3) spread += this.current.runSpread;
    else if (p.speed > 0.45) spread += this.current.movingSpread;
    if (p.crouching) spread *= 0.55;
    return spread;
  }
  getCrosshairSpread() { return 7 + this.getSpread() * 185; }
  update(dt) {
    const clip = this.inventory[this.currentKey];
    if (this.triggerHeld && this.current.automatic) this.tryShoot();
    this.recoilHeat = Math.max(0, this.recoilHeat - this.current.recoilRecovery * dt * 0.02);
    this.visualRecoil = Math.max(0, this.visualRecoil - dt * 6);
    if (this.flash) this.flash.material.opacity = Math.max(0, this.flash.material.opacity - dt * 18);
    if (this.isReloading) {
      this.reloadTimer -= dt;
      if (this.reloadTimer <= 0) {
        const need = this.current.magazineSize - clip.ammo;
        const loaded = Math.min(need, clip.reserve);
        clip.ammo += loaded; clip.reserve -= loaded; this.isReloading = false;
      }
    }
    const root = this.model.children[0];
    if (root) {
      const t = performance.now() * 0.001;
      const bob = Math.sin(t * 8) * 0.015 * clamp(this.game.player.speed / 4, 0, 1);
      root.position.x = 0.34 + Math.sin(t * 3) * 0.012;
      root.position.y = -0.28 + bob - this.visualRecoil * 0.035 - (this.isReloading ? 0.08 : 0);
      root.position.z = -0.64 + this.visualRecoil * 0.08;
      root.rotation.x = -this.visualRecoil * 0.09;
      root.rotation.z = this.isReloading ? Math.sin(t * 12) * 0.12 : Math.sin(t * 2) * 0.012;
    }
  }
  get ammo() { return this.inventory[this.currentKey].ammo; }
  get reserve() { return this.inventory[this.currentKey].reserve; }
}

class Player {
  constructor(game) {
    this.game = game;
    this.id = "player";
    this.name = "Usuario";
    this.team = TEAM.ATTACKERS;
    this.playerObject = new THREE.Object3D();
    this.yawObject = new THREE.Object3D();
    this.pitchObject = new THREE.Object3D();
    this.pitchObject.add(game.camera);
    this.yawObject.add(this.pitchObject);
    this.playerObject.add(this.yawObject);
    game.scene.add(this.playerObject);
    this.position = this.playerObject.position;
    this.velocity = new THREE.Vector3();
    this.health = 100; this.armor = 50; this.height = 1.65; this.radius = 0.42; this.onGround = true; this.crouching = false; this.speed = 0; this.kills = 0; this.alive = true;
  }
  reset(pos) {
    this.position.copy(pos); this.velocity.set(0, 0, 0); this.health = 100; this.armor = this.game.economy.armor; this.alive = true; this.playerObject.rotation.set(0, 0, 0); this.yawObject.rotation.set(0, 0, 0); this.pitchObject.rotation.set(0, 0, 0); this.onGround = true;
  }
  look(dx, dy) {
    this.yawObject.rotation.y -= dx * 0.002;
    this.pitchObject.rotation.x = clamp(this.pitchObject.rotation.x - dy * 0.002, -Math.PI / 2, Math.PI / 2);
  }
  update(dt, input, collision) {
    if (!this.alive) return;
    this.crouching = input.crouch;
    const targetHeight = this.crouching ? 1.18 : this.height;
    const forward = new THREE.Vector3();
    this.game.camera.getWorldDirection(forward); forward.y = 0; if (forward.lengthSq() > 0) forward.normalize();
    const right = new THREE.Vector3(); right.crossVectors(forward, this.game.camera.up).normalize();
    const wish = new THREE.Vector3();
    wish.addScaledVector(forward, input.forward); wish.addScaledVector(right, input.right); if (wish.lengthSq() > 0) wish.normalize();
    const maxSpeed = this.crouching ? 2.5 : input.slow ? 3.2 : 5.7;
    const accel = this.onGround ? 14 : 4.5;
    this.velocity.x += (wish.x * maxSpeed - this.velocity.x) * clamp(accel * dt, 0, 1);
    this.velocity.z += (wish.z * maxSpeed - this.velocity.z) * clamp(accel * dt, 0, 1);
    this.velocity.y -= 24 * dt;
    if (input.jump && this.onGround && !this.crouching) { this.velocity.y = 7.4; this.onGround = false; }
    this.moveAxis("x", this.velocity.x * dt, collision);
    this.moveAxis("z", this.velocity.z * dt, collision);
    this.position.y += this.velocity.y * dt;
    if (this.position.y <= targetHeight) { this.position.y = targetHeight; this.velocity.y = 0; this.onGround = true; }
    this.speed = Math.hypot(this.velocity.x, this.velocity.z);
  }
  moveAxis(axis, delta, collision) {
    this.position[axis] += delta;
    if (collision.collides(this.position, this.radius)) { this.position[axis] -= delta; this.velocity[axis] = 0; }
  }
  damage(amount) {
    if (!this.alive) return false;
    const absorbed = Math.min(this.armor, amount * 0.45);
    this.armor -= absorbed;
    this.health = Math.max(0, this.health - (amount - absorbed));
    if (this.health <= 0) { this.alive = false; this.game.bomb.onCarrierKilled(this); return true; }
    return false;
  }
}

class Bot {
  constructor(game, opts) {
    this.game = game;
    this.id = opts.id;
    this.name = opts.name;
    this.team = opts.team;
    this.position = opts.position.clone();
    this.targetSite = opts.targetSite || "A";
    this.health = 100; this.armor = 35; this.alive = true; this.kills = 0; this.radius = 0.42; this.state = opts.state || BotState.SPAWN; this.weapon = opts.weapon || WEAPONS.rifle; this.lastShot = -99; this.shootCooldown = rand(0.4, 1.2); this.reactTimer = rand(0.5, 1.0); this.walkTime = rand(0, 10); this.flashTimer = 0; this.detectedTimer = 0; this.planting = 0; this.defusing = 0;
    this.group = new THREE.Group(); this.group.position.copy(this.position); game.scene.add(this.group);
    this.modelRoot = null; this.hitBoxes = []; this.muzzleFlash = null; this.healthBar = null;
    this.createModel();
  }
  createModel() {
    const url = this.team === TEAM.ATTACKERS ? ASSET_PATHS.characters.ally : ASSET_PATHS.characters.enemy;
    this.game.assets.loadModel(url, () => createSoldierFallback(this.team), (model) => {
      this.modelRoot = model; this.modelRoot.scale.setScalar(1); this.group.add(this.modelRoot); this.registerHitBoxes();
      this.healthBar = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.045), new THREE.MeshBasicMaterial({ color: this.team === TEAM.ATTACKERS ? 0x67b7ff : 0xff5248 }));
      this.healthBar.position.y = 1.95; this.group.add(this.healthBar);
    });
  }
  registerHitBoxes() {
    this.hitBoxes = [];
    this.modelRoot.traverse((node) => {
      if (!node.isMesh || node.name === "botMuzzleFlash") return;
      node.castShadow = true; node.receiveShadow = true; node.userData.bot = this;
      if (!node.userData.zone) node.userData.zone = node.position.y > 1.35 ? "head" : node.position.y < 0.7 ? "legs" : "torso";
      this.hitBoxes.push(node);
    });
    this.muzzleFlash = this.modelRoot.getObjectByName("botMuzzleFlash");
  }
  reset(pos) {
    this.position.copy(pos); this.group.position.copy(pos); this.health = 100; this.armor = 35; this.alive = true; this.state = this.team === TEAM.ATTACKERS ? BotState.FOLLOW_PLAYER : BotState.HOLD_POSITION; this.planting = 0; this.defusing = 0;
  }
  update(dt) {
    if (!this.alive) return;
    this.walkTime += dt * 6;
    this.flashTimer = Math.max(0, this.flashTimer - dt);
    if (this.muzzleFlash) this.muzzleFlash.material.opacity = this.flashTimer > 0 ? rand(0.45, 0.9) : 0;
    if (this.modelRoot) {
      const gait = [BotState.FOLLOW_PLAYER, BotState.MOVE_TO_SITE, BotState.ROTATE_TO_BOMB, BotState.TAKE_COVER].includes(this.state) ? Math.sin(this.walkTime) * 0.035 : 0;
      this.modelRoot.position.y = Math.abs(gait);
      const la = this.modelRoot.getObjectByName("leftArm"), ra = this.modelRoot.getObjectByName("rightArm"), legs = this.modelRoot.getObjectByName("legs");
      if (la) la.rotation.x = gait * 3; if (ra) ra.rotation.x = -gait * 3; if (legs) legs.rotation.x = gait;
    }
    const enemy = this.findTarget();
    if (enemy) {
      this.detectedTimer = 3;
      this.state = BotState.ENGAGE_ENEMY;
      this.lookAt(enemy.position);
      const dist = this.position.distanceTo(enemy.position);
      if (dist > 9) this.moveToward(enemy.position, 2.2, dt);
      if (dist < 4) this.moveToward(enemy.position, -1.4, dt);
      this.tryShoot(enemy, dt);
    } else if (this.team === TEAM.ATTACKERS) this.updateAttacker(dt);
    else this.updateDefender(dt);
    this.detectedTimer = Math.max(0, this.detectedTimer - dt);
    this.group.position.copy(this.position);
    if (this.healthBar) { this.healthBar.lookAt(this.game.getCameraWorldPosition()); this.healthBar.scale.x = clamp(this.health / 100, 0, 1); }
  }
  updateAttacker(dt) {
    if (this.game.bomb.carrier === this && this.game.bomb.canPlantAt(this.position)) {
      this.state = BotState.PLANT_BOMB;
      this.game.bomb.plantBy(this, dt);
      return;
    }
    const site = this.game.map.current.bombSites[this.targetSite];
    const follow = this.game.player.alive ? this.game.player.position : site;
    const target = this.game.bomb.carrier === this ? site : this.position.distanceTo(follow) > 6 ? follow : site;
    this.state = this.game.bomb.carrier === this ? BotState.MOVE_TO_SITE : BotState.FOLLOW_PLAYER;
    this.moveToward(target, 2.45, dt);
  }
  updateDefender(dt) {
    if (this.game.bomb.state === BombState.PLANTED) {
      this.state = BotState.ROTATE_TO_BOMB;
      if (this.game.bomb.distanceXZ(this.position, this.game.bomb.position) < 1.8) {
        this.state = BotState.DEFUSE_BOMB;
        this.game.bomb.defuseBy(this, dt);
      } else this.moveToward(this.game.bomb.position, 2.55, dt);
      return;
    }
    const site = this.game.map.current.bombSites[this.targetSite];
    this.state = this.position.distanceTo(site) > 2.8 ? BotState.PATROL : BotState.HOLD_POSITION;
    if (this.state === BotState.PATROL) this.moveToward(site, 1.9, dt);
  }
  findTarget() {
    const candidates = this.team === TEAM.ATTACKERS ? this.game.teams.defenders.members : this.game.teams.attackers.members;
    let best = null, bestDist = 17;
    for (const e of candidates) {
      if (!e.alive) continue;
      const d = this.position.distanceTo(e.position);
      if (d < bestDist && this.game.hasLineOfSight(this.position.clone().setY(1.3), e.position.clone().setY(1.3))) { best = e; bestDist = d; }
    }
    return best;
  }
  tryShoot(target, dt) {
    this.shootCooldown -= dt;
    if (this.shootCooldown > 0) return;
    this.shootCooldown = rand(0.18, 0.35);
    if (Math.random() < 0.35) this.shootCooldown += rand(0.8, 1.5);
    this.flashTimer = 0.07;
    this.game.audio.gun(this.weapon);
    const origin = this.position.clone().setY(1.25);
    const aim = target.position.clone().setY(1.25);
    const err = this.team === TEAM.ATTACKERS ? 0.75 : 0.95;
    aim.x += rand(-err, err); aim.y += rand(-0.35, 0.55); aim.z += rand(-err, err);
    const dir = aim.sub(origin).normalize();
    this.game.fireRay(this, this.weapon, origin, dir, this.weapon.baseSpread + 0.025);
  }
  moveToward(target, speed, dt) {
    const dir = new THREE.Vector3(target.x - this.position.x, 0, target.z - this.position.z);
    if (dir.lengthSq() < 0.01) return;
    dir.normalize();
    const next = this.position.clone().addScaledVector(dir, speed * dt);
    if (!this.game.collision.collides(next, this.radius)) this.position.copy(next);
    else {
      next.copy(this.position).add(new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(speed * dt * (Math.random() < 0.5 ? 1 : -1)));
      if (!this.game.collision.collides(next, this.radius)) this.position.copy(next);
    }
    this.lookAt(target);
  }
  lookAt(target) { this.group.lookAt(target.x, this.position.y, target.z); }
  damage(amount, attacker, zone = "torso") {
    if (!this.alive) return false;
    const mult = zone === "head" ? 2.4 : zone === "legs" ? 0.7 : 1;
    const dmg = amount * mult;
    const absorbed = Math.min(this.armor, dmg * 0.25);
    this.armor -= absorbed; this.health -= (dmg - absorbed);
    this.game.spawnSpark(this.position.clone().setY(zone === "head" ? 1.55 : zone === "legs" ? 0.55 : 1.05), zone === "head" ? 0xf3b45d : 0xb6f45a);
    if (this.health <= 0) {
      this.alive = false; this.state = BotState.DEAD; this.group.rotation.z = 1.2; this.game.bomb.onCarrierKilled(this);
      if (attacker) attacker.kills++;
      return true;
    }
    return false;
  }
}

class Bomb {
  constructor(game) {
    this.game = game;
    this.state = BombState.CARRIED;
    this.carrier = null;
    this.position = new THREE.Vector3();
    this.plantedSite = null;
    this.plantProgress = 0;
    this.plantTouched = false;
    this.defuseProgress = 0;
    this.defuseTouched = false;
    this.timeToExplosion = 35;
    this.beepTimer = 0;
    this.mesh = this.createMesh();
    game.scene.add(this.mesh);
  }
  createMesh() {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x2a2d24, roughness: 0.7, metalness: 0.25 });
    const light = new THREE.MeshStandardMaterial({ color: 0xf3b45d, emissive: 0xf3b45d, emissiveIntensity: 0.35 });
    g.add(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.32), mat));
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), light); led.position.set(0.17, 0.11, 0.11); g.add(led);
    g.visible = false;
    return g;
  }
  reset(carrier) {
    this.state = BombState.CARRIED; this.carrier = carrier; this.plantedSite = null; this.plantProgress = 0; this.plantTouched = false; this.defuseProgress = 0; this.defuseTouched = false; this.timeToExplosion = 35; this.mesh.visible = false;
  }
  distanceXZ(a, b) {
    return Math.hypot(a.x - b.x, a.z - b.z);
  }
  update(dt) {
    if (this.carrier && this.state === BombState.CARRIED) this.position.copy(this.carrier.position);
    if (this.state === BombState.DROPPED || this.state === BombState.PLANTED) { this.mesh.visible = true; this.mesh.position.copy(this.position).setY(0.16); this.mesh.rotation.y += dt; }
    else this.mesh.visible = false;
    if (this.state === BombState.PLANTED) {
      this.timeToExplosion -= dt;
      this.beepTimer -= dt;
      const interval = clamp(this.timeToExplosion / 35, 0.12, 0.8);
      if (this.beepTimer <= 0) { this.beepTimer = interval; this.game.audio.tone(880, 0.035, "square", 0.035); }
      if (this.timeToExplosion <= 0) this.explode();
    }
  }
  canPlantAt(pos) {
    if (![BombState.CARRIED, BombState.PLANTING].includes(this.state)) return false;
    return Object.values(this.game.map.current.bombSites).some((site) => this.distanceXZ(pos, site) < 2.2);
  }
  siteAt(pos) {
    let best = null, dist = 999;
    for (const [name, site] of Object.entries(this.game.map.current.bombSites)) {
      const d = this.distanceXZ(pos, site);
      if (d < dist) { dist = d; best = name; }
    }
    return dist < 2.2 ? best : null;
  }
  plantBy(actor, dt) {
    if (this.carrier !== actor || !this.canPlantAt(actor.position)) { this.plantProgress = 0; return; }
    this.plantTouched = true;
    this.state = BombState.PLANTING;
    this.plantProgress += dt;
    if (this.plantProgress >= 3) {
      this.state = BombState.PLANTED; this.carrier = null; this.position.copy(actor.position); this.plantedSite = this.siteAt(actor.position); this.timeToExplosion = 35; this.plantProgress = 0; this.game.round.onBombPlanted(); this.game.audio.event("plant");
    }
  }
  defuseBy(actor, dt) {
    if (![BombState.PLANTED, BombState.DEFUSING].includes(this.state) || actor.team !== TEAM.DEFENDERS || this.distanceXZ(actor.position, this.position) > 1.8) { return; }
    this.defuseTouched = true;
    this.state = BombState.DEFUSING;
    this.defuseProgress += dt;
    if (this.defuseProgress >= 5) {
      this.state = BombState.DEFUSED; this.game.audio.event("defuse"); this.game.round.finish(TEAM.DEFENDERS, "Bomba desactivada.");
    }
  }
  beginActionFrame() {
    this.plantTouched = false;
    this.defuseTouched = false;
  }
  endActionFrame(dt) {
    if (this.state === BombState.PLANTING && !this.plantTouched) {
      this.state = BombState.CARRIED;
      this.plantProgress = Math.max(0, this.plantProgress - dt * 2);
    }
    if (this.state === BombState.DEFUSING) this.state = BombState.PLANTED;
    if (!this.defuseTouched && this.state === BombState.PLANTED) {
      this.defuseProgress = Math.max(0, this.defuseProgress - dt * 1.6);
    }
  }
  interactPlayer(dt) {
    const p = this.game.player;
    if (!p.alive) return;
    if (this.state === BombState.DROPPED && this.distanceXZ(p.position, this.position) < 1.6) { this.carrier = p; this.state = BombState.CARRIED; this.game.hud.toastMessage("Carga recogida"); return; }
    if (this.carrier === p && this.canPlantAt(p.position)) this.plantBy(p, dt);
  }
  onCarrierKilled(actor) {
    if (this.carrier !== actor) return;
    this.state = BombState.DROPPED; this.position.copy(actor.position).setY(0.1); this.carrier = null; this.game.hud.toastMessage("La carga cayo al suelo");
  }
  explode() {
    this.state = BombState.EXPLODED; this.game.audio.event("explosion"); this.game.spawnExplosion(this.position); this.game.round.finish(TEAM.ATTACKERS, "La carga exploto.");
  }
}

class MapManager {
  constructor(game) { this.game = game; this.index = -1; this.current = MAPS[0]; this.mapRoot = new THREE.Group(); game.scene.add(this.mapRoot); this.coverPoints = []; }
  nextMap() {
    this.index = (this.index + 1) % MAPS.length;
    this.current = MAPS[this.index];
    this.build();
  }
  build() {
    this.mapRoot.clear(); this.coverPoints = []; this.game.collision.clear();
    this.game.scene.background = new THREE.Color(this.current.theme === "desert" ? 0xc7ad7f : 0x101512);
    this.game.scene.fog = new THREE.Fog(this.current.theme === "desert" ? 0xc7ad7f : 0x101512, 22, 62);
    this.buildProcedural();
    this.game.assets.loadModel(this.current.modelUrl, () => new THREE.Group(), (model) => {
      if (model.children.length === 0) return;
      model.name = "ExternalMap";
      model.position.set(0, 0, 0);
      this.mapRoot.add(model);
      console.warn("External map loaded. Manual colliders from JS are still used for gameplay.");
    });
  }
  mat(kind) {
    const base = this.current.theme === "desert" ? "#8f7854" : kind === "metal" ? "#53646a" : "#3f463e";
    const tex = kind === "metal" ? ribbedTexture(base) : concreteTexture(base);
    tex.repeat.set(kind === "floor" ? 10 : 2, kind === "floor" ? 10 : 1);
    return new THREE.MeshStandardMaterial({ map: tex, roughness: kind === "metal" ? 0.62 : 0.9, metalness: kind === "metal" ? 0.32 : 0.02 });
  }
  buildProcedural() {
    const floorMat = this.mat("floor"), wallMat = this.mat("wall"), metalMat = this.mat("metal");
    this.box(0, -0.13, 0, 52, 0.25, 52, floorMat, false);
    this.box(0, 1.9, -26, 52, 3.8, 0.8, wallMat); this.box(0, 1.9, 26, 52, 3.8, 0.8, wallMat); this.box(-26, 1.9, 0, 0.8, 3.8, 52, wallMat); this.box(26, 1.9, 0, 0.8, 3.8, 52, wallMat);
    const theme = this.current.theme;
    const blocks = theme === "containers"
      ? [[-15,1.25,-8,3,2.5,10],[14,1.25,-10,3,2.5,9],[-9,1.25,8,9,2.5,3],[10,1.25,10,10,2.5,3],[0,1,0,7,2,2],[-19,1,7,2,2,8],[19,1,-2,2,2,8]]
      : theme === "desert"
        ? [[-10,1,-10,8,2,1.5],[8,1,-8,2,2,8],[-13,1,3,3,2,8],[3,1,6,9,2,2],[14,1,11,5,2,4],[-3,1,15,6,2,2]]
        : [[-8,1,-12,7,2,1.2],[6,1,-12,8,2,1.2],[-14,1,-4,1.4,2,8],[14,1,4,1.4,2,8],[-4,0.9,-5,4.2,1.8,3],[5,0.9,-4,3.2,1.8,3.2],[0,0.8,3,7.5,1.6,1.5],[-9,0.9,7,3.1,1.8,5.2],[9,0.9,9,4.2,1.8,2.6]];
    blocks.forEach((b, i) => { this.box(...b, i % 2 ? metalMat : wallMat); this.coverPoints.push(new THREE.Vector3(b[0], 0, b[2])); });
    for (const [name, pos] of Object.entries(this.current.bombSites)) {
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 0.04, 32), new THREE.MeshBasicMaterial({ color: name === "A" ? 0xf3b45d : 0x7dd9d2, transparent: true, opacity: 0.28 }));
      ring.position.copy(pos).setY(0.035); this.mapRoot.add(ring);
      const label = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.08, 0.75), new THREE.MeshBasicMaterial({ color: name === "A" ? 0xf3b45d : 0x7dd9d2 }));
      label.position.copy(pos).setY(0.1); this.mapRoot.add(label);
    }
    for (const [x,z,c] of [[-14,-18,0xb6f45a],[14,-18,0xf3b45d],[0,12,0x7dd9d2]]) {
      const l = new THREE.PointLight(c, 1.35, 11, 2); l.position.set(x,3.2,z); this.mapRoot.add(l);
    }
  }
  box(x,y,z,w,h,d,mat,collide=true) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat); m.position.set(x,y,z); m.castShadow = true; m.receiveShadow = true; this.mapRoot.add(m); if (collide) this.game.collision.addBox(x,y,z,w,h,d); return m;
  }
}

class RoundManager {
  constructor(game) { this.game = game; this.state = RoundState.MENU; this.round = 0; this.attackWins = 0; this.defenseWins = 0; this.timer = 0; this.buyTime = 10; this.roundTime = 120; this.endLock = false; }
  startFirstRound() { if (this.state === RoundState.MENU) this.nextRound(); }
  nextRound() {
    this.round++; this.endLock = false; this.state = RoundState.BUY_PHASE; this.timer = this.buyTime; this.game.setupRound(); this.game.hud.hideRoundScreen(); this.game.hud.setBuyVisible(true); this.game.hud.toastMessage("Compra armas"); this.game.audio.event("round");
  }
  update(dt) {
    if (![RoundState.BUY_PHASE, RoundState.PLAYING, RoundState.BOMB_PLANTED].includes(this.state)) return;
    this.timer -= dt;
    if (this.state === RoundState.BUY_PHASE && this.timer <= 0) { this.state = RoundState.PLAYING; this.timer = this.roundTime; this.game.hud.setBuyVisible(false); this.game.hud.toastMessage("Ronda activa"); }
    if (this.state === RoundState.PLAYING && this.timer <= 0 && this.game.bomb.state !== BombState.PLANTED) this.finish(TEAM.DEFENDERS, "Tiempo agotado. La carga no fue plantada.");
    this.checkEliminations();
  }
  onBombPlanted() { this.state = RoundState.BOMB_PLANTED; this.timer = this.game.bomb.timeToExplosion; this.game.economy.award("plant", 800); this.game.hud.toastMessage(`Bomba plantada en ${this.game.bomb.plantedSite}`, 1300); }
  checkEliminations() {
    if (this.endLock || [RoundState.MENU, RoundState.BUY_PHASE].includes(this.state)) return;
    const atk = this.game.alive(TEAM.ATTACKERS), def = this.game.alive(TEAM.DEFENDERS);
    if (def === 0) this.finish(TEAM.ATTACKERS, "Defensores eliminados.");
    else if (atk === 0) this.finish(TEAM.DEFENDERS, "Atacantes eliminados.");
  }
  finish(winner, reason) {
    if (this.endLock) return;
    this.endLock = true; this.state = winner === TEAM.ATTACKERS ? RoundState.ROUND_WIN_ATTACKERS : RoundState.ROUND_WIN_DEFENDERS;
    if (winner === TEAM.ATTACKERS) { this.attackWins++; this.game.economy.award("win", 3000); this.game.audio.event("win"); }
    else { this.defenseWins++; this.game.economy.award("loss", 1900); this.game.audio.event("lose"); }
    this.game.hud.setBuyVisible(false); this.game.hud.showRoundScreen(winner, reason); document.exitPointerLock?.();
  }
}

class Minimap {
  constructor(game) { this.game = game; this.canvas = document.querySelector("#minimap"); this.ctx = this.canvas.getContext("2d"); this.size = 180; }
  worldToMap(pos) {
    const b = this.game.map.current.bounds;
    return { x: ((pos.x - b.minX) / (b.maxX - b.minX)) * this.size, y: ((pos.z - b.minZ) / (b.maxZ - b.minZ)) * this.size };
  }
  drawDot(pos, color, r = 4) { const p = this.worldToMap(pos); this.ctx.fillStyle = color; this.ctx.beginPath(); this.ctx.arc(p.x, p.y, r, 0, Math.PI * 2); this.ctx.fill(); }
  update() {
    const ctx = this.ctx, s = this.size; ctx.clearRect(0,0,s,s); ctx.fillStyle = "rgba(8,12,11,0.78)"; ctx.fillRect(0,0,s,s); ctx.strokeStyle = "rgba(125,217,210,0.35)"; ctx.strokeRect(1,1,s-2,s-2);
    for (const [name, site] of Object.entries(this.game.map.current.bombSites)) { const p = this.worldToMap(site); ctx.fillStyle = name === "A" ? "#f3b45d" : "#7dd9d2"; ctx.font = "bold 18px Trebuchet MS"; ctx.fillText(name, p.x - 6, p.y + 6); }
    this.game.teams.attackers.members.forEach((m) => { if (m.alive && m !== this.game.player) this.drawDot(m.position, "#67b7ff", 3.5); });
    this.game.teams.defenders.members.forEach((m) => { if (m.alive && (m.detectedTimer > 0 || this.game.bomb.state === BombState.PLANTED)) this.drawDot(m.position, "#ff5248", 3.5); });
    if ([BombState.DROPPED, BombState.PLANTED].includes(this.game.bomb.state)) this.drawDot(this.game.bomb.position, "#f3b45d", 5);
    const p = this.worldToMap(this.game.player.position); ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(-this.game.player.yawObject.rotation.y); ctx.fillStyle = "#edf3e9"; ctx.beginPath(); ctx.moveTo(0,-8); ctx.lineTo(6,6); ctx.lineTo(-6,6); ctx.closePath(); ctx.fill(); ctx.restore();
  }
}

class Game {
  constructor() {
    this.root = document.querySelector("#game-root");
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(74, innerWidth / innerHeight, 0.1, 90);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8)); this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1; this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.root.appendChild(this.renderer.domElement);
    this.assets = new AssetManager();
    Object.entries(ASSET_PATHS.sounds).forEach(([k,u]) => this.assets.loadSound(k,u));
    this.audio = new AudioManager(this.assets);
    this.hud = new HUD();
    this.input = new InputManager(this);
    this.collision = new CollisionSystem();
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.player = new Player(this);
    this.weapons = new WeaponManager(this);
    this.economy = new EconomyManager();
    this.map = new MapManager(this);
    this.round = new RoundManager(this);
    this.minimap = new Minimap(this);
    this.teams = { attackers: { name: "Atacantes", members: [] }, defenders: { name: "Defensores", members: [] } };
    this.bomb = new Bomb(this);
    this.tracers = []; this.particles = []; this.impacts = []; this.cameraShake = 0; this.interactHeld = false; this.debugVisible = false;
    this.setupLights();
    this.hud.buildShop(WEAPONS, (key) => this.weapons.buyOrSwitch(key));
    this.hud.nextRoundButton.addEventListener("click", () => this.round.nextRound());
    this.hud.startScreen.addEventListener("click", (e) => { e.stopPropagation(); this.lockPointerAndStart(); });
    addEventListener("resize", () => this.resize());
    this.animate();
  }
  setupLights() {
    this.scene.add(new THREE.HemisphereLight(0xc9d5c3, 0x252b24, 1.5));
    const sun = new THREE.DirectionalLight(0xf1ead3, 2.2); sun.position.set(-8,18,9); sun.castShadow = true; sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.left=-30; sun.shadow.camera.right=30; sun.shadow.camera.top=30; sun.shadow.camera.bottom=-30; this.scene.add(sun);
  }
  lockPointerAndStart() {
    this.audio.resume(); this.hud.hideStart(); if (this.round.state === RoundState.MENU) this.round.startFirstRound();
    const lock = this.renderer.domElement.requestPointerLock?.() || document.body.requestPointerLock?.(); if (lock?.catch) lock.catch(() => {});
  }
  setupRound() {
    this.map.nextMap();
    this.player.reset(this.map.current.attackerSpawn.clone());
    this.weapons.resetInventory();
    this.clearTeams();
    this.teams.attackers.members.push(this.player);
    for (let i = 0; i < 4; i++) this.teams.attackers.members.push(new Bot(this, { id:`a${i}`, name:`Ally ${i+1}`, team:TEAM.ATTACKERS, position:this.map.current.attackerSpawn.clone().add(new THREE.Vector3(rand(-2,2),0,rand(-2,2))), targetSite:i%2?"B":"A", weapon:WEAPONS.smg, state:BotState.FOLLOW_PLAYER }));
    for (let i = 0; i < 5; i++) this.teams.defenders.members.push(new Bot(this, { id:`d${i}`, name:`Guard ${i+1}`, team:TEAM.DEFENDERS, position:this.map.current.defenderSpawn.clone().add(new THREE.Vector3(rand(-3,3),0,rand(-3,3))), targetSite:i<3?"A":"B", weapon:WEAPONS.rifle, state:BotState.HOLD_POSITION }));
    this.bomb.reset(this.player);
  }
  clearTeams() {
    [...(this.teams.attackers?.members || []), ...(this.teams.defenders?.members || [])].forEach((m) => { if (m instanceof Bot) this.scene.remove(m.group); });
    this.teams = { attackers: { name: "Atacantes", members: [] }, defenders: { name: "Defensores", members: [] } };
  }
  toggleBuyPanel() { if (this.round.state === RoundState.BUY_PHASE) this.hud.setBuyVisible(this.hud.buyPanel.classList.contains("hidden")); }
  handleWeaponHotkey(slot) { const w = Object.values(WEAPONS).find((x) => x.slot === slot); if (!w) return; if (this.round.state === RoundState.BUY_PHASE) this.weapons.buyOrSwitch(w.key); else this.weapons.switchTo(w.key); }
  alive(team) { return this.teams[team].members.filter((m) => m.alive).length; }
  getCameraWorldPosition() { this.camera.updateMatrixWorld(true); return this.camera.getWorldPosition(new THREE.Vector3()); }
  hasLineOfSight(from, to) { const dir = to.clone().sub(from); const dist = dir.length(); dir.normalize(); return !this.collision.raycast(from, dir, dist - 0.2); }
  enemyActorsFor(shooter) {
    return [...this.teams.attackers.members, ...this.teams.defenders.members]
      .filter((member) => member.alive && member.team !== shooter.team);
  }
  shootablesFor(shooter) {
    return this.enemyActorsFor(shooter)
      .filter((member) => member instanceof Bot)
      .flatMap((bot) => bot.hitBoxes);
  }
  fireWeapon(shooter, weapon, spread) {
    this.cameraShake = Math.max(this.cameraShake, weapon.type === "sniper" ? 0.18 : 0.09);
    const origin = this.getCameraWorldPosition(); const base = new THREE.Vector3(); this.camera.getWorldDirection(base);
    for (let i = 0; i < (weapon.pellets || 1); i++) { const dir = base.clone(); dir.x += rand(-spread,spread); dir.y += rand(-spread,spread); dir.z += rand(-spread,spread); dir.normalize(); this.fireRay(shooter, weapon, origin, dir, spread); }
  }
  fireRay(shooter, weapon, origin, dir) {
    const targets = this.shootablesFor(shooter);
    this.raycaster.set(origin, dir);
    const hits = this.raycaster.intersectObjects(targets, false);
    const actorHit = this.raycastActors(shooter, origin, dir, 60);
    const wallHit = this.collision.raycast(origin, dir, 60);
    const wallDistance = wallHit ? wallHit.distanceTo(origin) : Infinity;
    let end = origin.clone().add(dir.clone().multiplyScalar(25)), head = false;
    const meshHitDistance = hits.length ? hits[0].distance : Infinity;
    if (actorHit && actorHit.distance < meshHitDistance && actorHit.distance < wallDistance) {
      end = actorHit.point;
      const killed = actorHit.actor.damage(weapon.damage, shooter, "torso");
      if (actorHit.actor === this.player) {
        this.hud.showDamage();
        this.audio.event("hurt");
        if (killed) this.round.checkEliminations();
      }
      if (shooter === this.player) {
        this.hud.showHit(false);
        this.audio.event("hit");
        if (killed) this.economy.award("kill", 300);
      }
    } else if (hits.length && hits[0].distance < 60 && hits[0].distance < wallDistance) {
      const obj = hits[0].object, bot = obj.userData.bot, zone = obj.userData.zone || "torso";
      end = hits[0].point; head = zone === "head";
      const killed = bot.damage(weapon.damage, shooter, zone);
      if (shooter === this.player) { this.hud.showHit(head); this.audio.event(head ? "headshot" : "hit"); if (killed) this.economy.award("kill", 300); }
    } else {
      if (wallHit) { end = wallHit; this.spawnImpact(wallHit); this.audio.event("wall"); }
    }
    this.spawnTracer(origin, end, shooter.team === TEAM.ATTACKERS ? 0x7dd9d2 : 0xff6e5d);
  }
  raycastActors(shooter, origin, dir, maxDist) {
    let best = null;
    for (const actor of this.enemyActorsFor(shooter)) {
      if (actor instanceof Bot) continue;
      const toActor = actor.position.clone().setY(actor.position.y - 0.2).sub(origin);
      const projection = toActor.dot(dir);
      if (projection < 0 || projection > maxDist) continue;
      const nearest = origin.clone().add(dir.clone().multiplyScalar(projection));
      const radius = actor.crouching ? 0.48 : 0.62;
      const distance = nearest.distanceTo(actor.position.clone().setY(actor.position.y - 0.15));
      if (distance <= radius && (!best || projection < best.distance)) {
        best = { actor, distance: projection, point: nearest };
      }
    }
    return best;
  }
  damagePlayer(amount) { if (this.player.damage(amount)) this.round.checkEliminations(); this.hud.showDamage(); this.audio.event("hurt"); }
  spawnTracer(start,end,color) { const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([start.clone(),end.clone()]), new THREE.LineBasicMaterial({ color, transparent:true, opacity:0.8 })); line.userData.life=0.055; this.tracers.push(line); this.scene.add(line); }
  spawnSpark(pos,color) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.06,8,6), new THREE.MeshBasicMaterial({ color, transparent:true, opacity:1 })); s.position.copy(pos); s.userData.life=0.18; s.userData.velocity=new THREE.Vector3(rand(-0.8,0.8),rand(0.45,1.2),rand(-0.8,0.8)); this.particles.push(s); this.scene.add(s); }
  spawnImpact(pos) { this.spawnSpark(pos,0xd8e0d0); const m = new THREE.Mesh(new THREE.SphereGeometry(0.035,6,4), new THREE.MeshBasicMaterial({ color:0x141815 })); m.position.copy(pos); m.userData.life=7; this.impacts.push(m); this.scene.add(m); }
  spawnExplosion(pos) { for (let i=0;i<34;i++) this.spawnSpark(pos.clone().add(new THREE.Vector3(rand(-1,1),rand(0,1.2),rand(-1,1))), i%2?0xf3b45d:0xff5248); }
  updateEffects(dt) {
    for (const l of this.tracers) { l.userData.life-=dt; l.material.opacity=Math.max(0,l.userData.life/0.055); if(l.userData.life<=0)this.scene.remove(l); } this.tracers=this.tracers.filter(l=>l.userData.life>0);
    for (const p of this.particles) { p.userData.life-=dt; p.position.addScaledVector(p.userData.velocity,dt); p.scale.multiplyScalar(1+dt*5); p.material.opacity=Math.max(0,p.userData.life/0.18); if(p.userData.life<=0)this.scene.remove(p); } this.particles=this.particles.filter(p=>p.userData.life>0);
    for (const m of this.impacts) { m.userData.life-=dt; if(m.userData.life<=0)this.scene.remove(m); } this.impacts=this.impacts.filter(m=>m.userData.life>0);
  }
  applyCameraShake(dt) { this.camera.position.set(0,0,0); if(this.cameraShake<=0)return; this.camera.position.x=rand(-this.cameraShake,this.cameraShake); this.camera.position.y=rand(-this.cameraShake,this.cameraShake)*0.5; this.cameraShake=Math.max(0,this.cameraShake-dt*0.55); }
  interact(dt) {
    if (!this.interactHeld) {
      if (this.bomb.carrier === this.player || this.bomb.state === BombState.PLANTING && this.bomb.carrier === this.player) {
        this.bomb.plantProgress = Math.max(0, this.bomb.plantProgress - dt * 2);
      }
      return;
    }
    this.bomb.interactPlayer(dt);
  }
  updateHud() {
    const clip = this.weapons.inventory[this.weapons.currentKey], bomb = this.bomb;
    let title = "Buscar y Destruir", text = "Planta la carga en A o B.", prog = bomb.plantProgress / 3;
    if (this.round.state === RoundState.MENU) {
      text = "Click para jugar. Compra, avanza con tu escuadra y planta la carga.";
      prog = 0;
    } else if (bomb.state === BombState.CARRIED) text = bomb.carrier === this.player ? "Llevas la carga. Mantén E en A o B para plantar." : `${bomb.carrier?.name || "Aliado"} lleva la carga.`;
    if (bomb.state === BombState.DROPPED) text = "Carga en el suelo. Acercate y presiona E para recogerla.";
    if (bomb.state === BombState.PLANTING) { title = "Plantando"; text = "Mantén E para completar la planta."; prog = bomb.plantProgress / 3; }
    if ([BombState.PLANTED, BombState.DEFUSING].includes(bomb.state)) { title = `Bomba plantada en ${bomb.plantedSite}`; text = `Explosion en ${Math.ceil(bomb.timeToExplosion)}s. Defiende la carga.`; prog = 1 - bomb.timeToExplosion / 35; }
    if (bomb.state === BombState.DEFUSING) { title = "Defusando"; text = "Un defensor esta desactivando."; prog = bomb.defuseProgress / 5; }
    const phaseLabels = {
      [RoundState.MENU]: "MENU",
      [RoundState.BUY_PHASE]: "COMPRA",
      [RoundState.PLAYING]: "RONDA",
      [RoundState.BOMB_PLANTED]: "BOMBA",
      [RoundState.ROUND_WIN_ATTACKERS]: "ATACANTES",
      [RoundState.ROUND_WIN_DEFENDERS]: "DEFENSORES",
      [RoundState.GAME_OVER]: "FINAL",
    };
    this.hud.update({ health:this.player.health, armor:this.player.armor, weaponName:this.weapons.current.name, weaponKey:this.weapons.currentKey, ammo:clip.ammo, reserve:clip.reserve, money:this.economy.money, ownedWeapons:[...this.economy.ownedWeapons], round:this.round.round || 1, attackersAlive:this.alive(TEAM.ATTACKERS), defendersAlive:this.alive(TEAM.DEFENDERS), phaseLabel:phaseLabels[this.round.state] || this.round.state, timer:[RoundState.MENU].includes(this.round.state)?"--":Math.max(0,Math.ceil(this.round.state===RoundState.BOMB_PLANTED?bomb.timeToExplosion:this.round.timer)), objectiveTitle:title, objectiveText:text, objectiveProgress:prog, crosshairSpread:this.weapons.getCrosshairSpread() });
    this.hud.updateScoreboard(this, this.input.scoreboard);
    this.hud.updateDebug([`map ${this.map.current.name}`,`pos ${this.player.position.x.toFixed(2)}, ${this.player.position.y.toFixed(2)}, ${this.player.position.z.toFixed(2)}`,`yaw ${this.player.yawObject.rotation.y.toFixed(3)} pitch ${this.player.pitchObject.rotation.x.toFixed(3)}`,`pointer ${this.input.isPointerLocked}`,`speed ${this.player.speed.toFixed(2)}`,`state ${this.round.state}`,`bomb ${this.bomb.state}`,`colliders ${this.collision.colliders.length}`].join("\n"), this.debugVisible);
  }
  animate() {
    requestAnimationFrame(()=>this.animate());
    const dt = Math.min(this.clock.getDelta(),0.04);
    this.round.update(dt);
    if ([RoundState.BUY_PHASE,RoundState.PLAYING,RoundState.BOMB_PLANTED].includes(this.round.state)) {
      this.bomb.beginActionFrame();
      this.player.update(dt,this.input.movement,this.collision); this.audio.footsteps(dt,this.player.speed,this.player.crouching); this.weapons.update(dt); this.interact(dt);
      [...this.teams.attackers.members,...this.teams.defenders.members].forEach((m)=>{ if(m instanceof Bot)m.update(dt); });
      this.bomb.endActionFrame(dt);
    }
    this.bomb.update(dt); this.updateEffects(dt); this.applyCameraShake(dt); this.updateHud(); this.minimap.update(); this.renderer.render(this.scene,this.camera);
  }
  resize() { this.camera.aspect=innerWidth/innerHeight; this.camera.updateProjectionMatrix(); this.renderer.setSize(innerWidth,innerHeight); }
}

new Game();
