// Downloads the images from the old Squarespace site into src/assets/images/.
// Safe to run repeatedly: files that already exist are skipped.
// Run once with `npm run fetch-images`, then commit the images so the site
// no longer depends on Squarespace.
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";

const sources = JSON.parse(await readFile(new URL("./image-sources.json", import.meta.url)));
let got = 0, skipped = 0, failed = 0;
for (const [dest, url] of Object.entries(sources)) {
  try { await access(dest); skipped++; continue; } catch {}
  try {
    const res = await fetch(url + "?format=1500w");
    if (!res.ok) throw new Error(res.status);
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, Buffer.from(await res.arrayBuffer()));
    got++; console.log("✓", dest);
  } catch (e) { failed++; console.warn("✗", dest, String(e.message || e)); }
}
console.log(`images: ${got} downloaded, ${skipped} already present, ${failed} failed`);
