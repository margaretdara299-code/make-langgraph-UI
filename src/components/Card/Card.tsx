/**
 * Card — thin wrapper around AntD Card.
 */

import { Card as AntCard } from 'antd';
import type { CardProps } from '@/interfaces';

export default function Card({ children, onClick, hoverable = false }: CardProps) {
    return (
        <AntCard
            hoverable={hoverable}
            onClick={onClick}
            styles={{ body: { padding: 24 } }}
        >
            {children}
        </AntCard>
    );
}
