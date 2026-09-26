// =============================================================================
// ARRANQUE Y GAME LOOP (requestAnimationFrame + deltaTime)
// INPUT → UPDATE (física, colisiones, IA, lógica, lógica educativa, animación, cámara) → RENDER → UI
// =============================================================================
(function main() {
  const canvas = document.getElementById('game');
  const g = canvas.getContext('2d');
  g.imageSmoothingEnabled = false;
  Game.canvas = canvas; Game.g = g;
  const fatal = document.getElementById('fatal');
  let errors = 0;
  window.addEventListener('error', e => {
    errors++;
    console.error(e.error || e.message);
    if (fatal && errors < 4) { fatal.style.display = 'block'; fatal.textContent = 'Error: ' + (e.message || e) + '\n(El juego intentará continuar.)'; setTimeout(() => { fatal.style.display = 'none'; }, 6000); }
  });
  function resize() {
    const sw = window.innerWidth, sh = window.innerHeight;
    let s = Math.min(sw / W, sh / H);
    if (s >= 2) s = Math.floor(s);
    canvas.style.width = Math.floor(W * s) + 'px';
    canvas.style.height = Math.floor(H * s) + 'px';
  }
  window.addEventListener('resize', resize);
  resize();
  // capa de scanlines precalculada
  const sc = makeCanvas(W, H);
  sc.g.fillStyle = 'rgba(0,0,0,0.13)';
  for (let y = 0; y < H; y += 2) sc.g.fillRect(0, y, W, 1);
  Game.scan = sc.c;

  Font.init();
  Sprites.init();
  Input.init(canvas);
  Settings.load();
  AudioSys.onCaption = t => UI.caption(t);
  if (!PROG) PROG = newProgress();
  Game.push(new BootState());
  canvas.focus();

  let last = performance.now();
  function loop(now) {
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 1 / 30) dt = 1 / 30;
    if (dt < 0) dt = 0;
    try {
      Input.pollPad();
      Game.update(dt);
      Game.render();
    } catch (e) {
      console.error(e);
      errors++;
      if (fatal && errors < 6) { fatal.style.display = 'block'; fatal.textContent = 'Error: ' + e.message + '\n(El juego intentará continuar.)'; }
    }
    Input.endFrame();
    Perf.tick(dt);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  document.addEventListener('visibilitychange', () => { if (document.hidden && Game.top() instanceof GameplayState) Game.push(new PauseState(Game.top())); });
  // Gancho de depuración/pruebas automatizadas (sólo lectura y atajos de QA)
  window.__BAQ = { Game, get PROG() { return PROG; }, LEVELS: () => LEVELS, QM, LearningModel, Settings, SaveManager, Input };
})();
