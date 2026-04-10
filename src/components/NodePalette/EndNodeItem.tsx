/**
 * EndNodeItem - Draggable End node item for the Node Palette.
 */

export default function EndNodeItem() {
    const handleEndDragStart = (e: React.DragEvent) => {
        const dragData = JSON.stringify({
            label: 'End',
            category: 'ends',
            icon: 'flag',
        });
        e.dataTransfer.setData('application/reactflow', dragData);
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div
            className="node-palette-item"
            draggable
            onDragStart={handleEndDragStart}
        >
            <span className="node-palette-item__icon node-palette-item__icon--primary" style={{ color: '#f5222d' }}>
                Flag
            </span>
            <div className="node-palette-item__info">
                <span className="node-palette-item__name node-palette-item__name--primary">
                    End
                </span>
                <span className="node-palette-item__badge node-palette-item__badge--group" style={{ background: '#f5222d' }}>
                    EXIT
                </span>
            </div>
        </div>
    );
}
