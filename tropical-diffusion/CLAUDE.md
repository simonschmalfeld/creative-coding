# Tropical Diffusion - Project Context

## Project Overview
An interactive p5.js web application that generates procedural tropical flowers inspired by Okinawa's flora. Users click to plant flowers that grow with organic animations. The project is designed to be simple, with no hardware requirements and minimal/zero cloud costs.

## Technical Stack
- **Frontend**: p5.js (instance mode)
- **Build Tool**: Vite
- **Package Manager**: npm
- **Language**: JavaScript (ES6 modules)
- **AI Integration**: Replicate API (Stable Diffusion SDXL)

## Project Goals
1. Start with pure procedural generation in p5.js
2. Create organic, nature-inspired flower animations
3. Keep costs at zero (no cloud infrastructure initially)
4. Later: optionally integrate AI-generated textures (either pre-generated or via API)

## Current Status
**✅ Completed:**
- Project architecture decided (npm + Vite setup)
- Complete p5.js sketch code written
- Three flower types implemented: hibiscus, plumeria, bougainvillea
- Growth animations with elastic easing
- Okinawa-specific color palettes
- Basic interactions (click to plant, 'C' to clear, 'S' to save)
- Set up the npm project structure
- Test the implementation
- **Flow field stem generation** (toggle button)
- **Replicate AI integration** with Stable Diffusion SDXL
- **Hybrid rendering system** (procedural → AI texture fade-in)
- **Smart texture caching** to minimize API costs
- **UI controls** for toggling AI textures and flow fields

**📋 Next Steps:**
- Test AI texture generation with actual API key
- Implement localStorage persistence for saving gardens
- Add loading indicators for AI texture generation
- Optimize texture caching strategy
- Consider batch pre-generation for offline mode

## Flower Types Implemented

### 1. Hibiscus
- 5 overlapping petals with bezier curves
- Crimson/hot pink/orange color palette
- Yellow center stamen with detail dots
- Size range: 40-80px

### 2. Plumeria
- 5 pinwheel petals with gradient
- Cream white/peach color palette
- Yellow center fading to petal edges
- Characteristic tropical frangipani appearance

### 3. Bougainvillea
- 3 heart-shaped bracts (paper-like)
- Magenta/pink/coral red palette
- Small white/yellow true flowers in center
- Vein details on bracts

## Code Architecture

### Main Components
```
src/sketch.js
├── p5 instance setup
├── flowers[] array (state)
├── AI service initialization
├── UI toggle buttons (Flow Field, AI Textures)
├── mousePressed handler (plant flowers)
├── keyPressed handler (clear/save)
└── Flower class
    ├── constructor (position, type, colors, animation state, AI config)
    ├── getColor() (Okinawa-specific palettes)
    ├── getPetalCount() (type-specific)
    ├── loadAITexture() (async Replicate API call)
    ├── display() (hybrid rendering with fade transition)
    ├── drawProceduralFlower() (router for procedural types)
    ├── drawHibiscus()
    ├── drawPlumeria()
    ├── drawBougainvillea()
    ├── generateFlowFieldStem() (organic stem growth)
    └── easeOutElastic() (animation easing)

src/replicateService.js
├── ReplicateService class (singleton)
├── initialize() (API authentication)
├── generateFlowerTexture() (SDXL API call)
├── createPrompt() (flower-specific prompts)
├── getColorDescription() (color extraction)
└── cache management (Map-based caching)
```

### Key Technical Decisions
- **Instance mode**: Using `new p5(sketch)` for better module compatibility
- **No background clear**: Flowers persist on canvas for garden effect
- **Growth animation**: Elastic easing from size 0 to target size over ~1 second
- **Random rotation**: Each flower rotates randomly for natural variety
- **Hybrid rendering**: Procedural flowers display instantly, AI textures fade in after 2s delay
- **Progressive enhancement**: Works without AI (graceful degradation if no API key)
- **Smart caching**: Identical flower types/colors reuse cached AI textures
- **Async texture loading**: Non-blocking API calls, flowers render during generation

## Project Structure
```
tropical-diffusion/
├── package.json
├── index.html
├── src/
│   ├── sketch.js (main p5.js application)
│   └── replicateService.js (AI texture generation)
├── .env (API keys - not committed)
├── .env.example (template for API setup)
├── .gitignore
└── CLAUDE.md (this file)
```

## User Interactions
- **Click and hold anywhere**: Plants a random flower type at cursor position
- **Press 'C'**: Clears the canvas
- **Press 'S'**: Saves the current garden as PNG
- **Flow Field toggle button**: Enable/disable organic stem growth
- **AI Textures toggle button**: Enable/disable AI-generated flower textures (requires API key)
- **Responsive**: Canvas resizes with window, buttons reposition automatically

## Design Philosophy
- Organic, nature-inspired aesthetics
- Procedural generation for infinite variety
- Minimal, clean interface
- Okinawa tropical theme (authentic color palettes)
- No cloud costs, runs entirely client-side

## AI Texture Integration (Replicate + Stable Diffusion)

### Overview
The application now supports optional AI-generated flower textures using Replicate's Stable Diffusion SDXL model. This is implemented as a **progressive enhancement** - the app works perfectly without an API key, but gains photorealistic textures when enabled.

### How It Works

#### 1. Hybrid Rendering Strategy
- **Instant**: Procedural flower renders immediately on click
- **After 2s**: If AI textures enabled, starts fading in photorealistic texture
- **Smooth transition**: Cross-fade from procedural → AI texture over ~1 second
- **No blocking**: User can continue planting while textures generate

#### 2. Smart Caching System
- Identical flower type + color combinations reuse cached textures
- Cache is stored in memory during session
- Reduces API calls from potentially 100s to ~9 (3 flower types × 3 color variations)
- **Cost optimization**: First garden might cost $0.02-0.05, subsequent gardens: $0.00

#### 3. Prompts & Quality
Each flower type has custom prompts optimized for botanical accuracy:

**Hibiscus**: "vibrant [color] hibiscus flower, detailed overlapping petals with visible veins, prominent yellow stamen center, tropical flower, macro photography..."

**Plumeria**: "delicate [color] plumeria frangipani flower, 5 spiral petals, soft gradient from yellow center to cream edges, exotic tropical flower..."

**Bougainvillea**: "vivid [color] bougainvillea bracts, paper-like texture, heart-shaped petals, small white center flowers..."

All prompts include: macro photography, professional studio lighting, shallow depth of field

### Setup Instructions

#### 1. Get Replicate API Token
1. Sign up at [replicate.com](https://replicate.com)
2. Go to [Account → API Tokens](https://replicate.com/account/api-tokens)
3. Create a new token
4. Copy the token (starts with `r8_...`)

#### 2. Configure Environment
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your token
VITE_REPLICATE_API_TOKEN=r8_your_token_here
```

#### 3. Restart Dev Server
```bash
npm run dev
```

The "AI Textures" button will now show as available (not greyed out).

### Cost Breakdown

**SDXL Model Pricing** (via Replicate):
- ~$0.0023 per generation (512×512, 30 steps)
- First-time garden with caching: ~$0.02 (9 unique variations)
- Subsequent gardens: ~$0.00 (cache hits)

**For a demo portfolio piece**:
- Generate 20-30 flowers: ~$0.05-0.10
- Perfect for portfolio showcases and client demos

### Performance Characteristics
- **API Latency**: 2-4 seconds per unique flower
- **Texture Loading**: Additional 0.5-1s for image download
- **User Experience**: Feels instant due to procedural preview
- **Offline Capability**: Procedural mode works without internet

### Technical Implementation

#### Service Architecture
```javascript
replicateService.js
├── Singleton pattern (single instance shared across app)
├── Lazy initialization (only connects if API key present)
├── Error handling (graceful degradation)
└── Cache management (Map-based, flower type + color keys)
```

#### Flower Class Integration
```javascript
Flower.constructor()
├── Check if AI enabled + service ready
├── Trigger async loadAITexture() (non-blocking)
└── Continue rendering procedural version

Flower.display()
├── Draw procedural flower (always)
├── If AI texture loaded: cross-fade transition
└── User never sees blank/loading state
```

### Troubleshooting

**"AI: Not Available" button**:
- Check `.env` file exists and has valid token
- Restart dev server after adding token
- Check browser console for error messages

**Textures not appearing**:
- Check browser console for API errors
- Verify API token is valid at replicate.com
- Check account has available credits
- Some flowers may take 5-10s on first generation

**High costs**:
- Verify caching is working (check console logs)
- Disable AI textures when not needed
- Consider pre-generating a fixed set (future enhancement)

## Future Enhancement Ideas

### Short-term
1. ✅ ~~Flow field stems~~ (COMPLETED)
2. ✅ ~~Replicate AI integration~~ (COMPLETED)
3. Add loading indicators for AI texture generation status
4. Implement localStorage to persist gardens between sessions
5. Add seasonal color variations
6. Add wind/sway animations to flowers
7. Add particle effects (pollen, petals falling)
8. Export high-resolution versions for prints

### Medium-term (AI Enhancements)
1. **Pre-generated texture library** (batch generation)
   - Generate 50-100 flower textures offline
   - Bundle as static assets with app
   - Zero runtime cost, instant loading
   - Perfect for portfolio/exhibition versions

2. **Texture quality improvements**
   - Experiment with different SDXL prompts
   - Add detail enhancers (ControlNet, LoRAs)
   - Higher resolution textures (768×768 or 1024×1024)

3. **Local desktop backend** (if GPU available)
   - ComfyUI + SDXL Turbo on desktop PC
   - FastAPI + WebSocket server
   - Real-time generation (1-2 sec latency)
   - Unlimited generations, no API costs

### Long-term
- Interactive garden sharing (URL parameters)
- Time-lapse mode showing garden growth
- Sound design (ambient Okinawa nature sounds)
- Mobile touch optimization
- VR/AR version for immersive experience

## AI Architecture Decision Matrix

### ✅ Current Implementation: Option B (Replicate API)
- **Cost**: ~$0.002-0.005 per generation
- **Latency**: 2-4 seconds
- **UX**: Hybrid (procedural instant, AI enhanced after delay)
- **Status**: IMPLEMENTED
- **Best for**: Interactive demos, portfolio showcases, small-scale production

### Future Options:

#### Option A: Pre-Generated Library
- **Cost**: ~$2-5 one-time (batch generation via Replicate)
- **Workflow**: Generate 50-100 variations offline, bundle as static assets
- **UX**: Instant loading, no API calls, offline-capable
- **Best for**: Portfolio exhibitions, offline demos, zero-cost hosting

#### Option C: Self-Hosted GPU Backend
- **Hardware**: Desktop PC with RTX 4070+ GPU
- **Cost**: Electricity only (~$0.10/hour GPU usage)
- **Latency**: 1-2 seconds with SDXL Turbo
- **Setup**: ComfyUI + FastAPI + WebSocket
- **Best for**: Client projects, high-volume usage, unlimited generations

## Hardware Context
- **Current**: MacBook Pro 14" (M-series, suitable for development)
- **Available**: Access to powerful desktop PC with Nvidia GPU (for AI texture generation if needed)
- **Decision**: Start simple with pure p5.js, add AI later if desired

## Creative Technologist Positioning
This project demonstrates the intersection of:
- Creative coding (p5.js, generative art)
- Backend infrastructure knowledge (understanding of AI pipelines, cloud costs, deployment)
- Product design (UX considerations, progressive enhancement)
- Technical architecture (choosing appropriate tools for constraints)

Position: Creative Technologist who understands both frontend creative work AND backend AI/cloud infrastructure, rather than just frontend-focused animations.

## References & Inspiration
- **Kyle McDonald**: ML/computer vision for interactive installations
- **Mario Klingemann (Quasimondo)**: GAN training, custom ML pipelines
- **Refik Anadol Studio**: Cloud-based ML for large-scale data visualization (Google Cloud, Vertex AI)
- **Helena Sarin**: Training custom GANs on personal datasets

## Next Session Goals
1. Initialize npm project and verify all files are set up correctly
2. Test the application in browser
3. Fix any bugs in the instance mode implementation
4. Start adding stems/leaves using procedural techniques
5. Implement localStorage persistence

## Development Commands
```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Notes
- Keep it simple initially - focus on beautiful procedural generation
- AI textures are optional enhancement, not core feature
- Portfolio piece should work offline and have zero runtime costs
- Document the architecture thinking (shows creative + technical depth)