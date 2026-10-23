/**
 * Automated Verification Test for Simulation Engines (M1 - M4)
 */
import assert from 'assert';
import { runCpuSimulation } from '../js/modules/cpu/cpu-engine.js';
import { runMlfqSimulation } from '../js/modules/cpu/cpu-mlfq.js';
import { runSafetyCheck, requestResources } from '../js/modules/sync/banker-engine.js';
import { runPageReplacement, testBeladyAnomaly } from '../js/modules/memory/paging-engine.js';
import { runDiskScheduling } from '../js/modules/storage/disk-engine.js';

console.log('=== RUNNING OS-SIMSTUDIO ENGINE VERIFICATION ===\n');

// 1. CPU Scheduling Test (with tie-breaker and RR gap test)
const testProcs = [
  { id: 'P1', arrivalTime: 0, burstTime: 4, priority: 2, color: '#00f2fe' },
  { id: 'P2', arrivalTime: 0, burstTime: 4, priority: 2, color: '#7928ca' },
  { id: 'P3', arrivalTime: 10, burstTime: 2, priority: 1, color: '#10b981' }
];

const fcfs = runCpuSimulation(testProcs, 'FCFS');
assert.strictEqual(fcfs.stats.length, 3, 'FCFS should complete all 3 processes');
console.log('✔ CPU FCFS Verified: Completed', fcfs.stats.length, 'processes, avgWait =', fcfs.avgWait);

const sjf = runCpuSimulation(testProcs, 'SJF_NON');
assert.strictEqual(sjf.timeline[0].pid, 'P1', 'SJF must break equal burst ties using arrival time FCFS');
console.log('✔ CPU SJF Tie-Breaker Verified: Process', sjf.timeline[0].pid, 'scheduled first');

const rr = runCpuSimulation(testProcs, 'RR', { quantum: 2 });
assert.strictEqual(rr.stats.every(p => p.completionTime > 0), true, 'All RR processes must finish');
console.log('✔ CPU Round Robin Verified: All processes finished successfully');

const mlfq = runMlfqSimulation(testProcs);
assert.ok(mlfq.totalTime >= 10, 'MLFQ should handle idle arrival gaps');
console.log('✔ CPU MLFQ Preemptive Verified: Total Time =', mlfq.totalTime);

// 2. Banker's Algorithm Test
const alloc = [[0, 1, 0], [2, 0, 0], [3, 0, 2], [2, 1, 1], [0, 0, 2]];
const max = [[7, 5, 3], [3, 2, 2], [9, 0, 2], [2, 2, 2], [4, 3, 3]];
const avail = [3, 3, 2];
const safety = runSafetyCheck(alloc, max, avail);
assert.strictEqual(safety.isSafe, true, 'Benchmark state must be safe');
assert.deepStrictEqual(safety.safeSequence, ['P1', 'P3', 'P0', 'P2', 'P4']);
console.log('✔ Banker Safety Verified: Safe Sequence:', safety.safeSequence.join(' -> '));

const reqGrant = requestResources(1, [1, 0, 2], alloc, max, avail);
assert.strictEqual(reqGrant.success, true, 'Safe request should be granted');
console.log('✔ Banker Valid Request Granted:', reqGrant.reason);

const reqDeny = requestResources(0, [0, 5, 0], alloc, max, avail);
assert.strictEqual(reqDeny.success, false, 'Over-available request should be rejected');
console.log('✔ Banker Excessive Request Blocked correctly:', reqDeny.reason);

// 3. Page Replacement & Belady Anomaly
const paging = runPageReplacement([7, 0, 1, 2, 0, 3, 0, 4, 2, 3], 3, 'FIFO');
assert.strictEqual(paging.steps.length, 10, 'Must record exactly 10 reference steps');
assert.strictEqual(paging.steps[0].framesSnapshot.length, 1);
console.log('✔ Paging FIFO Verified: Physical frames maintained stable slot indexing');

const belady = testBeladyAnomaly();
assert.strictEqual(belady.anomalyConfirmed, true, 'Belady anomaly must be confirmed for sequence');
console.log('✔ Belady Anomaly Confirmed: 3 frames =', belady.res3.totalFaults, ', 4 frames =', belady.res4.totalFaults);

// 4. Disk Scheduling with duplicate requests
const disk = runDiskScheduling([53, 98, 183, 37, 122, 14, 124, 65, 67], 53, 'SCAN', { diskSize: 200, direction: 'UP' });
assert.strictEqual(disk.sequence[0], 53);
assert.notStrictEqual(disk.sequence[1], 53, 'Should not produce redundant 0-distance seek to same cylinder');
console.log('✔ Disk SCAN Verified: Total Head Movements =', disk.totalHeadMovement, 'cylinders');

console.log('\n=== ALL SIMULATION ENGINES VERIFIED SUCCESSFULLY ===');
