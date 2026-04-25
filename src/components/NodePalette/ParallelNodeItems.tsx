import { motion } from "framer-motion";
import { GitFork, Merge } from "lucide-react";

const variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.12, ease: "linear" },
  },
};

export function ParallelSplitItem() {
  const handleDragStart = (e: React.DragEvent) => {
    const dragData = JSON.stringify({
      nodeType: "parallel_split",
      label: "Parallel Split",
      category: "structure",
      icon: "GitFork",
    });
    e.dataTransfer.setData("application/reactflow", dragData);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="node-library-item-wrapper" draggable onDragStart={handleDragStart}>
      <motion.div className="node-library-item" variants={variants}>
        <div className="nli-icon nli-icon--common">
          <GitFork size={12} color="var(--color-node-split)" strokeWidth={2.4} />
        </div>
        <div className="nli-content">
          <span className="nli-label">Split</span>
        </div>        
      </motion.div>
    </div>
  );
}

export function ParallelJoinItem() {
  const handleDragStart = (e: React.DragEvent) => {
    const dragData = JSON.stringify({
      nodeType: "parallel_join",
      label: "Parallel Join",
      category: "structure",
      icon: "Merge",
    });
    e.dataTransfer.setData("application/reactflow", dragData);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="node-library-item-wrapper" draggable onDragStart={handleDragStart}>
      <motion.div className="node-library-item" variants={variants}>
        <div className="nli-icon nli-icon--common">
          <Merge size={12} color="var(--color-node-join)" strokeWidth={2.4} />
        </div>
        <div className="nli-content">
          <span className="nli-label">Merge</span>
        </div>        
      </motion.div>
    </div>
  );
}
