import { useLayoutEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react';
import { GitFork } from 'lucide-react';
import type { NodeProps } from "@xyflow/react";
import type { CanvasNode } from "@/interfaces";
import { getNodeTheme } from "@/utils";
import ModernNode from "../ModernNode/ModernNode";
import "../ModernNode/ModernNode.css";

export default function ParallelSplitNode({ id, data }: NodeProps<CanvasNode>) {
  const nodeData = data;
  const updateNodeInternals = useUpdateNodeInternals();
  const theme = getNodeTheme("parallel_split");

  const branches = typeof nodeData.branches === 'number' ? nodeData.branches : 3;

  useLayoutEffect(() => {
    updateNodeInternals(id);
  }, [id, branches, updateNodeInternals]);

  const getTopPercent = (idx: number) => {
    return `${(idx + 1) * 100 / (branches + 1)}%`;
  };

  return (
    <ModernNode
      id={id}
      data={nodeData}
      theme={theme}
      title={nodeData.label || "Split"}
      subtitle="Parallel Execution"
      badge="SPLIT"
      icon={<GitFork size={14} />}
      showTargetHandle={false}
      showSourceHandle={false}
    >
      {/* Universal Input */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        className="modern-node-handle"
      />
      
      {/* Dynamic parallel outputs */}
      {Array.from({ length: branches }).map((_, i) => (
        <Handle
          key={`branch_${i + 1}`}
          type="source"
          position={Position.Right}
          id={`branch_${i + 1}`}
          style={{ '--handle-top': getTopPercent(i) } as React.CSSProperties}
          className="modern-node-handle parallel-node__handle"
        />
      ))}
    </ModernNode>
  );
}
