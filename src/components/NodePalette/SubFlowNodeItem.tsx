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

export default function SubFlowNodeItem() {
  const handleSubFlowDragStart = (e: React.DragEvent) => {
    const dragData = JSON.stringify({
      nodeType: "subflow",
      label: "Group",
      category: "structure",
      icon: "Layers",
    });
    e.dataTransfer.setData("application/reactflow", dragData);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      className="node-library-item-wrapper"
      draggable
      onDragStart={handleSubFlowDragStart}
    >
      <motion.div className="node-library-item" variants={variants}>
        <div className="nli-icon nli-icon--common">
          <Layers size={12} color="currentColor" strokeWidth={2.4} />
        </div>
        <div className="nli-content">
          <span className="nli-label">Group Node</span>
        </div>        
      </motion.div>
    </div>
  );
}
