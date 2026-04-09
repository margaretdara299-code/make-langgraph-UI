import React, { useState } from 'react';
import { Form, Input, Button, Divider, Space } from 'antd';
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
                        <button className="sso-btn">
                            <WindowsOutlined /> Microsoft
                        </button>
                        <button className="sso-btn">
                            <GoogleOutlined /> Google
                        </button>
                        <button className="sso-btn">
                            <GithubOutlined /> GitHub
                        </button>
                    </div>

                    <div className="login-signup">
                        New to Tensaw? <a href="#">Request for Enterprise Access</a>
                    </div>
                </div>

                <div className="login-footer">
                    © 2025 Tensaw Technology · Privacy · Terms
                </div>
            </div>

            {/* Right Side: Visualization */}
            <div className="login-right">
                <div className="login-vis-container">
                    <p className="login-vis-title">Node Logic Orchestration</p>
                    <div className="animated-canvas-full">
                        <div className="canvas-grid"></div>
                        
                        {/* Animated Nodes */}
                        <div className="vis-node vis-node-trigger">
                            <div className="vis-node-icon">⚡</div>
                            <span>Webhook</span>
                        </div>
                        
                        <div className="vis-node vis-node-router">
                            <div className="vis-node-icon">🔀</div>
                            <span>Router</span>
                        </div>

                        <div className="vis-node vis-node-ai">
                            <div className="vis-node-icon">✨</div>
                            <span>LLM Agent</span>
                        </div>

                        <div className="vis-node vis-node-memory">
                            <div className="vis-node-icon">🧠</div>
                            <span>Context</span>
                        </div>
                        
                        <div className="vis-node vis-node-tool">
                            <div className="vis-node-icon">🛠️</div>
                            <span>API Action</span>
                        </div>

                        <div className="vis-node vis-node-output">
                            <div className="vis-node-icon">✅</div>
                            <span>Response</span>
                        </div>

                        {/* Connection Lines */}
                        <svg className="vis-connections" viewBox="0 0 600 500" preserveAspectRatio="xMidYMid slice">
                            {/* Main Web */}
                            <path d="M 80 250 Q 150 250 180 250" className="vis-path vis-path-1" />
                            <path d="M 250 250 Q 300 150 350 100" className="vis-path vis-path-2" />
                            <path d="M 250 250 Q 300 350 350 400" className="vis-path vis-path-3" />
                            <path d="M 350 100 Q 450 100 480 250" className="vis-path vis-path-4" />
                            <path d="M 350 400 Q 450 400 480 250" className="vis-path vis-path-5" />
                            {/* Crossing / Memory Paths */}
                            <path d="M 350 100 C 350 150 350 250 350 300" className="vis-path vis-path-6" />
                            <path d="M 350 400 L 350 310" className="vis-path vis-path-7" />
                            <path d="M 350 100 Q 150 150 80 250" className="vis-path vis-path-8" />
                            <path d="M 480 250 C 400 300 400 350 350 400" className="vis-path vis-path-9" />
                            <path d="M 250 250 L 350 400" className="vis-path vis-path-10" />
                        </svg>

                        <div className="vis-pulse vis-pulse-1"></div>
                        <div className="vis-pulse vis-pulse-2"></div>
                        <div className="vis-pulse vis-pulse-3"></div>
                        <div className="vis-pulse vis-pulse-4"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
