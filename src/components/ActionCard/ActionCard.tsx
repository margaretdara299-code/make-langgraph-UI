import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Typography, Dropdown, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import {
  ApiOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  BuildOutlined
} from '@ant-design/icons';
import StatusPill from '@/components/StatusPill/StatusPill';
import type { ActionCardProps } from '@/interfaces';
import './ActionCard.css';

const { Title, Paragraph } = Typography;

/**
 * ActionCard — Premium, high-density card architectural pattern.
 * Uses exact-replica design for consistency across the Studio.
 */
export default function ActionCard({ action, onAction }: ActionCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleMenuClick: MenuProps['onClick'] = ({ domEvent, key }) => {
    domEvent.stopPropagation();
    setIsMenuOpen(false);
    onAction?.(key, action.id);
  };

  return (
    <div className="action-card-premium" onDoubleClick={() => onAction?.('edit', action.id)}>
      <div className="ac-premium-header">
        <div className="ac-premium-icon-box">
          {action.icon ? (
            <span className="ac-emoji">{action.icon}</span>
          ) : (
            <ApiOutlined />
          )}
        </div>

        <div className="ac-header-right">
          <div className="ac-status-date">
            <StatusPill status={action.status || 'draft'} />
            <span className="ac-date-label">{formatDate(action.updated_at || action.updatedAt)}</span>
          </div>
          <div className="ac-premium-actions">
            <Dropdown
              menu={{
                items: [
                  { key: 'edit', icon: <EditOutlined />, label: 'Edit' },
                  { key: 'test', icon: <BuildOutlined />, label: 'Test API' },
                  { type: 'divider' },
                  { key: 'delete', icon: <DeleteOutlined />, label: 'Delete', danger: true },
                ],
                onClick: handleMenuClick
              }}
              trigger={['click']}
              placement="bottomRight"
              onOpenChange={setIsMenuOpen}
            >
              <button className="ac-menu-btn" onClick={(e) => e.stopPropagation()}>
                <motion.div animate={{ rotate: isMenuOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                  <MoreOutlined />
                </motion.div>
              </button>
            </Dropdown>
          </div>
        </div>
      </div>

      <div className="ac-premium-body">
        <div className="ac-identity-group">
          <Title level={5} className="ac-name" ellipsis>{action.name}</Title>
          <div className="ac-key-row">
            <code className="ac-key-minimal">
              {action.action_key}
            </code>
          </div>
        </div>
        <Paragraph className="ac-desc" type="secondary" ellipsis={{ rows: 2 }}>
          {action.description || 'Explore and run this automated workflow action.'}
        </Paragraph>
      </div>
    </div>
  );
}
