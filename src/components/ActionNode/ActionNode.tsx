import { Handle, Position } from '@xyflow/react';
import { Settings2 } from 'lucide-react';
import IconRenderer from "@/components/IconRenderer/IconRenderer";
import type { NodeProps } from "@xyflow/react";
import type { CanvasNode } from "@/interfaces";
import { CAPABILITY_LABELS } from "@/constants";
import { getNodeTheme } from "@/utils";
import ModernNode from "../ModernNode/ModernNode";
import "../ModernNode/ModernNode.css";

export default function ActionNode({ id, data }: NodeProps<CanvasNode>) {
  const nodeData = data;
  const cap = (nodeData.capability || "default").toLowerCase();
  const theme = getNodeTheme("action", cap, nodeData.category);

  const badgeLabel = nodeData.connectorId
    ? (nodeData.connectorType || cap) === "database"
      ? "DB"
      : "API"
    : (CAPABILITY_LABELS[cap] || cap).toUpperCase();

  return (
    <ModernNode
      id={id}
      data={nodeData}
      theme={theme}
      title={nodeData.label}
      subtitle={nodeData.category || "Action"}
      badge={badgeLabel}
      icon={
        <IconRenderer
          iconName={nodeData.icon}
          size={13}
          fallback={<Settings2 size={13} />}
        />
      }
    >
      {/* Error-path source handle (right side) — routes to Error Node on action failure */}
      <Handle
        type="source"
        position={Position.Right}
        id="error"
        className="modern-node-handle action-node__error-handle"
      />
    </ModernNode>
  );
}