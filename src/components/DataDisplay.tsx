/**
 * DataDisplay Component - Generic data renderer based on grid config
 */

import { getByPath } from '../lib/pathAccess';
import GridTable from './GridTable';
import GridCard from './GridCard';
import type { DataDisplayProps, DataRow, TotalsRecord, TableGridConfig, CardGridConfig } from '../types';

function DataDisplay({ gridConfig, apiData }: DataDisplayProps): JSX.Element {
  const apiDataRecord = apiData as unknown as Record<string, unknown>;
  const data = getByPath<DataRow[] | number>(apiDataRecord, gridConfig.data_path);

  switch (gridConfig.display_type) {
    case 'table': {
      const tableConfig = gridConfig as TableGridConfig;
      const totals = tableConfig.totals_path
        ? getByPath<TotalsRecord>(apiDataRecord, tableConfig.totals_path)
        : null;

      return (
        <GridTable
          data={data as DataRow[] | null | undefined}
          columns={tableConfig.columns}
          totals={totals}
          label={tableConfig.label}
        />
      );
    }

    case 'card': {
      const cardConfig = gridConfig as CardGridConfig;
      return (
        <GridCard
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
          Display type &quot;{gridConfig.display_type}&quot; not yet implemented
        </div>
      );

    default:
      return (
        <div style={{ padding: '16px', color: '#dc2626' }}>
          Unknown display type: {(gridConfig as { display_type: string }).display_type}
        </div>
      );
  }
}

export default DataDisplay;
