#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Checking deployment readiness...\n');

const checks = [
  {
    name: 'Backend package.json exists',
    check: () => fs.existsSync(path.join(__dirname, 'package.json')),
  },
  {
    name: 'Backend .env exists (for local)',
    check: () => fs.existsSync(path.join(__dirname, '.env')),
    warning: 'Create .env for local testing (not needed for deployment)'
  },
  {
    name: 'Server file exists',
    check: () => fs.existsSync(path.join(__dirname, 'src/server.js')),
  },
  {
    name: 'Database setup script exists',
    check: () => fs.existsSync(path.join(__dirname, 'setup-db.js')),
  },
  {
    name: 'Auth tables script exists',
    check: () => fs.existsSync(path.join(__dirname, 'add-auth-tables.js')),
  },
  {
    name: 'Dependencies installed',
    check: () => fs.existsSync(path.join(__dirname, 'node_modules')),
  },
];

let allPassed = true;

checks.forEach(({ name, check, warning }) => {
  const passed = check();
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  
  if (!passed) {
    allPassed = false;
    if (warning) {
      console.log(`   ⚠️  ${warning}`);
    }
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('✅ Backend is ready for deployment!');
  console.log('\n📝 Next steps:');
  console.log('1. Push code to GitHub');
  console.log('2. Create PostgreSQL database on Render');
  console.log('3. Deploy backend on Render');
  console.log('4. Run: npm run setup-db (in Render Shell)');
  console.log('5. Deploy frontend on Vercel/Render');
  console.log('\n📖 Read QUICK-DEPLOY.md for detailed instructions');
} else {
  console.log('❌ Some checks failed. Fix them before deploying.');
}

console.log('='.repeat(50) + '\n');
