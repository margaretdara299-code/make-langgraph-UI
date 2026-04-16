import React from 'react';
import { Handle, Position, useReactFlow } from "@xyflow/react";
import type { ModernNodeProps } from "@/interfaces";
import "./ModernNode.css";

/**
 * ModernNode — A shared wrapper for all canvas nodes to ensure
 * visual consistency, shared deletion logic, and execution status highlighting.
 */
export default function ModernNode({
  id,
  data,
  theme,
  icon,
  title,
  subtitle,
  badge,
  showTargetHandle = true,
  showSourceHandle = true,
  children
}: ModernNodeProps) {
  const { deleteElements } = useReactFlow();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  const nodeStatusClass = data.executionStatus ? `node-exec-${data.executionStatus}` : "";

  return (
    <div
      className={`modern-node-card ${nodeStatusClass}`}
      style={{
        background: theme.bg,
        borderColor: theme.stroke,
        color: theme.stroke,
        '--node-stroke': theme.stroke
      } as React.CSSProperties & { [key: string]: string | number }}
    >
      {/* Shared Delete Button */}
      <div
        className="modern-node-delete"
        onClick={handleDelete}
        title="Delete Node"
      >
        ×
      </div>

      {/* Optional Top Handle */}
      {showTargetHandle && (
        <Handle
          type="target"
          position={Position.Top}
          className="modern-node-handle"
        />
      )}

      <div className="modern-node-content">
        <div className="modern-node-left">
          <div
            className="modern-node-icon"
            style={{ background: theme.iconBg, color: theme.stroke }}
          >
            {icon}
          </div>
          <div className="modern-node-text-col">
            <div className="modern-node-title">{title || data.label}</div>
            <div className="modern-node-sub">
              {subtitle || data.category || "Node"}
            </div>
          </div>
        </div>

        <div className="modern-node-right">
          {badge && (
            <span
              className="modern-node-badge"
              style={{ background: theme.badgeBg }}
            >
              {badge}
            </span>
          )}
          <span
            className="modern-node-dot"
            style={{ background: theme.stroke }}
          ></span>
        </div>
      </div>

      {/* Optional Bottom Handle */}
      {showSourceHandle && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="modern-node-handle"
        />
      )}

      {/* Extra handles or custom controls passed as children */}
      {children}
    </div>
  );
}
