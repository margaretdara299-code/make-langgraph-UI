import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Loader2, Plus } from 'lucide-react';

import { useDesignerActions, useDesignerConnectors, useDesignerSkills } from '@/hooks';
import { SearchInput } from '@/components';
import { ICON_MAP, NODE_PALETTE_SECTIONS, SUB_CAT_COLORS } from './nodePalette.constants';
import type { CatHeaderProps, DragNodePayload, PaletteLeafNode } from '@/interfaces/node-palette.interface';

import StartNodeItem from './StartNodeItem';
import SubFlowNodeItem from './SubFlowNodeItem';
import DecisionNodeItem from './DecisionNodeItem';
import EndNodeItem from './EndNodeItem';
import ErrorNodeItem from './ErrorNodeItem';
import QueueNodeItem from './QueueNodeItem';
import { SplitNodeItem } from './ParallelSplitNode';
import { MergeNodeItem } from './ParallelJoinNode';
import IconRenderer from '../IconRenderer/IconRenderer';
import './NodePalette.css';

/* ── Draggable leaf item ──────────────────────────────────────
  Builds the drag payload and renders the icon + label card.
─────────────────────────────────────────────────────────────── */
const TreeTitle: React.FC<{ node: PaletteLeafNode & { type: string; category: string; subCategory: string } }> = ({ node }) => {
  const colors = SUB_CAT_COLORS[node.subCategory] ?? SUB_CAT_COLORS['Common'];

  const onDragStart = (e: React.DragEvent) => {
    const isSkill = node.type === 'subflow' && Boolean(node.latestVersionId);
    const payload: DragNodePayload = {
      type: node.type,
      nodeType: isSkill ? 'skill' : ['subflow', 'connector'].includes(node.type) ? node.type : undefined,
      label: node.name,
      icon: node.icon ?? 'Package',
      actionId: node.actionId ?? node.id,
      description: node.description,
      connector_id: node.connector_id,
      connector_type: node.connector_type,
      config_json: node.config_json,
      category: node.category,
      latestVersionId: node.latestVersionId,
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
  const { skillsByCategory, isLoading: skillsLoading } = useDesignerSkills();
  const { connectorsByType, isLoading: connectorsLoading } = useDesignerConnectors();

  const actionEntries = useMemo(() => Object.entries(actionsByCategory), [actionsByCategory]);
  const skillEntries = useMemo(() => {
    const normalizedGroups = Object.entries(skillsByCategory ?? {}).reduce<Record<string, PaletteLeafNode[]>>(
      (groups, [category, skills]) => {
        groups[category] = (skills as any[]).map((skill) => ({
          id: String(skill.id),
          name: skill.name,
          icon: skill.icon || 'Box',
          description: skill.description,
          latestVersionId: skill.latestVersionId ?? skill.latest_version_id,
        }));
        return groups;
      },
      {}
    );

    return Object.entries(normalizedGroups);
  }, [skillsByCategory]);
  const connectorEntries = useMemo(() => {
    const normalizedGroups = Object.entries(connectorsByType ?? {}).reduce<Record<string, PaletteLeafNode[]>>(
      (groups, [connectorType, connectors]) => {
        groups[connectorType] = (connectors as any[]).map((connector) => ({
          id: String(connector.connector_id || connector.connectorId || connector.id),
          name: connector.name,
          icon: connector.icon || 'Database',
          description: connector.description,
          connector_id: connector.connector_id || connector.connectorId || connector.id,
          connector_type: connector.connector_type || connector.connectorType || connectorType,
          config_json: connector.config_json || connector.configJson || {},
        }));
        return groups;
      },
      {}
    );

    return Object.entries(normalizedGroups);
  }, [connectorsByType]);

  const dynamicSectionEntries = useMemo<Record<string, [string, PaletteLeafNode[]][]>>(() => ({
    'cat-skills': skillEntries,
    'cat-actions': actionEntries as [string, PaletteLeafNode[]][],
    'cat-connectors': connectorEntries as [string, PaletteLeafNode[]][],
  }), [actionEntries, connectorEntries, skillEntries]);

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
    entries: [string, PaletteLeafNode[]][],
    type: string,
    defaultIcon: string,
    emptyLabel?: string,
  ) => (
    <div className={`acc-panel ${openCat === catKey ? 'open' : ''}`}>
      <div className="np-depth1-group">
        {entries.length === 0 && emptyLabel && (
          <div className="sidebar-empty">
            {emptyLabel}
          </div>
        )}
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

  const renderCommonAccordion = (catKey: string) => (
    <div className={`acc-panel ${openCat === catKey ? 'open' : ''}`}>
      <div className="np-depth1 np-leaf">
        <StartNodeItem /><SubFlowNodeItem /><DecisionNodeItem />
        <QueueNodeItem /><SplitNodeItem /><MergeNodeItem />
        <EndNodeItem /><ErrorNodeItem />
      </div>
    </div>
  );

  const renderPaletteSection = (section: typeof NODE_PALETTE_SECTIONS[number]) => {
    const Icon = ICON_MAP[section.icon] ?? ICON_MAP.Layout;
    const entries = section.kind === 'dynamic' ? dynamicSectionEntries[section.key] ?? [] : [];

    if (section.kind === 'dynamic' && entries.length === 0 && !section.showWhenEmpty) {
      return null;
    }

    return (
      <React.Fragment key={section.key}>
        <CategoryHeader
          catKey={section.key}
          icon={<Icon size={16} />}
          label={section.label}
          openCat={openCat}
          onToggle={toggleCat}
        />
        {section.kind === 'static'
          ? renderCommonAccordion(section.key)
          : renderSubAccordion(section.key, entries, section.itemType, section.defaultIcon, section.emptyLabel)}
      </React.Fragment>
    );
  };

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
              {(actionsLoading || connectorsLoading || skillsLoading) && (
                <div className="sidebar-loading">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Loading library...</span>
                </div>
              )}

              {search.trim() ? (
                <div className="node-group">
                  <div className="antd-tree-wrapper">
                    {/* Filtered Common Nodes */}
                    {[
                      { component: <StartNodeItem />, name: 'Start' },
                      { component: <SubFlowNodeItem />, name: 'SubFlow' },
                      { component: <DecisionNodeItem />, name: 'Decision' },
                      { component: <QueueNodeItem />, name: 'Queue' },
                      { component: <SplitNodeItem />, name: 'Split' },
                      { component: <MergeNodeItem />, name: 'Merge' },
                      { component: <EndNodeItem />, name: 'End' },
                      { component: <ErrorNodeItem />, name: 'Error' },
                    ]
                      .filter(n => n.name.toLowerCase().includes(search.toLowerCase()))
                      .map((n, idx) => <div key={idx} className="np-leaf">{n.component}</div>)
                    }

                    {/* Filtered Actions */}
                    {actionEntries.map(([subCat, items]) => (
                      <div key={subCat}>
                        {items
                          .filter((item: any) => item.name.toLowerCase().includes(search.toLowerCase()))
                          .map((item: any) => (
                            <TreeTitle
                              key={item.id}
                              node={{ ...item, type: 'action', category: 'cat-actions', subCategory: subCat, icon: item.icon ?? 'Zap' }}
                            />
                          ))
                        }
                      </div>
                    ))}

                    {/* Filtered Connectors */}
                    {connectorEntries.map(([subCat, items]) => (
                      <div key={subCat}>
                        {items
                          .filter((item: any) => item.name.toLowerCase().includes(search.toLowerCase()))
                          .map((item: any) => (
                            <TreeTitle
                              key={item.id}
                              node={{ ...item, type: 'data', category: 'cat-connectors', subCategory: subCat, icon: item.icon ?? 'Database' }}
                            />
                          ))
                        }
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="node-group node-group--first">
                  <div className="antd-tree-wrapper">

                    {NODE_PALETTE_SECTIONS.map(renderPaletteSection)}

                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
