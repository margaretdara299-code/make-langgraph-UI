/**
 * ActionNode — custom React Flow node renderer for action nodes on the canvas.
 * Reduced to Top/Bottom connectivity as per user request.
 */

import { Handle, Position } from '@xyflow/react';
import IconRenderer from '@/components/IconRenderer/IconRenderer';
import { stringToColorParams } from '@/utils';
import type { NodeProps } from '@xyflow/react';
import type { CanvasNode } from '@/interfaces';
import { CAPABILITY_LABELS } from '@/constants';
import './ActionNode.css';

export default function ActionNode({ data }: NodeProps<CanvasNode>) {
    const nodeData = data;

    const cap = (nodeData.capability || 'default').toLowerCase();
    const isKnown = !!CAPABILITY_LABELS[cap];
    const dynamicTheme = isKnown ? null : stringToColorParams(cap);

    const glowColor = isKnown ? `var(--color-badge-text-${cap})` : dynamicTheme?.text;

    return (
        <div 
            className="action-node action-node--glow" 
            style={{ '--node-accent-glow': glowColor } as any}
        >
            <Handle 
                type="target" 
                position={Position.Top} 
                className="action-node__handle action-node__handle-target-top" 
            />

            <div className="action-node__border-wrapper">
                <div className="action-node__content">
                    <div 
                        className="action-node__header" 
                        style={{ 
                            background: isKnown ? `linear-gradient(90deg, var(--color-badge-bg-${cap}), transparent)` : 'rgba(255, 255, 255, 0.02)'
                        }}
                    >
                        <span className="action-node__icon" style={{ color: glowColor }}>
                            <IconRenderer iconName={nodeData.icon} size={18} fallback="⚙️" />
                        </span>
                        <span className="action-node__title">{nodeData.label}</span>
                    </div>

                    <div className="action-node__footer">
                        <span className="action-node__capability-badge">
                            {(nodeData as any).connectorId
                                ? ((nodeData as any).connectorType || cap) === 'database'
                                    ? 'DB Connector'
                                    : 'Api Connector'
                                : 'Action'}
                        </span>
                        <span className="action-node__category">{nodeData.category}</span>
                    </div>
                </div>
            </div>

            <Handle 
                type="source" 
                position={Position.Bottom} 
                className="action-node__handle action-node__handle-source-bottom" 
            />
        </div>
    );
}
