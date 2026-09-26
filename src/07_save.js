// =============================================================================
// GUARDADO (localStorage) Y AJUSTES. Si localStorage está bloqueado, se juega sin guardar.
// =============================================================================
const SaveManager = {
  KEY: 'byteArchitectQuestSave', SKEY: 'byteArchitectQuestSettings',
  available: (() => { try { const k = '__baq_test'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return true; } catch (e) { return false; } })(),
  save(prog) {
    if (!this.available || !prog || prog.teacher) return false;
    try {
      prog.timestamp = Date.now();
      prog.version = SAVE_VERSION;
      localStorage.setItem(this.KEY, JSON.stringify(prog));
      return true;
    } catch (e) { console.warn('No se pudo guardar', e); return false; }
  },
  load() {
    if (!this.available) return null;
    try {
      const s = localStorage.getItem(this.KEY);
      if (!s) return null;
      const d = JSON.parse(s);
      if (!d || typeof d !== 'object') return null;
      return migrateProgress(d);
    } catch (e) { console.warn('Guardado corrupto', e); return null; }
  },
  has() { if (!this.available) return false; try { return !!localStorage.getItem(this.KEY); } catch (e) { return false; } },
  clear() { if (!this.available) return; try { localStorage.removeItem(this.KEY); } catch (e) { /* nada */ } },
  saveSettings(s) { if (!this.available) return; try { localStorage.setItem(this.SKEY, JSON.stringify(s)); } catch (e) { /* nada */ } },
  loadSettings() { if (!this.available) return null; try { return JSON.parse(localStorage.getItem(this.SKEY) || 'null'); } catch (e) { return null; } }
};

function newProgress() {
  return {
    version: SAVE_VERSION, timestamp: Date.now(),
    level: 0, checkpoint: null,
    xp: 0, playerLevel: 1,
    abilities: [], selAbility: 0,
    learning: LearningModel.blank(),
    codex: [], blueprint: ['cpu'], bpTabs: ['hw'],
    quests: {}, choices: {}, flags: {},
    fragments: [], letters: [], historic: [], achievements: [],
    stats: { time: 0, hints: 0, answered: 0, correct: 0, firstTry: 0, failed: [], deaths: 0, enemies: 0, reviews: 0, levelTimes: {}, noHintStreak: 0, calibrated: 0 },
    usedChallenges: [], seenDialogues: [], trust: { nexo: 0, nul: 0 },
    hp: 5, maxHp: 5, teacher: false
  };
}
function migrateProgress(d) {
  const base = newProgress();
  for (const k in base) if (d[k] === undefined) d[k] = base[k];
  for (const k in base.stats) if (d.stats[k] === undefined) d.stats[k] = base.stats[k];
  d.learning = LearningModel.fix(d.learning);
  return d;
}

const Settings = {
  data: {
    master: 8, music: 6, sfx: 8, captions: true, textSpeed: 1, contrast: false, reduceShake: false, reduceFlash: false,
    scanlines: true, eduDifficulty: 1, assist: false, showFps: false, bindings: null, touch: 'auto'
  },
  load() {
    const s = SaveManager.loadSettings();
    if (s) Object.assign(this.data, s);
    if (this.data.bindings) {
      for (const k in this.data.bindings) if (Array.isArray(this.data.bindings[k])) Input.bind[k] = this.data.bindings[k];
    }
    this.apply();
  },
  save() { this.data.bindings = Input.bind; SaveManager.saveSettings(this.data); this.apply(); },
  apply() {
    AudioSys.setVolumes({ master: this.data.master / 10, music: this.data.music / 10, sfx: this.data.sfx / 10 });
  },
  get textCps() { return [22, 45, 90, 9999][this.data.textSpeed]; }
};
