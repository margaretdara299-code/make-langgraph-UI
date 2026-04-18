/**
 * EditorTabs — VS Code-style tab strip above the editor area.
 *
 * - Displays open tabs with file icon + name + close (×) button.
 * - Active tab has a bottom accent border.
 * - Tabs overflow horizontally (scrollable).
 * - Right split pane tabs have the same per-tab × button — clicking any
 *   closes the entire split pane (collapsing it back to single view).
 */

import { CloseOutlined } from "@ant-design/icons";
import { getFilePresentation } from "@/utils/file.utils";

interface EditorTabsProps {
  /** Ordered list of open tabs */
  openTabs: string[];
  /** Currently active file in the main/left pane */
  activeFile: string;
  /** Currently active file in the right split pane */
  splitFile: string | null;
  /** Whether split view is active */
  isSplitView: boolean;
  /** Click a tab to make it active */
  onTabClick: (name: string) => void;
  /** Close (×) a tab — removes it from left pane's open tab list */
  onTabClose: (name: string) => void;
  /** Click a tab in the right split strip to change the split file */
  onSplitTabClick: (name: string) => void;
  /** Close the entire right split pane (called when any right-tab × is clicked) */
  onSplitClose: () => void;
  /** All files map (for split tab strip population) */
  files: Record<string, string>;
}

/** Renders a single horizontal tab strip */
function TabStrip({
  tabs,
  activeTab,
  onTabClick,
  onTabClose,
  stripId,
}: {
  tabs: string[];
  activeTab: string;
  onTabClick: (name: string) => void;
  onTabClose?: (name: string) => void;
  stripId: string;
}) {
  return (
    <div className="cv-tabs__strip" role="tablist" id={stripId}>
      {tabs.map((name) => {
        const { icon, colorClass } = getFilePresentation(name);
        const isActive = activeTab === name;

        return (
          <button
            key={name}
            role="tab"
            aria-selected={isActive}
            className={`cv-tabs__tab${isActive ? " cv-tabs__tab--active" : ""}`}
            onClick={() => onTabClick(name)}
            title={name}
          >
            {/* File type icon */}
            <span
              className={`cv-tabs__tab-icon code-viewer-modal__tree-file-icon ${colorClass}`}
              aria-hidden="true"
            >
              {icon}
            </span>

            {/* File name */}
            <span className="cv-tabs__tab-name">{name}</span>

            {/* Close button — shown on hover or when active */}
            {onTabClose && (
              <span
                className="cv-tabs__tab-close"
                role="button"
                aria-label={`Close ${name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(name);
                }}
              >
                <CloseOutlined />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function EditorTabs({
  openTabs,
  activeFile,
  splitFile,
  isSplitView,
  onTabClick,
  onTabClose,
  onSplitTabClick,
  onSplitClose,
  files,
}: EditorTabsProps) {
  const splitTabs = Object.keys(files);

  return (
    <div className={`cv-tabs${isSplitView ? " cv-tabs--split" : ""}`}>
      {/* Primary (left / single) tab strip */}
      <div className="cv-tabs__pane">
        <TabStrip
          tabs={openTabs}
          activeTab={activeFile}
          onTabClick={onTabClick}
          onTabClose={onTabClose}
          stripId="cv-tabs-primary"
        />
      </div>

      {/* Split (right) tab strip — only visible in split mode */}
      {isSplitView && (
        <>
          <div className="cv-tabs__split-divider" aria-hidden="true" />
          <div className="cv-tabs__pane">
            {/*
              Right-side tabs get the same × button as left tabs.
              Clicking × on any right tab collapses the split pane entirely.
            */}
            <TabStrip
              tabs={splitTabs}
              activeTab={splitFile ?? ""}
              onTabClick={onSplitTabClick}
              onTabClose={() => onSplitClose()}
              stripId="cv-tabs-split"
            />
          </div>
        </>
      )}
    </div>
  );
}
