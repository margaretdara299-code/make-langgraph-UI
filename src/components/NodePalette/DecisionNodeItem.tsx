import { motion } from 'framer-motion';
import { Split } from 'lucide-react';

const variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.12, ease: 'linear' }
  }
};

export default function DecisionNodeItem() {
    const handleDecisionDragStart = (e: React.DragEvent) => {
        const dragData = JSON.stringify({
            nodeType: 'decision',
            label: 'Decision',
            category: 'structure',
            icon: 'Split',
        });
        e.dataTransfer.setData('application/reactflow', dragData);
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="node-library-item-wrapper" draggable onDragStart={handleDecisionDragStart}>
            <motion.div className="node-library-item" variants={variants} whileHover={{ x: 3 }}>
                <div className="nli-icon" style={{ background: '#fff7e6' }}>
                    <Split size={12} color="#fa8c16" strokeWidth={2.4} />
                </div>
                <div className="nli-content">
                    <span className="nli-label">Decision Node</span>
                </div>
                <div className="nli-drag-hint">⠿</div>
            </motion.div>
        </div>
    );
}
