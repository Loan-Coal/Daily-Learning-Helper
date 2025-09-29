#!/usr/bin/env node

/**
 * Database Migration Script for MCP Server Integration
 * This script resets the database and applies the new schema with MCP support
 */

const { spawn } = require('child_process');
const path = require('path');

async function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')} in ${cwd}`);
    
    const process = spawn(command, args, { 
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
}

async function main() {
  try {
    console.log('🚀 Starting MCP Server Database Migration...\n');

    const serverDir = path.join(__dirname, '../server');
    
    console.log('📦 Installing MCP server dependencies...');
    await runCommand('npm', ['install'], path.join(__dirname, '../mcp-server'));
    
    console.log('\n🗄️  Resetting database with new schema...');
    await runCommand('npx', ['prisma', 'db', 'push', '--force-reset'], serverDir);
    
    console.log('\n⚡ Generating Prisma client...');
    await runCommand('npx', ['prisma', 'generate'], serverDir);
    
    console.log('\n🔧 Installing server dependencies...');
    await runCommand('npm', ['install'], serverDir);
    
    console.log('\n🎯 Installing client dependencies...');
    await runCommand('npm', ['install'], path.join(__dirname, '../client'));
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Add your Mixtral API key to mcp-server/.env');
    console.log('2. Add your HuggingFace API key to mcp-server/.env');
    console.log('3. Run: npm run dev (in both server and mcp-server directories)');
    console.log('4. Upload some PDFs to test the new system');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}