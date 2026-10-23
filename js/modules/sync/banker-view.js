/**
 * Banker's Algorithm UI View & Matrix Controller
 */
import { runSafetyCheck, requestResources, calculateNeedMatrix } from './banker-engine.js';
import { showToast } from '../../utils.js';

let allocMatrix = [
  [0, 1, 0], [2, 0, 0], [3, 0, 2], [2, 1, 1], [0, 0, 2]
];

let maxMatrix = [
  [7, 5, 3], [3, 2, 2], [9, 0, 2], [2, 2, 2], [4, 3, 3]
];

let availableVector = [3, 3, 2];

export function initBankerView() {
  renderMatrices();
  bindBankerEvents();
  executeSafetyCheck();
}

export function getBankerState() {
  return { allocMatrix, maxMatrix, availableVector, needMatrix: calculateNeedMatrix(maxMatrix, allocMatrix) };
}

export function setBankerPreset(newAlloc, newMax, newAvail) {
  allocMatrix = newAlloc;
  maxMatrix = newMax;
  availableVector = newAvail;
  renderMatrices();
  executeSafetyCheck();
}

function bindBankerEvents() {
  document.getElementById('btn-run-banker')?.addEventListener('click', () => executeSafetyCheck());

  document.getElementById('btn-test-request')?.addEventListener('click', () => {
    readInputs(); // Always read latest user-edited inputs first!
    const pIdx = parseInt(document.getElementById('banker-req-pid')?.value || '0');
    const rA = parseInt(document.getElementById('req-r0')?.value || '0');
    const rB = parseInt(document.getElementById('req-r1')?.value || '0');
    const rC = parseInt(document.getElementById('req-r2')?.value || '0');

    const result = requestResources(pIdx, [rA, rB, rC], allocMatrix, maxMatrix, availableVector);
    const resultBox = document.getElementById('banker-req-result');
    if (result.success) {
      allocMatrix = result.newAlloc;
      availableVector = result.newAvail;
      renderMatrices();
      executeSafetyCheck();
      if (resultBox) {
        resultBox.className = 'badge badge-running';
        resultBox.textContent = result.reason;
      }
      showToast(result.reason, 'success');
    } else {
      if (resultBox) {
        resultBox.className = 'badge badge-waiting';
        resultBox.textContent = result.reason;
      }
      showToast(result.reason, 'error');
    }
  });
}

export function executeSafetyCheck() {
  readInputs();

  // Validate Allocation <= Max invariant
  let hasInvariantViolation = false;
  for (let i = 0; i < allocMatrix.length; i++) {
    for (let j = 0; j < 3; j++) {
      if (allocMatrix[i][j] > maxMatrix[i][j]) {
        hasInvariantViolation = true;
      }
    }
  }

  const safety = runSafetyCheck(allocMatrix, maxMatrix, availableVector);
  renderNeedMatrix(safety.needMatrix);

  const statusEl = document.getElementById('banker-safe-status');
  const seqEl = document.getElementById('banker-safe-sequence');
  const traceEl = document.getElementById('banker-trace-steps');

  if (hasInvariantViolation) {
    if (statusEl) {
      statusEl.textContent = 'INVALID STATE: Allocation exceeds Max claim!';
      statusEl.className = 'badge badge-waiting';
    }
    if (seqEl) seqEl.textContent = 'Error: Allocation cannot be greater than Maximum claim for any process.';
    showToast('Warning: Allocation exceeds Max claim for one or more processes!', 'error');
    return;
  }

  if (safety.isSafe) {
    if (statusEl) {
      statusEl.textContent = 'SAFE STATE (No Deadlock)';
      statusEl.className = 'badge badge-running';
    }
    if (seqEl) seqEl.textContent = `Safe Sequence: < ${safety.safeSequence.join(' → ')} >`;
  } else {
    if (statusEl) {
      statusEl.textContent = 'UNSAFE STATE (Deadlock Risk)';
      statusEl.className = 'badge badge-waiting';
    }
    if (seqEl) seqEl.textContent = `Deadlocked / Blocked: ${safety.deadlockedProcesses.join(', ')}`;
  }

  if (traceEl) {
    traceEl.innerHTML = safety.traceSteps.map((s, idx) => `
      <div style="padding: 4px 0; border-bottom: 1px dashed rgba(255,255,255,0.06); font-family: var(--font-mono); font-size: 0.78rem;">
        Step ${idx + 1}: ${s.process} (Need: [${s.need}]) → Work becomes [${s.workSnapshot.join(', ')}]
      </div>
    `).join('');
  }
}

function renderMatrices() {
  const container = document.getElementById('banker-matrices-container');
  if (!container) return;

  let html = `<table class="matrix-input-table"><thead><tr><th>PID</th><th colspan="3">Allocation (A B C)</th><th colspan="3">Max Claim (A B C)</th></tr></thead><tbody>`;

  for (let i = 0; i < allocMatrix.length; i++) {
    html += `<tr><td><strong>P${i}</strong></td>`;
    for (let j = 0; j < 3; j++) {
      html += `<td><input class="matrix-cell-input" type="number" min="0" data-matrix="alloc" data-p="${i}" data-r="${j}" value="${allocMatrix[i][j]}"></td>`;
    }
    for (let j = 0; j < 3; j++) {
      html += `<td><input class="matrix-cell-input" type="number" min="0" data-matrix="max" data-p="${i}" data-r="${j}" value="${maxMatrix[i][j]}"></td>`;
    }
    html += `</tr>`;
  }
  html += `</tbody></table>`;
  container.innerHTML = html;

  const availContainer = document.getElementById('banker-avail-container');
  if (availContainer) {
    availContainer.innerHTML = `
      <div style="display:flex; gap:8px; align-items:center;">
        <label class="form-label">Available (A,B,C):</label>
        <input class="matrix-cell-input" type="number" min="0" id="avail-0" value="${availableVector[0]}">
        <input class="matrix-cell-input" type="number" min="0" id="avail-1" value="${availableVector[1]}">
        <input class="matrix-cell-input" type="number" min="0" id="avail-2" value="${availableVector[2]}">
      </div>
    `;
  }

  container.querySelectorAll('input').forEach(inp => inp.addEventListener('change', () => executeSafetyCheck()));
  availContainer?.querySelectorAll('input').forEach(inp => inp.addEventListener('change', () => executeSafetyCheck()));
}

function readInputs() {
  for (let i = 0; i < allocMatrix.length; i++) {
    for (let j = 0; j < 3; j++) {
      const aInp = document.querySelector(`input[data-matrix="alloc"][data-p="${i}"][data-r="${j}"]`);
      if (aInp) allocMatrix[i][j] = Math.max(0, parseInt(aInp.value) || 0);
      const mInp = document.querySelector(`input[data-matrix="max"][data-p="${i}"][data-r="${j}"]`);
      if (mInp) maxMatrix[i][j] = Math.max(0, parseInt(mInp.value) || 0);
    }
  }
  ['avail-0', 'avail-1', 'avail-2'].forEach((id, idx) => {
    const el = document.getElementById(id);
    if (el) availableVector[idx] = Math.max(0, parseInt(el.value) || 0);
  });
}

function renderNeedMatrix(need) {
  const container = document.getElementById('banker-need-container');
  if (!container || !need) return;

  container.innerHTML = `
    <table class="matrix-input-table">
      <thead><tr><th>Process</th><th>Need (Max - Alloc)</th></tr></thead>
      <tbody>
        ${need.map((row, idx) => `<tr><td><strong>P${idx}</strong></td><td style="font-family: var(--font-mono); color: var(--color-primary);">${row.join('  ')}</td></tr>`).join('')}
      </tbody>
    </table>
  `;
}
