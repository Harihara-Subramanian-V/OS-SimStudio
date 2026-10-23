/**
 * Lab Experiment Presets directly mapped to BAITE201 Syllabus Indicative Experiments (M1 - M4)
 */
import { setCpuProcesses } from '../cpu/cpu-view.js';
import { setBankerPreset } from '../sync/banker-view.js';
import { setPagingPreset } from '../memory/paging-view.js';
import { setDiskPreset } from '../storage/disk-view.js';
import { showToast } from '../../utils.js';

export const LAB_EXPERIMENTS = {
  LAB_3: {
    title: 'Lab 3: CPU Scheduling Comparative Analysis',
    module: 'cpu',
    apply: () => {
      setCpuProcesses([
        { id: 'P1', arrivalTime: 0, burstTime: 8, priority: 3 },
        { id: 'P2', arrivalTime: 1, burstTime: 4, priority: 1 },
        { id: 'P3', arrivalTime: 2, burstTime: 9, priority: 4 },
        { id: 'P4', arrivalTime: 3, burstTime: 5, priority: 2 }
      ], 'RR', 3);
      showToast('Loaded Lab 3: CPU Scheduling (Round Robin Q=3)', 'success');
    }
  },
  LAB_4: {
    title: 'Lab 4: Multithreading & Semaphores Synchronization',
    module: 'sync',
    apply: () => {
      showToast('Loaded Lab 4: Semaphores & Synchronization Sandbox', 'success');
    }
  },
  LAB_5: {
    title: "Lab 5: Deadlock Avoidance with Banker's Algorithm",
    module: 'sync',
    apply: () => {
      setBankerPreset(
        [[0, 1, 0], [2, 0, 0], [3, 0, 2], [2, 1, 1], [0, 0, 2]],
        [[7, 5, 3], [3, 2, 2], [9, 0, 2], [2, 2, 2], [4, 3, 3]],
        [3, 3, 2]
      );
      showToast("Loaded Lab 5: Banker's Algorithm Standard Benchmark", 'success');
    }
  },
  LAB_6: {
    title: 'Lab 6: Memory Allocation & Page Replacement Algorithms',
    module: 'memory',
    apply: () => {
      setPagingPreset([7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1], 3, 'LRU');
      showToast('Loaded Lab 6: Page Replacement (LRU, 3 Frames)', 'success');
    }
  },
  LAB_7: {
    title: 'Lab 7: Disk Scheduling & File Space Allocation',
    module: 'storage',
    apply: () => {
      setDiskPreset([98, 183, 37, 122, 14, 124, 65, 67], 53, 'SCAN', 'UP');
      showToast('Loaded Lab 7: Disk Scheduling (SCAN Algorithm)', 'success');
    }
  }
};

export function loadLabExperiment(labKey, switchTabCallback) {
  const exp = LAB_EXPERIMENTS[labKey];
  if (!exp) return;
  if (switchTabCallback) switchTabCallback(exp.module);
  setTimeout(() => exp.apply(), 50);
}
