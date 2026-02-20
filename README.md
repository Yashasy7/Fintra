# 🛡️ Fintra: Graph-Based Financial Crime Detection Engine

**RIFT 2026 Hackathon | Financial Crime Detection Track**

Fintra is a specialized financial forensics engine designed to expose sophisticated money muling networks. [cite_start]By leveraging advanced graph algorithms and temporal analysis, Fintra identifies illicit fund flows that traditional database queries often miss, such as multi-hop cycles and high-velocity smurfing[cite: 7, 8].

---

## 🚀 Live Links
- [cite_start]**Live Application:** [https://fintra-plum.vercel.app] (https://fintra-plum.vercel.app) [cite: 61, 65]
- [cite_start]**Demo Video:** [https://www.linkedin.com/posts/yashas-h-l-a36674305_rifthackathon-moneymulingdetection-financialcrime-activity-7430424039845941248-CZgq?utm_source=share&utm_medium=member_desktop&rcm=ACoAAE3f78oBrCdtOkVXi33nJZuJDzhVWOqTlVE] (https://www.linkedin.com/posts/yashas-h-l-a36674305_rifthackathon-moneymulingdetection-financialcrime-activity-7430424039845941248-CZgq?utm_source=share&utm_medium=member_desktop&rcm=ACoAAE3f78oBrCdtOkVXi33nJZuJDzhVWOqTlVE) [cite: 62, 66]
- [cite_start]**GitHub Repository:** [https://github.com/Praju0911/Fintra](https://github.com/Praju0911/Fintra) [cite: 62, 64]

---

## 🛠️ Tech Stack
- [cite_start]**Frontend:** React.js / Vite with **Cytoscape.js** for high-performance interactive graph visualization[cite: 15, 20].
- [cite_start]**Backend:** Python (FastAPI) utilizing **NetworkX** for core graph algorithm execution[cite: 68].
- [cite_start]**Data Handling:** Custom CSV parser for mandatory fields: `transaction_id`, `sender_id`, `receiver_id`, `amount`, and `timestamp`[cite: 12].

---

## 🏗️ System Architecture
[cite_start]Fintra is architected to handle datasets up to 10K transactions in under 30 seconds[cite: 57]:
1. [cite_start]**Ingestion Layer:** Validates CSV schema and converts transactions into a directed multigraph[cite: 11, 17].
2. [cite_start]**Algorithm Pipeline:** Executes three parallel detection threads for Cycles, Smurfing, and Layering[cite: 42].
3. [cite_start]**Scoring Engine:** Assigns a weighted suspicion score to each account based on pattern overlap[cite: 32].
4. [cite_start]**Visualization Engine:** Renders the network, highlighting identified fraud rings in distinct colors[cite: 18, 19].



---

## 🧠 Algorithm Approach & Complexity
[cite_start]Our engine implements the three mandatory patterns required by the RIFT challenge[cite: 44, 48, 52]:

### 1. Circular Fund Routing (Cycles)
- [cite_start]**Logic:** Detects closed loops of length 3 to 5 (e.g., A→B→C→A)[cite: 46].
- **Complexity:** $O(V \cdot (V + E))$ using DFS-based cycle detection. [cite_start]All members are grouped under a unique `ring_id`[cite: 47].

### 2. Smurfing Patterns (Fan-in / Fan-out)
- [cite_start]**Logic:** Identifies 10+ senders to 1 receiver or 1 sender to 10+ receivers within a **72-hour window**[cite: 50, 51].
- **Complexity:** $O(E \cdot \log E)$ due to temporal sorting and sliding window analysis.

### 3. Layered Shell Networks
- [cite_start]**Logic:** Detects chains of 3+ hops passing through "shell" accounts with very low transaction counts (2-3 total)[cite: 54].
- **Complexity:** $O(V + E)$ using Breadth-First Search (BFS) path analysis.

---

## 📈 Suspicion Score Methodology
[cite_start]The **Suspicion Score (0-100)** is a composite metric[cite: 32]:
- **Topology (50%):** Involvement in detected rings/cycles.
- **Velocity (30%):** Frequency of transactions within 72-hour windows.
- **Volume (20%):** Deviation from typical personal account limits.
- [cite_start]**False Positive Handling:** Explicit filters exclude verified payroll and merchant patterns to maintain $\ge70\%$ precision[cite: 57].

---

## 📋 Usage Instructions
1. [cite_start]**Upload:** Upload your transaction CSV[cite: 9].
2. [cite_start]**Visualize:** Hover over nodes to view `account_id` and specific suspicion metrics[cite: 20].
3. [cite_start]**Download Report:** Click the download button for the mandatory JSON output[cite: 21, 22].
4. [cite_start]**Summary Table:** View the Fraud Ring Summary for a high-level overview of detected networks[cite: 35, 36].

---

## 🚧 Known Limitations
- [cite_start]Visualization may be limited to 5,000 nodes for optimal browser performance; backend analysis remains unaffected up to 10,000 nodes[cite: 57].
- [cite_start]No cross-file persistence; each CSV upload is treated as a unique investigation[cite: 58].

---

## 👥 Team Members
- **Henisha Pumbhadiya** - Frontend Lead Developer
- **Vishal Prajwal** - Backend Lead Developer
- **Yashas H L** - Systems & Frontend Engineer

---
©️ RIFT 2026 Hackathon | [cite_start]Financial Crime Detection Track [cite: 1]