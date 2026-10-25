const $ = (id) => document.getElementById(id);
const notch = $('notch');
const focusPanel = $('focusPanel');
const settingsPanel = $('settingsPanel');
const tabs = [...document.querySelectorAll('.tab')];
let expanded = false;
let settings = { focusMinutes: 25, breakMinutes: 5, launchAtLogin: false, alwaysOnTop: true };
let timerState = { running: false, mode: 'focus', remainingSeconds: 1500, endsAt: null };
let toastTimeout;

function showToast(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 2200);
}
function setExpanded(value) {
  expanded = Boolean(value);
  notch.dataset.expanded = String(expanded);
  $('collapseButton').textContent = expanded ? '⌃' : '⌄';
  $('collapseButton').title = expanded ? 'Collapse' : 'Expand';
  $('collapseButton').setAttribute('aria-label', expanded ? 'Collapse notch' : 'Expand notch');
  window.desktop.setExpanded(expanded).catch(() => showToast('Could not resize the notch.'));
}
function showPanel(name) {
  const showSettings = name === 'settings';
  focusPanel.hidden = showSettings;
  settingsPanel.hidden = !showSettings;
  tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.panel === name));
  if (showSettings) setExpanded(true);
}
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}
function renderTimer(state) {
  if (!state) return;
  timerState = state;
  const total = (state.mode === 'focus' ? settings.focusMinutes : settings.breakMinutes) * 60;
  $('timerTime').textContent = formatTime(state.remainingSeconds);
  $('timerMode').textContent = state.mode === 'focus' ? 'FOCUS SESSION' : 'BREAK SESSION';
  $('focusHeading').textContent = state.mode === 'focus' ? 'One thing at a time.' : 'Take a real break.';
  $('startPauseButton').textContent = state.running ? 'Pause timer' : (state.remainingSeconds < total ? 'Resume timer' : `Start ${state.mode}`);
  $('switchModeButton').textContent = state.mode === 'focus' ? 'Switch to break' : 'Switch to focus';
  $('sessionState').textContent = state.running ? 'In progress' : 'Not running';
  $('statusText').textContent = state.running ? (state.mode === 'focus' ? 'Focusing' : 'On break') : 'Ready';
  $('statusDot').style.background = state.running ? '#30d6ff' : '#4de0a1';
  const progress = total > 0 ? Math.max(0, Math.min(100, (state.remainingSeconds / total) * 100)) : 100;
  $('timerRing').style.setProperty('--progress', `${progress}%`);
}
function populateSettings(value) {
  settings = value;
  $('focusMinutes').value = value.focusMinutes;
  $('breakMinutes').value = value.breakMinutes;
  $('alwaysOnTop').checked = value.alwaysOnTop;
  $('launchAtLogin').checked = value.launchAtLogin;
  renderTimer(timerState);
}

$('brandButton').addEventListener('click', () => setExpanded(!expanded));
$('collapseButton').addEventListener('click', () => setExpanded(false));
$('settingsButton').addEventListener('click', () => showPanel('settings'));
tabs.forEach(tab => tab.addEventListener('click', () => showPanel(tab.dataset.panel)));
$('startPauseButton').addEventListener('click', async () => {
  const command = timerState.running ? 'pause' : 'start';
  renderTimer(await window.desktop.timerCommand(command));
});
$('resetButton').addEventListener('click', async () => renderTimer(await window.desktop.timerCommand('reset')));
$('switchModeButton').addEventListener('click', async () => renderTimer(await window.desktop.timerCommand('switch-mode')));
$('settingsForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const focusMinutes = Number($('focusMinutes').value);
  const breakMinutes = Number($('breakMinutes').value);
  if (!Number.isInteger(focusMinutes) || focusMinutes < 1 || focusMinutes > 180 || !Number.isInteger(breakMinutes) || breakMinutes < 1 || breakMinutes > 60) {
    $('settingsMessage').textContent = 'Focus must be 1–180 minutes; break must be 1–60.';
    return;
  }
  try {
    const saved = await window.desktop.saveSettings({
      focusMinutes,
      breakMinutes,
      alwaysOnTop: $('alwaysOnTop').checked,
      launchAtLogin: $('launchAtLogin').checked
    });
    settings = saved;
    $('settingsMessage').textContent = 'Settings saved.';
    if (!timerState.running) {
      renderTimer(await window.desktop.timerCommand('reset'));
    }
    showToast('Settings saved on this PC.');
  } catch (error) {
    $('settingsMessage').textContent = 'Could not save settings.';
  }
});

window.desktop.onExpandedChanged(value => {
  expanded = value;
  notch.dataset.expanded = String(value);
  $('collapseButton').textContent = value ? '⌃' : '⌄';
});
window.desktop.onOpenSettings(() => showPanel('settings'));
window.desktop.onTimerState(renderTimer);
window.desktop.onTimerFinished(({ mode }) => {
  showToast(mode === 'break' ? 'Focus session complete. Time for a break.' : 'Break complete. Ready to focus?');
  renderTimer(timerState);
});

(async function init() {
  try {
    const loaded = await window.desktop.getSettings();
    populateSettings(loaded);
    // The initial state is collapsed; the global shortcut or brand toggles it.
    notch.dataset.expanded = 'false';
    expanded = false;
    renderTimer(timerState);
  } catch {
    showToast('Settings could not be loaded; using defaults.');
  }
})();
