// noprotect

let recording = false;
let recordFrame = 0;
let recordFrames = 450; // 10s at 30fps
let completedCount = 0;
let dirHandle = null;

let rectDims = [50, 400];
let nPatches = 7;
let margin = 20;
// sketch.js used 1000 iterations to fully bloom a 1000x1000 canvas (1M px);
// this canvas is ~2x the area, so scale the initial burst to match density
let bloomIterations = 2100;
let itersPerFrame = 6; // ongoing paint per frame that trails behind each moving patch
let reshuffleEvery = 400; // frames between patches getting fresh colors/velocities
let driftSpeed = [5, 15]; // px/frame range each patch sweeps across the canvas

let colorsTop = [
  [90, 30, 160], // dark purple
  [130, 200, 240], // light blue
  [180, 150, 230], // pastel purple
  [240, 110, 20], // strong orange
  [160, 215, 250], // sky blue
];

let colorsBottom = [
  [170, 225, 255], // very light blue
  [200, 80, 10], // deep orange
  [200, 170, 245], // lavender
  [255, 155, 60], // bright orange
  [110, 150, 235], // medium blue
];

let patchesTop = [];
let patchesBottom = [];
let noiseLayer;
let frameCounter = 0;

function setup() {
  createCanvas(1080, 1920);
  noStroke();
  rectMode(CENTER);
  pixelDensity(2);
  frameRate(30);
  background(255);

  makePatches();
  paintBatch(bloomIterations);
  noiseLayer = makeNoiseLayer();
  blendMode(BLEND);
  image(noiseLayer, 0, 0, width, height);
}

async function keyPressed() {
  if (key === "s" || key === "S") {
    if (!dirHandle) {
      dirHandle = await window.showDirectoryPicker({ mode: "readwrite" });
    }
    recording = true;
    recordFrame = 0;
    completedCount = 0;
  }
}

// same column-patch layout as sketch.js: each patch owns a vertical band of x
// and paints across nearly the full height, so colors blend into gradients
// per column instead of sitting as discrete rectangles
function makePatches() {
  patchesTop = [];
  patchesBottom = [];
  for (let i = 0; i < nPatches; i++) {
    patchesTop.push({
      xRange: [
        random((width / nPatches) * i - margin, (width / nPatches) * i + margin),
        random(
          (width / nPatches) * (i + 1) + margin,
          (width / nPatches) * (i + 1) + 100,
        ),
      ],
      yRange: [random(-margin, margin), random(height - margin, height + margin)],
      color: random(colorsTop),
      vx: randomVelocity(),
      vy: randomVelocity(),
    });
    patchesBottom.push({
      xRange: [
        random((width / nPatches) * i - margin, (width / nPatches) * i + margin),
        random(
          (width / nPatches) * (i + 1) - margin,
          (width / nPatches) * (i + 1) + margin,
        ),
      ],
      yRange: [random(-margin, margin), random(height - margin, height + margin)],
      color: random(colorsBottom),
      vx: randomVelocity(),
      vy: randomVelocity(),
    });
  }
}

function randomVelocity() {
  return random(driftSpeed[0], driftSpeed[1]) * (random() < 0.5 ? -1 : 1);
}

// slide a patch's band across the canvas and bounce it back once it drifts
// well past the edge, so the sweep keeps going instead of painting off-screen
function movePatch(patch) {
  patch.xRange[0] += patch.vx;
  patch.xRange[1] += patch.vx;
  patch.yRange[0] += patch.vy;
  patch.yRange[1] += patch.vy;

  if (patch.xRange[0] < -300 || patch.xRange[1] > width + 300) {
    patch.vx *= -1;
  }
  if (patch.yRange[0] < -300 || patch.yRange[1] > height + 300) {
    patch.vy *= -1;
  }
}

// fine white/black grain, generated once per graphics buffer and composited
// as a single image() draw instead of one rect() per pixel (too slow live)
function makeNoiseLayer() {
  const g = createGraphics(width, height);
  g.pixelDensity(1);
  g.loadPixels();
  for (let i = 0; i < g.pixels.length; i += 4) {
    const isLight = random() > 0.6;
    g.pixels[i] = isLight ? 255 : 0;
    g.pixels[i + 1] = isLight ? 255 : 0;
    g.pixels[i + 2] = isLight ? 255 : 0;
    g.pixels[i + 3] = isLight ? 15 : 5;
  }
  g.updatePixels();
  return g;
}

function draw() {
  for (let k = 0; k < nPatches; k++) {
    movePatch(patchesTop[k]);
    movePatch(patchesBottom[k]);
  }
  paintBatch(itersPerFrame);

  frameCounter++;
  if (frameCounter % reshuffleEvery === 0) {
    makePatches();
    blendMode(BLEND);
    image(noiseLayer, 0, 0, width, height);
  }

  if (recording) {
    const idx = recordFrame;
    canvas.toBlob(async (blob) => {
      const fileHandle = await dirHandle.getFileHandle(
        "frame_" + nf(idx, 4) + ".png",
        { create: true },
      );
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      completedCount++;
      if (completedCount === recordFrames) {
        console.log("Recording complete:", recordFrames, "frames written");
      }
    }, "image/png");
    recordFrame++;
    if (recordFrame >= recordFrames) {
      recording = false;
    }
  }
}

function paintBatch(iterations) {
  for (let j = 0; j < iterations; j++) {
    for (let k = 0; k < nPatches; k++) {
      paintPatchRect(patchesTop[k]);
      if (random() < 0.75) {
        paintPatchRect(patchesBottom[k]);
      }
    }
  }
}

function paintPatchRect(patch) {
  blendMode(random() < 0.5 ? HARD_LIGHT : BLEND);
  const c = patch.color;
  fill(c[0], c[1], c[2], random(0, 6));
  rect(
    random(patch.xRange[0], patch.xRange[1]),
    random(patch.yRange[0], patch.yRange[1]),
    random(rectDims[0], rectDims[1]),
    random(rectDims[0], rectDims[1]),
  );
}
