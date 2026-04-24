import type { NodeProps } from '@xyflow/react';
import type { CanvasNode } from '@/interfaces';
import { getNodeTheme } from '@/utils';
import ModernNode from "../ModernNode/ModernNode";

export default function SubFlowNode({ id, data }: NodeProps<CanvasNode>) {
    const nodeData = data;
    const theme = getNodeTheme('skill', 'skill', nodeData.category);

    return (
        <ModernNode
            id={id}
            data={nodeData}
            theme={theme}
            title={nodeData.label || 'Group'}
            subtitle={nodeData.description || 'Sub-flow'}
            badge="GROUP"
            icon="📦"
        />
    );
}
