import React from "react";
import { Switch, Route } from "react-router-dom";

const routes = [
  {
    exact: true,
    path: "/b/test",
    module: "./test",
    import: () => import("pages/test"),
  },
  {
    exact: true,
    path: "/b",
    module: "./index",
    import: () => import("pages/index"),
  },
];

export default routes;
