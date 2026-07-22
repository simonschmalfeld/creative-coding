// ─────────────────────────────────────────────
//  STAR TRAILS  —  static, paste into p5.js web editor
// ─────────────────────────────────────────────
const NUM_STARS = 500;
const ARC_STEPS = 500;
const ARC_SWEEP = 1.8;
const HUE_PALETTES = [
  [290, 320],  // hot pink / magenta
  [260, 285],  // electric violet
  [175, 200],  // neon cyan
  [320, 345],  // deep rose / fuchsia
  [15,  35],   // orange-coral accent
];
let starQueue = [];
let cx, cy;

function setup() {
  let s = 1024;
  createCanvas(s, s);
  colorMode(HSB, 360, 100, 100, 100);
  noLoop();

  cx = width  * 0.5;
  cy = height * 0.5;

  drawBackground();

  // build all star data upfront
  let maxR = min(cx, cy) * 1.4;
  for (let i = 0; i < NUM_STARS; i++) {
    let r          = random(28, maxR);
    let startAngle = random(TWO_PI);
    let sweep      = random(ARC_SWEEP * 0.4, ARC_SWEEP);
    let band       = random(HUE_PALETTES);
    let hue        = random(band[0], band[1]);
    let sat        = random() < 0.15 ? random(60, 85) : random(15, 50);
    let bri        = random(65, 100);
    let baseAlpha  = random(45, 92);
    let weight     = random(0.5, 1.8);
    let noiseOff   = random(1000);
    let gapFreq    = random(0.06, 0.22);
    let gapPhase   = random(TWO_PI);
    starQueue.push({ r, startAngle, sweep, hue, sat, bri, baseAlpha, weight, noiseOff, gapFreq, gapPhase });
  }

  drawNext();
}

function drawBackground() {
  noStroke();
  // radial gradient: bright-ish deep blue at centre → dark navy at edges
  // drawn as concentric filled circles, largest first
  let maxR = dist(0, 0, cx, cy); // corner distance = max radius needed
  let steps = 200;
  for (let i = steps; i >= 0; i--) {
    let t   = i / steps;          // 0 = centre, 1 = edge
    // hue: slight shift from indigo-blue centre toward cooler navy edge
    let h   = lerp(228, 238, t);
    // saturation: richer at centre (mild galactic glow), drier at edge
    let s   = lerp(45, 28, t);
    // brightness: lighter centre, very dark edge
    let b   = lerp(22, 7, t);
    fill(h, s, b);
    circle(cx, cy, (maxR * t) * 2);
  }

  // subtle horizontal band — lighter just above centre, mimicking
  // atmospheric glow / light pollution on the horizon of a dark sky
  for (let y = 0; y < height; y++) {
    // distance from centre row, normalised
    let dy   = abs(y - cy) / cy;          // 0 at centre row, 1 at top/bottom
    let glow = exp(-dy * dy * 6) * 0.55; // gaussian falloff
    // add a very faint warm tint band (aurora-ish)
    let glowH = 210;
    let glowS = 50;
    let glowB = 30;
    let glowA = glow * 100;
    if (glowA > 0.5) {
      stroke(glowH, glowS, glowB, glowA);
      strokeWeight(1);
      line(0, y, width, y);
    }
  }
  noStroke();
}

function draw() {} // intentionally empty — drawing happens in drawNext()

function drawNext() {
  if (starQueue.length === 0) return;
  drawStar(starQueue.shift());
  setTimeout(drawNext, 0);
}

function drawStar(st) {
  let { r, startAngle, sweep, hue, sat, bri, baseAlpha, weight, noiseOff, gapFreq, gapPhase } = st;

  // pre-compute arc points once
  let points  = [];
  let visible = [];
  for (let s = 0; s <= ARC_STEPS; s++) {
    let progress = s / ARC_STEPS;
    let angle    = startAngle + sweep * progress;
    let dr = (noise(noiseOff + progress * 2) - 0.5) * 3;
    let x  = cx + (r + dr) * cos(angle);
    let y  = cy + (r + dr) * sin(angle);
    let gapVal = sin(angle / gapFreq + gapPhase);
    points.push({ x, y, progress });
    visible.push(gapVal >= -0.3);
  }

  // 3 passes: outer glow, mid haze, sharp core
  let passes = [
    [6.0, 0.08, 0.4],
    [2.5, 0.22, 0.7],
    [1.0, 1.00, 1.0],
  ];

  for (let [wMult, aMult, sMult] of passes) {
    let px, py, prevVisible = false;
    for (let s = 0; s <= ARC_STEPS; s++) {
      if (!visible[s]) { prevVisible = false; continue; }
      let { x, y, progress } = points[s];
      let a = baseAlpha * pow(progress, 0.6) * aMult;
      let w = weight * (0.3 + progress * 0.7) * wMult;
      if (prevVisible) {
        stroke(hue, sat * sMult, bri, a);
        strokeWeight(w);
        line(px, py, x, y);
      }
      px = x; py = y;
      prevVisible = true;
    }
  }
}