/**
 * Disk Arm Scheduling Algorithms Engine
 * (FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK)
 */

export function runDiskScheduling(queue, initialHead, algorithm = 'FCFS', options = { diskSize: 200, direction: 'UP' }) {
  const reqs = queue.map(Number);
  const diskSize = options.diskSize || 200;
  const direction = options.direction || 'UP';

  let rawSequence = [initialHead];
  let current = initialHead;

  if (algorithm === 'FCFS') {
    rawSequence = [initialHead, ...reqs];
  } else if (algorithm === 'SSTF') {
    const remaining = [...reqs];
    while (remaining.length > 0) {
      remaining.sort((a, b) => Math.abs(a - current) - Math.abs(b - current));
      const next = remaining.shift();
      rawSequence.push(next);
      current = next;
    }
  } else if (algorithm === 'SCAN') {
    const lower = reqs.filter(r => r < initialHead).sort((a, b) => b - a);
    const higher = reqs.filter(r => r > initialHead).sort((a, b) => a - b);

    if (direction === 'UP') {
      rawSequence = [initialHead, ...higher, diskSize - 1, ...lower];
    } else {
      rawSequence = [initialHead, ...lower, 0, ...higher];
    }
  } else if (algorithm === 'C-SCAN') {
    const lower = reqs.filter(r => r < initialHead).sort((a, b) => a - b);
    const higher = reqs.filter(r => r > initialHead).sort((a, b) => a - b);

    if (direction === 'UP') {
      rawSequence = [initialHead, ...higher, diskSize - 1, 0, ...lower];
    } else {
      rawSequence = [initialHead, ...[...lower].reverse(), 0, diskSize - 1, ...[...higher].reverse()];
    }
  } else if (algorithm === 'LOOK') {
    const lower = reqs.filter(r => r < initialHead).sort((a, b) => b - a);
    const higher = reqs.filter(r => r > initialHead).sort((a, b) => a - b);

    if (direction === 'UP') {
      rawSequence = [initialHead, ...higher, ...lower];
    } else {
      rawSequence = [initialHead, ...lower, ...higher];
    }
  } else if (algorithm === 'C-LOOK') {
    const lower = reqs.filter(r => r < initialHead).sort((a, b) => a - b);
    const higher = reqs.filter(r => r > initialHead).sort((a, b) => a - b);

    if (direction === 'UP') {
      rawSequence = [initialHead, ...higher, ...lower];
    } else {
      rawSequence = [initialHead, ...[...lower].reverse(), ...[...higher].reverse()];
    }
  }

  // Deduplicate consecutive identical tracks
  const sequence = [];
  rawSequence.forEach(t => {
    if (sequence.length === 0 || sequence[sequence.length - 1] !== t) {
      sequence.push(t);
    }
  });

  // Calculate total head movement
  let totalHeadMovement = 0;
  const seekSteps = [];

  for (let i = 0; i < sequence.length - 1; i++) {
    const diff = Math.abs(sequence[i + 1] - sequence[i]);
    totalHeadMovement += diff;
    seekSteps.push({
      from: sequence[i],
      to: sequence[i + 1],
      distance: diff
    });
  }

  const avgSeek = reqs.length > 0 ? Number((totalHeadMovement / reqs.length).toFixed(2)) : 0;

  return {
    sequence,
    seekSteps,
    totalHeadMovement,
    avgSeek,
    algorithm,
    initialHead,
    diskSize
  };
}
