import {
  CreditCard, Webhook, Clock, Mail, MessageSquare, Table2, Bot, Globe, Zap, Terminal, Play, 
  Map, Lightbulb, Activity, Database, Shield, Layout, Settings, Cpu
} from 'lucide-react';

export const ICON_MAP: Record<string, any> = {
  CreditCard, Webhook, Clock, Mail, MessageSquare, Table2, Bot, Globe, Zap, Terminal, Play,
  Map, Lightbulb, Activity, Database, Shield, Layout, Settings, Cpu,
  'Zap': Zap,
  'Api': Terminal,
  'Ai': Bot,
  'Data': Database
};

export const SUB_CAT_COLORS: Record<string, { bg: string; color: string }> = {
  'TRIGGERS': { bg: '#ecfdf5', color: '#059669' },
  'COMMUNICATION': { bg: '#eef2ff', color: '#4f46e5' },
  'AI & INTELLIGENCE': { bg: '#faf5ff', color: '#9333ea' },
  'AI & ML': { bg: '#faf5ff', color: '#9333ea' },
  'PRODUCTIVITY': { bg: '#fff7ed', color: '#ea580c' },
  'CRM & SALES': { bg: '#fff1f2', color: '#e11d48' },
  'ANALYTICS': { bg: '#f0fdfa', color: '#0d9488' },
  'DEV TOOLS': { bg: '#f8fafc', color: '#475569' },
  'SECURITY': { bg: '#fef2f2', color: '#dc2626' },
  'FINANCE': { bg: '#f0fdf4', color: '#16a34a' },
  'UTILITIES': { bg: '#fdf4ff', color: '#c026d3' },
  'E-COMMERCE': { bg: '#fffbeb', color: '#d97706' },
  'MARKETING': { bg: '#fdf2f8', color: '#db2777' },
  'SOCIAL MEDIA': { bg: '#eff6ff', color: '#2563eb' },
  'CLOUD SERVICES': { bg: '#f0f9ff', color: '#0284c7' },
  'DATABASES': { bg: '#fff7ed', color: '#c2410c' },
  'MONITORING': { bg: '#f5f3ff', color: '#7c3aed' },
  'OPERATIONS': { bg: '#f0fdf4', color: '#15803d' },
  'CUSTOMER SUPPORT': { bg: '#fdf4ff', color: '#c026d3' },
  'CONTENT MANAGEMENT': { bg: '#fffdf2', color: '#a16207' },
  'Common': { bg: '#f1f5f9', color: '#000000' },
};
