import React from 'react';
import { motion } from 'framer-motion';

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
            icon: '▶️',
        });
        e.dataTransfer.setData('application/reactflow', dragData);
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="node-library-item-wrapper" draggable onDragStart={handleStartDragStart}>
            <motion.div className="node-library-item" variants={variants} whileHover={{ x: 3 }}>
                <div className="nli-icon" style={{ background: '#f6ffed' }}>
                    <span style={{ fontSize: '13px', color: '#52c41a' }}>▶️</span>
                </div>
                <div className="nli-content">
                    <span className="nli-label">Start Node</span>
                </div>
                <div className="nli-drag-hint">⠿</div>
            </motion.div>
        </div>
    );
}
