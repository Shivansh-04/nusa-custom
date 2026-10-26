Nusa.register({
  id: 'pomodoro',
  glow: ['#ff5a6e', '#ff9a3c'],
  mount(el) {
    const LEN = { focus: 25 * 60, break: 5 * 60 };
    const $ = (s) => el.querySelector(s);
    let mode = 'focus', left = LEN.focus, endAt = 0, timer = 0;

    el.innerHTML = `
      <div class="row pom">
        <div class="pring"><svg viewBox="0 0 70 70"><circle class="bg" cx="35" cy="35" r="30"/><circle class="fg" id="pf" cx="35" cy="35" r="30"/></svg><b id="pt">25:00</b></div>
        <div class="col">
          <div class="dim" id="pm">Focus time</div>
          <div class="row"><button class="pill red" id="pg">Start</button><button class="pill" id="pr">Reset</button><button class="pill" id="ps">Break</button></div>
        </div>
      </div>`;

    const fmt = (n) => String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');
    function beep() {
      try {
        const a = new AudioContext();
        [0, 0.25, 0.5].forEach((d) => {
          const o = a.createOscillator(), g = a.createGain();
          o.frequency.value = 880; g.gain.value = 0.08;
          o.connect(g); g.connect(a.destination);
          o.start(a.currentTime + d); o.stop(a.currentTime + d + 0.15);
        });
      } catch {}
    }
    function draw() {
      $('#pt').textContent = fmt(left);
      $('#pf').style.strokeDashoffset = 188.5 * (1 - left / LEN[mode]);
      $('#pm').textContent = mode === 'focus' ? 'Focus time' : 'Short break';
      $('#pg').textContent = timer ? 'Pause' : 'Start';
      $('#ps').textContent = mode === 'focus' ? 'Break' : 'Focus';
      Nusa.setLive(timer ? fmt(left) : null, (left / LEN[mode]) * 100);
    }
    function stop() { clearInterval(timer); timer = 0; }
    function tick() {
      left = Math.max(0, Math.round((endAt - Date.now()) / 1000));
      if (left === 0) { stop(); beep(); mode = mode === 'focus' ? 'break' : 'focus'; left = LEN[mode]; }
      draw();
    }
    function start() { endAt = Date.now() + left * 1000; timer = setInterval(tick, 500); }

    $('#pg').onclick = () => { if (timer) stop(); else start(); draw(); };
    $('#pr').onclick = () => { stop(); left = LEN[mode]; draw(); };
    $('#ps').onclick = () => { stop(); mode = mode === 'focus' ? 'break' : 'focus'; left = LEN[mode]; draw(); };
    draw();
  }
});