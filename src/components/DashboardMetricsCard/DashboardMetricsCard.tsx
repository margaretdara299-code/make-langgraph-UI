import { Card, Statistic, Divider, Row, Col } from 'antd';
import { BulbOutlined, SettingOutlined, CheckCircleOutlined, StopOutlined, CloudUploadOutlined, EditOutlined } from '@ant-design/icons';
import type { DashboardMetricsCardProps, DashboardCounts } from '@/interfaces';
import './DashboardMetricsCard.css';

export default function DashboardMetricsCard({ type, data }: DashboardMetricsCardProps) {
    const isSkills = type === 'skills';

    return (
        <Card 
            className={`dashboard-card ${isSkills ? 'skills-card' : 'actions-card'}`} 
            bordered={false}

            title={
                <div className="dashboard-card__title">
                    {isSkills ? (
                        <BulbOutlined className="dashboard-card__icon skills-icon" />
                    ) : (
                        <SettingOutlined className="dashboard-card__icon actions-icon" />
                    )}
                    <span>{isSkills ? 'Skills Overview' : 'Actions Overview'}</span>
                </div>
            }
        >
            <div className="dashboard-card__primary-stat">
                <Statistic
                    title={`Total ${isSkills ? 'Skills' : 'Actions'}`}
                    value={data.total}
                    className={`dashboard-card__stat-main ${isSkills ? 'stat-color-primary' : 'stat-color-connector'}`}
                />
            </div>
            
            <Divider className="dashboard-card__divider" />
            
            <Row gutter={[16, 24]}>
                <Col span={12}>
                    <Statistic 
                        title={<><CheckCircleOutlined /> Active</>} 
                        value={data.active} 
                        className="stat-color-success"
                    />
                </Col>
                <Col span={12}>
                    <Statistic 
                        title={<><StopOutlined /> Inactive</>} 
                        value={data.inactive} 
                        className="stat-color-secondary"
                    />
                </Col>
                <Col span={12}>
                    <Statistic 
                        title={<><EditOutlined /> {isSkills ? 'Draft Versions' : 'Draft'}</>} 
                        value={isSkills ? (data as DashboardCounts['skills']).draftVersions : (data as DashboardCounts['actions']).draft} 
                        className="stat-color-warning"
                    />
                </Col>
                <Col span={12}>
                    <Statistic 
                        title={<><CloudUploadOutlined /> {isSkills ? 'Published Versions' : 'Published'}</>} 
                        value={isSkills ? (data as DashboardCounts['skills']).publishedVersions : (data as DashboardCounts['actions']).published} 
                        className={isSkills ? 'stat-color-primary' : 'stat-color-connector'}
                    />
                </Col>
            </Row>
        </Card>
    );
}
