/**
 * Example/Demo page for GeneratedCodeViewer component
 * This demonstrates how to use the VS Code-style file explorer popup
 */

import { useState } from "react";
import { Button, Space } from "antd";
import { CodeOutlined, FolderOutlined } from "@ant-design/icons";
import { GeneratedCodeViewer } from "@/components";

export default function GeneratedCodeViewerDemo() {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  return (
    <div style={{ padding: "40px", minHeight: "100vh", background: "#f5f5f5" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h1>Generated Code Viewer — VS Code Style</h1>
        <p>
          View auto-generated project files from the Tensaw Skill Studio in a VS
          Code-like interface with file explorer on the left and code viewer on
          the right.
        </p>

        {/* Demo Buttons */}
        <Space
          direction="vertical"
          style={{ width: "100%", marginTop: "30px" }}
        >
          <div>
            <h3>Demo: View Skill #18 Generated Code</h3>
            <Button
              type="primary"
              size="large"
              icon={<CodeOutlined />}
              onClick={() => setIsViewerOpen(true)}
            >
              Open Code Viewer
            </Button>
          </div>

          <div
            style={{
              marginTop: "40px",
              padding: "20px",
              background: "white",
              borderRadius: "8px",
            }}
          >
            <h3>Features:</h3>
            <ul>
              <li>✅ File explorer panel on the left (like VS Code)</li>
              <li>✅ Code viewer with syntax highlighting on the right</li>
              <li>✅ Click files to view their content</li>
              <li>✅ Copy code to clipboard</li>
              <li>✅ Download individual files</li>
              <li>✅ Download all files at once</li>
              <li>✅ Automatic language detection based on file extension</li>
              <li>✅ VS Code dark theme styling</li>
              <li>✅ Responsive design (mobile-friendly)</li>
            </ul>
          </div>

          <div
            style={{
              marginTop: "20px",
              padding: "20px",
              background: "#f9f9f9",
              borderRadius: "8px",
            }}
          >
            <h3>Usage Example:</h3>
            <pre
              style={{
                overflow: "auto",
                background: "#1e1e1e",
                color: "#d4d4d4",
                padding: "16px",
              }}
            >
              {`import { GeneratedCodeViewer } from '@/components';
import { useState } from 'react';

export default function MyComponent() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button onClick={() => setIsOpen(true)}>
                View Generated Code
            </button>
            
            <GeneratedCodeViewer
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                skillId="18"
                apiBaseUrl="http://localhost:8000"
            />
        </>
    );
}`}
            </pre>
          </div>

          <div
            style={{
              marginTop: "20px",
              padding: "20px",
              background: "#f9f9f9",
              borderRadius: "8px",
            }}
          >
            <h3>Component Props:</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #ccc" }}>
                  <th style={{ textAlign: "left", padding: "8px" }}>Prop</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Type</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Default</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "8px" }}>isOpen</td>
                  <td style={{ padding: "8px" }}>boolean</td>
                  <td style={{ padding: "8px" }}>—</td>
                  <td style={{ padding: "8px" }}>Controls modal visibility</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "8px" }}>onClose</td>
                  <td style={{ padding: "8px" }}>() =&gt; void</td>
                  <td style={{ padding: "8px" }}>—</td>
                  <td style={{ padding: "8px" }}>
                    Callback when closing modal
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "8px" }}>skillId</td>
                  <td style={{ padding: "8px" }}>string | number</td>
                  <td style={{ padding: "8px" }}>"18"</td>
                  <td style={{ padding: "8px" }}>Skill ID to fetch code for</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "8px" }}>apiBaseUrl</td>
                  <td style={{ padding: "8px" }}>string</td>
                  <td style={{ padding: "8px" }}>"http://localhost:8000"</td>
                  <td style={{ padding: "8px" }}>API base URL</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Space>
      </div>

      {/* The actual component */}
      <GeneratedCodeViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        skillId="18"
        apiBaseUrl="http://localhost:8000"
      />
    </div>
  );
}
