#!/usr/bin/env node

const { program } = require('commander');
const packageJson = require('../package.json');

program
  .version(packageJson.version)
  .description(packageJson.description);

program
  .command('build')
  .description('Compile the static site from templates and JSON data with 100% SEO & Performance optimizations')
  .action(() => {
    require('../src/commands/build.js')();
  });

program
  .command('r2-convert')
  .description('Optimize and convert assets for R2 CDN')
  .action(() => {
    require('../src/commands/r2-convert.js')();
  });

program
  .command('init')
  .description('Scaffold a new znc-ssg project structure in the current directory')
  .action(() => {
    require('../src/commands/init.js')();
  });

program.parse(process.argv);
