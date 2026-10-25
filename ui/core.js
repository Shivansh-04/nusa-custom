window.Nusa = (() => {
  const $ = (id) => document.getElementById(id);
  const notch = $('notch'), pagesEl = $('pages'), dotsEl = $('dots'), clk = $('clk');
  const mods = [];
  let cur = 0, open = false, over = false, holds = 0, closeT = 0, shrinkT = 0, live = null;
  const hidden = JSON.parse(localStorage.getItem('hidden') || '[]');
  const list = () => mods.filter((m) => !hidden.includes(m.id));

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function register(m) {
    m.el = document.createElement('section');
    m.el.className = 'page';
    pagesEl.appendChild(m.el);
    m.mount(m.el);
    mods.push(m);
  }

  function go(i) {
    const l = list();
    if (!l.length) return;
    i = (i + l.length) % l.length;
    const prev = l[cur];
    if (prev && prev !== l[i]) { prev.el.classList.remove('on'); if (prev.onHide) prev.onHide(); }
    cur = i;
    const g = l[i].glow || ['#19b8ff', '#7b4bff'];
    notch.style.setProperty('--g1', g[0]);
    notch.style.setProperty('--g2', g[1]);
    l[i].el.classList.add('on');
    if (l[i].onShow) l[i].onShow();
    [...dotsEl.children].forEach((d, k) => d.classList.toggle('on', k === i));
  }
  const goTo = (id) => { const k = list().findIndex((m) => m.id === id); if (k >= 0) go(k); };

  function setOpen(v) {
    if (v === open) return;
    open = v;
    clearTimeout(shrinkT);
    const m = list()[cur];
    if (v) {
      if (window.nusa) window.nusa.size(true);
      requestAnimationFrame(() => { notch.dataset.open = '1'; });
      if (m && m.onShow) m.onShow();
    } else {
      notch.dataset.open = '0';
      shrinkT = setTimeout(() => { if (window.nusa) window.nusa.size(false); }, 650);
      if (m && m.onHide) m.onHide();
    }
  }

  function enter() { over = true; clearTimeout(closeT); closeT = 0; setOpen(true); }
  function leave() {
    over = false;
    if (holds || closeT) return;
    closeT = setTimeout(() => { closeT = 0; setOpen(false); }, 300);
  }
  function hold(v) {
    holds = Math.max(0, holds + (v ? 1 : -1));
    if (!holds && !over) leave();
  }

  // typing helper: makes the (normally non-focusable) window focusable while an input is used
  function typing(inp) {
    let on = false;
    inp.addEventListener('mousedown', () => {
      if (on) return;
      on = true; hold(true);
      if (window.nusa) window.nusa.focusable(true);
      setTimeout(() => inp.focus(), 60);
    });
    inp.addEventListener('blur', () => {
      if (!on) return;
      on = false;
      if (window.nusa) window.nusa.focusable(false);
      hold(false);
    });
    inp.addEventListener('keydown', (e) => { if (e.key === 'Escape') inp.blur(); });
  }

  // hover
  document.addEventListener('mousemove', (e) => {
    const r = notch.getBoundingClientRect();
    const inside = e.clientX >= r.left - 6 && e.clientX <= r.right + 6 && e.clientY <= r.bottom + 6;
    if (inside) enter(); else if (over) leave();
  });
  document.documentElement.addEventListener('mouseleave', leave);

  // files dragged in from Explorer open the shelf
  document.addEventListener('dragenter', (e) => {
    if (e.dataTransfer && e.dataTransfer.types.includes('Files')) { enter(); goTo('shelf'); }
  });
  document.addEventListener('dragover', (e) => e.preventDefault());
  document.addEventListener('dragleave', (e) => { if (!e.relatedTarget) leave(); });
  document.addEventListener('drop', (e) => { e.preventDefault(); enter(); });

  // navigation
  $('prev').onclick = () => go(cur - 1);
  $('next').onclick = () => go(cur + 1);
  dotsEl.addEventListener('click', (e) => { if (e.target.dataset.i != null) go(+e.target.dataset.i); });
  let wheelT = 0;
  notch.addEventListener('wheel', (e) => {
    const n = Date.now();
    if (n - wheelT < 350) return;
    wheelT = n;
    go(cur + (e.deltaY > 0 || e.deltaX > 0 ? 1 : -1));
  }, { passive: true });

  // closed-state clock (a module can temporarily replace it, e.g. the Pomodoro countdown)
  function tick() {
    const d = new Date();
    clk.textContent = live || String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }
  const setLive = (t) => { live = t; tick(); };
  const setPlaying = (v) => { notch.dataset.playing = v ? '1' : '0'; };

  const ringEl = $('ring');
if (navigator.getBattery) {
  navigator.getBattery().then((b) => {
    const u = () => ringEl.style.setProperty('--p', Math.round(b.level * 100) + '%');
    u(); b.addEventListener('levelchange', u);
  }).catch(() => {});
}

  function start() {
    dotsEl.innerHTML = list().map((_, i) => '<i data-i="' + i + '"></i>').join('');
    go(0);
    tick();
    setInterval(tick, 15000);
  }

  return { register, start, go, goTo, hold, typing, leave, setLive, setPlaying, esc, isOpen: () => open };
})();