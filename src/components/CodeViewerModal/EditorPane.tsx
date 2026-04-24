/**
 * EditorPane — Read-only Monaco editor pane.
 *
 * Enforces strict read-only via both `readOnly` and `domReadOnly`.
 * Uses Monaco URI models so file switching is instant (no remount/flicker).
 * Language is auto-detected from the file name.
 * Supports focus tracking via `isFocused` + `onPaneFocus`.
 */

import { useRef, useEffect } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type * as MonacoType from "monaco-editor";
import { getLanguageFromFileName } from "@/utils/file.utils";

interface EditorPaneProps {
  /** File name used for language detection and model URI */
  fileName: string;
  /** File content string */
  content: string;
  /** Monaco theme string */
  theme: "vs-dark" | "light";
  /** Optional pill label shown in corner (for split view) */
  label?: "LEFT" | "RIGHT";
  /** Whether this pane is the currently focused editor group */
  isFocused?: boolean;
  /** Called when user clicks inside this pane — sets it as the focused group */
  onPaneFocus?: () => void;
}

/** Monaco editor options — strictly read-only, no contextmenu edits */
const EDITOR_OPTIONS: MonacoType.editor.IStandaloneEditorConstructionOptions = {
  readOnly: true,
  domReadOnly: true,
  readOnlyMessage: { value: "Read-only — code viewer" },
  minimap: { enabled: false },
  fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
  fontLigatures: true,
  fontSize: 13,
  lineHeight: 20,
  scrollBeyondLastLine: false,
  wordWrap: "on",
  padding: { top: 10, bottom: 10 },
  automaticLayout: true,
  renderLineHighlight: "line",
  contextmenu: false,
  folding: true,
  bracketPairColorization: { enabled: true },
  smoothScrolling: true,
  cursorBlinking: "solid",
  renderWhitespace: "none",
  guides: { indentation: true },
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  scrollbar: {
    verticalScrollbarSize: 6,
    horizontalScrollbarSize: 6,
    useShadows: false,
  },
};

export default function EditorPane({
  fileName,
  content,
  theme,
  label,
  isFocused,
  onPaneFocus,
}: EditorPaneProps) {
  const editorRef = useRef<MonacoType.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof MonacoType | null>(null);

  /** Switch model when the active file changes — avoids re-mounting the editor */
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const uri = monaco.Uri.parse(`inmemory://cv/${fileName}`);
    let model = monaco.editor.getModel(uri);

    if (!model) {
      model = monaco.editor.createModel(
        content,
        getLanguageFromFileName(fileName),
        uri
      );
    } else {
      if (model.getValue() !== content) {
        model.setValue(content);
      }
    }

    if (editor.getModel()?.uri.toString() !== uri.toString()) {
      editor.setModel(model);
    }
  }, [fileName, content]);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    const uri = monaco.Uri.parse(`inmemory://cv/${fileName}`);
    let model = monaco.editor.getModel(uri);

    if (!model) {
      model = monaco.editor.createModel(
        content,
        getLanguageFromFileName(fileName),
        uri
      );
    }

    editor.setModel(model);
  };

  const language = getLanguageFromFileName(fileName);

  return (
    <div
      className={[
        "cv-editor-pane",
        isFocused ? "cv-editor-pane--focused" : "",
      ].join(" ").trim()}
      onClick={onPaneFocus}
    >
      {label && (
        <span
          className={[
            "cv-editor-pane__label",
            `cv-editor-pane__label--${label.toLowerCase()}`,
            isFocused ? "cv-editor-pane__label--active" : "",
          ].join(" ").trim()}
        >
          {label}
        </span>
      )}
      <Editor
        height="100%"
        language={language}
        theme={theme}
        onMount={handleMount}
        options={EDITOR_OPTIONS}
        loading={
          <div className="cv-editor-pane__loading">
            <span className="cv-editor-pane__loading-dot" />
            <span className="cv-editor-pane__loading-dot" />
            <span className="cv-editor-pane__loading-dot" />
          </div>
        }
      />
    </div>
  );
}
