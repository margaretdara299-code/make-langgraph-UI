import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';

const variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.12, ease: 'linear' }
  }
};

export default function SubFlowNodeItem() {
    const handleSubFlowDragStart = (e: React.DragEvent) => {
        const dragData = JSON.stringify({
            nodeType: 'subflow',
            label: 'Group',
            category: 'structure',
            icon: 'Layers',
        });
        e.dataTransfer.setData('application/reactflow', dragData);
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="node-library-item-wrapper" draggable onDragStart={handleSubFlowDragStart}>
            <motion.div className="node-library-item" variants={variants} whileHover={{ x: 3 }}>
                <div className="nli-icon" style={{ background: '#e6f7ff' }}>
                    <Layers size={12} color="#1890ff" strokeWidth={2.4} />
                </div>
                <div className="nli-content">
                    <span className="nli-label">Group / Sub-Flow</span>
                </div>
                <div className="nli-drag-hint">⠿</div>
            </motion.div>
        </div>
    );
}
