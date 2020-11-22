import React from "react";
import { renderToString } from "react-dom/server";
import { matchPath, StaticRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import routes from "../routing/routes";

const publicPath =
  process.env.NODE_ENV === "production"
    ? `https://${process.env.VERCEL_URL}/`
    : "http://localhost:5000/";

const bPublicPath =
  process.env.NODE_ENV === "production"
    ? "https://ssr-react-streaming-example-b.vercel.app/"
    : "http://localhost:5001/";

export default async function server(pathname) {
  let matchedPath = null;
  let matchedRoute = null;
  for (const route of routes) {
    const match = matchPath(pathname, route);
    if (match) {
      matchedPath = match;
      matchedRoute = route;
      break;
    }
  }

  if (!matchedRoute) {
    return null;
  }

  const pageMod = await matchedRoute.import();
  const Page = pageMod.default;

  const helmetContext = {};

  const body = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={pathname}>
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
    <script src="${bPublicPath}_static/client/pages/remote-entry.js"></script>
    <script src="${publicPath}_static/client/pages/remote-entry.js"></script>
    <script src="${publicPath}_static/client/runtime/main.js"></script>
  </body>
</html>
`;

  return html;
}
