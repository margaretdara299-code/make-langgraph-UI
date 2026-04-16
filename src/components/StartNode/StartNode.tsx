import { Handle, Position, useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import type { CanvasNode } from "@/interfaces";
import { getNodeTheme } from "@/utils";
import "../ActionNode/ActionNode.css";

export default function StartNode({ id, data }: NodeProps<CanvasNode>) {
  const nodeData = data;
  const { deleteElements } = useReactFlow();

  const theme = getNodeTheme("start");

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <div
      className={`modern-node-card ${nodeData.executionStatus ? `node-exec-${nodeData.executionStatus}` : ""}`}
      style={
        {
          background: theme.bg,
          borderColor: theme.stroke,
          color: theme.stroke,
          width: 200,
        } as any
      }
    >
      <div
        className="modern-node-delete"
        onClick={handleDelete}
        title="Delete Node"
      >
        ×
      </div>

      <div className="modern-node-content">
        <div className="modern-node-left">
          <div
            className="modern-node-icon"
            style={{ background: theme.iconBg, color: theme.stroke }}
          >
            🏁
          </div>
          <div className="modern-node-text-col">
            <div className="modern-node-title">{nodeData.label || "Start"}</div>
            <div className="modern-node-sub">Trigger</div>
          </div>
        </div>
        <div className="modern-node-right">
          <span
            className="modern-node-badge"
            style={{ background: theme.badgeBg }}
          >
            START
          </span>
          <span
            className="modern-node-dot"
            style={{ background: theme.stroke }}
          ></span>
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
