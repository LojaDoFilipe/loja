// Batch watermark script using sharp
// Usage:
//   node scripts/add-watermark.js              -> process ALL images
//   node scripts/add-watermark.js dir1 dir2    -> ONLY process images whose relative path (under src/assets/images) begins with any provided dir
//   WATERMARK_MODE=diagonal node scripts/add-watermark.js yo-zuri/shrimps
// Modes via env WATERMARK_MODE: 'corner' | 'center' | 'tiled' | 'diagonal' (default: tiled)
// Outputs to watermarked/ preserving folder structure

const fs = require('fs');
const path = require('path');
let sharp = require('sharp');

const ROOT_IMAGES = path.join(__dirname, '../src/assets/images');
const OUTPUT_ROOT = path.join(ROOT_IMAGES, 'watermarked');
const WATERMARK_TEXT = 'Loja do Filipe';
// MODE: 'corner' | 'center' | 'tiled' | 'diagonal'
const MODE = process.env.WATERMARK_MODE || 'tiled';
// Optional folder filters passed as CLI args (relative to ROOT_IMAGES). Examples:
//   yo-zuri/shrimps  yamashita
// Normalize path segments: backslashes -> forward slashes, trim leading/trailing slashes
const SELECTED = process.argv.slice(2).map(p => p.replace(/\\/g,'/').replace(/^\/+/, '').replace(/\/+$/, ''));
const HAS_FILTER = SELECTED.length > 0;

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }

function listImages(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (full.startsWith(OUTPUT_ROOT)) continue; // skip output
    if (entry.isDirectory()) out.push(...listImages(full));
    else if (/\.(jpe?g|png)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

function svgOverlay(w, h) {
  const fontSize = Math.max(24, Math.round(Math.min(w, h) * 0.08));
  const pad = Math.round(fontSize * 0.6);
  if (MODE === 'corner') {
    return Buffer.from(`<?xml version='1.0' encoding='UTF-8'?>\n<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>\n  <rect width='100%' height='100%' fill='none'/>\n  <text x='${w - pad}' y='${h - pad}' font-family='Segoe UI, Arial, sans-serif' font-size='${fontSize}' text-anchor='end' fill='rgba(255,255,255,0.9)' stroke='rgba(0,0,0,0.6)' stroke-width='2' paint-order='stroke' >${WATERMARK_TEXT}</text>\n</svg>`);
  }
  if (MODE === 'center') {
    return Buffer.from(`<?xml version='1.0' encoding='UTF-8'?>\n<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>\n  <rect width='100%' height='100%' fill='none'/>\n  <text x='50%' y='50%' font-family='Segoe UI, Arial, sans-serif' font-size='${fontSize * 1.4}' text-anchor='middle' dominant-baseline='middle' fill='rgba(255,255,255,0.18)' stroke='rgba(0,0,0,0.4)' stroke-width='3' paint-order='stroke' >${WATERMARK_TEXT}</text>\n</svg>`);
  }
  if (MODE === 'diagonal') {
    // Large single diagonal text spanning corner to corner
    const diag = Math.sqrt(w * w + h * h);
    // Reduced scale for a less intrusive watermark (previously 0.18)
    const bigSize = Math.round(diag * 0.14);
    const cx = w / 2;
    const cy = h / 2;
    const angle = -Math.atan2(h, w) * 180 / Math.PI; // rotate to align
    return Buffer.from(`<?xml version='1.0' encoding='UTF-8'?>\n<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>\n  <defs>\n    <filter id='shadow' x='-30%' y='-30%' width='160%' height='160%'>\n      <feDropShadow dx='2' dy='2' stdDeviation='3' flood-color='rgba(0,0,0,0.55)'/>\n    </filter>\n  </defs>\n  <rect width='100%' height='100%' fill='none'/>\n  <g transform='translate(${cx} ${cy}) rotate(${angle})'>\n    <text text-anchor='middle' dominant-baseline='middle' font-family='Segoe UI, Arial, sans-serif' font-weight='700' font-size='${bigSize}' fill='rgba(255,255,255,0.20)' stroke='rgba(0,0,0,0.55)' stroke-width='6' filter='url(#shadow)' paint-order='stroke'>${WATERMARK_TEXT}</text>\n  </g>\n</svg>`);
  }
  // tiled (default) - diagonal repeated
  const tileSize = Math.max(220, Math.round(Math.min(w, h) * 0.6));
  const repeatText = WATERMARK_TEXT.replace(/&/g,'&amp;');
  return Buffer.from(`<?xml version='1.0' encoding='UTF-8'?>\n<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>\n  <defs>\n    <pattern id='wm' width='${tileSize}' height='${tileSize}' patternUnits='userSpaceOnUse' patternTransform='rotate(-30)'>\n      <text x='10' y='${Math.round(tileSize/2)}' font-family='Segoe UI, Arial, sans-serif' font-size='${Math.round(tileSize/6)}' fill='rgba(255,255,255,0.15)' stroke='rgba(0,0,0,0.35)' stroke-width='2' paint-order='stroke' >${repeatText}</text>\n    </pattern>\n  </defs>\n  <rect width='100%' height='100%' fill='url(#wm)'/>\n</svg>`);
}

async function watermark(src) {
  const rel = path.relative(ROOT_IMAGES, src);
  const outPath = path.join(OUTPUT_ROOT, rel);
  ensureDir(path.dirname(outPath));
  const img = sharp(src);
  const meta = await img.metadata();
  if (!meta.width || !meta.height) {
    console.warn('Skipping (no dimensions)', src);
    return;
  }
  const svg = svgOverlay(meta.width, meta.height);
  // For 'corner' we composite, for others we just overlay whole SVG (still composite)
  await img.composite([{ input: svg }]).jpeg({ quality: 90 }).toFile(outPath);
  console.log('Watermarked ->', outPath);
}

async function run() {
  ensureDir(OUTPUT_ROOT);
  let images = listImages(ROOT_IMAGES);
  if (HAS_FILTER) {
    images = images.filter(f => {
      const rel = path.relative(ROOT_IMAGES, f).replace(/\\/g,'/');
      return SELECTED.some(sel => rel === sel || rel.startsWith(sel + '/'));
    });
  }
  if (!images.length) {
    console.log(HAS_FILTER ? 'No images matched the provided folder filters:' : 'No images found', SELECTED);
    return;
  }
  console.log(`Watermark mode: ${MODE}`);
  if (HAS_FILTER) console.log('Filtering to folders:', SELECTED.join(', '));
  console.log('Total images to process:', images.length);
  for (const file of images) {
    try { await watermark(file); } catch (e) { console.error('Failed', file, e.message); }
  }
  console.log('Done. Output at', OUTPUT_ROOT);
}

run().catch(e => { console.error('Fatal', e); });
