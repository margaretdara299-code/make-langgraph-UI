import { useLayoutEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react';
import { Merge } from 'lucide-react';
import type { NodeProps } from "@xyflow/react";
import type { CanvasNode } from "@/interfaces";
import { getNodeTheme } from "@/utils";
import ModernNode from "../ModernNode/ModernNode";
import "../ModernNode/ModernNode.css";

export default function ParallelJoinNode({ id, data }: NodeProps<CanvasNode>) {
  const nodeData = data;
  const updateNodeInternals = useUpdateNodeInternals();
  const theme = getNodeTheme("parallel_join");

  const inputs = typeof nodeData.inputs === 'number' ? nodeData.inputs : 3;

  useLayoutEffect(() => {
    updateNodeInternals(id);
  }, [id, inputs, updateNodeInternals]);

  const getTopPercent = (idx: number) => {
    return `${(idx + 1) * 100 / (inputs + 1)}%`;
  };

  return (
    <ModernNode
      id={id}
      data={nodeData}
      theme={theme}
      title={nodeData.label || "Merge"}
      subtitle="Sync Execution"
      badge="MERGE"
      icon={<Merge size={14} />}
      showTargetHandle={false}
      showSourceHandle={false}
    >
      {/* Dynamic parallel inputs */}
      {Array.from({ length: inputs }).map((_, i) => (
        <Handle
          key={`in_${i + 1}`}
          type="target"
          position={Position.Left}
          id={`in_${i + 1}`}
          style={{ '--handle-top': getTopPercent(i) } as React.CSSProperties}
          className="modern-node-handle parallel-node__handle"
        />
      ))}

      {/* Synchronized Output */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        className="modern-node-handle"
      />
    </ModernNode>
  );
}
