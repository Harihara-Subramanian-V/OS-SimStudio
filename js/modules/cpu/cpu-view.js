/**
 * CPU Scheduling UI View & Interactive Controller
 */
import { runCpuSimulation } from './cpu-engine.js';
import { runMlfqSimulation } from './cpu-mlfq.js';
import { drawGanttChart } from './gantt-chart.js';
import { getProcessColor, showToast } from '../../utils.js';

let defaultProcesses = [
  { id: 'P1', arrivalTime: 0, burstTime: 5, priority: 2, color: getProcessColor(0) },
  { id: 'P2', arrivalTime: 1, burstTime: 3, priority: 1, color: getProcessColor(1) },
  { id: 'P3', arrivalTime: 2, burstTime: 8, priority: 4, color: getProcessColor(2) },
  { id: 'P4', arrivalTime: 3, burstTime: 6, priority: 3, color: getProcessColor(3) }
];

let currentAlgorithm = 'FCFS';
let currentQuantum = 2;
let lastSimulationResult = null;

export function initCpuView() {
  renderProcessTable();
  bindEvents();
  runCurrentSimulation();
}

export function getCurrentCpuResults() {
  return lastSimulationResult;
}

export function setCpuProcesses(newProcesses, algo = 'FCFS', quantum = 2) {
  defaultProcesses = newProcesses.map((p, idx) => ({
    ...p,
    color: p.color || getProcessColor(idx)
  }));
  currentAlgorithm = algo;
  currentQuantum = quantum;
  const algoSelect = document.getElementById('cpu-algo-select');
  if (algoSelect) algoSelect.value = algo;
  const qInput = document.getElementById('cpu-quantum-input');
  if (qInput) qInput.value = quantum;
  renderProcessTable();
  runCurrentSimulation();
}

function bindEvents() {
  const algoSelect = document.getElementById('cpu-algo-select');
  const qGroup = document.getElementById('cpu-quantum-group');
  const qInput = document.getElementById('cpu-quantum-input');
  const addBtn = document.getElementById('btn-add-process');
  const runBtn = document.getElementById('btn-run-cpu');

  algoSelect?.addEventListener('change', (e) => {
    currentAlgorithm = e.target.value;
    if (qGroup) qGroup.style.display = currentAlgorithm === 'RR' ? 'flex' : 'none';
    runCurrentSimulation();
  });

  qInput?.addEventListener('input', (e) => {
    currentQuantum = Math.max(1, parseInt(e.target.value) || 2);
    if (currentAlgorithm === 'RR') runCurrentSimulation();
  });

  addBtn?.addEventListener('click', () => {
    const nextNum = defaultProcesses.length + 1;
    defaultProcesses.push({
      id: `P${nextNum}`,
      arrivalTime: nextNum - 1,
      burstTime: Math.floor(Math.random() * 6) + 2,
      priority: Math.floor(Math.random() * 4) + 1,
      color: getProcessColor(nextNum - 1)
    });
    renderProcessTable();
    runCurrentSimulation();
    showToast(`Added process P${nextNum}`, 'success');
  });

  runBtn?.addEventListener('click', () => {
    runCurrentSimulation();
    showToast(`Simulation updated with ${currentAlgorithm}`, 'info');
  });
}

export function runCurrentSimulation() {
  if (currentAlgorithm === 'MLFQ') {
    lastSimulationResult = runMlfqSimulation(defaultProcesses);
  } else {
    lastSimulationResult = runCpuSimulation(defaultProcesses, currentAlgorithm, { quantum: currentQuantum });
  }
  drawGanttChart('cpu-gantt-canvas', lastSimulationResult.timeline);
  updateMetrics(lastSimulationResult);
  renderResultsTable(lastSimulationResult.stats);
}

function renderProcessTable() {
  const tbody = document.getElementById('cpu-process-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  defaultProcesses.forEach((p, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <span class="pid-tag">
          <span class="pid-color-dot" style="background:${p.color};"></span>
          ${p.id}
        </span>
      </td>
      <td><input type="number" min="0" max="99" class="form-input btn-sm" value="${p.arrivalTime}" data-idx="${idx}" data-field="arrivalTime" style="width:65px;"></td>
      <td><input type="number" min="1" max="99" class="form-input btn-sm" value="${p.burstTime}" data-idx="${idx}" data-field="burstTime" style="width:65px;"></td>
      <td><input type="number" min="1" max="99" class="form-input btn-sm" value="${p.priority}" data-idx="${idx}" data-field="priority" style="width:65px;"></td>
      <td>
        <button class="btn btn-danger btn-sm" data-idx="${idx}">✕</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('input').forEach(input => {
    input.addEventListener('change', (e) => {
      const idx = parseInt(e.target.dataset.idx);
      const field = e.target.dataset.field;
      defaultProcesses[idx][field] = Math.max(0, parseInt(e.target.value) || 0);
      runCurrentSimulation();
    });
  });

  tbody.querySelectorAll('.btn-danger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (defaultProcesses.length <= 1) {
        showToast('At least one process must exist', 'error');
        return;
      }
      const idx = parseInt(e.target.dataset.idx);
      defaultProcesses.splice(idx, 1);
      renderProcessTable();
      runCurrentSimulation();
    });
  });
}

function updateMetrics(result) {
  const waitEl = document.getElementById('cpu-metric-wait');
  const tatEl = document.getElementById('cpu-metric-tat');
  const utilEl = document.getElementById('cpu-metric-util');

  if (waitEl) waitEl.textContent = `${result.avgWait} ms`;
  if (tatEl) tatEl.textContent = `${result.avgTurnaround} ms`;
  if (utilEl) utilEl.textContent = `${result.cpuUtil || 100}%`;
}

function renderResultsTable(stats) {
  const tbody = document.getElementById('cpu-results-tbody');
  if (!tbody || !stats) return;
  tbody.innerHTML = '';

  stats.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="pid-tag"><span class="pid-color-dot" style="background:${p.color};"></span>${p.id}</span></td>
      <td>${p.arrivalTime}</td>
      <td>${p.burstTime}</td>
      <td>${p.startTime >= 0 ? p.startTime : 0}</td>
      <td>${p.completionTime}</td>
      <td>${p.turnaroundTime}</td>
      <td>${p.waitingTime}</td>
    `;
    tbody.appendChild(tr);
  });
}
