import type { StructureSectionProps } from "@/interfaces";
import StartNodeItem from "./StartNodeItem";
import SubFlowNodeItem from "./SubFlowNodeItem";
import DecisionNodeItem from "./DecisionNodeItem";
import EndNodeItem from "./EndNodeItem";
import QueueNodeItem from "./QueueNodeItem";

export default function StructureSection({ search }: StructureSectionProps) {
  const showStart    = !search || "start".includes(search.toLowerCase());
  const showSubFlow  = !search || "sub-flow".includes(search.toLowerCase());
  const showDecision = !search || "decision".includes(search.toLowerCase());
  const showEnd      = !search || "end".includes(search.toLowerCase());
  const showQueue    = !search || "queue".includes(search.toLowerCase());

  if (!showStart && !showSubFlow && !showDecision && !showEnd && !showQueue) return null;

  return (
    <>
      {showStart    && <StartNodeItem />}
      {showSubFlow  && <SubFlowNodeItem />}
      {showDecision && <DecisionNodeItem />}
      {showQueue    && <QueueNodeItem />}
      {showEnd      && <EndNodeItem />}
    </>
  );
}
