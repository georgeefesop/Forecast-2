#!/usr/bin/env node

/**
 * Setup script to create .env.local with required environment variables
 * Run: node scripts/setup-env.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envLocalPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.example');

// Generate a random secret
function generateSecret() {
  return crypto.randomBytes(32).toString('hex');
}

// Check if .env.local already exists
if (fs.existsSync(envLocalPath)) {
  console.log('⚠️  .env.local already exists. Skipping creation.');
  console.log('   If you want to regenerate, delete .env.local first.');
  process.exit(0);
}

// Read .env.example if it exists
let envContent = '';
if (fs.existsSync(envExamplePath)) {
  envContent = fs.readFileSync(envExamplePath, 'utf-8');
} else {
  // Create basic template
  envContent = `# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Vercel Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_token_here

# NextAuth
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASSWORD=your_password
EMAIL_FROM=noreply@forecast.app

# Cron Secret
CRON_SECRET=your_cron_secret_here
`;
}

// Replace placeholder secrets with generated ones
const nextAuthSecret = generateSecret();
const cronSecret = generateSecret();

envContent = envContent.replace(
  /NEXTAUTH_SECRET=.*/,
  `NEXTAUTH_SECRET=${nextAuthSecret}`
);

envContent = envContent.replace(
  /CRON_SECRET=.*/,
  `CRON_SECRET=${cronSecret}`
);

// Ensure NEXTAUTH_URL is set for local development
if (!envContent.includes('NEXTAUTH_URL=') || envContent.includes('NEXTAUTH_URL=your_')) {
  envContent = envContent.replace(
    /NEXTAUTH_URL=.*/,
    'NEXTAUTH_URL=http://localhost:3000'
  );
}

// Write .env.local
fs.writeFileSync(envLocalPath, envContent);

console.log('✅ Created .env.local with generated secrets');
console.log('');
console.log('📝 Next steps:');
console.log('   1. Update DATABASE_URL when you have a database');
console.log('   2. Update SMTP_* variables if you want email auth');
console.log('   3. Update BLOB_READ_WRITE_TOKEN when using Vercel Blob');
console.log('');
console.log('⚠️  Note: .env.local is in .gitignore and should not be committed.');
