/**
 * File Allocation Visualizer (Contiguous, Linked, Indexed)
 */
import { showToast } from '../../utils.js';

const TOTAL_DISK_BLOCKS = 48;
let allocationType = 'CONTIGUOUS';

const filesDatabase = {
  CONTIGUOUS: [
    { name: 'kernel.sys', start: 2, length: 5, color: '#00f2fe' },
    { name: 'document.pdf', start: 10, length: 8, color: '#7928ca' },
    { name: 'photo.jpg', start: 24, length: 6, color: '#10b981' }
  ],
  LINKED: [
    { name: 'notes.txt', blocks: [3, 9, 14, 22, 35], color: '#f59e0b' },
    { name: 'music.mp3', blocks: [1, 6, 12, 19, 28, 40], color: '#38bdf8' }
  ],
  INDEXED: [
    { name: 'database.db', indexBlock: 7, dataBlocks: [11, 15, 23, 31, 39, 44], color: '#f43f5e' }
  ]
};

export function initFileAllocation() {
  bindEvents();
  renderFileBlocks();
}

function bindEvents() {
  const methodSelect = document.getElementById('file-alloc-method');
  methodSelect?.addEventListener('change', (e) => {
    allocationType = e.target.value;
    renderFileBlocks();
    showToast(`Switched file allocation to ${allocationType}`, 'info');
  });
}

function renderFileBlocks() {
  const container = document.getElementById('disk-blocks-grid');
  const dirContainer = document.getElementById('file-dir-entries');
  if (!container) return;
  container.innerHTML = '';

  // Initialize blocks map
  const blockMap = new Map();

  if (allocationType === 'CONTIGUOUS') {
    filesDatabase.CONTIGUOUS.forEach(f => {
      for (let i = 0; i < f.length; i++) {
        blockMap.set(f.start + i, { name: f.name, color: f.color, type: 'data' });
      }
    });
  } else if (allocationType === 'LINKED') {
    filesDatabase.LINKED.forEach(f => {
      f.blocks.forEach((b, idx) => {
        const next = idx < f.blocks.length - 1 ? f.blocks[idx + 1] : 'EOF';
        blockMap.set(b, { name: f.name, color: f.color, type: 'linked', next });
      });
    });
  } else if (allocationType === 'INDEXED') {
    filesDatabase.INDEXED.forEach(f => {
      blockMap.set(f.indexBlock, { name: f.name, color: f.color, type: 'index' });
      f.dataBlocks.forEach(b => {
        blockMap.set(b, { name: f.name, color: f.color, type: 'data' });
      });
    });
  }

  // Draw 48 blocks
  for (let i = 0; i < TOTAL_DISK_BLOCKS; i++) {
    const el = document.createElement('div');
    const info = blockMap.get(i);
    el.className = `disk-block-item ${info ? (info.type === 'index' ? 'index-node' : 'allocated') : ''}`;
    el.textContent = i;

    if (info) {
      el.style.backgroundColor = `${info.color}33`;
      el.style.borderColor = info.color;
      el.title = `Block #${i}: ${info.name} [${info.type}] ${info.next ? `→ Next: ${info.next}` : ''}`;
    }
    container.appendChild(el);
  }

  // Render directory table
  if (dirContainer) {
    let dirHtml = `<table class="table-custom"><thead><tr><th>File Name</th><th>Allocation Metadata</th></tr></thead><tbody>`;

    if (allocationType === 'CONTIGUOUS') {
      filesDatabase.CONTIGUOUS.forEach(f => {
        dirHtml += `<tr><td><strong>${f.name}</strong></td><td>Start: Block ${f.start}, Length: ${f.length} blocks</td></tr>`;
      });
    } else if (allocationType === 'LINKED') {
      filesDatabase.LINKED.forEach(f => {
        dirHtml += `<tr><td><strong>${f.name}</strong></td><td>Linked Chain: ${f.blocks.join(' → ')} → [EOF]</td></tr>`;
      });
    } else if (allocationType === 'INDEXED') {
      filesDatabase.INDEXED.forEach(f => {
        dirHtml += `<tr><td><strong>${f.name}</strong></td><td>Index Block: <strong>#${f.indexBlock}</strong> points to [${f.dataBlocks.join(', ')}]</td></tr>`;
      });
    }

    dirHtml += `</tbody></table>`;
    dirContainer.innerHTML = dirHtml;
  }
}
