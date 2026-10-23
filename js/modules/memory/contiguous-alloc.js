/**
 * Contiguous Dynamic Memory Allocation with Block Splitting, Deallocation, and Compaction
 */
import { showToast } from '../../utils.js';

let memoryBlocks = [
  { id: 1, size: 100, free: 100, allocatedTo: null },
  { id: 2, size: 500, free: 500, allocatedTo: null },
  { id: 3, size: 200, free: 200, allocatedTo: null },
  { id: 4, size: 300, free: 300, allocatedTo: null },
  { id: 5, size: 600, free: 600, allocatedTo: null }
];
let nextBlockId = 6;

export function initContiguousAllocation() {
  renderMemoryBar();
  bindEvents();
}

function bindEvents() {
  document.getElementById('btn-alloc-mem')?.addEventListener('click', () => {
    const pName = document.getElementById('alloc-proc-name')?.value.trim() || 'P_new';
    const pSize = parseInt(document.getElementById('alloc-proc-size')?.value) || 120;
    const algo = document.getElementById('alloc-algo-select')?.value || 'FIRST_FIT';
    allocateProcess(pName, pSize, algo);
  });

  document.getElementById('btn-reset-mem')?.addEventListener('click', () => resetMemory());
  document.getElementById('btn-compact-mem')?.addEventListener('click', () => compactMemory());
}

function allocateProcess(name, size, algo) {
  // Find free blocks that can accommodate size
  const candidates = memoryBlocks.filter(b => b.allocatedTo === null && b.size >= size);

  if (candidates.length === 0) {
    showToast(`Allocation Failed for ${name} (${size} KB): No contiguous block fits!`, 'error');
    return;
  }

  let chosen = null;
  if (algo === 'FIRST_FIT') {
    chosen = candidates[0];
  } else if (algo === 'BEST_FIT') {
    candidates.sort((a, b) => a.size - b.size);
    chosen = candidates[0];
  } else if (algo === 'WORST_FIT') {
    candidates.sort((a, b) => b.size - a.size);
    chosen = candidates[0];
  }

  const blockIdx = memoryBlocks.indexOf(chosen);
  const remainingSize = chosen.size - size;

  // Split partition if remaining size > 0
  chosen.size = size;
  chosen.free = 0;
  chosen.allocatedTo = name;

  if (remainingSize > 0) {
    const newFreeBlock = {
      id: nextBlockId++,
      size: remainingSize,
      free: remainingSize,
      allocatedTo: null
    };
    memoryBlocks.splice(blockIdx + 1, 0, newFreeBlock);
  }

  renderMemoryBar();
  showToast(`Allocated ${name} (${size} KB) in Block #${chosen.id}`, 'success');
}

export function deallocateProcess(blockId) {
  const block = memoryBlocks.find(b => b.id === blockId);
  if (!block || !block.allocatedTo) return;

  const pName = block.allocatedTo;
  block.allocatedTo = null;
  block.free = block.size;

  // Coalesce adjacent free blocks
  for (let i = 0; i < memoryBlocks.length - 1; i++) {
    if (!memoryBlocks[i].allocatedTo && !memoryBlocks[i + 1].allocatedTo) {
      memoryBlocks[i].size += memoryBlocks[i + 1].size;
      memoryBlocks[i].free = memoryBlocks[i].size;
      memoryBlocks.splice(i + 1, 1);
      i--;
    }
  }

  renderMemoryBar();
  showToast(`Deallocated ${pName} and coalesced adjacent free memory`, 'info');
}

function compactMemory() {
  const allocated = memoryBlocks.filter(b => b.allocatedTo !== null);
  const totalFree = memoryBlocks.filter(b => b.allocatedTo === null).reduce((sum, b) => sum + b.size, 0);

  if (totalFree === 0) {
    showToast('No free space to compact', 'info');
    return;
  }

  // Slide all allocated blocks to left, consolidate all free space to right
  const newBlocks = [...allocated];
  newBlocks.push({
    id: nextBlockId++,
    size: totalFree,
    free: totalFree,
    allocatedTo: null
  });

  memoryBlocks = newBlocks;
  renderMemoryBar();
  showToast(`Memory Compaction Complete: Consolidated ${totalFree} KB free space!`, 'success');
}

function resetMemory() {
  memoryBlocks = [
    { id: 1, size: 100, free: 100, allocatedTo: null },
    { id: 2, size: 500, free: 500, allocatedTo: null },
    { id: 3, size: 200, free: 200, allocatedTo: null },
    { id: 4, size: 300, free: 300, allocatedTo: null },
    { id: 5, size: 600, free: 600, allocatedTo: null }
  ];
  nextBlockId = 6;
  renderMemoryBar();
  showToast('Memory reset to initial layout', 'info');
}

function renderMemoryBar() {
  const container = document.getElementById('contiguous-mem-bar');
  const fragEl = document.getElementById('alloc-metric-frag');
  if (!container) return;
  container.innerHTML = '';

  const totalCap = memoryBlocks.reduce((acc, b) => acc + b.size, 0);
  const totalFree = memoryBlocks.filter(b => !b.allocatedTo).reduce((acc, b) => acc + b.size, 0);

  memoryBlocks.forEach(b => {
    const widthPct = (b.size / totalCap) * 100;
    const blockEl = document.createElement('div');
    blockEl.className = `memory-block ${b.allocatedTo ? 'block-allocated' : 'block-free'}`;
    blockEl.style.width = `${Math.max(widthPct, 4)}%`;
    blockEl.title = `Block #${b.id}: ${b.allocatedTo ? b.allocatedTo : 'Free'} [${b.size} KB] (Click to deallocate)`;
    
    blockEl.innerHTML = `
      <span>${b.allocatedTo ? `${b.allocatedTo} (${b.size}K)` : `Free (${b.size}K)`}</span>
      ${b.allocatedTo ? `<button style="background:none;border:none;color:#fb7185;cursor:pointer;font-size:0.65rem;">[✕ Free]</button>` : ''}
    `;

    if (b.allocatedTo) {
      blockEl.querySelector('button')?.addEventListener('click', (e) => {
        e.stopPropagation();
        deallocateProcess(b.id);
      });
    }

    container.appendChild(blockEl);
  });

  if (fragEl) {
    const fragPct = Number(((totalFree / totalCap) * 100).toFixed(1));
    fragEl.textContent = `${totalFree} KB (${fragPct}%)`;
  }
}
