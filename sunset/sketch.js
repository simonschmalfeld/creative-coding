const stops = [
  [0, [10, 30, 80]],
  [0.45, [30, 50, 110]],
  [0.65, [120, 80, 90]],
  [0.8, [220, 140, 90]],
  [0.9, [240, 100, 40]],
  [1.0, [210, 50, 10]],
];

function colorAt(t) {
  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, c0] = stops[i];
    const [t1, c1] = stops[i + 1];
    if (t >= t0 && t <= t1) {
      const u = (t - t0) / (t1 - t0);
      return c0.map((v, j) => v + (c1[j] - v) * u);
    }
  }
  return stops[stops.length - 1][1];
}

function setup() {
  createCanvas(1040, 1040);

  // noise on top
  w = 1;
  for (i = 0; i < height; i += w) {
    for (j = 0; j < width; j += w) {
      n = random();
      if (n > 0.6) {
        fill(255, 255, 255, 15);
      } else {
        fill(0, 0, 0, 15);
      }
      rect(i, j, w);
    }
  }
  
  noLoop();
}

function draw() {
  drawingContext.shadowBlur = 48;
  drawingContext.shadowColor = color(207, 7, 99);

  const step = 24; // increase for chunkier lines
  for (let y = 0; y < height; y += step) {
    const [r, g, b] = colorAt(y / height);
    stroke(r, g, b);
    strokeWeight(step);
    line(0, y, width, y);
  }
}
