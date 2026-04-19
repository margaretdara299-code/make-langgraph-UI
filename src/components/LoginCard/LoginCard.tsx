/**
 * LoginCard — Glassmorphic login form card.
 * Accepts login logic props from the useLogin hook via the parent page.
 */

import { Form, Input, Button, Checkbox, Alert, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import type { LoginFormValues, LoginCardProps } from '@/interfaces';
import { LOGIN_FORM_RULES, LOGIN_STRINGS } from '@/constants/auth.constants';
import './LoginCard.css';

const { Title, Text } = Typography;

export default function LoginCard({
    onSubmit,
    isLoading,
    error,
    onFieldChange,
}: LoginCardProps) {
    return (
        <div className="login-card">
            {/* Branding */}
            <div className="login-card__brand">
                <img
                    src={`${import.meta.env.VITE_IMAGE_BASE_URL || ''}/tensawLogo.jpg`}
                    alt="Tensaw Logo"
                    className="login-card__logo"
                />
                <div className="login-card__brand-text">
                    <Title level={3} className="login-card__title">
                        {LOGIN_STRINGS.heading}
                    </Title>
                    <Text className="login-card__subtitle">
                        {LOGIN_STRINGS.subheading}
                    </Text>
                </div>
            </div>

            {/* Error alert */}
            {error && (
                <Alert
                    message={error}
                    type="error"
                    showIcon
                    className="login-card__error"
                />
            )}

            {/* Login Form */}
            <Form<LoginFormValues>
                name="login"
                initialValues={{ remember: true }}
                onFinish={onSubmit}
                onValuesChange={onFieldChange}
                layout="vertical"
                requiredMark={false}
                className="login-card__form"
                size="large"
            >
                <Form.Item name="username" rules={LOGIN_FORM_RULES.username}>
                    <Input
                        prefix={<UserOutlined className="login-card__input-icon" />}
                        placeholder={LOGIN_STRINGS.usernamePlaceholder}
                        autoComplete="username"
                        id="login-username"
                    />
                </Form.Item>

                <Form.Item name="password" rules={LOGIN_FORM_RULES.password}>
                    <Input.Password
                        prefix={<LockOutlined className="login-card__input-icon" />}
                        placeholder={LOGIN_STRINGS.passwordPlaceholder}
                        autoComplete="current-password"
                        id="login-password"
                    />
                </Form.Item>

                <Form.Item className="login-card__options">
                    <div className="login-card__options-row">
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox className="login-card__remember">
                                {LOGIN_STRINGS.rememberMe}
                            </Checkbox>
                        </Form.Item>
                        <a className="login-card__forgot" href="#">
                            {LOGIN_STRINGS.forgotPassword}
                        </a>
                    </div>
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        loading={isLoading}
                        className="login-card__submit"
                        id="login-submit"
                    >
                        {isLoading
                            ? LOGIN_STRINGS.signingInButton
                            : LOGIN_STRINGS.signInButton}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}
