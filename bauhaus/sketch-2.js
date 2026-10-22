let cols = 12;
let gap = 16;
let size, rows, offsetY;

let squares = [];
let occupied = []; // occupied[i][j] is true when a square owns that cell

function setup() {
  createCanvas(1080, 1350);

  let palette = [
    color(30, 70, 160),
    color(220, 70, 45),
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
      s.nextMove = frameCount + random(60, 300);
    }

    // Slide / spin towards the target with easing
    s.x = lerp(s.x, cellX(s.col), 0.1);
    s.y = lerp(s.y, cellY(s.row), 0.1);
    s.angle = lerp(s.angle, s.targetAngle, 0.1);

    push();
    translate(s.x + size / 2, s.y + size / 2);
    rotate(s.angle);
    fill(s.c);
    square(-size / 2, -size / 2, size);
    pop();
  }
}

function cellX(i) {
  return gap + i * (size + gap);
}

function cellY(j) {
  return offsetY + j * (size + gap);
}
