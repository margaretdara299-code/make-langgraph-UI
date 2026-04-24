import { CheckCircle2, CircleDashed, Rocket, Send, Clock, Zap } from 'lucide-react';

export const getStatusConfig = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'published':
      return {
        label: 'Published',
        icon: Rocket,
        className: 'published',
        color: '#10b981'
      };
    case 'pending':
    case 'deploying':
      return {
        label: 'Deploying',
        icon: Send,
        className: 'pending',
        color: '#6366f1'
      };
    case 'scheduled':
      return {
        label: 'Scheduled',
        icon: Clock,
        className: 'scheduled',
        color: '#f59e0b'
      };
    case 'draft':
    default:
      return {
        label: 'Draft',
        icon: CircleDashed,
        className: 'draft',
        color: '#64748b'
      };
  }
};
