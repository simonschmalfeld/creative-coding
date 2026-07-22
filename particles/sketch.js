let particles = [];
let edges = [];
let pulses = [];
let clusters = [];

const palette = [
  '#FF6B6B', // coral
  '#FFD93D', // yellow
  '#6BCB77', // green
  '#4D96FF', // blue
  '#B983FF'  // purple
];

class Particle {
  constructor(x, y, hub = false, particleColor = null) {
    this.x = x;
    this.y = y;

    this.hub = hub;

    this.r = hub
      ? random(5, 10)
      : random(3, 7);

    this.color = particleColor || color(random(palette));
  }

  draw() {

    noStroke();

    // glow
    fill(
      red(this.color),
      green(this.color),
      blue(this.color),
      this.hub ? 35 : 20
    );

    circle(
      this.x,
      this.y,
      this.r * (this.hub ? 5 : 3)
    );

    // core
    fill(this.color);
    circle(this.x, this.y, this.r);
  }
}

class Pulse {
  constructor(edge) {
    this.edge = edge;
    this.t = 0;
    this.speed = random(0.005, 0.015);
  }

  update() {
    this.t += this.speed;
  }

  draw() {

    let x = lerp(
      this.edge.a.x,
      this.edge.b.x,
      this.t
    );

    let y = lerp(
      this.edge.a.y,
      this.edge.b.y,
      this.t
    );

    noStroke();
    fill(255, 220);
    circle(x, y, 4);
  }

  isDead() {
    return this.t >= 1;
  }
}

function setup() {

  createCanvas(windowWidth, windowHeight);

  generateClusters();
  buildNetwork();
}

function generateClusters() {

  const clusterCount = 12;

  for (let c = 0; c < clusterCount; c++) {

    let cx = random(width * 0.15, width * 0.85);
    let cy = random(height * 0.15, height * 0.85);

    let clusterColor = color(random(palette));

    clusters.push({
      x: cx,
      y: cy,
      color: clusterColor,
      radius: random(140, 240)
    });

    // Hub node
    particles.push(
      new Particle(
        cx,
        cy,
        true,
        clusterColor
      )
    );

    // Surrounding nodes
    for (let i = 0; i < 20; i++) {

      let x = randomGaussian(cx, 70);
      let y = randomGaussian(cy, 70);

      particles.push(
        new Particle(
          x,
          y,
          false,
          clusterColor
        )
      );
    }
  }
}

function buildNetwork() {

  for (let p of particles) {

    let neighbors = particles
      .filter(n => n !== p)
      .sort((a, b) => {

        let da = dist(
          p.x,
          p.y,
          a.x,
          a.y
        );

        let db = dist(
          p.x,
          p.y,
          b.x,
          b.y
        );

        return da - db;
      })
      .slice(0, 3);

    for (let n of neighbors) {

      edges.push({
        a: p,
        b: n
      });
    }
  }
}

function drawBackground() {

  let ctx = drawingContext;

  let grad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    0,
    width / 2,
    height / 2,
    width
  );

  grad.addColorStop(0, "#121A30");
  grad.addColorStop(1, "#05070F");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

function drawClusterAuras() {

  noStroke();

  blendMode(ADD);

  for (let cluster of clusters) {

    for (let i = 5; i > 0; i--) {

      fill(
        red(cluster.color),
        green(cluster.color),
        blue(cluster.color),
        5
      );

      circle(
        cluster.x,
        cluster.y,
        cluster.radius * i * 0.6
      );
    }
  }

  blendMode(BLEND);
}

function draw() {

  drawBackground();

  // Colored nebula layer
  drawClusterAuras();

  // Network lines
  strokeWeight(1);

  for (let e of edges) {

    let d = dist(
      e.a.x,
      e.a.y,
      e.b.x,
      e.b.y
    );

    let alpha = map(
      d,
      0,
      150,
      80,
      10
    );

    stroke(180, 200, 255, alpha);

    line(
      e.a.x,
      e.a.y,
      e.b.x,
      e.b.y
    );
  }

  // Nodes
  blendMode(ADD);

  for (let p of particles) {
    p.draw();
  }

  blendMode(BLEND);

  // Pulses
  if (
    frameCount % 20 === 0 &&
    random() < 0.7
  ) {
    pulses.push(
      new Pulse(random(edges))
    );
  }

  for (
    let i = pulses.length - 1;
    i >= 0;
    i--
  ) {

    pulses[i].update();
    pulses[i].draw();

    if (pulses[i].isDead()) {
      pulses.splice(i, 1);
    }
  }
}

function windowResized() {

  resizeCanvas(
    windowWidth,
    windowHeight
  );

  particles = [];
  edges = [];
  clusters = [];

  generateClusters();
  buildNetwork();
}