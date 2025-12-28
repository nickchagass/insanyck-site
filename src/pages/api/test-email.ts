// src/pages/api/test-email.ts
// INSANYCK DIAGNOSTIC — Email System Test Endpoint
// ⚠️ DELETE THIS FILE AFTER DEBUGGING!

import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

interface DiagnosticResponse {
  timestamp: string;
  environment: {
    nodeEnv: string;
    vercelEnv: string;
    hasResendKey: boolean;
    resendKeyPrefix: string;
    resendKeyLength: number;
    resendKeyFormat: string;
    emailFrom: string;
    nextAuthUrl: string;
  };
  test: {
    status: 'pending' | 'success' | 'error' | 'exception' | 'skipped';
    result: any;
    error: any;
  };
  instructions?: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DiagnosticResponse>
) {
  // Security: Only allow in development or with secret
  const isAuthorized =
    process.env.NODE_ENV === 'development' ||
    req.headers['x-debug-secret'] === process.env.DEBUG_SECRET;

  if (!isAuthorized) {
    return res.status(403).json({
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV || 'unknown',
        vercelEnv: process.env.VERCEL_ENV || 'not-vercel',
        hasResendKey: false,
        resendKeyPrefix: 'UNAUTHORIZED',
        resendKeyLength: 0,
        resendKeyFormat: 'N/A',
        emailFrom: 'UNAUTHORIZED',
        nextAuthUrl: 'UNAUTHORIZED',
      },
      test: {
        status: 'skipped',
        result: null,
        error: 'Not authorized. Use x-debug-secret header or run in development.',
      },
    } as DiagnosticResponse);
  }

  // Collect diagnostic info
  const apiKey = process.env.RESEND_API_KEY;
  const diagnostic: DiagnosticResponse = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV || 'unknown',
      vercelEnv: process.env.VERCEL_ENV || 'not-vercel',
      hasResendKey: !!apiKey,
      resendKeyPrefix: apiKey?.substring(0, 8) || 'MISSING',
      resendKeyLength: apiKey?.length || 0,
      resendKeyFormat: apiKey?.startsWith('re_') ? 'VALID' : 'INVALID',
      emailFrom: process.env.EMAIL_FROM || 'NOT_SET (will use default)',
      nextAuthUrl: process.env.NEXTAUTH_URL || 'NOT_SET',
    },
    test: {
      status: 'pending',
      result: null,
      error: null,
    },
  };

  // If no API key, return early with instructions
  if (!apiKey) {
    diagnostic.test.status = 'skipped';
    diagnostic.test.error = 'RESEND_API_KEY not configured';
    diagnostic.instructions = [
      '1. Go to https://resend.com/api-keys',
      '2. Create new API key (starts with "re_")',
      '3. Add to Vercel: Settings > Environment Variables',
      '4. Variable name: RESEND_API_KEY',
      '5. Redeploy after adding',
    ];
    return res.status(200).json(diagnostic);
  }

  // If API key has invalid format
  if (!apiKey.startsWith('re_')) {
    diagnostic.test.status = 'error';
    diagnostic.test.error = 'RESEND_API_KEY has invalid format (should start with "re_")';
    diagnostic.instructions = [
      '1. Current key format is INVALID',
      '2. Go to https://resend.com/api-keys',
      '3. Generate NEW API key',
      '4. Update RESEND_API_KEY in Vercel',
      '5. Key should start with "re_"',
    ];
    return res.status(200).json(diagnostic);
  }

  // Test Resend connection
  try {
    const resend = new Resend(apiKey);

    // Get test email from query or use Resend's test address
    const testEmail = (req.query.email as string) || 'delivered@resend.dev';
    const from = process.env.EMAIL_FROM || 'INSANYCK <onboarding@resend.dev>';

    console.log('[TEST-EMAIL] Attempting to send test email...', {
      from,
      to: testEmail,
      timestamp: new Date().toISOString(),
    });

    const result = await resend.emails.send({
      from,
      to: testEmail,
      subject: '[INSANYCK TEST] Email System Diagnostic',
      html: `
        <!DOCTYPE html>
        <html lang="pt">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="color-scheme" content="dark">
        </head>
        <body style="background: #000; color: #fff; padding: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 520px; margin: 0 auto;">
            <h1 style="color: #fff; letter-spacing: 0.3em; font-size: 24px; font-weight: 400; text-transform: uppercase; text-align: center; margin-bottom: 32px;">
              INSANYCK
            </h1>
            <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 16px; padding: 32px;">
              <h2 style="color: rgba(255, 255, 255, 0.95); font-size: 18px; margin-top: 0;">
                ✅ Email System Test
              </h2>
              <p style="color: rgba(255, 255, 255, 0.85); line-height: 1.7;">
                If you can see this email, your INSANYCK email system is configured correctly!
              </p>
              <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.12); margin: 24px 0;">
              <p style="color: rgba(255, 255, 255, 0.6); font-size: 14px; margin: 8px 0;">
                <strong>Timestamp:</strong> ${new Date().toISOString()}
              </p>
              <p style="color: rgba(255, 255, 255, 0.6); font-size: 14px; margin: 8px 0;">
                <strong>Environment:</strong> ${process.env.VERCEL_ENV || 'local'}
              </p>
              <p style="color: rgba(255, 255, 255, 0.6); font-size: 14px; margin: 8px 0;">
                <strong>From:</strong> ${from}
              </p>
              <p style="color: rgba(255, 255, 255, 0.6); font-size: 14px; margin: 8px 0;">
                <strong>To:</strong> ${testEmail}
              </p>
            </div>
            <p style="color: rgba(255, 255, 255, 0.4); font-size: 12px; text-align: center; margin-top: 32px;">
              This is a test email from INSANYCK email diagnostic system.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
INSANYCK Email System Test

✅ If you can see this email, your email system is configured correctly!

Timestamp: ${new Date().toISOString()}
Environment: ${process.env.VERCEL_ENV || 'local'}
From: ${from}
To: ${testEmail}

This is a test email from INSANYCK email diagnostic system.
      `.trim(),
    });

    console.log('[TEST-EMAIL] Resend API Response:', result);

    diagnostic.test.status = result.error ? 'error' : 'success';
    diagnostic.test.result = result.data;
    diagnostic.test.error = result.error;

    if (result.error) {
      // Provide specific instructions based on error
      diagnostic.instructions = [];

      if (result.error.message?.includes('domain')) {
        diagnostic.instructions.push(
          'DOMAIN VERIFICATION REQUIRED:',
          '1. Go to https://resend.com/domains',
          '2. Click "Add Domain"',
          '3. Enter: insanyck.com',
          '4. Add DNS records to Cloudflare:',
          '   - SPF: v=spf1 include:resend.dev ~all',
          '   - DKIM: Copy from Resend dashboard',
          '5. Wait for verification (can take up to 24h)',
          '',
          'TEMPORARY FIX: Use onboarding@resend.dev as FROM address'
        );
      }

      if (result.error.message?.includes('API key')) {
        diagnostic.instructions.push(
          'API KEY ISSUE:',
          '1. Go to https://resend.com/api-keys',
          '2. Check if current key is listed and active',
          '3. If not, create new key',
          '4. Update RESEND_API_KEY in Vercel',
          '5. Redeploy'
        );
      }

      if (result.error.message?.includes('from')) {
        diagnostic.instructions.push(
          'FROM ADDRESS ISSUE:',
          '1. Current FROM: ' + from,
          '2. Check domain verification status',
          '3. For testing, use: onboarding@resend.dev',
          '4. Set EMAIL_FROM env var to verified address'
        );
      }
    } else {
      // Success! Provide next steps
      diagnostic.instructions = [
        '✅ EMAIL SENT SUCCESSFULLY!',
        '',
        'Next steps:',
        '1. Check email in: ' + testEmail,
        '2. Check Resend dashboard: https://resend.com/emails',
        '3. Email ID: ' + (result.data?.id || 'N/A'),
        '',
        'If email arrives:',
        '- Email system is working correctly',
        '- Delete this test endpoint (src/pages/api/test-email.ts)',
        '- Remove verbose logs from src/lib/email.ts',
        '',
        'If email does NOT arrive:',
        '- Check spam folder',
        '- Verify DNS records (SPF, DKIM) in Cloudflare',
        '- Check Resend dashboard for delivery status',
      ];
    }

  } catch (error) {
    diagnostic.test.status = 'exception';
    diagnostic.test.error = {
      type: error instanceof Error ? error.constructor.name : typeof error,
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined,
    };

    diagnostic.instructions = [
      'EXCEPTION CAUGHT:',
      String(error),
      '',
      'Common causes:',
      '1. Network issue connecting to Resend API',
      '2. Invalid API key format',
      '3. Resend service outage (check status.resend.com)',
      '4. Vercel function timeout',
    ];

    console.error('[TEST-EMAIL] Exception:', error);
  }

  return res.status(200).json(diagnostic);
}
