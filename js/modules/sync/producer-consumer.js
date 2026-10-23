/**
 * Producer-Consumer Bounded Buffer Simulation with Semaphores & Blocked Queues
 */
import { showToast } from '../../utils.js';

const BUFFER_CAPACITY = 6;
let buffer = [];
let itemCounter = 1;
let mutex = 1;
let blockedProducers = 0;
let blockedConsumers = 0;
let autoProduceInterval = null;
let autoConsumeInterval = null;

export function initProducerConsumer() {
  renderBufferSlots();
  bindEvents();
}

function bindEvents() {
  document.getElementById('btn-produce-one')?.addEventListener('click', () => produceItem());
  document.getElementById('btn-consume-one')?.addEventListener('click', () => consumeItem());

  const autoProdBtn = document.getElementById('btn-auto-produce');
  const autoConsBtn = document.getElementById('btn-auto-consume');

  autoProdBtn?.addEventListener('click', () => {
    if (autoProduceInterval) {
      clearInterval(autoProduceInterval);
      autoProduceInterval = null;
      autoProdBtn.textContent = 'Auto Produce: OFF';
      autoProdBtn.className = 'btn btn-secondary btn-sm';
    } else {
      autoProduceInterval = setInterval(produceItem, 1200);
      autoProdBtn.textContent = 'Auto Produce: ON';
      autoProdBtn.className = 'btn btn-success btn-sm';
    }
  });

  autoConsBtn?.addEventListener('click', () => {
    if (autoConsumeInterval) {
      clearInterval(autoConsumeInterval);
      autoConsumeInterval = null;
      autoConsBtn.textContent = 'Auto Consume: OFF';
      autoConsBtn.className = 'btn btn-secondary btn-sm';
    } else {
      autoConsumeInterval = setInterval(consumeItem, 1500);
      autoConsBtn.textContent = 'Auto Consume: ON';
      autoConsBtn.className = 'btn btn-success btn-sm';
    }
  });
}

function produceItem() {
  // wait(empty)
  const emptyCount = BUFFER_CAPACITY - buffer.length;
  if (emptyCount === 0) {
    blockedProducers++;
    renderBufferSlots();
    showToast('Buffer FULL: Producer thread BLOCKED on empty semaphore!', 'error');
    return;
  }

  // wait(mutex)
  mutex = 0;
  const newItem = `Item #${itemCounter++}`;
  buffer.push(newItem);
  // signal(mutex)
  mutex = 1;

  // signal(full): Wake up blocked consumer if any
  if (blockedConsumers > 0) {
    blockedConsumers--;
    showToast('Unblocked waiting consumer thread!', 'info');
  }

  renderBufferSlots();
  showToast(`Produced ${newItem}`, 'info');
}

function consumeItem() {
  // wait(full)
  if (buffer.length === 0) {
    blockedConsumers++;
    renderBufferSlots();
    showToast('Buffer EMPTY: Consumer thread BLOCKED on full semaphore!', 'error');
    return;
  }

  // wait(mutex)
  mutex = 0;
  const consumed = buffer.shift();
  // signal(mutex)
  mutex = 1;

  // signal(empty): Wake up blocked producer if any
  if (blockedProducers > 0) {
    blockedProducers--;
    showToast('Unblocked waiting producer thread!', 'info');
  }

  renderBufferSlots();
  showToast(`Consumed ${consumed}`, 'info');
}

function renderBufferSlots() {
  const container = document.getElementById('buffer-slots-container');
  const semMutex = document.getElementById('sem-mutex-val');
  const semEmpty = document.getElementById('sem-empty-val');
  const semFull = document.getElementById('sem-full-val');

  if (semMutex) semMutex.textContent = mutex;
  if (semEmpty) semEmpty.textContent = BUFFER_CAPACITY - buffer.length;
  if (semFull) semFull.textContent = buffer.length;

  if (!container) return;
  container.innerHTML = '';

  for (let i = 0; i < BUFFER_CAPACITY; i++) {
    const slot = document.createElement('div');
    const isFilled = i < buffer.length;
    slot.className = `buffer-slot ${isFilled ? 'filled' : ''}`;
    slot.textContent = isFilled ? buffer[i].replace('Item #', '#') : '';
    container.appendChild(slot);
  }

  // Show thread queues
  let queuesEl = document.getElementById('sem-blocked-queues');
  if (!queuesEl) {
    queuesEl = document.createElement('div');
    queuesEl.id = 'sem-blocked-queues';
    queuesEl.style.cssText = 'text-align:center; font-size:0.78rem; color:var(--text-muted); margin-top:8px;';
    container.parentNode.insertBefore(queuesEl, container.nextSibling);
  }
  queuesEl.innerHTML = `
    Blocked Producers: <strong style="color:${blockedProducers > 0 ? '#fb7185' : '#94a3b8'};">${blockedProducers}</strong> | 
    Blocked Consumers: <strong style="color:${blockedConsumers > 0 ? '#fb7185' : '#94a3b8'};">${blockedConsumers}</strong>
  `;
}
