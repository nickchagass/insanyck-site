// INSANYCK MP-PROD-LOCK-01 FIX C — Test endpoint removed for security
// Email testing should be done via dedicated dev tools or staging environment.

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return res.status(410).json({
    error: "This test endpoint has been permanently removed for security reasons.",
    message: "Use Resend dashboard or staging environment for email testing.",
  });
}
