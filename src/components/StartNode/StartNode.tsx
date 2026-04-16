import type { NodeProps } from "@xyflow/react";
import type { CanvasNode } from "@/interfaces";
import { getNodeTheme } from "@/utils";
import ModernNode from "../ModernNode/ModernNode";

export default function StartNode({ id, data }: NodeProps<CanvasNode>) {
  const nodeData = data;
  const theme = getNodeTheme("start");

  return (
    <ModernNode
      id={id}
      data={nodeData}
      theme={theme}
      title={nodeData.label || "Start"}
      subtitle="Trigger"
      badge="START"
      icon="🏁"
      showTargetHandle={false} // Start nodes only have outputs
    />
  );
}
