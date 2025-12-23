/**
 * Metadata Component - Shows API response metadata + section-specific metadata
 *
 * Displays:
 * - Data source info
 * - Request/response timing
 * - Section-specific metadata (e.g., futures.metadata)
 */

function Metadata({ apiData, dataSource, currentSection }) {
  if (!apiData) return null

  // Get section-specific metadata
  const sectionData = apiData.response_data?.[currentSection]
  const sectionMetadata = sectionData?.metadata

  // Top-level request metadata
  const requestInfo = {
    'Request ID': apiData.request_id,
    'Duration': apiData.duration_s ? `${apiData.duration_s}s` : '-',
    'Cache Hit': apiData.cache_hit ? 'Yes' : 'No',
    'Error': apiData.error ? 'Yes' : 'No',
  }

  // Data source info
  const sourceInfo = {
    'Source': dataSource.type === 'mock' ? 'Mock Data' : 'Live API',
    'Location': dataSource.type === 'mock' ? dataSource.file : dataSource.url,
  }

  return (
    <details style={{ marginTop: '24px' }}>
      <summary style={{
        cursor: 'pointer',
        color: '#6b7280',
        fontSize: '13px',
        fontWeight: 500,
        padding: '8px 0',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <span style={{ fontSize: '10px' }}>▶</span>
        Metadata
        {sectionMetadata?.status && (
          <span style={{
            fontSize: '11px',
            padding: '2px 6px',
            backgroundColor: sectionMetadata.status === 'ok' ? '#dcfce7' : '#fef2f2',
            color: sectionMetadata.status === 'ok' ? '#166534' : '#dc2626',
            borderRadius: '4px',
            marginLeft: '8px',
          }}>
            {sectionMetadata.status}
          </span>
        )}
      </summary>

      <div style={{
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        padding: '16px',
        marginTop: '8px',
        display: 'grid',
        gap: '16px',
      }}>
        {/* Section Metadata (most relevant) */}
        {sectionMetadata && (
          <div>
            <h4 style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#6b7280',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}>
              {currentSection} Metadata
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '8px',
            }}>
              {Object.entries(sectionMetadata).map(([key, value]) => (
                <div key={key} style={{ fontSize: '12px' }}>
                  <span style={{ color: '#6b7280' }}>{formatKey(key)}: </span>
                  <span style={{ color: '#1f2937' }}>{formatValue(value)}</span>
                </div>
              ))}
            </div>
            {sectionData?.error_stack && (
              <pre style={{
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                padding: '8px',
                borderRadius: '4px',
                fontSize: '11px',
                marginTop: '8px',
                overflow: 'auto',
              }}>
                {sectionData.error_stack}
              </pre>
            )}
          </div>
        )}

        {/* Request Info */}
        <div>
          <h4 style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#6b7280',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}>
            Request Info
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '8px',
          }}>
            {Object.entries(requestInfo).map(([key, value]) => (
              <div key={key} style={{ fontSize: '12px' }}>
                <span style={{ color: '#6b7280' }}>{key}: </span>
                <span style={{ color: '#1f2937' }}>{value || '-'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Data Source */}
        <div>
          <h4 style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#6b7280',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}>
            Data Source
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '8px',
          }}>
            {Object.entries(sourceInfo).map(([key, value]) => (
              <div key={key} style={{ fontSize: '12px' }}>
                <span style={{ color: '#6b7280' }}>{key}: </span>
                <span style={{
                  color: '#1f2937',
                  fontFamily: key === 'Location' ? 'monospace' : 'inherit',
                  fontSize: key === 'Location' ? '11px' : '12px',
                }}>
                  {value || '-'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CURL command */}
        {apiData.curl_command && (
          <div>
            <h4 style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#6b7280',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}>
              Reproducible Command
            </h4>
            <pre style={{
              backgroundColor: '#1f2937',
              color: '#e5e7eb',
              padding: '12px',
              borderRadius: '4px',
              fontSize: '11px',
              overflow: 'auto',
              margin: 0,
            }}>
              {apiData.curl_command}
            </pre>
          </div>
        )}
      </div>
    </details>
  )
}

// Format snake_case keys to Title Case
function formatKey(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// Format values for display
function formatValue(value) {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return value.toLocaleString()
  return String(value)
}

export default Metadata
