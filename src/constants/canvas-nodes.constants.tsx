/**
 * Canvas node type registry.
 * Separated from component code to follow proper constants organization.
 */

import ActionNode from '@/components/ActionNode/ActionNode';
import TriggerNode from '@/components/TriggerNode/TriggerNode';
import ConnectorNode from '@/components/ConnectorNode/ConnectorNode';
import EndNode from '@/components/EndNode/EndNode';
import SubFlowNode from '@/components/SubFlowNode/SubFlowNode';
import StartNode from '@/components/StartNode/StartNode';
import DecisionNode from '@/components/DecisionNode/DecisionNode';
import ErrorNode from '@/components/ErrorNode/ErrorNode';
import QueueNode from '@/components/QueueNode/QueueNode';
import DeletableEdge from '@/components/DeletableEdge/DeletableEdge';

export const NODE_TYPES = {
    action:   ActionNode,
    trigger:  TriggerNode,
    connector: ConnectorNode,
    end:      EndNode,
    subflow:  SubFlowNode,
    start:    StartNode,
    decision: DecisionNode,
    error:    ErrorNode,
    queue:    QueueNode,
};

export const EDGE_TYPES = {
    default:    DeletableEdge,
    smoothstep: DeletableEdge,   // uses our custom renderer with smooth-step path
};

