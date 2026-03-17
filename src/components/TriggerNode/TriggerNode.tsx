/**
 * TriggerNode — custom React Flow node renderer for entry points.
 * Standardized for Top/Bottom connectivity.
 */

import { Handle, Position } from '@xyflow/react';
import IconRenderer from '@/components/IconRenderer/IconRenderer';
import type { NodeProps } from '@xyflow/react';
import type { CanvasNode } from '@/interfaces';
import './TriggerNode.css';

export default function TriggerNode({ data }: NodeProps<CanvasNode>) {
    const nodeData = data;

    return (
        <div className="trigger-node">
            <Handle 
                type="target" 
                position={Position.Top} 
                className="trigger-node__handle trigger-node__handle-target-top" 
            />

            <div className="trigger-node__border-wrapper">
                <div className="trigger-node__content">
                    <div className="trigger-node__header">
                        <span className="trigger-node__icon">
                            <IconRenderer iconName={nodeData.icon} size={20} fallback="⚡" />
                        </span>
                        <span className="trigger-node__title">{nodeData.label}</span>
                    </div>

                    <div className="trigger-node__footer">
                        <span className="trigger-node__badge">TRIGGER</span>
                        <span className="trigger-node__category">{nodeData.category}</span>
                    </div>
                </div>
            </div>

            <Handle 
                type="source" 
                position={Position.Bottom} 
                className="trigger-node__handle trigger-node__handle-source-bottom" 
            />
        </div>
    );
}
