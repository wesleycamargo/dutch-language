import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const port = Number(process.env.PORT ?? 8090);
const root = resolve("src");

const mimeTypes: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function resolveRequestPath(urlPath: string): string | null {
  const decodedPath = decodeURIComponent(urlPath.split("?")[0] ?? "/");
  const requestedPath = decodedPath === "/" ? "/woordenschat_oefeningen_v1.html" : decodedPath;
  const filePath = normalize(join(root, requestedPath));

  if (!filePath.startsWith(root)) return null;
  return filePath;
}

const server = createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400);
    res.end("Bad request");
    return;
  }

  const filePath = resolveRequestPath(req.url);

  if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  res.writeHead(200, {
    "Content-Type": mimeTypes[extname(filePath)] ?? "application/octet-stream"
  });
  createReadStream(filePath).pipe(res);
});

server.listen(port, () => {
  console.log(`Serving ${root} at http://127.0.0.1:${port}`);
});
