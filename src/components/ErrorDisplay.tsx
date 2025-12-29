/**
 * ErrorDisplay Component - Displays error stacks
 */

import { useState } from 'react';

export interface ErrorDisplayProps {
  title: string;
  errorStack: string;
}

function ErrorDisplay({ title, errorStack }: ErrorDisplayProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (): Promise<void> => {
    const fullText = `=== ${title} ===\n${errorStack}`;
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '6px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          backgroundColor: '#fee2e2',
          borderBottom: '1px solid #fecaca',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>!</span>
          <span style={{ fontWeight: 600, color: '#dc2626' }}>{title}</span>
        </div>
        <button
          onClick={() => void handleCopy()}
          style={{
            padding: '4px 12px',
            fontSize: '12px',
            backgroundColor: copied ? '#dcfce7' : '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer',
            color: copied ? '#16a34a' : '#374151',
            transition: 'all 0.15s',
          }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Error Stack */}
      <div
        style={{
          padding: '16px',
          maxHeight: '300px',
          overflow: 'auto',
        }}
      >
        <pre
          style={{
            margin: 0,
            fontSize: '12px',
            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
            color: '#991b1b',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {errorStack}
        </pre>
      </div>
    </div>
  );
}

export default ErrorDisplay;
