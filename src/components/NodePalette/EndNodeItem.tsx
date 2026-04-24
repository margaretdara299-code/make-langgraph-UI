import React from "react";
import { motion } from "framer-motion";
import { Square } from "lucide-react";

const variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.12, ease: "linear" },
  },
};

export default function EndNodeItem() {
  const handleEndDragStart = (e: React.DragEvent) => {
    const dragData = JSON.stringify({
      nodeType: "end",
      label: "End",
      category: "structure",
      icon: "Square",
    });
    e.dataTransfer.setData("application/reactflow", dragData);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      className="node-library-item-wrapper"
      draggable
      onDragStart={handleEndDragStart}
    >
      <motion.div className="node-library-item" variants={variants}>
        <div className="nli-icon nli-icon--common">
          <Square size={12} color="#000000" strokeWidth={2.4} />
        </div>
        <div className="nli-content">
          <span className="nli-label">End Node</span>
        </div>       
      </motion.div>
    </div>
  );
}
