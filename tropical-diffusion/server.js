// Backend server for Replicate API proxy
// Handles CORS issues by proxying requests from browser to Replicate API

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Replicate from 'replicate';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Replicate
let replicate = null;
const REPLICATE_TOKEN = process.env.VITE_REPLICATE_API_TOKEN;

if (REPLICATE_TOKEN) {
  replicate = new Replicate({
    auth: REPLICATE_TOKEN,
  });
  console.log('✅ Replicate initialized with API token');
} else {
  console.warn('⚠️  No Replicate API token found. AI textures will be disabled.');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    replicateAvailable: !!replicate,
    timestamp: new Date().toISOString()
  });
});

// Generate flower texture endpoint
app.post('/api/generate-texture', async (req, res) => {
  if (!replicate) {
    return res.status(503).json({
      error: 'Replicate not initialized',
      message: 'No API token configured'
    });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Missing prompt',
        message: 'Prompt is required'
      });
    }

    console.log('🎨 Generating texture with prompt:', prompt.substring(0, 80) + '...');

    // Generate image using Google Imagen-4
    const output = await replicate.run(
      "google/imagen-4",
      {
        input: {
          prompt: prompt,
          aspect_ratio: "1:1",
          output_format: "png",
          output_quality: 80,
          safety_tolerance: 2,
          prompt_upsampling: false
        }
      }
    );

    // Imagen-4 returns a FileOutput object with .url() method
    // Extract the actual URL string
    let imageUrl;

    console.log('📦 Raw output type:', typeof output);
    console.log('📦 Output constructor:', output?.constructor?.name);
    console.log('📦 Output keys:', output && typeof output === 'object' ? Object.keys(output) : 'N/A');
    console.log('📦 Full output:', JSON.stringify(output, null, 2));

    if (typeof output === 'string') {
      // Already a string URL
      imageUrl = output;
    } else if (Array.isArray(output)) {
      // Array of URLs or FileOutput objects
      const first = output[0];
      if (typeof first === 'string') {
        imageUrl = first;
      } else if (first && typeof first.url === 'function') {
        imageUrl = await first.url();
      } else if (first && typeof first.url === 'string') {
        imageUrl = first.url;
      } else if (first && first.toString && typeof first.toString() === 'string') {
        imageUrl = first.toString();
      } else {
        imageUrl = String(first);
      }
    } else if (output && typeof output.url === 'function') {
      // FileOutput object with .url() method
      console.log('📦 Calling output.url() method...');
      const urlResult = await output.url();
      // url() returns a URL object, extract the string
      imageUrl = urlResult.href || urlResult.toString();
    } else if (output && typeof output.url === 'string') {
      // Object with url property
      imageUrl = output.url;
    } else if (output && output.toString && typeof output.toString() === 'string' && output.toString() !== '[object Object]') {
      // Object with custom toString (like FileOutput)
      console.log('📦 Using toString() method...');
      imageUrl = output.toString();
    } else {
      console.error('❌ Unknown output format. Full object:', JSON.stringify(output, null, 2));
      throw new Error('Unable to extract URL from API response');
    }

    console.log('📦 Extracted URL (pre-validation):', imageUrl);
    console.log('📦 URL type:', typeof imageUrl);

    // Ensure we have a valid string URL
    if (typeof imageUrl !== 'string') {
      console.error('❌ URL is not a string:', imageUrl);
      throw new Error(`Invalid image URL format: ${typeof imageUrl}`);
    }

    if (!imageUrl.startsWith('http')) {
      console.error('❌ URL does not start with http:', imageUrl);
      throw new Error(`URL does not start with http: ${imageUrl}`);
    }

    console.log('✅ Texture generated successfully');
    console.log('   Final URL:', imageUrl.substring(0, 60) + '...');

    res.json({
      success: true,
      imageUrl: imageUrl
    });

  } catch (error) {
    console.error('❌ Error generating texture:', error);

    res.status(500).json({
      error: 'Generation failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
🌺 Tropical Diffusion Backend Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Server running on: http://localhost:${PORT}
Replicate API: ${replicate ? '✅ Ready' : '❌ Not configured'}
Health check: http://localhost:${PORT}/api/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  process.exit(0);
});
