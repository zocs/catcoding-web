import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const site = 'https://catcoding.org';
const pagesDir = path.resolve('src/pages');
const outputPath = path.resolve('public/sitemap.xml');

function normalizeRoute(filePath) {
  const rel = filePath.replaceAll('\\', '/');
  if (!rel.endsWith('.astro')) return null;
  const route = rel
    .replace(/\.astro$/, '')
    .replace(/\/index$/, '/')
    .replace(/^index$/, '/');
  return route.startsWith('/') ? route : `/${route}`;
}

async function collectAstroPages(dir, root = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectAstroPages(abs, root)));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.astro')) {
      files.push(path.relative(root, abs));
    }
  }
  return files;
}

async function main() {
  const astroFiles = await collectAstroPages(pagesDir);
  const routes = Array.from(
    new Set(astroFiles.map(normalizeRoute).filter(Boolean))
  ).sort();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes
    .map((route) => {
      const loc = `${site}${route}`;
      const priority = route === '/' ? '1.0' : '0.9';
      return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join('\n')}\n</urlset>\n`;

  await writeFile(outputPath, xml, 'utf8');
  console.log(`Generated sitemap with ${routes.length} routes at ${outputPath}`);
}

main().catch((err) => {
  console.error('Failed to generate sitemap:', err);
  process.exit(1);
});
