/**
 * DataDisplay Component - Generic data renderer based on component config
 */

import { getByPath } from '../lib/pathAccess';
import Table from './Table';
import Card from './Card';
import type { DataDisplayProps, DataRow, TotalsRecord, TableConfig, CardConfig } from '../types';

function DataDisplay({ componentConfig, apiData }: DataDisplayProps): JSX.Element {
  const apiDataRecord = apiData as unknown as Record<string, unknown>;
  const data = getByPath<DataRow[] | number>(apiDataRecord, componentConfig.data_path);

  switch (componentConfig.display_type) {
    case 'table': {
      const tableConfig = componentConfig as TableConfig;
      const totals = tableConfig.totals_path
        ? getByPath<TotalsRecord>(apiDataRecord, tableConfig.totals_path)
        : null;

      return (
        <Table
          data={data as DataRow[] | null | undefined}
          columns={tableConfig.columns}
          totals={totals}
          label={tableConfig.label}
          fontSize={tableConfig.font_size}
        />
      );
    }

    case 'card': {
      const cardConfig = componentConfig as CardConfig;
      return (
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
