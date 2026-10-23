/**
 * Pure CPU Scheduling Engine for FCFS, SJF, SRTF, Priority, Round Robin
 */

export function runCpuSimulation(processes, algorithm, options = { quantum: 2 }) {
  if (!processes || processes.length === 0) {
    return { timeline: [], stats: [], avgWait: 0, avgTurnaround: 0, avgResponse: 0, cpuUtil: 0 };
  }

  const procs = processes.map(p => ({
    id: p.id,
    arrivalTime: Math.max(0, Number(p.arrivalTime) || 0),
    burstTime: Math.max(1, Number(p.burstTime) || 1),
    priority: Math.max(1, Number(p.priority) || 1),
    remainingTime: Math.max(1, Number(p.burstTime) || 1),
    startTime: -1,
    completionTime: 0,
    waitingTime: 0,
    turnaroundTime: 0,
    responseTime: 0,
    color: p.color
  }));

  const timeline = [];
  let currentTime = 0;
  let completed = 0;
  const n = procs.length;

  if (algorithm === 'FCFS') {
    procs.sort((a, b) => a.arrivalTime - b.arrivalTime);
    for (const p of procs) {
      if (currentTime < p.arrivalTime) {
        timeline.push({ pid: 'IDLE', start: currentTime, end: p.arrivalTime, color: '#334155' });
        currentTime = p.arrivalTime;
      }
      p.startTime = currentTime;
      p.completionTime = currentTime + p.burstTime;
      p.turnaroundTime = p.completionTime - p.arrivalTime;
      p.waitingTime = p.turnaroundTime - p.burstTime;
      p.responseTime = p.startTime - p.arrivalTime;
      timeline.push({ pid: p.id, start: currentTime, end: p.completionTime, color: p.color });
      currentTime = p.completionTime;
    }
  } else if (algorithm === 'SJF_NON' || algorithm === 'PRIORITY_NON') {
    const isPriority = algorithm === 'PRIORITY_NON';
    while (completed < n) {
      const available = procs.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0);
      if (available.length === 0) {
        const nextArrival = Math.min(...procs.filter(p => p.remainingTime > 0).map(p => p.arrivalTime));
        timeline.push({ pid: 'IDLE', start: currentTime, end: nextArrival, color: '#334155' });
        currentTime = nextArrival;
        continue;
      }
      available.sort((a, b) => isPriority 
        ? ((a.priority - b.priority) || (a.arrivalTime - b.arrivalTime))
        : ((a.burstTime - b.burstTime) || (a.arrivalTime - b.arrivalTime)));
      const cur = available[0];
      cur.startTime = currentTime;
      cur.completionTime = currentTime + cur.burstTime;
      cur.turnaroundTime = cur.completionTime - cur.arrivalTime;
      cur.waitingTime = cur.turnaroundTime - cur.burstTime;
      cur.responseTime = cur.startTime - cur.arrivalTime;
      cur.remainingTime = 0;
      timeline.push({ pid: cur.id, start: currentTime, end: cur.completionTime, color: cur.color });
      currentTime = cur.completionTime;
      completed++;
    }
  } else if (algorithm === 'SRTF' || algorithm === 'PRIORITY_PRE') {
    const isPriority = algorithm === 'PRIORITY_PRE';
    while (completed < n) {
      const available = procs.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0);
      if (available.length === 0) {
        const nextArrival = Math.min(...procs.filter(p => p.remainingTime > 0).map(p => p.arrivalTime));
        timeline.push({ pid: 'IDLE', start: currentTime, end: nextArrival, color: '#334155' });
        currentTime = nextArrival;
        continue;
      }
      available.sort((a, b) => isPriority 
        ? ((a.priority - b.priority) || (a.arrivalTime - b.arrivalTime))
        : ((a.remainingTime - b.remainingTime) || (a.arrivalTime - b.arrivalTime)));
      const cur = available[0];
      if (cur.startTime === -1) cur.startTime = currentTime;

      const lastSeg = timeline[timeline.length - 1];
      if (lastSeg && lastSeg.pid === cur.id) lastSeg.end = currentTime + 1;
      else timeline.push({ pid: cur.id, start: currentTime, end: currentTime + 1, color: cur.color });

      cur.remainingTime--;
      currentTime++;
      if (cur.remainingTime === 0) {
        cur.completionTime = currentTime;
        cur.turnaroundTime = cur.completionTime - cur.arrivalTime;
        cur.waitingTime = cur.turnaroundTime - cur.burstTime;
        cur.responseTime = cur.startTime - cur.arrivalTime;
        completed++;
      }
    }
  } else if (algorithm === 'RR') {
    const q = Math.max(1, Number(options.quantum) || 2);
    const readyQueue = [];
    const inQueue = new Set();
    procs.sort((a, b) => a.arrivalTime - b.arrivalTime);

    procs.forEach(p => {
      if (p.arrivalTime <= currentTime && !inQueue.has(p.id)) {
        readyQueue.push(p);
        inQueue.add(p.id);
      }
    });

    while (completed < n) {
      if (readyQueue.length === 0) {
        const uncompleted = procs.filter(p => p.remainingTime > 0);
        if (uncompleted.length === 0) break;
        const availableNow = uncompleted.filter(p => p.arrivalTime <= currentTime);
        if (availableNow.length > 0) {
          availableNow.forEach(p => { if (!inQueue.has(p.id)) { readyQueue.push(p); inQueue.add(p.id); } });
        } else {
          const nextArrival = Math.min(...uncompleted.map(p => p.arrivalTime));
          timeline.push({ pid: 'IDLE', start: currentTime, end: nextArrival, color: '#334155' });
          currentTime = nextArrival;
          uncompleted.filter(p => p.arrivalTime <= currentTime).forEach(p => {
            if (!inQueue.has(p.id)) { readyQueue.push(p); inQueue.add(p.id); }
          });
        }
      }

      if (readyQueue.length === 0) break;
      const cur = readyQueue.shift();
      inQueue.delete(cur.id);

      if (cur.startTime === -1) cur.startTime = currentTime;
      const execTime = Math.min(q, cur.remainingTime);
      timeline.push({ pid: cur.id, start: currentTime, end: currentTime + execTime, color: cur.color });
      currentTime += execTime;
      cur.remainingTime -= execTime;

      procs.forEach(p => {
        if (p.arrivalTime <= currentTime && p.remainingTime > 0 && p.id !== cur.id && !inQueue.has(p.id)) {
          readyQueue.push(p);
          inQueue.add(p.id);
        }
      });

      if (cur.remainingTime > 0) {
        readyQueue.push(cur);
        inQueue.add(cur.id);
      } else {
        cur.completionTime = currentTime;
        cur.turnaroundTime = cur.completionTime - cur.arrivalTime;
        cur.waitingTime = cur.turnaroundTime - cur.burstTime;
        cur.responseTime = cur.startTime - cur.arrivalTime;
        completed++;
      }
    }
  }

  const totalWait = procs.reduce((acc, p) => acc + p.waitingTime, 0);
  const totalTat = procs.reduce((acc, p) => acc + p.turnaroundTime, 0);
  const totalResp = procs.reduce((acc, p) => acc + p.responseTime, 0);
  const totalBusy = timeline.filter(t => t.pid !== 'IDLE').reduce((acc, t) => acc + (t.end - t.start), 0);
  const totalTime = currentTime || 1;

  return {
    timeline,
    stats: procs,
    avgWait: Number((totalWait / n).toFixed(2)),
    avgTurnaround: Number((totalTat / n).toFixed(2)),
    avgResponse: Number((totalResp / n).toFixed(2)),
    cpuUtil: Number(((totalBusy / totalTime) * 100).toFixed(1)),
    totalTime
  };
}
