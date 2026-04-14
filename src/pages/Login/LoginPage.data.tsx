import React from 'react';
import { Zap, GitMerge, Sparkles, Wrench, BrainCircuit, CheckCircle2 } from 'lucide-react';

export const CANVAS_EDGES = [
    { d: "M 160 108 C 220 108 220 178 280 178", stroke: "url(#edge-grad-1)", marker: true, animation: "edge-pulse 3s ease-in-out infinite" },
    { d: "M 420 158 C 450 158 450 103 490 103", stroke: "url(#edge-grad-2)", marker: true, animation: "edge-pulse 3s ease-in-out infinite 0.8s" },
    { d: "M 420 198 C 450 198 450 285 490 285", stroke: "url(#edge-grad-1)", marker: true, animation: "edge-pulse 3.5s ease-in-out infinite 1.5s" },
    { d: "M 660 103 C 710 103 710 185 770 195", stroke: "url(#edge-grad-3)", marker: true, animation: "edge-pulse 2.5s ease-in-out infinite 0.3s" },
    { d: "M 660 285 C 710 285 720 220 770 215", stroke: "url(#edge-grad-3)", marker: true, animation: "edge-pulse 2.8s ease-in-out infinite 1.1s" },
    { d: "M 150 122 C 180 122 180 345 260 345", stroke: "url(#edge-grad-1)", dashed: true, animation: "dash-flow 4s linear infinite" },
    { d: "M 420 345 C 470 345 470 200 490 180", stroke: "url(#edge-grad-1)", dashed: true, animation: "dash-flow 4s linear infinite 2s" }
];

export const PACKETS = [
    { r: 5, fill: "#6366f1", dur: "2.4s", begin: "0s", path: "M 160 108 C 220 108 220 178 280 178" },
    { r: 5, fill: "#6366f1", dur: "2.4s", begin: "1.2s", opacity: 0.6, path: "M 160 108 C 220 108 220 178 280 178" },
    { r: 5, fill: "#8b5cf6", dur: "2.1s", begin: "0.7s", path: "M 420 158 C 450 158 450 103 490 103" },
    { r: 4.5, fill: "#f59e0b", dur: "2.7s", begin: "1.4s", path: "M 420 198 C 450 198 450 285 490 285" },
    { r: 4.5, fill: "#10b981", dur: "1.9s", begin: "0.4s", path: "M 660 103 C 710 103 710 185 770 195" },
    { r: 4.5, fill: "#10b981", dur: "2.2s", begin: "1.8s", path: "M 660 285 C 710 285 720 220 770 215" },
    { r: 3.5, fill: "#3b82f6", dur: "3.6s", begin: "1s", path: "M 150 122 C 180 122 180 345 260 345" }
];

export const CANVAS_NODES = [
    {
        id: 'webhook', style: { left: '3%', top: '14%' },
        iconStyle: 'green', icon: <Zap size={16} strokeWidth={2.5} />, name: 'Webhook Trigger', sub: 'POST /api/skill-run', dot: 'live',
        rows: [{ label: 'auth', code: 'Bearer' }, { label: 'format', code: 'JSON' }],
        chip: { style: 'green', text: '● Running' }
    },
    {
        id: 'router', style: { left: '29%', top: '37%' },
        iconStyle: 'slate', icon: <GitMerge size={16} strokeWidth={2.5} />, name: 'Smart Router', sub: 'If / Else switch', dot: 'live',
        rows: [{ label: 'A →', code: 'LLM path' }, { label: 'B →', code: 'Tool path' }]
    },
    {
        id: 'llm', style: { left: '55%', top: '5%' },
        iconStyle: 'indigo', icon: <Sparkles size={16} strokeWidth={2.5} />, name: 'LLM Agent', sub: 'gpt-4o-mini', dot: 'pulse',
        typing: true,
        chip: { style: 'indigo', text: '⟳ Processing' }
    },
    {
        id: 'api', style: { left: '55%', top: '65%' },
        iconStyle: 'orange', icon: <Wrench size={16} strokeWidth={2.5} />, name: 'API Action', sub: 'Jira · Create Issue', dot: 'idle',
        rows: [{ label: 'method', code: 'POST' }, { label: 'auth', code: 'OAuth2' }]
    },
    {
        id: 'context', style: { left: '26%', top: '74%' },
        iconStyle: 'blue', icon: <BrainCircuit size={16} strokeWidth={2.5} />, name: 'Context Store', sub: 'Vector memory',
        membar: '72%',
        rows: [{ label: 'used', code: '72% · 4.1KB' }]
    },
    {
        id: 'response', style: { left: '79%', top: '34%' },
        iconStyle: 'green', icon: <CheckCircle2 size={16} strokeWidth={2.5} />, name: 'HTTP Response', sub: '200 OK', dot: 'done',
        rows: [{ label: 'status', code: '200 OK' }, { label: 'latency', code: '142ms' }],
        chip: { style: 'green', text: '✓ Done' }
    }
];

export const CANVAS_STATS = [
    { dot: 'green', text: '6 nodes' },
    { dot: 'blue', text: '142ms p95' },
    { dot: 'purple', text: '1.2k/min' },
    { dot: 'green', text: '99.98% uptime' }
];
