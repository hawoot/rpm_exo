/**
 * RequestInfo Component - Shows request-level API response info
 */

import type { RequestInfoProps } from '../types';

function RequestInfo({ apiData }: RequestInfoProps): JSX.Element | null {
  if (!apiData) return null;

  const requestInfo: Record<string, string> = {
    'Lag': `${apiData.lag_s}s`,
    'Duration': `${apiData.duration_s}s`,
    'Cache Hit': apiData.cache_hit ? 'Yes' : 'No',
    'Error': apiData.error ? 'Yes' : 'No',
    'Error Stack': apiData.error_stack || '-',
    'Repro': apiData.curl_command || '-',
  };

  return (
    <details style={{ marginTop: '24px' }}>
      <summary
        style={{
          cursor: 'pointer',
          color: '#6b7280',
          fontSize: '13px',
          fontWeight: 500,
          padding: '8px 0',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span style={{ fontSize: '10px' }}>▶</span>
        Request Info
      </summary>

      <div
        style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          padding: '16px',
          marginTop: '8px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '8px',
          }}
        >
          {Object.entries(requestInfo).map(([key, value]) => (
            <div key={key} style={{ fontSize: '12px' }}>
              <span style={{ color: '#6b7280' }}>{key}: </span>
              <span style={{ color: '#1f2937', wordBreak: 'break-all' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}

export default RequestInfo;
