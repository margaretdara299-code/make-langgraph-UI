import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Loader2, Plus, Minus, Zap, Database, Layout } from 'lucide-react';

import { useDesignerActions, useDesignerConnectors } from '@/hooks';
import { SearchInput } from '@/components';
import { ICON_MAP, SUB_CAT_COLORS } from './nodePalette.constants';
import type { CatHeaderProps, DragNodePayload, PaletteLeafNode } from '@/interfaces/node-palette.interface';

import StartNodeItem from './StartNodeItem';
import SubFlowNodeItem from './SubFlowNodeItem';
import DecisionNodeItem from './DecisionNodeItem';
import EndNodeItem from './EndNodeItem';
import ErrorNodeItem from './ErrorNodeItem';
import QueueNodeItem from './QueueNodeItem';
import { ParallelSplitItem, ParallelJoinItem } from './ParallelNodeItems';
import IconRenderer from '../IconRenderer/IconRenderer';
import './NodePalette.css';

/* ── Draggable leaf item ──────────────────────────────────────
  Builds the drag payload and renders the icon + label card.
─────────────────────────────────────────────────────────────── */
const TreeTitle: React.FC<{ node: PaletteLeafNode & { type: string; category: string; subCategory: string } }> = ({ node }) => {
  const colors = SUB_CAT_COLORS[node.subCategory] ?? SUB_CAT_COLORS['Common'];

  const onDragStart = (e: React.DragEvent) => {
    const payload: DragNodePayload = {
      type: node.type,
      label: node.name,
      icon: node.icon ?? 'Package',
      actionId: node.id,
      category: node.category,
    };
    e.dataTransfer.setData('application/reactflow', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="node-library-item-wrapper" draggable onDragStart={onDragStart}>
      <div className="node-library-item">
        <div className="nli-icon" style={{ '--nli-bg': colors.bg } as React.CSSProperties}>
          <IconRenderer
            iconName={node.icon}
            size={12}
            color={colors.color}
            strokeWidth={2.4}
          />
        </div>
        <div className="nli-content">
          <span className="nli-label">{node.name}</span>
        </div>
      </div>
    </div>
  );
};

/* ── Top-level category header ────────────────────────────────
  [25 px animated chevron] [cat-icon] [label]
  Matches the original AntD Tree top-level node appearance.
─────────────────────────────────────────────────────────────── */
const CategoryHeader: React.FC<CatHeaderProps> = ({ catKey, icon, label, openCat, onToggle }) => (
  <div className="cat-section-header" onClick={() => onToggle(catKey)}>
    <motion.span
      className="cat-section-switcher"
      animate={{ rotate: openCat === catKey ? -180 : 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <ChevronDown size={14} />
    </motion.span>
    <div className="gh-left">
      <div className="cat-icon-wrapper">{icon}</div>
      <span className="group-label">{label}</span>
    </div>
  </div>
);

/* ── Main component ───────────────────────────────────────── */
export default function NodePalette() {
  const [isOpen, setIsOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [openCat, setOpenCat] = useState<string | null>('cat-common');

  /**
   * Dynamic sub-category state — keyed by top-level category key.
   * Scales automatically as more categories/sub-categories are added.
   * { 'cat-actions': 'Claims' | null, 'cat-connectors': 'Hospital' | null, ... }
   */
  const [openSubs, setOpenSubs] = useState<Record<string, string | null>>({});

  const { actionsByCategory, isLoading: actionsLoading } = useDesignerActions();
  const { connectorGroups, isLoading: connectorsLoading } = useDesignerConnectors() as any;

  const actionEntries = useMemo(() => Object.entries(actionsByCategory), [actionsByCategory]);
  const connectorEntries = useMemo(() => Object.entries(connectorGroups ?? {}), [connectorGroups]);

  /* Toggle top-level category — collapse all sub-categories on change */
  const toggleCat = (key: string) => {
    setOpenCat(prev => (prev === key ? null : key));
    setOpenSubs({});
  };

  /* Toggle sub-category within a top-level category (only one open at a time per category) */
  const toggleSub = (catKey: string, subKey: string) =>
    setOpenSubs(prev => ({ ...prev, [catKey]: prev[catKey] === subKey ? null : subKey }));

  /* Render a sub-level accordion (Actions or Connectors) generically */
  const renderSubAccordion = (
    catKey: string,
    entries: [string, any][],
    type: 'action' | 'data',
    defaultIcon: string,
  ) => (
    <div className={`acc-panel ${openCat === catKey ? 'open' : ''}`}>
      <div className="np-depth1-group">
        {entries.map(([subCat, items]: [string, PaletteLeafNode[]]) => (
          <div key={subCat}>
            {/* Sub-category header */}
            <div
              className="cat-section-header"
              onClick={() => toggleSub(catKey, subCat)}
            >
              <motion.span
                className="cat-section-switcher"
                animate={{ rotate: openSubs[catKey] === subCat ? -180 : 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <ChevronDown size={13} />
              </motion.span>
              <span className="sub-group-label">{subCat}</span>
            </div>

            {/* Leaf items — CSS Grid slide */}
            <div className={`acc-panel ${openSubs[catKey] === subCat ? 'open' : ''}`}>
              <div className="np-depth2 np-leaf">
                {items.map((item: PaletteLeafNode) => (
                  <TreeTitle
                    key={item.id}
                    node={{ ...item, type, category: catKey, subCategory: subCat, icon: item.icon ?? defaultIcon }}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* ── Toggle button ── */}
      <div className="library-control-fixed">
        <button className={`library-toggle-btn ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
          <Plus size={14} className="toggle-icon" />
        </button>
      </div>

      {/* ── Floating panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            className="node-library-floating"
            initial={{ x: -350, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -350, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 150 }}
          >
            {/* Header */}
            <div className="sidebar-top">
              <div className="sidebar-title">Node Library</div>
              <div className="sidebar-search-wrap">
                <SearchInput placeholder="Search nodes..." value={search} onChange={setSearch} />
              </div>
            </div>

            {/* Scrollable tree */}
            <div className="sidebar-scroll antd-tree-container">
              {(actionsLoading || connectorsLoading) && (
                <div className="sidebar-loading">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Loading library...</span>
                </div>
              )}

              {!search && (
                <div className="node-group node-group--first">
                  <div className="antd-tree-wrapper">

                    {/* ════ COMMON ════ */}
                    <CategoryHeader catKey="cat-common" icon={<Layout size={16} />} label="Common"
                      openCat={openCat} onToggle={toggleCat} />
                    <div className={`acc-panel ${openCat === 'cat-common' ? 'open' : ''}`}>
                      <div className="np-depth1 np-leaf">
                        <StartNodeItem /><SubFlowNodeItem /><DecisionNodeItem />
                        <QueueNodeItem /><ParallelSplitItem /><ParallelJoinItem />
                        <EndNodeItem /><ErrorNodeItem />
                      </div>
                    </div>

                    {/* ════ ACTIONS (dynamic) ════ */}
                    {actionEntries.length > 0 && (
                      <>
                        <CategoryHeader catKey="cat-actions" icon={<Zap size={16} />} label="Actions"
                          openCat={openCat} onToggle={toggleCat} />
                        {renderSubAccordion('cat-actions', actionEntries, 'action', 'Zap')}
                      </>
                    )}

                    {/* ════ CONNECTORS (dynamic) ════ */}
                    {connectorEntries.length > 0 && (
                      <>
                        <CategoryHeader catKey="cat-connectors" icon={<Database size={16} />} label="Connectors"
                          openCat={openCat} onToggle={toggleCat} />
                        {renderSubAccordion('cat-connectors', connectorEntries, 'data', 'Database')}
                      </>
                    )}

                  </div>
                </div>
              )}

              {search && (
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
