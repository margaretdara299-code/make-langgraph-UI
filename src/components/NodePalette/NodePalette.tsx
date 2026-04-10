import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronDown, Loader2, Plus, Minus,
  Zap, Database
} from 'lucide-react';
import { useDesignerActions, useDesignerConnectors } from '@/hooks';
import { SearchInput } from '@/components';
import { ICON_MAP, SUB_CAT_COLORS } from './nodePalette.constants';
import StructureSection from './StructureSection';
import './NodePalette.css';


const NodeItem: React.FC<{ node: any }> = ({ node }) => {
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
      <motion.div
        className="node-library-item"
        variants={{
          hidden: { opacity: 0, x: -10 },
          visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.12, ease: 'linear' }
          }
        }}
        whileHover={{ x: 3 }} // Restored as per "same animation" request
      >
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
        <div className="nli-drag-hint">⠿</div>
      </motion.div>
    </div>
  );
};

export default function NodePalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Actions');
  const [expandedSub, setExpandedSub] = useState<Record<string, string | null>>({});

  const { actionsByCategory, isLoading: actionsLoading } = useDesignerActions();
  const { connectorGroups, isLoading: connectorsLoading } = useDesignerConnectors() as any;

  const allNodes = useMemo(() => {
    const nodes: any[] = [];
    Object.entries(actionsByCategory).forEach(([category, list]: [string, any]) => {
      list.forEach((action: any) => {
        nodes.push({ id: action.id, type: 'action', label: action.name, subtitle: action.description, icon: action.icon || 'Zap', category: 'Actions', subCategory: category });
      });
    });
    Object.entries(connectorGroups || {}).forEach(([type, list]: [string, any]) => {
      list.forEach((conn: any) => {
        nodes.push({ id: conn.id, type: 'data', label: conn.name, subtitle: conn.description, icon: conn.icon || 'Database', category: 'Connectors', subCategory: type });
      });
    });
    return nodes;
  }, [actionsByCategory, connectorGroups]);

  const mainCategories = ['Actions', 'Connectors'];
  const filtered = allNodes.filter(n =>
    n.label.toLowerCase().includes(search.toLowerCase()) ||
    n.subCategory.toLowerCase().includes(search.toLowerCase())
  );

  const toggleExpand = (cat: string) => setExpandedCategory(prev => prev === cat ? null : cat);
  const toggleSubExpand = (cat: string, sub: string) => setExpandedSub(prev => ({ ...prev, [cat]: prev[cat] === sub ? null : sub }));

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
            initial={{ x: -28, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -28, opacity: 0 }}
            transition={{ duration: 0.14, ease: 'linear' }}
          >
            <motion.div
              className="sidebar-top"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04, duration: 0.25 }}
            >
              <div className="sidebar-title">Node Library</div>
              <div className="sidebar-search-wrap">
                <SearchInput
                  placeholder="Search nodes..."
                  value={search}
                  onChange={setSearch}
                />
              </div>
            </motion.div>

            <motion.div
              className="sidebar-scroll"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.02 }
                }
              }}
            >
              {(actionsLoading || connectorsLoading) && (
                <div className="sidebar-loading">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Loading library...</span>
                </div>
              )}

              {search ? (
                <motion.div
                  className="node-group"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.025 }
                    }
                  }}
                >
                  <div className="group-label">Search Results ({filtered.length})</div>
                  {filtered.map(n => <NodeItem key={n.id + n.label} node={n} />)}
                  {filtered.length === 0 && <div className="sidebar-empty">No results</div>}
                </motion.div>
              ) : (
                <>
                  <motion.div
                    className="node-group"
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: { opacity: 1, x: 0, transition: { staggerChildren: 0.06, duration: 0.4 } }
                    }}
                  >
                    <button className="group-header main-group-header" onClick={() => toggleExpand('Common')}>
                      <div className="gh-left">
                        {expandedCategory === 'Common' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        <span className="group-label">Common</span>
                      </div>
                    </button>
                    {expandedCategory === 'Common' && (
                      <motion.div
                        className="group-content nested-groups"
                        initial="hidden" animate="visible"
                        variants={{
                          hidden: { opacity: 0, x: -10 },
                          visible: { opacity: 1, x: 0, transition: { duration: 0.12, ease: 'linear', staggerChildren: 0.04 } }
                        }}
                      >
                        <StructureSection search="" />
                      </motion.div>
                    )}
                  </motion.div>

                  {mainCategories.map(cat => {
                    const catItems = allNodes.filter(n => n.category === cat);
                    if (catItems.length === 0) return null;
                    const isExpanded = expandedCategory === cat;
                    const subGroups: Record<string, any[]> = {};
                    catItems.forEach(n => {
                      if (!subGroups[n.subCategory]) subGroups[n.subCategory] = [];
                      subGroups[n.subCategory].push(n);
                    });

                    return (
                      <motion.div
                        key={cat}
                        className="node-group"
                        variants={{
                          hidden: { opacity: 0, x: -10 },
                          visible: { opacity: 1, x: 0, transition: { staggerChildren: 0.06, duration: 0.4 } }
                        }}
                      >
                        <button className="group-header main-group-header" onClick={() => toggleExpand(cat)}>
                          <div className="gh-left">
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            <span className="group-label">{cat}</span>
                          </div>
                          <span className="gh-count">{catItems.length}</span>
                        </button>
                        {isExpanded && (
                          <motion.div
                            className="group-content nested-groups"
                            initial="hidden" animate="visible"
                            variants={{
                              hidden: { opacity: 0, x: -10 },
                              visible: { opacity: 1, x: 0, transition: { duration: 0.12, ease: 'linear', staggerChildren: 0.04 } }
                            }}
                          >
                            {Object.entries(subGroups).map(([subCat, items]) => {
                              const isSubExpanded = expandedSub[cat] === subCat;
                              return (
                                <motion.div
                                  key={subCat}
                                  className="sub-node-group"
                                  variants={{
                                    hidden: { opacity: 0, x: -8 },
                                    visible: { opacity: 1, x: 0, transition: { duration: 0.1, ease: 'linear', staggerChildren: 0.015 } }
                                  }}
                                >
                                  <button className="sub-group-header" onClick={() => toggleSubExpand(cat, subCat)}>
                                    {isSubExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                                    <span className="sub-group-label">{subCat}</span>
                                    <span className="sub-group-line"></span>
                                    <span className="sub-group-mini-count">{items.length}</span>
                                  </button>
                                  <AnimatePresence>
                                    {isSubExpanded && (
                                      <motion.div
                                        className="sub-group-items"
                                        initial="hidden" animate="visible" exit="hidden"
                                        variants={{
                                          hidden: { height: 0, opacity: 0 },
                                          visible: { height: 'auto', opacity: 1, transition: { height: { duration: 0.12, ease: 'linear' }, opacity: { duration: 0.08, ease: 'linear' }, staggerChildren: 0.01 } }
                                        }}
                                      >
                                        {items.map(n => <NodeItem key={n.id + n.label} node={n} />)}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.div>
                              );
                            })}
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </>
              )}
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
