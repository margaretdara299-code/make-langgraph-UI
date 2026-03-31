import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useReactFlow } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import { DeleteOutlined } from '@ant-design/icons';
import { removeConnectionFromStorage } from '@/services/skillGraphStorage.service';
import { useParams } from 'react-router-dom';

import './DeletableEdge.css'; // Optional, but usually good for hovered states

export default function DeletableEdge(props: EdgeProps) {
    const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd } = props;
    const { setEdges } = useReactFlow();
    const { versionId } = useParams<{ versionId: string }>();

    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const handleDelete = (event: React.MouseEvent) => {
        event.stopPropagation();
        setEdges((edges) => edges.filter((e) => e.id !== id));
        if (versionId) {
            removeConnectionFromStorage(versionId, id);
        }
    };

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan"
                >
                    <div className="deletable-edge__wrapper">
                        {props.label && (
                            <div className="deletable-edge__label">
                                {props.label}
                            </div>
                        )}
                        <button
                            className="deletable-edge__btn"
                            onClick={handleDelete}
                            title="Delete connection"
                        >
                            <DeleteOutlined />
                        </button>
                    </div>
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
