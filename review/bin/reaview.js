#!/usr/bin/env node
import { createServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import fs from 'fs';
import chalk from 'chalk';

// Dynamic import helper to handle source vs dist contexts
const loadPlugin = async () => {
  try {
    // Production: Import from dist using URL to ensure correct relative path resolution
    const pluginUrl = new URL('../dist/node/plugin.js', import.meta.url);
    const mod = await import(pluginUrl);
    return mod.xrayPlugin;
  } catch (e) {
    console.error(chalk.red('❌ Could not load Reaview plugin.'));
    console.error(chalk.yellow('If you are running from source, please run "npm run build" first.'));
    // Helpful debugging if path fails
    console.error(chalk.dim(`Error details: ${e}`)); 
    process.exit(1);
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = process.cwd();

console.log(chalk.cyan('⚛️  Starting Reaview...'));

async function start() {
  const xrayPlugin = await loadPlugin();

  try {
    const server = await createServer({
      root: PROJECT_ROOT,
      configFile: false, 
      server: {
        port: 7777,
        host: true,
      },
      plugins: [
        xrayPlugin(PROJECT_ROOT, __dirname),
      ],
      // We rely on the user's root vite config for aliases/transforms
    });

    await server.listen();

    const info = server.config.server;
    const url = `http://localhost:${info.port}/__xray/`;
    
    console.log(chalk.green(`\n🚀 Reaview Active at:`), chalk.underline.cyan(url));
    console.log(chalk.dim(`   Scanning: ${PROJECT_ROOT}`));
    console.log(chalk.dim(`   Hit Ctrl+C to stop`));
    
  } catch (e) {
    console.error(chalk.red('Failed to start Reaview:'), e);
  }
}

start();
