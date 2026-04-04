// Script to generate all new avatar sprite PNGs (32x32 pixel art)
// Uses sharp to create transparent PNGs with pixel-perfect placement
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SIZE = 32;
const SPRITES_DIR = path.join(__dirname, '..', 'public', 'sprites');

// Helper: create a 32x32 RGBA buffer (transparent)
function createBuffer() {
  return Buffer.alloc(SIZE * SIZE * 4, 0);
}

// Helper: set a pixel in the buffer
function setPixel(buf, x, y, r, g, b, a = 255) {
  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return;
  const idx = (y * SIZE + x) * 4;
  buf[idx] = r;
  buf[idx + 1] = g;
  buf[idx + 2] = b;
  buf[idx + 3] = a;
}

// Helper: fill a rectangle
function fillRect(buf, x1, y1, w, h, r, g, b, a = 255) {
  for (let y = y1; y < y1 + h; y++) {
    for (let x = x1; x < x1 + w; x++) {
      setPixel(buf, x, y, r, g, b, a);
    }
  }
}

// Helper: parse hex color
function hex(color) {
  const c = color.replace('#', '');
  return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
}

// Save a buffer as PNG
async function savePng(buf, filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  await sharp(buf, { raw: { width: SIZE, height: SIZE, channels: 4 } })
    .png()
    .toFile(filePath);
  console.log('  Created: ' + path.relative(SPRITES_DIR, filePath));
}

// ============================================================
// BODY (new skin tones)
// ============================================================
// Body template from body-medium.png analysis:
// Head: rows 2-13, roughly x=9-22 (oval shape)
// Neck: rows 14-15, x=13-18
// Torso: rows 16-24, wider with arms
// Legs: rows 25-31, two columns with gap

function drawBody(buf, baseColor, shadowColor) {
  const [r, g, b] = hex(baseColor);
  const [sr, sg, sb] = shadowColor ? hex(shadowColor) : [r, g, b];

  // Head (rows 2-13)
  // Row 2: x=10-21
  fillRect(buf, 10, 2, 12, 1, r, g, b);
  // Rows 3-12: x=9-22
  fillRect(buf, 9, 3, 14, 10, r, g, b);
  // Row 13: x=10-21
  fillRect(buf, 10, 13, 12, 1, r, g, b);
  // Neck (rows 14-15): x=13-18
  fillRect(buf, 13, 14, 6, 2, r, g, b);
  // Torso row 16: x=8-23
  fillRect(buf, 8, 16, 16, 1, r, g, b);
  // Torso rows 17-24: x=5-26 (with arms)
  fillRect(buf, 5, 17, 22, 8, r, g, b);
  // Lower torso row 25: x=8-23 (no arms)
  // Actually looking at body: row 25 is x=8-23
  // But this transitions to legs. Let me match exact body template
  // Row 16: 8 wide from x=8, so x=8..23
  // Rows 17-24: x=5..26
  // Overwrite row 25 with hip
  fillRect(buf, 8, 25, 16, 1, r, g, b);
  // Legs rows 26-31: two legs with gap
  // Left leg: x=10-14, Right leg: x=17-21
  fillRect(buf, 10, 26, 5, 6, r, g, b);
  fillRect(buf, 17, 26, 5, 6, r, g, b);
}

// ============================================================
// EYES
// ============================================================
// Default eyes position: row 7-9, left eye x=12-14, right eye x=18-20

function drawEyesWink(buf) {
  const [r, g, b] = hex('#1a1a2e');
  // Left eye: normal (3x3 block)
  fillRect(buf, 12, 7, 3, 3, r, g, b);
  // Right eye: wink (horizontal line 3x1)
  fillRect(buf, 18, 8, 3, 1, r, g, b);
}

function drawEyesCat(buf) {
  const [r, g, b] = hex('#1a1a2e');
  // Vertical slit pupils
  // Left eye: x=13, y=7-9 (1x3)
  setPixel(buf, 13, 7, 255, 255, 255); // reflet
  setPixel(buf, 13, 8, r, g, b);
  setPixel(buf, 13, 9, r, g, b);
  // Right eye: x=19, y=7-9
  setPixel(buf, 19, 7, 255, 255, 255); // reflet
  setPixel(buf, 19, 8, r, g, b);
  setPixel(buf, 19, 9, r, g, b);
}

function drawEyesStar(buf) {
  const [r, g, b] = hex('#facc15');
  // Left eye star (3x3 cross pattern centered at 13,8)
  setPixel(buf, 13, 7, r, g, b); // top
  setPixel(buf, 12, 8, r, g, b); // left
  setPixel(buf, 13, 8, r, g, b); // center
  setPixel(buf, 14, 8, r, g, b); // right
  setPixel(buf, 13, 9, r, g, b); // bottom
  // Right eye star centered at 19,8
  setPixel(buf, 19, 7, r, g, b);
  setPixel(buf, 18, 8, r, g, b);
  setPixel(buf, 19, 8, r, g, b);
  setPixel(buf, 20, 8, r, g, b);
  setPixel(buf, 19, 9, r, g, b);
}

function drawEyesHeart(buf) {
  const [r, g, b] = hex('#f472b6');
  // Left heart at (12,7) - 3x3
  setPixel(buf, 12, 7, r, g, b); setPixel(buf, 14, 7, r, g, b); // top bumps
  setPixel(buf, 12, 8, r, g, b); setPixel(buf, 13, 8, r, g, b); setPixel(buf, 14, 8, r, g, b); // middle full
  setPixel(buf, 13, 9, r, g, b); // bottom point
  // Right heart at (18,7) - 3x3
  setPixel(buf, 18, 7, r, g, b); setPixel(buf, 20, 7, r, g, b);
  setPixel(buf, 18, 8, r, g, b); setPixel(buf, 19, 8, r, g, b); setPixel(buf, 20, 8, r, g, b);
  setPixel(buf, 19, 9, r, g, b);
}

function drawEyesCyber(buf) {
  const [r, g, b] = hex('#1a1a2e');
  const [cr, cg, cb] = hex('#22d3ee');
  const [fr, fg, fb] = hex('#0e7490');
  // Left eye: normal
  fillRect(buf, 12, 7, 3, 3, r, g, b);
  // Right eye: cyber implant (2x2 frame + glow)
  setPixel(buf, 18, 7, fr, fg, fb); setPixel(buf, 19, 7, fr, fg, fb); setPixel(buf, 20, 7, fr, fg, fb);
  setPixel(buf, 18, 8, fr, fg, fb); setPixel(buf, 19, 8, cr, cg, cb); setPixel(buf, 20, 8, fr, fg, fb);
  setPixel(buf, 18, 9, fr, fg, fb); setPixel(buf, 19, 9, fr, fg, fb); setPixel(buf, 20, 9, fr, fg, fb);
  // Glow around
  setPixel(buf, 17, 7, cr, cg, cb, 100); setPixel(buf, 21, 7, cr, cg, cb, 100);
  setPixel(buf, 17, 8, cr, cg, cb, 100); setPixel(buf, 21, 8, cr, cg, cb, 100);
  setPixel(buf, 17, 9, cr, cg, cb, 100); setPixel(buf, 21, 9, cr, cg, cb, 100);
  setPixel(buf, 18, 6, cr, cg, cb, 100); setPixel(buf, 19, 6, cr, cg, cb, 100); setPixel(buf, 20, 6, cr, cg, cb, 100);
  setPixel(buf, 18, 10, cr, cg, cb, 100); setPixel(buf, 19, 10, cr, cg, cb, 100); setPixel(buf, 20, 10, cr, cg, cb, 100);
}

function drawEyesVoid(buf) {
  const [vr, vg, vb] = hex('#7c3aed');
  const [dr, dg, db] = hex('#0a0a14');
  // Left void eye (3x3)
  fillRect(buf, 12, 7, 3, 3, dr, dg, db);
  setPixel(buf, 13, 8, 255, 255, 255); // central glow
  // Halo
  setPixel(buf, 11, 7, vr, vg, vb, 77); setPixel(buf, 15, 7, vr, vg, vb, 77);
  setPixel(buf, 11, 8, vr, vg, vb, 77); setPixel(buf, 15, 8, vr, vg, vb, 77);
  setPixel(buf, 11, 9, vr, vg, vb, 77); setPixel(buf, 15, 9, vr, vg, vb, 77);
  setPixel(buf, 12, 6, vr, vg, vb, 77); setPixel(buf, 13, 6, vr, vg, vb, 77); setPixel(buf, 14, 6, vr, vg, vb, 77);
  setPixel(buf, 12, 10, vr, vg, vb, 77); setPixel(buf, 13, 10, vr, vg, vb, 77); setPixel(buf, 14, 10, vr, vg, vb, 77);
  // Right void eye
  fillRect(buf, 18, 7, 3, 3, dr, dg, db);
  setPixel(buf, 19, 8, 255, 255, 255);
  setPixel(buf, 17, 7, vr, vg, vb, 77); setPixel(buf, 21, 7, vr, vg, vb, 77);
  setPixel(buf, 17, 8, vr, vg, vb, 77); setPixel(buf, 21, 8, vr, vg, vb, 77);
  setPixel(buf, 17, 9, vr, vg, vb, 77); setPixel(buf, 21, 9, vr, vg, vb, 77);
  setPixel(buf, 18, 6, vr, vg, vb, 77); setPixel(buf, 19, 6, vr, vg, vb, 77); setPixel(buf, 20, 6, vr, vg, vb, 77);
  setPixel(buf, 18, 10, vr, vg, vb, 77); setPixel(buf, 19, 10, vr, vg, vb, 77); setPixel(buf, 20, 10, vr, vg, vb, 77);
}

// ============================================================
// HAIR
// ============================================================

function drawHairMohawkPink(buf) {
  const [r, g, b] = hex('#ec4899');
  const [sr, sg, sb] = hex('#be185d');
  // Mohawk crest: 3px wide, centered at x=14-16, from y=-2 to y=5
  // Tall crest above head
  fillRect(buf, 14, 0, 3, 1, sr, sg, sb);
  fillRect(buf, 14, 1, 3, 1, r, g, b);
  fillRect(buf, 14, 2, 3, 1, r, g, b);
  fillRect(buf, 14, 3, 3, 1, r, g, b);
  fillRect(buf, 14, 4, 3, 1, r, g, b);
  fillRect(buf, 14, 5, 3, 1, sr, sg, sb);
  // Slight widening at base
  fillRect(buf, 13, 4, 5, 1, r, g, b);
  fillRect(buf, 13, 5, 5, 1, sr, sg, sb);
}

function drawHairTwintailsPurple(buf) {
  const [r, g, b] = hex('#a855f7');
  const [sr, sg, sb] = hex('#7e22ce');
  // Bangs across forehead
  fillRect(buf, 9, 2, 14, 2, r, g, b);
  fillRect(buf, 9, 2, 14, 1, sr, sg, sb);
  // Left twintail: x=7-9, y=5-14
  fillRect(buf, 7, 5, 3, 10, r, g, b);
  fillRect(buf, 7, 5, 1, 10, sr, sg, sb);
  // Right twintail: x=22-24, y=5-14
  fillRect(buf, 22, 5, 3, 10, r, g, b);
  fillRect(buf, 24, 5, 1, 10, sr, sg, sb);
  // Ties
  setPixel(buf, 8, 5, sr, sg, sb);
  setPixel(buf, 23, 5, sr, sg, sb);
}

function drawHairMessyGinger(buf) {
  const [r, g, b] = hex('#ea580c');
  const [sr, sg, sb] = hex('#c2410c');
  // Messy top with irregular edges
  fillRect(buf, 8, 1, 16, 1, r, g, b);
  fillRect(buf, 7, 2, 18, 4, r, g, b);
  fillRect(buf, 8, 6, 16, 1, sr, sg, sb);
  // Messy bits sticking out
  setPixel(buf, 6, 2, r, g, b);
  setPixel(buf, 25, 3, r, g, b);
  setPixel(buf, 7, 0, r, g, b);
  setPixel(buf, 24, 1, r, g, b);
  setPixel(buf, 10, 0, sr, sg, sb);
}

function drawHairBowlTeal(buf) {
  const [r, g, b] = hex('#14b8a6');
  const [sr, sg, sb] = hex('#0d9488');
  // Perfect round bowl cut
  fillRect(buf, 9, 0, 14, 1, r, g, b);
  fillRect(buf, 8, 1, 16, 1, r, g, b);
  fillRect(buf, 8, 2, 16, 4, r, g, b);
  // Bangs (straight fringe)
  fillRect(buf, 9, 6, 14, 1, sr, sg, sb);
  // Sides
  fillRect(buf, 8, 6, 1, 3, sr, sg, sb);
  fillRect(buf, 23, 6, 1, 3, sr, sg, sb);
}

function drawHairPonytailBlonde(buf) {
  const [r, g, b] = hex('#fbbf24');
  const [sr, sg, sb] = hex('#d97706');
  // Flat hair on top
  fillRect(buf, 9, 1, 14, 2, r, g, b);
  fillRect(buf, 9, 3, 14, 2, sr, sg, sb);
  // Ponytail going right from top of head
  fillRect(buf, 22, 2, 2, 1, r, g, b);
  fillRect(buf, 24, 3, 2, 1, r, g, b);
  fillRect(buf, 25, 4, 2, 1, r, g, b);
  fillRect(buf, 26, 5, 2, 2, r, g, b);
  // Elastic
  setPixel(buf, 22, 3, sr, sg, sb);
}

function drawHairCurtainsSilver(buf) {
  const [r, g, b] = hex('#d1d5db');
  const [sr, sg, sb] = hex('#9ca3af');
  const [hr, hg, hb] = hex('#f3f4f6');
  // Top
  fillRect(buf, 9, 1, 14, 1, hr, hg, hb);
  fillRect(buf, 8, 2, 16, 4, r, g, b);
  // Part in middle (1px gap at x=15)
  setPixel(buf, 15, 2, 0, 0, 0, 0);
  setPixel(buf, 16, 2, 0, 0, 0, 0);
  // Curtains falling down sides
  fillRect(buf, 8, 6, 3, 7, r, g, b);
  fillRect(buf, 21, 6, 3, 7, r, g, b);
  fillRect(buf, 8, 6, 1, 7, sr, sg, sb);
  fillRect(buf, 23, 6, 1, 7, sr, sg, sb);
}

function drawHairSpikyRed(buf) {
  const [r, g, b] = hex('#dc2626');
  const [sr, sg, sb] = hex('#991b1b');
  // Base on head
  fillRect(buf, 9, 3, 14, 3, r, g, b);
  fillRect(buf, 9, 5, 14, 1, sr, sg, sb);
  // Spikes going up
  setPixel(buf, 10, 2, r, g, b); setPixel(buf, 10, 1, r, g, b);
  setPixel(buf, 13, 2, r, g, b); setPixel(buf, 13, 1, r, g, b); setPixel(buf, 13, 0, r, g, b);
  setPixel(buf, 16, 2, r, g, b); setPixel(buf, 16, 1, r, g, b);
  setPixel(buf, 19, 2, r, g, b); setPixel(buf, 19, 1, r, g, b); setPixel(buf, 19, 0, r, g, b);
  setPixel(buf, 22, 2, r, g, b); setPixel(buf, 22, 1, r, g, b);
}

function drawHairCrownBraidGold(buf) {
  const [r, g, b] = hex('#d4a017');
  const [sr, sg, sb] = hex('#a16207');
  const [hr, hg, hb] = hex('#fef3c7');
  // Crown braid around the head
  fillRect(buf, 9, 1, 14, 1, r, g, b);
  fillRect(buf, 8, 2, 1, 5, r, g, b);
  fillRect(buf, 23, 2, 1, 5, r, g, b);
  // Zigzag braid pattern
  for (let i = 0; i < 14; i++) {
    if (i % 2 === 0) setPixel(buf, 9 + i, 1, hr, hg, hb);
  }
  // Side braid detail
  for (let y = 2; y < 7; y++) {
    if (y % 2 === 0) {
      setPixel(buf, 8, y, hr, hg, hb);
      setPixel(buf, 23, y, hr, hg, hb);
    }
  }
  // Knot at back
  setPixel(buf, 23, 4, sr, sg, sb);
  setPixel(buf, 24, 4, sr, sg, sb);
}

// ============================================================
// TOPS
// ============================================================
// T-shirt template: rows 16-25
// Row 16: x=8-23 (shoulders)
// Rows 17-21: x=5-26 (with arms)
// Rows 22-25: x=8-23 (torso only)
// Hoodie/bomber: rows 15-25, wider (x=4-27 for arms)

function drawTopTankRed(buf) {
  const [r, g, b] = hex('#dc2626');
  const [sr, sg, sb] = hex('#b91c1c');
  // Tank top: thin straps, no sleeves
  // Straps: x=11-12, x=19-20 at row 16
  fillRect(buf, 11, 16, 2, 1, r, g, b);
  fillRect(buf, 19, 16, 2, 1, r, g, b);
  // Body: rows 17-25, narrower than tshirt (x=8-23)
  fillRect(buf, 8, 17, 16, 8, r, g, b);
  fillRect(buf, 8, 25, 16, 1, sr, sg, sb);
  // No sleeves - arms visible
}

function drawTopFlannelGreen(buf) {
  const [r, g, b] = hex('#16a34a');
  const [sr, sg, sb] = hex('#15803d');
  const [tr, tg, tb] = hex('#d1d5db');
  // Like hoodie shape (wider with sleeves)
  fillRect(buf, 7, 15, 18, 1, r, g, b);
  fillRect(buf, 4, 16, 24, 1, r, g, b);
  fillRect(buf, 4, 17, 24, 8, r, g, b);
  fillRect(buf, 7, 25, 18, 1, r, g, b);
  // Checkerboard pattern
  for (let y = 16; y <= 25; y++) {
    for (let x = 4; x <= 27; x++) {
      const idx = (y * SIZE + x) * 4;
      if (buf[idx + 3] > 0 && (x + y) % 2 === 0) {
        setPixel(buf, x, y, sr, sg, sb);
      }
    }
  }
  // T-shirt underneath visible (center line)
  fillRect(buf, 14, 16, 4, 6, tr, tg, tb);
  // Buttons
  setPixel(buf, 15, 17, ...hex('#fef3c7'));
  setPixel(buf, 15, 19, ...hex('#fef3c7'));
}

function drawTopCropLilac(buf) {
  const [r, g, b] = hex('#c084fc');
  const [sr, sg, sb] = hex('#a855f7');
  // Crop top: stops early (rows 16-21 only)
  fillRect(buf, 8, 16, 16, 1, r, g, b);
  fillRect(buf, 5, 17, 22, 4, r, g, b);
  fillRect(buf, 8, 21, 16, 1, sr, sg, sb); // hem
}

function drawTopVarsityNavy(buf) {
  const [r, g, b] = hex('#1e3a5f');
  const [cr, cg, cb] = hex('#fef3c7');
  // Varsity jacket shape like bomber
  fillRect(buf, 7, 15, 18, 1, r, g, b);
  fillRect(buf, 4, 16, 24, 1, r, g, b);
  // Body navy, sleeves cream
  for (let y = 17; y <= 24; y++) {
    fillRect(buf, 4, y, 4, 1, cr, cg, cb); // left sleeve
    fillRect(buf, 8, y, 16, 1, r, g, b); // body
    fillRect(buf, 24, y, 4, 1, cr, cg, cb); // right sleeve
  }
  fillRect(buf, 7, 25, 18, 1, r, g, b);
  // White stripes at hem and cuffs
  fillRect(buf, 7, 25, 18, 1, 255, 255, 255);
  setPixel(buf, 4, 24, 255, 255, 255); setPixel(buf, 5, 24, 255, 255, 255);
  setPixel(buf, 26, 24, 255, 255, 255); setPixel(buf, 27, 24, 255, 255, 255);
  // Buttons
  setPixel(buf, 15, 18, ...hex('#d1d5db'));
  setPixel(buf, 15, 20, ...hex('#d1d5db'));
}

function drawTopKimonoSakura(buf) {
  const [r, g, b] = hex('#0a0a14');
  const [pr, pg, pb] = hex('#f472b6');
  const [or, og, ob] = hex('#f4b860');
  const [lr, lg, lb] = hex('#fecdd3');
  // Wide sleeves (wider than bomber)
  fillRect(buf, 7, 15, 18, 1, r, g, b);
  fillRect(buf, 3, 16, 26, 1, r, g, b);
  fillRect(buf, 3, 17, 26, 8, r, g, b);
  fillRect(buf, 7, 25, 18, 1, r, g, b);
  // V-cross at center
  setPixel(buf, 15, 16, r - 20, g, b);
  setPixel(buf, 14, 17, r - 20, g, b); setPixel(buf, 16, 17, r - 20, g, b);
  // Obi belt
  fillRect(buf, 8, 21, 16, 1, or, og, ob);
  fillRect(buf, 8, 22, 16, 1, or, og, ob);
  // Cherry blossom petals
  setPixel(buf, 6, 18, pr, pg, pb);
  setPixel(buf, 20, 17, lr, lg, lb);
  setPixel(buf, 10, 20, pr, pg, pb);
  setPixel(buf, 24, 19, lr, lg, lb);
}

function drawTopJerseyOrange(buf) {
  const [r, g, b] = hex('#ea580c');
  const [sr, sg, sb] = hex('#c2410c');
  // Sleeveless jersey
  fillRect(buf, 10, 16, 12, 1, r, g, b);
  fillRect(buf, 8, 17, 16, 8, r, g, b);
  fillRect(buf, 8, 25, 16, 1, sr, sg, sb);
  // White side stripes
  for (let y = 17; y <= 24; y++) {
    setPixel(buf, 8, y, 255, 255, 255);
    setPixel(buf, 23, y, 255, 255, 255);
  }
  // Number "7" in white (centered around x=14-16, y=19-23)
  fillRect(buf, 14, 19, 3, 1, 255, 255, 255);
  setPixel(buf, 16, 20, 255, 255, 255);
  setPixel(buf, 15, 21, 255, 255, 255);
  setPixel(buf, 15, 22, 255, 255, 255);
  setPixel(buf, 15, 23, 255, 255, 255);
}

function drawTopCapeRoyal(buf) {
  const [r, g, b] = hex('#7c3aed');
  const [sr, sg, sb] = hex('#4c1d95');
  const [gr, gg, gb] = hex('#fbbf24');
  const [lr, lg, lb] = hex('#d4a017');
  // Cape draped from shoulders
  // Clasps at neck
  setPixel(buf, 11, 14, lr, lg, lb);
  setPixel(buf, 20, 14, lr, lg, lb);
  // Cape sides visible (hanging behind body)
  fillRect(buf, 3, 15, 4, 1, r, g, b);
  fillRect(buf, 25, 15, 4, 1, r, g, b);
  fillRect(buf, 2, 16, 5, 10, r, g, b);
  fillRect(buf, 25, 16, 5, 10, r, g, b);
  // Inner lining (gold edge)
  for (let y = 16; y <= 25; y++) {
    setPixel(buf, 6, y, gr, gg, gb);
    setPixel(buf, 25, y, gr, gg, gb);
  }
  // Cape bottom
  fillRect(buf, 2, 25, 5, 1, sr, sg, sb);
  fillRect(buf, 25, 25, 5, 1, sr, sg, sb);
  // Collar
  fillRect(buf, 8, 13, 2, 2, r, g, b);
  fillRect(buf, 22, 13, 2, 2, r, g, b);
}

function drawTopHoodieFire(buf) {
  const [br, bg, bb] = hex('#0a0a14');
  const [or, og, ob] = hex('#ea580c');
  const [rr, rg, rb] = hex('#dc2626');
  const [yr, yg, yb] = hex('#fbbf24');
  const [gr, gg, gb] = hex('#374151');
  // Hoodie shape (like existing hoodie)
  fillRect(buf, 7, 15, 18, 1, br, bg, bb);
  fillRect(buf, 4, 16, 24, 1, br, bg, bb);
  fillRect(buf, 4, 17, 24, 8, br, bg, bb);
  fillRect(buf, 7, 25, 18, 1, br, bg, bb);
  // Hood in back
  fillRect(buf, 8, 13, 16, 2, br, bg, bb);
  // Kangaroo pocket
  fillRect(buf, 12, 21, 8, 2, gr, gg, gb);
  // Fire along bottom (zigzag at row 24-25)
  for (let x = 7; x <= 24; x++) {
    if (x % 3 === 0) {
      setPixel(buf, x, 23, yr, yg, yb);
      setPixel(buf, x, 24, or, og, ob);
    } else if (x % 3 === 1) {
      setPixel(buf, x, 24, rr, rg, rb);
    } else {
      setPixel(buf, x, 23, or, og, ob);
      setPixel(buf, x, 24, rr, rg, rb);
    }
  }
  fillRect(buf, 7, 25, 18, 1, rr, rg, rb);
}

// ============================================================
// BOTTOMS
// ============================================================
// Jean template: rows 25-31
// Rows 25-26: x=9-22 (waist/hips)
// Rows 27-30: left leg x=10-14, right leg x=17-21
// Row 31: shoes area (usually empty for bottoms)

function drawBottomShortsWhite(buf) {
  const [r, g, b] = hex('#f3f4f6');
  const [sr, sg, sb] = hex('#d1d5db');
  const [cr, cg, cb] = hex('#9ca3af');
  // Waistband
  fillRect(buf, 9, 25, 14, 1, cr, cg, cb);
  // Short body (only 3 rows, shorter than pants)
  fillRect(buf, 9, 26, 14, 1, r, g, b);
  fillRect(buf, 10, 27, 5, 1, r, g, b);
  fillRect(buf, 17, 27, 5, 1, r, g, b);
  // Hem
  fillRect(buf, 10, 28, 5, 1, sr, sg, sb);
  fillRect(buf, 17, 28, 5, 1, sr, sg, sb);
}

function drawBottomJoggerGrey(buf) {
  const [r, g, b] = hex('#6b7280');
  const [sr, sg, sb] = hex('#4b5563');
  // Waist to hips
  fillRect(buf, 9, 25, 14, 2, r, g, b);
  // Legs
  fillRect(buf, 10, 27, 5, 4, r, g, b);
  fillRect(buf, 17, 27, 5, 4, r, g, b);
  // White side stripes
  for (let y = 25; y <= 30; y++) {
    if (y <= 26) {
      setPixel(buf, 9, y, 255, 255, 255);
      setPixel(buf, 22, y, 255, 255, 255);
    } else {
      setPixel(buf, 10, y, 255, 255, 255);
      setPixel(buf, 14, y, 255, 255, 255);
      setPixel(buf, 17, y, 255, 255, 255);
      setPixel(buf, 21, y, 255, 255, 255);
    }
  }
  // Cuffs
  fillRect(buf, 10, 30, 5, 1, sr, sg, sb);
  fillRect(buf, 17, 30, 5, 1, sr, sg, sb);
}

function drawBottomSkirtPlaid(buf) {
  const [r, g, b] = hex('#1e3a5f');
  const [rr, rg, rb] = hex('#dc2626');
  const [gr, gg, gb] = hex('#15803d');
  const [pr, pg, pb] = hex('#0f172a');
  // Skirt shape: connected, slightly flared
  fillRect(buf, 9, 25, 14, 1, r, g, b);
  fillRect(buf, 8, 26, 16, 1, r, g, b);
  fillRect(buf, 8, 27, 16, 1, r, g, b);
  fillRect(buf, 7, 28, 18, 1, r, g, b);
  fillRect(buf, 7, 29, 18, 1, r, g, b);
  fillRect(buf, 7, 30, 18, 1, r, g, b);
  // Plaid lines (horizontal red, vertical green)
  for (let x = 7; x <= 24; x++) {
    const idx25 = (27 * SIZE + x) * 4;
    if (buf[idx25 + 3] > 0) setPixel(buf, x, 27, rr, rg, rb);
    const idx29 = (29 * SIZE + x) * 4;
    if (buf[idx29 + 3] > 0) setPixel(buf, x, 29, rr, rg, rb);
  }
  // Vertical green lines
  for (let y = 25; y <= 30; y++) {
    const idx1 = (y * SIZE + 11) * 4;
    if (buf[idx1 + 3] > 0) setPixel(buf, 11, y, gr, gg, gb);
    const idx2 = (y * SIZE + 15) * 4;
    if (buf[idx2 + 3] > 0) setPixel(buf, 15, y, gr, gg, gb);
    const idx3 = (y * SIZE + 19) * 4;
    if (buf[idx3 + 3] > 0) setPixel(buf, 19, y, gr, gg, gb);
  }
  // Pleat lines
  for (let y = 26; y <= 30; y++) {
    setPixel(buf, 13, y, pr, pg, pb);
    setPixel(buf, 17, y, pr, pg, pb);
    setPixel(buf, 21, y, pr, pg, pb);
  }
}

function drawBottomBaggyPurple(buf) {
  const [r, g, b] = hex('#7c3aed');
  const [sr, sg, sb] = hex('#5b21b6');
  const [pr, pg, pb] = hex('#4c1d95');
  // Wide baggy pants (1px wider on each side)
  fillRect(buf, 8, 25, 16, 2, r, g, b);
  fillRect(buf, 9, 27, 6, 4, r, g, b);
  fillRect(buf, 16, 27, 6, 4, r, g, b);
  // Extra width (stacking at bottom)
  fillRect(buf, 9, 30, 6, 1, sr, sg, sb);
  fillRect(buf, 16, 30, 6, 1, sr, sg, sb);
  fillRect(buf, 9, 31, 6, 1, sr, sg, sb);
  fillRect(buf, 16, 31, 6, 1, sr, sg, sb);
  // Plis (vertical dark lines)
  for (let y = 27; y <= 30; y++) {
    setPixel(buf, 11, y, pr, pg, pb);
    setPixel(buf, 19, y, pr, pg, pb);
  }
}

function drawBottomHakamaBlack(buf) {
  const [r, g, b] = hex('#1a1a2e');
  const [sr, sg, sb] = hex('#0a0a14');
  const [cr, cg, cb] = hex('#374151');
  // Wide hakama (very flared)
  // High waist/belt
  fillRect(buf, 8, 24, 16, 2, cr, cg, cb);
  fillRect(buf, 7, 26, 18, 1, r, g, b);
  fillRect(buf, 6, 27, 20, 1, r, g, b);
  fillRect(buf, 6, 28, 20, 1, r, g, b);
  fillRect(buf, 6, 29, 20, 1, r, g, b);
  fillRect(buf, 6, 30, 20, 1, r, g, b);
  fillRect(buf, 7, 31, 18, 1, r, g, b);
  // Central pleats
  for (let y = 26; y <= 31; y++) {
    setPixel(buf, 14, y, sr, sg, sb);
    setPixel(buf, 17, y, sr, sg, sb);
  }
}

function drawBottomRoyalDrape(buf) {
  const [r, g, b] = hex('#7c3aed');
  const [sr, sg, sb] = hex('#4c1d95');
  const [gr, gg, gb] = hex('#fbbf24');
  // Long drape
  fillRect(buf, 8, 25, 16, 2, r, g, b);
  fillRect(buf, 8, 27, 15, 4, r, g, b);
  // Slit on right side (show skin gap)
  fillRect(buf, 20, 28, 3, 3, 0, 0, 0, 0);
  // Diagonal drape lines
  for (let i = 0; i < 4; i++) {
    setPixel(buf, 10 + i, 27 + i, sr, sg, sb);
    setPixel(buf, 12 + i, 27 + i, sr, sg, sb);
  }
  // Gold border at bottom
  for (let x = 8; x <= 19; x++) {
    if (x % 2 === 0) setPixel(buf, x, 30, gr, gg, gb);
    else setPixel(buf, x, 30, sr, sg, sb);
  }
}

// ============================================================
// SHOES
// ============================================================
// Sneakers template: rows 30-31
// Left: x=9-14, Right: x=17-22

function drawShoesSlidesBlue(buf) {
  const [r, g, b] = hex('#3b82f6');
  const [sr, sg, sb] = hex('#2563eb');
  const [wr, wg, wb] = hex('#e5e7eb');
  // Slide straps (top of foot)
  fillRect(buf, 9, 30, 6, 1, r, g, b);
  fillRect(buf, 17, 30, 6, 1, r, g, b);
  // Soles (slightly wider)
  fillRect(buf, 8, 31, 8, 1, wr, wg, wb);
  fillRect(buf, 16, 31, 8, 1, wr, wg, wb);
}

function drawShoesBootsCombat(buf) {
  const [r, g, b] = hex('#1a1a2e');
  const [sr, sg, sb] = hex('#374151');
  const [lr, lg, lb] = hex('#d1d5db');
  const [sor, sog, sob] = hex('#4b5563');
  // Tall boots (rows 28-31)
  fillRect(buf, 9, 28, 6, 1, r, g, b);
  fillRect(buf, 17, 28, 6, 1, r, g, b);
  fillRect(buf, 9, 29, 6, 1, r, g, b);
  fillRect(buf, 17, 29, 6, 1, r, g, b);
  fillRect(buf, 9, 30, 6, 1, r, g, b);
  fillRect(buf, 17, 30, 6, 1, r, g, b);
  // Thick sole
  fillRect(buf, 8, 31, 8, 1, sor, sog, sob);
  fillRect(buf, 16, 31, 8, 1, sor, sog, sob);
  // Laces (center zigzag)
  setPixel(buf, 11, 28, lr, lg, lb);
  setPixel(buf, 12, 29, lr, lg, lb);
  setPixel(buf, 11, 30, lr, lg, lb);
  setPixel(buf, 19, 28, lr, lg, lb);
  setPixel(buf, 20, 29, lr, lg, lb);
  setPixel(buf, 19, 30, lr, lg, lb);
}

function drawShoesPlatformsPink(buf) {
  const [r, g, b] = hex('#ec4899');
  const [sr, sg, sb] = hex('#be185d');
  const [lr, lg, lb] = hex('#fecdd3');
  // Shoe upper
  fillRect(buf, 9, 29, 6, 1, r, g, b);
  fillRect(buf, 17, 29, 6, 1, r, g, b);
  // Thick platform sole (3px high)
  fillRect(buf, 8, 30, 8, 1, sr, sg, sb);
  fillRect(buf, 16, 30, 8, 1, sr, sg, sb);
  fillRect(buf, 8, 31, 8, 1, sr, sg, sb);
  fillRect(buf, 16, 31, 8, 1, sr, sg, sb);
  // Platform lines
  for (let x = 8; x <= 15; x++) setPixel(buf, x, 30, lr, lg, lb);
  for (let x = 16; x <= 23; x++) setPixel(buf, x, 30, lr, lg, lb);
}

function drawShoesLoafersBrown(buf) {
  const [r, g, b] = hex('#92400e');
  const [sr, sg, sb] = hex('#78350f');
  const [dr, dg, db] = hex('#d4a017');
  // Low profile loafers
  fillRect(buf, 9, 30, 6, 1, r, g, b);
  fillRect(buf, 17, 30, 6, 1, r, g, b);
  fillRect(buf, 9, 31, 6, 1, sr, sg, sb);
  fillRect(buf, 17, 31, 6, 1, sr, sg, sb);
  // Decorative tongue
  setPixel(buf, 11, 30, dr, dg, db); setPixel(buf, 12, 30, dr, dg, db);
  setPixel(buf, 19, 30, dr, dg, db); setPixel(buf, 20, 30, dr, dg, db);
}

function drawShoesRollerRetro(buf) {
  const [r, g, b] = [255, 255, 255]; // white boot
  const [pr, pg, pb] = hex('#ec4899');
  const [wr, wg, wb] = hex('#6b7280');
  const [lr, lg, lb] = hex('#d1d5db');
  // Boot part (tall)
  fillRect(buf, 9, 28, 6, 1, r, g, b);
  fillRect(buf, 17, 28, 6, 1, r, g, b);
  fillRect(buf, 9, 29, 6, 1, r, g, b);
  fillRect(buf, 17, 29, 6, 1, r, g, b);
  fillRect(buf, 9, 30, 6, 1, r, g, b);
  fillRect(buf, 17, 30, 6, 1, r, g, b);
  // Ankle strap
  fillRect(buf, 9, 28, 6, 1, pr, pg, pb);
  fillRect(buf, 17, 28, 6, 1, pr, pg, pb);
  // Wheels (below the boot)
  setPixel(buf, 10, 31, wr, wg, wb); setPixel(buf, 13, 31, wr, wg, wb);
  setPixel(buf, 18, 31, wr, wg, wb); setPixel(buf, 21, 31, wr, wg, wb);
}

function drawShoesEnchantedGlow(buf) {
  const [r, g, b] = hex('#0a0a14');
  const [cr, cg, cb] = hex('#22d3ee');
  // Boots
  fillRect(buf, 9, 29, 6, 1, r, g, b);
  fillRect(buf, 17, 29, 6, 1, r, g, b);
  fillRect(buf, 9, 30, 6, 1, r, g, b);
  fillRect(buf, 17, 30, 6, 1, r, g, b);
  // Floating (gap before ground - row 31 empty)
  // Glow halo around boots
  for (let x = 8; x <= 15; x++) {
    setPixel(buf, x, 28, cr, cg, cb, 100);
    setPixel(buf, x, 31, cr, cg, cb, 100);
  }
  for (let x = 16; x <= 23; x++) {
    setPixel(buf, x, 28, cr, cg, cb, 100);
    setPixel(buf, x, 31, cr, cg, cb, 100);
  }
  setPixel(buf, 8, 29, cr, cg, cb, 100); setPixel(buf, 8, 30, cr, cg, cb, 100);
  setPixel(buf, 15, 29, cr, cg, cb, 100); setPixel(buf, 15, 30, cr, cg, cb, 100);
  setPixel(buf, 16, 29, cr, cg, cb, 100); setPixel(buf, 16, 30, cr, cg, cb, 100);
  setPixel(buf, 23, 29, cr, cg, cb, 100); setPixel(buf, 23, 30, cr, cg, cb, 100);
  // Sparkles
  setPixel(buf, 7, 27, 255, 255, 255);
  setPixel(buf, 24, 28, 255, 255, 255);
  setPixel(buf, 12, 27, 255, 255, 255);
}

// ============================================================
// ACCESSORIES
// ============================================================

function drawAccBeanieRust(buf) {
  const [r, g, b] = hex('#c2410c');
  const [sr, sg, sb] = hex('#9a3412');
  const [lr, lg, lb] = hex('#ea580c');
  // Beanie on top of head
  fillRect(buf, 9, 0, 14, 1, r, g, b);
  fillRect(buf, 8, 1, 16, 3, r, g, b);
  // Ribbed brim
  fillRect(buf, 8, 4, 16, 2, sr, sg, sb);
  // Ribbing pattern
  for (let x = 8; x <= 23; x++) {
    if (x % 2 === 0) setPixel(buf, x, 4, lr, lg, lb);
    if (x % 2 === 1) setPixel(buf, x, 5, lr, lg, lb);
  }
}

function drawAccBandanaRed(buf) {
  const [r, g, b] = hex('#dc2626');
  const [sr, sg, sb] = hex('#991b1b');
  // Band across forehead (row 4-5)
  fillRect(buf, 9, 4, 14, 2, r, g, b);
  // Knot on right side
  fillRect(buf, 23, 4, 2, 2, sr, sg, sb);
  setPixel(buf, 25, 5, r, g, b); // tail 1
  setPixel(buf, 25, 6, r, g, b); // tail 2
  // White motif
  setPixel(buf, 15, 4, 255, 255, 255);
  setPixel(buf, 16, 5, 255, 255, 255);
}

function drawAccMaskSurgical(buf) {
  const [r, g, b] = hex('#bfdbfe');
  const [sr, sg, sb] = hex('#93c5fd');
  const [er, eg, eb] = hex('#e5e7eb');
  // Mask covering lower face (rows 9-13)
  fillRect(buf, 10, 9, 12, 4, r, g, b);
  // Fold line
  fillRect(buf, 10, 11, 12, 1, sr, sg, sb);
  // Elastic straps
  setPixel(buf, 9, 9, er, eg, eb);
  setPixel(buf, 22, 9, er, eg, eb);
  setPixel(buf, 9, 10, er, eg, eb);
  setPixel(buf, 22, 10, er, eg, eb);
}

function drawAccGlassesPixel(buf) {
  const [r, g, b] = hex('#0a0a14');
  // "Deal with it" pixel glasses
  // Left lens: 3x2 at (10,7)
  fillRect(buf, 10, 7, 4, 2, r, g, b);
  // Bridge: 1px at (14,7)
  setPixel(buf, 14, 7, r, g, b);
  setPixel(buf, 14, 8, r, g, b);
  // Right lens: 3x2 at (15,7)
  fillRect(buf, 15, 7, 4, 2, r, g, b);
  // Arms
  setPixel(buf, 9, 7, r, g, b);
  setPixel(buf, 8, 7, r, g, b);
  setPixel(buf, 19, 7, r, g, b);
  setPixel(buf, 20, 7, r, g, b);
  // Top edge (thicker frames)
  fillRect(buf, 10, 6, 9, 1, r, g, b);
}

function drawAccEarringGold(buf) {
  const [r, g, b] = hex('#fbbf24');
  const [sr, sg, sb] = hex('#d4a017');
  // Hoop on left ear (near x=8, y=8-10)
  setPixel(buf, 8, 7, r, g, b);
  setPixel(buf, 7, 8, r, g, b);
  setPixel(buf, 7, 9, sr, sg, sb);
  setPixel(buf, 8, 10, sr, sg, sb);
  setPixel(buf, 9, 9, r, g, b);
  // Reflet
  setPixel(buf, 8, 7, 255, 255, 255);
}

function drawAccCatEars(buf) {
  const [r, g, b] = hex('#1a1a2e');
  const [pr, pg, pb] = hex('#f472b6');
  // Left ear triangle at x=9-11, y=0-2
  setPixel(buf, 10, 0, r, g, b);
  setPixel(buf, 9, 1, r, g, b); setPixel(buf, 10, 1, pr, pg, pb); setPixel(buf, 11, 1, r, g, b);
  setPixel(buf, 8, 2, r, g, b); setPixel(buf, 9, 2, pr, pg, pb); setPixel(buf, 10, 2, pr, pg, pb); setPixel(buf, 11, 2, r, g, b); setPixel(buf, 12, 2, r, g, b);
  // Right ear triangle at x=20-22, y=0-2
  setPixel(buf, 21, 0, r, g, b);
  setPixel(buf, 20, 1, r, g, b); setPixel(buf, 21, 1, pr, pg, pb); setPixel(buf, 22, 1, r, g, b);
  setPixel(buf, 19, 2, r, g, b); setPixel(buf, 20, 2, pr, pg, pb); setPixel(buf, 21, 2, pr, pg, pb); setPixel(buf, 22, 2, r, g, b); setPixel(buf, 23, 2, r, g, b);
}

function drawAccHaloGolden(buf) {
  const [r, g, b] = hex('#fbbf24');
  const [lr, lg, lb] = hex('#fef3c7');
  // Halo floating above head (row 0, wide oval)
  fillRect(buf, 10, 0, 12, 1, r, g, b);
  // Center lighter
  fillRect(buf, 12, 0, 8, 1, lr, lg, lb);
  // Glow below
  for (let x = 10; x <= 21; x++) {
    setPixel(buf, x, 1, r, g, b, 77);
  }
}

function drawAccDevilHorns(buf) {
  const [r, g, b] = hex('#dc2626');
  const [lr, lg, lb] = hex('#fca5a5');
  const [sr, sg, sb] = hex('#991b1b');
  // Left horn (angled outward)
  setPixel(buf, 10, 1, sr, sg, sb);
  setPixel(buf, 9, 0, r, g, b);
  setPixel(buf, 8, 0, lr, lg, lb); // tip
  // Right horn
  setPixel(buf, 21, 1, sr, sg, sb);
  setPixel(buf, 22, 0, r, g, b);
  setPixel(buf, 23, 0, lr, lg, lb); // tip
}

function drawAccWingsPixel(buf) {
  const [r, g, b] = [255, 255, 255];
  const [sr, sg, sb] = hex('#e0e7ff');
  const [dr, dg, db] = hex('#c7d2fe');
  // Left wing (extending left from body)
  fillRect(buf, 1, 16, 4, 1, r, g, b);
  fillRect(buf, 0, 17, 5, 1, r, g, b);
  fillRect(buf, 0, 18, 5, 1, sr, sg, sb);
  fillRect(buf, 1, 19, 4, 1, sr, sg, sb);
  fillRect(buf, 2, 20, 3, 1, dr, dg, db);
  // Right wing
  fillRect(buf, 27, 16, 4, 1, r, g, b);
  fillRect(buf, 27, 17, 5, 1, r, g, b);
  fillRect(buf, 27, 18, 5, 1, sr, sg, sb);
  fillRect(buf, 27, 19, 4, 1, sr, sg, sb);
  fillRect(buf, 27, 20, 3, 1, dr, dg, db);
  // Glow
  setPixel(buf, 0, 16, r, g, b, 77);
  setPixel(buf, 31, 16, r, g, b, 77);
  setPixel(buf, 0, 19, r, g, b, 77);
  setPixel(buf, 31, 19, r, g, b, 77);
}

function drawAccCrownRoyal(buf) {
  const [r, g, b] = hex('#fbbf24');
  const [sr, sg, sb] = hex('#d4a017');
  const [rr, rg, rb] = hex('#dc2626');
  const [br, bg, bb] = hex('#3b82f6');
  const [gr, gg, gb] = hex('#22c55e');
  // Crown base
  fillRect(buf, 9, 2, 14, 1, sr, sg, sb);
  fillRect(buf, 9, 1, 14, 1, r, g, b);
  // Three points
  setPixel(buf, 11, 0, r, g, b); // left point
  setPixel(buf, 15, 0, r, g, b); // center point (taller)
  setPixel(buf, 16, 0, r, g, b);
  setPixel(buf, 20, 0, r, g, b); // right point
  // Gems at tips
  setPixel(buf, 11, 0, rr, rg, rb); // ruby
  setPixel(buf, 15, 0, br, bg, bb); // sapphire
  setPixel(buf, 20, 0, gr, gg, gb); // emerald
}

// ============================================================
// MAIN GENERATION
// ============================================================

async function main() {
  console.log('Generating new avatar sprites...\n');

  // --- Body (new skin tones) ---
  console.log('Body sprites:');
  const skinTones = [
    { name: 'porcelain', base: '#fdf2f8', shadow: '#fce7f3' },
    { name: 'olive', base: '#a3b18a', shadow: '#8a9a6e' },
    { name: 'golden', base: '#e5a95a', shadow: '#c48b3c' },
  ];
  for (const tone of skinTones) {
    const buf = createBuffer();
    drawBody(buf, tone.base, tone.shadow);
    await savePng(buf, path.join(SPRITES_DIR, 'body', `body-${tone.name}.png`));
  }

  // --- Eyes ---
  console.log('\nEyes sprites:');
  const eyeDrawers = {
    'wink': drawEyesWink,
    'cat': drawEyesCat,
    'star': drawEyesStar,
    'heart': drawEyesHeart,
    'cyber': drawEyesCyber,
    'void': drawEyesVoid,
  };
  for (const [name, drawFn] of Object.entries(eyeDrawers)) {
    const buf = createBuffer();
    drawFn(buf);
    await savePng(buf, path.join(SPRITES_DIR, 'eyes', `eyes-${name}.png`));
  }

  // --- Hair ---
  console.log('\nHair sprites:');
  const hairDrawers = {
    'mohawk-pink': drawHairMohawkPink,
    'twintails-purple': drawHairTwintailsPurple,
    'messy-ginger': drawHairMessyGinger,
    'bowl-teal': drawHairBowlTeal,
    'ponytail-blonde': drawHairPonytailBlonde,
    'curtains-silver': drawHairCurtainsSilver,
    'spiky-red': drawHairSpikyRed,
    'crown-braid-gold': drawHairCrownBraidGold,
  };
  for (const [name, drawFn] of Object.entries(hairDrawers)) {
    const buf = createBuffer();
    drawFn(buf);
    await savePng(buf, path.join(SPRITES_DIR, 'hair', `hair-${name}.png`));
  }

  // --- Tops ---
  console.log('\nTop sprites:');
  const topDrawers = {
    'tank-red': drawTopTankRed,
    'flannel-green': drawTopFlannelGreen,
    'crop-lilac': drawTopCropLilac,
    'varsity-navy': drawTopVarsityNavy,
    'kimono-sakura': drawTopKimonoSakura,
    'jersey-orange': drawTopJerseyOrange,
    'cape-royal': drawTopCapeRoyal,
    'hoodie-fire': drawTopHoodieFire,
  };
  for (const [name, drawFn] of Object.entries(topDrawers)) {
    const buf = createBuffer();
    drawFn(buf);
    await savePng(buf, path.join(SPRITES_DIR, 'top', `top-${name}.png`));
  }

  // --- Bottoms ---
  console.log('\nBottom sprites:');
  const bottomDrawers = {
    'shorts-white': drawBottomShortsWhite,
    'jogger-grey': drawBottomJoggerGrey,
    'skirt-plaid': drawBottomSkirtPlaid,
    'baggy-purple': drawBottomBaggyPurple,
    'hakama-black': drawBottomHakamaBlack,
    'royal-drape': drawBottomRoyalDrape,
  };
  for (const [name, drawFn] of Object.entries(bottomDrawers)) {
    const buf = createBuffer();
    drawFn(buf);
    await savePng(buf, path.join(SPRITES_DIR, 'bottom', `bottom-${name}.png`));
  }

  // --- Shoes ---
  console.log('\nShoes sprites:');
  const shoeDrawers = {
    'slides-blue': drawShoesSlidesBlue,
    'boots-combat': drawShoesBootsCombat,
    'platforms-pink': drawShoesPlatformsPink,
    'loafers-brown': drawShoesLoafersBrown,
    'roller-retro': drawShoesRollerRetro,
    'enchanted-glow': drawShoesEnchantedGlow,
  };
  for (const [name, drawFn] of Object.entries(shoeDrawers)) {
    const buf = createBuffer();
    drawFn(buf);
    await savePng(buf, path.join(SPRITES_DIR, 'shoes', `shoes-${name}.png`));
  }

  // --- Accessories ---
  console.log('\nAccessory sprites:');
  const accDrawers = {
    'beanie-rust': drawAccBeanieRust,
    'bandana-red': drawAccBandanaRed,
    'mask-surgical': drawAccMaskSurgical,
    'glasses-pixel': drawAccGlassesPixel,
    'earring-gold': drawAccEarringGold,
    'cat-ears': drawAccCatEars,
    'halo-golden': drawAccHaloGolden,
    'devil-horns': drawAccDevilHorns,
    'wings-pixel': drawAccWingsPixel,
    'crown-royal': drawAccCrownRoyal,
  };
  for (const [name, drawFn] of Object.entries(accDrawers)) {
    const buf = createBuffer();
    drawFn(buf);
    await savePng(buf, path.join(SPRITES_DIR, 'accessory', `acc-${name}.png`));
  }

  console.log('\nDone! Generated all sprites.');
}

main().catch(console.error);
