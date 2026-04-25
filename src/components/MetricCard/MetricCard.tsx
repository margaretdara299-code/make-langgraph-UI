import React, { useState, useEffect } from 'react';
import { Card, Typography, Space } from 'antd';
import './MetricCard.css';

const { Text, Title } = Typography;

interface MetricCardProps {
    label: string;
    value: number;
    subtext: string;
    isPositive: boolean;
    color: string;
    icon: React.ElementType;
}

const CountUp: React.FC<{ end: number; duration?: number }> = ({ end, duration = 1000 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        let animationFrameId: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = (timestamp - startTime) / duration;

            if (progress < 1) {
                setCount(Math.floor(end * progress));
                animationFrameId = requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, [end, duration]);

    return <span>{count}</span>;
};

export const MetricCard: React.FC<MetricCardProps> = ({
    label,
    value,
    subtext,
    isPositive,
    color,
    icon: Icon
}) => {
    return (
        <Card className="metric-card" bordered={false}>
            <div className="metric-card__content">
                <div className="metric-card__icon-box" style={{ '--metric-color': color } as React.CSSProperties}>
                    <Icon className="metric-card__icon" />
                </div>
                <div className="metric-card__info">
                    <Text className="metric-card__label">{label}</Text>
                    <Title level={4} className="metric-card__value">
                        <CountUp end={value} />
                    </Title>
                </div>
            </div>
        </Card>
    );
};
