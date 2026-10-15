#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import Updater from '../src/Updater.js';
import plugins from '../src/plugins.js';
import config from '../src/config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const packageJson = JSON.parse(
  readFileSync(resolve(__dirname, '..', 'package.json'), 'utf-8')
);
const { version, description } = packageJson;

const program = new Command();

/**
 * @description Print the results of an Updater run
 * @param {Array<Object>} rows - Report rows from Updater.run
 * @param {Object} opts - Command options
 * @param {Boolean} opts.json - Print raw JSON instead of a table
 */
function printReport(rows, opts={}){
  if ( rows.some(r => r.status === 'error') ) process.exitCode = 1;

  if ( opts.json ) {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }

  console.table(rows.map(r => ({
    plugin: r.name,
    bucket: r.bucketVersion || '-',
    upstream: r.upstreamVersion || '-',
    status: r.status
  })));

  const changed = rows.filter(r => r.newFile);
  if ( changed.length ) {
    console.log(`\n${opts.upload ? 'Uploaded' : 'New versions'} - Dockerfile ARG values:`);
    for ( const r of changed ) {
      console.log(`  ${r.label}: ${r.newFile}${r.status === 'error' ? '  (FAILED)' : ''}`);
      if ( r.infoUrl ) console.log(`    ${r.infoUrl}`);
    }
  }

  const errors = rows.filter(r => r.error);
  if ( !changed.length && !errors.length ) {
    console.log('\nAll plugins are up to date.');
  }
  if ( errors.length ) {
    console.log('\nErrors:');
    for ( const r of errors ) console.log(`  ${r.name}: ${r.error}`);
  }
}

program
  .name('wp-plugins')
  .description(description)
  .version(version);

program
  .command('list')
  .description('List managed plugins')
  .action(() => {
    console.table(plugins.map(p => ({
      name: p.name,
      source: p.source,
      bucketPath: `${config.bucket.name}/${config.bucket.prefix}/${p.bucketDir}/${p.filePrefix}-<version>.zip`
    })));
  });

program
  .command('check')
  .description('Compare plugin versions in the bucket against upstream. Read-only.')
  .argument('[plugins...]', 'Plugin names to check. Defaults to all.')
  .option('--json', 'Print report as JSON')
  .action(async (names, options) => {
    const rows = await new Updater({ plugins: names }).run();
    printReport(rows, options);
  });

program
  .command('update')
  .description('Download new plugin versions and upload them to the bucket. Existing files are never overwritten.')
  .argument('[plugins...]', 'Plugin names to update. Defaults to all.')
  .option('--json', 'Print report as JSON')
  .action(async (names, options) => {
    const rows = await new Updater({ plugins: names, upload: true }).run();
    printReport(rows, { ...options, upload: true });
  });

program.parseAsync();
