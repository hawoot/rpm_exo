/**
 * Config Registry - Single source of truth for all config imports
 *
 * All config imports under src/ must go through this registry.
 * Only this file is allowed to import directly from config/.
 */

import type {
  SectionConfig,
  ComponentConfig,
  NavbarConfig,
  FormatsConfig,
  ThemeConfig,
  ApiConfig,
} from '../types';

// Global
import formats from '../../config/global/formats.json';
import theme from '../../config/global/theme.json';
import api from '../../config/api.json';

// Navbar (contains all groups and sections)
import navbar from '../../config/sections/navbar.json';

// Components - Cards
import futuresPnl from '../../config/components/cards/futures-pnl.json';
import futuresDv01 from '../../config/components/cards/futures-dv01.json';

// Components - Tables
import futuresPosition from '../../config/components/tables/futures-position.json';
import bondsPosition from '../../config/components/tables/bonds-position.json';
import futuresError from '../../config/components/tables/futures-error.json';

// --- Exports ---

// Global configs
export const formatsConfig = formats as FormatsConfig;
export const themeConfig = theme as ThemeConfig;
export const apiConfig = api as ApiConfig;

// Navbar config (groups with nested sections)
export const navbarConfig = navbar as NavbarConfig;

// Helper: get section by id
export function getSection(id: string): SectionConfig | undefined {
  for (const group of navbarConfig.groups) {
    const section = group.sections.find((s: SectionConfig) => s.id === id);
    if (section) return section;
  }
  return undefined;
}

// Helper: get first section id (default)
export function getDefaultSectionId(): string {
  return navbarConfig.groups[0]?.sections[0]?.id ?? '';
}

export const componentConfigs: Record<string, ComponentConfig> = {
  'cards/futures-pnl': futuresPnl as ComponentConfig,
  'cards/futures-dv01': futuresDv01 as ComponentConfig,
  'tables/futures-position': futuresPosition as ComponentConfig,
  'tables/bonds-position': bondsPosition as ComponentConfig,
  'tables/futures-error': futuresError as ComponentConfig,
};
