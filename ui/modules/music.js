Nusa.register({
  id: 'music',
  glow: ['#2d7bff', '#7b4bff'],
  mount(el) {
    const ICON = {
      prev: '<svg viewBox="0 0 24 24"><path d="M6 5h2v14H6zM20 5v14L9 12z"/></svg>',
      next: '<svg viewBox="0 0 24 24"><path d="M16 5h2v14h-2zM4 5v14l11-7z"/></svg>',
      play: '<svg viewBox="0 0 24 24"><path d="M7 5v14l12-7z"/></svg>',
      pause: '<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
      note: '<svg viewBox="0 0 24 24"><path d="M9 17V5l10-2v12a3 3 0 1 1-2-2.8V6.6L11 7.8V17a3 3 0 1 1-2-2.8z"/></svg>'
    };
    const $ = (s) => el.querySelector(s);
    el.innerHTML = `
      <div class="m-top">
        <div class="m-art" id="mart">${ICON.note}</div>
        <div class="m-meta">
          <div class="m-title" id="mt">Nothing playing</div>
          <div class="m-sub" id="ma">Play something in Spotify or your browser</div>
          <div class="m-ctl"><button data-c="prev">${ICON.prev}</button><button data-c="toggle" id="mpl">${ICON.play}</button><button data-c="next">${ICON.next}</button></div>
        </div>
      </div>
      <div class="m-bar"><span id="mp">0:00</span><div class="m-track"><i id="mf"></i></div><span id="md">0:00</span></div>`;

    const demo = { none: false, title: 'Demo track', artist: 'Browser preview', status: 'Playing', pos: 12, dur: 200 };
    const bridge = (window.nusa && window.nusa.media) || {
      get: async () => demo,
      on: () => {},
      cmd: (c) => { if (c === 'toggle') { demo.status = demo.status === 'Playing' ? 'Paused' : 'Playing'; apply({ ...demo }); } }
    };

    let s = { none: true }, t0 = 0, timer = 0, lastTitle = '';
    const fmt = (n) => Math.floor(n / 60) + ':' + String(Math.floor(n % 60)).padStart(2, '0');
    const playing = () => !s.none && s.status === 'Playing';

    // album-art tile: a color pair generated from the track title
    function tint(title) {
      let h = 0;
      for (const c of title) h = (h * 31 + c.charCodeAt(0)) % 360;
      const art = $('#mart');
      art.style.setProperty('--a1', `hsl(${h} 85% 60%)`);
      art.style.setProperty('--a2', `hsl(${(h + 50) % 360} 80% 48%)`);
    }

    function draw() {
      const title = s.none ? '' : (s.title || 'Unknown');
      $('#mt').textContent = s.none ? 'Nothing playing' : title;
      $('#ma').textContent = s.none ? 'Play something in Spotify or your browser' : (s.artist || s.app || '');
      if (title !== lastTitle) { lastTitle = title; tint(title); }
      $('#mpl').innerHTML = playing() ? ICON.pause : ICON.play;
      let pos = s.none ? 0 : s.pos + (playing() ? (performance.now() - t0) / 1000 : 0);
      if (s.dur) pos = Math.min(pos, s.dur);
      $('#mp').textContent = fmt(pos);
      $('#md').textContent = fmt(s.dur || 0);
      $('#mf').style.width = (s.dur ? (pos / s.dur) * 100 : 0) + '%';
    }
    function apply(x) { s = x; t0 = performance.now(); Nusa.setPlaying(playing()); draw(); }

    el.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (b && b.dataset.c) bridge.cmd(b.dataset.c);
    });
    bridge.on(apply);
    bridge.get().then((x) => { if (x) apply(x); });

    this.onShow = () => { draw(); clearInterval(timer); timer = setInterval(draw, 1000); };
    this.onHide = () => { clearInterval(timer); };
  }
});