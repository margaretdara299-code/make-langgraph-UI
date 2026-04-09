import type { StructureSectionProps } from '@/interfaces';
import StartNodeItem from './StartNodeItem';
import SubFlowNodeItem from './SubFlowNodeItem';
import DecisionNodeItem from './DecisionNodeItem';

export default function StructureSection({ search }: StructureSectionProps) {
    const showStart    = !search || 'start'.includes(search.toLowerCase());
    const showSubFlow  = !search || 'sub-flow'.includes(search.toLowerCase());
    const showDecision = !search || 'decision'.includes(search.toLowerCase());

    if (!showStart && !showSubFlow && !showDecision) return null;

    return (
        <>
            {showStart    && <StartNodeItem />}
            {showSubFlow  && <SubFlowNodeItem />}
            {showDecision && <DecisionNodeItem />}
        </>
    );
}
