import type { StructureSectionProps } from "@/interfaces";
import StartNodeItem from "./StartNodeItem";
import SubFlowNodeItem from "./SubFlowNodeItem";
import DecisionNodeItem from "./DecisionNodeItem";
import EndNodeItem from "./EndNodeItem";

export default function StructureSection({ search }: StructureSectionProps) {
  const showStart = !search || "start".includes(search.toLowerCase());
  const showSubFlow = !search || "sub-flow".includes(search.toLowerCase());
  const showDecision = !search || "decision".includes(search.toLowerCase());
  const showEnd = !search || "end".includes(search.toLowerCase());

  if (!showStart && !showSubFlow && !showDecision && !showEnd) return null;

  return (
    <>
      {showStart && <StartNodeItem />}
      {showSubFlow && <SubFlowNodeItem />}
      {showDecision && <DecisionNodeItem />}
      {showEnd && <EndNodeItem />}
    </>
  );
}
