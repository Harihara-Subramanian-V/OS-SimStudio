/**
 * Utility functions for OS-SimStudio
 */

export const PROCESS_COLORS = [
  '#00f2fe', '#7928ca', '#10b981', '#f59e0b',
  '#f43f5e', '#38bdf8', '#a855f7', '#ec4899',
  '#14b8a6', '#eab308', '#6366f1', '#84cc16'
];

export function getProcessColor(index) {
  return PROCESS_COLORS[index % PROCESS_COLORS.length];
}

export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  if (type === 'error') {
    toast.style.borderColor = 'rgba(244, 63, 94, 0.5)';
    toast.style.color = '#fb7185';
  } else if (type === 'success') {
    toast.style.borderColor = 'rgba(16, 185, 129, 0.5)';
    toast.style.color = '#34d399';
  }

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

export function setupRetinaCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(rect.width, 300) * dpr;
  canvas.height = Math.max(rect.height, 100) * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, width: rect.width, height: rect.height };
}

export function downloadFile(filename, content, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}
