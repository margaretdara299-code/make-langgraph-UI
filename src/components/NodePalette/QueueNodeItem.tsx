import { motion } from "framer-motion";
import { ListOrdered } from "lucide-react";

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
      icon: "ListOrdered",
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
        <div className="nli-icon nli-icon--common">
          <ListOrdered size={12} color="var(--color-node-queue)" strokeWidth={2.4} />
        </div>
        <div className="nli-content">
          <span className="nli-label">Queue Node</span>
        </div>        
      </motion.div>
    </div>
  );
}
