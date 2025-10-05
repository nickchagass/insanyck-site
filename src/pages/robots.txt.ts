// INSANYCK · Hotfix — robots.txt seguro (SSR)
import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const origin =
    (process.env.NEXT_PUBLIC_URL && new URL(process.env.NEXT_PUBLIC_URL).origin) ||
    (req?.headers?.host ? `https://${req.headers.host}` : "https://insanyck.com");

  const isProd =
    process.env.NODE_ENV === "production" &&
    process.env.VERCEL_ENV !== "preview" &&
    process.env.NEXT_PUBLIC_VERCEL_ENV !== "preview";

  const body = isProd
    ? `User-agent: *
Allow: /
Sitemap: ${origin}/sitemap.xml
`
    : `User-agent: *
Allow: /
# Preview/Dev: sem sitemap para evitar indexação incorreta
`;

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=86400");
  res.write(body);
  res.end();
  return { props: {} };
};

// página não renderiza (apenas SSR)
export default function RobotsTxt() { return null; }