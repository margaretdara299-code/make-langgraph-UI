import { Zap } from 'lucide-react';
import IconRenderer from '@/components/IconRenderer/IconRenderer';
import type { NodeProps } from '@xyflow/react';
import type { CanvasNode } from '@/interfaces';
import { getNodeTheme } from '@/utils';
import ModernNode from "../ModernNode/ModernNode";

export default function TriggerNode({ id, data }: NodeProps<CanvasNode>) {
    const nodeData = data;
    const theme = getNodeTheme('trigger');

    return (
        <ModernNode
            id={id}
            data={nodeData}
            theme={theme}
            title={nodeData.label}
            subtitle="Trigger Event"
            badge="EVENT"
            icon={<IconRenderer iconName={nodeData.icon} size={14} fallback={<Zap size={14} />} />}
            showTargetHandle={false} // Trigger nodes usually have no inputs
        />
    );
}
