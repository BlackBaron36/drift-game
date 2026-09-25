// Persistence layer for Drift. Everything the game saves/loads goes through
// this module. Today it's all localStorage; when this game gets a backend
// (global leaderboard, server-authoritative currency, etc.) only this file
// should need to change to routes/API calls — call sites stay the same.
const DriftStore = (() => {
  const KEYS = {
    highScore: 'drift_high_score',
    selectedShip: 'drift_selected_ship',
    bank: 'drift_bank',
    totalEarned: 'drift_total_earned',
    ownedShips: 'drift_owned_ships',
    ownedWeapons: 'drift_owned_weapons',
    selectedWeapons: 'drift_selected_weapons',
    shieldCount: 'drift_shield_count',
    reachedPlanet: 'drift_reached_planet',
    scrap: 'drift_scrap',
    researchedItems: 'drift_researched_items',
    achievements: 'drift_achievements',
    bossKills: 'drift_boss_kills',
  };

  function getNumber(key, fallback) {
    const v = parseFloat(localStorage.getItem(key));
    return Number.isFinite(v) ? v : fallback;
  }

  function setNumber(key, value) {
    localStorage.setItem(key, value.toString());
  }

  function getList(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback.slice();
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : fallback.slice();
    } catch (e) {
      return fallback.slice();
    }
  }

  function setList(key, list) {
    localStorage.setItem(key, JSON.stringify(list));
  }

  return {
    // ---- High score ----
    getHighScore() {
      return getNumber(KEYS.highScore, 0);
    },
    setHighScore(value) {
      setNumber(KEYS.highScore, value);
    },

    // ---- Ship selection ----
    getSelectedShip() {
      return localStorage.getItem(KEYS.selectedShip) || 'starter';
    },
    setSelectedShip(id) {
      localStorage.setItem(KEYS.selectedShip, id);
    },

    // ---- Bank: spendable currency earned from runs ----
    getBank() {
      return getNumber(KEYS.bank, 0);
    },
    addToBank(amount) {
      const next = this.getBank() + Math.max(0, amount);
      setNumber(KEYS.bank, next);
      return next;
    },
    spendFromBank(amount) {
      const current = this.getBank();
      if (amount <= 0 || amount > current) return false;
      setNumber(KEYS.bank, current - amount);
      return true;
    },

    // ---- Lifetime earned: a stat, not currently spendable ----
    getTotalEarned() {
      return getNumber(KEYS.totalEarned, 0);
    },
    addTotalEarned(amount) {
      const next = this.getTotalEarned() + Math.max(0, amount);
      setNumber(KEYS.totalEarned, next);
      return next;
    },

    // ---- Ship ownership ----
    getOwnedShips() {
      return getList(KEYS.ownedShips, ['starter']);
    },
    ownsShip(id) {
      return this.getOwnedShips().includes(id);
    },
    // Attempts to buy a ship: deducts from bank and records ownership if
    // affordable and not already owned. Returns true on success.
    purchaseShip(id, price) {
      if (this.ownsShip(id)) return false;
      if (!this.spendFromBank(price)) return false;
      const owned = this.getOwnedShips();
      owned.push(id);
      setList(KEYS.ownedShips, owned);
      return true;
    },
    // Records ownership with no currency spend of its own — used after
    // buildResearchedItem() already handled the Scrap+Credits cost.
    grantShip(id) {
      if (this.ownsShip(id)) return false;
      const owned = this.getOwnedShips();
      owned.push(id);
      setList(KEYS.ownedShips, owned);
      return true;
    },

    // ---- Weapon ownership + selection ----
    getOwnedWeapons() {
      return getList(KEYS.ownedWeapons, []);
    },
    ownsWeapon(id) {
      return this.getOwnedWeapons().includes(id);
    },
    purchaseWeapon(id, price) {
      if (this.ownsWeapon(id)) return false;
      if (!this.spendFromBank(price)) return false;
      const owned = this.getOwnedWeapons();
      owned.push(id);
      setList(KEYS.ownedWeapons, owned);
      return true;
    },
    // Records ownership with no currency spend of its own — used after
    // buildResearchedItem() already handled the Scrap+Credits cost.
    grantWeapon(id) {
      if (this.ownsWeapon(id)) return false;
      const owned = this.getOwnedWeapons();
      owned.push(id);
      setList(KEYS.ownedWeapons, owned);
      return true;
    },
    // Array of weapon ids (or null) indexed by hardpoint slot. A ship only
    // reads as many entries as it has weaponSlots — extra entries are kept
    // around so a loadout isn't lost when you switch to a smaller ship.
    getSelectedWeapons() {
      return getList(KEYS.selectedWeapons, []);
    },
    setSelectedWeapons(list) {
      setList(KEYS.selectedWeapons, list);
    },

    // ---- Shields: consumable stock, bought before a run, spent on hits ----
    getShieldCount() {
      return Math.max(0, Math.floor(getNumber(KEYS.shieldCount, 0)));
    },
    // Buys one shield pack: deducts from bank and adds to stock if affordable.
    purchaseShieldPack(price) {
      if (!this.spendFromBank(price)) return false;
      setNumber(KEYS.shieldCount, this.getShieldCount() + 1);
      return true;
    },
    // Spends one shield from stock (used when a hit is absorbed). Returns
    // true if a shield was available and consumed.
    consumeShield() {
      const current = this.getShieldCount();
      if (current <= 0) return false;
      setNumber(KEYS.shieldCount, current - 1);
      return true;
    },

    // ---- Expedition milestones (for future ship-unlock gating) ----
    getHasReachedPlanet() {
      return localStorage.getItem(KEYS.reachedPlanet) === '1';
    },
    setHasReachedPlanet() {
      localStorage.setItem(KEYS.reachedPlanet, '1');
    },

    // ---- Scrap: earned from enemy kills/pickups in risky sectors, spent in the Research Lab ----
    getScrap() {
      return Math.max(0, Math.floor(getNumber(KEYS.scrap, 0)));
    },
    addScrap(amount) {
      const next = this.getScrap() + Math.max(0, Math.floor(amount));
      setNumber(KEYS.scrap, next);
      return next;
    },
    spendScrap(amount) {
      const current = this.getScrap();
      if (amount <= 0 || amount > current) return false;
      setNumber(KEYS.scrap, current - amount);
      return true;
    },

    // ---- Research Lab: two-gate unlock — research (Scrap) then build (Scrap+Credits) ----
    getResearchedItems() {
      return getList(KEYS.researchedItems, []);
    },
    isResearched(id) {
      return this.getResearchedItems().includes(id);
    },
    // Spends Scrap only to unlock the blueprint. Doesn't grant ownership.
    researchItem(id, scrapCost) {
      if (this.isResearched(id)) return false;
      if (!this.spendScrap(scrapCost)) return false;
      const researched = this.getResearchedItems();
      researched.push(id);
      setList(KEYS.researchedItems, researched);
      return true;
    },
    // Spends Scrap + Credits to actually build a researched item. Ownership
    // itself is recorded by the caller (it's just an owned weapon/ship after
    // this point) — this only handles the combined-currency spend.
    buildResearchedItem(id, scrapCost, creditCost) {
      if (!this.isResearched(id)) return false;
      if (this.getScrap() < scrapCost || this.getBank() < creditCost) return false;
      this.spendScrap(scrapCost);
      this.spendFromBank(creditCost);
      return true;
    },

    // ---- Achievements ----
    getUnlockedAchievements() {
      return getList(KEYS.achievements, []);
    },
    isAchievementUnlocked(id) {
      return this.getUnlockedAchievements().includes(id);
    },
    // Returns true only the first time this id unlocks (false if already had it).
    unlockAchievement(id) {
      if (this.isAchievementUnlocked(id)) return false;
      const unlocked = this.getUnlockedAchievements();
      unlocked.push(id);
      setList(KEYS.achievements, unlocked);
      return true;
    },

    // ---- Boss kills: lifetime counter, independent of any one expedition ----
    getBossKillCount() {
      return Math.max(0, Math.floor(getNumber(KEYS.bossKills, 0)));
    },
    addBossKill() {
      const next = this.getBossKillCount() + 1;
      setNumber(KEYS.bossKills, next);
      return next;
    },
  };
})();
