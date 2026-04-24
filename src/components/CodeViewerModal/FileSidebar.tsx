/**
 * FileSidebar — VS Code-style left file explorer panel.
 *
 * Lists all files as a flat list (no folder nesting).
 * Clicking a file opens it in the main pane.
 * Hovering shows a split-open icon button for multi-pane support.
 */

import { SplitCellsOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import { getFilePresentation } from "@/utils/file.utils";

interface FileSidebarProps {
  /** All files available in the viewer */
  files: Record<string, string>;
  /** Currently active file in the left/main pane */
  activeFile: string;
  /** Currently active file in the right split pane */
  splitFile: string | null;
  /** Whether split view is enabled */
  isSplitView: boolean;
  /** Open a file in the main/left pane */
  onFileClick: (name: string) => void;
  /** Open a file in the right split pane */
  onFileSplitClick: (name: string) => void;
}

export default function FileSidebar({
  files,
  activeFile,
  splitFile,
  isSplitView,
  onFileClick,
  onFileSplitClick,
}: FileSidebarProps) {
  const fileNames = Object.keys(files);

  return (
    <aside className="cv-sidebar" aria-label="File explorer">
      {/* Explorer heading */}
      <div className="cv-sidebar__header">
        <span className="cv-sidebar__title">EXPLORER</span>
        <span className="cv-sidebar__count">{fileNames.length}</span>
      </div>

      {/* File list */}
      <ul className="cv-sidebar__list" role="listbox" aria-label="Files">
        {fileNames.map((name) => {
          const { icon, colorClass } = getFilePresentation(name);
          const isActive = activeFile === name;
          const isSplitActive = isSplitView && splitFile === name;

          return (
            <li
              key={name}
              role="option"
              aria-selected={isActive}
              className={[
                "cv-sidebar__item",
                isActive ? "cv-sidebar__item--active" : "",
                isSplitActive ? "cv-sidebar__item--split-active" : "",
              ]
                .join(" ")
                .trim()}
              onClick={() => onFileClick(name)}
              title={name}
            >
              {/* Active indicator bar */}
              <span className="cv-sidebar__active-bar" aria-hidden="true" />

              {/* File icon */}
              <span
                className={`cv-sidebar__file-icon code-viewer-modal__tree-file-icon ${colorClass}`}
                aria-hidden="true"
              >
                {icon}
              </span>

              {/* File name */}
              <span className="cv-sidebar__file-name">{name}</span>

              {/* Split-open button — shown on hover via CSS */}
              <Tooltip title="Open in split" placement="right">
                <button
                  className="cv-sidebar__split-btn"
                  aria-label={`Open ${name} in split view`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileSplitClick(name);
                  }}
                >
                  <SplitCellsOutlined />
                </button>
              </Tooltip>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
