#!/usr/bin/env node

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { config } from 'dotenv';

// Load environment variables
config();

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the convex import script
const convexImportPath = path.join(__dirname, '../node_modules/.bin/convex');

// Get the deployment URL from environment variables
const deploymentUrl = 'https://doting-coyote-513.convex.cloud';

if (!deploymentUrl) {
  console.error(
    'Error: NEXT_PUBLIC_CONVEX_URL environment variable is not set.',
  );
  console.error(
    'Please set it in your .env file or provide it as an environment variable.',
  );
  process.exit(1);
}

console.log('Starting content migration using Convex...');

try {
  // Run the migration by calling the convex run function
  const result = execSync(
    `"${convexImportPath}" run migrateContentToString:migrateInBatches`,
    { stdio: 'inherit' },
  );

  console.log('Migration completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('Error during migration:', error.message);
  process.exit(1);
}
