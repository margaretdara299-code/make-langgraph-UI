/**
 * LoginPage — Composes AnimatedNodesBackground + LoginCard.
 * Uses the useLogin hook for all form logic.
 */

import AnimatedNodesBackground from '@/components/AnimatedNodesBackground/AnimatedNodesBackground';
import LoginCard from '@/components/LoginCard/LoginCard';
import useLogin from '@/hooks/useLogin.hook';
import './LoginPage.css';

export default function LoginPage() {
    const { isLoading, error, handleSubmit, clearError } = useLogin();

    return (
        <div className="login-page">
            <AnimatedNodesBackground />
            <div className="login-page__content">
                <LoginCard
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    error={error}
                    onFieldChange={clearError}
                />
            </div>
        </div>
    );
}
