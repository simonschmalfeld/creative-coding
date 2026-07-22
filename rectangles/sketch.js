// noprotect
c = 0;

function setup() {
  createCanvas(1000, 1000);
  background(255);
  noStroke();
  rectMode(CENTER);
  pixelDensity(4);

  rect_dims = [50, 400];
  n_patches = 7;
  rect_locations_top = [];
  rect_locations_bottom = [];
  m = 20;

  colors = [
    [90, 30, 160], // dark purple
    [130, 200, 240], // light blue
    [180, 150, 230], // pastel purple
    [240, 110, 20], // strong orange
    [160, 215, 250], // sky blue
  ];

  colors2 = [
    [170, 225, 255], // very light blue
    [200, 80, 10], // deep orange
    [200, 170, 245], // lavender
    [255, 155, 60], // bright orange
    [110, 150, 235], // medium blue
  ];

  for (i = 0; i < n_patches; i++) {
    rect_locations_top.push([
      [
        random((width / n_patches) * i - m, (width / n_patches) * i + m),
        random(
          (width / n_patches) * (i + 1) + m,
          (width / n_patches) * (i + 1) + 100,
        ),
      ],
      [random(-m, m), random(height - m, height + m)],
    ]);
    rect_locations_bottom.push([
      [
        random((width / n_patches) * i - m, (width / n_patches) * i + m),
        random(
          (width / n_patches) * (i + 1) - m,
          (width / n_patches) * (i + 1) + m,
        ),
      ],
      [random(-m, m), random(height - m, height + m)],
    ]);
  }

  for (j = 0; j < 1000; j++) {
    for (k = 0; k < n_patches; k++) {
      draw_rect(
        colors[k % colors.length],
        rect_locations_top[k][0],
        rect_locations_top[k][1],
      );
      if (random() < 0.75) {
        draw_rect(
          colors2[k % colors.length],
          rect_locations_bottom[k][0],
          rect_locations_bottom[k][1],
        );
      }
    }
  }

  // noise on top
  // blendMode(BLEND);
  // w = 1;
  // for (i = 0; i < height; i += w) {
  //   for (j = 0; j < width; j += w) {
  //     n = random();
  //     if (n > 0.6) {
  //       fill(255, 255, 255, 15);
  //     } else {
  //       fill(0, 0, 0, 5);
  //     }
  //     rect(j, i, w, w);
  //   }
  // }

  noLoop();
}

function draw_rect(color, x, y) {
  r = random();
  if (r < 0.5) {
    blendMode(HARD_LIGHT);
  } else {
    blendMode(BLEND);
  }
  fill(color[0], color[1], color[2]);
  // fill(color[0], color[1], color[2], random(0, 6));
  rect(
    random(x[0], x[1]),
    random(y[0], y[1]),
    random(rect_dims[0], rect_dims[1]),
    random(rect_dims[0], rect_dims[1]),
  );
}
