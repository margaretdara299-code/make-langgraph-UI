import { Skeleton } from 'antd';
import type {
    ExecutionDebuggerStepCardProps,
    ExecutionDebuggerStepCardSkeletonProps,
} from '@/interfaces';
import {
    getExecutionStepNodeLabel,
    getExecutionStepNodeType,
    getExecutionStepPayload,
    getStepCardStatusClass,
    hasRenderablePayload,
} from '@/utils';

export function StepCard({ step, type, isLoading = false }: ExecutionDebuggerStepCardProps) {
    const nodeLabel = getExecutionStepNodeLabel(step);
    const nodeType = getExecutionStepNodeType(step);
    const payload = getExecutionStepPayload(step, type);
    const statusClass = getStepCardStatusClass(step.status);

    return (
        <div className={`exec-step-card ${statusClass ? `exec-step-card--${statusClass}` : ''}`}>
            <div className="exec-step-card__header">
                <span className={`exec-step-card__status-dot exec-step-card__status-dot--${step.status}`} />
                <span className="exec-step-card__node-name">{nodeLabel}</span>
                <span className="exec-step-card__node-type">{nodeType}</span>
            </div>
            <div className="exec-step-card__body">
                {step.message && (
                    <div className="exec-step-card__message">{step.message}</div>
                )}
                {isLoading ? (
                    <div className="exec-step-card__skeleton">
                        <Skeleton
                            active
                            title={{ width: '42%' }}
                            paragraph={{ rows: 4, width: ['100%', '96%', '92%', '84%'] }}
                        />
                    </div>
                ) : hasRenderablePayload(payload) && typeof payload === 'object' ? (
                    <pre className="exec-step-card__json">
                        {JSON.stringify(payload, null, 2)}
                    </pre>
                ) : hasRenderablePayload(payload) && typeof payload === 'string' ? (
                    <pre className="exec-step-card__json">{payload}</pre>
                ) : (
                    <span className="exec-step-card__empty">
                        {type === 'output' && step.status === 'running'
                            ? 'Output will appear when this node completes...'
                            : 'No data available'}
                    </span>
                )}
            </div>
        </div>
    );
}

export function StepCardSkeleton({ type }: ExecutionDebuggerStepCardSkeletonProps) {
    return (
        <div className="exec-step-card exec-step-card--loading">
            <div className="exec-step-card__header">
                <span className="exec-step-card__status-dot exec-step-card__status-dot--idle" />
                <span className="exec-step-card__node-name">Loading {type}...</span>
                <span className="exec-step-card__node-type">{type}</span>
            </div>
            <div className="exec-step-card__body">
                <div className="exec-step-card__skeleton">
                    <Skeleton
                        active
                        title={{ width: type === 'input' ? '46%' : '52%' }}
                        paragraph={{ rows: 5, width: ['100%', '96%', '92%', '88%', '82%'] }}
                    />
                </div>
            </div>
        </div>
    );
}
