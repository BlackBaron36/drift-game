(() => {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');

  const scoreEl = document.getElementById('score');
  const bestScoreEl = document.getElementById('best-score');
  const startScreen = document.getElementById('start-screen');
  const shipScreen = document.getElementById('ship-screen');
  const mapScreen = document.getElementById('map-screen');
  const mapContainer = document.getElementById('map-container');
  const mapLegend = document.getElementById('map-legend');
  const abandonBtn = document.getElementById('abandon-btn');
  const gameOverScreen = document.getElementById('gameover-screen');
  const completeScreen = document.getElementById('complete-screen');
  const selectShipBtn = document.getElementById('select-ship-btn');
  const playBtn = document.getElementById('play-btn');
  const shipBackBtn = document.getElementById('ship-back-btn');
  const restartBtn = document.getElementById('restart-btn');
  const goShipBtn = document.getElementById('go-ship-btn');
  const completeRestartBtn = document.getElementById('complete-restart-btn');
  const completeShipBtn = document.getElementById('complete-ship-btn');
  const finalScoreEl = document.getElementById('final-score');
  const goBestEl = document.getElementById('go-best');
  const newRecordEl = document.getElementById('new-record');
  const completeScoreEl = document.getElementById('complete-score');
  const completeBonusEl = document.getElementById('complete-bonus');
  const completeBestEl = document.getElementById('complete-best');
  const completeEarnedEl = document.getElementById('complete-earned');
  const completeBankTotalEl = document.getElementById('complete-bank-total');
  const sectorHudEl = document.getElementById('sector-hud');
  const shipSelectEl = document.getElementById('ship-select');
  const shipDescriptionEl = document.getElementById('ship-description');
  const weaponSectionEl = document.getElementById('weapon-section');
  const weaponSelectEl = document.getElementById('weapon-select');
  const shieldSectionEl = document.getElementById('shield-section');
  const shieldOwnedCountEl = document.getElementById('shield-owned-count');
  const buyShieldBtn = document.getElementById('buy-shield-btn');
  const shieldHudEl = document.getElementById('shield-hud');
  const bankAmountEl = document.getElementById('bank-amount');
  const scrapAmountEl = document.getElementById('scrap-amount');
  const goEarnedEl = document.getElementById('go-earned');
  const goBankTotalEl = document.getElementById('go-bank-total');
  const goScrapLineEl = document.getElementById('go-scrap-line');
  const goScrapEarnedEl = document.getElementById('go-scrap-earned');
  const completeScrapLineEl = document.getElementById('complete-scrap-line');
  const completeScrapEarnedEl = document.getElementById('complete-scrap-earned');
  const researchScreen = document.getElementById('research-screen');
  const researchListEl = document.getElementById('research-list');
  const researchLabBtn = document.getElementById('research-lab-btn');
  const researchBackBtn = document.getElementById('research-back-btn');
  const researchBankAmountEl = document.getElementById('research-bank-amount');
  const researchScrapAmountEl = document.getElementById('research-scrap-amount');
  const fuelHudEl = document.getElementById('fuel-hud');
  const mapFuelAmountEl = document.getElementById('map-fuel-amount');
  const mapFuelMaxEl = document.getElementById('map-fuel-max');
  const mapFuelWarningEl = document.getElementById('map-fuel-warning');
  const hullHudEl = document.getElementById('hull-hud');
  const depotHullCurrentEl = document.getElementById('depot-hull-current');
  const depotHullMaxEl = document.getElementById('depot-hull-max');
  const depotRepairBtn = document.getElementById('depot-repair-btn');
  const depotScreen = document.getElementById('depot-screen');
  const depotCreditsAmountEl = document.getElementById('depot-credits-amount');
  const depotScrapAmountEl = document.getElementById('depot-scrap-amount');
  const depotFuelCountEl = document.getElementById('depot-fuel-count');
  const depotFuelCapEl = document.getElementById('depot-fuel-cap');
  const depotBuyFuelBtn = document.getElementById('depot-buy-fuel-btn');
  const depotWeaponListEl = document.getElementById('depot-weapon-list');
  const depotContinueBtn = document.getElementById('depot-continue-btn');
  const achievementsBtn = document.getElementById('achievements-btn');
  const achievementsScreen = document.getElementById('achievements-screen');
  const achievementsListEl = document.getElementById('achievements-list');
  const achievementsBackBtn = document.getElementById('achievements-back-btn');
  const achievementToastEl = document.getElementById('achievement-toast');
  const achievementToastNameEl = document.getElementById('achievement-toast-name');

  const COLORS = {
    bg: '#05070d',
    ship: '#6ee7ff',
    hazard: '#ff6b6b',
    accent: '#ffd166',
    panel: '#10131c',
    text: '#e8ecf5',
  };

  // Difficulty ramps across the length of the current sector (1-3 min,
  // randomized per node) rather than a fixed duration, and is scaled by
  // that node's depth-based difficultyMultiplier.
  let sectorDuration = 90;
  let sectorDifficultyMultiplier = 1;
  let sectorSpawnMultiplier = 1; // per-type: how much more often hazards spawn
  let sectorSpeedMultiplier = 1; // per-type: extra fall-speed on top of depth difficulty
  let sectorSizeMultiplier = 1; // per-type: bigger hazards (Debris Field)
  let sectorHasEnemies = false; // Hostile sectors (and ambushes) only
  let sectorHasBoss = false; // Hostile sectors only — gate waits behind the boss fight
  let sectorStartWallClock = 0;
  let currentSectorLabel = '';
  let currentSectorWarning = ''; // e.g. "SHIELDS OFFLINE" for a Radiation sector

  const FALL_SPEED_START = 120;
  const FALL_SPEED_END = 400;

  const SPAWN_INTERVAL_START = 900; // ms
  const SPAWN_INTERVAL_END = 250; // ms

  const PLAYER_CROSS_TIME = 0.9; // seconds to cross full screen width
  const PLAYER_VERTICAL_ZONE = 1 / 3; // ship can move within the bottom third of the screen
  const PLAYER_BOTTOM_MARGIN = 40; // px kept clear below the ship's lowest position

  const HITBOX_SHRINK = 0.85; // 15% smaller than visible sprite
  const NEAR_MISS_MARGIN = 18; // px
  const NEAR_MISS_BONUS = 5; // points per near miss

  const DEATH_ANIM_DURATION = 0.45; // seconds of shake/particles before overlay
  const MILESTONES = [10, 30, 60, 120]; // seconds of survival

  // Flow state: chaining near-misses briefly slows hazards and boosts scoring.
  const COMBO_WINDOW = 1.4; // seconds allowed between near-misses to keep the combo alive
  const COMBO_TO_FLOW = 3; // near-misses needed to trigger flow
  const FLOW_DURATION = 1.6;
  const FLOW_TIME_SCALE = 0.9; // hazards/spawns move at 90% speed during flow
  const FLOW_SCORE_MULT = 1.5;

  // Center-lane risk bonus: rewards holding the riskier middle of the screen
  // instead of camping the lower-density edges.
  const CENTER_ZONE_RATIO = 0.28; // fraction of width considered "center"
  const CENTER_BONUS_RATE = 3; // points/sec while in the center zone

  // ---------- Ships ----------
  // weaponSlots/shieldSlots/cargoSlots gate what gear a ship can carry.
  // shieldSlots also caps how many owned shields it brings into a run.
  // cargoSlots powers a Scrap magnet field (see CARGO_MAGNET_RADIUS_PER_SLOT) —
  // pickups within radius get pulled in instead of needing a direct flythrough.
  // hull is a per-expedition hit-point reserve behind shields (see
  // expeditionHull) — it only heals via Depot repair, never on its own.
  const SHIPS = [
    {
      id: 'starter', name: 'SCOUT', price: 0, src: 'assets/ship-starter.webp', glow: '#6ee7ff',
      weaponSlots: 0, shieldSlots: 0, cargoSlots: 0, hull: 1,
      description: 'No weapons, no shields, nowhere to stash cargo — just you, your reflexes, and the void. The ship every pilot starts on.',
    },
    {
      id: 'pro', name: 'INTERCEPTOR', price: 150, src: 'assets/ship-pro.webp', glow: '#ff6b6b',
      weaponSlots: 1, shieldSlots: 0, cargoSlots: 0, hull: 1,
      description: 'Strips out armor for a single hardpoint and raw thrust. Clears a path through the small stuff, but one mistake is still fatal.',
    },
  ];

  // Research Lab content: never directly bought with Credits — Scrap to
  // research the blueprint, then Scrap+Credits to build it. See
  // DriftStore.researchItem/buildResearchedItem.
  const RESEARCH_SHIPS = [
    {
      id: 'elite', name: 'FIGHTER', src: 'assets/ship-elite.webp', glow: '#ffd166',
      weaponSlots: 1, shieldSlots: 1, cargoSlots: 0, hull: 2,
      description: 'The first ship that lets you survive a mistake. Balanced, no specialty — a solid all-rounder.',
      researchCost: 250, buildScrapCost: 200, buildCreditCost: 500,
    },
    {
      id: 'defender', name: 'DEFENDER', src: 'assets/ship-defender.webp', glow: '#8b5cf6',
      weaponSlots: 1, shieldSlots: 2, cargoSlots: 0, hull: 3,
      description: 'Built around shield capacitors, not guns. Carries double the shield capacity of a Fighter — trades offense for staying power.',
      researchCost: 325, buildScrapCost: 260, buildCreditCost: 850,
    },
    {
      id: 'hydra', name: 'HYDRA CORVETTE', src: 'assets/ship-hydra.webp', glow: '#ff6b6b',
      weaponSlots: 2, shieldSlots: 1, cargoSlots: 0, hull: 2,
      description: 'Twin hardpoints — mix a fast gun with a slow one to cover chaff and armor at once. One shield, so bad positioning still punishes you.',
      researchCost: 400, buildScrapCost: 325, buildCreditCost: 1100,
    },
    {
      id: 'prospector', name: 'PROSPECTOR', src: 'assets/ship-prospector.webp', glow: '#6ee7ff',
      weaponSlots: 0, shieldSlots: 1, cargoSlots: 3, hull: 2,
      description: "No weapon at all — every spare gram went into a magnetic cargo rig that pulls Scrap in from a wide radius. Can't shoot your way clear, but nothing nearby stays uncollected.",
      researchCost: 375, buildScrapCost: 300, buildCreditCost: 900,
    },
    {
      id: 'hauler', name: 'HAULER', src: null, glow: '#ffd166',
      weaponSlots: 1, shieldSlots: 1, cargoSlots: 2, hull: 2,
      description: 'Full combat loadout plus a cargo magnet strong enough to pull in Scrap from two hardpoints worth of range. Fight and collect at the same time.',
      researchCost: 500, buildScrapCost: 400, buildCreditCost: 1400,
    },
  ];

  // ---------- Achievements ----------
  // Most unlock the instant their trigger fires (ghost/bounty_hunter/survivor/
  // collector); the run-history ones (made_it_home/pacifist/scouts_honor/
  // iron_hull) are only checked once, at finishExpeditionComplete().
  const ACHIEVEMENTS = [
    { id: 'made_it_home', name: 'MADE IT HOME', description: 'Complete an expedition by reaching the Planet.' },
    { id: 'pacifist', name: 'PACIFIST', description: 'Reach the Planet without firing a single shot.' },
    { id: 'scouts_honor', name: "SCOUT'S HONOR", description: 'Reach the Planet flying the starter Scout, having never bought a weapon at a Depot.' },
    { id: 'iron_hull', name: 'IRON HULL', description: 'Reach the Planet without ever repairing Hull at a Depot.' },
    { id: 'ghost', name: 'GHOST', description: 'Win a boss fight by evading it for the full 20 seconds instead of destroying it.' },
    { id: 'bounty_hunter', name: 'BOUNTY HUNTER', description: 'Destroy 3 bosses, lifetime.' },
    { id: 'survivor', name: 'SURVIVOR', description: 'Win a pirate ambush.' },
    { id: 'collector', name: 'COLLECTOR', description: 'Own every ship.' },
  ];

  let achievementToastTimer = null;
  function showAchievementToast(name) {
    achievementToastNameEl.textContent = name;
    achievementToastEl.classList.add('show');
    clearTimeout(achievementToastTimer);
    achievementToastTimer = setTimeout(() => achievementToastEl.classList.remove('show'), 3200);
  }

  function unlockAchievement(id) {
    if (!DriftStore.unlockAchievement(id)) return; // already had it
    const def = ACHIEVEMENTS.find((a) => a.id === id);
    showAchievementToast(def ? def.name : id);
    playUnlock();
  }

  function checkCollectorAchievement() {
    const totalShips = SHIPS.length + RESEARCH_SHIPS.length;
    if (DriftStore.getOwnedShips().length >= totalShips) unlockAchievement('collector');
  }

  // ---------- Weapons ----------
  // Same role (clear hazards so you don't always have to dodge), different feel:
  // particle = fast single-target, laser = instant line-clear, missile = slow but AoE.
  const DESTRUCTIBLE_MAX_SIZE = 34; // hazards larger than this can't be shot down — still must be dodged
  const WEAPONS = [
    { id: 'particle', name: 'PARTICLE', price: 80, type: 'particle', fireInterval: 0.22, projectileSpeed: 640, glow: '#6ee7ff' },
    { id: 'laser', name: 'LASER', price: 150, type: 'laser', fireInterval: 0.9, beamWidth: 16, glow: '#ff6b6b' },
    { id: 'missile', name: 'MISSILE', price: 220, type: 'missile', fireInterval: 1.15, projectileSpeed: 360, radius: 65, glow: '#ffd166' },
  ];

  // Research Lab content: never directly bought with Credits. Each needs
  // Scrap to research (unlock the blueprint) then Scrap+Credits to build
  // (actually acquire it) — see DriftStore.researchItem/buildResearchedItem.
  const RESEARCH_WEAPONS = [
    {
      id: 'particle_mk2', name: 'PARTICLE MK2', type: 'particle', fireInterval: 0.15, projectileSpeed: 640, glow: '#6ee7ff',
      researchCost: 40, buildScrapCost: 30, buildCreditCost: 300,
      description: 'Faster fire rate than the base Particle cannon.',
    },
    {
      id: 'laser_mk2', name: 'LASER MK2', type: 'laser', fireInterval: 0.9, beamWidth: 26, glow: '#ff6b6b',
      researchCost: 50, buildScrapCost: 35, buildCreditCost: 400,
      description: 'A wider beam clears more of the column per shot.',
    },
    {
      id: 'missile_mk2', name: 'MISSILE MK2', type: 'missile', fireInterval: 1.15, projectileSpeed: 360, radius: 90, glow: '#ffd166',
      researchCost: 60, buildScrapCost: 40, buildCreditCost: 450,
      description: 'A bigger blast radius on impact.',
    },
    {
      id: 'railgun', name: 'RAILGUN', type: 'railgun', fireInterval: 2.8, projectileSpeed: 900, glow: '#e8ecf5',
      researchCost: 120, buildScrapCost: 80, buildCreditCost: 900,
      description: 'Pierces everything in its path — even walls and oversized debris. Very slow to fire.',
    },
  ];

  function getWeaponDef(id) {
    return WEAPONS.find((w) => w.id === id) || RESEARCH_WEAPONS.find((w) => w.id === id) || null;
  }

  function isWeaponOwned(weaponDef) {
    return DriftStore.ownsWeapon(weaponDef.id);
  }

  // ---------- Research Lab ----------
  // Weapons and ships both flow through the same two-gate unlock, just with
  // different owned-check/grant functions — find which list an id belongs to.
  function findResearchDef(id) {
    const weapon = RESEARCH_WEAPONS.find((w) => w.id === id);
    if (weapon) return { def: weapon, kind: 'weapon' };
    const ship = RESEARCH_SHIPS.find((s) => s.id === id);
    if (ship) return { def: ship, kind: 'ship' };
    return null;
  }

  function isResearchItemOwned(entry) {
    return entry.kind === 'ship' ? isOwned(entry.def) : isWeaponOwned(entry.def);
  }

  function researchAction(id) {
    const entry = findResearchDef(id);
    if (!entry || DriftStore.isResearched(id)) return;
    if (DriftStore.getScrap() < entry.def.researchCost) return;
    if (DriftStore.researchItem(id, entry.def.researchCost)) {
      playUnlock();
      scrapAmountEl.textContent = DriftStore.getScrap();
      renderResearchList();
    }
  }

  function buildAction(id) {
    const entry = findResearchDef(id);
    if (!entry || isResearchItemOwned(entry)) return;
    const def = entry.def;
    if (!DriftStore.isResearched(id)) return;
    if (DriftStore.getScrap() < def.buildScrapCost || DriftStore.getBank() < def.buildCreditCost) return;
    if (DriftStore.buildResearchedItem(id, def.buildScrapCost, def.buildCreditCost)) {
      // Ownership itself is just recorded via the normal weapon/ship
      // ownership lists so it slots into the existing equip UI with no
      // special-casing.
      if (entry.kind === 'ship') {
        DriftStore.grantShip(id);
        checkCollectorAchievement();
      } else {
        DriftStore.grantWeapon(id);
      }
      playUnlock();
      bankAmountEl.textContent = Math.floor(DriftStore.getBank());
      scrapAmountEl.textContent = DriftStore.getScrap();
      renderResearchList();
    }
  }

  function renderResearchSection(label, defs, kind) {
    if (!defs.length) return;

    const heading = document.createElement('p');
    heading.className = 'section-label';
    heading.textContent = label;
    researchListEl.appendChild(heading);

    for (const def of defs) {
      const owned = kind === 'ship' ? isOwned(def) : isWeaponOwned(def);
      const researched = DriftStore.isResearched(def.id);

      const item = document.createElement('div');
      item.className = 'research-item' + (owned ? ' owned' : '');

      const info = document.createElement('div');
      info.className = 'research-item-info';

      const name = document.createElement('div');
      name.className = 'research-item-name';
      name.textContent = def.name;
      info.appendChild(name);

      const desc = document.createElement('div');
      desc.className = 'research-item-desc';
      desc.textContent = def.description;
      info.appendChild(desc);

      const status = document.createElement('div');
      status.className = 'research-item-status';
      status.textContent = owned ? 'BUILT & OWNED' : researched ? 'RESEARCHED — READY TO BUILD' : 'UNRESEARCHED';
      info.appendChild(status);

      item.appendChild(info);

      if (!owned) {
        const btn = document.createElement('button');
        if (!researched) {
          const affordable = DriftStore.getScrap() >= def.researchCost;
          btn.className = 'research-btn' + (affordable ? '' : ' disabled');
          btn.textContent = `RESEARCH (${def.researchCost} SCRAP)`;
          btn.addEventListener('click', () => researchAction(def.id));
        } else {
          const affordable = DriftStore.getScrap() >= def.buildScrapCost && DriftStore.getBank() >= def.buildCreditCost;
          btn.className = 'research-btn build' + (affordable ? '' : ' disabled');
          btn.textContent = `BUILD (${def.buildScrapCost} SCRAP + ${def.buildCreditCost} CREDITS)`;
          btn.addEventListener('click', () => buildAction(def.id));
        }
        item.appendChild(btn);
      }

      researchListEl.appendChild(item);
    }
  }

  function renderResearchList() {
    researchBankAmountEl.textContent = Math.floor(DriftStore.getBank());
    researchScrapAmountEl.textContent = DriftStore.getScrap();
    researchListEl.innerHTML = '';

    renderResearchSection('WEAPONS', RESEARCH_WEAPONS, 'weapon');
    renderResearchSection('SHIPS', RESEARCH_SHIPS, 'ship');
  }

  // Array of weapon ids (or null) by hardpoint slot index. A ship only reads
  // as many entries as it has weaponSlots — assigning slot 2 on a Hydra and
  // switching to a 1-slot ship doesn't lose that pick.
  let selectedWeaponIds = DriftStore.getSelectedWeapons();

  function assignWeaponSlot(slotIndex, id) {
    // Clicking the weapon already in that slot unequips it.
    selectedWeaponIds[slotIndex] = selectedWeaponIds[slotIndex] === id ? null : id;
    DriftStore.setSelectedWeapons(selectedWeaponIds);
    renderWeaponSelect();
  }

  function buyWeapon(id) {
    const def = getWeaponDef(id);
    if (!def || isWeaponOwned(def)) return;
    const bank = DriftStore.getBank();
    if (bank < def.price) return;
    if (DriftStore.purchaseWeapon(id, def.price)) {
      playUnlock();
      // Auto-equip into the first empty (or first) hardpoint slot.
      const shipDef = getShipDef(selectedShipId);
      const emptyIndex = selectedWeaponIds.findIndex((w) => !w);
      const slotIndex = emptyIndex >= 0 && emptyIndex < shipDef.weaponSlots ? emptyIndex : 0;
      assignWeaponSlot(slotIndex, id);
      bankAmountEl.textContent = Math.floor(DriftStore.getBank());
      renderWeaponSelect();
      renderShieldSelect();
    }
  }

  function isPreviewingUnowned() {
    return previewShipId && !isOwned(getShipDef(previewShipId));
  }

  function renderWeaponSelect() {
    if (isPreviewingUnowned()) {
      // Loadout UI always edits the ship you actually have equipped — while
      // previewing a ship you don't own, hide it instead of showing gear
      // assignment that looks like it belongs to the previewed ship.
      weaponSectionEl.classList.add('hidden');
      return;
    }
    const shipDef = getShipDef(selectedShipId);
    weaponSectionEl.classList.toggle('hidden', shipDef.weaponSlots === 0);
    if (shipDef.weaponSlots === 0) return;

    weaponSelectEl.innerHTML = '';
    const bank = DriftStore.getBank();
    const multiSlot = shipDef.weaponSlots > 1;

    // Research weapons only ever show up here once built — before that they
    // live exclusively in the Research Lab, not cluttering the base shop.
    const visibleWeapons = [...WEAPONS, ...RESEARCH_WEAPONS.filter(isWeaponOwned)];

    for (const def of visibleWeapons) {
      const owned = isWeaponOwned(def);
      const assignedSlots = selectedWeaponIds
        .slice(0, shipDef.weaponSlots)
        .reduce((acc, id, idx) => (id === def.id ? acc.concat(idx) : acc), []);

      const el = document.createElement('div');
      el.className = 'weapon-option' + (owned ? '' : ' locked') + (assignedSlots.length ? ' selected' : '');

      const icon = document.createElement('div');
      icon.className = `weapon-icon weapon-icon-${def.type}`;
      icon.style.setProperty('--weapon-glow', def.glow);
      el.appendChild(icon);

      const name = document.createElement('div');
      name.className = 'ship-name';
      name.textContent = def.name;
      el.appendChild(name);

      if (!owned) {
        const lockLabel = document.createElement('div');
        lockLabel.className = 'lock-label';
        lockLabel.textContent = 'LOCKED';
        el.appendChild(lockLabel);

        const buyBtn = document.createElement('button');
        const affordable = bank >= def.price;
        buyBtn.className = 'buy-btn' + (affordable ? '' : ' disabled');
        buyBtn.textContent = `BUY ${def.price}`;
        buyBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          buyWeapon(def.id);
        });
        el.appendChild(buyBtn);
      } else if (multiSlot) {
        const slotRow = document.createElement('div');
        slotRow.className = 'slot-pill-row';
        for (let i = 0; i < shipDef.weaponSlots; i++) {
          const pill = document.createElement('button');
          pill.className = 'slot-pill' + (selectedWeaponIds[i] === def.id ? ' active' : '');
          pill.textContent = i + 1;
          pill.addEventListener('click', (e) => {
            e.stopPropagation();
            assignWeaponSlot(i, def.id);
          });
          slotRow.appendChild(pill);
        }
        el.appendChild(slotRow);
      } else {
        el.addEventListener('click', () => assignWeaponSlot(0, def.id));
      }
      weaponSelectEl.appendChild(el);
    }
  }

  // Drops any assigned weapon id that isn't owned (shouldn't happen, but
  // guards against cleared/edited storage). An empty slot just doesn't fire.
  function ensureSelectedWeaponValid() {
    selectedWeaponIds = selectedWeaponIds.map((id) => {
      if (!id) return null;
      const def = getWeaponDef(id);
      return def && isWeaponOwned(def) ? id : null;
    });
    DriftStore.setSelectedWeapons(selectedWeaponIds);
  }

  // ---------- Shields ----------
  // Consumables, not gear: bought as a stock, carried into every run on a
  // shield-slot ship, and spent one at a time absorbing a hit that would
  // otherwise end the run. Unused ones persist to the next run.
  const SHIELD_PRICE = 60;

  function buyShieldPack() {
    const bank = DriftStore.getBank();
    if (bank < SHIELD_PRICE) return;
    if (DriftStore.purchaseShieldPack(SHIELD_PRICE)) {
      playUnlock();
      bankAmountEl.textContent = Math.floor(DriftStore.getBank());
      renderShieldSelect();
      renderWeaponSelect();
    }
  }

  function renderShieldSelect() {
    if (isPreviewingUnowned()) {
      shieldSectionEl.classList.add('hidden');
      return;
    }
    const shipDef = getShipDef(selectedShipId);
    shieldSectionEl.classList.toggle('hidden', shipDef.shieldSlots === 0);
    if (shipDef.shieldSlots === 0) return;
    const owned = DriftStore.getShieldCount();
    shieldOwnedCountEl.textContent = `${owned} (carries ${Math.min(owned, shipDef.shieldSlots)}/${shipDef.shieldSlots} this run)`;
    const affordable = DriftStore.getBank() >= SHIELD_PRICE;
    buyShieldBtn.classList.toggle('disabled', !affordable);
    buyShieldBtn.textContent = `BUY +1 (${SHIELD_PRICE})`;
  }

  buyShieldBtn.addEventListener('click', buyShieldPack);

  // ---------- Expedition map ----------
  // A fresh procedural node graph every expedition. Node "type" drives real
  // per-sector modifiers (spawn rate, hazard size, fall speed, shield/weapon
  // disable) — hostile still just gets a hazard-profile bump until enemies
  // (a real entity type) land in a later phase.
  const MAP_LAYERS = 20; // regular sector layers between start and the planet
  // scrapInterval: [min,max] seconds between ambient Scrap pickup spawns —
  // rare in calm sectors, common where the actual danger (and reward) is.
  const NODE_TYPES = {
    standard: { label: 'STANDARD', color: '#6ee7ff', spawnMult: 1, speedMult: 1, sizeMult: 1, scrapInterval: [45, 70] },
    debris: { label: 'DEBRIS FIELD', color: '#ff6b6b', spawnMult: 1.5, speedMult: 1.05, sizeMult: 1.25, scrapInterval: [45, 70] },
    radiation: { label: 'RADIATION', color: '#a3e635', spawnMult: 1, speedMult: 1, sizeMult: 1, scrapInterval: [15, 25] },
    hostile: { label: 'HOSTILE', color: '#ff3b3b', spawnMult: 1.25, speedMult: 1.2, sizeMult: 1, scrapInterval: [15, 25] },
    depot: { label: 'DEPOT', color: '#4ade80', spawnMult: 0, speedMult: 0, sizeMult: 0, scrapInterval: [9999, 9999] },
    planet: { label: 'PLANET', color: '#ffd166', spawnMult: 1, speedMult: 1, sizeMult: 1, scrapInterval: [45, 70] },
  };

  function pickNodeType(layerIndex) {
    const depthT = layerIndex / Math.max(1, MAP_LAYERS - 1); // 0..1, harsher deeper in
    const roll = Math.random();
    if (roll < 0.4 - depthT * 0.2) return 'standard';
    if (roll < 0.72 - depthT * 0.1) return 'debris';
    if (roll < 0.88) return 'radiation';
    return 'hostile';
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Depots aren't guaranteed every layer — one random layer per block of
  // DEPOT_LAYER_INTERVAL hosts one, so refueling costs a real detour instead
  // of letting you depot-hop past most of the map. Worst-case gap between two
  // depots is 2*DEPOT_LAYER_INTERVAL-1 layers — kept comfortably under
  // FUEL_MAX so a max-fuel player can always cross it.
  const DEPOT_LAYER_INTERVAL = 3;

  function pickDepotLayers() {
    const depotLayers = new Set();
    for (let blockStart = 0; blockStart < MAP_LAYERS; blockStart += DEPOT_LAYER_INTERVAL) {
      const blockEnd = Math.min(blockStart + DEPOT_LAYER_INTERVAL, MAP_LAYERS);
      // The very first block never places its depot on layer 0 — reaching a
      // depot before surviving a single sector means zero credits to spend.
      const rangeStart = blockStart === 0 ? Math.min(1, blockEnd - 1) : blockStart;
      depotLayers.add(rangeStart + Math.floor(Math.random() * (blockEnd - rangeStart)));
    }
    return depotLayers;
  }

  function generateMap() {
    const layers = [];
    const depotLayers = pickDepotLayers();
    for (let l = 0; l < MAP_LAYERS; l++) {
      const count = 3 + Math.floor(Math.random() * 3); // 3-5 nodes
      const depotIndex = depotLayers.has(l) ? Math.floor(Math.random() * count) : -1;
      const nodes = [];
      for (let i = 0; i < count; i++) {
        const type = i === depotIndex ? 'depot' : pickNodeType(l);
        nodes.push({
          id: `L${l}N${i}`,
          layer: l,
          type,
          duration: type === 'depot' ? 0 : 60 + Math.random() * 60, // 1-2 minutes
          difficultyMultiplier: 1 + (l / Math.max(1, MAP_LAYERS - 1)) * 1.2,
          // Radiation knocks out one system for the sector — picked once at
          // map-gen time so it's consistent if you look at the node twice.
          disables: type === 'radiation' ? (Math.random() < 0.5 ? 'shields' : 'weapons') : null,
          isPlanet: false,
          isDepot: type === 'depot',
          visited: false,
        });
      }
      layers.push(nodes);
    }
    layers.push([{
      id: 'PLANET',
      layer: MAP_LAYERS,
      type: 'planet',
      duration: 0,
      difficultyMultiplier: 1,
      isPlanet: true,
      isDepot: false,
      visited: false,
    }]);

    const edges = {};
    for (let l = 0; l < layers.length - 1; l++) {
      const current = layers[l];
      const next = layers[l + 1];
      const incoming = new Set();
      const nextDepot = next.find((n) => n.isDepot);
      for (const node of current) {
        const connectionCount = Math.min(next.length, 1 + (Math.random() < 0.5 ? 1 : 0));
        const targets = shuffle(next.slice()).slice(0, connectionCount);
        edges[node.id] = targets.map((t) => t.id);
        targets.forEach((t) => incoming.add(t.id));
        // Fuel only works if refueling is always reachable, not just present
        // somewhere in the layer — so every node gets a guaranteed extra edge
        // straight to next layer's Depot (a no-op if already connected).
        if (nextDepot && !edges[node.id].includes(nextDepot.id)) {
          edges[node.id].push(nextDepot.id);
          incoming.add(nextDepot.id);
        }
      }
      // Guarantee every next-layer node is reachable from somewhere.
      for (const node of next) {
        if (!incoming.has(node.id)) {
          const source = current[Math.floor(Math.random() * current.length)];
          edges[source.id].push(node.id);
          incoming.add(node.id);
        }
      }
    }

    const byId = {};
    for (const layer of layers) for (const node of layer) byId[node.id] = node;

    return { layers, edges, byId };
  }

  let mapData = null;
  let currentNodeId = null; // null = haven't entered layer 0 yet
  let currentSectorNode = null;
  let expeditionScore = 0;

  // ---------- Achievement tracking (expedition-only) ----------
  let shotsFiredThisExpedition = 0;
  let boughtWeaponThisExpedition = false;
  let hullRepairedThisExpedition = false;

  // ---------- Fuel (expedition-only) ----------
  // Every jump between sectors costs fuel; Depots (guaranteed reachable every
  // layer) are the only place to refill, using this run's own Credits.
  const FUEL_START = 5;
  const FUEL_MAX = 8;
  const FUEL_PER_JUMP = 1;
  const FUEL_PRICE = 120; // in-run credits (expeditionScore) per unit
  let expeditionFuel = FUEL_START;
  const STRANDED_AMBUSH_DELAY = 8; // seconds stuck on the map at 0 fuel before pirates find you
  let strandedTimer = 0;

  function updateFuelHud() {
    fuelHudEl.textContent = `FUEL x${expeditionFuel}`;
  }

  function reachableNodeIds() {
    if (!mapData) return [];
    if (currentNodeId === null) return mapData.layers[0].map((n) => n.id);
    return mapData.edges[currentNodeId] || [];
  }

  function renderMapLegend() {
    mapLegend.innerHTML = '';
    for (const key of ['standard', 'debris', 'radiation', 'hostile', 'depot', 'planet']) {
      const def = NODE_TYPES[key];
      const item = document.createElement('div');
      item.className = 'legend-item';
      const swatch = document.createElement('span');
      swatch.className = 'legend-swatch';
      swatch.style.background = def.color;
      item.appendChild(swatch);
      const label = document.createElement('span');
      label.textContent = def.label;
      item.appendChild(label);
      mapLegend.appendChild(item);
    }
  }

  function renderMap() {
    mapContainer.innerHTML = '';
    renderMapLegend();
    if (!mapData) return;

    const layerCount = mapData.layers.length;
    const maxPerLayer = Math.max(...mapData.layers.map((l) => l.length));
    const layerSpacingY = 125;
    const nodeSpacingX = 125;
    const marginY = 60;
    const svgWidth = Math.max(320, maxPerLayer * nodeSpacingX + 70);
    const svgHeight = layerCount * layerSpacingY + marginY * 2;

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
    svg.setAttribute('width', '100%');
    svg.style.maxWidth = `${svgWidth}px`;
    // Full natural height, not squished to a cap — with 20+ layers the map
    // container scrolls (see #map-container's overflow-y) instead.
    svg.style.height = `${svgHeight}px`;

    const reachable = new Set(reachableNodeIds());
    // The very first pick is always free; every jump after that needs fuel.
    const outOfFuel = currentNodeId !== null && expeditionFuel < FUEL_PER_JUMP;
    mapFuelWarningEl.classList.toggle('hidden', !outOfFuel);

    function nodePos(node) {
      const layerNodes = mapData.layers[node.layer];
      const idxInLayer = layerNodes.indexOf(node);
      const centerX = svgWidth / 2;
      const x = centerX + (idxInLayer - (layerNodes.length - 1) / 2) * nodeSpacingX;
      // Start (layer 0) near the bottom, planet near the top.
      const y = svgHeight - marginY - node.layer * layerSpacingY;
      return { x, y };
    }

    // Edges first, so nodes draw on top.
    for (const [fromId, toIds] of Object.entries(mapData.edges)) {
      const from = mapData.byId[fromId];
      for (const toId of toIds) {
        const to = mapData.byId[toId];
        const p1 = nodePos(from);
        const p2 = nodePos(to);
        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', p1.x);
        line.setAttribute('y1', p1.y);
        line.setAttribute('x2', p2.x);
        line.setAttribute('y2', p2.y);
        const isReachableEdge = fromId === currentNodeId && reachable.has(toId);
        line.setAttribute('class', 'map-edge' + (isReachableEdge ? ' reachable' : ''));
        svg.appendChild(line);
      }
    }

    for (const layer of mapData.layers) {
      for (const node of layer) {
        const { x, y } = nodePos(node);
        const isReachable = reachable.has(node.id);
        const isCurrent = node.id === currentNodeId;
        // You only get intel on a sector once it's your immediate choice or
        // you've already flown it — anything further out stays a mystery,
        // so you can't plan a "safe" route across the whole map in advance.
        const known = node.isPlanet || node.visited || isReachable;
        const g = document.createElementNS(svgNS, 'g');
        g.setAttribute('class', 'map-node' +
          (node.visited ? ' visited' : isReachable ? ' reachable' : ' locked') +
          (isCurrent ? ' current' : '') +
          (isReachable && outOfFuel ? ' no-fuel' : ''));
        if (known) {
          g.style.setProperty('--node-color', NODE_TYPES[node.type].color);
        }

        const circle = document.createElementNS(svgNS, 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', node.isPlanet ? 28 : 22);
        circle.setAttribute('class', 'map-node-circle');
        g.appendChild(circle);

        const label = document.createElementNS(svgNS, 'text');
        label.setAttribute('x', x);
        label.setAttribute('y', y + (node.isPlanet ? 44 : 38));
        label.setAttribute('class', 'map-node-label');
        label.textContent = node.isPlanet ? 'PLANET' : !known ? '?' : node.isDepot ? 'DEPOT' : `${Math.round(node.duration)}s`;
        g.appendChild(label);

        if (node.disables && known) {
          const warnLabel = document.createElementNS(svgNS, 'text');
          warnLabel.setAttribute('x', x);
          warnLabel.setAttribute('y', y + 56);
          warnLabel.setAttribute('class', 'map-node-warning');
          warnLabel.textContent = node.disables === 'shields' ? 'SHIELDS OFF' : 'WEAPONS OFF';
          g.appendChild(warnLabel);
        }

        if (isReachable && !outOfFuel) {
          g.addEventListener('click', () => enterSector(node));
        }

        svg.appendChild(g);
      }
    }

    mapContainer.appendChild(svg);

    // With 20+ layers the map is much taller than the container — scroll to
    // the player's current position instead of dumping them at the Planet.
    const anchorId = currentNodeId || (reachable.size ? [...reachable][0] : null);
    if (anchorId && mapData.byId[anchorId]) {
      // svg.style.height is set 1:1 with the viewBox above, so node y
      // coordinates map directly to container scroll pixels, no rescaling.
      const { y } = nodePos(mapData.byId[anchorId]);
      mapContainer.scrollTop = Math.max(0, y - mapContainer.clientHeight * 0.6);
    } else {
      mapContainer.scrollTop = mapContainer.scrollHeight;
    }
  }

  function showMapScreen() {
    state = 'map';
    jumping = false;
    flashAlpha = 0;
    setMusicMood('menu');
    sectorHudEl.classList.add('hidden');
    fuelHudEl.classList.add('hidden');
    hullHudEl.classList.add('hidden');
    startScreen.classList.add('hidden');
    shipScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    completeScreen.classList.add('hidden');
    researchScreen.classList.add('hidden');
    depotScreen.classList.add('hidden');
    achievementsScreen.classList.add('hidden');
    mapFuelAmountEl.textContent = expeditionFuel;
    mapFuelMaxEl.textContent = FUEL_MAX;
    // Unhide before rendering: scrollTop assignments inside renderMap() are
    // clamped to 0 while the container is display:none (scrollHeight reads 0).
    mapScreen.classList.remove('hidden');
    renderMap();
    requestAnimationFrame(idleLoop);
  }

  function beginExpedition() {
    mapData = generateMap();
    currentNodeId = null;
    expeditionScore = 0;
    expeditionScrap = 0;
    expeditionFuel = FUEL_START;
    expeditionMaxHull = getShipDef(selectedShipId).hull;
    expeditionHull = expeditionMaxHull;
    shotsFiredThisExpedition = 0;
    boughtWeaponThisExpedition = false;
    hullRepairedThisExpedition = false;
    showMapScreen();
  }

  function abandonExpedition() {
    // Banks whatever was earned so far, same as dying, then returns to start.
    if (expeditionScore > 0 || expeditionScrap > 0) {
      finalizeExpedition(expeditionScore, false);
    }
    mapData = null;
    currentNodeId = null;
    expeditionScore = 0;
    showStartScreen();
  }

  abandonBtn.addEventListener('click', abandonExpedition);

  const shipImages = {};
  for (const s of [...SHIPS, ...RESEARCH_SHIPS]) {
    if (!s.src) continue;
    const img = new Image();
    img.src = s.src;
    shipImages[s.id] = img;
  }

  let selectedShipId = DriftStore.getSelectedShip();
  let previewShipId = null; // locked ship being inspected, not equipped

  function isOwned(shipDef) {
    return DriftStore.ownsShip(shipDef.id);
  }

  function getShipDef(id) {
    return SHIPS.find((s) => s.id === id) || RESEARCH_SHIPS.find((s) => s.id === id) || SHIPS[0];
  }

  function selectShip(id) {
    const def = getShipDef(id);
    if (!isOwned(def)) return;
    selectedShipId = id;
    previewShipId = null;
    DriftStore.setSelectedShip(id);
    renderShipSelect();
  }

  function previewShip(id) {
    previewShipId = id;
    renderShipSelect();
  }

  function buyShip(id) {
    const def = getShipDef(id);
    if (isOwned(def)) return;
    const bank = DriftStore.getBank();
    if (bank < def.price) return;
    if (DriftStore.purchaseShip(id, def.price)) {
      playUnlock();
      selectShip(id);
      bankAmountEl.textContent = Math.floor(DriftStore.getBank());
      renderShipSelect();
      checkCollectorAchievement();
    }
  }

  function isResearchShip(def) {
    return RESEARCH_SHIPS.some((s) => s.id === def.id);
  }

  function renderShipSelect() {
    shipSelectEl.innerHTML = '';
    const bank = DriftStore.getBank();
    // Every ship is visible here now, even ones that still need research —
    // those just show a locked "needs research" state instead of a buy button.
    const visibleShips = [...SHIPS, ...RESEARCH_SHIPS];
    for (const def of visibleShips) {
      const owned = isOwned(def);
      const el = document.createElement('div');
      el.className = 'ship-option' +
        (owned ? '' : ' locked') +
        (def.id === selectedShipId ? ' selected' : '') +
        (!owned && def.id === previewShipId ? ' previewed' : '');
      if (def.src) {
        const img = document.createElement('img');
        img.src = def.src;
        el.appendChild(img);
      } else {
        const icon = document.createElement('div');
        icon.className = 'ship-icon-fallback';
        icon.style.setProperty('--ship-glow', def.glow);
        el.appendChild(icon);
      }
      const name = document.createElement('div');
      name.className = 'ship-name';
      name.textContent = def.name;
      el.appendChild(name);
      if (!owned) {
        const lockLabel = document.createElement('div');
        lockLabel.className = 'lock-label';
        lockLabel.textContent = 'LOCKED';
        el.appendChild(lockLabel);

        if (isResearchShip(def)) {
          const researched = DriftStore.isResearched(def.id);
          const tag = document.createElement('div');
          tag.className = 'research-needed-tag';
          tag.textContent = researched ? 'READY TO BUILD IN LAB' : 'NEEDS RESEARCH';
          el.appendChild(tag);
        } else {
          const buyBtn = document.createElement('button');
          const affordable = bank >= def.price;
          buyBtn.className = 'buy-btn' + (affordable ? '' : ' disabled');
          buyBtn.textContent = `BUY ${def.price}`;
          buyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            buyShip(def.id);
          });
          el.appendChild(buyBtn);
        }
        el.addEventListener('click', () => previewShip(def.id));
      } else {
        el.addEventListener('click', () => selectShip(def.id));
      }
      shipSelectEl.appendChild(el);
    }
    renderShipDescription();
    renderWeaponSelect();
    renderShieldSelect();
  }

  function renderShipDescription() {
    const previewing = isPreviewingUnowned();
    const def = getShipDef(previewing ? previewShipId : selectedShipId);
    const slotsLine = `${def.weaponSlots} WEAPON · ${def.shieldSlots} SHIELD · ${def.cargoSlots} MAGNET · ${def.hull} HULL`;
    let priceLine = '';
    if (previewing && isResearchShip(def)) {
      const researched = DriftStore.isResearched(def.id);
      priceLine = researched
        ? `<br><span class="preview-tag">PREVIEW ONLY · BUILD IN THE RESEARCH LAB (${def.buildScrapCost} SCRAP + ${def.buildCreditCost} CREDITS) TO EQUIP</span>`
        : `<br><span class="preview-tag">PREVIEW ONLY · RESEARCH IN THE LAB (${def.researchCost} SCRAP) BEFORE YOU CAN BUILD IT</span>`;
    } else if (previewing) {
      priceLine = `<br><span class="preview-tag">PREVIEW ONLY · BUY ${def.price} TO EQUIP AND CONFIGURE LOADOUT</span>`;
    }
    shipDescriptionEl.innerHTML = `<strong>${def.name}</strong> — ${def.description}<br><span class="slots-line">${slotsLine}</span>${priceLine}`;
  }

  // If a previously-selected ship is no longer owned (shouldn't happen, but
  // guards against cleared/edited storage), fall back to the starter.
  function ensureSelectedShipValid() {
    const def = getShipDef(selectedShipId);
    if (!isOwned(def)) {
      selectedShipId = 'starter';
      DriftStore.setSelectedShip(selectedShipId);
    }
  }

  let width = 0;
  let height = 0;
  let dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  // ---------- Audio ----------
  // Tiny WebAudio synth, no assets. Created lazily on first user gesture.
  let audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    } else if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // ---------- Background music ----------
  // Three mood loops, crossfaded on transitions. Browsers block audio
  // autoplay until a real user gesture, so playback only actually starts
  // once unlockMusic() fires (see the one-time pointerdown/keydown listeners
  // below) — until then setMusicMood() just records the intended mood.
  const MUSIC_TRACKS = {
    menu: 'assets/music/menu.mp3',
    ambient: 'assets/music/ambient.mp3',
    intense: 'assets/music/intense.mp3',
  };
  const MUSIC_VOLUME = 0.35;
  const MUSIC_FADE_TIME = 1.5;

  const musicAudio = {};
  for (const [mood, src] of Object.entries(MUSIC_TRACKS)) {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0;
    audio.preload = 'auto';
    musicAudio[mood] = audio;
  }

  let currentMusicMood = 'menu';
  let musicUnlocked = false;

  function fadeAudio(audio, target, duration) {
    audio._fadeToken = (audio._fadeToken || 0) + 1;
    const token = audio._fadeToken;
    const start = audio.volume;
    const startTime = performance.now();
    function step(now) {
      if (audio._fadeToken !== token) return; // superseded by a newer fade
      const t = Math.min(1, (now - startTime) / (duration * 1000));
      audio.volume = start + (target - start) * t;
      if (t < 1) {
        requestAnimationFrame(step);
      } else if (target === 0) {
        audio.pause();
      }
    }
    requestAnimationFrame(step);
  }

  function unlockMusic() {
    if (musicUnlocked) return;
    musicUnlocked = true;
    const audio = musicAudio[currentMusicMood];
    if (!audio) return;
    audio.volume = 0;
    audio.play().catch(() => {});
    fadeAudio(audio, MUSIC_VOLUME, MUSIC_FADE_TIME);
  }

  function setMusicMood(mood) {
    if (mood === currentMusicMood) return;
    const prevMood = currentMusicMood;
    currentMusicMood = mood;
    if (!musicUnlocked) return; // will start on unlockMusic() instead
    const prevAudio = musicAudio[prevMood];
    if (prevAudio) fadeAudio(prevAudio, 0, MUSIC_FADE_TIME);
    const nextAudio = musicAudio[mood];
    if (nextAudio) {
      if (nextAudio.paused) nextAudio.play().catch(() => {});
      fadeAudio(nextAudio, MUSIC_VOLUME, MUSIC_FADE_TIME);
    }
  }

  window.addEventListener('pointerdown', unlockMusic, { once: true });
  window.addEventListener('keydown', unlockMusic, { once: true });

  function tone({ freq = 440, duration = 0.15, type = 'sine', startFreq, endFreq, gain = 0.2, delay = 0 }) {
    if (!audioCtx) return;
    const t0 = audioCtx.currentTime + delay;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = type;
    if (startFreq !== undefined && endFreq !== undefined) {
      osc.frequency.setValueAtTime(startFreq, t0);
      osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 1), t0 + duration);
    } else {
      osc.frequency.setValueAtTime(freq, t0);
    }
    gainNode.gain.setValueAtTime(gain, t0);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  function playNearMiss() {
    tone({ type: 'sine', startFreq: 900, endFreq: 1400, duration: 0.12, gain: 0.08 });
  }

  function playDeath() {
    tone({ type: 'sawtooth', startFreq: 220, endFreq: 40, duration: 0.35, gain: 0.22 });
    tone({ type: 'square', startFreq: 90, endFreq: 30, duration: 0.4, gain: 0.15, delay: 0.02 });
  }

  function playMilestone() {
    tone({ type: 'triangle', startFreq: 660, endFreq: 880, duration: 0.18, gain: 0.1 });
  }

  function playFlowStart() {
    tone({ type: 'sine', startFreq: 500, endFreq: 1100, duration: 0.3, gain: 0.14 });
  }

  function playUnlock() {
    tone({ type: 'triangle', startFreq: 520, endFreq: 1040, duration: 0.2, gain: 0.14 });
    tone({ type: 'triangle', startFreq: 780, endFreq: 1560, duration: 0.25, gain: 0.12, delay: 0.1 });
  }

  function playStart() {
    tone({ type: 'sine', startFreq: 440, endFreq: 660, duration: 0.12, gain: 0.12 });
  }

  function playShieldBreak() {
    tone({ type: 'triangle', startFreq: 700, endFreq: 200, duration: 0.25, gain: 0.16 });
    tone({ type: 'sine', startFreq: 1400, endFreq: 900, duration: 0.15, gain: 0.08, delay: 0.03 });
  }

  function playHullHit() {
    tone({ type: 'sawtooth', startFreq: 300, endFreq: 80, duration: 0.3, gain: 0.2 });
  }

  function playHyperspaceJump() {
    tone({ type: 'sine', startFreq: 200, endFreq: 2200, duration: 1.1, gain: 0.14 });
    tone({ type: 'triangle', startFreq: 300, endFreq: 1600, duration: 0.9, gain: 0.08, delay: 0.15 });
  }

  function playParticleShot() {
    tone({ type: 'square', startFreq: 1200, endFreq: 1600, duration: 0.05, gain: 0.05 });
  }

  function playEnemyShot() {
    tone({ type: 'sawtooth', startFreq: 500, endFreq: 250, duration: 0.12, gain: 0.07 });
  }

  function playEnemyKill() {
    tone({ type: 'square', startFreq: 800, endFreq: 100, duration: 0.2, gain: 0.14 });
    tone({ type: 'triangle', startFreq: 1200, endFreq: 1800, duration: 0.15, gain: 0.08, delay: 0.05 });
  }

  function playScrapCollect() {
    tone({ type: 'sine', startFreq: 700, endFreq: 1400, duration: 0.12, gain: 0.1 });
  }

  function playLaserShot() {
    tone({ type: 'sawtooth', startFreq: 1800, endFreq: 300, duration: 0.22, gain: 0.1 });
  }

  function playMissileShot() {
    tone({ type: 'square', startFreq: 300, endFreq: 180, duration: 0.15, gain: 0.1 });
  }

  function playRailgunShot() {
    tone({ type: 'sawtooth', startFreq: 2400, endFreq: 100, duration: 0.35, gain: 0.18 });
  }

  // ---------- Input ----------
  const input = {
    left: false,
    right: false,
    up: false,
    down: false,
    touchActive: false,
    touchX: null,
    touchY: null,
  };

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') input.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') input.right = true;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') input.up = true;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') input.down = true;
    if (e.key === ' ' && state === 'start') showShipScreen();
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') input.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') input.right = false;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') input.up = false;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') input.down = false;
  });

  function pointerToX(clientX) {
    const rect = canvas.getBoundingClientRect();
    return clientX - rect.left;
  }

  function pointerToY(clientY) {
    const rect = canvas.getBoundingClientRect();
    return clientY - rect.top;
  }

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    input.touchActive = true;
    input.touchX = pointerToX(e.touches[0].clientX);
    input.touchY = pointerToY(e.touches[0].clientY);
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    input.touchX = pointerToX(e.touches[0].clientX);
    input.touchY = pointerToY(e.touches[0].clientY);
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    input.touchActive = false;
  }, { passive: false });

  let mouseDown = false;
  canvas.addEventListener('mousedown', (e) => {
    mouseDown = true;
    input.touchActive = true;
    input.touchX = pointerToX(e.clientX);
    input.touchY = pointerToY(e.clientY);
  });
  window.addEventListener('mousemove', (e) => {
    if (mouseDown) {
      input.touchX = pointerToX(e.clientX);
      input.touchY = pointerToY(e.clientY);
    }
  });
  window.addEventListener('mouseup', () => {
    mouseDown = false;
    input.touchActive = false;
  });

  // ---------- State machine ----------
  let state = 'start'; // 'start' | 'map' | 'playing' | 'gameOver' (gameOver covers both failure and completion screens)
  let dying = false;
  let dyingTimer = 0;
  let jumping = false; // sector cleared — hyperspace transition playing before showing the map
  let jumpTimer = 0;
  const JUMP_ANIM_DURATION = 1.3;

  // ---------- Jump gate ----------
  // Normal sectors (not Depot, not Planet) end by flying to a gate instead of
  // an automatic timer cutoff: spawning stops in the last GATE_CLEAR_WINDOW
  // seconds, existing hazards/enemies clear naturally, and reaching the gate
  // triggers the jump. GATE_GRACE_PERIOD is just a safety net against a
  // theoretical soft-lock if someone never approaches it.
  const GATE_CLEAR_WINDOW = 8;
  const GATE_GRACE_PERIOD = 20;
  const GATE_RADIUS = 34;
  let sectorHasGate = false;
  let gate = null;
  let gateGraceTimer = 0;

  function activateGate() {
    if (gate) return;
    gate = { x: width / 2, y: (ship.yMin + ship.yMax) / 2, radius: GATE_RADIUS, pulse: 0 };
    spawnFloatingText(width / 2, height * 0.3, 'JUMP GATE ONLINE', COLORS.ship, { size: 18, decay: 0.6, vy: -12 });
  }

  function updateGate(dt) {
    if (!gate) return;
    gate.pulse += dt;
    const box = { x: gate.x - gate.radius, y: gate.y - gate.radius, w: gate.radius * 2, h: gate.radius * 2 };
    if (rectsOverlap(shipHitbox(), box)) {
      triggerHyperspaceJump();
    }
  }

  function drawGate() {
    if (!gate) return;
    const pulse = 0.7 + Math.sin(gate.pulse * 3) * 0.3;
    ctx.save();
    ctx.translate(gate.x, gate.y);
    ctx.strokeStyle = hexToRgba(COLORS.ship, pulse);
    ctx.lineWidth = 4;
    ctx.shadowColor = COLORS.ship;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(0, 0, gate.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, gate.radius * 0.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // ---------- Boss encounters ----------
  // Two contexts share this: a Hostile sector's gate waits behind a boss
  // fight, and a pirate ambush (triggered by being stranded with 0 fuel) IS
  // one, fought immediately with no gate at all. Either way there are two
  // ways to win — kill it (damageEnemy already handles that, since the boss
  // just lives in the normal `enemies` array) or survive BOSS_EVADE_TIME
  // seconds without dying.
  const BOSS_EVADE_TIME = 20;
  const AMBUSH_FUEL_REWARD = 3;
  let bossActive = false;
  let bossObj = null;
  let bossEvadeTimer = 0;
  let bossContext = null; // 'hostile' | 'ambush'

  function spawnBoss(difficultyMultiplier) {
    const def = ENEMY_TYPES.boss;
    const maxHp = Math.round(def.hp * (1 + (difficultyMultiplier - 1) * 0.6));
    const x = width / 2;
    bossObj = {
      type: 'boss', x, baseX: x, y: height * 0.25, w: def.size, h: def.size,
      hp: maxHp, maxHp,
      spawnTime: elapsed, cooldown: 1.5, fireState: 'idle', telegraphTimer: 0, countedNearMiss: false,
    };
    enemies.push(bossObj);
    bossActive = true;
    bossEvadeTimer = 0;
    spawnFloatingText(width / 2, height * 0.35, 'PIRATE BOSS', def.color, { size: 22, decay: 0.5, vy: -10 });
  }

  function onBossResolved(viaKill) {
    playUnlock();
    if (viaKill) {
      DriftStore.addBossKill();
      if (DriftStore.getBossKillCount() >= 3) unlockAchievement('bounty_hunter');
    } else {
      unlockAchievement('ghost');
    }
    if (bossContext === 'ambush') unlockAchievement('survivor');
    if (bossContext === 'hostile') {
      activateGate();
    } else if (bossContext === 'ambush') {
      resolveAmbush();
    }
    bossContext = null;
  }

  function updateBossEncounter(dt) {
    if (!bossActive) return;
    if (!enemies.includes(bossObj)) {
      // Killed via damageEnemy (already dropped its scrap and played its own cues).
      bossActive = false;
      onBossResolved(true);
      return;
    }
    bossEvadeTimer += dt;
    if (bossEvadeTimer >= BOSS_EVADE_TIME) {
      const idx = enemies.indexOf(bossObj);
      if (idx >= 0) enemies.splice(idx, 1);
      bossActive = false;
      spawnFloatingText(bossObj.x, bossObj.y, 'EVADED', COLORS.ship, { size: 16, decay: 0.7 });
      onBossResolved(false);
    }
  }

  function drawBossHealthBar() {
    if (!bossActive || !bossObj) return;
    const barWidth = Math.min(320, width * 0.6);
    const barHeight = 10;
    const x = width / 2 - barWidth / 2;
    const y = 24;
    const t = Math.max(0, bossObj.hp / bossObj.maxHp);
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = ENEMY_TYPES.boss.color;
    ctx.fillRect(x, y, barWidth * t, barHeight);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, barWidth, barHeight);
    ctx.restore();
  }

  // Stranded with 0 fuel (see the map-screen countdown in idleLoop) drops
  // you straight into a boss fight instead of a dead end — winning refuels
  // you enough to keep moving.
  function startAmbush() {
    const node = currentNodeId && mapData ? mapData.byId[currentNodeId] : null;
    const layer = node ? node.layer : 0;
    const ambushNode = {
      id: 'AMBUSH', layer, type: 'hostile', duration: BOSS_EVADE_TIME + 10,
      difficultyMultiplier: node ? node.difficultyMultiplier : 1,
      disables: null, isPlanet: false, isDepot: false, visited: false,
    };
    enterSector(ambushNode, { isAmbush: true });
  }

  function resolveAmbush() {
    expeditionFuel = Math.min(FUEL_MAX, expeditionFuel + AMBUSH_FUEL_REWARD);
    expeditionScore += score;
    score = 0;
    spawnFloatingText(ship.x, ship.y - 40, `+${AMBUSH_FUEL_REWARD} FUEL`, '#ffb347', { size: 16, decay: 0.9 });
    showMapScreen();
  }

  // ---------- Ship ----------
  const SHIP_VISUAL_SCALE = 1.5; // art is drawn bigger than the hitbox so it reads better without changing difficulty
  const ship = {
    x: 0,
    y: 0,
    width: 38,
    height: 50,
    speed: 0, // px/s, derived from PLAYER_CROSS_TIME
    speedY: 0, // px/s, vertical movement within the bottom-third zone
    vx: 0,
    vy: 0,
    yMin: 0,
    yMax: 0,
    trail: [],
  };

  const KEYBOARD_ACCEL_TIME = 0.07; // seconds to reach full speed, gives held keys a little weight

  function resetShip() {
    ship.x = width / 2;
    ship.yMax = height - PLAYER_BOTTOM_MARGIN;
    ship.yMin = ship.yMax - height * PLAYER_VERTICAL_ZONE;
    ship.y = ship.yMax;
    ship.speed = width / PLAYER_CROSS_TIME;
    ship.speedY = (ship.yMax - ship.yMin) / (PLAYER_CROSS_TIME * 0.6);
    ship.vx = 0;
    ship.vy = 0;
    ship.trail = [];
  }

  // ---------- Hazards ----------
  const DEBRIS_IMAGE_SRCS = [
    'assets/debris-asteroid-1.png',
    'assets/debris-asteroid-2.png',
    'assets/debris-asteroid-3.png',
  ];
  const debrisImages = DEBRIS_IMAGE_SRCS.map((src) => {
    const img = new Image();
    img.src = src;
    return img;
  });
  const debrisWallImage = new Image();
  debrisWallImage.src = 'assets/debris-wall.png';

  let hazards = [];
  let spawnTimer = 0;
  let nextWallAt = 0;

  function isDestructible(hz) {
    return !hz.isWall && hz.size <= DESTRUCTIBLE_MAX_SIZE;
  }

  // ---------- Enemies (Hostile sectors only) ----------
  // No fairness gate on these: if you fly into Hostile territory unarmed,
  // their fire is just one more thing to dodge, same as debris.
  const ENEMY_TYPES = {
    drone: {
      name: 'DRONE', hp: 1, speed: 70, size: 22, color: '#ff2e6c', src: 'assets/enemy-drone.png',
      fireInterval: 2.0, telegraph: 0.3, pattern: 'straight', fireStyle: 'aimed1',
      scrap: [4, 6],
    },
    weaver: {
      name: 'WEAVER', hp: 2, speed: 90, size: 24, color: '#ff4d8a', src: 'assets/enemy-weaver.png',
      fireInterval: 2.4, telegraph: 0.25, pattern: 'weave', fireStyle: 'burst2',
      driftAmp: 55, driftFreq: 1.8,
      scrap: [7, 10],
    },
    cruiser: {
      name: 'CRUISER', hp: 4, speed: 45, size: 38, color: '#c81155', src: 'assets/enemy-cruiser.png',
      fireInterval: 3.0, telegraph: 0.4, pattern: 'straight', fireStyle: 'spread3',
      scrap: [20, 30],
    },
    // The boss reuses the cruiser's art at a bigger scale — no dedicated
    // boss sprite yet. speed:0 + the 'weave' pattern (already handles
    // horizontal sway) means it just hovers in place instead of falling.
    boss: {
      name: 'PIRATE BOSS', hp: 16, speed: 0, size: 64, color: '#ff0044', src: 'assets/enemy-cruiser.png',
      fireInterval: 1.7, telegraph: 0.35, pattern: 'weave', fireStyle: 'spread3',
      driftAmp: 70, driftFreq: 0.7,
      scrap: [60, 90],
    },
  };
  const ENEMY_PROJECTILE_SPEED = 260;

  const enemyImages = {};
  for (const [type, def] of Object.entries(ENEMY_TYPES)) {
    if (!def.src) continue;
    const img = new Image();
    img.src = def.src;
    enemyImages[type] = img;
  }

  let enemies = [];
  let enemyProjectiles = [];
  let enemySpawnTimer = 0;
  let expeditionScrap = 0;

  function pickEnemyType() {
    const roll = Math.random();
    if (roll < 0.55) return 'drone';
    if (roll < 0.9) return 'weaver';
    return 'cruiser';
  }

  function spawnEnemy(elapsedT) {
    const type = pickEnemyType();
    const def = ENEMY_TYPES[type];
    const x = Math.random() * (width - def.size) + def.size / 2;
    enemies.push({
      type,
      x,
      baseX: x,
      y: -def.size,
      w: def.size,
      h: def.size,
      hp: def.hp,
      spawnTime: elapsedT,
      cooldown: 1 + Math.random() * def.fireInterval, // stagger first shot
      fireState: 'idle',
      telegraphTimer: 0,
      countedNearMiss: false,
    });
  }

  function fireEnemyWeapon(enemy) {
    const def = ENEMY_TYPES[enemy.type];
    const dx = ship.x - enemy.x;
    const dy = ship.y - enemy.y;
    const baseAngle = Math.atan2(dy, dx);
    playEnemyShot();

    const spawnProjectile = (angle) => {
      enemyProjectiles.push({
        x: enemy.x,
        y: enemy.y,
        vx: Math.cos(angle) * ENEMY_PROJECTILE_SPEED,
        vy: Math.sin(angle) * ENEMY_PROJECTILE_SPEED,
        size: 8,
        color: def.color,
      });
    };

    if (def.fireStyle === 'aimed1') {
      spawnProjectile(baseAngle);
    } else if (def.fireStyle === 'burst2') {
      spawnProjectile(baseAngle - 0.12);
      spawnProjectile(baseAngle + 0.12);
    } else if (def.fireStyle === 'spread3') {
      spawnProjectile(baseAngle - 0.3);
      spawnProjectile(baseAngle);
      spawnProjectile(baseAngle + 0.3);
    }
  }

  // Any player weapon hitting an enemy routes through here. A kill drops a
  // physical Scrap pickup rather than crediting instantly — you still have
  // to fly through it, which is the point (reward sits in the danger zone).
  function damageEnemy(index, amount, hitColor) {
    const enemy = enemies[index];
    if (!enemy) return;
    enemy.hp -= amount;
    if (enemy.hp <= 0) {
      const def = ENEMY_TYPES[enemy.type];
      spawnImpactBurst(enemy.x, enemy.y, def.color, 20);
      triggerShake(3, 0.15);
      playEnemyKill();
      const [minS, maxS] = def.scrap;
      const scrapAmount = Math.round(minS + Math.random() * (maxS - minS));
      spawnScrapPickup(enemy.x, enemy.y, scrapAmount);
      enemies.splice(index, 1);
    } else {
      spawnImpactBurst(enemy.x, enemy.y, hitColor, 6);
    }
  }

  function updateEnemies(dt) {
    if (!sectorHasEnemies) return;
    const shipBox = shipHitbox();

    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      const def = ENEMY_TYPES[enemy.type];
      enemy.y += def.speed * dt;
      if (def.pattern === 'weave') {
        enemy.x = enemy.baseX + Math.sin((elapsed - enemy.spawnTime) * def.driftFreq) * def.driftAmp;
        enemy.x = Math.max(enemy.w / 2, Math.min(width - enemy.w / 2, enemy.x));
      }

      // Fire sequencing: idle -> telegraph (brief warning flash) -> fire -> idle
      if (enemy.fireState === 'idle') {
        enemy.cooldown -= dt;
        if (enemy.cooldown <= 0 && enemy.y > 20 && enemy.y < height - 100) {
          enemy.fireState = 'telegraph';
          enemy.telegraphTimer = def.telegraph;
        }
      } else if (enemy.fireState === 'telegraph') {
        enemy.telegraphTimer -= dt;
        if (enemy.telegraphTimer <= 0) {
          fireEnemyWeapon(enemy);
          enemy.fireState = 'idle';
          enemy.cooldown = def.fireInterval;
        }
      }

      const enemyBox = { x: enemy.x - enemy.w / 2, y: enemy.y - enemy.h / 2, w: enemy.w, h: enemy.h };

      if (rectsOverlap(shipBox, enemyBox)) {
        if (handlePlayerHit()) {
          enemies.splice(i, 1);
          continue;
        }
        return;
      }

      if (!enemy.countedNearMiss && rectsNear(shipBox, enemyBox, NEAR_MISS_MARGIN)) {
        enemy.countedNearMiss = true;
        score += NEAR_MISS_BONUS;
        playNearMiss();
        spawnFloatingText(ship.x, ship.y - 30, `+${NEAR_MISS_BONUS}`, COLORS.ship, { size: 14 });
        registerNearMissForCombo();
      }

      if (enemy.y - enemy.h / 2 > height + 30) {
        enemies.splice(i, 1);
      }
    }

    if (!gate && !bossActive) {
      enemySpawnTimer -= dt;
      if (enemySpawnTimer <= 0) {
        spawnEnemy(elapsed);
        enemySpawnTimer = (3 + Math.random() * 3) / sectorDifficultyMultiplier;
      }
    }
  }

  function updateEnemyProjectiles(dt) {
    const shipBox = shipHitbox();
    for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
      const p = enemyProjectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      const box = { x: p.x - p.size / 2, y: p.y - p.size / 2, w: p.size, h: p.size };
      if (rectsOverlap(shipBox, box)) {
        enemyProjectiles.splice(i, 1);
        if (!handlePlayerHit()) return;
        continue;
      }

      if (p.y > height + 30 || p.y < -30 || p.x < -30 || p.x > width + 30) {
        enemyProjectiles.splice(i, 1);
      }
    }
  }

  function drawEnemies() {
    for (const enemy of enemies) {
      const def = ENEMY_TYPES[enemy.type];
      const flashing = enemy.fireState === 'telegraph';
      ctx.save();
      ctx.translate(enemy.x, enemy.y);
      ctx.shadowColor = def.color;
      ctx.shadowBlur = flashing ? 22 : 12;
      const s = enemy.w;

      const img = enemyImages[enemy.type];
      if (img && img.complete && img.naturalWidth > 0) {
        // Art is drawn nose-down (fired at the player from above) — flip
        // vertically so it faces the ship the way the fallback shapes did.
        const drawSize = s * 1.8;
        if (flashing) {
          ctx.globalAlpha = 0.85;
          ctx.filter = 'brightness(2.2)';
        }
        ctx.scale(1, -1);
        ctx.drawImage(img, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
        ctx.filter = 'none';
      } else {
        ctx.fillStyle = flashing ? '#ffffff' : def.color;
        if (enemy.type === 'weaver') {
          ctx.beginPath();
          ctx.moveTo(0, -s / 2);
          ctx.lineTo(s / 2, s / 4);
          ctx.lineTo(0, s / 6);
          ctx.lineTo(-s / 2, s / 4);
          ctx.closePath();
          ctx.fill();
        } else if (enemy.type === 'cruiser') {
          ctx.beginPath();
          const sides = 6;
          for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const px = Math.cos(angle) * (s / 2);
            const py = Math.sin(angle) * (s / 2);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -s / 2);
          ctx.lineTo(s / 2, 0);
          ctx.lineTo(0, s / 2);
          ctx.lineTo(-s / 2, 0);
          ctx.closePath();
          ctx.fill();
        }
      }
      ctx.restore();
    }
  }

  function drawEnemyProjectiles() {
    for (const p of enemyProjectiles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // ---------- Scrap pickups ----------
  // Physical collectibles, not instant credit: enemy kills and ambient spawns
  // both drop one of these, and you have to actually fly through it before it
  // falls off-screen. The reward sits in the same danger as everything else.
  const SCRAP_PICKUP_SPEED = 90;
  const SCRAP_PICKUP_SIZE = 16;
  const AMBIENT_SCRAP_RANGE = [3, 8];
  const CARGO_MAGNET_MIN_PULL = 140; // px/s at the edge of the magnet radius
  const CARGO_MAGNET_MAX_PULL = 420; // px/s right next to the ship
  const scrapPickupImage = new Image();
  scrapPickupImage.src = 'assets/scrap-pickup.png';

  let scrapPickups = [];
  let scrapSpawnTimer = 0;

  function scheduleNextAmbientScrap() {
    const [minT, maxT] = NODE_TYPES[currentSectorNode.type].scrapInterval;
    scrapSpawnTimer = minT + Math.random() * (maxT - minT);
  }

  function spawnScrapPickup(x, y, amount) {
    scrapPickups.push({
      x,
      baseX: x,
      y,
      amount,
      phase: Math.random() * Math.PI * 2,
    });
  }

  function updateScrapPickups(dt) {
    const shipBox = shipHitbox();
    for (let i = scrapPickups.length - 1; i >= 0; i--) {
      const p = scrapPickups[i];

      const dx = ship.x - p.x;
      const dy = ship.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (cargoMagnetRadius > 0 && dist < cargoMagnetRadius && dist > 0.01) {
        // Pull harder the closer it gets — reads as "snapping in" rather than a flat tow speed.
        const pullT = 1 - dist / cargoMagnetRadius;
        const pullSpeed = CARGO_MAGNET_MIN_PULL + pullT * CARGO_MAGNET_MAX_PULL;
        const step = Math.min(dist, pullSpeed * dt);
        p.x += (dx / dist) * step;
        p.y += (dy / dist) * step;
        p.baseX = p.x;
      } else {
        p.y += SCRAP_PICKUP_SPEED * dt;
        p.x = p.baseX + Math.sin(elapsed * 2 + p.phase) * 12; // gentle drift, easy to read as "collectible"
      }

      const box = { x: p.x - SCRAP_PICKUP_SIZE / 2, y: p.y - SCRAP_PICKUP_SIZE / 2, w: SCRAP_PICKUP_SIZE, h: SCRAP_PICKUP_SIZE };
      if (rectsOverlap(shipBox, box)) {
        expeditionScrap += p.amount;
        playScrapCollect();
        spawnImpactBurst(p.x, p.y, '#ff4d8a', 10);
        spawnFloatingText(p.x, p.y - 16, `+${p.amount} SCRAP`, '#ff4d8a', { size: 13, decay: 0.9 });
        scrapPickups.splice(i, 1);
        continue;
      }

      if (p.y - SCRAP_PICKUP_SIZE / 2 > height + 20) {
        scrapPickups.splice(i, 1); // missed it — lost for good
      }
    }

    scrapSpawnTimer -= dt;
    if (scrapSpawnTimer <= 0) {
      const amount = Math.round(AMBIENT_SCRAP_RANGE[0] + Math.random() * (AMBIENT_SCRAP_RANGE[1] - AMBIENT_SCRAP_RANGE[0]));
      spawnScrapPickup(Math.random() * (width - 40) + 20, -SCRAP_PICKUP_SIZE, amount);
      scheduleNextAmbientScrap();
    }
  }

  function drawScrapPickups() {
    for (const p of scrapPickups) {
      const pulse = 0.8 + Math.sin(elapsed * 6 + p.phase) * 0.2;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(elapsed * 1.5);
      const s = SCRAP_PICKUP_SIZE * pulse;
      if (scrapPickupImage.complete && scrapPickupImage.naturalWidth > 0) {
        // Shadow-blurring the photo's jagged alpha edge produces a stippled
        // halo, so fake the glow with a smooth radial gradient instead.
        const drawSize = s * 2.2;
        const glow = ctx.createRadialGradient(0, 0, drawSize * 0.15, 0, 0, drawSize * 0.6);
        glow.addColorStop(0, hexToRgba('#ff4d8a', 0.5));
        glow.addColorStop(1, hexToRgba('#ff4d8a', 0));
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, drawSize * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.drawImage(scrapPickupImage, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
      } else {
        ctx.shadowColor = '#ff4d8a';
        ctx.shadowBlur = 14 * pulse;
        ctx.fillStyle = '#ffb3d1';
        ctx.beginPath();
        ctx.moveTo(0, -s / 2);
        ctx.lineTo(s / 2, 0);
        ctx.lineTo(0, s / 2);
        ctx.lineTo(-s / 2, 0);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // ---------- Weapons (in-run) ----------
  // One entry per hardpoint slot the current ship has; null = empty hardpoint.
  let equippedWeapons = [];
  let weaponCooldowns = [];
  let playerProjectiles = [];
  let beamEffects = [];

  function resolveEquippedWeapons() {
    const shipDef = getShipDef(selectedShipId);
    const result = [];
    for (let i = 0; i < shipDef.weaponSlots; i++) {
      const id = selectedWeaponIds[i];
      const def = id ? getWeaponDef(id) : null;
      result.push(def && isWeaponOwned(def) ? def : null);
    }
    return result;
  }

  // ---------- Shields (in-run) ----------
  // Capacity, not a depleting consumable: owning N shield packs (capped by
  // the ship's shieldSlots) means you always start each sector at full
  // charge — a hit only costs you for the rest of THAT sector, then it
  // recharges on the next hyperspace jump. Owned stock is never spent.
  let hasShieldSlotEquipped = false;
  let runtimeShields = 0;

  // ---------- Cargo (in-run) ----------
  // Cargo slots aren't storage — they power a magnetic pickup field: Scrap
  // within radius accelerates toward the ship instead of falling straight.
  const CARGO_MAGNET_RADIUS_PER_SLOT = 45;
  let cargoMagnetRadius = 0;

  // ---------- Hull (expedition-only) ----------
  // Unlike shields, hull does NOT reset each sector — damage carries across
  // the whole expedition. The only way to heal it is a Depot repair (Credits).
  // It's the reserve behind shields: a hit only touches hull once shields
  // (if any) are already empty.
  let expeditionMaxHull = 1;
  let expeditionHull = 1;
  const HULL_REPAIR_PRICE = 150; // in-run credits (expeditionScore) per point

  function updateHullHud() {
    hullHudEl.textContent = `HULL ${expeditionHull}/${expeditionMaxHull}`;
    hullHudEl.classList.toggle('hull-critical', expeditionHull <= 1);
  }

  function updateShieldHud() {
    const show = hasShieldSlotEquipped && runtimeShields > 0;
    shieldHudEl.classList.toggle('hidden', !show);
    if (show) shieldHudEl.textContent = `SHIELD x${runtimeShields}`;
  }

  function consumeShieldOnHit() {
    if (!hasShieldSlotEquipped || runtimeShields <= 0) return false;
    runtimeShields -= 1;
    updateShieldHud();
    return true;
  }

  function consumeHullOnHit() {
    if (expeditionHull <= 0) return false;
    expeditionHull -= 1;
    updateHullHud();
    return true;
  }

  // Shared by any hazard/enemy/enemy-projectile hitting the ship. Returns
  // true if a shield absorbed it (caller should clear the offending object
  // and keep going), false if it was fatal (caller should stop immediately).
  function handlePlayerHit() {
    if (consumeShieldOnHit()) {
      playShieldBreak();
      triggerShake(6, 0.25);
      flashAlpha = Math.max(flashAlpha, 0.25);
      spawnImpactBurst(ship.x, ship.y, COLORS.ship, 16);
      spawnFloatingText(ship.x, ship.y - 30, 'SHIELD HIT', COLORS.ship, { size: 13, decay: 1 });
      return true;
    }
    if (consumeHullOnHit()) {
      playHullHit();
      triggerShake(10, 0.3);
      flashAlpha = Math.max(flashAlpha, 0.4);
      spawnImpactBurst(ship.x, ship.y, '#ff6b6b', 20);
      spawnFloatingText(ship.x, ship.y - 30, 'HULL DAMAGE', '#ff6b6b', { size: 13, decay: 1 });
      return true;
    }
    triggerDeath();
    return false;
  }

  function spawnImpactBurst(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 140;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 1.6 + Math.random() * 1.4,
        size: 2 + Math.random() * 2.5,
        color,
      });
    }
  }

  function destroyHazardIndex(i, color) {
    const hz = hazards[i];
    if (!hz) return;
    spawnImpactBurst(hz.x, hz.y, color, hz.isWall ? 4 : 10);
    hazards.splice(i, 1);
  }

  function fireWeapon(def) {
    shotsFiredThisExpedition++;
    if (def.type === 'particle') {
      playParticleShot();
      playerProjectiles.push({
        type: 'particle',
        x: ship.x,
        y: ship.y - ship.height / 2,
        speed: def.projectileSpeed,
        size: 6,
        glow: def.glow,
      });
    } else if (def.type === 'laser') {
      playLaserShot();
      const halfBeam = def.beamWidth / 2;

      // A large hazard or wall physically blocks the beam — only the gap
      // between it and the ship gets cleared, not what's behind it.
      let blockY = -Infinity;
      for (const hz of hazards) {
        if (isDestructible(hz) || hz.y > ship.y) continue;
        const halfW = hz.w / 2;
        if (Math.abs(hz.x - ship.x) <= halfBeam + halfW && hz.y > blockY) {
          blockY = hz.y;
        }
      }

      beamEffects.push({ x: ship.x, life: 1, width: def.beamWidth, glow: def.glow, blockY: Math.max(blockY, 0) });

      for (let i = hazards.length - 1; i >= 0; i--) {
        const hz = hazards[i];
        if (!isDestructible(hz)) continue;
        if (hz.y <= blockY) continue; // beam never reaches this far
        if (Math.abs(hz.x - ship.x) <= halfBeam + hz.size / 2) {
          destroyHazardIndex(i, def.glow);
        }
      }

      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (enemy.y <= blockY) continue;
        if (Math.abs(enemy.x - ship.x) <= halfBeam + enemy.w / 2) {
          damageEnemy(i, 1, def.glow);
        }
      }

      for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
        const p = enemyProjectiles[i];
        if (p.y <= blockY) continue;
        if (Math.abs(p.x - ship.x) <= halfBeam + p.size / 2) {
          enemyProjectiles.splice(i, 1);
        }
      }
    } else if (def.type === 'missile') {
      playMissileShot();
      playerProjectiles.push({
        type: 'missile',
        x: ship.x,
        y: ship.y - ship.height / 2,
        speed: def.projectileSpeed,
        radius: def.radius,
        size: 9,
        glow: def.glow,
      });
    } else if (def.type === 'railgun') {
      playRailgunShot();
      playerProjectiles.push({
        type: 'railgun',
        x: ship.x,
        y: ship.y - ship.height / 2,
        speed: def.projectileSpeed,
        size: 5,
        glow: def.glow,
      });
    }
  }

  function updateWeapons(dt) {
    for (let i = 0; i < equippedWeapons.length; i++) {
      const def = equippedWeapons[i];
      if (!def) continue;
      weaponCooldowns[i] -= dt;
      if (weaponCooldowns[i] <= 0) {
        fireWeapon(def);
        weaponCooldowns[i] = def.fireInterval;
      }
    }
  }

  function updatePlayerProjectiles(dt) {
    for (let i = playerProjectiles.length - 1; i >= 0; i--) {
      const p = playerProjectiles[i];
      p.y -= p.speed * dt;

      if (p.y < -30) {
        playerProjectiles.splice(i, 1);
        continue;
      }

      if (p.type === 'particle') {
        let hit = false;
        for (let j = hazards.length - 1; j >= 0; j--) {
          const hz = hazards[j];
          const box = hazardHitbox(hz);
          if (p.x < box.x || p.x > box.x + box.w || p.y < box.y || p.y > box.y + box.h) continue;
          // Every hazard blocks the shot — only destructible ones actually break.
          if (isDestructible(hz)) {
            destroyHazardIndex(j, p.glow);
          } else {
            spawnImpactBurst(p.x, p.y, p.glow, 4);
          }
          hit = true;
          break;
        }
        if (!hit) {
          for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (p.x < enemy.x - enemy.w / 2 || p.x > enemy.x + enemy.w / 2 ||
                p.y < enemy.y - enemy.h / 2 || p.y > enemy.y + enemy.h / 2) continue;
            damageEnemy(j, 1, p.glow);
            hit = true;
            break;
          }
        }
        if (!hit) {
          for (let j = enemyProjectiles.length - 1; j >= 0; j--) {
            const ep = enemyProjectiles[j];
            if (p.x < ep.x - ep.size / 2 || p.x > ep.x + ep.size / 2 ||
                p.y < ep.y - ep.size / 2 || p.y > ep.y + ep.size / 2) continue;
            spawnImpactBurst(p.x, p.y, p.glow, 4);
            enemyProjectiles.splice(j, 1);
            hit = true;
            break;
          }
        }
        if (hit) playerProjectiles.splice(i, 1);
      } else if (p.type === 'missile') {
        let impact = null;
        for (let j = hazards.length - 1; j >= 0; j--) {
          const hz = hazards[j];
          const box = hazardHitbox(hz);
          if (p.x < box.x || p.x > box.x + box.w || p.y < box.y || p.y > box.y + box.h) continue;
          impact = { x: hz.x, y: hz.y };
          break;
        }
        if (!impact) {
          for (const enemy of enemies) {
            if (p.x < enemy.x - enemy.w / 2 || p.x > enemy.x + enemy.w / 2 ||
                p.y < enemy.y - enemy.h / 2 || p.y > enemy.y + enemy.h / 2) continue;
            impact = { x: enemy.x, y: enemy.y };
            break;
          }
        }
        if (impact) {
          for (let j = hazards.length - 1; j >= 0; j--) {
            const hz = hazards[j];
            if (!isDestructible(hz)) continue;
            const dx = hz.x - impact.x;
            const dy = hz.y - impact.y;
            if (dx * dx + dy * dy <= p.radius * p.radius) {
              destroyHazardIndex(j, p.glow);
            }
          }
          for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            const dx = enemy.x - impact.x;
            const dy = enemy.y - impact.y;
            if (dx * dx + dy * dy <= p.radius * p.radius) {
              damageEnemy(j, 2, p.glow);
            }
          }
          for (let j = enemyProjectiles.length - 1; j >= 0; j--) {
            const ep = enemyProjectiles[j];
            const dx = ep.x - impact.x;
            const dy = ep.y - impact.y;
            if (dx * dx + dy * dy <= p.radius * p.radius) {
              enemyProjectiles.splice(j, 1);
            }
          }
          spawnImpactBurst(impact.x, impact.y, p.glow, 18);
          triggerShake(4, 0.2);
          playerProjectiles.splice(i, 1);
        }
      } else if (p.type === 'railgun') {
        // Pierces everything: destroys what it can, but is never stopped or
        // consumed by walls/oversized hazards the way other weapons are.
        for (let j = hazards.length - 1; j >= 0; j--) {
          const hz = hazards[j];
          if (!isDestructible(hz)) continue;
          const box = hazardHitbox(hz);
          if (p.x < box.x || p.x > box.x + box.w || p.y < box.y || p.y > box.y + box.h) continue;
          destroyHazardIndex(j, p.glow);
        }
        for (let j = enemies.length - 1; j >= 0; j--) {
          const enemy = enemies[j];
          if (p.x < enemy.x - enemy.w / 2 || p.x > enemy.x + enemy.w / 2 ||
              p.y < enemy.y - enemy.h / 2 || p.y > enemy.y + enemy.h / 2) continue;
          damageEnemy(j, 2, p.glow);
        }
        for (let j = enemyProjectiles.length - 1; j >= 0; j--) {
          const ep = enemyProjectiles[j];
          if (p.x < ep.x - ep.size / 2 || p.x > ep.x + ep.size / 2 ||
              p.y < ep.y - ep.size / 2 || p.y > ep.y + ep.size / 2) continue;
          enemyProjectiles.splice(j, 1);
        }
      }
    }

    for (let i = beamEffects.length - 1; i >= 0; i--) {
      beamEffects[i].life -= dt * 6;
      if (beamEffects[i].life <= 0) beamEffects.splice(i, 1);
    }
  }

  function drawPlayerProjectiles() {
    for (const p of playerProjectiles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.shadowColor = p.glow;
      ctx.shadowBlur = 10;
      ctx.fillStyle = p.glow;
      if (p.type === 'missile') {
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size / 2, p.size / 2);
        ctx.lineTo(-p.size / 2, p.size / 2);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'railgun') {
        ctx.shadowBlur = 16;
        ctx.fillRect(-p.size / 2, -26, p.size, 52); // long bright streak, reads as "unstoppable"
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawBeamEffects() {
    for (const b of beamEffects) {
      const top = b.blockY || 0;
      const beamHeight = ship.y - top;
      if (beamHeight <= 0) continue;
      ctx.save();
      ctx.globalAlpha = Math.max(b.life, 0);
      const grad = ctx.createLinearGradient(b.x, top, b.x, ship.y);
      grad.addColorStop(0, hexToRgba(b.glow, 0));
      grad.addColorStop(1, hexToRgba(b.glow, 0.8));
      ctx.fillStyle = grad;
      ctx.shadowColor = b.glow;
      ctx.shadowBlur = 16;
      ctx.fillRect(b.x - b.width / 2, top, b.width, beamHeight);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function ease(t) {
    return 1 - Math.pow(1 - t, 2);
  }

  function currentRampT(elapsedT) {
    return Math.min(elapsedT / sectorDuration, 1);
  }

  function currentFallSpeed(elapsedT) {
    const t = ease(currentRampT(elapsedT));
    const base = FALL_SPEED_START + (FALL_SPEED_END - FALL_SPEED_START) * t;
    return base * sectorDifficultyMultiplier * sectorSpeedMultiplier;
  }

  function currentSpawnInterval(elapsedT) {
    const t = ease(currentRampT(elapsedT));
    const base = SPAWN_INTERVAL_START + (SPAWN_INTERVAL_END - SPAWN_INTERVAL_START) * t;
    return base / (sectorDifficultyMultiplier * sectorSpawnMultiplier);
  }

  function scheduleNextWall(elapsedT) {
    nextWallAt = elapsedT + 8 + Math.random() * 6;
  }

  function makeHazard(x, size, speed, elapsedT, opts = {}) {
    const drift = opts.drift || false;
    const curveball = opts.curveball || false;
    return {
      x,
      baseX: x,
      y: -size,
      w: size,
      h: size,
      size,
      speed,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 2,
      isWall: false,
      imgIndex: Math.floor(Math.random() * debrisImages.length),
      drift,
      driftAmp: drift ? 25 + Math.random() * 35 : 0,
      driftFreq: drift ? 1 + Math.random() * 1.5 : 0,
      driftPhase: Math.random() * Math.PI * 2,
      spawnTime: elapsedT,
      countedNearMiss: false,
      curveball,
      curveballTriggerY: curveball ? height * (0.3 + Math.random() * 0.3) : null,
      curveballTriggered: false,
      curveballFlash: 0,
    };
  }

  function spawnCluster(elapsedT) {
    // A tight formation with one deliberate gap — a puzzle moment instead of noise.
    const count = 3 + (Math.random() < 0.5 ? 1 : 0);
    const size = 24 + Math.random() * 10;
    const gapWidth = ship.width * 3;
    const gapCenter = gapWidth / 2 + Math.random() * (width - gapWidth);
    const speed = currentFallSpeed(elapsedT);

    const slotWidth = (width - gapWidth) / count;
    let placed = 0;
    for (let i = 0; i <= count; i++) {
      const slotX = i * slotWidth;
      if (slotX + slotWidth / 2 > gapCenter - gapWidth / 2 && slotX + slotWidth / 2 < gapCenter + gapWidth / 2) {
        continue;
      }
      if (placed >= count) break;
      const x = Math.max(size / 2, Math.min(width - size / 2, slotX + slotWidth / 2));
      hazards.push(makeHazard(x, size, speed, elapsedT));
      placed++;
    }
  }

  function spawnHazard(elapsedT) {
    // Occasional wide "wall" hazard that forces a real lane choice.
    if (elapsedT >= nextWallAt && elapsedT > 6) {
      scheduleNextWall(elapsedT);
      const wallWidth = width * (0.4 + Math.random() * 0.2);
      const wallHeight = 26;
      const x = Math.random() * (width - wallWidth) + wallWidth / 2;
      hazards.push({
        x,
        baseX: x,
        y: -wallHeight,
        w: wallWidth,
        h: wallHeight,
        speed: currentFallSpeed(elapsedT) * 0.7,
        rotation: 0,
        rotSpeed: 0,
        isWall: true,
        drift: false,
        countedNearMiss: false,
        curveball: false,
      });
      return;
    }

    // Occasional tight cluster instead of a lone hazard.
    if (elapsedT > 10 && Math.random() < 0.12) {
      spawnCluster(elapsedT);
      return;
    }

    const t = currentRampT(elapsedT);
    const sizeRoll = Math.random();
    const minSize = 14 * sectorSizeMultiplier;
    const maxSize = 46 * sectorSizeMultiplier;
    const skewed = Math.pow(sizeRoll, 1 + t * 1.5);
    const size = minSize + skewed * (maxSize - minSize);

    const baseSpeed = currentFallSpeed(elapsedT);
    const sizeT = (size - minSize) / (maxSize - minSize);
    const speedMultiplier = 1.5 - sizeT * 0.8;
    const fallSpeed = baseSpeed * speedMultiplier;

    const x = Math.random() * (width - size) + size / 2;
    const drift = Math.random() < 0.3;
    // Rare curveball: a hazard that suddenly accelerates mid-flight, breaking the read-and-react rhythm.
    const curveball = elapsedT > 15 && Math.random() < 0.08;

    hazards.push(makeHazard(x, size, fallSpeed, elapsedT, { drift, curveball }));
  }

  // ---------- Idle attract-mode hazards (start screen only) ----------
  let idleHazards = [];
  let idleSpawnTimer = 0;

  function updateIdleHazards(dt) {
    idleSpawnTimer -= dt;
    if (idleSpawnTimer <= 0) {
      idleSpawnTimer = 2 + Math.random() * 2;
      const size = 16 + Math.random() * 24;
      idleHazards.push({
        x: Math.random() * width,
        y: -size,
        size,
        speed: 60 + Math.random() * 40,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 1.2,
      });
    }
    for (let i = idleHazards.length - 1; i >= 0; i--) {
      const hz = idleHazards[i];
      hz.y += hz.speed * dt;
      hz.rotation += hz.rotSpeed * dt;
      if (hz.y - hz.size / 2 > height + 20) idleHazards.splice(i, 1);
    }
  }

  function drawIdleHazards() {
    for (const hz of idleHazards) {
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.translate(hz.x, hz.y);
      ctx.rotate(hz.rotation);
      ctx.shadowColor = COLORS.hazard;
      ctx.shadowBlur = 10;
      ctx.fillStyle = COLORS.hazard;
      const s = hz.size;
      ctx.beginPath();
      const sides = 5;
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
        const px = Math.cos(angle) * (s / 2);
        const py = Math.sin(angle) * (s / 2);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  // ---------- Starfield ----------
  const starLayers = [];
  function initStars() {
    starLayers.length = 0;
    const layerConfigs = [
      { count: 60, speed: 15, size: 1, alpha: 0.4 },
      { count: 40, speed: 35, size: 1.5, alpha: 0.6 },
      { count: 25, speed: 65, size: 2, alpha: 0.9 },
    ];
    for (const cfg of layerConfigs) {
      const stars = [];
      for (let i = 0; i < cfg.count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
        });
      }
      starLayers.push({ ...cfg, stars });
    }
  }

  function updateStars(dt) {
    for (const layer of starLayers) {
      for (const s of layer.stars) {
        s.y += layer.speed * dt;
        if (s.y > height) {
          s.y = 0;
          s.x = Math.random() * width;
        }
      }
    }
  }

  function drawStars() {
    for (const layer of starLayers) {
      ctx.fillStyle = `rgba(232, 236, 245, ${layer.alpha})`;
      for (const s of layer.stars) {
        ctx.fillRect(s.x, s.y, layer.size, layer.size);
      }
    }
  }

  // ---------- Hyperspace jump (sector-clear transition) ----------
  function updateHyperspaceJump(dt) {
    const t = Math.min(jumpTimer / JUMP_ANIM_DURATION, 1);
    const speedBoost = 1 + t * t * 70;
    for (const layer of starLayers) {
      for (const s of layer.stars) {
        s.streakY = s.y;
        s.y += layer.speed * speedBoost * dt;
        if (s.y > height + 40) {
          s.y = -20;
          s.streakY = -20;
          s.x = Math.random() * width;
        }
      }
    }
    ship.y -= (250 + t * 1400) * dt;
    if (t > 0.55) {
      flashAlpha = Math.max(flashAlpha, (t - 0.55) / 0.45);
    }
  }

  function drawHyperspaceStars() {
    for (const layer of starLayers) {
      ctx.strokeStyle = `rgba(232, 236, 245, ${layer.alpha})`;
      ctx.lineWidth = layer.size;
      for (const s of layer.stars) {
        ctx.beginPath();
        ctx.moveTo(s.x, s.streakY !== undefined ? s.streakY : s.y);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
      }
    }
  }

  // ---------- Particles (death burst) ----------
  let particles = [];

  function spawnDeathBurst(x, y) {
    const count = 22;
    const shipGlow = getShipDef(selectedShipId).glow;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 220;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 1.2 + Math.random() * 1.2,
        size: 2 + Math.random() * 3,
        color: Math.random() < 0.5 ? shipGlow : COLORS.hazard,
      });
    }
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.life -= p.decay * dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  // ---------- Floating text (near-miss bonus, milestones, unlocks) ----------
  let floatingTexts = [];

  function spawnFloatingText(x, y, text, color, opts = {}) {
    floatingTexts.push({
      x,
      y,
      text,
      color,
      life: 1,
      decay: opts.decay || 1.4,
      vy: opts.vy !== undefined ? opts.vy : -40,
      size: opts.size || 16,
    });
  }

  function updateFloatingTexts(dt) {
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const f = floatingTexts[i];
      f.y += f.vy * dt;
      f.life -= f.decay * dt;
      if (f.life <= 0) floatingTexts.splice(i, 1);
    }
  }

  function drawFloatingTexts() {
    ctx.textAlign = 'center';
    for (const f of floatingTexts) {
      ctx.globalAlpha = Math.max(f.life, 0);
      ctx.fillStyle = f.color;
      ctx.font = `700 ${f.size}px 'Space Grotesk', sans-serif`;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
  }

  // ---------- Screen shake + flash ----------
  let shakeTime = 0;
  let shakeMagnitude = 0;
  let flashAlpha = 0;

  function triggerShake(magnitude, duration) {
    shakeMagnitude = magnitude;
    shakeTime = duration;
  }

  function updateShakeAndFlash(dt) {
    if (shakeTime > 0) shakeTime = Math.max(0, shakeTime - dt);
    if (flashAlpha > 0) flashAlpha = Math.max(0, flashAlpha - dt * 3.5);
  }

  // ---------- Flow state ----------
  let comboCount = 0;
  let comboTimer = 0;
  let flowTimer = 0;

  function registerNearMissForCombo() {
    comboCount += 1;
    comboTimer = COMBO_WINDOW;
    if (comboCount >= COMBO_TO_FLOW) {
      const wasActive = flowTimer > 0;
      flowTimer = FLOW_DURATION;
      comboCount = 0;
      if (!wasActive) {
        playFlowStart();
        spawnFloatingText(width / 2, height * 0.22, 'FLOW', COLORS.ship, { size: 26, decay: 1, vy: -15 });
      }
    }
  }

  function updateFlow(dt) {
    if (comboTimer > 0) {
      comboTimer -= dt;
      if (comboTimer <= 0) comboCount = 0;
    }
    if (flowTimer > 0) {
      flowTimer = Math.max(0, flowTimer - dt);
    }
  }

  // ---------- Score ----------
  let elapsed = 0;
  let score = 0;
  let bestScore = DriftStore.getHighScore();
  let milestonesHit = new Set();
  let pastBestAnnounced = false;
  bestScoreEl.textContent = `BEST ${bestScore.toFixed(1)}`;
  bankAmountEl.textContent = Math.floor(DriftStore.getBank());
  scrapAmountEl.textContent = DriftStore.getScrap();
  ensureSelectedShipValid();
  ensureSelectedWeaponValid();
  renderShipSelect();

  // ---------- Game flow ----------
  function enterSector(node, opts = {}) {
    // The very first pick (leaving the start screen) is free — every jump
    // after that between sectors costs fuel, Depots included. A pirate
    // ambush isn't a jump at all (you're stranded, not moving), so it skips
    // this entirely.
    const isFirstJump = currentNodeId === null;
    if (!opts.isAmbush && !isFirstJump) {
      if (expeditionFuel < FUEL_PER_JUMP) return; // renderMap() already blocks this click when out of fuel
      expeditionFuel -= FUEL_PER_JUMP;
    }

    if (node.type === 'depot') {
      currentSectorNode = node;
      node.visited = true;
      currentNodeId = node.id;
      showDepotScreen();
      return;
    }

    // Defensive: never launch a sector with an unowned ship, no matter how
    // selectedShipId got set (previewing a locked ship must never do this).
    ensureSelectedShipValid();
    ensureSelectedWeaponValid();
    previewShipId = null;
    ensureAudio();
    playStart();

    currentSectorNode = node;
    sectorDuration = node.duration;
    sectorDifficultyMultiplier = node.difficultyMultiplier;
    const typeDef = NODE_TYPES[node.type];
    sectorSpawnMultiplier = typeDef.spawnMult;
    sectorSpeedMultiplier = typeDef.speedMult;
    sectorSizeMultiplier = typeDef.sizeMult;
    sectorHasEnemies = node.type === 'hostile' || opts.isAmbush;
    // A Hostile sector's gate waits behind a boss fight; an ambush IS the
    // boss fight (no gate at all — winning just drops you back on the map).
    sectorHasBoss = node.type === 'hostile' && !opts.isAmbush;
    sectorHasGate = !node.isPlanet && !opts.isAmbush;
    gate = null;
    gateGraceTimer = 0;
    bossActive = false;
    bossObj = null;
    bossContext = null;
    sectorStartWallClock = performance.now();
    setMusicMood(opts.isAmbush || node.type === 'hostile' ? 'intense' : 'ambient');

    state = 'playing';
    dying = false;
    dyingTimer = 0;
    jumping = false;
    jumpTimer = 0;
    startScreen.classList.add('hidden');
    shipScreen.classList.add('hidden');
    mapScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    completeScreen.classList.add('hidden');
    elapsed = 0;
    score = 0;
    hazards = [];
    particles = [];
    floatingTexts = [];
    spawnTimer = 0;
    nextWallAt = 8 + Math.random() * 6;
    milestonesHit = new Set();
    pastBestAnnounced = false;
    shakeTime = 0;
    flashAlpha = 0;
    comboCount = 0;
    comboTimer = 0;
    flowTimer = 0;
    equippedWeapons = resolveEquippedWeapons();
    weaponCooldowns = equippedWeapons.map((def) => (def ? def.fireInterval * 0.5 : 0));
    playerProjectiles = [];
    beamEffects = [];
    enemies = [];
    enemyProjectiles = [];
    enemySpawnTimer = 2 + Math.random() * 2;
    scrapPickups = [];
    scheduleNextAmbientScrap();
    hasShieldSlotEquipped = getShipDef(selectedShipId).shieldSlots > 0;
    runtimeShields = hasShieldSlotEquipped
      ? Math.min(DriftStore.getShieldCount(), getShipDef(selectedShipId).shieldSlots)
      : 0;
    cargoMagnetRadius = getShipDef(selectedShipId).cargoSlots * CARGO_MAGNET_RADIUS_PER_SLOT;

    // Radiation knocks out one system for the whole sector, regardless of
    // what's equipped — announced up front so it never feels like a cheap
    // surprise death.
    currentSectorWarning = '';
    if (node.disables === 'shields') {
      hasShieldSlotEquipped = false;
      runtimeShields = 0;
      currentSectorWarning = 'SHIELDS OFFLINE';
    } else if (node.disables === 'weapons') {
      equippedWeapons = equippedWeapons.map(() => null);
      weaponCooldowns = equippedWeapons.map(() => 0);
      currentSectorWarning = 'WEAPONS OFFLINE';
    }
    updateShieldHud();
    resetShip();
    initStars();
    bestScoreEl.classList.remove('beating-best');

    if (opts.isAmbush) {
      spawnBoss(node.difficultyMultiplier);
      bossContext = 'ambush';
    }

    currentSectorLabel = opts.isAmbush
      ? 'PIRATE AMBUSH'
      : `SECTOR ${node.layer + 1}/${MAP_LAYERS + 1} · ${NODE_TYPES[node.type].label}`;
    sectorHudEl.classList.remove('hidden');
    updateSectorHud(sectorDuration);
    fuelHudEl.classList.remove('hidden');
    updateFuelHud();
    hullHudEl.classList.remove('hidden');
    updateHullHud();

    if (currentSectorWarning) {
      spawnFloatingText(width / 2, height * 0.3, currentSectorWarning, NODE_TYPES.radiation.color, {
        size: 22,
        decay: 0.6,
        vy: -12,
      });
    }

    lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  function updateSectorHud(timeLeft) {
    const warning = currentSectorWarning ? ` · ${currentSectorWarning}` : '';
    if (bossActive) {
      const remain = Math.max(0, Math.ceil(BOSS_EVADE_TIME - bossEvadeTimer));
      sectorHudEl.textContent = `${currentSectorLabel}${warning} · DESTROY IT OR EVADE (${remain}s)`;
      return;
    }
    if (gate) {
      sectorHudEl.textContent = `${currentSectorLabel}${warning} · FLY TO THE JUMP GATE`;
      return;
    }
    const m = Math.floor(timeLeft / 60);
    const s = Math.floor(timeLeft % 60);
    sectorHudEl.textContent = `${currentSectorLabel}${warning} · ${m}:${s.toString().padStart(2, '0')}`;
  }

  function triggerDeath() {
    dying = true;
    dyingTimer = 0;
    playDeath();
    triggerShake(10, DEATH_ANIM_DURATION);
    flashAlpha = 0.5;
    spawnDeathBurst(ship.x, ship.y);
  }

  function triggerHyperspaceJump() {
    jumping = true;
    jumpTimer = 0;
    hazards = [];
    playerProjectiles = [];
    beamEffects = [];
    enemies = [];
    enemyProjectiles = [];
    scrapPickups = []; // unclaimed pickups don't carry over into the jump
    playHyperspaceJump();
  }

  // Applies a total expedition score to persistent stats/currency. Shared by
  // failure, completion, and abandoning mid-map.
  function finalizeExpedition(total, isWin) {
    const isRecord = total > bestScore;
    if (isRecord) {
      bestScore = total;
      DriftStore.setHighScore(bestScore);
    }
    const earned = Math.floor(total);
    const newBank = DriftStore.addToBank(earned);
    DriftStore.addTotalEarned(earned);
    if (isWin) DriftStore.setHasReachedPlanet();
    const newScrap = DriftStore.addScrap(expeditionScrap);
    const scrapEarned = expeditionScrap;
    expeditionScrap = 0;
    bankAmountEl.textContent = Math.floor(newBank);
    return { isRecord, earned, newBank, scrapEarned, newScrap };
  }

  function finishExpeditionFailed() {
    state = 'gameOver';
    jumping = false;
    flashAlpha = 0;
    setMusicMood('menu');
    sectorHudEl.classList.add('hidden');
    fuelHudEl.classList.add('hidden');
    hullHudEl.classList.add('hidden');
    const total = expeditionScore + score;
    const { isRecord, earned, newBank, scrapEarned, newScrap } = finalizeExpedition(total, false);

    finalScoreEl.textContent = total.toFixed(1);
    goBestEl.textContent = bestScore.toFixed(1);
    newRecordEl.classList.toggle('hidden', !isRecord);
    bestScoreEl.textContent = `BEST ${bestScore.toFixed(1)}`;
    bestScoreEl.classList.remove('beating-best');
    goEarnedEl.textContent = earned;
    goBankTotalEl.textContent = Math.floor(newBank);
    goScrapLineEl.classList.toggle('hidden', scrapEarned <= 0);
    goScrapEarnedEl.textContent = scrapEarned;
    scrapAmountEl.textContent = newScrap;
    gameOverScreen.classList.remove('hidden');

    mapData = null;
    currentNodeId = null;
    expeditionScore = 0;

    ensureSelectedShipValid();
    ensureSelectedWeaponValid();
    renderShipSelect();
    requestAnimationFrame(idleLoop);
  }

  function finishExpeditionComplete() {
    state = 'gameOver';
    jumping = false;
    flashAlpha = 0;
    setMusicMood('menu');
    sectorHudEl.classList.add('hidden');
    fuelHudEl.classList.add('hidden');
    hullHudEl.classList.add('hidden');
    const bonus = Math.round(100 + expeditionScore * 0.25);
    const total = expeditionScore + bonus;
    const { isRecord, earned, newBank, scrapEarned, newScrap } = finalizeExpedition(total, true);

    completeScoreEl.textContent = total.toFixed(1);
    completeBonusEl.textContent = `+${bonus} completion bonus`;
    completeBestEl.textContent = bestScore.toFixed(1);
    completeEarnedEl.textContent = earned;
    completeBankTotalEl.textContent = Math.floor(newBank);
    completeScrapLineEl.classList.toggle('hidden', scrapEarned <= 0);
    completeScrapEarnedEl.textContent = scrapEarned;
    scrapAmountEl.textContent = newScrap;
    completeScreen.classList.remove('hidden');

    unlockAchievement('made_it_home');
    if (shotsFiredThisExpedition === 0) unlockAchievement('pacifist');
    if (selectedShipId === 'starter' && !boughtWeaponThisExpedition) unlockAchievement('scouts_honor');
    if (!hullRepairedThisExpedition) unlockAchievement('iron_hull');

    mapData = null;
    currentNodeId = null;
    expeditionScore = 0;

    ensureSelectedShipValid();
    ensureSelectedWeaponValid();
    renderShipSelect();
    requestAnimationFrame(idleLoop);
  }

  function finishSectorClear() {
    expeditionScore += score;
    currentSectorNode.visited = true;
    currentNodeId = currentSectorNode.id;
    if (currentSectorNode.isPlanet) {
      finishExpeditionComplete();
    } else {
      showMapScreen();
    }
  }

  function showShipScreen() {
    setMusicMood('menu');
    previewShipId = null;
    renderShipSelect();
    startScreen.classList.add('hidden');
    mapScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    completeScreen.classList.add('hidden');
    researchScreen.classList.add('hidden');
    depotScreen.classList.add('hidden');
    achievementsScreen.classList.add('hidden');
    shipScreen.classList.remove('hidden');
  }

  function showStartScreen() {
    setMusicMood('menu');
    shipScreen.classList.add('hidden');
    mapScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    completeScreen.classList.add('hidden');
    researchScreen.classList.add('hidden');
    depotScreen.classList.add('hidden');
    achievementsScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
  }

  function showResearchScreen() {
    setMusicMood('menu');
    shipScreen.classList.add('hidden');
    renderResearchList();
    researchScreen.classList.remove('hidden');
  }

  function renderAchievementsList() {
    achievementsListEl.innerHTML = '';
    const unlocked = new Set(DriftStore.getUnlockedAchievements());
    for (const def of ACHIEVEMENTS) {
      const isUnlocked = unlocked.has(def.id);
      const item = document.createElement('div');
      item.className = 'research-item achievement-item' + (isUnlocked ? ' owned' : ' locked');

      const info = document.createElement('div');
      info.className = 'research-item-info';
      const name = document.createElement('div');
      name.className = 'research-item-name';
      name.textContent = def.name;
      info.appendChild(name);
      const desc = document.createElement('div');
      desc.className = 'research-item-desc';
      desc.textContent = def.description;
      info.appendChild(desc);
      const status = document.createElement('div');
      status.className = 'research-item-status';
      status.textContent = isUnlocked ? 'UNLOCKED' : 'LOCKED';
      info.appendChild(status);
      item.appendChild(info);

      achievementsListEl.appendChild(item);
    }
  }

  function showAchievementsScreen() {
    setMusicMood('menu');
    startScreen.classList.add('hidden');
    renderAchievementsList();
    achievementsScreen.classList.remove('hidden');
  }

  // ---------- Depot (mid-expedition shop) ----------
  // Spends only THIS run's pools (expeditionScore as Credits, expeditionScrap
  // as Scrap) — never the persistent Bank/Scrap. Fuel here is the only way
  // to keep jumping; the weapon buy is an instant black-market unlock (no
  // research gate) that permanently grants the item via the normal owned-
  // weapon list, same as Research Lab purchases.
  const DEPOT_WEAPON_IDS = ['particle', 'laser', 'missile'];
  const DEPOT_SCRAP_PRICES = { particle: 10, laser: 18, missile: 25 };

  function buyDepotFuel() {
    if (expeditionFuel >= FUEL_MAX) return;
    if (expeditionScore < FUEL_PRICE) return;
    expeditionScore -= FUEL_PRICE;
    expeditionFuel += 1;
    playUnlock();
    renderDepotScreen();
  }

  function buyDepotRepair() {
    if (expeditionHull >= expeditionMaxHull) return;
    if (expeditionScore < HULL_REPAIR_PRICE) return;
    expeditionScore -= HULL_REPAIR_PRICE;
    expeditionHull += 1;
    hullRepairedThisExpedition = true;
    updateHullHud();
    playUnlock();
    renderDepotScreen();
  }

  function buyDepotWeapon(id) {
    const def = getWeaponDef(id);
    if (!def || isWeaponOwned(def)) return;
    const cost = DEPOT_SCRAP_PRICES[id];
    if (expeditionScrap < cost) return;
    expeditionScrap -= cost;
    boughtWeaponThisExpedition = true;
    DriftStore.grantWeapon(id);
    playUnlock();
    const shipDef = getShipDef(selectedShipId);
    const emptyIndex = selectedWeaponIds.findIndex((w) => !w);
    const slotIndex = emptyIndex >= 0 && emptyIndex < shipDef.weaponSlots ? emptyIndex : 0;
    assignWeaponSlot(slotIndex, id);
    renderDepotScreen();
  }

  function renderDepotScreen() {
    depotCreditsAmountEl.textContent = Math.floor(expeditionScore);
    depotScrapAmountEl.textContent = expeditionScrap;
    depotFuelCountEl.textContent = expeditionFuel;
    depotFuelCapEl.textContent = FUEL_MAX;

    const fuelFull = expeditionFuel >= FUEL_MAX;
    const fuelAffordable = expeditionScore >= FUEL_PRICE;
    depotBuyFuelBtn.disabled = fuelFull || !fuelAffordable;
    depotBuyFuelBtn.textContent = fuelFull ? 'TANK FULL' : `BUY +1 (${FUEL_PRICE} CREDITS)`;
    depotBuyFuelBtn.classList.toggle('disabled', fuelFull || !fuelAffordable);

    depotHullCurrentEl.textContent = expeditionHull;
    depotHullMaxEl.textContent = expeditionMaxHull;
    const hullFull = expeditionHull >= expeditionMaxHull;
    const hullAffordable = expeditionScore >= HULL_REPAIR_PRICE;
    depotRepairBtn.disabled = hullFull || !hullAffordable;
    depotRepairBtn.textContent = hullFull ? 'HULL INTACT' : `REPAIR +1 (${HULL_REPAIR_PRICE} CREDITS)`;
    depotRepairBtn.classList.toggle('disabled', hullFull || !hullAffordable);

    depotWeaponListEl.innerHTML = '';
    for (const id of DEPOT_WEAPON_IDS) {
      const def = getWeaponDef(id);
      const owned = isWeaponOwned(def);
      const cost = DEPOT_SCRAP_PRICES[id];

      const item = document.createElement('div');
      item.className = 'research-item' + (owned ? ' owned' : '');

      const info = document.createElement('div');
      info.className = 'research-item-info';
      const name = document.createElement('div');
      name.className = 'research-item-name';
      name.textContent = def.name;
      info.appendChild(name);
      const equipped = selectedWeaponIds.includes(id);
      const status = document.createElement('div');
      status.className = 'research-item-status';
      status.textContent = owned ? (equipped ? 'EQUIPPED' : 'OWNED (NOT EQUIPPED)') : `${cost} SCRAP`;
      info.appendChild(status);
      item.appendChild(info);

      if (!owned) {
        const btn = document.createElement('button');
        const affordable = expeditionScrap >= cost;
        btn.className = 'research-btn' + (affordable ? '' : ' disabled');
        btn.textContent = `BUY (${cost} SCRAP)`;
        btn.addEventListener('click', () => buyDepotWeapon(id));
        item.appendChild(btn);
      }

      depotWeaponListEl.appendChild(item);
    }
  }

  function showDepotScreen() {
    setMusicMood('menu');
    playStart();
    startScreen.classList.add('hidden');
    shipScreen.classList.add('hidden');
    mapScreen.classList.add('hidden');
    researchScreen.classList.add('hidden');
    renderDepotScreen();
    depotScreen.classList.remove('hidden');
    requestAnimationFrame(idleLoop);
  }

  depotBuyFuelBtn.addEventListener('click', buyDepotFuel);
  depotRepairBtn.addEventListener('click', buyDepotRepair);
  depotContinueBtn.addEventListener('click', showMapScreen);

  selectShipBtn.addEventListener('click', showShipScreen);
  shipBackBtn.addEventListener('click', showStartScreen);
  goShipBtn.addEventListener('click', showShipScreen);
  completeShipBtn.addEventListener('click', showShipScreen);
  playBtn.addEventListener('click', beginExpedition);
  restartBtn.addEventListener('click', beginExpedition);
  completeRestartBtn.addEventListener('click', beginExpedition);
  researchLabBtn.addEventListener('click', showResearchScreen);
  researchBackBtn.addEventListener('click', showShipScreen);
  achievementsBtn.addEventListener('click', showAchievementsScreen);
  achievementsBackBtn.addEventListener('click', showStartScreen);

  // ---------- Update ----------
  function updateShip(dt) {
    if (input.touchActive && input.touchX !== null) {
      const prevX = ship.x;
      const targetX = input.touchX;
      const dx = targetX - ship.x;
      const maxStep = ship.speed * dt;
      if (Math.abs(dx) <= maxStep) {
        ship.x = targetX;
      } else {
        ship.x += Math.sign(dx) * maxStep;
      }
      ship.vx = dt > 0 ? (ship.x - prevX) / dt : 0;

      if (input.touchY !== null) {
        const prevY = ship.y;
        const targetY = Math.min(ship.yMax, Math.max(ship.yMin, input.touchY));
        const dy = targetY - ship.y;
        const maxStepY = ship.speedY * dt;
        if (Math.abs(dy) <= maxStepY) {
          ship.y = targetY;
        } else {
          ship.y += Math.sign(dy) * maxStepY;
        }
        ship.vy = dt > 0 ? (ship.y - prevY) / dt : 0;
      }
    } else {
      let dir = 0;
      if (input.left) dir -= 1;
      if (input.right) dir += 1;
      const targetVel = dir * ship.speed;
      const lerpT = Math.min(1, dt / KEYBOARD_ACCEL_TIME);
      ship.vx += (targetVel - ship.vx) * lerpT;
      ship.x += ship.vx * dt;

      let dirY = 0;
      if (input.up) dirY -= 1;
      if (input.down) dirY += 1;
      const targetVelY = dirY * ship.speedY;
      ship.vy += (targetVelY - ship.vy) * lerpT;
      ship.y += ship.vy * dt;
    }

    const halfW = ship.width / 2;
    if (ship.x < halfW) {
      ship.x = halfW;
      ship.vx = 0;
    } else if (ship.x > width - halfW) {
      ship.x = width - halfW;
      ship.vx = 0;
    }

    if (ship.y < ship.yMin) {
      ship.y = ship.yMin;
      ship.vy = 0;
    } else if (ship.y > ship.yMax) {
      ship.y = ship.yMax;
      ship.vy = 0;
    }

    ship.trail.push({ x: ship.x, y: ship.y, life: 1 });
    if (ship.trail.length > 14) ship.trail.shift();
    for (const p of ship.trail) p.life -= dt * 4;
    ship.trail = ship.trail.filter((p) => p.life > 0);
  }

  function shipHitbox() {
    const w = ship.width * HITBOX_SHRINK;
    const h = ship.height * HITBOX_SHRINK;
    return {
      x: ship.x - w / 2,
      y: ship.y - h / 2,
      w,
      h,
    };
  }

  function hazardHitbox(hz) {
    const w = hz.w * HITBOX_SHRINK;
    const h = hz.h * HITBOX_SHRINK;
    return {
      x: hz.x - w / 2,
      y: hz.y - h / 2,
      w,
      h,
    };
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function rectsNear(a, b, margin) {
    return (
      a.x - margin < b.x + b.w &&
      a.x + a.w + margin > b.x &&
      a.y - margin < b.y + b.h &&
      a.y + a.h + margin > b.y
    );
  }

  function checkMilestones() {
    for (const m of MILESTONES) {
      if (elapsed >= m && !milestonesHit.has(m)) {
        milestonesHit.add(m);
        playMilestone();
        spawnFloatingText(width / 2, height * 0.3, `${m}s`, COLORS.accent, { size: 30, decay: 0.9, vy: -25 });
      }
    }
  }

  function checkPastBest() {
    if (!pastBestAnnounced && bestScore > 0 && score > bestScore) {
      pastBestAnnounced = true;
      bestScoreEl.classList.add('beating-best');
      spawnFloatingText(width - 70, 50, 'NEW BEST', COLORS.accent, { size: 14, decay: 0.7, vy: -20 });
    }
  }

  function applyCenterRiskBonus(dt) {
    const centerHalf = (width * CENTER_ZONE_RATIO) / 2;
    const centerX = width / 2;
    if (Math.abs(ship.x - centerX) <= centerHalf) {
      score += CENTER_BONUS_RATE * dt;
    }
  }

  function updateHazards(dt) {
    const flowActive = flowTimer > 0;
    const hazardDt = dt * (flowActive ? FLOW_TIME_SCALE : 1);
    const shipBox = shipHitbox();

    for (let i = hazards.length - 1; i >= 0; i--) {
      const hz = hazards[i];
      hz.y += hz.speed * hazardDt;
      hz.rotation += hz.rotSpeed * hazardDt;
      if (hz.drift) {
        hz.x = hz.baseX + Math.sin((elapsed - hz.spawnTime) * hz.driftFreq + hz.driftPhase) * hz.driftAmp;
      }
      if (hz.curveball && !hz.curveballTriggered && hz.y >= hz.curveballTriggerY) {
        hz.curveballTriggered = true;
        hz.speed *= 1.8;
        hz.curveballFlash = 1;
      }
      if (hz.curveballFlash > 0) {
        hz.curveballFlash = Math.max(0, hz.curveballFlash - dt * 3);
      }

      const hzBox = hazardHitbox(hz);

      if (rectsOverlap(shipBox, hzBox)) {
        if (handlePlayerHit()) {
          hazards.splice(i, 1); // clear the hazard that hit us so it doesn't instantly re-trigger
          continue;
        }
        return;
      }

      if (!hz.countedNearMiss && rectsNear(shipBox, hzBox, NEAR_MISS_MARGIN)) {
        hz.countedNearMiss = true;
        score += NEAR_MISS_BONUS;
        playNearMiss();
        spawnFloatingText(ship.x, ship.y - 30, `+${NEAR_MISS_BONUS}`, COLORS.ship, { size: 14 });
        registerNearMissForCombo();
      }

      if (hz.y - hz.h / 2 > height + 20) {
        hazards.splice(i, 1);
      }
    }

    if (!gate && !bossActive) {
      spawnTimer -= hazardDt * 1000;
      if (spawnTimer <= 0) {
        spawnHazard(elapsed);
        spawnTimer = currentSpawnInterval(elapsed);
      }
    }
  }

  // ---------- Draw ----------
  function drawShip() {
    const def = getShipDef(selectedShipId);
    const glow = def.glow;

    for (const p of ship.trail) {
      const alpha = Math.max(p.life, 0) * 0.35;
      ctx.beginPath();
      ctx.fillStyle = hexToRgba(glow, alpha);
      ctx.arc(p.x, p.y, (ship.width / 2) * (0.5 + p.life * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }

    const maxSpeed = ship.speed || 1;
    const speedT = Math.max(-1, Math.min(1, ship.vx / maxSpeed));
    const tilt = speedT * 0.35;
    const squash = 1 - Math.abs(speedT) * 0.12;
    const stretch = 1 + Math.abs(speedT) * 0.12;

    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(tilt);
    ctx.scale(squash, stretch);

    const img = shipImages[selectedShipId];
    if (img && img.complete && img.naturalWidth > 0) {
      // Drawn larger than the hitbox: the art already carries its own neon
      // outline glow, and a canvas shadow on top of that jagged alpha edge
      // just washes it out into a flat colored blob (same issue as debris).
      const drawW = ship.width * SHIP_VISUAL_SCALE;
      const drawH = ship.height * SHIP_VISUAL_SCALE;
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    } else {
      // Fallback while the image loads: simple glowing triangle.
      ctx.shadowColor = glow;
      ctx.shadowBlur = 16;
      ctx.fillStyle = glow;
      ctx.beginPath();
      const w = ship.width;
      const h = ship.height;
      ctx.moveTo(0, -h / 2);
      ctx.lineTo(w / 2, h / 2);
      ctx.lineTo(0, h / 4);
      ctx.lineTo(-w / 2, h / 2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    if (hasShieldSlotEquipped && runtimeShields > 0) {
      const pulse = 0.75 + Math.sin(elapsed * 5) * 0.25;
      ctx.save();
      ctx.translate(ship.x, ship.y);
      ctx.strokeStyle = hexToRgba(COLORS.ship, 0.5 * pulse);
      ctx.lineWidth = 2;
      ctx.shadowColor = COLORS.ship;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, (Math.max(ship.width, ship.height) * SHIP_VISUAL_SCALE) / 2 + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (cargoMagnetRadius > 0) {
      const pulse = 0.6 + Math.sin(elapsed * 3) * 0.2;
      ctx.save();
      ctx.translate(ship.x, ship.y);
      ctx.strokeStyle = hexToRgba('#ff4d8a', 0.25 * pulse);
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, cargoMagnetRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  }

  function hexToRgba(hex, alpha) {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function drawHazards() {
    for (const hz of hazards) {
      ctx.save();
      ctx.translate(hz.x, hz.y);
      ctx.rotate(hz.rotation);
      const flashing = hz.curveballFlash > 0;
      ctx.shadowColor = flashing ? '#ffffff' : COLORS.hazard;
      ctx.shadowBlur = flashing ? 24 : 12;
      ctx.fillStyle = flashing ? hexToRgba('#ffffff', 0.6 + 0.4 * hz.curveballFlash) : COLORS.hazard;

      if (hz.isWall) {
        if (debrisWallImage.complete && debrisWallImage.naturalWidth > 0) {
          // Same trick as the round debris: a smooth radial glow behind the
          // sprite instead of shadowBlur, which stipples badly on a
          // photographic image's jagged alpha edge.
          ctx.shadowBlur = 0;
          const glowColor = flashing ? '#ffffff' : COLORS.hazard;
          const glow = ctx.createRadialGradient(0, 0, hz.w * 0.15, 0, 0, hz.w * 0.55);
          glow.addColorStop(0, hexToRgba(glowColor, flashing ? 0.5 : 0.3));
          glow.addColorStop(1, hexToRgba(glowColor, 0));
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.ellipse(0, 0, hz.w * 0.55, hz.h * 3, 0, 0, Math.PI * 2);
          ctx.fill();

          // Drawn wider than the (thin) hitbox so the wreckage reads as a
          // real obstacle — the collision box stays exactly hz.w x hz.h.
          const drawW = hz.w * 1.15;
          const drawH = drawW * (debrisWallImage.naturalHeight / debrisWallImage.naturalWidth);
          if (flashing) {
            ctx.globalAlpha = 0.85;
            ctx.filter = 'brightness(2.2)';
          }
          ctx.drawImage(debrisWallImage, -drawW / 2, -drawH / 2, drawW, drawH);
          ctx.filter = 'none';
        } else {
          const r = 6;
          const w = hz.w;
          const h = hz.h;
          ctx.beginPath();
          ctx.moveTo(-w / 2 + r, -h / 2);
          ctx.arcTo(w / 2, -h / 2, w / 2, h / 2, r);
          ctx.arcTo(w / 2, h / 2, -w / 2, h / 2, r);
          ctx.arcTo(-w / 2, h / 2, -w / 2, -h / 2, r);
          ctx.arcTo(-w / 2, -h / 2, w / 2, -h / 2, r);
          ctx.closePath();
          ctx.fill();
        }
      } else {
        const img = debrisImages[hz.imgIndex];
        if (img && img.complete && img.naturalWidth > 0) {
          const s = hz.size * 1.3;
          // Shadow-blurring a photographic image's jagged alpha silhouette
          // produces a stippled halo instead of a clean glow, so fake the
          // glow with a smooth radial gradient behind the sprite instead.
          ctx.shadowBlur = 0;
          const glowColor = flashing ? '#ffffff' : COLORS.hazard;
          const glow = ctx.createRadialGradient(0, 0, s * 0.2, 0, 0, s * 0.75);
          glow.addColorStop(0, hexToRgba(glowColor, flashing ? 0.55 : 0.35));
          glow.addColorStop(1, hexToRgba(glowColor, 0));
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(0, 0, s * 0.75, 0, Math.PI * 2);
          ctx.fill();

          if (flashing) {
            ctx.globalAlpha = 0.85;
            ctx.filter = 'brightness(2.2)';
          }
          ctx.drawImage(img, -s / 2, -s / 2, s, s);
          ctx.filter = 'none';
        } else {
          const s = hz.size;
          ctx.beginPath();
          const sides = 5;
          for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
            const px = Math.cos(angle) * (s / 2);
            const py = Math.sin(angle) * (s / 2);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
        }
      }
      ctx.restore();
    }
  }

  function draw() {
    ctx.save();
    if (shakeTime > 0) {
      const falloff = shakeTime / DEATH_ANIM_DURATION;
      const mag = shakeMagnitude * falloff;
      ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
    }

    const rampT = ease(currentRampT(elapsed));

    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(-20, -20, width + 40, height + 40);
    if (jumping) {
      drawHyperspaceStars();
    } else {
      drawStars();
    }

    if (state !== 'playing') {
      drawIdleHazards();
    }

    if (state === 'playing') {
      if (!jumping) {
        // Subtle intensity shift as difficulty ramps: a faint warm vignette grows in.
        if (rampT > 0) {
          const grad = ctx.createRadialGradient(
            width / 2, height / 2, height * 0.2,
            width / 2, height / 2, height * 0.75
          );
          grad.addColorStop(0, 'rgba(0,0,0,0)');
          grad.addColorStop(1, `rgba(255, 60, 60, ${0.1 * rampT})`);
          ctx.fillStyle = grad;
          ctx.fillRect(-20, -20, width + 40, height + 40);
        }

        if (flowTimer > 0) {
          ctx.fillStyle = hexToRgba(COLORS.ship, 0.06);
          ctx.fillRect(-20, -20, width + 40, height + 40);
        }

        drawBeamEffects();
        drawGate();
        drawHazards();
        drawEnemies();
        drawEnemyProjectiles();
        drawScrapPickups();
        drawPlayerProjectiles();
        drawBossHealthBar();
      }
      if (!dying) drawShip();
      drawParticles();
      drawFloatingTexts();
    }
    ctx.restore();

    if (flashAlpha > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
      ctx.fillRect(0, 0, width, height);
    }
  }

  // ---------- Loop ----------
  let lastTime = performance.now();

  function loop(now) {
    if (state !== 'playing') return;
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    if (dying) {
      updateStars(dt);
      updateParticles(dt);
      updateFloatingTexts(dt);
      updateShakeAndFlash(dt);
      draw();

      dyingTimer += dt;
      if (dyingTimer >= DEATH_ANIM_DURATION) {
        finishExpeditionFailed();
        return;
      }
      requestAnimationFrame(loop);
      return;
    }

    if (jumping) {
      updateHyperspaceJump(dt);
      updateParticles(dt);
      updateFloatingTexts(dt);
      updateShakeAndFlash(dt);
      draw();

      jumpTimer += dt;
      if (jumpTimer >= JUMP_ANIM_DURATION) {
        finishSectorClear();
        return;
      }
      requestAnimationFrame(loop);
      return;
    }

    const flowActive = flowTimer > 0;

    elapsed += dt;
    score += dt * (flowActive ? FLOW_SCORE_MULT : 1); // base score: survival time (+ flow bonus)
    applyCenterRiskBonus(dt);

    // The sector timer is real wall-clock time, not simulated `elapsed`:
    // elapsed is built from per-frame deltas clamped for physics safety, and
    // requestAnimationFrame is throttled hard on a backgrounded tab, so it
    // can lag real time badly. Wall-clock is what actually keeps a sector to
    // its promised 1-3 minutes, and it's what the HUD countdown shows too.
    const timeLeft = Math.max(0, sectorDuration - (now - sectorStartWallClock) / 1000);

    if (sectorHasGate && !gate && !bossActive && timeLeft <= GATE_CLEAR_WINDOW) {
      if (sectorHasBoss) {
        spawnBoss(sectorDifficultyMultiplier);
        bossContext = 'hostile';
      } else {
        activateGate();
      }
    }

    updateStars(dt);
    updateShip(dt);
    updateWeapons(dt);
    updateHazards(dt);
    updateEnemies(dt);
    updateEnemyProjectiles(dt);
    updateScrapPickups(dt);
    updatePlayerProjectiles(dt);
    updateParticles(dt);
    updateFloatingTexts(dt);
    updateShakeAndFlash(dt);
    updateFlow(dt);
    checkMilestones();
    checkPastBest();
    if (gate) updateGate(dt);
    if (bossActive) updateBossEncounter(dt);

    scoreEl.textContent = score.toFixed(1);
    updateSectorHud(timeLeft);

    draw();

    if (jumping) {
      // updateGate() may have just triggered the jump this frame (flying
      // into the gate) — hand off to the jumping branch above on next call.
      requestAnimationFrame(loop);
      return;
    }

    if (state !== 'playing') {
      // updateBossEncounter() resolved an ambush this frame (straight back
      // to the map, no hyperspace animation) — showMapScreen() already
      // scheduled its own idleLoop.
      return;
    }

    if (!sectorHasGate) {
      // Depot never reaches this loop; an ambush (also gate-less) is fully
      // resolved by updateBossEncounter above, never by the clock; Planet
      // (0 duration) keeps the old instant-complete behavior.
      if (!bossActive && timeLeft <= 0) {
        triggerHyperspaceJump();
        requestAnimationFrame(loop);
        return;
      }
    } else if (timeLeft <= 0 && !bossActive) {
      // Safety net only — normally the player reaches the gate well before this.
      gateGraceTimer += dt;
      if (gateGraceTimer >= GATE_GRACE_PERIOD) {
        triggerHyperspaceJump();
        requestAnimationFrame(loop);
        return;
      }
    }

    if (state === 'playing') {
      requestAnimationFrame(loop);
    }
  }

  // Idle background render loop for start/game-over screens (starfield + attract mode).
  function idleLoop(now) {
    if (state !== 'playing') {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      updateStars(dt);
      if (state === 'start') updateIdleHazards(dt);

      // Stranded with 0 fuel: pirates close in after STRANDED_AMBUSH_DELAY
      // seconds instead of leaving the run at a dead end.
      if (state === 'map' && currentNodeId !== null && expeditionFuel < FUEL_PER_JUMP) {
        strandedTimer += dt;
        const remain = Math.max(0, Math.ceil(STRANDED_AMBUSH_DELAY - strandedTimer));
        mapFuelWarningEl.textContent = `OUT OF FUEL — PIRATES CLOSING IN (${remain}s)`;
        if (strandedTimer >= STRANDED_AMBUSH_DELAY) {
          strandedTimer = 0;
          startAmbush();
          return;
        }
      } else {
        strandedTimer = 0;
      }

      draw();
      requestAnimationFrame(idleLoop);
    }
  }

  initStars();
  resetShip();
  draw();
  requestAnimationFrame(idleLoop);
})();
