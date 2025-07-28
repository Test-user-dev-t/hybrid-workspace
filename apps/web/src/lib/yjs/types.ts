// src/lib/yjs/types.ts

import * as Y from 'yjs';

// Module declarations for better TypeScript support
declare module 'y-indexeddb' {
  export class IndexeddbPersistence {
    // Add underscores to parameters to mark them as intentionally unused for declarations
    constructor(_name: string, _doc: Y.Doc);
    destroy(): Promise<void>;
  }
}

declare module 'y-prosemirror' {
  import { Plugin } from 'prosemirror-state';
  import { Node } from 'prosemirror-model';

  // Add underscores to parameters to mark them as intentionally unused for declarations
  export function ySyncPlugin(_fragment: Y.XmlFragment): Plugin;
  export function yUndoPlugin(): Plugin;
  export function yCollab(_fragment: Y.XmlFragment): Plugin;
  export function prosemirrorToYXml(_node: Node, _fragment: Y.XmlFragment): void;
}

// Core document structure
export interface HybridDocument {
  id: string;
  metadata: Y.Map<DocumentMetadata>;
  blocks: Y.Array<BlockData>;
}

export interface DocumentMetadata {
  title: string;
  created: number;
  modified: number;
  version: string;
}

export interface BlockData {
  id: string;
  type: BlockType;
  // Corrected: 'text' blocks use Y.XmlFragment as per YjsProvider.
  // Changed Y.Map<any> to Y.Map<unknown> to be more type-safe than 'any'.
  content: Y.XmlFragment | Y.Map<unknown>;
  metadata: Y.Map<BlockMetadata>;
}

export type BlockType = 'text' | 'code' | 'canvas';

export interface BlockMetadata {
  order: number;
  created: number;
  modified: number;
  // Changed 'any' to 'unknown' for block-specific metadata to improve type safety.
  [key: string]: unknown;
}

// Utility types
export interface YjsProviderProps {
  children: React.ReactNode;
  documentId?: string;
}

export interface TextBlockProps {
  block: BlockData;
  onUpdate?: (blockId: string) => void;
  onDelete?: (blockId: string) => void;
}
