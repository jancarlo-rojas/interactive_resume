const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Compiled TypeScript handler lives in dist/api/chat.js after `npm run build`
const handler = require('./dist/api/chat').default;

const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');

function serveStatic(res, pathname) {
  const relPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.join(publicDir, relPath.replace(/^\/+/, ''));

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml'
    };

    res.statusCode = 200;
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url || '/', true);
  const pathname = parsedUrl.pathname || '/';

  if (pathname === '/api/chat') {
    let bodyData = '';
    req.on('data', chunk => {
      bodyData += chunk;
    });
    req.on('end', () => {
      let body;
      if (bodyData) {
        try {
          body = JSON.parse(bodyData);
        } catch {
          body = undefined;
        }
      }

      const fakeReq = { method: req.method, body };
      const fakeRes = {
        status(code) {
          res.statusCode = code;
          return this;
        },
        json(payload) {
          if (!res.headersSent) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
          }
          res.end(JSON.stringify(payload));
        }
      };

      Promise.resolve(handler(fakeReq, fakeRes)).catch(err => {
        console.error('Unexpected handler error:', err);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: 'Unexpected server error' }));
        }
      });
    });
    return;
  }

  serveStatic(res, pathname);
});

server.listen(port, () => {
  console.log(`Interactive resume listening on http://localhost:${port}`);
});

