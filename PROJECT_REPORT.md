# OS-SimStudio: Comprehensive Technical & Academic Project Report

**Course Code:** BAITE201  
**Course Title:** Operating System Principles (L-T-P-C: 3-0-2-4)  
**Repository:** [https://github.com/Harihara-Subramanian-V/OS-SimStudio](https://github.com/Harihara-Subramanian-V/OS-SimStudio)  
**Standard Curriculum Alignment:** Abraham Silberschatz (*Operating System Concepts*, 10th Edition) & Andrew Tanenbaum (*Modern Operating Systems*, 5th Edition)

---

## 1. Executive Summary

**OS-SimStudio** is an interactive, full-scale Operating System principles simulation suite engineered specifically for students, researchers, and instructors following the **BAITE201** curriculum. The platform bridges the gap between abstract theoretical OS concepts and observable systems behavior by providing real-time, mathematically rigorous simulation engines paired with reactive visualizers.

The application is architected as a lightweight, zero-dependency single-page web environment powered by a custom Node.js ECMAScript Modules (ESM) HTTP server. The entire codebase adheres strictly to high-performance component decomposition standards, ensuring maintainability, auditability, and sub-millisecond execution times.

---

## 2. Curriculum Alignment & Indicative Lab Experiments

The project models the core theoretical pillars and practical laboratory experiments outlined in the BAITE201 syllabus:

| Module | Syllabus Content | Interactive Simulation Engines | Indicative Experiments Covered |
| :--- | :--- | :--- | :--- |
| **Module 1: OS Basics & Scheduling** | Process Concept, States, Context Switching, CPU Scheduling, Threads | **FCFS, SJF (Preemptive/Non-preemptive), Priority (Preemptive/Non-preemptive), Round Robin, MLFQ (3 Queue Levels)** with interactive Canvas Gantt chart and PCB metric inspector | **Lab 3:** CPU Scheduling |
| **Module 2: IPC & Synchronization** | Critical Section, Semaphores, Deadlock Avoidance & Prevention | **Banker's Algorithm** (Safety Check + Resource Request), **Dining Philosophers** (Deadlock simulation vs Resource Hierarchy / Monitor solution), **Producer-Consumer Bounded Buffer** with counting semaphores and blocked queues | **Lab 4:** Multithreaded Semaphores<br>**Lab 5:** Deadlock Avoidance |
| **Module 3: Memory Management** | Contiguous Allocation, Paging, TLB, Page Replacement Algorithms, Belady's Anomaly | **Page Replacement Simulator** (FIFO, LRU, Optimal, Clock, LFU) with frame matrix, **Belady's Anomaly Test**, **TLB Hardware Translation Path**, **Dynamic Contiguous Memory Allocation** (First Fit, Best Fit, Worst Fit) with block splitting, deallocation, and compaction | **Lab 6:** Memory Allocation & Paging |
| **Module 4: Storage & Files** | Disk Scheduling, File System Structure & Allocation | **Disk Arm Scheduling** (FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK) with cylinder trajectory chart, **File Allocation Sandbox** (Contiguous, Linked List, Indexed / i-node) | **Lab 7:** File space allocation & Disk Scheduling |

---

## 3. System Architecture & Engineering Standards

### 3.1 Technology Stack
- **Core Runtime:** Vanilla JavaScript (ES2022+ Native Modules) and HTML5.
- **Styling Architecture:** Pure Vanilla CSS with a centralized semantic design tokens system (`css/tokens.css`). No heavy framework bloat or unvetted external dependencies.
- **Backend Server:** Built-in Node.js `http`, `fs`, `path`, and `url` modules (`server.js`) supporting instant startup (< 5ms) and proper MIME handling.
- **Graphics Pipeline:** HTML5 Canvas API with Device Pixel Ratio (Retina) auto-scaling for crisp timeline charts and memory block diagrams.

### 3.2 Component Decomposition Constraint
Every source file across the project is factored strictly to **$\le 200$ lines** (verified: all 35 source files across CSS, HTML, and JS comply). This eliminates monolithic spaghetti code, enhances unit testability, and enforces clean separation of concerns:
- **Engines (`*-engine.js`)**: Pure mathematical models with zero DOM manipulation.
- **Views (`*-view.js`)**: Reactive DOM controllers and event binders.
- **Templates (`templates/*.html`)**: Asynchronously loaded semantic markup partials.

---

## 4. Deep-Dive into Module Implementation & Mathematical Formulations

### 4.1 Module 1: CPU & Process Scheduling
Models the Process Control Block (PCB) state transitions ($New \rightarrow Ready \rightarrow Running \rightarrow Waiting \rightarrow Terminated$) and scheduling metrics:

$$\text{Turnaround Time } (TAT) = \text{Completion Time } (CT) - \text{Arrival Time } (AT)$$
$$\text{Waiting Time } (WT) = TAT - \text{Burst Time } (BT)$$
$$\text{Response Time } (RT) = \text{First Run Time } (ST) - AT$$
$$\text{CPU Utilization } (U) = \left( \frac{\sum \text{Busy Time}}{\text{Total Timeline Duration}} \right) \times 100\%$$

#### Implemented Schedulers:
1. **First-Come, First-Served (FCFS):** Non-preemptive scheduling based on arrival order.
2. **Shortest Job First (SJF Non-preemptive):** Dispatches shortest burst job; uses FCFS arrival time as deterministic tie-breaker.
3. **Shortest Remaining Time First (SRTF):** Preemptive SJF re-evaluating remaining CPU bursts on every tick and incoming arrival.
4. **Priority Scheduling (Preemptive & Non-preemptive):** Integer priority ranking ($1 = \text{Highest}$) with deterministic arrival tie-breaking.
5. **Round Robin (RR):** Time-quantum slicing with arrival preservation (newly arrived processes enter the ready queue before expired slice re-queueing).
6. **Multi-Level Feedback Queue (MLFQ):**
   - **Queue 0:** High priority, Round Robin ($Q = 2\text{ ms}$).
   - **Queue 1:** Medium priority, Round Robin ($Q = 4\text{ ms}$).
   - **Queue 2:** Low priority, Round Robin ($Q = 8\text{ ms}$) / FCFS.
   - Preemption: Higher-priority queue arrivals immediately preempt lower-priority executions.

---

### 4.2 Module 2: Concurrency, Synchronization & Deadlocks

#### Banker's Algorithm for Deadlock Avoidance:
Maintains vector equations across $n$ processes and $m$ resource types:
$$\text{Need}[i][j] = \text{Max}[i][j] - \text{Allocation}[i][j]$$

1. **Safety Algorithm:**
   - Initialize $\text{Work} = \text{Available}$ and $\text{Finish}[i] = \text{false}$ for all $i$.
   - Search for an index $i$ such that $\text{Finish}[i] == \text{false}$ and $\text{Need}_i \le \text{Work}$.
   - If found: $\text{Work} = \text{Work} + \text{Allocation}_i$, $\text{Finish}[i] = \text{true}$, append $P_i$ to Safe Sequence. Repeat until all finish or deadlock is detected.
2. **Resource-Request Algorithm:**
   - Validates $\text{Request}_i \le \text{Need}_i$.
   - Validates $\text{Request}_i \le \text{Available}$.
   - Pretends to allocate, executes Safety Algorithm, and only commits state if the resulting state is guaranteed safe.

#### Classical Synchronization Visualizers:
- **Dining Philosophers Problem:**
  - 5 philosophers and 5 chopsticks arranged in a circle.
  - One-click toggle between **Deadlock Demonstration** (simultaneous left-chopstick acquisition $\rightarrow$ circular wait) vs. **Asymmetric Resource Hierarchy Solution** (even philosophers acquire left-then-right, odd philosophers acquire right-then-left $\rightarrow$ deadlock-free and starvation-free).
- **Producer-Consumer Bounded Buffer:**
  - Emulates counting semaphores (`mutex = 1`, `empty = CAPACITY - count`, `full = count`).
  - Implements **Blocked Process Waiting Queues**: Threads attempting to produce into a full buffer or consume from an empty buffer enter a blocked state and are reactivated upon semaphore signaling.

---

### 4.3 Module 3: Memory Management & Virtual Memory

#### Contiguous Dynamic Memory Allocation:
- Models dynamic partitioning across physical RAM partitions.
- **First Fit:** Allocates the first free block of sufficient size.
- **Best Fit:** Allocates the smallest free block of sufficient size, minimizing immediate leftover.
- **Worst Fit:** Allocates the largest free block, leaving the largest remaining fragment.
- **Dynamic Partition Splitting:** Blocks automatically split into occupied and free segments.
- **Deallocation & Coalescing:** Releasing an allocated block immediately merges contiguous free neighbours.
- **Compaction Engine:** Consolidates all allocated blocks to low memory, assembling external fragmentation into one contiguous free block.

#### Virtual-to-Physical Address Translation with TLB:
- Demonstrates hardware page mapping for $4\text{ KB}$ page sizes ($12\text{ offset bits}$):
  $$\text{Page Number } (p) = \lfloor \text{Virtual Address} / 4096 \rfloor$$
  $$\text{Offset } (d) = \text{Virtual Address} \pmod{4096}$$
- **TLB Associative Cache (4 entries):** Simulates fast-path hit. On TLB Miss, performs Page Table walk.
- **Page Fault Trap:** Unmapped pages ($p > 7$) trigger authentic OS Page Fault exceptions.

#### Page Replacement Algorithms:
- Evaluates page fault counts, hit ratios, and frame history snapshots:
  - **FIFO:** Fixed physical frame slot preservation via circular replacement pointer.
  - **LRU:** Least Recently Used page replacement via reference timestamps.
  - **Optimal (OPT):** Clairvoyant page replacement identifying the page unreferenced for the longest future distance.
  - **Clock (Second Chance):** Circular inspection inspecting and resetting reference bits.
  - **LFU:** Least Frequently Used with deterministic FIFO tie-breaking.
- **Belady's Anomaly Demonstration:** Automated benchmark with reference string $[1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]$ proving that increasing frame allocation from 3 to 4 increases page faults from 9 to 10 in FIFO.

---

### 4.4 Module 4: Storage & Disk Scheduling

#### Disk Head Arm Traversal:
Traverses cylinder tracks from 0 to 199. Calculates total head travel distance and average seek movements:
- **FCFS:** Services I/O cylinder requests in arrival order.
- **SSTF:** Greedily services the request closest to the current head position.
- **SCAN (Elevator):** Moves in one direction to the disk boundary ($0$ or $199$), servicing all requests along the path, then reverses.
- **C-SCAN (Circular SCAN):** Moves towards one boundary, then jumps directly to the opposite boundary without servicing requests on the return sweep.
- **LOOK & C-LOOK:** Variants of SCAN/C-SCAN that reverse or wrap upon reaching the highest/lowest request rather than traversing to the disk boundary.

#### File Allocation Techniques:
- 48-block sector grid visualizing:
  - **Contiguous Allocation:** Start block and length metadata.
  - **Linked List Allocation:** Linked pointers with EOF termination.
  - **Indexed Allocation:** Index block (i-node) storing pointers to discrete data blocks.

---

## 5. Algorithmic Bug Audit & Remediation Log

During rigorous code review, several edge cases were identified and corrected:

1. **CPU Tie-Breaking:** SJF, SRTF, and Priority algorithms previously lacked secondary sorting on arrival time, causing non-deterministic scheduling for identical bursts. Added FCFS tie-breaking: `((a.burstTime - b.burstTime) || (a.arrivalTime - b.arrivalTime))`.
2. **Round Robin Queue Termination:** When the ready queue emptied while future processes had already arrived, the engine prematurely exited the loop. Implemented arrival inspection to prevent early termination.
3. **MLFQ Inter-Queue Preemption:** Previously, Q1 and Q2 processes executed uninterrupted. Refactored to slice-level preemption that halts lower-priority slices immediately when a higher-priority job enters Q0.
4. **Banker's Stale State & Invariants:** Added immediate DOM input re-reading before request testing and introduced invariant validation that blocks calculation if $\text{Allocation} > \text{Max}$.
5. **FIFO Physical Frame Shifting:** Replaced naive array shifting (`frames.shift()`) with a circular pointer (`fifoPointer = (fifoPointer + 1) % frameCount`), maintaining consistent physical frame row locations in the UI.
6. **Contiguous Memory Overwriting:** Updated dynamic allocation to split partitions, coalesce adjacent free blocks on deallocation, and support sliding compaction.
7. **Disk Trajectory Array Mutation:** Replaced in-place array mutation (`.reverse()`) in C-SCAN and C-LOOK with non-mutating spreads (`[...arr].reverse()`) and deduplicated consecutive identical cylinder requests.

---

## 6. Automated Verification & Test Results

The suite includes an automated test runner (`npm test`) executing end-to-end assertions on all simulation engines:

```text
=== RUNNING OS-SIMSTUDIO ENGINE VERIFICATION ===

✔ CPU FCFS Verified: Completed 3 processes, avgWait = 1.33
✔ CPU SJF Tie-Breaker Verified: Process P1 scheduled first
✔ CPU Round Robin Verified: All processes finished successfully
✔ CPU MLFQ Preemptive Verified: Total Time = 12
✔ Banker Safety Verified: Safe Sequence: P1 -> P3 -> P0 -> P2 -> P4
✔ Banker Valid Request Granted: Request GRANTED safely. Safe Sequence: < P1 → P3 → P0 → P2 → P4 >
✔ Banker Excessive Request Blocked correctly: Process P0 exceeded its maximum claim (Need: [7,4,3])
✔ Paging FIFO Verified: Physical frames maintained stable slot indexing
✔ Belady Anomaly Confirmed: 3 frames = 9 , 4 frames = 10
✔ Disk SCAN Verified: Total Head Movements = 331 cylinders

=== ALL SIMULATION ENGINES VERIFIED SUCCESSFULLY ===
```

### HTTP Endpoint Audit:
- `http://localhost:3000/` $\rightarrow$ **200 OK**
- `http://localhost:3000/templates/cpu.html` $\rightarrow$ **200 OK**
- `http://localhost:3000/templates/sync.html` $\rightarrow$ **200 OK**
- `http://localhost:3000/templates/memory.html` $\rightarrow$ **200 OK**
- `http://localhost:3000/templates/storage.html` $\rightarrow$ **200 OK**

---

## 7. Academic Laboratory Report Generator

A built-in **Academic Laboratory Report Generator** allows students to compile formal lab experiment reports with a single click.

### Features:
- Automatically formats Course Code (`BAITE201`), experiment title, theory, parameters, step traces, and metrics.
- Export options: Direct **Markdown (`.md`)** download or formatted **Print / Save as PDF**.

---

## 8. Deployment & Usage Instructions

### 8.1 Local Execution
```bash
# Clone the repository
git clone https://github.com/Harihara-Subramanian-V/OS-SimStudio.git
cd OS-SimStudio

# Run automated mathematical verification
npm test

# Start the simulation web server
npm start
```
Access the application at `http://localhost:3000`.

### 8.2 Repository Structure
```text
OS-SimStudio/
├── .gitignore
├── README.md
├── PROJECT_REPORT.md             # This comprehensive academic report
├── package.json
├── server.js                     # Zero-dependency ESM HTTP server
├── index.html                    # Semantic shell layout
├── css/
│   ├── tokens.css                # Color, spacing, and font design tokens
│   ├── base.css                  # Typography and scaffolding
│   ├── buttons.css               # Button styles
│   ├── components.css            # Panels, tables, forms, metrics
│   ├── modals.css                # Report modal and toast notifications
│   ├── cpu.css                   # CPU and Gantt chart layout
│   ├── sync.css                  # Dining philosophers and buffer layout
│   ├── memory.css                # Paging and memory bar layout
│   └── storage.css               # Disk seek canvas and blocks grid
├── js/
│   ├── app.js                    # Application orchestrator
│   ├── utils.js                  # Retina canvas, colors, and helpers
│   └── modules/
│       ├── cpu/
│       │   ├── cpu-engine.js     # FCFS, SJF, SRTF, Priority, RR
│       │   ├── cpu-mlfq.js       # Preemptive MLFQ engine
│       │   ├── cpu-view.js       # Process table and metrics view
│       │   └── gantt-chart.js    # Canvas timeline renderer
│       ├── sync/
│       │   ├── banker-engine.js  # Safety check & request algorithm
│       │   ├── banker-view.js    # Matrix inputs and trace visualizer
│       │   ├── dining-philosophers.js # Dining philosophers simulation
│       │   └── producer-consumer.js   # Bounded buffer and semaphores
│       ├── memory/
│       │   ├── paging-engine.js  # FIFO, LRU, OPT, Clock, LFU, Belady
│       │   ├── paging-view.js    # Frame matrix visualizer
│       │   ├── tlb-visualizer.js # Hardware address translation
│       │   └── contiguous-alloc.js # First/Best/Worst fit & compaction
│       ├── storage/
│       │   ├── disk-engine.js    # FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK
│       │   ├── disk-view.js      # Cylinder seek trajectory canvas
│       │   └── file-alloc-view.js# Contiguous, linked, indexed blocks
│       └── report/
│           ├── lab-presets.js    # BAITE201 indicative lab presets
│           └── report-generator.js # Markdown/PDF academic report
└── test/
    └── verify-simulators.js      # Automated unit test suite
```
