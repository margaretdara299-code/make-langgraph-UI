/**
 * CreateSkillFooter — footer buttons for the Create Skill wizard modal.
 */

import { Space, Button } from 'antd';
import type { CreateSkillFooterProps } from '@/interfaces';

export default function CreateSkillFooter({
    currentStep,
    isSubmitting,
    onBack,
    onNext,
    onCreate,
}: CreateSkillFooterProps) {
    return (
        <Space>
            {currentStep > 0 && (
                <Button onClick={onBack}>
                    Back
                </Button>
            )}
            {currentStep === 0 ? (
                <Button type="primary" onClick={onNext}>
                    Next
                </Button>
            ) : (
                <Button
                    type="primary"
                    onClick={onCreate}
                    loading={isSubmitting}
                >
                    Create Skill
                </Button>
            )}
        </Space>
    );
}
