function setup() {
  createCanvas(1080, 1350);
}

function draw() {
  background(233, 225, 212);

  fill('#000000');
  textFont('Staatliches');
  textSize(80);
  textAlign(CENTER, CENTER);

  text("BAUHAUS", 540, 90);
  textSize(28);
  text("Made with p5.js", 540, 1268);

  strokeWeight(0);

  fill(205, 81, 56);
  rect(40, 175, 1000, 500);

  fill(239,172,70);
  circle(540, 675, 750);

  let x = 675;
  fill(36, 34, 35);
  rect(40, x + 50, 1000, 50);
  rect(40, x + 150, 1000, 50);
  rect(40, x + 250, 1000, 50);
  rect(40, x + 350, 1000, 50);
  rect(40, x + 450, 1000, 50);
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('bauhaus', 'png');
  }
}
