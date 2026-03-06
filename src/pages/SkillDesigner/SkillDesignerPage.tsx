/**
 * SkillDesignerPage — the visual orchestrator canvas route.
 * Acts as a wrapper for the React Flow provider and the canvas component.
 */

import { ReactFlowProvider } from '@xyflow/react';
import SkillDesignerCanvas from '@/components/SkillDesignerCanvas/SkillDesignerCanvas';
import SkillDesignerHeader from '@/components/SkillDesignerHeader/SkillDesignerHeader';
import './SkillDesignerPage.css';

export default function SkillDesignerPage() {
    return (
        <div className="skill-designer-page">
            <SkillDesignerHeader />
            <div className="skill-designer-page__content">
                <ReactFlowProvider>
                    <SkillDesignerCanvas />
                </ReactFlowProvider>
            </div>
        </div>
    );
}
