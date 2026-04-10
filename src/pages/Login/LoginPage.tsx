import React, { useState } from 'react';
import { Form, Input, Button, Divider } from 'antd';
import { GithubOutlined, GoogleOutlined, WindowsOutlined } from '@ant-design/icons';
import useLogin from '@/hooks/useLogin.hook';
import './LoginPage.css';

export default function LoginPage() {
    const { isLoading, error, handleSubmit, clearError } = useLogin();

    return (
        <div className="login-container">
            {/* Left Side: Form */}
            <div className="login-left">
                <div className="login-nav">
                    <div className="login-brand">
                        <img src="/tensawLogo.jpg" alt="Tensaw Logo" className="brand-logo" />
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
                    © 2025 Tensaw Technology · Privacy · Terms
                </div>
            </div>

            {/* S-curve divider — white tongue biting into the dark canvas, like the reference image */}
            <svg className="login-s-curve" viewBox="0 0 104 800" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M 52 0 C 52 0, 104 0, 104 0 L 104 800 C 104 800, 52 800, 52 800 C 52 800, -20 680, 20 560 C 60 440, 104 400, 52 300 C 0 200, -20 120, 52 0 Z"
                    fill="var(--bg-card)"
                />
            </svg>

            {/* Right Side: n8n/Langchain-style Animated Workflow Canvas */}
            <div className="login-right">
                <div className="lr-grid" />
                <div className="lr-blob lr-blob--a" />
                <div className="lr-blob lr-blob--b" />
                <div className="lr-blob lr-blob--c" />

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

                    {/* SVG layer for edges + animateMotion packets */}
                    <svg className="lr-edges" viewBox="0 0 700 420" preserveAspectRatio="xMidYMid meet">
                        <defs>
                            <filter id="pkglow">
                                <feGaussianBlur stdDeviation="3" result="b"/>
                                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                            </filter>
                            <marker id="arr" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
                                <path d="M0,0 L0,7 L7,3.5 z" fill="rgba(99,102,241,0.55)"/>
                            </marker>
                        </defs>

                        {/* Edges */}
                        <path d="M 148 108 C 205 108 215 178 268 178" stroke="rgba(99,102,241,0.45)" strokeWidth="2" fill="none" markerEnd="url(#arr)" className="lr-e lr-e--1"/>
                        <path d="M 372 158 C 415 158 432 103 483 103" stroke="rgba(99,102,241,0.45)" strokeWidth="2" fill="none" markerEnd="url(#arr)" className="lr-e lr-e--2"/>
                        <path d="M 372 198 C 415 198 432 285 483 285" stroke="rgba(249,115,22,0.4)" strokeWidth="2" fill="none" markerEnd="url(#arr)" className="lr-e lr-e--3"/>
                        <path d="M 592 103 C 635 103 650 195 645 225" stroke="rgba(16,185,129,0.45)" strokeWidth="2" fill="none" markerEnd="url(#arr)" className="lr-e lr-e--4"/>
                        <path d="M 592 285 C 635 285 650 250 645 235" stroke="rgba(16,185,129,0.45)" strokeWidth="2" fill="none" markerEnd="url(#arr)" className="lr-e lr-e--5"/>
                        <path d="M 148 122 C 178 122 190 335 268 335" stroke="rgba(59,130,246,0.3)" strokeWidth="1.5" strokeDasharray="5 5" fill="none" className="lr-e lr-e--6"/>
                        <path d="M 372 335 C 430 335 458 185 483 125" stroke="rgba(59,130,246,0.3)" strokeWidth="1.5" strokeDasharray="5 5" fill="none" className="lr-e lr-e--7"/>

                        {/* Data packet: Trigger → Router */}
                        <circle r="5" fill="#6366f1" filter="url(#pkglow)">
                            <animateMotion dur="2.4s" repeatCount="indefinite" begin="0s"   path="M 148 108 C 205 108 215 178 268 178"/>
                        </circle>
                        <circle r="5" fill="#6366f1" filter="url(#pkglow)" opacity="0.6">
                            <animateMotion dur="2.4s" repeatCount="indefinite" begin="1.2s" path="M 148 108 C 205 108 215 178 268 178"/>
                        </circle>
                        {/* Packet: Router → LLM */}
                        <circle r="5" fill="#8b5cf6" filter="url(#pkglow)">
                            <animateMotion dur="2.1s" repeatCount="indefinite" begin="0.7s" path="M 372 158 C 415 158 432 103 483 103"/>
                        </circle>
                        {/* Packet: Router → Tool */}
                        <circle r="4.5" fill="#f59e0b" filter="url(#pkglow)">
                            <animateMotion dur="2.7s" repeatCount="indefinite" begin="1.4s" path="M 372 198 C 415 198 432 285 483 285"/>
                        </circle>
                        {/* Packet: LLM → Output */}
                        <circle r="4.5" fill="#10b981" filter="url(#pkglow)">
                            <animateMotion dur="1.9s" repeatCount="indefinite" begin="0.4s" path="M 592 103 C 635 103 650 195 645 225"/>
                        </circle>
                        {/* Packet: Tool → Output */}
                        <circle r="4.5" fill="#10b981" filter="url(#pkglow)">
                            <animateMotion dur="2.2s" repeatCount="indefinite" begin="1.8s" path="M 592 285 C 635 285 650 250 645 235"/>
                        </circle>
                        {/* Packet: Memory dashed */}
                        <circle r="3.5" fill="#3b82f6" filter="url(#pkglow)">
                            <animateMotion dur="3.6s" repeatCount="indefinite" begin="1s"  path="M 148 122 C 178 122 190 335 268 335"/>
                        </circle>
                    </svg>

                    {/* Node: Webhook Trigger */}
                    <div className="lr-node" style={{left:'2%', top:'14%'}}>
                        <div className="lr-node-hd">
                            <span className="lr-icon lr-icon--green">⚡</span>
                            <div className="lr-node-meta">
                                <span className="lr-node-name">Webhook Trigger</span>
                                <span className="lr-node-sub">POST /api/skill-run</span>
                            </div>
                            <span className="lr-dot lr-dot--live" />
                        </div>
                        <div className="lr-node-bd">
                            <div className="lr-row"><span>auth</span><code>Bearer</code></div>
                            <div className="lr-row"><span>format</span><code>JSON</code></div>
                        </div>
                        <div className="lr-node-ft"><span className="lr-chip lr-chip--green">● Running</span></div>
                    </div>

                    {/* Node: Smart Router */}
                    <div className="lr-node" style={{left:'36%', top:'37%'}}>
                        <div className="lr-node-hd">
                            <span className="lr-icon lr-icon--slate">🔀</span>
                            <div className="lr-node-meta">
                                <span className="lr-node-name">Smart Router</span>
                                <span className="lr-node-sub">If / Else switch</span>
                            </div>
                            <span className="lr-dot lr-dot--live" />
                        </div>
                        <div className="lr-node-bd">
                            <div className="lr-row"><span>A →</span><code>LLM path</code></div>
                            <div className="lr-row"><span>B →</span><code>Tool path</code></div>
                        </div>
                    </div>

                    {/* Node: LLM Agent */}
                    <div className="lr-node" style={{left:'63%', top:'9%'}}>
                        <div className="lr-node-hd">
                            <span className="lr-icon lr-icon--indigo">✨</span>
                            <div className="lr-node-meta">
                                <span className="lr-node-name">LLM Agent</span>
                                <span className="lr-node-sub">gpt-4o-mini</span>
                            </div>
                            <span className="lr-dot lr-dot--pulse" />
                        </div>
                        <div className="lr-node-bd">
                            <div className="lr-typing"><span/><span/><span/></div>
                        </div>
                        <div className="lr-node-ft"><span className="lr-chip lr-chip--indigo">⟳ Processing</span></div>
                    </div>

                    {/* Node: API Action */}
                    <div className="lr-node" style={{left:'63%', top:'57%'}}>
                        <div className="lr-node-hd">
                            <span className="lr-icon lr-icon--orange">🛠️</span>
                            <div className="lr-node-meta">
                                <span className="lr-node-name">API Action</span>
                                <span className="lr-node-sub">Jira · Create Issue</span>
                            </div>
                            <span className="lr-dot lr-dot--idle" />
                        </div>
                        <div className="lr-node-bd">
                            <div className="lr-row"><span>method</span><code>POST</code></div>
                            <div className="lr-row"><span>auth</span><code>OAuth2</code></div>
                        </div>
                    </div>

                    {/* Node: Context Store */}
                    <div className="lr-node" style={{left:'36%', top:'68%'}}>
                        <div className="lr-node-hd">
                            <span className="lr-icon lr-icon--blue">🧠</span>
                            <div className="lr-node-meta">
                                <span className="lr-node-name">Context Store</span>
                                <span className="lr-node-sub">Vector memory</span>
                            </div>
                        </div>
                        <div className="lr-node-bd">
                            <div className="lr-membar"><div className="lr-memfill" style={{width:'72%'}}/></div>
                            <div className="lr-row"><span>used</span><code>72% · 4.1KB</code></div>
                        </div>
                    </div>

                    {/* Node: HTTP Response */}
                    <div className="lr-node" style={{right:'2%', top:'42%'}}>
                        <div className="lr-node-hd">
                            <span className="lr-icon lr-icon--green">✅</span>
                            <div className="lr-node-meta">
                                <span className="lr-node-name">HTTP Response</span>
                                <span className="lr-node-sub">200 OK</span>
                            </div>
                            <span className="lr-dot lr-dot--done" />
                        </div>
                        <div className="lr-node-bd">
                            <div className="lr-row"><span>status</span><code>200 OK</code></div>
                            <div className="lr-row"><span>latency</span><code>142ms</code></div>
                        </div>
                        <div className="lr-node-ft"><span className="lr-chip lr-chip--green">✓ Done</span></div>
                    </div>

                    {/* Bottom stats bar */}
                    <div className="lr-stats">
                        <div className="lr-stat"><span className="lr-sdot lr-sdot--green"/>6 nodes</div>
                        <div className="lr-stat"><span className="lr-sdot lr-sdot--blue"/>142ms p95</div>
                        <div className="lr-stat"><span className="lr-sdot lr-sdot--purple"/>1.2k/min</div>
                        <div className="lr-stat"><span className="lr-sdot lr-sdot--green"/>99.98% uptime</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
