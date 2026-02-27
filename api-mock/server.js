const jsonServer = require("json-server");
const cors = require("cors");
const path = require("path");

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
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
