let particles = [];
let noiseScale = 0.01;
let magnetStrength = 1.5;
let magnetRadius = 300;

// Face detection variables
let video;
let faceMesh;
let faces = [];
let faceX = 400; // default center
let faceY = 300;
let modelReady = false;
let facePoints = []; // Array to store multiple face attraction points

// Okinawa-inspired color palette
let colors = {
  ocean: [
    [26, 117, 159],   // deep ocean blue
    [52, 152, 219],   // bright ocean blue
    [64, 224, 208],   // turquoise
    [127, 255, 212]   // aquamarine
  ],
  coral: [
    [255, 127, 80],   // coral
    [255, 160, 122],  // light coral
    [255, 182, 193]   // pink coral
  ],
  sand: [
    [238, 232, 213],  // warm sand
    [245, 222, 179]   // wheat sand
  ],
  vegetation: [
    [34, 139, 34],    // forest green
    [60, 179, 113],   // sea green
    [144, 238, 144]   // light green
  ]
};

function setup() {
  createCanvas(800, 600);

  // Setup video capture
  video = createCapture(VIDEO);
  video.size(320, 240);
  video.hide();

  // Initialize face mesh with ml5.js v1 API
  faceMesh = ml5.faceMesh(video, modelLoaded);

  // Initialize particles
  for (let i = 0; i < 1000; i++) {
    let pos = createVector(random(width), random(height));
    // Assign each particle a color from the palette
    let colorCategory = random(['ocean', 'ocean', 'ocean', 'coral', 'sand', 'vegetation']);
    let colorArray = random(colors[colorCategory]);
    particles.push({
      pos: pos,
      color: color(colorArray[0], colorArray[1], colorArray[2])
    });
  }
  background(10, 15, 25); // deep ocean night
}

function modelLoaded() {
  console.log('FaceMesh model loaded!');
  modelReady = true;
  faceMesh.detectStart(video, gotFaces);
}

function gotFaces(results) {
  faces = results;

  // Update face position if face is detected
  if (faces && faces.length > 0) {
    // Get the nose position (keypoint 1) for center of face
    let nose = faces[0].keypoints[1];
    faceX = map(nose.x, 0, video.width, width, 0); // mirror horizontally
    faceY = map(nose.y, 0, video.height, 0, height);

    // Store multiple face points for attraction (sample every 5th keypoint for performance)
    facePoints = [];
    for (let i = 0; i < faces[0].keypoints.length; i += 5) {
      let kp = faces[0].keypoints[i];
      facePoints.push({
        x: map(kp.x, 0, video.width, width, 0), // mirror horizontally
        y: map(kp.y, 0, video.height, 0, height)
      });
    }
  }
}

function draw() {
  fill(10, 15, 25, 10);
  noStroke();
  rect(0, 0, width, height);

  // Show loading message if model isn't ready
  if (!modelReady) {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(20);
    text('Loading FaceMesh model...', width / 2, height / 2);
    return;
  }

  strokeWeight(1);

  for (let p of particles) {
    // Flow field movement
    let angle = noise(p.pos.x * noiseScale, p.pos.y * noiseScale, frameCount * 0.005) * TWO_PI * 2;
    let flowVel = createVector(cos(angle) * 0.5, sin(angle) * 0.5);

    // Magnetic attraction to closest face point
    if (facePoints.length > 0) {
      let closestDist = Infinity;
      let closestPoint = null;

      // Find the closest face point
      for (let fp of facePoints) {
        let d = dist(fp.x, fp.y, p.pos.x, p.pos.y);
        if (d < closestDist && d < magnetRadius) {
          closestDist = d;
          closestPoint = fp;
        }
      }

      // Apply magnetic force to closest point
      if (closestPoint) {
        let magnetForce = createVector(closestPoint.x - p.pos.x, closestPoint.y - p.pos.y);
        magnetForce.normalize();
        let strength = map(closestDist, 0, magnetRadius, magnetStrength, 0);
        magnetForce.mult(strength);
        flowVel.add(magnetForce);
      }
    }

    p.pos.x += flowVel.x;
    p.pos.y += flowVel.y;

    // Wrap around edges
    if (p.pos.x < 0) p.pos.x = width;
    if (p.pos.x > width) p.pos.x = 0;
    if (p.pos.y < 0) p.pos.y = height;
    if (p.pos.y > height) p.pos.y = 0;

    // Use particle's color with subtle alpha variation
    stroke(red(p.color), green(p.color), blue(p.color), 60 + noise(frameCount * 0.01, p.pos.x) * 40);
    point(p.pos.x, p.pos.y);
  }

  // Draw face silhouette
  if (faces.length > 0 && faces[0].keypoints) {
    noFill();
    stroke(255, 255, 255, 100);
    strokeWeight(2);

    // Draw face mesh as connected points
    beginShape();
    for (let i = 0; i < faces[0].keypoints.length; i += 3) {
      let kp = faces[0].keypoints[i];
      let x = map(kp.x, 0, video.width, width, 0); // mirror horizontally
      let y = map(kp.y, 0, video.height, 0, height);
      vertex(x, y);
    }
    endShape();

    // Draw individual keypoints for silhouette effect
    for (let kp of faces[0].keypoints) {
      let x = map(kp.x, 0, video.width, width, 0); // mirror horizontally
      let y = map(kp.y, 0, video.height, 0, height);
      noStroke();
      fill(255, 255, 255, 50);
      ellipse(x, y, 3, 3);
    }
  }
}