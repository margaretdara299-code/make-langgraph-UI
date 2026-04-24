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
  /** Ordered list of open tabs for the left/main pane */
  leftTabs: string[];
  /** Currently active file in the main/left pane */
  leftActiveFile: string;
  /** Ordered list of open tabs for the right/split pane */
  rightTabs: string[];
  /** Currently active file in the right split pane */
  rightActiveFile: string | null;
  /** Whether split view is active */
  isSplitView: boolean;
  /** Currently focused pane */
  focusedPane: "left" | "right";
  /** Click a tab in the left pane to make it active */
  onLeftTabClick: (name: string) => void;
  /** Close (×) a tab in the left pane */
  onLeftTabClose: (name: string) => void;
  /** Click a tab in the right pane to make it active */
  onRightTabClick: (name: string) => void;
  /** Close (×) a tab in the right pane */
  onRightTabClose: (name: string) => void;
}

/** Renders a single horizontal tab strip */
function TabStrip({
  tabs,
  activeTab,
  onTabClick,
  onTabClose,
  stripId,
  isFocused,
}: {
  tabs: string[];
  activeTab: string;
  onTabClick: (name: string) => void;
  onTabClose?: (name: string) => void;
  stripId: string;
  isFocused: boolean;
}) {
  return (
    <div className={`cv-tabs__strip${isFocused ? " cv-tabs__strip--focused" : ""}`} role="tablist" id={stripId}>
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
  leftTabs,
  leftActiveFile,
  rightTabs,
  rightActiveFile,
  isSplitView,
  focusedPane,
  onLeftTabClick,
  onLeftTabClose,
  onRightTabClick,
  onRightTabClose,
}: EditorTabsProps) {

  return (
    <div className={`cv-tabs${isSplitView ? " cv-tabs--split" : ""}`}>
      {/* Primary (left / single) tab strip */}
      <div className="cv-tabs__pane">
        <TabStrip
          tabs={leftTabs}
          activeTab={leftActiveFile}
          onTabClick={onLeftTabClick}
          onTabClose={onLeftTabClose}
          stripId="cv-tabs-primary"
          isFocused={focusedPane === "left" || !isSplitView}
        />
      </div>

      {/* Split (right) tab strip — only visible in split mode */}
      {isSplitView && (
        <>
          <div className="cv-tabs__split-divider" aria-hidden="true" />
          <div className="cv-tabs__pane">
            <TabStrip
              tabs={rightTabs}
              activeTab={rightActiveFile ?? ""}
              onTabClick={onRightTabClick}
              onTabClose={onRightTabClose}
              stripId="cv-tabs-split"
              isFocused={focusedPane === "right"}
            />
          </div>
        </>
      )}
    </div>
  );
}
