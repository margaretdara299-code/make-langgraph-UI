/**
 * StructureSection — A component for structural canvas nodes (like Sub-Flow).
 * Extracted from NodePalette to keep it clean.
 */

import type { StructureSectionProps } from '@/interfaces';

// No imports needed from antd currently

export default function StructureSection({ search }: StructureSectionProps) {
    const showStructure = !search || 'sub-flow'.includes(search.toLowerCase());

    /** Drag handler for the hardcoded Sub-Flow palette item */
    const handleSubFlowDragStart = (e: React.DragEvent) => {
        const dragData = JSON.stringify({
            nodeType: 'subflow',
            label: 'Sub-Flow',
            category: 'structure',
            icon: '📦',
        });
        e.dataTransfer.setData('application/reactflow', dragData);
        e.dataTransfer.effectAllowed = 'move';
    };

    if (!showStructure) return null;

    return (
        <div className="node-palette__structure-section">
            <div className="node-palette__category-label node-palette__structure-header">
                Structure
                <span className="node-palette__category-count">1</span>
            </div>
            <div className="node-palette__structure-body">
                <div
                    className="node-palette-item"
                    draggable
                    onDragStart={handleSubFlowDragStart}
                >
                    <span className="node-palette-item__icon node-palette-item__icon--primary">
                        📦
                    </span>
                    <div className="node-palette-item__info">
                        <span className="node-palette-item__name node-palette-item__name--primary">
                            Sub-Flow
                        </span>
                        <span className="node-palette-item__badge node-palette-item__badge--group">
                            GROUP
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
