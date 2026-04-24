import React from 'react';

/** Payload attached to a drag event when a node is dragged from the library */
export interface DragNodePayload {
  type:        string;
  label:       string;
  subtitle?:   string;
  icon:        string;
  actionId:    string;
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
  id:    string;
  name:  string;
  icon?: string;
}
