import type { NodeProps } from "@xyflow/react";
import type { CanvasNode } from "@/interfaces";
import { getNodeTheme } from "@/utils";
import ModernNode from "../ModernNode/ModernNode";

export default function EndNode({ id, data }: NodeProps<CanvasNode>) {
  const nodeData = data;
  const theme = getNodeTheme("end", "", nodeData.category);

  return (
    <ModernNode
      id={id}
      data={nodeData}
      theme={theme}
      title={nodeData.label || "End"}
      subtitle={nodeData.category || "Termination"}
      badge="END"
      icon="🏁"
      showSourceHandle={false} // End nodes only have inputs
    />
  );
}
