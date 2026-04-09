/**
 * DecisionNodeItem — Draggable Decision node item for the Node Library palette.
 */

export default function DecisionNodeItem() {
    const handleDragStart = (e: React.DragEvent) => {
        const dragData = JSON.stringify({
            nodeType: 'decision',
            label: 'Decision',
            category: 'structure',
            icon: '⚡',
            conditions: [],
        });
        e.dataTransfer.setData('application/reactflow', dragData);
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div
            className="node-palette-item"
            draggable
            onDragStart={handleDragStart}
        >
            <span className="node-palette-item__icon node-palette-item__icon--decision">
                ⚡
            </span>
            <div className="node-palette-item__info">
                <span className="node-palette-item__name node-palette-item__name--decision">
                    Decision
                </span>
                <span className="node-palette-item__badge node-palette-item__badge--decision">
                    CONDITION
                </span>
            </div>
        </div>
    );
}
