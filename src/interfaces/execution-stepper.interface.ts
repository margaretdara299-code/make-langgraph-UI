import type { Node } from '@xyflow/react';
import type { NodeExecutionTrace } from './engine.interface';

export interface TracedExecutionNode {
    node: Node;
    trace?: NodeExecutionTrace;
}

export interface ParsedExecutionLog {
    label: string;
    type?: string;
}

export type NodeExecutionResponseMap = Record<string, any>;
