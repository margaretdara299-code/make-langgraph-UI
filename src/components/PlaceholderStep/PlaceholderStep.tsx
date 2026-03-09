/**
 * PlaceholderStep — Scaffold placeholder for incomplete wizard steps.
 */

import type { PlaceholderStepProps } from '@/interfaces';
import './PlaceholderStep.css';

export default function PlaceholderStep({ stepName }: PlaceholderStepProps) {
    return (
        <div className="placeholder-step">
            <h3>{stepName} Configuration</h3>
            <p>This section is scaffolded for MVP. In a full implementation, you'd define JSON schemas, policies, and parameters here.</p>
        </div>
    );
}
