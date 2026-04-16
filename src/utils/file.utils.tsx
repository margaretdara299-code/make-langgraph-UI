import type { ReactNode } from "react";
import {
  CodeOutlined,
  FileImageOutlined,
  FileMarkdownOutlined,
  FileOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { ZIP_STORE_METHOD, ZIP_UTF8_FLAG, ZIP_VERSION } from "@/constants/file.constants";

const textEncoder = new TextEncoder();
const crcTable = new Uint32Array(256).map((_, index) => {
  let value = index;
  for (let i = 0; i < 8; i += 1) {
    value = (value & 1) === 1 ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
  }
  return value >>> 0;
});

function computeCrc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function getZipTimestamp(date = new Date()) {
  const year = Math.max(date.getFullYear(), 1980);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = Math.floor(date.getSeconds() / 2);

  return {
    dosDate: ((year - 1980) << 9) | (month << 5) | day,
    dosTime: (hours << 11) | (minutes << 5) | seconds,
  };
}

function writeUint16(view: DataView, offset: number, value: number) {
  view.setUint16(offset, value, true);
}

function writeUint32(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value >>> 0, true);
}

/**
 * Creates a ZIP blob from a map of filenames to content strings.
 */
export function createZipBlob(fileMap: Record<string, string>): Blob {
  const localParts: BlobPart[] = [];
  const centralParts: Uint8Array[] = [];
  const { dosDate, dosTime } = getZipTimestamp();
  let offset = 0;

  for (const [name, content] of Object.entries(fileMap)) {
    const nameBytes = textEncoder.encode(name);
    const contentBytes = textEncoder.encode(content);
    const crc = computeCrc32(contentBytes);

    const localHeader = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(localHeader.buffer);
    writeUint32(localView, 0, 0x04034b50);
    writeUint16(localView, 4, ZIP_VERSION);
    writeUint16(localView, 6, ZIP_UTF8_FLAG);
    writeUint16(localView, 8, ZIP_STORE_METHOD);
    writeUint16(localView, 10, dosTime);
    writeUint16(localView, 12, dosDate);
    writeUint32(localView, 14, crc);
    writeUint32(localView, 18, contentBytes.length);
    writeUint32(localView, 22, contentBytes.length);
    writeUint16(localView, 26, nameBytes.length);
    writeUint16(localView, 28, 0);
    localHeader.set(nameBytes, 30);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);
    writeUint32(centralView, 0, 0x02014b50);
    writeUint16(centralView, 4, ZIP_VERSION);
    writeUint16(centralView, 6, ZIP_VERSION);
    writeUint16(centralView, 8, ZIP_UTF8_FLAG);
    writeUint16(centralView, 10, ZIP_STORE_METHOD);
    writeUint16(centralView, 12, dosTime);
    writeUint16(centralView, 14, dosDate);
    writeUint32(centralView, 16, crc);
    writeUint32(centralView, 20, contentBytes.length);
    writeUint32(centralView, 24, contentBytes.length);
    writeUint16(centralView, 28, nameBytes.length);
    writeUint16(centralView, 30, 0);
    writeUint16(centralView, 32, 0);
    writeUint16(centralView, 34, 0);
    writeUint16(centralView, 36, 0);
    writeUint32(centralView, 38, 0);
    writeUint32(centralView, 42, offset);
    centralHeader.set(nameBytes, 46);

    localParts.push(localHeader, contentBytes);
    centralParts.push(centralHeader);
    offset += localHeader.length + contentBytes.length;
  }

  const centralDirectorySize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const endRecord = new Uint8Array(22);
  const endView = new DataView(endRecord.buffer);
  writeUint32(endView, 0, 0x06054b50);
  writeUint16(endView, 4, 0);
  writeUint16(endView, 6, 0);
  writeUint16(endView, 8, centralParts.length);
  writeUint16(endView, 10, centralParts.length);
  writeUint32(endView, 12, centralDirectorySize);
  writeUint32(endView, 16, offset);
  writeUint16(endView, 20, 0);

  return new Blob([...localParts, ...centralParts, endRecord] as BlobPart[], {
    type: "application/zip",
  });
}

/**
 * Downloads a blob as a file.
 */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Gets file extension from filename.
 */
export function getFileExtension(fileName: string) {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot >= 0 ? fileName.slice(lastDot) : "";
}

/**
 * Maps extension to Monaco language indicator.
 */
export function getLanguageFromFileName(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".py")) return "python";
  if (lower.endsWith(".js") || lower.endsWith(".jsx")) return "javascript";
  if (lower.endsWith(".ts") || lower.endsWith(".tsx")) return "typescript";
  if (lower.endsWith(".json")) return "json";
  if (lower.endsWith(".md")) return "markdown";
  if (lower.endsWith(".html")) return "html";
  if (lower.endsWith(".css")) return "css";
  if (lower.endsWith(".yml") || lower.endsWith(".yaml")) return "yaml";
  if (lower.endsWith(".xml")) return "xml";
  return "plaintext";
}

/**
 * Maps extension to Mime type.
 */
export function getMimeTypeFromFileName(fileName: string) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".py")) return "text/x-python";
  if (lower.endsWith(".js")) return "text/javascript";
  if (lower.endsWith(".ts")) return "text/typescript";
  if (lower.endsWith(".json")) return "application/json";
  if (lower.endsWith(".md")) return "text/markdown";
  if (lower.endsWith(".html")) return "text/html";
  if (lower.endsWith(".css")) return "text/css";
  if (lower.endsWith(".yml") || lower.endsWith(".yaml")) return "text/yaml";
  return "text/plain";
}

/**
 * Maps extension to visual icon and color class.
 */
export function getFilePresentation(fileName: string): { icon: ReactNode; colorClass: string } {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".py")) return { icon: <CodeOutlined />, colorClass: "is-python" };
  if (lower.endsWith(".js") || lower.endsWith(".jsx")) return { icon: <CodeOutlined />, colorClass: "is-javascript" };
  if (lower.endsWith(".ts") || lower.endsWith(".tsx")) return { icon: <CodeOutlined />, colorClass: "is-typescript" };
  if (lower.endsWith(".json")) return { icon: <FileTextOutlined />, colorClass: "is-json" };
  if (lower.endsWith(".md")) return { icon: <FileMarkdownOutlined />, colorClass: "is-markdown" };
  if (lower.endsWith(".html") || lower.endsWith(".css")) return { icon: <CodeOutlined />, colorClass: "is-web" };
  if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".gif") || lower.endsWith(".svg")) {
    return { icon: <FileImageOutlined />, colorClass: "is-asset" };
  }
  return { icon: <FileOutlined />, colorClass: "is-default" };
}
