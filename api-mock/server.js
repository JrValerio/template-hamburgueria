import jsonServer from "json-server";
import cors from "cors";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const server = jsonServer.create();
const router = jsonServer.router(join(__dirname, "db.json"));
const middlewares = jsonServer.defaults({ noCors: true });

server.use(cors());
server.use(middlewares);
server.use(jsonServer.bodyParser);

server.get("/health", (_req, res) => res.json({ ok: true }));

server.use(router);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`[api-mock] json-server running on :${PORT}`);
});
