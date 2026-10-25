Nusa.register({
  id: 'shelf',
  glow: ['#19b8ff', '#7b4bff'],
  mount(el) {
    const api = window.nusa && window.nusa.file;
    const esc = Nusa.esc;
    let items = [];
    el.innerHTML = `
      <div class="row"><span class="dim" id="sn">Shelf</span><button class="pill sm" id="sc" style="margin-left:auto">Clear</button></div>
      <div class="sh-list" id="sl"></div>`;
    const list = el.querySelector('#sl');
    const fmt = (b) => (b > 1e6 ? (b / 1e6).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1e3)) + ' KB');

    function save() { if (api) localStorage.setItem('shelf', JSON.stringify(items.map((i) => i.path))); }
    function draw() {
      el.querySelector('#sn').textContent = items.length ? items.length + (items.length > 1 ? ' items' : ' item') : 'Shelf';
      list.innerHTML = items.length
        ? items.map((it, i) => `
          <div class="sh-card" draggable="true" data-i="${i}" title="${esc(it.name)}">
            ${it.icon ? `<img draggable="false" src="${it.icon}">` : '<span class="sh-ph"></span>'}
            <span class="sh-name">${esc(it.name)}</span>
            <span class="dim sm">${it.dir ? 'Folder' : fmt(it.size)}</span>
            <b class="sh-x" data-x="${i}">&times;</b>
          </div>`).join('')
        : '<div class="sh-empty">Drop files here</div>';
    }
    async function addPath(p) {
      if (items.some((i) => i.path === p)) return;
      const info = await api.info(p);
      if (info) items.push(info);
    }

    document.addEventListener('drop', async (e) => {
      el.classList.remove('hot');
      const files = e.dataTransfer && e.dataTransfer.files;
      if (!files || !files.length) return;
      for (const f of files) {
        if (api) await addPath(api.pathFor(f));
        else items.push({ name: f.name, size: f.size, icon: null, path: f.name }); // browser preview
      }
      items = items.slice(-12);
      save(); draw();
    });
    document.addEventListener('dragenter', () => el.classList.add('hot'));
    document.addEventListener('dragleave', (e) => { if (!e.relatedTarget) el.classList.remove('hot'); });

    list.addEventListener('click', (e) => {
      if (e.target.dataset.x != null) { items.splice(+e.target.dataset.x, 1); save(); draw(); return; }
      const c = e.target.closest('.sh-card');
      if (c && api) api.open(items[+c.dataset.i].path);
    });
    list.addEventListener('dragstart', (e) => {
      const c = e.target.closest('.sh-card');
      if (!c || !api) return;
      e.preventDefault();
      api.drag(items[+c.dataset.i].path);
      setTimeout(Nusa.leave, 800);
    });
    el.querySelector('#sc').onclick = () => { items = []; save(); draw(); };

    (async () => {
      if (api) {
        for (const p of JSON.parse(localStorage.getItem('shelf') || '[]')) await addPath(p);
        save();
      }
      draw();
    })();
  }
});