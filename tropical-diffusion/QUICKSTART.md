# Quick Start - Tropical Diffusion 🌺

## 5-Minute Setup

### Option A: Without AI (Instant)
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) and start planting! 🎨

### Option B: With AI Textures (Recommended)
```bash
# 1. Install dependencies
npm install

# 2. Get API token from https://replicate.com/account/api-tokens

# 3. Add token to .env
cp .env.example .env
# Edit .env and paste your token

# 4. Start BOTH frontend AND backend
npm run dev:all
```

Open [http://localhost:5173](http://localhost:5173) and toggle "AI Textures: ON" 🤖

**Important**: You need to run `dev:all` (not just `dev`) to start both the frontend and backend servers!

## Usage

- **Click & Drag**: Plant flowers
- **Press 'C'**: Clear canvas
- **Press 'S'**: Save image
- **Toggle Buttons**: Enable Flow Fields or AI Textures

## First Test

1. Plant 3-4 flowers (different types)
2. Wait ~3-5 seconds
3. Watch them transform into photorealistic flowers ✨
4. Plant more - they'll use cached textures (instant!)

## Cost Check

- First 10 flowers: ~$0.02
- Next 50 flowers: ~$0.00 (cached)
- Check usage: [replicate.com/account](https://replicate.com/account)

## Need Help?

- **Full Guide**: [README.md](./README.md)
- **Setup Details**: [SETUP.md](./SETUP.md)
- **Tech Details**: [CLAUDE.md](./CLAUDE.md)
- **Implementation**: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

Built with p5.js + Stable Diffusion 🚀
