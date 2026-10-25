Nusa.register({
  id: 'water',
  glow: ['#66dbff', '#2d6bff'],
  mount(el) {
    const $ = (s) => el.querySelector(s);
    const GOALS = [1500, 2000, 2500, 3000];
    const today = () => new Date().toLocaleDateString('en-CA');
    let st = JSON.parse(localStorage.getItem('water') || 'null');
    if (!st || st.date !== today()) st = { date: today(), log: [], goal: (st && st.goal) || 2000 };
    const save = () => localStorage.setItem('water', JSON.stringify(st));
    const total = () => st.log.reduce((a, b) => a + b, 0);

    el.innerHTML = `
  <div class="ttl">Water <b>Reminder</b></div>
  <div class="row"><b class="big" id="wn">0</b><span class="dim">/ <u id="wg" title="Click to change goal">2000</u> ml</span><span class="dim" id="wp" style="margin-left:auto"></span></div>
  <div class="bar"><i id="wf"></i></div>
  <div class="row"><button class="pill blue" data-add="250">+250</button><button class="pill blue" data-add="500">+500</button><button class="pill" id="wu">Undo</button></div>`;

    function draw() {
      const t = total();
      $('#wn').textContent = t;
      $('#wg').textContent = st.goal;
      $('#wf').style.width = Math.min(100, (t / st.goal) * 100) + '%';
      $('#wp').textContent = Math.round((t / st.goal) * 100) + '%';
    }
    el.addEventListener('click', (e) => {
      const t = e.target;
      if (t.dataset.add) st.log.push(+t.dataset.add);
      else if (t.id === 'wu') st.log.pop();
      else if (t.tagName === 'U') st.goal = GOALS[(GOALS.indexOf(st.goal) + 1) % GOALS.length];
      else return;
      save(); draw();
    });
    this.onShow = () => {
      if (st.date !== today()) { st = { date: today(), log: [], goal: st.goal }; save(); }
      draw();
    };
    draw();
  }
});