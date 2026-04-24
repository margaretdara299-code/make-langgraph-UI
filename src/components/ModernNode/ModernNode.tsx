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
        '--node-bg': theme.bg,
        '--node-stroke': theme.stroke,
        '--node-icon-bg': theme.iconBg,
        '--node-badge-bg': theme.badgeBg
      } as React.CSSProperties}
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
          <div className="modern-node-icon">
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
            <span className="modern-node-badge">
              {badge}
            </span>
          )}
          <span className="modern-node-dot"></span>
        </div>
      </div>

      {/* Optional Bottom Handle */}
      {showSourceHandle && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="src"
          className="modern-node-handle"
        />
      )}

      {/* Extra handles or custom controls passed as children */}
      {children}
    </div>
  );
}
