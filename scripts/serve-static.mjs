import { createReadStream, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const PORT = Number(process.env.PORT || process.env.E2E_PORT || 4173);

const mimeMap = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
};

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeMap[ext] || "application/octet-stream";
}

function sendText(res, status, text, contentType) {
  res.writeHead(status, {
    "content-type": contentType,
    "cache-control": "no-store",
  });
  res.end(text);
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url || "/", `http://127.0.0.1:${PORT}`);
  const normalizedPath = path.normalize(decodeURIComponent(url.pathname || "/"));
  const relativePath = normalizedPath === "/" ? "index.html" : normalizedPath.slice(1);
  const safePath = relativePath.replace(/\.{2,}/g, "");
  const fullPath = path.join(projectRoot, safePath);

  if (!fullPath.startsWith(projectRoot)) {
    sendText(response, 403, "forbidden", "text/plain; charset=utf-8");
    return;
  }

  if (!existsSync(fullPath)) {
    sendText(response, 404, "not found", "text/plain; charset=utf-8");
    return;
  }

  response.writeHead(200, {
    "content-type": getContentType(fullPath),
    "cache-control": "no-store",
  });

  createReadStream(fullPath).pipe(response);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`static server ready at http://127.0.0.1:${PORT}`);
});
