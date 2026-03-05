/**
 * SkillDesignerPage — the visual orchestrator canvas route.
 * Acts as a wrapper for the React Flow provider and the canvas component.
 */

import { ReactFlowProvider } from '@xyflow/react';
import SkillDesignerCanvas from '@/components/SkillDesignerCanvas/SkillDesignerCanvas';

export default function SkillDesignerPage() {
    return (
        <ReactFlowProvider>
            <SkillDesignerCanvas />
        </ReactFlowProvider>
    );
}
