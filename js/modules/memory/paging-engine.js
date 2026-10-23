/**
 * Page Replacement Algorithms Engine (FIFO, LRU, Optimal, Clock, LFU)
 */

export function runPageReplacement(referenceString, frameCount, algorithm = 'FIFO') {
  const pages = referenceString.map(Number);
  const steps = [];
  const frames = [];
  let faults = 0;
  let hits = 0;

  const usageHistory = new Map(); // for LRU (page -> last used index)
  const freqMap = new Map(); // for LFU (page -> count)
  const loadOrder = new Map(); // for FIFO / LFU tie break (page -> load timestamp)
  const referenceBits = new Map(); // for Clock (page -> 0 or 1)
  let fifoPointer = 0;
  let clockPointer = 0;

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    freqMap.set(page, (freqMap.get(page) || 0) + 1);
    usageHistory.set(page, i);

    let isHit = frames.includes(page);
    let victim = null;

    if (isHit) {
      hits++;
      referenceBits.set(page, 1);
    } else {
      faults++;
      if (frames.length < frameCount) {
        frames.push(page);
        referenceBits.set(page, 1);
        loadOrder.set(page, i);
      } else {
        if (algorithm === 'FIFO') {
          victim = frames[fifoPointer];
          frames[fifoPointer] = page;
          loadOrder.set(page, i);
          fifoPointer = (fifoPointer + 1) % frameCount;
        } else if (algorithm === 'LRU') {
          let lruPage = frames[0];
          let minTime = usageHistory.get(lruPage) ?? 0;
          for (const f of frames) {
            const lastTime = usageHistory.get(f) ?? -1;
            if (lastTime < minTime) {
              minTime = lastTime;
              lruPage = f;
            }
          }
          victim = lruPage;
          const vIdx = frames.indexOf(victim);
          frames[vIdx] = page;
        } else if (algorithm === 'OPT') {
          let farthestDist = -1;
          let optVictim = frames[0];
          for (const f of frames) {
            const nextIdx = pages.slice(i + 1).indexOf(f);
            if (nextIdx === -1) {
              optVictim = f;
              break;
            }
            if (nextIdx > farthestDist) {
              farthestDist = nextIdx;
              optVictim = f;
            }
          }
          victim = optVictim;
          const vIdx = frames.indexOf(victim);
          frames[vIdx] = page;
        } else if (algorithm === 'CLOCK') {
          while (true) {
            const cand = frames[clockPointer];
            const bit = referenceBits.get(cand) || 0;
            if (bit === 1) {
              referenceBits.set(cand, 0);
              clockPointer = (clockPointer + 1) % frameCount;
            } else {
              victim = cand;
              frames[clockPointer] = page;
              referenceBits.set(page, 1);
              clockPointer = (clockPointer + 1) % frameCount;
              break;
            }
          }
        } else if (algorithm === 'LFU') {
          let minFreq = Infinity;
          let lfuVictim = frames[0];
          for (const f of frames) {
            const count = freqMap.get(f) || 0;
            const oldest = loadOrder.get(f) || 0;
            const victimOldest = loadOrder.get(lfuVictim) || 0;
            if (count < minFreq || (count === minFreq && oldest < victimOldest)) {
              minFreq = count;
              lfuVictim = f;
            }
          }
          victim = lfuVictim;
          const vIdx = frames.indexOf(victim);
          frames[vIdx] = page;
          loadOrder.set(page, i);
        }
      }
    }

    steps.push({
      stepIndex: i,
      page,
      isHit,
      victim,
      framesSnapshot: [...frames]
    });
  }

  const total = pages.length || 1;
  return {
    steps,
    totalFaults: faults,
    totalHits: hits,
    faultRatio: Number(((faults / total) * 100).toFixed(1)),
    hitRatio: Number(((hits / total) * 100).toFixed(1)),
    referenceString: pages,
    frameCount,
    algorithm
  };
}

export function testBeladyAnomaly() {
  const beladySeq = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5];
  const res3 = runPageReplacement(beladySeq, 3, 'FIFO');
  const res4 = runPageReplacement(beladySeq, 4, 'FIFO');
  return {
    sequence: beladySeq,
    res3,
    res4,
    anomalyConfirmed: res4.totalFaults > res3.totalFaults
  };
}
