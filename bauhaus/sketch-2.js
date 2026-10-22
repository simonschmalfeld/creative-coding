function setup() {
  createCanvas(1080, 1350);
  background(254, 230, 196);

  let palette = [
    color(254, 230, 196),
    color(27, 128, 181),
    color(253, 174, 45),
    color(251, 47, 30),
  ];

  let cols = 12;
  let gap = 18;

  // Same gap between squares and around the edges
  let size = (width - (cols + 1) * gap) / cols;
  let rows = floor((height - gap) / (size + gap));
  // Center vertically, since the height rarely divides evenly
  let offsetY = (height - (rows * size + (rows - 1) * gap)) / 2;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      noStroke();
      fill(random(palette));
      square(gap + i * (size + gap), offsetY + j * (size + gap), size);
    }
  }
}
