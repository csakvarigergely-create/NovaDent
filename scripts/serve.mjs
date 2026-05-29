import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "src");
const port = Number(process.env.PORT || 4173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp"
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://localhost:${port}`);
  const safePath = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(root, safePath === "/" ? "index.html" : safePath);
  const target = existsSync(filePath) ? filePath : path.join(root, "index.html");

  try {
    const body = await readFile(target);
    res.writeHead(200, { "Content-Type": types[path.extname(target)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(port, () => {
  console.log(`Preview running at http://localhost:${port}`);
});
