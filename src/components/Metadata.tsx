/**
 * Metadata Component - Shows API response metadata + section-specific metadata
 */

import type { MetadataProps, SectionData } from '../types';

function formatKey(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatMetadataValue(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return value.toLocaleString();
  return String(value);
}

function Metadata({ apiData, currentSection }: MetadataProps): JSX.Element | null {
  if (!apiData) return null;

  const sectionData = apiData.response_data?.[currentSection] as SectionData | undefined;
  const sectionMetadata = sectionData?.metadata;

  const requestInfo: Record<string, string> = {
    'Request ID': apiData.request_id,
    'Duration': apiData.duration_s ? `${apiData.duration_s}s` : '-',
    'Cache Hit': apiData.cache_hit ? 'Yes' : 'No',
    'Error': apiData.error ? 'Yes' : 'No',
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
        Metadata
      </summary>

      <div
        style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          padding: '16px',
          marginTop: '8px',
          display: 'grid',
          gap: '16px',
        }}
      >
        {sectionMetadata && (
          <div>
            <h4
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#6b7280',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              {currentSection} Metadata
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '8px',
              }}
            >
              {Object.entries(sectionMetadata).map(([key, value]) => (
                <div key={key} style={{ fontSize: '12px' }}>
                  <span style={{ color: '#6b7280' }}>{formatKey(key)}: </span>
                  <span style={{ color: '#1f2937' }}>{formatMetadataValue(value)}</span>
                </div>
              ))}
            </div>
            {sectionData?.error_stack && (
              <pre
                style={{
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  padding: '8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  marginTop: '8px',
                  overflow: 'auto',
                }}
              >
                {sectionData.error_stack}
              </pre>
            )}
          </div>
        )}

        <div>
          <h4
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#6b7280',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            Request Info
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '8px',
            }}
          >
            {Object.entries(requestInfo).map(([key, value]) => (
              <div key={key} style={{ fontSize: '12px' }}>
                <span style={{ color: '#6b7280' }}>{key}: </span>
                <span style={{ color: '#1f2937' }}>{value || '-'}</span>
              </div>
            ))}
          </div>
        </div>

        {apiData.curl_command && (
          <div>
            <h4
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#6b7280',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Repro Command
            </h4>
            <pre
              style={{
                backgroundColor: '#1f2937',
                color: '#e5e7eb',
                padding: '12px',
                borderRadius: '4px',
                fontSize: '11px',
                overflow: 'auto',
                margin: 0,
              }}
            >
              {apiData.curl_command}
            </pre>
          </div>
        )}
      </div>
    </details>
  );
}

export default Metadata;
