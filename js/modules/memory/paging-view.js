/**
 * Page Replacement UI View & Step Matrix Renderer
 */
import { runPageReplacement, testBeladyAnomaly } from './paging-engine.js';
import { showToast } from '../../utils.js';

let defaultRefString = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1];
let currentFrames = 3;
let currentAlgo = 'FIFO';
let lastPagingResult = null;

export function initPagingView() {
  bindEvents();
  runCurrentPaging();
}

export function getPagingResult() {
  return lastPagingResult;
}

export function setPagingPreset(refSeq, frames, algo = 'FIFO') {
  defaultRefString = refSeq;
  currentFrames = frames;
  currentAlgo = algo;
  const seqInp = document.getElementById('paging-ref-input');
  const frameInp = document.getElementById('paging-frames-select');
  const algoInp = document.getElementById('paging-algo-select');
  if (seqInp) seqInp.value = refSeq.join(', ');
  if (frameInp) frameInp.value = frames;
  if (algoInp) algoInp.value = algo;
  runCurrentPaging();
}

function bindEvents() {
  const seqInput = document.getElementById('paging-ref-input');
  const frameSelect = document.getElementById('paging-frames-select');
  const algoSelect = document.getElementById('paging-algo-select');
  const runBtn = document.getElementById('btn-run-paging');
  const beladyBtn = document.getElementById('btn-test-belady');

  runBtn?.addEventListener('click', () => {
    if (seqInput) {
      defaultRefString = seqInput.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      if (defaultRefString.length === 0) defaultRefString = [7, 0, 1, 2, 0, 3];
    }
    if (frameSelect) currentFrames = parseInt(frameSelect.value) || 3;
    if (algoSelect) currentAlgo = algoSelect.value;
    runCurrentPaging();
    showToast(`Simulated ${currentAlgo} with ${currentFrames} frames`, 'info');
  });

  beladyBtn?.addEventListener('click', () => {
    const res = testBeladyAnomaly();
    setPagingPreset(res.sequence, 3, 'FIFO');
    showToast(`Belady's Anomaly: 3 Frames = ${res.res3.totalFaults} faults, 4 Frames = ${res.res4.totalFaults} faults!`, 'info');
  });
}

export function runCurrentPaging() {
  lastPagingResult = runPageReplacement(defaultRefString, currentFrames, currentAlgo);
  renderReferenceStream(lastPagingResult);
  renderFramesMatrix(lastPagingResult);
  updateMetrics(lastPagingResult);
}

function renderReferenceStream(result) {
  const container = document.getElementById('ref-string-stream');
  if (!container) return;
  container.innerHTML = '';

  result.referenceString.forEach((page, idx) => {
    const step = result.steps[idx];
    const pill = document.createElement('div');
    pill.className = `ref-pill ${step?.isHit ? 'cell-hit' : 'cell-fault'}`;
    pill.textContent = page;
    pill.title = `Step ${idx + 1}: Page ${page} (${step?.isHit ? 'HIT' : 'FAULT'})`;
    container.appendChild(pill);
  });
}

function renderFramesMatrix(result) {
  const container = document.getElementById('frames-matrix-container');
  if (!container) return;

  const steps = result.steps;
  const frameCount = result.frameCount;

  let html = `<table class="frames-matrix"><thead><tr><th>Frame</th>`;
  steps.forEach((s, idx) => {
    html += `<th>#${idx + 1} (${s.page})</th>`;
  });
  html += `</tr></thead><tbody>`;

  for (let f = 0; f < frameCount; f++) {
    html += `<tr><td><strong>Frame ${f + 1}</strong></td>`;
    steps.forEach(s => {
      const val = s.framesSnapshot[f] !== undefined ? s.framesSnapshot[f] : '-';
      html += `<td>${val}</td>`;
    });
    html += `</tr>`;
  }

  // Hit / Fault row
  html += `<tr><td><strong>Status</strong></td>`;
  steps.forEach(s => {
    const cls = s.isHit ? 'cell-hit' : 'cell-fault';
    const text = s.isHit ? 'HIT' : 'FAULT';
    html += `<td class="${cls}">${text}</td>`;
  });
  html += `</tr></tbody></table>`;

  container.innerHTML = html;
}

function updateMetrics(result) {
  const faultsEl = document.getElementById('paging-metric-faults');
  const hitsEl = document.getElementById('paging-metric-hits');
  const ratioEl = document.getElementById('paging-metric-ratio');

  if (faultsEl) faultsEl.textContent = result.totalFaults;
  if (hitsEl) hitsEl.textContent = result.totalHits;
  if (ratioEl) ratioEl.textContent = `${result.faultRatio}%`;
}
