import React from "react";
import { renderToString } from "react-dom/server";
import { matchPath, StaticRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import path from "path";
import express from "express";

import routes from "../routing/routes";

const app = express();

app.use("/_static", express.static(path.resolve(process.cwd(), "dist")));

const publicPath =
  process.env.NODE_ENV === "production"
    ? "https://calm-crag-28364.herokuapp.com/"
    : "http://localhost:5001/";

app.get("/*", async (req, res) => {
  let matchedPath = null;
  let matchedRoute = null;
  for (const route of routes) {
    const match = matchPath(req.path, route);
    if (match) {
      matchedPath = match;
      matchedRoute = route;
      break;
    }
  }

  if (!matchedRoute) {
    res.status(404).send("Page Not Found");
    return;
  }

  const pageMod = await matchedRoute.import();
  const Page = pageMod.default;

  const helmetContext = {};

  const body = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={req.path}>
        <Page />
      </StaticRouter>
    </HelmetProvider>
  );

  const { helmet } = helmetContext;

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    ${helmet.title.toString()}
    ${helmet.meta.toString()}
    ${helmet.link.toString()}
  </head>

  <body ${helmet.bodyAttributes.toString()}>
    <div id="__app__">${body}</div>
    <script src="${publicPath}_static/client/pages/remote-entry.js"></script>
    <script src="${publicPath}_static/client/runtime/main.js"></script>
  </body>
</html>
`;

  res.send(html);
});

app.listen(process.env.PORT || 5001, () =>
  console.log(`Listening on port ${process.env.PORT || 5001}`)
);
