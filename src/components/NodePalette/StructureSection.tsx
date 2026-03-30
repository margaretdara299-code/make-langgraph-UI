/**
 * StructureSection — Structural canvas nodes (like Sub-Flow).
 * Rendered inside the "Common" collapse panel in the Node Library.
 */

import type { StructureSectionProps } from '@/interfaces';

export default function StructureSection({ search }: StructureSectionProps) {
    const showStructure = !search || 'sub-flow'.includes(search.toLowerCase());

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
    );
}
