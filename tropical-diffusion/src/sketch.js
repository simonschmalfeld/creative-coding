// src/sketch.js
// Okinawa Tropical Flora Generator
// Using p5.js instance mode with npm/Vite + Stable Diffusion AI textures

import p5 from 'p5';
import { replicateService } from './replicateService.js';

const sketch = (p) => {
  let flowers = [];
  let flowerTypes = ['hibiscus', 'plumeria', 'bougainvillea'];
  let flowFieldMode = false;
  let aiTexturesEnabled = false;
  let aiServiceReady = false;
  let toggleButton;
  let aiToggleButton;

  p.setup = async () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.background(245, 240, 230); // Soft cream background

    // Initialize Replicate service
    aiServiceReady = await replicateService.initialize();

    // Create flow field toggle button
    toggleButton = p.createButton('Flow Field: OFF');
    toggleButton.position(p.windowWidth - 160, 20);
    toggleButton.mousePressed(() => {
      flowFieldMode = !flowFieldMode;
      toggleButton.html(flowFieldMode ? 'Flow Field: ON' : 'Flow Field: OFF');
    });
    toggleButton.style('padding', '10px 15px');
    toggleButton.style('background-color', '#fff');
    toggleButton.style('border', '2px solid #333');
    toggleButton.style('border-radius', '5px');
    toggleButton.style('cursor', 'pointer');
    toggleButton.style('font-family', 'sans-serif');
    toggleButton.style('font-size', '14px');

    // Create AI texture toggle button
    aiToggleButton = p.createButton(aiServiceReady ? 'AI Textures: OFF' : 'AI: Not Available');
    aiToggleButton.position(p.windowWidth - 340, 20);
    aiToggleButton.mousePressed(() => {
      if (aiServiceReady) {
        aiTexturesEnabled = !aiTexturesEnabled;
        aiToggleButton.html(aiTexturesEnabled ? 'AI Textures: ON' : 'AI Textures: OFF');
      }
    });
    aiToggleButton.style('padding', '10px 15px');
    aiToggleButton.style('background-color', aiServiceReady ? '#fff' : '#ddd');
    aiToggleButton.style('border', '2px solid #333');
    aiToggleButton.style('border-radius', '5px');
    aiToggleButton.style('cursor', aiServiceReady ? 'pointer' : 'not-allowed');
    aiToggleButton.style('font-family', 'sans-serif');
    aiToggleButton.style('font-size', '14px');
  };

  p.draw = () => {
    // Don't clear - let flowers persist

    // Draw all flowers
    for (let flower of flowers) {
      flower.display(p);
    }
  };

  // Plant a single flower on click (not continuous)
  p.mousePressed = () => {
    let type = p.random(flowerTypes);
    let newFlower = new Flower(p, p.mouseX, p.mouseY, type, flowFieldMode, aiTexturesEnabled, aiServiceReady);
    flowers.push(newFlower);
    return false; // Prevent default behavior
  };

  p.keyPressed = () => {
    if (p.key === 'c' || p.key === 'C') {
      // Clear canvas
      flowers = [];
      p.background(245, 240, 230);
    }

    if (p.key === 's' || p.key === 'S') {
      // Save image
      p.saveCanvas('floral-diffusion', 'png');
    }

    if (p.key === 'd' || p.key === 'D') {
      // Debug: show cache stats
      console.log('=== CACHE STATS ===');
      console.log('Cache size:', replicateService.getCacheSize());
      console.log('Cache entries:', Array.from(replicateService.cache.keys()));
      console.log('==================');
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    toggleButton.position(p.windowWidth - 160, 20);
    aiToggleButton.position(p.windowWidth - 340, 20);
  };

  // Flower class
  class Flower {
    constructor(p, x, y, type, useFlowField = false, useAITextures = false, aiReady = false) {
      this.p = p; // Store p5 instance reference
      this.x = x;
      this.y = y;
      this.type = type;
      this.size = p.random(40, 80);
      this.rotation = p.random(p.TWO_PI);
      this.color = this.getColor();
      this.petalCount = this.getPetalCount();

      // Growth animation
      this.growthProgress = 0;
      this.targetSize = this.size;
      this.size = 0;

      // Flow field stem
      this.useFlowField = useFlowField;
      this.stemPoints = [];

      if (this.useFlowField) {
        this.generateFlowFieldStem(p, x, y);
      }

      // AI texture integration
      this.useAITextures = useAITextures && aiReady;
      this.aiTexture = null;
      this.isLoadingTexture = false;
      this.textureOpacity = 0;
      this.textureLoadDelay = 120; // 2 seconds at 60fps
      this.framesSinceCreation = 0;

      // Start loading AI texture if enabled
      if (this.useAITextures) {
        this.loadAITexture();
      }
    }

    generateFlowFieldStem(p, x, startY) {
      let growthSteps = p.floor(p.random(30, 60));
      let stepSize = p.random(3, 6);
      let currentPos = p.createVector(x, startY);

      this.stemPoints.push(currentPos.copy());

      for (let i = 0; i < growthSteps; i++) {
        let noiseVal = p.noise(currentPos.x * 0.01, currentPos.y * 0.01, p.frameCount * 0.01);
        let angle = p.map(noiseVal, 0, 1, -p.PI/4, p.PI/4);

        currentPos.x += p.cos(angle) * stepSize;
        currentPos.y -= stepSize; // grows upward
        this.stemPoints.push(currentPos.copy());
      }

      // Update flower position to be at the end of the stem
      this.x = currentPos.x;
      this.y = currentPos.y;
    }

    getColor() {
      const p = this.p;
      // Okinawa-specific color palettes
      let palettes = {
        hibiscus: [
          p.color(220, 20, 60),   // Crimson
          p.color(255, 105, 180), // Hot pink
          p.color(255, 165, 0)    // Orange
        ],
        plumeria: [
          p.color(255, 250, 240), // Cream white
          p.color(255, 228, 181), // Soft peach
          p.color(255, 218, 185)  // Peachy
        ],
        bougainvillea: [
          p.color(219, 39, 119),  // Magenta
          p.color(236, 64, 122),  // Pink
          p.color(255, 87, 51)    // Coral red
        ]
      };

      return p.random(palettes[this.type]);
    }

    getPetalCount() {
      let counts = {
        hibiscus: 5,
        plumeria: 5,
        bougainvillea: 3
      };
      return counts[this.type];
    }

    async loadAITexture() {
      if (this.isLoadingTexture || this.aiTexture) return;

      this.isLoadingTexture = true;

      try {
        const colorDescription = replicateService.getColorDescription(this.color);
        const imageUrl = await replicateService.generateFlowerTexture(this.type, colorDescription);

        // Load the image into p5
        this.p.loadImage(imageUrl, (img) => {
          this.aiTexture = img;
          this.isLoadingTexture = false;
          console.log(`AI texture loaded for ${this.type}`);
        }, (err) => {
          console.error('Failed to load AI texture:', err);
          this.isLoadingTexture = false;
        });
      } catch (error) {
        console.error('Error generating AI texture:', error);
        this.isLoadingTexture = false;
      }
    }

    display(p) {
      // Animate growth
      if (this.growthProgress < 1) {
        this.growthProgress += 0.05;
        this.size = this.targetSize * this.easeOutElastic(this.growthProgress);
      }

      // Track frames for texture delay
      this.framesSinceCreation++;

      // Draw flow field stem if enabled
      if (this.useFlowField && this.stemPoints.length > 0) {
        p.push();
        p.stroke(100, 150, 80, 150);
        p.strokeWeight(2);
        p.noFill();

        p.beginShape();
        for (let point of this.stemPoints) {
          p.vertex(point.x, point.y);
        }
        p.endShape();
        p.pop();
      }

      p.push();
      p.translate(this.x, this.y);
      p.rotate(this.rotation);

      // Hybrid rendering: procedural → AI texture fade-in with masking
      if (this.useAITextures && this.aiTexture && this.framesSinceCreation > this.textureLoadDelay) {
        // Fade in AI texture
        if (this.textureOpacity < 1) {
          this.textureOpacity += 0.02;
        }

        // Create an off-screen graphics buffer for masking
        if (!this.maskGraphics) {
          this.maskGraphics = p.createGraphics(this.size * 3, this.size * 3);
        }

        // Draw the procedural flower shape as a mask (white on black)
        this.maskGraphics.push();
        this.maskGraphics.translate(this.size * 1.5, this.size * 1.5);
        this.maskGraphics.background(0); // Black background
        this.maskGraphics.fill(255); // White fill for mask
        this.maskGraphics.noStroke();

        // Draw flower shape on mask
        if (this.type === 'hibiscus') {
          this.drawHibiscusMask(this.maskGraphics, p);
        } else if (this.type === 'plumeria') {
          this.drawPlumeriaMask(this.maskGraphics, p);
        } else if (this.type === 'bougainvillea') {
          this.drawBougainvilleaMask(this.maskGraphics, p);
        }
        this.maskGraphics.pop();

        // Apply mask to AI texture
        let maskedTexture = this.aiTexture.get();
        maskedTexture.mask(this.maskGraphics);

        // Draw procedural flower (fading out)
        p.push();
        p.drawingContext.globalAlpha = 1 - this.textureOpacity;
        this.drawProceduralFlower(p);
        p.pop();

        // Draw masked AI texture (fading in)
        p.push();
        p.imageMode(p.CENTER);
        p.drawingContext.globalAlpha = this.textureOpacity;
        p.image(maskedTexture, 0, 0, this.size * 2, this.size * 2);
        p.pop();
      } else {
        // Draw procedural flower
        this.drawProceduralFlower(p);
      }

      p.pop();
    }

    drawProceduralFlower(p) {
      // Draw based on type
      if (this.type === 'hibiscus') {
        this.drawHibiscus(p);
      } else if (this.type === 'plumeria') {
        this.drawPlumeria(p);
      } else if (this.type === 'bougainvillea') {
        this.drawBougainvillea(p);
      }
    }

    drawHibiscus(p) {
      // 5 overlapping petals
      for (let i = 0; i < this.petalCount; i++) {
        let angle = (p.TWO_PI / this.petalCount) * i;

        p.push();
        p.rotate(angle);

        // Petal color with slight variation
        let c = this.color;
        p.fill(p.red(c), p.green(c), p.blue(c), 200);
        p.stroke(p.red(c) * 0.8, p.green(c) * 0.8, p.blue(c) * 0.8);
        p.strokeWeight(1);

        // Petal shape using bezier curve
        p.beginShape();
        p.vertex(0, 0);
        p.bezierVertex(
          this.size * 0.3, -this.size * 0.4,
          this.size * 0.5, -this.size * 0.7,
          this.size * 0.3, -this.size
        );
        p.bezierVertex(
          this.size * 0.1, -this.size * 0.7,
          -this.size * 0.1, -this.size * 0.4,
          0, 0
        );
        p.endShape(p.CLOSE);

        p.pop();
      }

      // Center stamen
      p.fill(255, 223, 0, 220); // Yellow
      p.noStroke();
      p.circle(0, 0, this.size * 0.2);

      // Stamen details
      for (let i = 0; i < 8; i++) {
        let angle = (p.TWO_PI / 8) * i;
        let x = p.cos(angle) * this.size * 0.08;
        let y = p.sin(angle) * this.size * 0.08;
        p.fill(180, 50, 50);
        p.circle(x, y, this.size * 0.04);
      }
    }

    drawPlumeria(p) {
      // 5 pinwheel petals
      for (let i = 0; i < this.petalCount; i++) {
        let angle = (p.TWO_PI / this.petalCount) * i + p.PI / 10;

        p.push();
        p.rotate(angle);

        // Gradient from center (yellow) to edge (white/pink)
        let centerColor = p.color(255, 223, 100);
        let edgeColor = this.color;

        // Draw petal with manual gradient
        for (let r = 0; r < 1; r += 0.1) {
          let c = p.lerpColor(centerColor, edgeColor, r);
          p.fill(c);
          p.noStroke();

          let size = this.size * (1 - r * 0.3);

          p.beginShape();
          p.vertex(0, 0);
          p.bezierVertex(
            size * 0.25, -size * 0.3 * r,
            size * 0.4, -size * 0.6 * r,
            size * 0.25, -size * r
          );
          p.bezierVertex(
            -size * 0.05, -size * 0.6 * r,
            -size * 0.25, -size * 0.3 * r,
            0, 0
          );
          p.endShape(p.CLOSE);
        }

        p.pop();
      }

      // Small center
      p.fill(255, 200, 0);
      p.noStroke();
      p.circle(0, 0, this.size * 0.1);
    }

    drawBougainvillea(p) {
      // 3 paper-like bracts (modified leaves, not true petals)
      for (let i = 0; i < this.petalCount; i++) {
        let angle = (p.TWO_PI / this.petalCount) * i;

        p.push();
        p.rotate(angle);

        let c = this.color;
        p.fill(p.red(c), p.green(c), p.blue(c), 180);
        p.stroke(p.red(c) * 0.7, p.green(c) * 0.7, p.blue(c) * 0.7);
        p.strokeWeight(0.5);

        // Heart-shaped bract
        p.beginShape();
        p.vertex(0, 0);
        p.bezierVertex(
          this.size * 0.4, -this.size * 0.3,
          this.size * 0.5, -this.size * 0.8,
          this.size * 0.2, -this.size * 1.0
        );
        p.vertex(0, -this.size * 0.85);
        p.bezierVertex(
          -this.size * 0.2, -this.size * 1.0,
          -this.size * 0.4, -this.size * 0.8,
          -this.size * 0.3, -this.size * 0.3
        );
        p.endShape(p.CLOSE);

        // Vein detail
        p.stroke(p.red(c) * 0.6, p.green(c) * 0.6, p.blue(c) * 0.6, 100);
        p.line(0, 0, 0, -this.size * 0.85);

        p.pop();
      }

      // Tiny true flowers in center (white/yellow)
      p.fill(255, 250, 200);
      p.noStroke();
      for (let i = 0; i < 3; i++) {
        let angle = (p.TWO_PI / 3) * i;
        let x = p.cos(angle) * this.size * 0.08;
        let y = p.sin(angle) * this.size * 0.08;
        p.circle(x, y, this.size * 0.08);
      }
    }

    // Mask drawing methods (simplified shapes for masking)
    drawHibiscusMask(maskGraphics, p) {
      // Draw 5 petals as white shapes
      for (let i = 0; i < 5; i++) {
        let angle = (p.TWO_PI / 5) * i;
        maskGraphics.push();
        maskGraphics.rotate(angle);

        maskGraphics.beginShape();
        maskGraphics.vertex(0, 0);
        maskGraphics.bezierVertex(
          this.size * 0.3, -this.size * 0.4,
          this.size * 0.5, -this.size * 0.7,
          this.size * 0.3, -this.size
        );
        maskGraphics.bezierVertex(
          this.size * 0.1, -this.size * 0.7,
          -this.size * 0.1, -this.size * 0.4,
          0, 0
        );
        maskGraphics.endShape(maskGraphics.CLOSE);
        maskGraphics.pop();
      }
      // Center
      maskGraphics.circle(0, 0, this.size * 0.2);
    }

    drawPlumeriaMask(maskGraphics, p) {
      // Draw 5 pinwheel petals
      for (let i = 0; i < 5; i++) {
        let angle = (p.TWO_PI / 5) * i + p.PI / 10;
        maskGraphics.push();
        maskGraphics.rotate(angle);

        maskGraphics.beginShape();
        maskGraphics.vertex(0, 0);
        maskGraphics.bezierVertex(
          this.size * 0.25, -this.size * 0.3,
          this.size * 0.4, -this.size * 0.6,
          this.size * 0.25, -this.size
        );
        maskGraphics.bezierVertex(
          -this.size * 0.05, -this.size * 0.6,
          -this.size * 0.25, -this.size * 0.3,
          0, 0
        );
        maskGraphics.endShape(maskGraphics.CLOSE);
        maskGraphics.pop();
      }
      // Center
      maskGraphics.circle(0, 0, this.size * 0.1);
    }

    drawBougainvilleaMask(maskGraphics, p) {
      // Draw 3 heart-shaped bracts
      for (let i = 0; i < 3; i++) {
        let angle = (p.TWO_PI / 3) * i;
        maskGraphics.push();
        maskGraphics.rotate(angle);

        maskGraphics.beginShape();
        maskGraphics.vertex(0, 0);
        maskGraphics.bezierVertex(
          this.size * 0.4, -this.size * 0.3,
          this.size * 0.5, -this.size * 0.8,
          this.size * 0.2, -this.size * 1.0
        );
        maskGraphics.vertex(0, -this.size * 0.85);
        maskGraphics.bezierVertex(
          -this.size * 0.2, -this.size * 1.0,
          -this.size * 0.4, -this.size * 0.8,
          -this.size * 0.3, -this.size * 0.3
        );
        maskGraphics.endShape(maskGraphics.CLOSE);
        maskGraphics.pop();
      }
      // Center flowers
      for (let i = 0; i < 3; i++) {
        let angle = (p.TWO_PI / 3) * i;
        let x = maskGraphics.cos(angle) * this.size * 0.08;
        let y = maskGraphics.sin(angle) * this.size * 0.08;
        maskGraphics.circle(x, y, this.size * 0.08);
      }
    }

    // Easing function for growth animation
    easeOutElastic(t) {
      const c4 = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1 :
        Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }
  }
};

// Create p5 instance
new p5(sketch);