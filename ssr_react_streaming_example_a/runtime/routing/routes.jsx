import React from "react";
import { Switch, Route } from "react-router-dom";

const routes = [
  {
    exact: true,
    path: "/b/test",
    module: "./test",
    import: () => import("ssr_react_streaming_example_b_pages/test"),
  },
  {
    exact: true,
    path: "/b",
    module: "./test",
    import: () => import("ssr_react_streaming_example_b_pages/index"),
  },
  {
    exact: true,
    path: "/test",
    module: "./test",
    import: () => import("pages/test"),
  },
  {
    exact: true,
    path: "/",
    module: "./index",
    import: () => import("pages/index"),
  },
];

export default routes;
