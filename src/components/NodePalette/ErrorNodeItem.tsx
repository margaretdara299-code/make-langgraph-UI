/**
 * ErrorNodeItem — draggable palette entry for the Error Node.
 * Follows the same pattern as DecisionNodeItem / EndNodeItem.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

const variants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.12, ease: 'linear' },
    },
};

export default function ErrorNodeItem() {
    const handleDragStart = (e: React.DragEvent) => {
        const dragData = JSON.stringify({
            nodeType: 'error',
            label: 'Error Handler',
            category: 'structure',
            icon: 'ShieldAlert',
        });
        e.dataTransfer.setData('application/reactflow', dragData);
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="node-library-item-wrapper" draggable onDragStart={handleDragStart}>
            <motion.div className="node-library-item" variants={variants}>
                <div className="nli-icon nli-icon--error-light">
                    <ShieldAlert size={12} color="var(--color-error)" strokeWidth={2.4} />
                </div>
                <div className="nli-content">
                    <span className="nli-label">Error Node</span>
                </div>
            </motion.div>
        </div>
    );
}
