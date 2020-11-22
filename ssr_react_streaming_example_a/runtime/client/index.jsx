import React from "react";
import { hydrate } from "react-dom";
import { BrowserRouter, matchPath, Route, Switch } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import routes from "../routing/routes";

let matchedRoute = null;
for (const route of routes) {
  const match = matchPath(location.pathname, route);
  if (match) {
    matchedRoute = route;
    break;
  }
}

let InitialComponent = null;
if (matchedRoute) {
  const initialMod = await matchedRoute.import();
  InitialComponent = initialMod.default;
}

function lazyRoute(route) {
  const Component = React.lazy(() => route.import());
  const LazyRoute = () => (
    <React.Suspense fallback="">
      <Component />
    </React.Suspense>
  );
  LazyRoute.displayName = `LazyRoute(${route.module})`;

  return LazyRoute;
}

const routerSwitch = (
  <Switch>
    {routes.map((route) => {
      const Component =
        matchedRoute && InitialComponent && matchedRoute.path === route.path
          ? InitialComponent
          : lazyRoute(route);

      return (
        <Route
          key={route.path}
          exact={route.exact}
          path={route.path}
          component={Component}
        />
      );
    })}
  </Switch>
);

hydrate(
  <HelmetProvider>
    <BrowserRouter>{routerSwitch}</BrowserRouter>
  </HelmetProvider>,
  document.getElementById("__app__")
);
