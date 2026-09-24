#!/usr/bin/env node
const { program } = require('commander');
const buildCommand = require('../src/commands/build');
const r2ConvertCommand = require('../src/commands/r2-convert');

program
  .name('znc-ssg')
  .description('Zedecks Node Core Static Site Generator - High-performance static site builder.')
  .version('1.0.0-alpha.1');

program
  .command('build')
  .description('Compiles the static site based on znc.config.js and workspace contents.')
  .action(async () => {
    try {
      await buildCommand();
    } catch (err) {
      console.error("Build Failed:", err);
      process.exit(1);
    }
  });

program
  .command('r2-convert')
  .description('Optimizes images and videos for Cloudflare R2 / CDN distribution.')
  .action(async () => {
    try {
      await r2ConvertCommand();
    } catch (err) {
      console.error("R2 Convert Failed:", err);
      process.exit(1);
    }
  });

program.parse();
