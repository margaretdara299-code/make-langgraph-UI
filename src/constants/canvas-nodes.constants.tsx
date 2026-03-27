/**
 * Canvas node type registry.
 * Separated from component code to follow proper constants organization.
 */

import ActionNode from '@/components/ActionNode/ActionNode';
import TriggerNode from '@/components/TriggerNode/TriggerNode';
import ConnectorNode from '@/components/ConnectorNode/ConnectorNode';
import EndNode from '@/components/EndNode/EndNode';
import SubFlowNode from '@/components/SubFlowNode/SubFlowNode';
import DeletableEdge from '@/components/DeletableEdge/DeletableEdge';

export const NODE_TYPES = {
    action: ActionNode,
    trigger: TriggerNode,
    connector: ConnectorNode,
    end: EndNode,
    subflow: SubFlowNode,
};

export const EDGE_TYPES = {
    default: DeletableEdge,
};
