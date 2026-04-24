/**
 * SkillDesignerPage — the visual orchestrator canvas route.
 * Acts as a wrapper for the React Flow provider and the canvas component.
 */

import { ReactFlowProvider } from '@xyflow/react';
import SkillDesignerCanvas from '@/components/SkillDesignerCanvas/SkillDesignerCanvas';
import SkillDesignerHeader from '@/components/SkillDesignerHeader/SkillDesignerHeader';
import { ExecutionProvider } from '@/contexts';
import './SkillDesignerPage.css';

export default function SkillDesignerPage() {
    return (
        <ReactFlowProvider>
            <ExecutionProvider>
                <div className="skill-designer-page">
                    <SkillDesignerHeader />
                    <div className="skill-designer-page__content">
                        <SkillDesignerCanvas />
                    </div>
                </div>
            </ExecutionProvider>
        </ReactFlowProvider>
    );
}
