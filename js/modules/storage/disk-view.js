/**
 * Disk Scheduling UI View & Trajectory Canvas Renderer
 */
import { runDiskScheduling } from './disk-engine.js';
import { setupRetinaCanvas, showToast } from '../../utils.js';

let defaultQueue = [98, 183, 37, 122, 14, 124, 65, 67];
let defaultHead = 53;
let defaultAlgo = 'FCFS';
let defaultDirection = 'UP';
let lastDiskResult = null;

export function initDiskView() {
  bindEvents();
  runCurrentDisk();
}

export function getDiskResult() {
  return lastDiskResult;
}

export function setDiskPreset(queue, head, algo = 'FCFS', dir = 'UP') {
  defaultQueue = queue;
  defaultHead = head;
  defaultAlgo = algo;
  defaultDirection = dir;

  const qInp = document.getElementById('disk-queue-input');
  const hInp = document.getElementById('disk-head-input');
  const aInp = document.getElementById('disk-algo-select');
  const dInp = document.getElementById('disk-dir-select');

  if (qInp) qInp.value = queue.join(', ');
  if (hInp) hInp.value = head;
  if (aInp) aInp.value = algo;
  if (dInp) dInp.value = dir;

  runCurrentDisk();
}

function bindEvents() {
  const runBtn = document.getElementById('btn-run-disk');
  const qInp = document.getElementById('disk-queue-input');
  const hInp = document.getElementById('disk-head-input');
  const aInp = document.getElementById('disk-algo-select');
  const dInp = document.getElementById('disk-dir-select');

  runBtn?.addEventListener('click', () => {
    if (qInp) {
      defaultQueue = qInp.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      if (defaultQueue.length === 0) defaultQueue = [98, 183, 37, 122];
    }
    if (hInp) defaultHead = parseInt(hInp.value) || 53;
    if (aInp) defaultAlgo = aInp.value;
    if (dInp) defaultDirection = dInp.value;

    runCurrentDisk();
    showToast(`Disk simulated with ${defaultAlgo}`, 'info');
  });
}

export function runCurrentDisk() {
  lastDiskResult = runDiskScheduling(defaultQueue, defaultHead, defaultAlgo, {
    diskSize: 200,
    direction: defaultDirection
  });
  drawDiskChart(lastDiskResult);
  updateMetrics(lastDiskResult);
  renderSeekTable(lastDiskResult.seekSteps);
}

function drawDiskChart(result) {
  const canvas = document.getElementById('disk-chart-canvas');
  if (!canvas || !result || result.sequence.length === 0) return;
  const { ctx, width, height } = setupRetinaCanvas(canvas);

  ctx.clearRect(0, 0, width, height);
  const maxCyl = 199;
  const paddingX = 40;
  const paddingY = 30;
  const graphW = width - paddingX * 2;
  const graphH = height - paddingY * 2;
  const seq = result.sequence;

  // Draw background grid lines (0, 50, 100, 150, 199)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'center';

  [0, 50, 100, 150, 199].forEach(cyl => {
    const x = paddingX + (cyl / maxCyl) * graphW;
    ctx.beginPath();
    ctx.moveTo(x, paddingY);
    ctx.lineTo(x, height - paddingY);
    ctx.stroke();
    ctx.fillText(cyl.toString(), x, height - paddingY + 16);
  });

  // Plot Trajectory Line
  ctx.strokeStyle = '#00f2fe';
  ctx.lineWidth = 2.5;
  ctx.beginPath();

  seq.forEach((track, idx) => {
    const x = paddingX + (track / maxCyl) * graphW;
    const y = paddingY + (idx / (seq.length - 1 || 1)) * graphH;
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Draw Nodes
  seq.forEach((track, idx) => {
    const x = paddingX + (track / maxCyl) * graphW;
    const y = paddingY + (idx / (seq.length - 1 || 1)) * graphH;

    ctx.fillStyle = idx === 0 ? '#f59e0b' : '#38bdf8';
    ctx.beginPath();
    ctx.arc(x, y, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Text label above node
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillText(track.toString(), x, y - 8);
  });
}

function updateMetrics(result) {
  const totalEl = document.getElementById('disk-metric-total');
  const avgEl = document.getElementById('disk-metric-avg');
  const seqEl = document.getElementById('disk-metric-seq');

  if (totalEl) totalEl.textContent = `${result.totalHeadMovement} cyl`;
  if (avgEl) avgEl.textContent = `${result.avgSeek} cyl`;
  if (seqEl) seqEl.textContent = result.sequence.join(' → ');
}

function renderSeekTable(steps) {
  const tbody = document.getElementById('disk-seek-tbody');
  if (!tbody || !steps) return;
  tbody.innerHTML = '';

  steps.forEach((s, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>Step ${idx + 1}</td>
      <td>${s.from}</td>
      <td>${s.to}</td>
      <td><strong>${s.distance}</strong> cylinders</td>
    `;
    tbody.appendChild(tr);
  });
}
