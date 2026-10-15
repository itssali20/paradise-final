// Downloads every remote stock photo (Unsplash) and clip (Mixkit) the site uses into /public/media/cdn
// and writes src/content/media-local.json so the site serves them from its own domain.
// Run once on your computer before deploying:  npm run media:pull
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "public/media/cdn");
fs.mkdirSync(outDir, { recursive: true });

const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(f)) files.push(p);
  }
})(path.join(root, "src"));

const un = new Set(), mx = new Set();
for (const f of files) {
  const t = fs.readFileSync(f, "utf8");
  for (const m of t.matchAll(/un:([0-9]{10,}-[0-9a-f]{6,})/g)) un.add(m[1]);
  for (const m of t.matchAll(/\b(?:id|mixkit|turquoise|underwater|stage|beach|pool|horseback|couple):\s*"(\d{3,6})"/g)) mx.add(m[1]);
}
for (const m of fs.readFileSync(path.join(root, "src/content/program.ts"), "utf8").matchAll(/id: "(\d{3,6})"/g)) mx.add(m[1]);

const mapPath = path.join(root, "src/content/media-local.json");
const map = fs.existsSync(mapPath) ? JSON.parse(fs.readFileSync(mapPath, "utf8")) : {};

async function get(url, dest) {
  if (fs.existsSync(dest)) return true;
  const r = await fetch(url);
  if (!r.ok) { console.warn("✗", r.status, url); return false; }
  fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
  return true;
}

for (const id of un) {
  const file = `un-${id}.jpg`;
  if (await get(`https://images.unsplash.com/photo-${id}?auto=format&fm=jpg&fit=crop&w=2000&q=78`, path.join(outDir, file))) {
    map[`un:${id}`] = `/media/cdn/${file}`;
    process.stdout.write(".");
  }
}
for (const id of mx) {
  for (const q of ["720", "360"]) {
    const file = `mx-${id}-${q}.mp4`;
    if (await get(`https://assets.mixkit.co/videos/${id}/${id}-${q}.mp4`, path.join(outDir, file))) map[`mx:${id}:${q}`] = `/media/cdn/${file}`;
  }
  const poster = `mx-${id}.jpg`;
  if (await get(`https://assets.mixkit.co/videos/${id}/${id}-thumb-720-0.jpg`, path.join(outDir, poster))) map[`mxp:${id}`] = `/media/cdn/${poster}`;
  process.stdout.write("▶");
}
fs.writeFileSync(mapPath, JSON.stringify(map, null, 2));
console.log(`\nSaved ${Object.keys(map).length} files. Commit public/media/cdn and src/content/media-local.json, then deploy.`);
