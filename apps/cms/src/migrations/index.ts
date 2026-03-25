import * as migration_migrateToRichText from './migrateToRichText';

export const migrations = [
  {
    up: migration_migrateToRichText.up,
    down: migration_migrateToRichText.down,
    name: 'migrateToRichText'
  },
];
