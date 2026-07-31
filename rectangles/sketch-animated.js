// noprotect

let rects = [];
let numRects = 120;

let colors = [
  [130, 0, 220], // vivid purple
  [0, 160, 255], // electric blue
  [190, 0, 255], // magenta purple
  [255, 80, 0], // vivid orange
  [0, 210, 255], // cyan blue
  [0, 255, 200], // vivid teal
  [255, 40, 0], // hot red-orange
  [220, 0, 200], // hot magenta
  [255, 170, 0], // vivid amber
  [40, 60, 255], // saturated blue
];

function setup() {
  createCanvas(1080, 1920);
  strokeWeight(8);
  rectMode(CENTER);
  pixelDensity(2);

  for (let i = 0; i < numRects; i++) {
    rects.push(makeRect());
  }
}

function makeRect(x, y) {
  return {
    x: x !== undefined ? x : random(width),
    y: y !== undefined ? y : random(height),
    // vx: random(-1.5, 1.5),
    // vy: random(-1.5, 1.5),
    w: random(40, 300),
    h: random(40, 300),
    color: color(random(colors)),
    targetColor: color(random(colors)),
    retargetIn: random(10, 40),
  };
}

function draw() {
  background(0);

  for (let r of rects) {
    updateRect(r);
    drawRect(r);
  }
}

function updateRect(r) {
  // // float around
  // r.x += r.vx;
  // r.y += r.vy;

  // // wrap around edges so they keep floating
  // const pad = 200;
  // if (r.x < -pad) r.x = width + pad;
  // if (r.x > width + pad) r.x = -pad;
  // if (r.y < -pad) r.y = height + pad;
  // if (r.y > height + pad) r.y = -pad;

  // // occasionally nudge the drift direction
  // if (random() < 0.01) {
  //   r.vx += random(-0.3, 0.3);
  //   r.vy += random(-0.3, 0.3);
  //   r.vx = constrain(r.vx, -2, 2);
  //   r.vy = constrain(r.vy, -2, 2);
  // }

  // morph color toward its target
  // r.color = lerpColor(r.color, r.targetColor, 0.03);

  // periodically respawn with a new size in place
  r.retargetIn -= 1;
  if (r.retargetIn <= 0) {
    r.w = random(40, 300);
    r.h = random(40, 300);
    r.targetColor = color(random(colors));
    r.retargetIn = random(10, 40);
  }
}

function drawRect(r) {
  fill(r.color);
  stroke(color(255));
  rect(r.x, r.y, r.w, r.h);
}
