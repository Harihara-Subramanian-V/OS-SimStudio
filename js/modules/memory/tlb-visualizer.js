/**
 * TLB & Virtual Address Translation Simulator
 * Page Size: 4 KB (12 offset bits)
 */
import { showToast } from '../../utils.js';

const tlbCache = [
  { page: 2, frame: 5, valid: true },
  { page: 0, frame: 1, valid: true },
  { page: 7, frame: 9, valid: true },
  { page: 4, frame: 3, valid: true }
];

const pageTable = {
  0: 1, 1: 4, 2: 5, 3: 8,
  4: 3, 5: 6, 6: 2, 7: 9
};

export function initTlbVisualizer() {
  bindEvents();
  translateAddress(0x2A3C);
}

function bindEvents() {
  const translateBtn = document.getElementById('btn-translate-addr');
  const inputEl = document.getElementById('virt-addr-input');

  translateBtn?.addEventListener('click', () => {
    let rawVal = inputEl?.value.trim() || '0x2A3C';
    let addr = rawVal.startsWith('0x') ? parseInt(rawVal, 16) : parseInt(rawVal, 10);
    if (isNaN(addr) || addr < 0) {
      showToast('Please enter a valid positive address', 'error');
      return;
    }
    translateAddress(addr);
  });
}

export function translateAddress(virtualAddress) {
  const pageSize = 4096; // 4 KB
  const pageNumber = Math.floor(virtualAddress / pageSize);
  const offset = virtualAddress % pageSize;

  const tlbEntry = tlbCache.find(e => e.valid && e.page === pageNumber);
  const isTlbHit = Boolean(tlbEntry);
  let frameNumber = -1;

  if (isTlbHit) {
    frameNumber = tlbEntry.frame;
  } else if (pageTable[pageNumber] !== undefined) {
    frameNumber = pageTable[pageNumber];
  }

  const hexVirt = '0x' + virtualAddress.toString(16).toUpperCase().padStart(4, '0');
  const hexOffset = '0x' + offset.toString(16).toUpperCase().padStart(3, '0');

  const pNumEl = document.getElementById('tlb-page-num');
  const offsetEl = document.getElementById('tlb-offset-val');
  const statusEl = document.getElementById('tlb-status-badge');
  const frameEl = document.getElementById('tlb-frame-num');
  const physEl = document.getElementById('tlb-phys-addr');

  if (pNumEl) pNumEl.textContent = `Page p: ${pageNumber} (0x${pageNumber.toString(16).toUpperCase()})`;
  if (offsetEl) offsetEl.textContent = `Offset d: ${offset} (${hexOffset})`;

  if (frameNumber === -1) {
    // Page Fault: Page not mapped in Page Table
    if (statusEl) {
      statusEl.className = 'badge badge-waiting';
      statusEl.textContent = 'PAGE FAULT (Page Not In Memory)';
    }
    if (frameEl) frameEl.textContent = 'Frame: Invalid';
    if (physEl) physEl.textContent = 'TRAP: Page Fault Exception';
    showToast(`Page ${pageNumber} not in Page Table -> Page Fault!`, 'error');
  } else {
    const physicalAddress = (frameNumber * pageSize) + offset;
    const hexPhys = '0x' + physicalAddress.toString(16).toUpperCase().padStart(4, '0');
    if (statusEl) {
      statusEl.className = `badge ${isTlbHit ? 'badge-running' : 'badge-ready'}`;
      statusEl.textContent = isTlbHit ? 'TLB HIT (Fast Path)' : 'TLB MISS (Page Table Walk)';
    }
    if (frameEl) frameEl.textContent = `Frame f: ${frameNumber}`;
    if (physEl) physEl.textContent = `${hexPhys} (${physicalAddress})`;
  }
}
