// src/components/TextBlock.tsx

import React, { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import type { TextBlockProps, BlockMetadata } from '@/lib/yjs/types';

const TextBlock: React.FC<TextBlockProps> = ({ block, onUpdate, onDelete }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState('');

  // Get the Y.Text content for this block
  const yText = block.get('content') as Y.Text;

  useEffect(() => {
    if (!yText) return;

    // Initialize content from Y.Text
    setContent(yText.toString());

    // Listen for remote changes
    const observer = () => {
      const newContent = yText.toString();
      setContent(newContent);

      // Update cursor position if needed - only if not actively focused
      if (textareaRef.current && document.activeElement !== textareaRef.current) {
        const cursorPos = textareaRef.current.selectionStart || 0;
        textareaRef.current.value = newContent;
        textareaRef.current.setSelectionRange(cursorPos, cursorPos);
      }
    };

    yText.observe(observer);

    return () => {
      yText.unobserve(observer);
    };
  }, [yText]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const oldValue = yText.toString();

    if (newValue !== oldValue) {
      try {
        // Calculate diff and apply to Y.Text
        let i = 0;
        while (i < Math.min(oldValue.length, newValue.length) && oldValue[i] === newValue[i]) {
          i++;
        }

        let j = oldValue.length;
        let k = newValue.length;
        while (j > i && k > i && oldValue[j - 1] === newValue[k - 1]) {
          j--;
          k--;
        }

        // Apply changes to Y.Text with error handling
        if (j > i) {
          yText.delete(i, j - i);
        }
        if (k > i) {
          yText.insert(i, newValue.slice(i, k));
        }

        // Update block metadata with proper typing
        const metadata = block.get('metadata') as Y.Map<BlockMetadata>;
        metadata.set('modified', Date.now());
        onUpdate?.(block.get('id') as string);
      } catch (error) {
        console.error('Error updating Y.Text:', error);
        // Fallback: replace entire content if diff fails
        yText.delete(0, yText.length);
        yText.insert(0, newValue);
      }
    }
  };

  const handleDelete = () => {
    const blockId = block.get('id') as string;
    onDelete?.(blockId);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  return (
    <div className="group relative border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      {/* Block toolbar */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1">
          <button
            onClick={handleDelete}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Delete block"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Text editor */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        className="w-full min-h-[100px] resize-none border-none outline-none bg-transparent text-gray-900 placeholder-gray-400"
        placeholder="Start typing..."
        style={{
          fontFamily: 'inherit',
          fontSize: '16px',
          lineHeight: '1.5',
        }}
      />

      {/* Block metadata (dev info) */}
      {import.meta.env.DEV && (
        <div className="mt-2 text-xs text-gray-400 font-mono">
          Block ID: {block.get('id')} | Type: {block.get('type')} | Modified:{' '}
          {new Date(block.get('metadata')?.get('modified') || 0).toLocaleTimeString()} | Y.Text
          Length: {yText?.length || 0}
        </div>
      )}
    </div>
  );
};

export default TextBlock;
