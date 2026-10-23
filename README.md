# OS-SimStudio: Comprehensive Operating System Principles Simulation Suite

> **Course Code:** BAITE201  
> **Course Title:** Operating System Principles (L-T-P-C: 3-0-2-4)  
> **Curriculum Aligned With:** Abraham Silberschatz (*Operating System Concepts*, 10th Ed.) & Andrew Tanenbaum (*Modern Operating Systems*)

---

## 🌟 Executive Summary

**OS-SimStudio** is an interactive, full-scale Operating System principles simulation suite engineered specifically for students, researchers, and instructors following the **BAITE201** syllabus. It models the core architectural pillars of modern computing environments: CPU & Process Scheduling, IPC & Deadlocks, Paging & Virtual Memory, and Disk Storage Management.

---

## 🧭 Syllabus Mapping & Feature Matrix

| Module | Syllabus Topics | Implemented Engine & Visualizer | Indicative Experiments Covered |
| :--- | :--- | :--- | :--- |
| **Module 1: OS Basics & Scheduling** | Process Concept, State Transitions, Context Switching, CPU Scheduling, Multithreading | **FCFS, SJF (Preemptive/Non-preemptive), Priority (Preemptive/Non-preemptive), Round Robin (configurable quantum), MLFQ (Multi-Level Feedback Queue)** with interactive Canvas Gantt chart and PCB metric inspector | **Lab 3:** CPU Scheduling |
| **Module 2: IPC, Synchronization & Deadlocks** | Critical Section, Semaphores, Deadlock Avoidance, Detection & Prevention | **Banker's Algorithm** (Safety Check + Resource Request), **Dining Philosophers** (Deadlock simulation vs Resource Hierarchy / Monitor solution), **Producer-Consumer Bounded Buffer** with counting semaphores and blocked process queues | **Lab 4:** Multithreaded Semaphores<br>**Lab 5:** Deadlock Avoidance |
| **Module 3: Memory Management** | Paging, TLB, Page Replacement Algorithms, Demand Paging, Thrashing, Contiguous Allocation | **Page Replacement Simulator** (FIFO, LRU, Optimal, Clock/Second Chance, LFU) with frame matrix, **Belady's Anomaly test**, **TLB Hardware Translation path**, **Dynamic Contiguous Memory Allocation** (First Fit, Best Fit, Worst Fit) with block splitting, deallocation, and compaction | **Lab 6:** Memory Allocation & Paging |
| **Module 4: Storage & Files** | Disk Scheduling, File System Structure & Allocation | **Disk Arm Scheduling** (FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK) with cylinder trajectory chart, **File Allocation Sandbox** (Contiguous, Linked List, Indexed / i-node) | **Lab 7:** File space allocation & Disk Scheduling |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher)

### 2. Launching the Simulator
From the project directory:
```bash
npm start
```
The application will immediately be accessible in your web browser at:
```
http://localhost:3000
```

### 3. Automated Verification Testing
To run the mathematical test suite across all simulation engines:
```bash
npm test
```

---

## 🔬 Interactive Module Capabilities

### Module 1: CPU Scheduling & Process Lifecycle
- **Interactive Process Configuration:** Add/remove processes dynamically with custom Arrival Time, CPU Burst Time, and Priority.
- **Real-Time Gantt Chart:** High-DPI Canvas timeline displaying exact process execution slices and CPU idle intervals.
- **PCB Inspector:** Computes Start Time, Completion Time, Turnaround Time ($TAT = CT - AT$), Waiting Time ($WT = TAT - BT$), Response Time, and CPU Utilization percentage.

### Module 2: Concurrency, Deadlocks & Synchronization
- **Banker's Algorithm:**
  - Interactive matrix inputs for **Allocation**, **Max Claim**, and **Available** vectors (Resources A, B, C).
  - Automatically computes the **Need Matrix** ($Need = Max - Allocation$) and validates invariants ($Allocation \le Max$).
  - Evaluates system state through the Safety Algorithm to locate a valid safe sequence $< P_i, P_j, \dots >$.
  - Simulates the **Resource-Request Algorithm** to verify whether a request can be safely granted or must wait.
- **Dining Philosophers Problem:**
  - Visual circular table with 5 philosophers and 5 chopsticks.
  - One-click toggle between **Deadlock Demonstration** (all philosophers acquire left chopstick simultaneously $\rightarrow$ circular wait) and **Safe Resource Hierarchy / Monitor Solution** (asymmetric acquisition $\rightarrow$ starvation-free).
- **Producer-Consumer Bounded Buffer:**
  - Live simulation of counting semaphores (`mutex`, `empty`, `full`) and thread blocked queues.
  - Demonstrates overflow / underflow prevention and queue serialization.

### Module 3: Memory Management & Virtual Memory
- **Page Replacement Visualizer:**
  - Step-by-step frame allocation matrix across FIFO, LRU, Optimal, Clock (Second Chance), and LFU.
  - Reference string badge stream with color-coded **Page Hit** (emerald) and **Page Fault** (rose) indicators.
  - **Belady's Anomaly Demonstration:** 1-click test using sequence $[1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]$ demonstrating how increasing frames from 3 to 4 increases page faults from 9 to 10 in FIFO.
- **Hardware TLB Translation Flow:**
  - Breaks down virtual addresses into Page Number ($p$) and Offset ($d$).
  - Simulates TLB Hit (Fast path) vs TLB Miss (Page table walk) to compute physical addresses, with authentic page fault traps for unmapped pages.
- **Contiguous Dynamic Allocation:**
  - Visual memory partition bar supporting **First Fit**, **Best Fit**, and **Worst Fit**.
  - Dynamic partition splitting, individual process deallocation with coalescing, and compaction.

### Module 4: Storage & Disk Scheduling
- **Disk Head Seek Trajectory:**
  - Visual cylinder path chart from track 0 to 199.
  - Calculates Total Head Movements (cylinders traversed) and Average Seek Time across FCFS, SSTF, SCAN, C-SCAN, LOOK, and C-LOOK.
- **File Space Allocation Sandbox:**
  - 48-block interactive disk sector map.
  - Illustrates **Contiguous Allocation**, **Linked List Chain** with pointer to EOF, and **Indexed Allocation** via index block / i-node tables.

---

## 📋 Academic Laboratory Report Generator

Click the **📋 Generate Report** button in the top navigation bar to instantly compile a formatted laboratory experiment report containing:
- Course details (`BAITE201 Operating System Principles`)
- Experiment objectives and theory
- Input parameters and system state tables
- Step execution trace and calculated metrics
- Downloadable directly as **Markdown (`.md`)** or printable as **PDF**.

---

## 🛡️ Architecture & Code Standards
- **Zero-Dependency Runtime:** Fast, self-contained Node.js HTTP server.
- **Component Decomposition:** Every module, engine, and view file is factored under 200 lines adhering to modular engineering standards.
- **Aesthetic Design:** Cybernetic dark theme, glassmorphic panels, Google Fonts (`JetBrains Mono`, `Outfit`), and responsive viewport layouts.
