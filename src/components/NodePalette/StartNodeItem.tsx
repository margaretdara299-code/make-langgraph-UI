import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

const variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.12, ease: 'linear' }
  }
};

export default function StartNodeItem() {
    const handleStartDragStart = (e: React.DragEvent) => {
        const dragData = JSON.stringify({
            nodeType: 'start',
            label: 'Start',
            category: 'structure',
            icon: 'Play',
        });
        e.dataTransfer.setData('application/reactflow', dragData);
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="node-library-item-wrapper" draggable onDragStart={handleStartDragStart}>
            <motion.div className="node-library-item" variants={variants} whileHover={{ x: 3 }}>
                <div className="nli-icon" style={{ background: '#f6ffed' }}>
                    <Play size={12} color="#52c41a" fill="#52c41a" strokeWidth={2.4} />
                </div>
                <div className="nli-content">
                    <span className="nli-label">Start Workflow</span>
                </div>
                <div className="nli-drag-hint">⠿</div>
            </motion.div>
        </div>
    );
}
