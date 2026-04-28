import { Handle, Position } from '@xyflow/react';
import { ArrowRight, Layers } from 'lucide-react';
import type { NodeProps } from "@xyflow/react";
import type { CanvasNode } from "@/interfaces";
import { getNodeTheme } from "@/utils";
import ModernNode from "../ModernNode/ModernNode";
import "../ModernNode/ModernNode.css";
import "./QueueNode.css";

export default function QueueNode({ id, data }: NodeProps<CanvasNode>) {
  const nodeData = data as any;
  const theme = getNodeTheme("queue");

  return (
    <ModernNode
      id={id}
      data={nodeData}
      theme={theme}
      title={nodeData.label || "Queue"}
      subtitle={
        <span className="queue-node__fifo" aria-label="First in first out queue">
          <ArrowRight className="queue-node__flow-icon" size={10} strokeWidth={2.6} />
          <span className="queue-node__lane">
            <span className="queue-node__item" />
            <span className="queue-node__item" />
            <span className="queue-node__item queue-node__item--first" />
          </span>
          <ArrowRight className="queue-node__flow-icon" size={10} strokeWidth={2.6} />
        </span>
      }
      badge="QUEUE"
      icon={<Layers size={14} />}
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
