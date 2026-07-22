# Setup Guide - Tropical Diffusion

## Testing Without AI (Instant Setup)

The app works perfectly without any configuration:

```bash
npm install
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

- Click to plant flowers ✅
- Press 'C' to clear ✅
- Press 'S' to save ✅
- Toggle "Flow Field" button ✅
- "AI Textures" button will show as "AI: Not Available" (expected)

## Testing With AI Textures

### Step 1: Get Replicate API Token

1. Visit [https://replicate.com](https://replicate.com)
2. Sign up (free account includes $5 credit)
3. Go to [https://replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
4. Click "Create Token"
5. Copy your token (format: `r8_...`)

### Step 2: Add Token to Environment

```bash
# Copy the example file
cp .env.example .env

# Open .env in your editor
# Add your token:
VITE_REPLICATE_API_TOKEN=r8_your_actual_token_here
```

### Step 3: Restart Server

```bash
# Stop the dev server (Ctrl+C)
npm run dev
```

### Step 4: Test AI Textures

1. Open [http://localhost:5173](http://localhost:5173)
2. The "AI Textures" button should now say "AI Textures: OFF" (not greyed out)
3. Click the button to toggle to "AI Textures: ON"
4. Plant a flower (click and hold)
5. Watch the console for generation logs:
   ```
   Replicate service initialized successfully
   Generating texture with prompt: vibrant crimson red hibiscus flower...
   AI texture loaded for hibiscus
   ```
6. After 2-4 seconds, the procedural flower will fade into a photorealistic texture

### Expected Behavior

#### First Flower (Each Type)
1. Procedural flower appears instantly
2. Console shows "Generating texture..."
3. Wait 2-4 seconds
4. Texture fades in smoothly
5. Console shows "AI texture loaded"

#### Subsequent Flowers (Same Type/Color)
1. Procedural flower appears instantly
2. Console shows "Using cached texture"
3. Texture fades in immediately (cache hit)

## Troubleshooting

### Button Still Shows "AI: Not Available"

**Possible causes:**
- `.env` file doesn't exist in project root
- Token not set correctly in `.env`
- Dev server not restarted after adding token

**Solutions:**
```bash
# Verify .env exists
ls -la .env

# Check content (should show your token)
cat .env

# Restart server
npm run dev
```

### Textures Not Appearing

**Check browser console:**
```
F12 → Console tab
```

**Common errors:**

1. **"Failed to initialize Replicate"**
   - Token is invalid or expired
   - Get new token from Replicate

2. **"Insufficient credits"**
   - Replicate account out of credits
   - Add payment method at replicate.com/account

3. **Network error**
   - Check internet connection
   - Replicate API might be down

### Textures Taking Too Long

**Expected times:**
- First unique flower: 3-6 seconds
- Cached flowers: <1 second

**If slower:**
- Replicate API might be busy
- Check console for error messages
- Wait a bit longer (sometimes takes 10s)

## Cost Tracking

### Monitor Your Usage

1. Visit [https://replicate.com/account](https://replicate.com/account)
2. Check "Usage" tab for current spend

### Expected Costs for Testing

- Plant 5 flowers (all different): ~$0.01
- Plant 20 flowers (mixed types): ~$0.02-0.03
- Full test session (30 min): ~$0.05-0.10

**Tip**: The cache significantly reduces costs. After generating 9 unique variations (3 flowers × 3 colors), all subsequent flowers are free!

## Next Steps

Once working:
1. Experiment with different flower types
2. Try the Flow Field mode
3. Build a full garden and save it (Press 'S')
4. Check [CLAUDE.md](./CLAUDE.md) for architecture details
5. Explore the code in [src/](./src/)

## Need Help?

- Check [README.md](./README.md) for full documentation
- Open an issue on GitHub
- Review browser console for detailed error messages

---

Happy gardening! 🌺🌸🌼
