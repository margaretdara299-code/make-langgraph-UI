import React from 'react';

/** Payload attached to a drag event when a node is dragged from the library */
export interface DragNodePayload {
  type:        string;
  nodeType?:   string;
  label:       string;
  subtitle?:   string;
  icon:        string;
  actionId:    string;
  description?: string;
  connector_id?: number | string;
  connector_type?: string;
  config_json?: Record<string, any>;
  category:    string;
  capability?: string;
}

/** Props for the top-level and sub-level category header row */
export interface CatHeaderProps {
  catKey:   string;
  icon:     React.ReactNode;
  label:    string;
  openCat:  string | null;
  onToggle: (k: string) => void;
}

/** Generic leaf node shape coming from useDesignerActions / useDesignerConnectors */
export interface PaletteLeafNode {
  id:          string;
  actionId?:   string;
  name:        string;
  icon?:       string;
  description?: string;
  connector_id?: number | string;
  connector_type?: string;
  config_json?: Record<string, any>;
}
