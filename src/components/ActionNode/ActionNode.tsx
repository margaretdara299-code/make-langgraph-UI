/**
 * ActionNode — custom React Flow node renderer for action nodes on the canvas.
 * Now using the modern horizontal pill design.
 */

import { Handle, Position, useReactFlow } from "@xyflow/react";
import { Settings2 } from "lucide-react";
import IconRenderer from "@/components/IconRenderer/IconRenderer";
import type { NodeProps } from "@xyflow/react";
import type { CanvasNode } from "@/interfaces";
import { CAPABILITY_LABELS } from "@/constants";
import { getNodeTheme } from "@/utils";
import "./ActionNode.css";

export default function ActionNode({ id, data }: NodeProps<CanvasNode>) {
  const nodeData = data;
  const { deleteElements } = useReactFlow();

  const cap = (nodeData.capability || "default").toLowerCase();
  const theme = getNodeTheme("action", cap, nodeData.category);

  const badgeLabel = (nodeData as any).connectorId
    ? ((nodeData as any).connectorType || cap) === "database"
      ? "DB"
      : "API"
    : (CAPABILITY_LABELS[cap] || cap).toUpperCase();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <div
      className="modern-node-card"
      style={
        {
          background: theme.bg,
          borderColor: theme.stroke,
          color: theme.stroke,
        } as any
      }
    >
      {/* Delete button wrapper - Appears on Hover */}
      <div
        className="modern-node-delete"
        onClick={handleDelete}
        title="Delete Node"
      >
        ×
      </div>

      <Handle
        type="target"
        position={Position.Top}
        className="modern-node-handle"
      />

      <div className="modern-node-content">
        <div className="modern-node-left">
          <div
            className="modern-node-icon"
            style={{ background: theme.iconBg, color: theme.stroke }}
          >
            <IconRenderer
              iconName={nodeData.icon}
              size={13}
              fallback={<Settings2 size={13} />}
            />
          </div>
          <div className="modern-node-text-col">
            <div className="modern-node-title">{nodeData.label}</div>
            <div className="modern-node-sub">
              {nodeData.category || "Action"}
            </div>
          </div>
        </div>
        <div className="modern-node-right">
          <span
            className="modern-node-badge"
            style={{ background: theme.badgeBg }}
          >
            {badgeLabel}
          </span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="modern-node-handle"
      />
    </div>
  );
}
