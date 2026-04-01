/**
 * StartNodeItem — Draggable Start Node item for the Node Palette.
 */

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
        <div
            className="node-palette-item"
            draggable
            onDragStart={handleStartDragStart}
        >
            <span className="node-palette-item__icon node-palette-item__icon--primary" style={{ color: '#52c41a' }}>
                ▶️
            </span>
            <div className="node-palette-item__info">
                <span className="node-palette-item__name node-palette-item__name--primary">
                    Start
                </span>
                <span className="node-palette-item__badge node-palette-item__badge--group" style={{ background: '#52c41a' }}>
                    ENTRY
                </span>
            </div>
        </div>
    );
}
