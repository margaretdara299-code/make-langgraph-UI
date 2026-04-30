# 🧾 Project Change Log

---

## ⏱ Mon, Apr 28, 2026, 10:15:32 AM

### 📌 Action
Added FlowCanvas component with drag-and-drop node support using React Flow

### 💬 Prompt
Create a canvas component that supports dragging skill nodes from a sidebar, connecting them with edges, and displaying node metadata on click

### 📂 Files Changed
- src/components/FlowCanvas/FlowCanvas.tsx
- src/components/FlowCanvas/FlowCanvas.css
- src/store/flowStore.ts

---

## ⏱ Mon, Apr 28, 2026, 02:44:18 PM

### 📌 Action
Refactored NodeLibrary sidebar to group skills by category with collapsible sections

### 💬 Prompt
The sidebar is showing all skills in a flat list. Group them by their category field and make each group collapsible using Ant Design Collapse component

### 📂 Files Changed
- src/components/NodeLibrary/NodeLibrary.tsx
- src/components/NodeLibrary/NodeLibrary.module.css
- src/types/skill.ts

---

## ⏱ Tue, Apr 29, 2026, 09:03:55 AM

### 📌 Action
Fixed execution animation not triggering on Error node type during flow run

### 💬 Prompt
The flow run animation works on Success and Processing nodes but skips Error nodes entirely. Fix the animation so Error nodes also animate during execution with a red pulse effect

### 📂 Files Changed
- src/components/FlowCanvas/FlowCanvas.tsx
- src/utils/animationUtils.ts
- src/styles/nodes.css

---
