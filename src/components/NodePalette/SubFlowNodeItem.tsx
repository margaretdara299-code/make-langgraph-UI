/**
 * SubFlowNodeItem — Draggable Sub-Flow node item for the Node Palette.
 */

export default function SubFlowNodeItem() {
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
