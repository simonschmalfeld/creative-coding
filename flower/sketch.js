p5.disableFriendlyErrors = true;

let img;
let bgColor = [0, 0, 0, 255];

const W          = 1048;
const H          = 1048;
const SPLIT      = 0.4;
const NOISE_SCALE = 0.100;
const MAX_DISP   = 1000;

// How many pixel rows to process per frame — raise if your machine is fast,
// lower if you still get watchdog errors.
const ROWS_PER_FRAME = 40;

let currentY = 0;   // which row we're up to
let splitX;
let ready = false;  // true once img is loaded and setup is done

function preload() {
  img = loadImage("https://studioeffektiv.com/1.jpg");
}

function setup() {
  createCanvas(W, H);
  pixelDensity(1);
  img.resize(W, H);
  img.loadPixels();
  splitX = floor(W * SPLIT);
  background(bgColor);
  loadPixels();
  ready = true;
  // loop() is on by default — draw() will chunk through rows each frame
}

function draw() {
  if (!ready) return;

  const endY = min(currentY + ROWS_PER_FRAME, H);

  for (let y = currentY; y < endY; y++) {
    for (let x = 0; x < W; x++) {
      const off = (y * W + x) * 4;
      const r = img.pixels[off];
      const g = img.pixels[off + 1];
      const b = img.pixels[off + 2];
      const a = img.pixels[off + 3];

      if (x <= splitX) {
        _setPixel(x, y, r, g, b, a);
      } else {
        const nx    = (x - splitX) / (W - splitX);
        const blend = nx * nx * (3 - 2 * nx);

        const n1 = noise(x * NOISE_SCALE, y * NOISE_SCALE);
        const n2 = noise(x * NOISE_SCALE * 2.5 + 17.3, y * NOISE_SCALE * 2.5 + 41.7);

        const baseAngle = -0.3;
        const spread    = PI * 0.9;
        const angle     = baseAngle + (n1 - 0.5) * spread + (n2 - 0.5) * spread * 0.35;
        const dist      = blend * MAX_DISP * (0.4 + n1 * 0.6);

        const dx    = x + cos(angle) * dist;
        const dy    = y + sin(angle) * dist;
        const alpha = a * (1 - blend);
        const sz    = max(1, round(blend * 3));

        _setBlock(dx, dy, sz, r, g, b, alpha);
      }
    }
  }

  updatePixels();
  currentY = endY;

  if (currentY >= H) {
    noLoop(); // done
  }
}

function _setBlock(cx, cy, sz, r, g, b, a) {
  const half = (sz - 1) / 2;
  const af   = constrain(a, 0, 255) / 255;
  const pr   = r * af + bgColor[0] * (1 - af);
  const pg   = g * af + bgColor[1] * (1 - af);
  const pb   = b * af + bgColor[2] * (1 - af);

  for (let ox = 0; ox < sz; ox++) {
    for (let oy = 0; oy < sz; oy++) {
      const px = (cx - half + ox) | 0;
      const py = (cy - half + oy) | 0;
      if (px < 0 || px >= W || py < 0 || py >= H) continue;
      const off = (py * W + px) * 4;
      if (pixels[off + 3] < 255 || af > 0.5) {
        pixels[off]     = pr;
        pixels[off + 1] = pg;
        pixels[off + 2] = pb;
        pixels[off + 3] = 255;
      }
    }
  }
}

function _setPixel(x, y, r, g, b, a) {
  x = x | 0;
  y = y | 0;
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const off = (y * W + x) * 4;
  const af  = constrain(a, 0, 255) / 255;
  pixels[off]     = r * af + bgColor[0] * (1 - af);
  pixels[off + 1] = g * af + bgColor[1] * (1 - af);
  pixels[off + 2] = b * af + bgColor[2] * (1 - af);
  pixels[off + 3] = 255;
}