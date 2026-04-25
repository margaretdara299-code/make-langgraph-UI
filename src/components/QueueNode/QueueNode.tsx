import { Handle, Position } from '@xyflow/react';
import { ListOrdered } from 'lucide-react';
import type { NodeProps } from "@xyflow/react";
import type { CanvasNode } from "@/interfaces";
import { getNodeTheme } from "@/utils";
import ModernNode from "../ModernNode/ModernNode";
import "../ModernNode/ModernNode.css";

export default function QueueNode({ id, data }: NodeProps<CanvasNode>) {
  const nodeData = data;
  const theme = getNodeTheme("queue");

  return (
    <ModernNode
      id={id}
      data={nodeData}
      theme={theme}
      title={nodeData.label || "Queue Engine"}
      subtitle={nodeData.description || "Async Handoff"}
      badge="QUEUE"
      icon={<ListOrdered size={14} />}
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
