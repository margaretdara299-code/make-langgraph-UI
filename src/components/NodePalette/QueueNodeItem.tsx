import React from "react";
import { motion } from "framer-motion";
import { Layers } from "lucide-react";

const variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.12, ease: "linear" },
  },
};

export default function QueueNodeItem() {
  const handleDragStart = (e: React.DragEvent) => {
    const dragData = JSON.stringify({
      nodeType: "queue",
      label: "Queue",
      category: "structure",
      icon: "Layers",
      queue_type: "human",
    });
    e.dataTransfer.setData("application/reactflow", dragData);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      className="node-library-item-wrapper"
      draggable
      onDragStart={handleDragStart}
    >
      <motion.div className="node-library-item" variants={variants}>
        <div
          className="nli-icon"
          style={{ background: "rgba(217,119,6,0.10)" }}
        >
          <Layers size={12} color="#D97706" strokeWidth={2.2} />
        </div>
        <div className="nli-content">
          <span className="nli-label">Queue</span>
        </div>
      </motion.div>
    </div>
  );
}
