import React, { useState } from 'react';
import { Form, Input, Button, Divider } from 'antd';
import { GithubOutlined, GoogleOutlined, WindowsOutlined } from '@ant-design/icons';
import useLogin from '@/hooks/useLogin.hook';
import { CANVAS_EDGES, PACKETS, CANVAS_NODES, CANVAS_STATS } from './LoginPage.data';
import './LoginPage.css';

export default function LoginPage() {
    const { isLoading, error, handleSubmit, clearError } = useLogin();

    return (
        <div className="login-container">
            {/* Decoupled Background Layer for exactly matched curves and fluid blobs */}
            <div className="login-bg-layer">
                <div className="login-bg-dark" />
                <div className="lr-grid" />
                <div className="lr-blob lr-blob--a" />
                <div className="lr-blob lr-blob--b" />
                <div className="lr-blob lr-blob--c" />
                
                <svg className="login-curve-overlay" viewBox="0 0 1000 1000" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M 0 0 L 520 0 C 520 150, 440 300, 440 500 C 440 700, 480 850, 480 1000 L 0 1000 Z"
                        fill="var(--bg-card)"
                    />
                </svg>
            </div>

            {/* Left Side: Form */}
            <div className="login-left">
                <div className="login-nav">
                    <div className="login-brand">
                        <img src={`${import.meta.env.VITE_BASE_URL || '/'}tensawLogo.jpg`} alt="Tensaw Logo" className="brand-logo" />
                        <span>Tensaw Skill Studio</span>
                    </div>
                    <a href="https://www.tensaw.com" target="_blank" rel="noopener noreferrer" className="login-nav-link">About Us →</a>
                </div>

                <div className="login-form-wrapper">
                    <div className="login-pretag">Tensaw Studio</div>
                    <h1 className="login-title">Sign in to<br /><strong>your workspace</strong></h1>
                    <p className="login-subtitle">Powering AI agent workflows with industrial precision.</p>

                    <Form
                        layout="vertical"
                        onFinish={handleSubmit}
                        onValuesChange={clearError}
                        requiredMark={false}
                        className="login-form"
                    >
                        <Form.Item
                            label="WORK EMAIL"
                            name="email"
                            rules={[{ required: true, message: 'Please enter your email' }]}
                        >
                            <Input placeholder="name@company.com" size="large" />
                        </Form.Item>

                        <Form.Item
                            label="PASSWORD"
                            name="password"
                            rules={[{ required: true, message: 'Please enter your password' }]}
                        >
                            <Input.Password placeholder="Your secure password" size="large" />
                        </Form.Item>

                        <div className="login-forgot-wrap">
                            <a href="#" className="login-forgot">Forgot password?</a>
                        </div>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                block
                                loading={isLoading}
                                className="login-submit-btn"
                            >
                                Continue →
                            </Button>
                        </Form.Item>

                        {error && <div className="login-error-msg">{error}</div>}
                    </Form>

                    <Divider className="login-divider">OR CONTINUE WITH</Divider>

                    <div className="login-sso-grid">
                        <button className="sso-btn"><WindowsOutlined /> Microsoft</button>
                        <button className="sso-btn"><GoogleOutlined /> Google</button>
                        <button className="sso-btn"><GithubOutlined /> GitHub</button>
                    </div>

                    <div className="login-signup">
                        New to Tensaw? <a href="#">Request for Enterprise Access</a>
                    </div>
                </div>

                <div className="login-footer">
                    © {new Date().getFullYear()} Tensaw Technology · Privacy · Terms
                </div>
            </div>

            {/* Right Side: n8n/Langchain-style Animated Workflow Canvas */}
            <div className="login-right">
                {/* Mini window chrome toolbar */}
                <div className="lr-toolbar">
                    <div className="lr-toolbar-dots">
                        <span className="lr-toolbar-dot lr-toolbar-dot--red" />
                        <span className="lr-toolbar-dot lr-toolbar-dot--yellow" />
                        <span className="lr-toolbar-dot lr-toolbar-dot--green" />
                    </div>
                    <span className="lr-toolbar-title">skill-orchestration.flow</span>
                    <span className="lr-toolbar-live">● Live</span>
                </div>

                {/* Canvas area */}
                <div className="lr-canvas">
                    <div className="lr-canvas-inner">
                        {/* SVG layer for edges + animateMotion packets */}
                        <svg className="lr-edges" viewBox="0 0 950 420" preserveAspectRatio="xMidYMid meet">
                            <defs>
                                <filter id="pkglow">
                                <feGaussianBlur stdDeviation="3" result="b"/>
                                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                            </filter>
                            <linearGradient id="edge-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8"/>
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8"/>
                            </linearGradient>
                            <linearGradient id="edge-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8"/>
                                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.8"/>
                            </linearGradient>
                            <linearGradient id="edge-grad-3" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8"/>
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8"/>
                            </linearGradient>
                            <marker id="arr-main" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
                                <path d="M0,0 L0,7 L7,3.5 z" fill="#8b5cf6"/>
                            </marker>
                        </defs>

                        {/* Render Edges */}
                        {CANVAS_EDGES.map((edge, i) => (
                            <path 
                                key={i} d={edge.d} stroke={edge.stroke} fill="none"
                                strokeWidth={edge.dashed ? 1.5 : 2}
                                strokeDasharray={edge.dashed ? "5 5" : undefined}
                                markerEnd={edge.marker ? "url(#arr-main)" : undefined}
                                style={{ animation: edge.animation }}
                            />
                        ))}

                        {/* Render Animation Packets */}
                        {PACKETS.map((pkg, i) => (
                            <circle key={`pkg-${i}`} r={pkg.r} fill={pkg.fill} filter="url(#pkglow)" opacity={pkg.opacity || 1}>
                                <animateMotion dur={pkg.dur} repeatCount="indefinite" begin={pkg.begin} path={pkg.path} />
                            </circle>
                        ))}
                    </svg>

                    {/* Render Workflow Nodes */}
                    {CANVAS_NODES.map((node, i) => (
                        <div key={node.id} className="lr-node" style={{ ...node.style, animationDelay: `${i * 0.6}s` }}>
                            <div className="lr-node-hd">
                                <span className={`lr-icon lr-icon--${node.iconStyle}`}>{node.icon}</span>
                                <div className="lr-node-meta">
                                    <span className="lr-node-name">{node.name}</span>
                                    <span className="lr-node-sub">{node.sub}</span>
                                </div>
                                {node.dot && <span className={`lr-dot lr-dot--${node.dot}`} />}
                            </div>
                            
                            <div className="lr-node-bd">
                                {node.membar && (
                                    <div className="lr-membar"><div className="lr-memfill" style={{ width: node.membar }}/></div>
                                )}
                                {node.typing && (
                                    <div className="lr-typing"><span/><span/><span/></div>
                                )}
                                {node.rows?.map((row, rIdx) => (
                                    <div key={rIdx} className="lr-row">
                                        <span>{row.label}</span>
                                        <code>{row.code}</code>
                                    </div>
                                ))}
                            </div>
                            
                            {node.chip && (
                                <div className="lr-node-ft">
                                    <span className={`lr-chip lr-chip--${node.chip.style}`}>{node.chip.text}</span>
                                </div>
                            )}
                        </div>
                    ))}
                    </div>

                    {/* Bottom Stats Bar */}
                    <div className="lr-stats">
                        {CANVAS_STATS.map((stat, i) => (
                            <div key={i} className="lr-stat">
                                <span className={`lr-sdot lr-sdot--${stat.dot}`} />
                                {stat.text}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
