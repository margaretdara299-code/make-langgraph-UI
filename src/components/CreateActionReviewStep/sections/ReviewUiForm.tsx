import { Descriptions, Tag } from 'antd';
import type { ReviewUiFormProps } from '@/interfaces';

export default function ReviewUiForm({ uiForm }: ReviewUiFormProps) {
    return (
        <Descriptions title="UI Form" bordered size="small" column={2}>
            <Descriptions.Item label="Display Mode">
                <Tag>{uiForm.displayMode}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Show Advanced">
                {uiForm.showAdvanced ? 'Yes' : 'No'}
            </Descriptions.Item>
            <Descriptions.Item label="Group Label">{uiForm.groupLabel || '—'}</Descriptions.Item>
            <Descriptions.Item label="Help Text">{uiForm.helpText || '—'}</Descriptions.Item>
        </Descriptions>
    );
}
