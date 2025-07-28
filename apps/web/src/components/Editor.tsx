// src/components/Editor.tsx

import React, { useState, useEffect } from 'react';
import { useYjs } from '@/lib/yjs/provider';
import TextBlock from './TextBlock';
import type { BlockData } from '@/lib/yjs/types';

const Editor: React.FC = () => {
  const { document, isLoaded, createBlock, deleteBlock } = useYjs();
  const [blocks, setBlocks] = useState<BlockData[]>([]);

  // Subscribe to block changes
  useEffect(() => {
    if (!document || !isLoaded) return;

    const updateBlocks = () => {
      setBlocks(document.blocks.toArray());
    };

    // Initial load
    updateBlocks();

    // Listen for changes
    document.blocks.observe(updateBlocks);

    return () => {
      document.blocks.unobserve(updateBlocks);
    };
  }, [document, isLoaded]);

  const handleAddBlock = () => {
    createBlock('text');
  };

  const handleBlockUpdate = (blockId: string) => {
    // Block updated - metadata is already handled in TextBlock
    console.log(`Block ${blockId} updated`);
  };

  const handleBlockDelete = (blockId: string) => {
    deleteBlock(blockId);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading document...</span>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Failed to load document</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Document header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {document.metadata.get('title') || 'Untitled Document'}
        </h1>
        <div className="text-sm text-gray-500">
          Created: {new Date(document.metadata.get('created') || 0).toLocaleDateString()} |
          Modified: {new Date(document.metadata.get('modified') || 0).toLocaleString()}
        </div>
      </div>

      {/* Blocks */}
      <div className="space-y-4">
        {blocks.map((block) => {
          const blockType = block.get('type') as string;
          const blockId = block.get('id') as string;

          if (blockType === 'text') {
            return (
              <TextBlock
                key={blockId}
                block={block}
                onUpdate={handleBlockUpdate}
                onDelete={handleBlockDelete}
              />
            );
          }

          // Placeholder for other block types
          return (
            <div key={blockId} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="text-gray-600">
                {blockType.charAt(0).toUpperCase() + blockType.slice(1)} block (not implemented yet)
              </div>
            </div>
          );
        })}
      </div>

      {/* Add block button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleAddBlock}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Text Block
        </button>
      </div>

      {/* Debug info in development */}
      {import.meta.env.DEV && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Debug Info</h3>
          <div className="text-sm text-gray-600 font-mono">
            <div>Document ID: {document.id}</div>
            <div>Total Blocks: {blocks.length}</div>
            <div>Yjs Doc Size: {document.blocks.length} blocks</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
