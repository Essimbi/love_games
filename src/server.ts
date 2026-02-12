import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import helmet from 'helmet';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Lazy load server modules to avoid compilation issues
async function loadServerModules() {
  const { setupDatabase } = await import('./server/database/db.js');
  const { setupApiRoutes } = await import('./server/api/routes/index.js');
  const { setupCleanupTask } = await import('./server/tasks/cleanup.js');
  return { setupDatabase, setupApiRoutes, setupCleanupTask };
}

const browserDistFolder = join(__dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Middleware
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com", "https://fonts.gstatic.com", "data:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "blob:", "i.pravatar.cc", "https://i.pravatar.cc"],
      connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*"],
    }
  }
}));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env['CORS_ORIGIN'] || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Initialize server modules
let serverModulesLoaded = false;

async function initializeServer() {
  if (serverModulesLoaded) return;

  try {
    const { setupDatabase, setupApiRoutes, setupCleanupTask } = await loadServerModules();

    // Set dev server flag if running in dev mode
    if (process.env['NODE_ENV'] !== 'production') {
      process.env['VITE_DEV_SERVER'] = 'true';
    }

    await setupDatabase();
    console.log('✅ Database initialized');

    setupApiRoutes(app);

    setupCleanupTask();

    serverModulesLoaded = true;
  } catch (error) {
    console.error('❌ Server initialization failed:', error);
    process.exit(1);
  }
}

// Initialize on first request
app.use(async (req, res, next) => {
  if (!serverModulesLoaded) {
    await initializeServer();
  }
  next();
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  // Skip Angular rendering for API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }

  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;

  // Initialize server before listening
  initializeServer().then(() => {
    app.listen(port, (error) => {
      if (error) {
        throw error;
      }

      console.log(`🚀 Node Express server listening on http://localhost:${port}`);
    });
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
