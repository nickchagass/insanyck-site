// INSANYCK MP-PROD-LOCK-01 FIX C — Test endpoint removed for security
// This endpoint has been disabled. Use MongoDB CLI for testing.

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return res.status(410).json({
    error: "This test endpoint has been permanently removed for security reasons.",
    message: "Use MongoDB CLI or Compass for database testing.",
  });
}
