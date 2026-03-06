#!/usr/bin/env node

/**
 * Admin User Setup Script
 * 
 * Creates and auto-confirms an admin user in Supabase.
 * Requires the service_role key (found in Supabase Dashboard > Settings > API).
 * 
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=your-key node tools/setup-admin.js
 * 
 * Or add SUPABASE_SERVICE_ROLE_KEY to your .env file and run:
 *   node tools/setup-admin.js
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually (no dotenv dependency needed)
function loadEnv() {
  try {
    const envPath = resolve(__dirname, '..', '.env');
    const content = readFileSync(envPath, 'utf-8');
    const vars = {};
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.substring(0, eqIdx).trim();
      const val = trimmed.substring(eqIdx + 1).trim();
      vars[key] = val;
    }
    return vars;
  } catch {
    return {};
  }
}

const envVars = loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || envVars.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || envVars.SUPABASE_SERVICE_ROLE_KEY;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@smarketer.ge';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'SmarketerAdmin2026!';

if (!SUPABASE_URL) {
  console.error('❌ VITE_SUPABASE_URL not found in .env');
  process.exit(1);
}

if (!SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found.');
  console.error('');
  console.error('To get it:');
  console.error('  1. Go to: https://supabase.com/dashboard/project/lekwouwaajnnjhoomyrc/settings/api');
  console.error('  2. Copy the "service_role" key (NOT the anon key)');
  console.error('  3. Run: SUPABASE_SERVICE_ROLE_KEY=your-key node tools/setup-admin.js');
  console.error('');
  console.error('  Or add to .env: SUPABASE_SERVICE_ROLE_KEY=your-key');
  process.exit(1);
}

function supabaseAdminRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SUPABASE_URL);
    const data = body ? JSON.stringify(body) : null;
    
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      }
    };
    
    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }
    
    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: responseBody });
        }
      });
    });
    
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log('🔧 Smarketer Admin Setup');
  console.log('========================');
  console.log(`📧 Email: ${ADMIN_EMAIL}`);
  console.log(`🔗 Supabase: ${SUPABASE_URL}`);
  console.log('');

  // Step 1: Try to list existing users to find our admin
  console.log('1️⃣  Checking for existing user...');
  const listResult = await supabaseAdminRequest('GET', `/auth/v1/admin/users?page=1&per_page=50`);
  
  if (listResult.status === 401 || listResult.status === 403) {
    console.error('❌ Invalid service_role key. Please check the key and try again.');
    process.exit(1);
  }

  const users = listResult.data?.users || [];
  const existingUser = users.find(u => u.email === ADMIN_EMAIL);

  if (existingUser) {
    console.log(`   ✅ User found: ${existingUser.id}`);
    console.log(`   📧 Confirmed: ${existingUser.email_confirmed_at ? 'Yes' : 'No'}`);
    
    // Step 2: Update user to confirm email and set role
    if (!existingUser.email_confirmed_at) {
      console.log('');
      console.log('2️⃣  Confirming email...');
      const updateResult = await supabaseAdminRequest('PUT', `/auth/v1/admin/users/${existingUser.id}`, {
        email_confirm: true,
        user_metadata: { role: 'admin' },
        app_metadata: { role: 'admin' }
      });
      
      if (updateResult.status === 200) {
        console.log('   ✅ Email confirmed and admin role set!');
      } else {
        console.error('   ❌ Failed to update user:', updateResult.data);
        process.exit(1);
      }
    } else {
      // Just ensure admin role is set
      console.log('');
      console.log('2️⃣  Setting admin role...');
      const updateResult = await supabaseAdminRequest('PUT', `/auth/v1/admin/users/${existingUser.id}`, {
        user_metadata: { ...existingUser.user_metadata, role: 'admin' },
        app_metadata: { ...existingUser.app_metadata, role: 'admin' }
      });
      
      if (updateResult.status === 200) {
        console.log('   ✅ Admin role confirmed!');
      } else {
        console.error('   ❌ Failed to set role:', updateResult.data);
      }
    }

    // Update password to the expected one
    console.log('');
    console.log('3️⃣  Setting password...');
    const pwResult = await supabaseAdminRequest('PUT', `/auth/v1/admin/users/${existingUser.id}`, {
      password: ADMIN_PASSWORD
    });
    
    if (pwResult.status === 200) {
      console.log('   ✅ Password updated!');
    } else {
      console.log('   ⚠️  Password update skipped (may already be set)');
    }

  } else {
    // Create new admin user
    console.log('   ℹ️  User not found. Creating new admin...');
    console.log('');
    console.log('2️⃣  Creating admin user...');
    
    const createResult = await supabaseAdminRequest('POST', '/auth/v1/admin/users', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { role: 'admin' },
      app_metadata: { role: 'admin' }
    });
    
    if (createResult.status === 200 || createResult.status === 201) {
      console.log(`   ✅ Admin user created: ${createResult.data.id}`);
    } else {
      console.error('   ❌ Failed to create user:', createResult.data);
      process.exit(1);
    }
  }

  // Step 4: Verify login works
  console.log('');
  console.log('4️⃣  Verifying login...');
  
  const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || envVars.VITE_SUPABASE_ANON_KEY;
  
  const loginResult = await supabaseAdminRequest('POST', '/auth/v1/token?grant_type=password', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  });
  
  if (loginResult.status === 200 && loginResult.data?.access_token) {
    console.log('   ✅ Login verified successfully!');
  } else {
    console.log('   ⚠️  Login test result:', loginResult.data?.msg || loginResult.data?.error_description || 'Unknown');
  }

  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('🎉 Setup complete!');
  console.log('');
  console.log('Login credentials:');
  console.log(`   📧 Email:    ${ADMIN_EMAIL}`);
  console.log(`   🔑 Password: ${ADMIN_PASSWORD}`);
  console.log(`   🔗 URL:      http://localhost:3000/paneli`);
  console.log('═══════════════════════════════════════════');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
