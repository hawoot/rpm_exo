/**
 * Config Registry - Single source of truth for all config imports
 *
 * All config imports under src/ must go through this registry.
 * Only this file is allowed to import directly from config/.
 */

import type {
  SectionConfig,
  GridConfig,
  SectionsIndex,
  FormatsConfig,
  ThemeConfig,
  ApiConfig,
} from '../types';

// Global
import formats from '../../config/global/formats.json';
import theme from '../../config/global/theme.json';
import api from '../../config/api.json';

// Navbar
import navbar from '../../config/sections/_navbar.json';

// Sections
import summary from '../../config/sections/summary.json';
import futures from '../../config/sections/futures.json';
import bonds from '../../config/sections/bonds.json';

// Components - Cards
import futuresPnl from '../../config/components/cards/futures-pnl.json';
import futuresDv01 from '../../config/components/cards/futures-dv01.json';

// Components - Tables
import futuresPosition from '../../config/components/tables/futures-position.json';
import bondsPosition from '../../config/components/tables/bonds-position.json';

// --- Exports ---

// Global configs
export const formatsConfig = formats as FormatsConfig;
export const themeConfig = theme as ThemeConfig;
export const apiConfig = api as ApiConfig;

export const navbarConfig = navbar as SectionsIndex;

export const sectionConfigs: Record<string, SectionConfig> = {
  summary: summary as SectionConfig,
  futures: futures as SectionConfig,
  bonds: bonds as SectionConfig,
};

export const componentConfigs: Record<string, GridConfig> = {
  'cards/futures-pnl': futuresPnl as GridConfig,
  'cards/futures-dv01': futuresDv01 as GridConfig,
  'tables/futures-position': futuresPosition as GridConfig,
  'tables/bonds-position': bondsPosition as GridConfig,
};
