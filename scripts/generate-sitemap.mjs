// scripts/generate-sitemap.mjs
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

// Read Supabase creds from env (Netlify: set for ALL contexts)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Your live site domain
const SITE = "https://bloggerg.serali.tech";

// Resolve /public folder from repo root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, "../public");
const OUT_PATH = path.join(PUBLIC_DIR, "sitemap.xml");

// Helper: format to YYYY-MM-DD
const toDate = (d) => new Date(d).toISOString().slice(0, 10);

(async () => {
  // Fetch posts: post_date + updated_at
  const { data: posts, error } = await supabase
    .from("posts")
    .select("post_date, updated_at")
    .order("post_date", { ascending: false });

  if (error) {
    console.error("❌ Supabase error while generating sitemap:", error.message);
    process.exit(1);
  }

  const now = new Date();
  const lastmodRoot =
    posts?.[0]?.updated_at ? toDate(posts[0].updated_at) : toDate(now);

  // Note: Until you add dedicated per-post routes,
  // we’ll expose canonical URLs as query form: /?date=YYYY-MM-DD
  // (Google can index query URLs just fine.)
  const urls = [
    {
      loc: `${SITE}/`,
      lastmod: lastmodRoot,
      changefreq: "daily",
      priority: "1.0",
    },
    ...(posts || []).map((p) => ({
      loc: `${SITE}/?date=${p.post_date}`, // e.g. https://bloggerg.serali.tech/?date=2025-11-07
      lastmod: p.updated_at ? toDate(p.updated_at) : p.post_date,
      changefreq: "monthly",
      priority: "0.8",
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

  await mkdir(PUBLIC_DIR, { recursive: true });
  await writeFile(OUT_PATH, xml, "utf8");
  console.log(`✅ Sitemap written to ${OUT_PATH} with ${urls.length} URL(s).`);
})().catch((e) => {
  console.error("❌ Failed to generate sitemap:", e);
  process.exit(1);
});
