let cols = 12;
let gap = 16;
let size, rows, offsetY;

let squares = [];
let occupied = []; // occupied[i][j] is true when a square owns that cell

function setup() {
  createCanvas(1080, 1350);

  let palette = [
    color(30, 70, 160),
    color(214, 74, 50),
    color(239, 172, 70),
    color(30, 28, 30),
  ];

  // Same gap between squares and around the edges
  size = (width - (cols + 1) * gap) / cols;
  rows = floor((height - gap) / (size + gap));
  // Center vertically, since the height rarely divides evenly
  offsetY = (height - (rows * size + (rows - 1) * gap)) / 2;

  for (let i = 0; i < cols; i++) {
    occupied[i] = [];
    for (let j = 0; j < rows; j++) {
      // Leave some cells empty so squares have somewhere to move to
      if (random() < 0.25) continue;
      occupied[i][j] = true;
      squares.push({
        col: i,
        row: j,
        x: cellX(i),
        y: cellY(j),
        c: random(palette),
        angle: 0,
        targetAngle: 0,
        radius: 0, // 0 = square, 1 = circle
        targetRadius: 0,
        nextMove: random(60, 300),
      });
    }
  }
}

function draw() {
  background(236, 228, 210);
  noStroke();

  for (let s of squares) {
    if (frameCount > s.nextMove) {
      // Only the directly neighbouring cells (up, down, left, right) that are free
      let free = [];
      for (let [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        let i = s.col + di;
        let j = s.row + dj;
        if (i >= 0 && i < cols && j >= 0 && j < rows && !occupied[i][j]) {
          free.push([i, j]);
        }
      }
      if (free.length > 0) {
        let [i, j] = random(free);
        occupied[s.col][s.row] = false;
        occupied[i][j] = true;
        s.col = i;
        s.row = j;
      } else if (random() < 0.5) {
        // Boxed in: sometimes do a quarter turn instead
        s.targetAngle += random([HALF_PI, -HALF_PI]);
      }
      // Sometimes morph between square and circle
      if (random() < 0.3) s.targetRadius = 1 - s.targetRadius;
      s.nextMove = frameCount + random(60, 300);
    }

    // Slide / spin towards the target with easing
    s.x = lerp(s.x, cellX(s.col), 0.1);
    s.y = lerp(s.y, cellY(s.row), 0.1);
    s.angle = lerp(s.angle, s.targetAngle, 0.1);
    s.radius = lerp(s.radius, s.targetRadius, 0.1);

    push();
    translate(s.x + size / 2, s.y + size / 2);
    rotate(s.angle);
    fill(s.c);
    // Corner radius of half the size turns the square into a circle
    square(-size / 2, -size / 2, size, s.radius * size / 2);
    pop();
  }
}

// Press R to record a 10 second clip of the canvas (downloads a .webm)
function keyPressed() {
  if (key === 'r' || key === 'R') {
    let stream = document.querySelector('canvas').captureStream(60);
    let recorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm',
      videoBitsPerSecond: 25_000_000, // high bitrate so flat colours stay crisp
    });
    let chunks = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      let a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob(chunks, { type: 'video/webm' }));
      a.download = 'bauhaus.webm';
      a.click();
    };
    recorder.start();
    setTimeout(() => recorder.stop(), 10000);
  }
}

function cellX(i) {
  return gap + i * (size + gap);
}

function cellY(j) {
  return offsetY + j * (size + gap);
}
