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

// 1.5 DO NOT COPY sqlite.db (prevents overwriting production data)
console.log("ℹ️ Skipping sqlite.db copy to prevent overwriting production data on Hostinger.");
console.log("ℹ️ Ensure your Hostinger environment already has a database, or upload it manually once.");

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
    start: "NODE_ENV=production node app.cjs",
    build: "echo 'Already built! Skipping build step for Hostinger...'"
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

// 3.5 Create app.cjs wrapper for Hostinger (Passenger's loader uses require(), which fails on ES Modules)
fs.writeFileSync(
  path.resolve(deployDir, 'app.cjs'),
  `// Passenger uses require(), which crashes on ES modules.
// This CommonJS wrapper dynamically imports your ES module app.
const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "startup-error.log");

function log(msg) {
  console.log(msg);
  try {
    fs.appendFileSync(logFile, \`[\${new Date().toISOString()}] \${msg}\\n\`);
  } catch {}
}

process.on("unhandledRejection", (reason) => {
  const msg = reason && (reason.stack || reason.message || reason);
  log(\`Unhandled Rejection: \${msg}\`);
});

process.on("uncaughtException", (err) => {
  log(\`Uncaught Exception: \${err.message}\\n\${err.stack}\`);
});

process.env.NODE_ENV = process.env.NODE_ENV || "production";
log(\`Starting Sukoon Production Server (CWD: \${process.cwd()}, Node: \${process.version})\`);

// Synchronously require compiled CJS backend so app.listen() executes during Passenger startup
try {
  const mod = require("./index.cjs");
  global.__sukoon_mod = mod;
  log("Express server loaded synchronously via index.cjs.");
} catch (err) {
  log(\`CJS load error, attempting ESM fallback: \${err.message}\`);
  try {
    import("./index.mjs").then((mod) => {
      global.__sukoon_mod = mod;
      log("Express server started via ESM fallback.");
    }).catch((esmErr) => {
      log(\`Critical startup failure (ESM): \${esmErr.message}\\n\${esmErr.stack}\`);
    });
  } catch (esmErr) {
    log(\`Critical startup failure: \${esmErr.message}\\n\${esmErr.stack}\`);
  }
}
`
);

// 3.6 Create default .htaccess for Hostinger Node.js to prevent 403 Forbidden
const htaccessContent = `# DO NOT REMOVE. ALREADY CONFIGURED ON HOSTINGER.
PassengerAppType node
PassengerStartupFile app.cjs
PassengerAppEnv production
PassengerFriendlyErrorPages on

DirectoryIndex disabled
Options -Indexes

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ app.cjs [L,QSA]
</IfModule>
`;
fs.writeFileSync(path.resolve(deployDir, '.htaccess'), htaccessContent);

// 4. Create a .env template or pre-configured file for hostinger
const envFile = `PORT=3000
NODE_ENV=production
SESSION_SECRET=your_super_secret_key_change_me
DATABASE_URL=file:./sqlite.db
ADMIN_USERNAME=secure_admin
ADMIN_PASSWORD=your_secure_password_here
`;
fs.writeFileSync(path.resolve(deployDir, '.env'), envFile);

// We will rely on app.cjs as the entry point for Hostinger's Node.js App.

console.log("✅ Successfully packaged for Hostinger!");
console.log("📁 The 'deploy' folder has been created at:", deployDir);
console.log("");
console.log("To deploy to Hostinger:");
console.log("1. Zip the contents of the 'deploy' folder (not the folder itself).");
console.log("2. Upload and extract it to your Hostinger public_html or Node.js App directory.");
console.log("3. Run 'npm install' on the server via SSH/Terminal, or click NPM Install in hPanel.");
console.log("4. In your Hostinger Node.js panel, ensure 'Application startup file' is set to 'app.cjs'.");
console.log("5. Start the app via the Hostinger Node.js dashboard.");
