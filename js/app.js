/**
 * Main Application Orchestrator for OS-SimStudio (M1 - M4)
 */
import { initCpuView } from './modules/cpu/cpu-view.js';
import { initBankerView } from './modules/sync/banker-view.js';
import { initDiningPhilosophers } from './modules/sync/dining-philosophers.js';
import { initProducerConsumer } from './modules/sync/producer-consumer.js';
import { initPagingView } from './modules/memory/paging-view.js';
import { initTlbVisualizer } from './modules/memory/tlb-visualizer.js';
import { initContiguousAllocation } from './modules/memory/contiguous-alloc.js';
import { initDiskView } from './modules/storage/disk-view.js';
import { initFileAllocation } from './modules/storage/file-alloc-view.js';
import { loadLabExperiment } from './modules/report/lab-presets.js';
import { generateAcademicReport } from './modules/report/report-generator.js';

let activeTabId = 'cpu';

document.addEventListener('DOMContentLoaded', async () => {
  await loadModuleTemplates();
  setupNavigation();
  initAllModules();
  bindGlobalControls();
});

async function loadModuleTemplates() {
  const container = document.getElementById('main-content');
  if (!container || container.children.length > 0) return;

  const templateFiles = ['cpu', 'sync', 'memory', 'storage'];
  const contents = await Promise.all(
    templateFiles.map(file => fetch(`templates/${file}.html`).then(res => res.text()))
  );
  container.innerHTML = contents.join('\n');
}

function setupNavigation() {
  const tabs = document.querySelectorAll('.nav-tabs .tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.tab;
      switchTab(targetId);
    });
  });
}

export function switchTab(tabId) {
  activeTabId = tabId;
  const tabs = document.querySelectorAll('.nav-tabs .tab-btn');
  const sections = document.querySelectorAll('.tab-section');

  tabs.forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tabId);
    t.setAttribute('aria-selected', t.dataset.tab === tabId ? 'true' : 'false');
  });

  sections.forEach(sec => {
    if (sec.id === `section-${tabId}`) {
      sec.style.display = 'block';
    } else {
      sec.style.display = 'none';
    }
  });

  window.dispatchEvent(new Event('resize'));
}

function initAllModules() {
  initCpuView();
  initBankerView();
  initDiningPhilosophers();
  initProducerConsumer();
  initPagingView();
  initTlbVisualizer();
  initContiguousAllocation();
  initDiskView();
  initFileAllocation();
}

function bindGlobalControls() {
  const labSelect = document.getElementById('preset-lab-select');
  const reportBtn = document.getElementById('btn-generate-report');

  labSelect?.addEventListener('change', (e) => {
    const labKey = e.target.value;
    if (labKey) {
      loadLabExperiment(labKey, switchTab);
      labSelect.value = '';
    }
  });

  reportBtn?.addEventListener('click', () => {
    generateAcademicReport(activeTabId);
  });
}
