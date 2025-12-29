/**
 * DataDisplay Component - Generic data renderer based on component config
 */

import { getByPath } from '../lib/pathAccess';
import Table from './Table';
import Card from './Card';
import ErrorDisplay from './ErrorDisplay';
import type { DataDisplayProps, DataRow, TotalsRecord, TableConfig, CardConfig, SectionData, SectionMetadata } from '../types';

function formatMetadataValue(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return value.toLocaleString();
  return String(value);
}

function SectionMetadataDisplay({ metadata, errorStack }: { metadata: SectionMetadata | undefined; errorStack: string | undefined }): JSX.Element | null {
  if (!metadata) return null;

  return (
    <details style={{ marginTop: '16px' }}>
      <summary
        style={{
          cursor: 'pointer',
          color: '#6b7280',
          fontSize: '12px',
          fontWeight: 500,
          padding: '4px 0',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span style={{ fontSize: '10px' }}>▶</span>
        Section Metadata
      </summary>

      <div
        style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          padding: '12px',
          marginTop: '8px',
          display: 'grid',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '8px',
          }}
        >
          <div style={{ fontSize: '12px' }}>
            <span style={{ color: '#6b7280' }}>Last Updated: </span>
            <span style={{ color: '#1f2937' }}>{formatMetadataValue(metadata.last_updated)}</span>
          </div>
          <div style={{ fontSize: '12px' }}>
            <span style={{ color: '#6b7280' }}>Status: </span>
            <span style={{ color: '#1f2937' }}>{formatMetadataValue(metadata.status)}</span>
          </div>
          <div style={{ fontSize: '12px' }}>
            <span style={{ color: '#6b7280' }}>Refresh Duration: </span>
            <span style={{ color: '#1f2937' }}>
              {metadata.refresh_duration_ms ? `${metadata.refresh_duration_ms}ms` : '-'}
            </span>
          </div>
        </div>

        {metadata.repro && (
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
            {metadata.repro}
          </pre>
        )}

        {errorStack && (
          <pre
            style={{
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              padding: '8px',
              borderRadius: '4px',
              fontSize: '11px',
              overflow: 'auto',
              margin: 0,
            }}
          >
            {errorStack}
          </pre>
        )}
      </div>
    </details>
  );
}

function DataDisplay({ componentConfig, apiData }: DataDisplayProps): JSX.Element {
  const apiDataRecord = apiData as unknown as Record<string, unknown>;

  // Extract section key from data_path (e.g., "response_data.futures.data.x" → "futures")
  const pathParts = componentConfig.data_path.split('.');
  const sectionKey = pathParts[1]; // [response_data, futures, data, ...]
  const sectionData = getByPath<SectionData>(apiDataRecord, `response_data.${sectionKey}`);

  // Check for section-level errors
  if (sectionData?.metadata?.status === 'error' && sectionData?.error_stack) {
    return (
      <ErrorDisplay
        title={`Server Error: ${sectionKey}`}
        errorStack={sectionData.error_stack}
      />
    );
  }

  const data = getByPath<DataRow[] | number>(apiDataRecord, componentConfig.data_path);

  const renderWithMetadata = (content: JSX.Element): JSX.Element => (
    <>
      {content}
      <SectionMetadataDisplay metadata={sectionData?.metadata} errorStack={sectionData?.error_stack} />
    </>
  );

  switch (componentConfig.display_type) {
    case 'table': {
      const tableConfig = componentConfig as TableConfig;
      const totals = tableConfig.totals_path
        ? getByPath<TotalsRecord>(apiDataRecord, tableConfig.totals_path)
        : null;

      return renderWithMetadata(
        <Table
          data={data as DataRow[] | null | undefined}
          columns={tableConfig.columns}
          totals={totals}
          label={tableConfig.label}
        />
      );
    }

    case 'card': {
      const cardConfig = componentConfig as CardConfig;
      return renderWithMetadata(
        <Card
          value={data as number | null | undefined}
          label={cardConfig.label}
          format={cardConfig.format}
          background={cardConfig.background}
          textColor={cardConfig.text_color}
          textColorValue={cardConfig.text_color_value}
        />
      );
    }

    case 'row':
    case 'kv':
      return (
        <div style={{ padding: '16px', color: '#9ca3af' }}>
          Display type &quot;{componentConfig.display_type}&quot; not yet implemented
        </div>
      );

    default:
      return (
        <div style={{ padding: '16px', color: '#dc2626' }}>
          Unknown display type: {(componentConfig as { display_type: string }).display_type}
        </div>
      );
  }
}

export default DataDisplay;
