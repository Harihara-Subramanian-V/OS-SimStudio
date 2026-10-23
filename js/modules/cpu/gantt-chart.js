/**
 * Gantt Chart Canvas Renderer for CPU Scheduling
 */
import { setupRetinaCanvas } from '../../utils.js';

export function drawGanttChart(canvasId, timeline) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !timeline || timeline.length === 0) return;
  const { ctx, width, height } = setupRetinaCanvas(canvas);

  ctx.clearRect(0, 0, width, height);
  const totalDuration = timeline[timeline.length - 1].end;
  const chartHeight = 55;
  const startY = 20;

  timeline.forEach(seg => {
    const segX = (seg.start / totalDuration) * (width - 40) + 20;
    const segW = ((seg.end - seg.start) / totalDuration) * (width - 40);

    // Segment Box
    ctx.fillStyle = seg.color;
    ctx.fillRect(segX, startY, segW, chartHeight);
    ctx.strokeStyle = '#0a0d14';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(segX, startY, segW, chartHeight);

    // Segment Text
    ctx.fillStyle = seg.pid === 'IDLE' ? '#94a3b8' : '#ffffff';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (segW > 24) {
      ctx.fillText(seg.pid, segX + segW / 2, startY + chartHeight / 2);
    }

    // Time ticks
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText(seg.start.toString(), segX, startY + chartHeight + 16);
  });

  // Final time tick
  const finalX = width - 20;
  ctx.fillText(totalDuration.toString(), finalX, startY + chartHeight + 16);
}
