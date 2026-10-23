/**
 * Academic Laboratory Report Generator for BAITE201 Operating System Principles
 */
import { getCurrentCpuResults } from '../cpu/cpu-view.js';
import { getBankerState } from '../sync/banker-view.js';
import { getPagingResult } from '../memory/paging-view.js';
import { getDiskResult } from '../storage/disk-view.js';
import { downloadFile, showToast } from '../../utils.js';

export function generateAcademicReport(activeTab = 'cpu') {
  const timestamp = new Date().toLocaleString();
  let markdown = `# LABORATORY EXPERIMENT REPORT
**Course Code:** BAITE201  
**Course Title:** Operating System Principles  
**Date of Experiment:** ${timestamp}  
**Simulation Platform:** OS-SimStudio Interactive Simulator  

---

`;

  if (activeTab === 'cpu') {
    const res = getCurrentCpuResults();
    markdown += `## Experiment: CPU Scheduling & Process Lifecycle
### 1. Objective
To analyze the performance of CPU scheduling algorithms with respect to Average Waiting Time, Turnaround Time, and CPU Utilization.

### 2. Process Execution Metrics
| Process ID | Arrival Time | Burst Time | Completion Time | Turnaround Time | Waiting Time |
| :---: | :---: | :---: | :---: | :---: | :---: |
`;
    res?.stats?.forEach(p => {
      markdown += `| ${p.id} | ${p.arrivalTime} ms | ${p.burstTime} ms | ${p.completionTime} ms | ${p.turnaroundTime} ms | ${p.waitingTime} ms |\n`;
    });

    markdown += `
### 3. Summary Statistics
- **Average Waiting Time:** ${res?.avgWait ?? 0} ms
- **Average Turnaround Time:** ${res?.avgTurnaround ?? 0} ms
- **CPU Utilization:** ${res?.cpuUtil ?? 100}%

### 4. Observations & Conclusion
The algorithm demonstrated predictable scheduling behavior. Preemptive variants minimized response time at the cost of context switching overhead.
`;
  } else if (activeTab === 'sync') {
    const b = getBankerState();
    markdown += `## Experiment: Deadlock Avoidance with Banker's Algorithm
### 1. Objective
To determine if a system state is safe and compute a valid safe execution sequence avoiding deadlock.

### 2. System State Matrices
- **Available Resources (A, B, C):** [${b.availableVector.join(', ')}]
- **Allocation Matrix:**
${b.allocMatrix.map((r, i) => `  - P${i}: [${r.join(', ')}]`).join('\n')}
- **Need Matrix (Max - Alloc):**
${b.needMatrix.map((r, i) => `  - P${i}: [${r.join(', ')}]`).join('\n')}

### 3. Conclusion
The Safety Algorithm successfully verifies resource requests to prevent circular wait and deadlock states.
`;
  } else if (activeTab === 'memory') {
    const p = getPagingResult();
    markdown += `## Experiment: Virtual Memory Page Replacement Analysis
### 1. Objective
To evaluate page fault frequency across page replacement algorithms (FIFO, LRU, Optimal, Clock).

### 2. Experimental Data
- **Algorithm:** ${p?.algorithm}
- **Allocated Frames:** ${p?.frameCount}
- **Reference String:** ${p?.referenceString?.join(', ')}
- **Total Page Faults:** ${p?.totalFaults}
- **Total Page Hits:** ${p?.totalHits}
- **Fault Ratio:** ${p?.faultRatio}%
- **Hit Ratio:** ${p?.hitRatio}%

### 3. Conclusion
Algorithms with recency awareness (LRU) and future awareness (Optimal) minimize page faults compared to naive FIFO.
`;
  } else {
    const d = getDiskResult();
    markdown += `## Experiment: Disk Arm Scheduling & Seek Optimization
### 1. Objective
To minimize total disk head movements across disk cylinder request queues.

### 2. Experimental Results
- **Algorithm:** ${d?.algorithm}
- **Initial Head Position:** Cylinder ${d?.initialHead}
- **Total Head Movement:** ${d?.totalHeadMovement} cylinders
- **Average Seek Distance:** ${d?.avgSeek} cylinders
- **Traversal Sequence:** ${d?.sequence?.join(' → ')}

### 3. Conclusion
Elevator algorithms (SCAN / LOOK) prevent starvation while maintaining low average seek time.
`;
  }

  showReportModal(markdown);
}

function showReportModal(markdown) {
  const modal = document.getElementById('report-modal');
  const content = document.getElementById('report-modal-content');
  const downloadBtn = document.getElementById('btn-download-report');
  const printBtn = document.getElementById('btn-print-report');
  const closeBtn = document.getElementById('btn-close-report');

  if (!modal || !content) return;

  // Simple markdown to HTML rendering
  const formattedHtml = markdown
    .replace(/^# (.*$)/gim, '<h1 style="color:#00f2fe; margin-bottom:12px;">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 style="color:#38bdf8; margin:16px 0 8px 0;">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 style="color:#e2e8f0; margin:12px 0 6px 0;">$1</h3>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\n\n/gim, '<br><br>');

  content.innerHTML = formattedHtml;
  modal.classList.add('open');

  downloadBtn.onclick = () => {
    downloadFile(`Lab_Report_BAITE201_${Date.now()}.md`, markdown);
    showToast('Report downloaded as Markdown', 'success');
  };

  printBtn.onclick = () => {
    window.print();
  };

  closeBtn.onclick = () => {
    modal.classList.remove('open');
  };
}
