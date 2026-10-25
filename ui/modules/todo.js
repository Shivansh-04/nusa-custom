Nusa.register({
  id: 'todo',
  glow: ['#2fd06b', '#19b8c9'],
  mount(el) {
    const esc = Nusa.esc;
    let tasks = JSON.parse(localStorage.getItem('todo') || '[]');
    const save = () => localStorage.setItem('todo', JSON.stringify(tasks));

    el.innerHTML = `
      <div class="row"><span class="ttl">Tasks <b id="tc">0/0</b></span><button class="pill sm" id="tx" style="margin-left:auto">Clear done</button></div>
      <input id="ti" type="text" placeholder="Add a task and press Enter" maxlength="80" autocomplete="off">
      <div class="td-list" id="tl"></div>`;
    const inp = el.querySelector('#ti'), list = el.querySelector('#tl');

    function draw() {
      const done = tasks.filter((t) => t.done).length;
      el.querySelector('#tc').textContent = done + '/' + tasks.length;
      list.innerHTML = tasks.map((t) => `
        <div class="td-row ${t.done ? 'done' : ''}">
          <input type="checkbox" data-id="${t.id}" ${t.done ? 'checked' : ''}>
          <span>${esc(t.text)}</span>
          <b data-del="${t.id}">&times;</b>
        </div>`).join('');
    }

    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && inp.value.trim()) {
        tasks.unshift({ id: Date.now(), text: inp.value.trim(), done: false });
        inp.value = '';
        save(); draw();
      }
    });
    list.addEventListener('change', (e) => {
      const t = tasks.find((x) => x.id === +e.target.dataset.id);
      if (t) { t.done = e.target.checked; save(); draw(); }
    });
    list.addEventListener('click', (e) => {
      if (e.target.dataset.del) { tasks = tasks.filter((x) => x.id !== +e.target.dataset.del); save(); draw(); }
    });
    el.querySelector('#tx').onclick = () => { tasks = tasks.filter((t) => !t.done); save(); draw(); };

    Nusa.typing(inp);
    draw();
  }
});