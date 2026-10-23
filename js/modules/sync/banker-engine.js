/**
 * Banker's Algorithm Engine for Deadlock Avoidance
 * Implements Safety Algorithm & Resource-Request Algorithm
 */

export function calculateNeedMatrix(maxMatrix, allocMatrix) {
  const numP = maxMatrix.length;
  const numR = maxMatrix[0].length;
  const need = [];

  for (let i = 0; i < numP; i++) {
    need[i] = [];
    for (let j = 0; j < numR; j++) {
      need[i][j] = Math.max(0, maxMatrix[i][j] - allocMatrix[i][j]);
    }
  }
  return need;
}

export function runSafetyCheck(allocMatrix, maxMatrix, availableVector) {
  const numP = allocMatrix.length;
  const numR = availableVector.length;
  const need = calculateNeedMatrix(maxMatrix, allocMatrix);

  const work = [...availableVector];
  const finish = new Array(numP).fill(false);
  const safeSequence = [];
  const traceSteps = [];

  let found = true;
  while (safeSequence.length < numP && found) {
    found = false;
    for (let i = 0; i < numP; i++) {
      if (!finish[i]) {
        // Check if Need_i <= Work
        let canAllocate = true;
        for (let j = 0; j < numR; j++) {
          if (need[i][j] > work[j]) {
            canAllocate = false;
            break;
          }
        }

        if (canAllocate) {
          // Process can complete and release resources
          for (let j = 0; j < numR; j++) {
            work[j] += allocMatrix[i][j];
          }
          finish[i] = true;
          safeSequence.push(`P${i}`);
          traceSteps.push({
            process: `P${i}`,
            workSnapshot: [...work],
            allocated: [...allocMatrix[i]],
            need: [...need[i]],
            status: 'EXECUTED_AND_RELEASED'
          });
          found = true;
          break;
        }
      }
    }
  }

  const isSafe = safeSequence.length === numP;
  return {
    isSafe,
    safeSequence,
    traceSteps,
    needMatrix: need,
    finalWork: work,
    deadlockedProcesses: isSafe ? [] : finish.map((f, idx) => (!f ? `P${idx}` : null)).filter(Boolean)
  };
}

export function requestResources(processIndex, requestVector, allocMatrix, maxMatrix, availableVector) {
  const need = calculateNeedMatrix(maxMatrix, allocMatrix);
  const numR = availableVector.length;

  // 1. Check Request <= Need
  for (let j = 0; j < numR; j++) {
    if (requestVector[j] > need[processIndex][j]) {
      return { success: false, reason: `Process P${processIndex} exceeded its maximum claim (Need: [${need[processIndex]}])` };
    }
  }

  // 2. Check Request <= Available
  for (let j = 0; j < numR; j++) {
    if (requestVector[j] > availableVector[j]) {
      return { success: false, reason: `Resources not available. Process P${processIndex} must wait.` };
    }
  }

  // 3. Pretend to allocate
  const testAlloc = allocMatrix.map(row => [...row]);
  const testMax = maxMatrix.map(row => [...row]);
  const testAvail = [...availableVector];

  for (let j = 0; j < numR; j++) {
    testAvail[j] -= requestVector[j];
    testAlloc[processIndex][j] += requestVector[j];
  }

  // 4. Run safety check on pretend state
  const safety = runSafetyCheck(testAlloc, testMax, testAvail);
  if (safety.isSafe) {
    return {
      success: true,
      safeSequence: safety.safeSequence,
      newAlloc: testAlloc,
      newAvail: testAvail,
      reason: `Request GRANTED safely. Safe Sequence: < ${safety.safeSequence.join(' → ')} >`
    };
  } else {
    return {
      success: false,
      reason: `Request DENIED: Allocating would lead to an UNSAFE STATE (Deadlock risk).`
    };
  }
}
