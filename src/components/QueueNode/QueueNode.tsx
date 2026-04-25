import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Layers } from 'lucide-react';
import { useParams } from 'react-router-dom';
import type { NodeProps } from "@xyflow/react";
import type { CanvasNode } from "@/interfaces";
import { removeNodeFromStorage } from '@/services/skillGraphStorage.service';
import { getNodeTheme } from "@/utils";
import ModernNode from "../ModernNode/ModernNode";
import "../ModernNode/ModernNode.css";

export default function QueueNode({ id, data }: NodeProps<CanvasNode>) {
  const nodeData = data as any;
  const { setNodes } = useReactFlow();
  const { versionId } = useParams<{ versionId: string }>();
  const theme = getNodeTheme("queue");

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    if (versionId) removeNodeFromStorage(versionId, id);
  };

  const queueType = nodeData.queue_type || 'human';
  const queueTypeLabel =
    queueType === 'human'    ? 'Human'     :
    queueType === 'agent'    ? 'AI Agent'  :
    queueType === 'temporal' ? 'Temporal'  : 'Queue';

  return (
    <ModernNode
      id={id}
      data={nodeData}
      theme={theme}
      title={nodeData.label || "Queue"}
      subtitle={nodeData.queue_name || queueTypeLabel}
      badge="QUEUE"
      icon={<Layers size={14} />}
      onDelete={handleDelete}
      showTargetHandle={false}
      showSourceHandle={false}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        className="modern-node-handle"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        className="modern-node-handle queue-node__handle-out"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="error"
        className="modern-node-handle action-node__error-handle queue-node__handle-err"
      />
    </ModernNode>
  );
}
