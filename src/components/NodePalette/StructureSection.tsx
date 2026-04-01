/**
 * StructureSection — Structural canvas nodes (like Sub-Flow).
 * Rendered inside the "Common" collapse panel in the Node Library.
 */

import type { StructureSectionProps } from '@/interfaces';
import StartNodeItem from './StartNodeItem';
import SubFlowNodeItem from './SubFlowNodeItem';

export default function StructureSection({ search }: StructureSectionProps) {
    const showStart = !search || 'start'.includes(search.toLowerCase());
    const showSubFlow = !search || 'sub-flow'.includes(search.toLowerCase());

    if (!showStart && !showSubFlow) return null;

    return (
        <>
            {showStart && <StartNodeItem />}
            {showSubFlow && <SubFlowNodeItem />}
        </>
    );
}
