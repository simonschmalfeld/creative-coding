// Replicate AI Service
// Handles Stable Diffusion texture generation via backend proxy

class ReplicateService {
  constructor() {
    this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    this.isInitialized = false;
    this.cache = new Map(); // Cache generated textures
    this.CACHE_KEY = 'tropical_diffusion_texture_cache';

    // Load cache from localStorage on startup
    this.loadCacheFromStorage();
  }

  /**
   * Load texture cache from localStorage
   */
  loadCacheFromStorage() {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        // Convert array back to Map
        this.cache = new Map(data);
        console.log(`💾 Loaded ${this.cache.size} cached textures from localStorage`);
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
      this.cache = new Map();
    }
  }

  /**
   * Save texture cache to localStorage
   */
  saveCacheToStorage() {
    try {
      // Convert Map to array for JSON serialization
      const data = Array.from(this.cache.entries());
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
      console.log(`💾 Saved ${this.cache.size} textures to localStorage`);
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }

  async initialize() {
    try {
      // Check if backend is available
      const response = await fetch(`${this.backendUrl}/api/health`);
      const data = await response.json();

      if (data.status === 'ok' && data.replicateAvailable) {
        this.isInitialized = true;
        console.log('✅ Replicate service initialized successfully (backend connected)');
        return true;
      } else {
        console.warn('⚠️  Backend connected but Replicate not configured');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to connect to backend:', error.message);
      console.warn('💡 Make sure to run: npm run dev:all (or start backend separately)');
      return false;
    }
  }

  /**
   * Generate a flower texture using Stable Diffusion
   * @param {string} flowerType - hibiscus, plumeria, or bougainvillea
   * @param {string} colorDescription - color palette description
   * @returns {Promise<string>} - URL of generated image
   */
  async generateFlowerTexture(flowerType, colorDescription) {
    if (!this.isInitialized) {
      throw new Error('Replicate service not initialized');
    }

    // Check cache first
    const cacheKey = `${flowerType}-${colorDescription}`;
    if (this.cache.has(cacheKey)) {
      console.log('💾 Using cached texture for', cacheKey);
      return this.cache.get(cacheKey);
    }

    // Create detailed prompt for tropical flower
    const prompt = this.createPrompt(flowerType, colorDescription);

    try {
      console.log('🎨 Generating texture with prompt:', prompt.substring(0, 80) + '...');

      // Call backend API instead of Replicate directly
      const response = await fetch(`${this.backendUrl}/api/generate-texture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          negativePrompt: "blurry, low quality, text, watermark, signature, distorted, ugly, cartoon, anime, people, hands, body parts"
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate texture');
      }

      const data = await response.json();
      const imageUrl = data.imageUrl;

      // Cache the result in memory AND localStorage
      this.cache.set(cacheKey, imageUrl);
      this.saveCacheToStorage();

      console.log('✅ Texture generated and cached:', cacheKey);

      return imageUrl;
    } catch (error) {
      console.error('❌ Error generating texture:', error);
      throw error;
    }
  }

  /**
   * Create a detailed prompt for the flower type
   */
  createPrompt(flowerType, colorDescription) {
    const baseStyle = "macro photography, extreme close-up, professional studio lighting, shallow depth of field, botanical illustration quality";

    const flowerPrompts = {
      hibiscus: `vibrant ${colorDescription} hibiscus flower, detailed overlapping petals with visible veins, prominent yellow stamen center, tropical flower, ${baseStyle}`,
      plumeria: `delicate ${colorDescription} plumeria frangipani flower, 5 spiral petals, soft gradient from yellow center to cream edges, exotic tropical flower, ${baseStyle}`,
      bougainvillea: `vivid ${colorDescription} bougainvillea bracts, paper-like texture, heart-shaped petals, small white center flowers, tropical bloom, ${baseStyle}`
    };

    return flowerPrompts[flowerType] || `beautiful ${colorDescription} ${flowerType} flower, ${baseStyle}`;
  }

  /**
   * Get color description from p5 color object
   * AGGRESSIVE BUCKETING: Only returns 3 variations per flower type
   * This reduces unique textures from potentially 100s to just 9 total (3 flowers × 3 colors)
   */
  getColorDescription(color) {
    const r = color.levels[0];
    const g = color.levels[1];
    const b = color.levels[2];

    // Calculate brightness to determine light vs dark
    const brightness = (r + g + b) / 3;

    // Calculate dominant channel
    const maxChannel = Math.max(r, g, b);

    // AGGRESSIVE: Only return 3 buckets total
    // This means all reds → "red", all pinks → "pink", all whites → "white"

    // Red/Crimson bucket (any reddish color)
    if (r === maxChannel && r > 180) {
      if (g < 100 && b < 100) return 'red'; // Deep reds
      if (g > 80) return 'pink'; // Pink/coral tones
    }

    // Pink/Magenta bucket
    if (r > 180 && b > 100) return 'pink';

    // White/Cream bucket (light colors)
    if (brightness > 200) return 'white';

    // Default: use most prominent characteristic
    if (r > 200) return 'red';
    if (r > 180 && g > 150) return 'pink';

    return 'white'; // Fallback to white bucket
  }

  /**
   * Clear the texture cache (both memory and localStorage)
   */
  clearCache() {
    this.cache.clear();
    try {
      localStorage.removeItem(this.CACHE_KEY);
      console.log('💾 Texture cache cleared (memory + localStorage)');
    } catch (error) {
      console.warn('Failed to clear localStorage cache:', error);
    }
  }

  /**
   * Get cache size
   */
  getCacheSize() {
    return this.cache.size;
  }
}

// Export singleton instance
export const replicateService = new ReplicateService();
