/**
 * Dining Philosophers Simulation Controller
 */
import { showToast } from '../../utils.js';

let philosophers = [
  { id: 0, state: 'thinking', mealsEaten: 0, eatingTurns: 0 },
  { id: 1, state: 'thinking', mealsEaten: 0, eatingTurns: 0 },
  { id: 2, state: 'thinking', mealsEaten: 0, eatingTurns: 0 },
  { id: 3, state: 'thinking', mealsEaten: 0, eatingTurns: 0 },
  { id: 4, state: 'thinking', mealsEaten: 0, eatingTurns: 0 }
];

let chopsticks = [false, false, false, false, false];
let isSimulating = false;
let simInterval = null;
let deadlockMode = false;

export function initDiningPhilosophers() {
  renderTable();
  bindEvents();
}

function bindEvents() {
  const startBtn = document.getElementById('btn-start-dining');
  const toggleDeadlockBtn = document.getElementById('btn-toggle-deadlock');
  const resetBtn = document.getElementById('btn-reset-dining');

  startBtn?.addEventListener('click', () => {
    isSimulating = !isSimulating;
    if (isSimulating) {
      startBtn.textContent = 'Pause';
      startBtn.className = 'btn btn-danger btn-sm';
      simInterval = setInterval(stepDiningSimulation, 1000);
      showToast('Dining Philosophers simulation running', 'info');
    } else {
      startBtn.textContent = 'Start';
      startBtn.className = 'btn btn-primary btn-sm';
      clearInterval(simInterval);
    }
  });

  toggleDeadlockBtn?.addEventListener('click', () => {
    deadlockMode = !deadlockMode;
    toggleDeadlockBtn.textContent = deadlockMode ? 'Mode: Force Deadlock' : 'Mode: Safe (Asymmetric/Monitor)';
    toggleDeadlockBtn.className = deadlockMode ? 'btn btn-danger btn-sm' : 'btn btn-secondary btn-sm';
    
    // Clear stuck chopsticks if switching from deadlock to safe
    if (!deadlockMode) {
      chopsticks = [false, false, false, false, false];
      philosophers.forEach(p => p.state = 'thinking');
      renderTable();
      showToast('Deadlock cleared. Safe resource hierarchy active.', 'success');
    } else {
      showToast('Deadlock mode: Circular wait will trigger.', 'info');
    }
  });

  resetBtn?.addEventListener('click', () => resetDining());
}

function resetDining() {
  philosophers = philosophers.map(p => ({ ...p, state: 'thinking', mealsEaten: 0, eatingTurns: 0 }));
  chopsticks = [false, false, false, false, false];
  clearInterval(simInterval);
  isSimulating = false;
  const startBtn = document.getElementById('btn-start-dining');
  if (startBtn) {
    startBtn.textContent = 'Start';
    startBtn.className = 'btn btn-primary btn-sm';
  }
  renderTable();
  showToast('Dining table reset', 'info');
}

function stepDiningSimulation() {
  if (deadlockMode) {
    // Demonstrate circular wait deadlock: All philosophers hold their left chopstick simultaneously
    philosophers.forEach(p => {
      p.state = 'hungry';
      chopsticks[p.id] = true;
    });
    renderTable();
    showToast('DEADLOCK! Circular wait on all 5 chopsticks!', 'error');
    clearInterval(simInterval);
    isSimulating = false;
    const startBtn = document.getElementById('btn-start-dining');
    if (startBtn) startBtn.textContent = 'Start';
    return;
  }

  // Safe mode: Dijkstra / Tanenbaum Asymmetric Solution
  philosophers.forEach(p => {
    const firstFork = p.id % 2 === 0 ? p.id : (p.id + 1) % 5;
    const secondFork = p.id % 2 === 0 ? (p.id + 1) % 5 : p.id;

    if (p.state === 'thinking') {
      if (Math.random() > 0.35) p.state = 'hungry';
    } else if (p.state === 'hungry') {
      if (!chopsticks[firstFork] && !chopsticks[secondFork]) {
        chopsticks[firstFork] = true;
        chopsticks[secondFork] = true;
        p.state = 'eating';
        p.eatingTurns = 0;
        p.mealsEaten++;
      }
    } else if (p.state === 'eating') {
      p.eatingTurns++;
      if (p.eatingTurns >= 2) { // Eat for 2 cycles before releasing
        chopsticks[firstFork] = false;
        chopsticks[secondFork] = false;
        p.state = 'thinking';
        p.eatingTurns = 0;
      }
    }
  });

  renderTable();
}

function renderTable() {
  const arena = document.getElementById('philosophers-arena');
  if (!arena) return;
  arena.innerHTML = `<div class="table-center-dish">Spaghetti<br><span style="font-size:0.7rem; font-weight:normal;">Table</span></div>`;

  const radius = 110;
  const cx = 160;
  const cy = 160;

  philosophers.forEach((p, idx) => {
    const angle = (idx * 2 * Math.PI) / 5 - Math.PI / 2;
    const x = cx + radius * Math.cos(angle) - 26;
    const y = cy + radius * Math.sin(angle) - 26;

    const el = document.createElement('div');
    el.className = `philosopher-node ${p.state}`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.innerHTML = `P${idx}<span style="font-size:0.65rem;">(${p.mealsEaten})</span>`;
    arena.appendChild(el);
  });

  chopsticks.forEach((isHeld, idx) => {
    const angle = (idx * 2 * Math.PI) / 5 - Math.PI / 2 + Math.PI / 5;
    const x = cx + (radius * 0.62) * Math.cos(angle) - 7;
    const y = cy + (radius * 0.62) * Math.sin(angle) - 14;

    const chop = document.createElement('div');
    chop.className = `chopstick-node ${isHeld ? 'taken' : ''}`;
    chop.style.left = `${x}px`;
    chop.style.top = `${y}px`;
    chop.title = `Chopstick ${idx}: ${isHeld ? 'Held' : 'Free'}`;
    arena.appendChild(chop);
  });
}
