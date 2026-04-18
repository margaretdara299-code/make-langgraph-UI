import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronRight, Loader2, Plus, Minus,
  Zap, Database, Layout, Folder, BrainCircuit, FileText, Ban, Activity, Settings,
  Hospital, Receipt, FileBarChart, RotateCcw
} from 'lucide-react';
import { Tree } from 'antd';
import type { TreeDataNode } from 'antd';
import { useDesignerActions, useDesignerConnectors } from '@/hooks';
import { SearchInput } from '@/components';
import { ICON_MAP, SUB_CAT_COLORS } from './nodePalette.constants';
import StartNodeItem from './StartNodeItem';
import SubFlowNodeItem from './SubFlowNodeItem';
import DecisionNodeItem from './DecisionNodeItem';
import EndNodeItem from './EndNodeItem';
import ErrorNodeItem from './ErrorNodeItem';
import './NodePalette.css';

const getSubCatIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('hospital')) return <Hospital size={14} className="sub-cat-icon" />;
  if (n.includes('bill')) return <Receipt size={14} className="sub-cat-icon" />;
  if (n.includes('ai') || n.includes('llm')) return <BrainCircuit size={14} className="sub-cat-icon" />;
  if (n.includes('report')) return <FileBarChart size={14} className="sub-cat-icon" />;
  if (n.includes('recover')) return <RotateCcw size={14} className="sub-cat-icon" />;
  if (n.includes('claim') || n.includes('cliam')) return <FileText size={14} className="sub-cat-icon" />;
  if (n.includes('denial')) return <Ban size={14} className="sub-cat-icon" />;
  if (n.includes('triage')) return <Activity size={14} className="sub-cat-icon" />;
  if (n.includes('process') || n.includes('procees')) return <Settings size={14} className="sub-cat-icon" />;
  return <Folder size={14} className="sub-cat-icon" />;
};

// Custom renderer for Tree Items to maintain Drag & Drop
const TreeTitle: React.FC<{ node: any; isLeaf?: boolean }> = ({ node, isLeaf }) => {
  if (!isLeaf) return <span className="tree-group-label">{node.label}</span>;

  const Icon = ICON_MAP[node.icon] ?? null;
  const colors = SUB_CAT_COLORS[node.subCategory] || SUB_CAT_COLORS['Common'];

  const onDragStart = (e: React.DragEvent) => {
    const dragData = JSON.stringify({
      type: node.type,
      label: node.label,
      subtitle: node.subtitle,
      icon: node.icon || '🧩',
      actionId: node.id || '',
      category: node.category,
      capability: node.capability
    });
    e.dataTransfer.setData('application/reactflow', dragData);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="node-library-item-wrapper" draggable onDragStart={onDragStart}>
        <div className="node-library-item">
            <div className="nli-icon" style={{ background: colors.bg }}>
            {Icon ? (
                <Icon size={12} color={colors.color} strokeWidth={2.4} />
            ) : (
                <span style={{ fontSize: '12px' }}>{node.icon && node.icon.length <= 2 ? node.icon : '🧩'}</span>
            )}
            </div>
            <div className="nli-content">
                <span className="nli-label">{node.label}</span>
            </div>            
        </div>
    </div>
  );
};

export default function NodePalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const { actionsByCategory, isLoading: actionsLoading } = useDesignerActions();
  const { connectorGroups, isLoading: connectorsLoading } = useDesignerConnectors() as any;

  // Transform data into TreeDataNode[]
  const treeData = useMemo(() => {
    const data: TreeDataNode[] = [];

    // 1. Actions
    const actionChildren: TreeDataNode[] = Object.entries(actionsByCategory).map(([subCat, items]: [string, any]) => ({
      title: (
        <div className="gh-left sub-gh-left">
          {getSubCatIcon(subCat)}
          <span className="sub-group-label">{subCat}</span>
        </div>
      ),
      key: `actions-${subCat}`,
      children: items.map((action: any) => ({
        title: <TreeTitle node={{ 
            id: action.id, type: 'action', label: action.name, 
            icon: action.icon || 'Zap', category: 'Actions', subCategory: subCat 
        }} isLeaf />,
        key: action.id,
        isLeaf: true
      }))
    }));

    if (actionChildren.length > 0) {
      data.push({
        title: (
          <div className="gh-left">
            <div className="cat-icon-wrapper"><Zap size={16} /></div>
            <span className="group-label">Actions</span>
          </div>
        ),
        key: 'cat-actions',
        children: actionChildren
      });
    }

    // 2. Connectors
    const connectorChildren: TreeDataNode[] = Object.entries(connectorGroups || {}).map(([subCat, items]: [string, any]) => ({
      title: (
        <div className="gh-left sub-gh-left">
          {getSubCatIcon(subCat)}
          <span className="sub-group-label">{subCat}</span>
        </div>
      ),
      key: `connectors-${subCat}`,
      children: items.map((conn: any) => ({
        title: <TreeTitle node={{ 
            id: conn.id, type: 'data', label: conn.name, 
            icon: conn.icon || 'Database', category: 'Connectors', subCategory: subCat 
        }} isLeaf />,
        key: conn.id,
        isLeaf: true
      }))
    }));

    if (connectorChildren.length > 0) {
      data.push({
        title: (
          <div className="gh-left">
            <div className="cat-icon-wrapper"><Database size={16} /></div>
            <span className="group-label">Connectors</span>
          </div>
        ),
        key: 'cat-connectors',
        children: connectorChildren
      });
    }

    return data;
  }, [actionsByCategory, connectorGroups]);

  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(['cat-common', 'cat-actions']);

  const onExpand = (keys: React.Key[], info: { node: any; expanded: boolean }) => {
    if (info.expanded) {
      const currentKey = info.node.key as string;
      
      // 1. Handle Top-level categories (Actions, Connectors, Common)
      const topLevelKeys = ['cat-common', 'cat-actions', 'cat-connectors'];
      if (topLevelKeys.includes(currentKey)) {
        const otherTopLevel = topLevelKeys.filter(k => k !== currentKey);
        setExpandedKeys(keys.filter(k => !otherTopLevel.includes(k as string)));
        return;
      }

      // 2. Handle Sub-categories within Actions
      if (currentKey.startsWith('actions-')) {
        const otherActionSubs = keys.filter(k => 
          typeof k === 'string' && k.startsWith('actions-') && k !== currentKey
        );
        setExpandedKeys(keys.filter(k => !otherActionSubs.includes(k)));
        return;
      }

      // 3. Handle Sub-categories within Connectors
      if (currentKey.startsWith('connectors-')) {
        const otherConnSubs = keys.filter(k => 
          typeof k === 'string' && k.startsWith('connectors-') && k !== currentKey
        );
        setExpandedKeys(keys.filter(k => !otherConnSubs.includes(k)));
        return;
      }
    }
    setExpandedKeys(keys);
  };

  return (
    <>
      <div className="library-control-fixed">
        <button
          className={`library-toggle-btn ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <Minus size={14} /> : <Plus size={14} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            className="node-library-floating"
            initial={{ x: -20, opacity: 0, scale: 0.98 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: -20, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
          >
            <div className="sidebar-top">
              <div className="sidebar-title">Node Library</div>
              <div className="sidebar-search-wrap">
                <SearchInput
                  placeholder="Search nodes..."
                  value={search}
                  onChange={setSearch}
                />
              </div>
            </div>

            <div className="sidebar-scroll antd-tree-container">
              {(actionsLoading || connectorsLoading) && (
                <div className="sidebar-loading">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Loading library...</span>
                </div>
              )}

              {!search ? (
                <>
                  {/* Common Section (Fixed structure) */}
                  <div className="node-group" style={{ marginBottom: 0 }}>
                    <div className="antd-tree-wrapper">
                      {/* <pre>{JSON.stringify(treeData, null, 2)}</pre> */}
                        <Tree
                            showLine={{ showLeafIcon: false }}
                            switcherIcon={<ChevronDown size={14} />}
                            expandedKeys={expandedKeys}
                            onExpand={onExpand}
                            expandAction="click"
                            selectable={false}
                            treeData={[
                                {
                                    title: (
                                        <div className="gh-left">
                                          <div className="cat-icon-wrapper"><Layout size={16} /></div>
                                          <span className="group-label">Common</span>
                                        </div>
                                      ),
                                    key: 'cat-common',
                                    children: [
                                        { title: <StartNodeItem />, key: 'common-start', isLeaf: true },
                                        { title: <SubFlowNodeItem />, key: 'common-sub-flow', isLeaf: true },
                                        { title: <DecisionNodeItem />, key: 'common-decision', isLeaf: true },
                                        { title: <EndNodeItem />, key: 'common-end', isLeaf: true },
                                        { title: <ErrorNodeItem />, key: 'common-error', isLeaf: true }
                                    ]
                                },
                                ...treeData
                            ]}
                        />
                    </div>
                  </div>
                </>
              ) : (
                <div className="sidebar-empty">
                  Search results rendered via custom list if needed...
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
