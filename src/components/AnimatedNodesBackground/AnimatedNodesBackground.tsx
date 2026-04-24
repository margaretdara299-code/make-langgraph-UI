/**
 * AnimatedNodesBackground — A full-viewport SVG background
 * depicting floating nodes, connection lines, and data-flow dots.
 * Represents the app's core theme of workflows and node orchestration.
 */

import './AnimatedNodesBackground.css';

/** Static node definitions positioned across the viewport */
const NODES = [
    { id: 1, x: 12, y: 18, label: 'Trigger', color: 'var(--color-node-trigger)', size: 52 },
    { id: 2, x: 78, y: 12, label: 'Action', color: 'var(--color-primary)', size: 48 },
    { id: 3, x: 25, y: 72, label: 'API', color: 'var(--color-node-connector)', size: 44 },
    { id: 4, x: 65, y: 65, label: 'AI', color: 'var(--color-node-trigger)', size: 46 },
    { id: 5, x: 88, y: 45, label: 'RPA', color: 'var(--color-warning, #f59e0b)', size: 42 },
    { id: 6, x: 8, y: 48, label: 'Rules', color: 'var(--color-success)', size: 44 },
    { id: 7, x: 42, y: 88, label: 'End', color: 'var(--color-text-tertiary, #64748b)', size: 40 },
    { id: 8, x: 55, y: 22, label: 'SubFlow', color: 'var(--color-primary)', size: 50 },
    { id: 9, x: 92, y: 80, label: 'Human', color: 'var(--color-success)', size: 44 },
    { id: 10, x: 35, y: 35, label: 'Connector', color: 'var(--color-node-connector)', size: 46 },
];

/** Connections between nodes (by index) */
const EDGES = [
    [0, 7], [7, 1], [0, 9], [9, 3], [5, 2],
    [2, 6], [1, 4], [3, 6], [4, 8], [9, 7],
];

export default function AnimatedNodesBackground() {
    return (
        <div className="animated-nodes-bg">
            <svg
                className="animated-nodes-bg__svg"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid slice"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Dot grid pattern */}
                <defs>
                    <pattern id="dotGrid" width="5" height="5" patternUnits="userSpaceOnUse">
                        <circle cx="2.5" cy="2.5" r="0.15" fill="var(--color-nav-input-placeholder)" fillOpacity="0.25" />
                    </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#dotGrid)" />

                {/* Connection lines */}
                {EDGES.map(([fromIdx, toIdx], i) => {
                    const from = NODES[fromIdx];
                    const to = NODES[toIdx];
                    const pathId = `edge-path-${i}`;
                    return (
                        <g key={pathId}>
                            <line
                                x1={from.x}
                                y1={from.y}
                                x2={to.x}
                                y2={to.y}
                                className="animated-nodes-bg__edge"
                                style={{ animationDelay: `${i * 0.3}s` }}
                            />
                            {/* Data flow dot traveling along the edge */}
                            <path
                                id={pathId}
                                d={`M${from.x},${from.y} L${to.x},${to.y}`}
                                fill="none"
                                stroke="none"
                            />
                            <circle r="0.4" className="animated-nodes-bg__flow-dot">
                                <animateMotion
                                    dur={`${3 + i * 0.5}s`}
                                    repeatCount="indefinite"
                                    begin={`${i * 0.6}s`}
                                >
                                    <mpath href={`#${pathId}`} />
                                </animateMotion>
                            </circle>
                        </g>
                    );
                })}

                {/* Floating nodes */}
                {NODES.map((node, i) => (
                    <g
                        key={node.id}
                        className="animated-nodes-bg__node"
                        style={{ animationDelay: `${i * 0.4}s` }}
                    >
                        {/* Node body */}
                        <rect
                            x={node.x - 3.5}
                            y={node.y - 1.8}
                            width="7"
                            height="3.6"
                            rx="0.8"
                            fill={node.color}
                            fillOpacity="0.12"
                            stroke={node.color}
                            strokeWidth="0.15"
                            strokeOpacity="0.35"
                        />
                        {/* Node label */}
                        <text
                            x={node.x}
                            y={node.y + 0.45}
                            textAnchor="middle"
                            className="animated-nodes-bg__node-label"
                            fill={node.color}
                            fillOpacity="0.5"
                        >
                            {node.label}
                        </text>
                        {/* Input handle dot */}
                        <circle
                            cx={node.x - 3.5}
                            cy={node.y}
                            r="0.35"
                            fill={node.color}
                            fillOpacity="0.4"
                        />
                        {/* Output handle dot */}
                        <circle
                            cx={node.x + 3.5}
                            cy={node.y}
                            r="0.35"
                            fill={node.color}
                            fillOpacity="0.4"
                        />
                    </g>
                ))}
            </svg>
        </div>
    );
}
