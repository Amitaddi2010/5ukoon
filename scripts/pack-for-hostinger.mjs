import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const deployDir = path.resolve(rootDir, 'deploy');

// Clean up existing deploy folder
if (fs.existsSync(deployDir)) {
  fs.rmSync(deployDir, { recursive: true, force: true });
}
fs.mkdirSync(deployDir);

// 1. Copy backend bundle
const backendDist = path.resolve(rootDir, 'artifacts/api-server/dist');
if (fs.existsSync(backendDist)) {
  fs.cpSync(backendDist, deployDir, { recursive: true });
} else {
  console.error("❌ Backend not built. Run pnpm run build in artifacts/api-server first.");
  process.exit(1);
}

// 2. Copy frontend build to deploy/public
const frontendDist = path.resolve(rootDir, 'artifacts/sukoon/dist/public');
const deployPublic = path.resolve(deployDir, 'public');
if (fs.existsSync(frontendDist)) {
  fs.cpSync(frontendDist, deployPublic, { recursive: true });
} else {
  console.error("❌ Frontend not built. Run pnpm run build in artifacts/sukoon first.");
  process.exit(1);
}

// 3. Create a production package.json
// We include libsql and platform-specific binaries for SQLite so they get installed on Hostinger
const pkgJson = {
  name: "sukoon-production",
  version: "1.0.0",
  type: "module",
  scripts: {
    start: "NODE_ENV=production node index.mjs"
  },
  dependencies: {
    "@libsql/client": "^0.14.0",
    "libsql": "^0.5.29",
    "@libsql/linux-x64-gnu": "^0.5.29",
    "@libsql/win32-x64-msvc": "^0.5.29"
  }
};
fs.writeFileSync(
  path.resolve(deployDir, 'package.json'),
  JSON.stringify(pkgJson, null, 2)
);

// 4. Create a .env template or pre-configured file for hostinger
const envFile = `PORT=3000
NODE_ENV=production
SESSION_SECRET=your_super_secret_key_change_me
DATABASE_URL=file:sqlite.db
ADMIN_USERNAME=secure_admin
ADMIN_PASSWORD=your_secure_password_here
`;
fs.writeFileSync(path.resolve(deployDir, '.env'), envFile);

// 5. Create app.js and .htaccess for Phusion Passenger
const appJsContent = `// Hostinger Phusion Passenger entry point
// Passenger requires the Express app to be exported, NOT started with app.listen()
const path = require('path');

// Load environment from .env file if present
try {
  const fs = require('fs');
  const envPath = path.resolve(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\\n').forEach(line => {
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
    // Dynamic import to load the compiled index.mjs
    await import('./index.mjs');
    console.log("Sukoon server started successfully via Passenger");
  } catch (err) {
    console.error("Failed to start Sukoon server:", err);
    
    // Fallback: serve a basic error page so the user doesn't get 403
    const http = require('http');
    const server = http.createServer((req, res) => {
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end('<html><body><h1>Sukoon Error</h1><p>Server encountered an error during startup.</p><pre>' + err.message + '</pre></body></html>');
    });
    server.listen(process.env.PORT || 3000);
  }
}

startApp();
`;
fs.writeFileSync(path.resolve(deployDir, 'app.js'), appJsContent);

console.log("✅ Successfully packaged for Hostinger!");
console.log("📁 The 'deploy' folder has been created at:", deployDir);
console.log("");
console.log("To deploy to Hostinger:");
console.log("1. Zip the contents of the 'deploy' folder (not the folder itself).");
console.log("2. Upload and extract it to your Hostinger public_html or Node.js App directory.");
console.log("3. Run 'npm install' on the server via SSH/Terminal.");
console.log("4. Start the app using 'npm start' or via the Hostinger Node.js dashboard (pointing to index.mjs).");
