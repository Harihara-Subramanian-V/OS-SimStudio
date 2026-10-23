/**
 * Multi-Level Feedback Queue (MLFQ) Engine with Preemption
 * Q0: RR (Quantum = 2)
 * Q1: RR (Quantum = 4)
 * Q2: FCFS / Round Robin (Quantum = 8)
 */

export function runMlfqSimulation(processes) {
  if (!processes || processes.length === 0) {
    return { timeline: [], stats: [], avgWait: 0, avgTurnaround: 0, totalTime: 0 };
  }

  const procs = processes.map(p => ({
    id: p.id,
    arrivalTime: Math.max(0, Number(p.arrivalTime) || 0),
    burstTime: Math.max(1, Number(p.burstTime) || 1),
    remainingTime: Math.max(1, Number(p.burstTime) || 1),
    currentQueue: 0,
    startTime: -1,
    completionTime: 0,
    waitingTime: 0,
    turnaroundTime: 0,
    color: p.color
  }));

  const q0 = [];
  const q1 = [];
  const q2 = [];
  const timeline = [];
  let currentTime = 0;
  let completed = 0;
  const n = procs.length;

  while (completed < n) {
    // Add newly arriving processes into Q0
    procs.forEach(p => {
      if (p.arrivalTime <= currentTime && p.remainingTime > 0 &&
          !q0.includes(p) && !q1.includes(p) && !q2.includes(p) && p.currentQueue === 0) {
        q0.push(p);
      }
    });

    let activeProc = null;
    let maxQuantum = 0;

    if (q0.length > 0) {
      activeProc = q0.shift();
      maxQuantum = 2;
    } else if (q1.length > 0) {
      activeProc = q1.shift();
      maxQuantum = 4;
    } else if (q2.length > 0) {
      activeProc = q2.shift();
      maxQuantum = 8;
    } else {
      const unarrived = procs.filter(p => p.remainingTime > 0);
      if (unarrived.length > 0) {
        const nextTime = Math.min(...unarrived.map(p => p.arrivalTime));
        timeline.push({ pid: 'IDLE', start: currentTime, end: nextTime, color: '#334155' });
        currentTime = nextTime;
        continue;
      }
      break;
    }

    if (activeProc.startTime === -1) activeProc.startTime = currentTime;

    // Check if a higher queue will preempt during execution
    let runSlice = Math.min(maxQuantum, activeProc.remainingTime);
    if (activeProc.currentQueue > 0) {
      const nextQ0Arrival = procs
        .filter(p => p.currentQueue === 0 && p.remainingTime > 0 && p.arrivalTime > currentTime)
        .map(p => p.arrivalTime);
      if (nextQ0Arrival.length > 0) {
        const earliest = Math.min(...nextQ0Arrival);
        if (earliest < currentTime + runSlice) {
          runSlice = earliest - currentTime; // Preempted by incoming Q0 process
        }
      }
    }

    // Merge with previous segment if same pid
    const lastSeg = timeline[timeline.length - 1];
    if (lastSeg && lastSeg.pid === activeProc.id) {
      lastSeg.end = currentTime + runSlice;
    } else {
      timeline.push({ pid: activeProc.id, start: currentTime, end: currentTime + runSlice, color: activeProc.color });
    }

    currentTime += runSlice;
    activeProc.remainingTime -= runSlice;

    // Check newly arrived procs
    procs.forEach(p => {
      if (p.arrivalTime <= currentTime && p.remainingTime > 0 &&
          p.id !== activeProc.id && !q0.includes(p) && !q1.includes(p) && !q2.includes(p) && p.currentQueue === 0) {
        q0.push(p);
      }
    });

    if (activeProc.remainingTime === 0) {
      activeProc.completionTime = currentTime;
      activeProc.turnaroundTime = activeProc.completionTime - activeProc.arrivalTime;
      activeProc.waitingTime = activeProc.turnaroundTime - activeProc.burstTime;
      completed++;
    } else {
      // Demote to lower priority queue if it exhausted its quantum
      if (runSlice >= maxQuantum) {
        activeProc.currentQueue = Math.min(2, activeProc.currentQueue + 1);
      }
      if (activeProc.currentQueue === 1) q1.push(activeProc);
      else if (activeProc.currentQueue === 2) q2.push(activeProc);
      else q0.push(activeProc);
    }
  }

  const totalWait = procs.reduce((acc, p) => acc + p.waitingTime, 0);
  const totalTat = procs.reduce((acc, p) => acc + p.turnaroundTime, 0);

  return {
    timeline,
    stats: procs,
    avgWait: Number((totalWait / n).toFixed(2)),
    avgTurnaround: Number((totalTat / n).toFixed(2)),
    totalTime: currentTime
  };
}
