const express = require("express");

const bootstrap = require("./dist/server/runtime/main").default;

const app = express();

app.use("/_static", express.static("./dist"));

const initPromise = bootstrap().then((r) => r.default);
app.get("/*", async (req, res) => {
  const server = await initPromise;
  const html = await server(req.path);
  res.send(html);
  res.end();
});

app.listen(5001, () => console.log("SERVER STARTED"));
