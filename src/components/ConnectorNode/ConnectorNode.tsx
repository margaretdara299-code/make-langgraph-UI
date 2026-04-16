import IconRenderer from "@/components/IconRenderer/IconRenderer";
import type { NodeProps } from "@xyflow/react";
import type { CanvasNode } from "@/interfaces";
import { getNodeTheme } from "@/utils";
import ModernNode from "../ModernNode/ModernNode";

export default function ConnectorNode({ id, data }: NodeProps<CanvasNode>) {
  const nodeData = data;
  const theme = getNodeTheme("connector", "database", nodeData.category);

  return (
    <ModernNode
      id={id}
      data={nodeData}
      theme={theme}
      title={nodeData.label}
      subtitle={nodeData.category || "Connector"}
      badge="CONN"
      icon={<IconRenderer iconName={nodeData.icon} size={14} fallback="🗄️" />}
    />
  );
}
