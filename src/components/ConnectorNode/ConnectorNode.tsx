/**
 * ConnectorNode — custom React Flow node renderer for external system integrations.
 * Standardized for Top/Bottom connectivity.
 */

import { Handle, Position } from '@xyflow/react';
import IconRenderer from '@/components/IconRenderer/IconRenderer';
import type { NodeProps } from '@xyflow/react';
import type { CanvasNode } from '@/interfaces';
import './ConnectorNode.css';

export default function ConnectorNode({ data }: NodeProps<CanvasNode>) {
    const nodeData = data;

    return (
        <div className="connector-node">
            <Handle 
                type="target" 
                position={Position.Top} 
                className="connector-node__handle connector-node__handle-target-top" 
            />

            <div className="connector-node__border-wrapper">
                <div className="connector-node__content">
                    <div className="connector-node__header">
                        <span className="connector-node__icon">
                            <IconRenderer iconName={nodeData.icon} size={18} fallback="🔌" />
                        </span>
                        <span className="connector-node__title">{nodeData.label}</span>
                    </div>

                    <div className="connector-node__footer">
                        <span className="connector-node__badge">CONNECTOR</span>
                        <span className="connector-node__category">{nodeData.category}</span>
                    </div>
                </div>
            </div>

            <Handle 
                type="source" 
                position={Position.Bottom} 
                className="connector-node__handle connector-node__handle-source-bottom" 
            />
        </div>
    );
}
