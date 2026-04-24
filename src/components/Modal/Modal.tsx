/**
 * Modal — thin wrapper around AntD Modal.
 */

import { Modal as AntModal } from 'antd';
import type { ModalProps } from '@/interfaces';
import { MODAL_SIZE_MAP } from '@/constants';

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
}: ModalProps) {
    return (
        <AntModal
            open={isOpen}
            onCancel={onClose}
            title={title}
            width={MODAL_SIZE_MAP[size]}
            footer={null}
            destroyOnHidden
        >
            {children}
        </AntModal>
    );
}
