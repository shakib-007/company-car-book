const path = require("path");
const jsonServer = require("json-server");

const port = Number(process.env.JSON_SERVER_PORT || 3001);
const host = process.env.JSON_SERVER_HOST || "127.0.0.1";
const dbFile = path.join(__dirname, "..", "db.json");

const server = jsonServer.create();
const router = jsonServer.router(dbFile);
const middlewares = jsonServer.defaults({ logger: false });

server.use(middlewares);
server.use(jsonServer.bodyParser);
server.use(router);

server.listen(port, host, () => {
  console.log(`JSON Server running at http://${host}:${port}`);
  console.log(`Watching ${dbFile}`);
});
