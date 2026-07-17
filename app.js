// Hostinger Phusion Passenger entry point
// Passenger requires the Express app to be exported, NOT started with app.listen()

const path = require('path');
const { fileURLToPath } = require('url');

// Load environment from .env file if present
try {
  const fs = require('fs');
  const envPath = path.resolve(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...rest] = line.split('=');
        if (key && rest.length > 0) {
          process.env[key.trim()] = rest.join('=').trim();
        }
      }
    });
  }
} catch (e) {
  // ignore env file errors
}

// Force production mode
process.env.NODE_ENV = 'production';

// Dynamic import of the ESM bundle
async function startApp() {
  try {
    const mod = await import('./artifacts/api-server/dist/index.mjs');
    console.log("Sukoon server started successfully");
  } catch (err) {
    console.error("Failed to start Sukoon server:", err);
    
    // Fallback: serve a basic error page so the user doesn't get 403
    const express = require('express');
    const fallbackApp = express();
    fallbackApp.use((req, res) => {
      res.status(500).send('<html><body><h1>Sukoon</h1><p>Server is starting up. Please refresh in a moment.</p><pre>' + err.message + '\n' + (err.stack || '') + '</pre></body></html>');
    });
    fallbackApp.listen(process.env.PORT || 3000);
  }
}

startApp();
