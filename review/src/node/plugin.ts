import type { Plugin } from 'vite';
import path from 'path';
import fs from 'fs';
import { withCustomConfig } from 'react-docgen-typescript';

// Setup the TS Parser
const tsParser = withCustomConfig(path.resolve(process.cwd(), 'tsconfig.json'), {
  savePropValueAsString: true,
  shouldExtractLiteralValuesFromEnum: true,
  propFilter: (prop) => {
    if (prop.parent) {
      return !prop.parent.fileName.includes("node_modules");
    }
    return true;
  },
});

export function xrayPlugin(projectRoot: string, toolRoot: string): Plugin {
  return {
    name: 'vite-plugin-react-xray',
    
    configureServer(server) {
      // API: Component Metadata
      // The frontend calls this to get Props info for a specific file
      server.middlewares.use('/__xray/api/props', async (req, res, next) => {
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const filePath = url.searchParams.get('file');

        if (!filePath) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'File path required' }));
          return;
        }

        try {
          // Parse the component using docgen
          const fullPath = path.resolve(projectRoot, filePath.startsWith('/') ? filePath.slice(1) : filePath);
          const docs = tsParser.parse(fullPath);
          
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(docs));
        } catch (e) {
          console.error("Docgen Error:", e);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Failed to parse component' }));
        }
      });

      // API: Component List
      // Scans the directory for likely components
      server.middlewares.use('/__xray/api/scan', async (req, res) => {
        // In a real app, use 'glob' or 'fast-glob'. For this demo, we use a simple recursive walker
        const files = getAllFiles(path.join(projectRoot, 'src'), ['.tsx', '.jsx']);
        // Filter out stories, tests, and non-components
        const components = files
          .filter(f => !f.includes('.test.') && !f.includes('.spec.') && !f.includes('.stories.'))
          .map(f => f.replace(projectRoot, '')); // Make relative

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(components));
      });
    },

    resolveId(id) {
      // Serve the tool's entry HTML
      if (id === '/__xray/') {
        return id;
      }
      return null;
    },

    load(id) {
      if (id === '/__xray/') {
        // We inject the HTML for the tool here.
        // It points to the client main.tsx which we will create next.
        return `
          <!DOCTYPE html>
          <html>
            <head>
              <title>React X-Ray</title>
              <style>
                body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
                /* Reset tool styles to not interfere with user styles if they leak */
                #xray-root { position: fixed; inset: 0; z-index: 99999; background: #fff; }
              </style>
            </head>
            <body>
              <div id="xray-root"></div>
              <script type="module" src="/@fs${path.join(toolRoot, '../src/client/main.tsx')}"></script>
            </body>
          </html>
        `;
      }
      return null;
    }
  };
}

// Helper: Recursive file scanner
function getAllFiles(dirPath: string, extensions: string[], arrayOfFiles: string[] = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  
  const files = fs.readdirSync(dirPath);

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        getAllFiles(fullPath, extensions, arrayOfFiles);
      }
    } else {
      if (extensions.some(ext => file.endsWith(ext))) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}
