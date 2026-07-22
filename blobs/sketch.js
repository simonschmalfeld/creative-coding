let particles = [];

function setup() {
  createCanvas(450, 800);
  colorMode(HSB, 360, 100, 100, 255);
  for (let i = 0; i < 55; i++) {
    particles.push(newParticle(true));
  }
}

function newParticle(scattered) {
  let baseSize = random(28, 70);
  let numBlobs = floor(random(5, 11));
  let blobs = [];
  for (let i = 0; i < numBlobs; i++) {
    blobs.push({
      ox: random(-baseSize * 0.9, baseSize * 0.9),
      oy: random(-baseSize * 0.35, baseSize * 0.25),
      r: random(baseSize * 0.45, baseSize * 0.95),
    });
  }
  return {
    x: scattered ? random(-100, width + 100) : -180,
    y: scattered
      ? random(height * 0.05, height * 0.75)
      : random(height * 0.05, height * 0.72),
    baseSize,
    blobs,
    speed: random(0.18, 0.55),
    alpha: random(130, 210),
    wobble: random(1000),
    hue: random(360),
  };
}

function drawCloud(p) {
  noStroke();
  // shadow
  for (let b of p.blobs) {
    fill(p.hue, 50, 40, p.alpha * 0.4);
    circle(p.x + b.ox + 5, p.y + b.oy + 9, b.r * 2);
  }
  // colored body
  for (let b of p.blobs) {
    fill(p.hue, 75, 97, p.alpha);
    circle(p.x + b.ox, p.y + b.oy, b.r * 2);
  }
  // small specular highlight
  for (let b of p.blobs) {
    if (b.oy < 0) {
      fill(p.hue, 25, 100, p.alpha * 0.45);
      circle(p.x + b.ox - 3, p.y + b.oy - 4, b.r * 0.7);
    }
  }
}

function draw() {
  // sky gradient (HSB: soft blue top to hazy blue-white bottom)
  noStroke();
  for (let y = 0; y < height; y++) {
    let t = y / height;
    fill(lerp(210, 200, t), lerp(40, 20, t), lerp(90, 97, t));
    rect(0, y, width, 1);
  }

  for (let p of particles) {
    let flow = noise(p.x * 0.002, p.y * 0.002, frameCount * 0.0008) * TWO_PI;
    p.x += p.speed + cos(flow) * 0.25;
    p.y += sin(flow) * 0.18 + sin(frameCount * 0.007 + p.wobble) * 0.12;

    drawCloud(p);

    if (p.x > width + 200) {
      let np = newParticle(false);
      Object.assign(p, np);
    }
  }
}
