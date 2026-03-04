/**
 * Button — thin wrapper around AntD Button.
 */

import { Button as AntButton } from 'antd';
import type { ButtonProps } from '@/interfaces';
import { BUTTON_VARIANT_MAP } from '@/constants';

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    fullWidth = false,
    onClick,
    type = 'button',
}: ButtonProps) {
    const antVariant = BUTTON_VARIANT_MAP[variant];
    const antSize = size === 'sm' ? 'small' : size === 'lg' ? 'large' : 'middle';

    return (
        <AntButton
            type={antVariant.type}
            danger={antVariant.danger}
            size={antSize}
            disabled={disabled}
            block={fullWidth}
            onClick={onClick}
            htmlType={type}
        >
            {children}
        </AntButton>
    );
}
