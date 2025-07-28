// src/lib/yjs/broadcast-provider.tsx

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import type { HybridDocument, DocumentMetadata, BlockData, YjsProviderProps } from './types';

// Simple broadcast channel provider for tab sync
class BroadcastProvider {
  private doc: Y.Doc;
  private channel: BroadcastChannel;
  private documentId: string;

  constructor(documentId: string, doc: Y.Doc) {
    this.documentId = documentId;
    this.doc = doc;
    this.channel = new BroadcastChannel(`yjs-${documentId}`);

    // Listen for updates from other tabs
    this.channel.addEventListener('message', (event) => {
      if (event.data.type === 'update') {
        Y.applyUpdate(this.doc, new Uint8Array(event.data.update));
      }
    });

    // Broadcast updates to other tabs
    this.doc.on('update', (update: Uint8Array) => {
      this.channel.postMessage({
        type: 'update',
        update: Array.from(update),
      });
    });
  }

  destroy() {
    this.channel.close();
  }
}

interface YjsContextValue {
  doc: Y.Doc | null;
  indexeddbProvider: IndexeddbPersistence | null;
  broadcastProvider: BroadcastProvider | null;
  isLoaded: boolean;
  document: HybridDocument | null;
  createBlock: (type: 'text' | 'code' | 'canvas') => string;
  deleteBlock: (blockId: string) => void;
  getBlock: (blockId: string) => BlockData | null;
}

const YjsContext = createContext<YjsContextValue>({
  doc: null,
  indexeddbProvider: null,
  broadcastProvider: null,
  isLoaded: false,
  document: null,
  createBlock: () => '',
  deleteBlock: () => {},
  getBlock: () => null,
});

export const useYjs = () => {
  const context = useContext(YjsContext);
  if (!context) {
    throw new Error('useYjs must be used within a YjsProvider');
  }
  return context;
};

export const YjsProvider: React.FC<YjsProviderProps> = ({
  children,
  documentId = import.meta.env.VITE_DOC_ID || 'default-doc',
}) => {
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [indexeddbProvider, setIndexeddbProvider] = useState<IndexeddbPersistence | null>(null);
  const [broadcastProvider, setBroadcastProvider] = useState<BroadcastProvider | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [document, setDocument] = useState<HybridDocument | null>(null);

  // Initialize Yjs document and providers
  useEffect(() => {
    performance.mark('yjs-init-start');

    const ydoc = new Y.Doc();

    // IndexedDB for persistence
    const persistence = new IndexeddbPersistence(documentId, ydoc);

    // BroadcastChannel for tab sync
    const broadcast = new BroadcastProvider(documentId, ydoc);

    // Wait for IndexedDB to load
    persistence.on?.('synced', () => {
      performance.mark('yjs-init-end');
      performance.measure('yjs-init', 'yjs-init-start', 'yjs-init-end');

      // Initialize document structure if it doesn't exist
      const metadata = ydoc.getMap('metadata');
      const blocks = ydoc.getArray('blocks');

      if (metadata.size === 0) {
        // New document - initialize with default metadata
        metadata.set('title', 'Untitled Document');
        metadata.set('created', Date.now());
        metadata.set('modified', Date.now());
        metadata.set('version', '1.0.0');

        // Create first text block if no blocks exist
        if (blocks.length === 0) {
          const firstBlock = new Y.Map();
          const blockId = crypto.randomUUID();
          firstBlock.set('id', blockId);
          firstBlock.set('type', 'text');
          firstBlock.set('content', ydoc.getText(`block-${blockId}`));

          const blockMetadata = new Y.Map();
          blockMetadata.set('order', 0);
          blockMetadata.set('created', Date.now());
          blockMetadata.set('modified', Date.now());
          firstBlock.set('metadata', blockMetadata);

          blocks.push([firstBlock]);
        }
      }

      setDocument({
        id: documentId,
        metadata: metadata as Y.Map<DocumentMetadata>,
        blocks: blocks as Y.Array<BlockData>,
      });

      setIsLoaded(true);

      console.log('Yjs document loaded with BroadcastChannel sync');
    });

    setDoc(ydoc);
    setIndexeddbProvider(persistence);
    setBroadcastProvider(broadcast);

    return () => {
      broadcast.destroy();
      persistence.destroy();
      ydoc.destroy();
    };
  }, [documentId]);

  const createBlock = useCallback(
    (type: 'text' | 'code' | 'canvas'): string => {
      if (!doc || !document) return '';

      const blockId = crypto.randomUUID();
      const newBlock = new Y.Map();

      newBlock.set('id', blockId);
      newBlock.set('type', type);

      // Create appropriate content based on type
      if (type === 'text') {
        newBlock.set('content', doc.getText(`block-${blockId}`));
      } else {
        newBlock.set('content', new Y.Map());
      }

      const blockMetadata = new Y.Map();
      blockMetadata.set('order', document.blocks.length);
      blockMetadata.set('created', Date.now());
      blockMetadata.set('modified', Date.now());
      newBlock.set('metadata', blockMetadata);

      document.blocks.push([newBlock as BlockData]);

      // Update document modified time
      document.metadata.set('modified', Date.now());

      return blockId;
    },
    [doc, document],
  );

  const deleteBlock = useCallback(
    (blockId: string) => {
      if (!document) return;

      const blockIndex = document.blocks
        .toArray()
        .findIndex((block) => block.get('id') === blockId);

      if (blockIndex >= 0) {
        document.blocks.delete(blockIndex, 1);
        document.metadata.set('modified', Date.now());
      }
    },
    [document],
  );

  const getBlock = useCallback(
    (blockId: string): BlockData | null => {
      if (!document) return null;

      return document.blocks.toArray().find((block) => block.get('id') === blockId) || null;
    },
    [document],
  );

  const contextValue: YjsContextValue = {
    doc,
    indexeddbProvider,
    broadcastProvider,
    isLoaded,
    document,
    createBlock,
    deleteBlock,
    getBlock,
  };

  return <YjsContext.Provider value={contextValue}>{children}</YjsContext.Provider>;
};
