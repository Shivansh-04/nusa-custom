const notch = document.getElementById('notch');
const clk = document.getElementById('clk');
let closeTimer = 0;

function setOpen(v) { notch.dataset.open = v ? '1' : '0'; }

// hover detection (works while the window is click-through)
document.addEventListener('mousemove', (e) => {
  const r = notch.getBoundingClientRect();
  const pad = 6;
  const inside = e.clientX >= r.left - pad && e.clientX <= r.right + pad &&
                 e.clientY >= 0 && e.clientY <= r.bottom + pad;
  window.nusa?.mouse(inside);
  if (inside) { clearTimeout(closeTimer); setOpen(true); }
  else if (notch.dataset.open === '1') {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => setOpen(false), 250);
  }
});

function tick() {
  const d = new Date();
  clk.textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}
tick(); setInterval(tick, 20000);