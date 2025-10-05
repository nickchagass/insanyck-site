import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Content-Type","text/plain; charset=utf-8");
  const protocol = (req.headers["x-forwarded-proto"] as string) || "https";
  const host = req.headers.host || "insanyck.com";
  res.status(200).send(`User-agent: *
Allow: /
Sitemap: ${protocol}://${host}/sitemap.xml
`);
}