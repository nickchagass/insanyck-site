#!/usr/bin/env node

/**
 * INSANYCK DEPLOY PIPELINE — Database Migration with Retry Logic
 *
 * Problem: Neon Serverless Postgres enters "Idle Mode" after inactivity.
 * When Vercel build tries to connect, Neon needs 2-5s to "wake up" (cold start).
 * Prisma's default timeout (5s) is too short, causing P1002 errors.
 *
 * Solution: Retry logic with exponential backoff + connection timeout increase.
 *
 * Usage:
 *   node scripts/deploy-with-retry.js
 *
 * Exit codes:
 *   0 - Success
 *   1 - All retries failed
 */

const { execSync } = require('child_process');

// ===== CONFIGURATION =====

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000; // 3 seconds between retries
const TIMEOUT_MS = 60000; // 60 seconds max for each command

// ===== LOGGING =====

function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '✓',
    warn: '⚠',
    error: '✗',
    progress: '▶'
  }[level] || '•';

  console.log(`[${timestamp}] ${prefix} ${message}`);
}

// ===== RETRY LOGIC =====

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function executeWithRetry(command, description, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      log(`${description} (attempt ${attempt}/${retries})`, 'progress');

      execSync(command, {
        stdio: 'inherit',
        timeout: TIMEOUT_MS,
        env: {
          ...process.env,
          // Force Prisma to use longer timeout
          DATABASE_URL: addTimeoutToConnectionString(process.env.DATABASE_URL),
        }
      });

      log(`${description} — SUCCESS`, 'info');
      return true;

    } catch (error) {
      const isP1002 = error.message && error.message.includes('P1002');
      const isConnectionError = error.message && (
        error.message.includes('connection') ||
        error.message.includes('timeout') ||
        error.message.includes('ECONNREFUSED')
      );

      if (attempt < retries && (isP1002 || isConnectionError)) {
        log(`${description} failed (connection issue). Retrying in ${RETRY_DELAY_MS / 1000}s...`, 'warn');
        await sleep(RETRY_DELAY_MS);
      } else if (attempt >= retries) {
        log(`${description} failed after ${retries} attempts.`, 'error');
        throw error;
      } else {
        // Non-connection error, don't retry
        log(`${description} failed with non-retryable error.`, 'error');
        throw error;
      }
    }
  }
}

// ===== CONNECTION STRING HELPER =====

/**
 * Add timeout parameters to DATABASE_URL if not present
 * This helps Neon serverless "wake up" properly
 */
function addTimeoutToConnectionString(url) {
  if (!url) return url;

  try {
    const parsed = new URL(url);

    // Add connection timeout if not present
    if (!parsed.searchParams.has('connect_timeout')) {
      parsed.searchParams.set('connect_timeout', '30');
    }

    // Add pool timeout if not present
    if (!parsed.searchParams.has('pool_timeout')) {
      parsed.searchParams.set('pool_timeout', '30');
    }

    // Add statement timeout if not present
    if (!parsed.searchParams.has('statement_timeout')) {
      parsed.searchParams.set('statement_timeout', '60000');
    }

    return parsed.toString();
  } catch (e) {
    // If URL parsing fails, return original
    return url;
  }
}

// ===== MAIN PIPELINE =====

async function main() {
  log('INSANYCK Deploy Pipeline — Starting...', 'info');
  log(`Environment: ${process.env.NODE_ENV || 'unknown'}`, 'info');
  log(`Vercel: ${process.env.VERCEL ? 'YES' : 'NO'}`, 'info');

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    log('DATABASE_URL not set. Skipping database operations.', 'warn');
    log('This is OK for static builds or preview deploys without DB.', 'info');
    return;
  }

  try {
    // Step 1: Prisma Generate (usually doesn't need retry, but include for consistency)
    log('--- STEP 1: Prisma Generate ---', 'info');
    await executeWithRetry(
      'npx prisma generate',
      'Generating Prisma Client',
      1 // No retry needed for generate
    );

    // Step 2: Database Ping (wake up Neon)
    log('--- STEP 2: Database Wake-Up Ping ---', 'info');
    await executeWithRetry(
      'node -e "const { PrismaClient } = require(\'@prisma/client\'); const prisma = new PrismaClient(); prisma.$connect().then(() => { console.log(\'DB awake\'); prisma.$disconnect(); }).catch(e => { console.error(e); process.exit(1); });"',
      'Waking up serverless database',
      MAX_RETRIES
    );

    // Step 3: Migrate Deploy (with retry)
    log('--- STEP 3: Prisma Migrate Deploy ---', 'info');
    await executeWithRetry(
      'npx prisma migrate deploy',
      'Applying database migrations',
      MAX_RETRIES
    );

    log('--- DEPLOY PIPELINE COMPLETE ---', 'info');

  } catch (error) {
    log('Deploy pipeline failed. See error above.', 'error');
    log('If this is a Neon timeout, check:');
    log('  1. DATABASE_URL has connect_timeout=30 param');
    log('  2. Neon instance is not paused');
    log('  3. Firewall allows Vercel IPs');
    process.exit(1);
  }
}

// ===== EXECUTION =====

main().catch(error => {
  console.error('Unhandled error in deploy pipeline:', error);
  process.exit(1);
});
