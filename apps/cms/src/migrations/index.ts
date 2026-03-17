import * as migration_20260314_172047_add_default_settings from './20260314_172047_add_default_settings';
import * as migration_migrateToRichText from './migrateToRichText';

export const migrations = [
  {
    up: migration_20260314_172047_add_default_settings.up,
    down: migration_20260314_172047_add_default_settings.down,
    name: '20260314_172047_add_default_settings',
  },
  {
    up: migration_migrateToRichText.up,
    down: migration_migrateToRichText.down,
    name: 'migrateToRichText'
  },
];
