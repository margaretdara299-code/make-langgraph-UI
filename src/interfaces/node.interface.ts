/**
 * Canvas Node and Route interfaces.
 * Defines SkillNode, SkillRoute, and node type taxonomy.
 */

export type NodeTypeCategory = 'trigger' | 'action' | 'connector' | 'end';

export type NodeType =
    | 'trigger.queue'
    | 'trigger.schedule'
    | 'trigger.webhook'
    | 'action.ai_classify'
    | 'action.rules_engine'
    | 'action.create_task'
    | 'action.human_review'
    | 'action.update_pm'
    | 'action.send_message'
    | 'connector.emr'
    | 'connector.clearinghouse'
    | 'connector.eligibility_api'
    | 'connector.payer_portal_rpa'
    | 'end.success'
    | 'end.error'
    | 'end.escalated';

export interface SkillNode {
    id: string;
    skillVersionId: string;
    nodeKey: string;
    nodeType: NodeType;
    label: string;
    posX: number;
    posY: number;
    configJson: Record<string, unknown>;
    actionVersionId?: string;
}

export type RouteType = 'unconditional' | 'conditional' | 'default';

export interface SkillRoute {
    id: string;
    skillVersionId: string;
    sourceNodeId: string;
    targetNodeId: string;
    routeType: RouteType;
    conditionJson?: RouteCondition;
    label?: string;
    sortOrder: number;
}

export interface RouteCondition {
    type: 'expression';
    language: 'cel';
    expr: string;
}
