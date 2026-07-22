# Tropical Diffusion 🌺

An interactive p5.js web application that generates procedural tropical flowers with optional AI-enhanced photorealistic textures. Click to plant Okinawa-inspired hibiscus, plumeria, and bougainvillea flowers that grow with organic animations.

![Tropical Diffusion Demo](https://via.placeholder.com/800x400.png?text=Tropical+Diffusion+Demo)

## Features

### Core Features
- **3 Tropical Flower Types**: Hibiscus, Plumeria, Bougainvillea with authentic Okinawa color palettes
- **Organic Growth Animations**: Elastic easing for natural plant growth feel
- **Flow Field Stems**: Toggle organic, nature-inspired stem generation
- **Interactive Planting**: Click and drag to plant flowers anywhere on canvas
- **Garden Persistence**: Flowers remain on canvas, building your tropical garden

### AI Enhancement (Optional)
- **Stable Diffusion Integration**: Photorealistic flower textures via Replicate API
- **Hybrid Rendering**: Procedural flowers fade into AI-generated textures
- **Smart Caching**: Reuses textures for identical flower types to minimize costs
- **Progressive Enhancement**: Works perfectly without AI, enhanced with API key

## Quick Start

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/tropical-diffusion.git
cd tropical-diffusion

# Install dependencies
npm install

# Run development server (frontend only - no AI)
npm run dev

# OR run both frontend + backend (for AI textures)
npm run dev:all
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Basic Usage (No AI)
The app works immediately without any configuration:
- **Click and hold** to plant flowers
- **Press 'C'** to clear the canvas
- **Press 'S'** to save your garden as PNG
- **Press 'D'** to show cache debug stats
- **Toggle "Flow Field"** button to enable organic stems

### 3. Enable AI Textures (Optional)

#### Get Replicate API Token
1. Sign up at [replicate.com](https://replicate.com)
2. Navigate to [Account → API Tokens](https://replicate.com/account/api-tokens)
3. Create a new token and copy it

#### Configure Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your token
VITE_REPLICATE_API_TOKEN=r8_your_token_here
```

#### Start Both Servers
```bash
# This runs both the frontend (Vite) and backend (Express) servers
npm run dev:all
```

The "AI Textures" button will now be active (no longer greyed out).

**Architecture Note**: The frontend calls a local Express backend (port 3001) which proxies requests to Replicate's API. This avoids CORS issues with browser-based API calls.

## How It Works

### Hybrid Rendering Pipeline
```
User Click
    ↓
Procedural Flower (instant)
    ↓
[2 second delay]
    ↓
AI Texture Generation (background)
    ↓
Cross-fade Transition (1 second)
    ↓
Photorealistic Flower
```

### Aggressive Smart Caching
- **Color Bucketing**: All similar colors map to 3 buckets (red/pink/white)
- **Maximum Unique Textures**: 9 total (3 flowers × 3 colors)
- **First 9 flowers**: API calls (~$0.02 total)
- **All subsequent flowers**: Instant cache hits ($0.00)
- **localStorage Persistence**: Cache survives browser refresh
- **Press 'D'**: Debug cache statistics

## Project Structure

```
tropical-diffusion/
├── src/
│   ├── sketch.js              # Main p5.js application
│   └── replicateService.js    # Frontend API client
├── server.js                   # Express backend (Replicate API proxy)
├── index.html                  # Entry point
├── package.json                # Dependencies
├── .env.example                # Environment template
├── .env                        # Your API keys (not committed)
├── CLAUDE.md                   # Detailed project context
└── README.md                   # This file
```

### Architecture
```
Browser (localhost:5173)
    ↓
Frontend (p5.js + Vite)
    ↓
Backend API (Express, localhost:3001)
    ↓
Replicate API (SDXL)
```

## Development

### Available Commands
```bash
npm run dev         # Start frontend only (no AI)
npm run server      # Start backend only
npm run dev:all     # Start both frontend + backend (recommended for AI)
npm run build       # Build for production
npm run preview     # Preview production build
```

### Technology Stack
- **Frontend**: p5.js (instance mode)
- **Build Tool**: Vite
- **Backend**: Express.js (API proxy server)
- **AI Integration**: Replicate API (Stable Diffusion SDXL)
- **Language**: JavaScript (ES6 modules)

## Flower Types

### Hibiscus
- 5 overlapping petals with bezier curves
- Crimson, hot pink, and orange variations
- Yellow stamen center with detail dots

### Plumeria
- 5 pinwheel petals with gradient effect
- Cream white to peachy color range
- Characteristic tropical frangipani appearance

### Bougainvillea
- 3 heart-shaped paper-like bracts
- Magenta, pink, and coral red palette
- Small white center flowers with vein details

## Cost Estimates

### AI Texture Generation (Optional)
- **Per Unique Texture**: ~$0.0023 (SDXL, 512×512, 30 steps)
- **Maximum Cost Per User**: ~$0.02 (9 unique textures, cached forever)
- **After First Session**: $0.00 (localStorage cache)
- **Rate Limit Safe**: Max 9 API calls total

### Hosting
- **Static Hosting**: FREE (Vercel, Netlify, GitHub Pages)
- **No Backend Required**: Runs entirely client-side

## Troubleshooting

### "AI: Not Available" Button
- Verify `.env` file exists in project root
- Check `VITE_REPLICATE_API_TOKEN` is set correctly
- **Make sure you're running `npm run dev:all`** (not just `npm run dev`)
- Check browser console for backend connection errors
- Verify backend is running on port 3001

### Textures Not Appearing
- Verify API token at replicate.com/account/api-tokens
- Check Replicate account has available credits
- First texture may take 5-10 seconds to generate
- Check browser console for API errors

### Performance Issues
- Disable AI textures if not needed
- Clear canvas periodically (Press 'C')
- Use Flow Field mode sparingly (more CPU intensive)

## Roadmap

### Short-term
- [ ] Loading indicators for AI texture status
- [ ] localStorage persistence for gardens
- [ ] Seasonal color variations
- [ ] Wind/sway animations

### Medium-term
- [ ] Pre-generated texture library (offline mode)
- [ ] Higher resolution textures (1024×1024)
- [ ] Garden sharing via URL parameters
- [ ] Mobile touch optimization

## Contributing

This is a personal portfolio/art project, but suggestions and feedback are welcome! Please open an issue for bugs or feature ideas.

## License

MIT License - feel free to use this code for your own creative projects!

## Credits

Created by [Your Name]

Inspired by the tropical flora of Okinawa, Japan 🌴

Powered by:
- [p5.js](https://p5js.org/) - Creative coding library
- [Replicate](https://replicate.com/) - AI model hosting
- [Stable Diffusion XL](https://stability.ai/) - Image generation

## Contact

- Portfolio: [yourportfolio.com](https://yourportfolio.com)
- GitHub: [@yourusername](https://github.com/yourusername)
- Twitter: [@yourhandle](https://twitter.com/yourhandle)

---

Built with ❤️ and p5.js
