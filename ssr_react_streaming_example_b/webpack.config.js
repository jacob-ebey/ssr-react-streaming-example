const path = require("path");

const webpack = require("webpack");
const WebpackNodeHttpChunkLoadingPlugin = require("@jacob-ebey/webpack-node-http-chunk-loading-plugin");

const FederationStatsPlugin = require("./federation-stats-plugin");

const package = require("./package.json");

const isProdBuild = process.env.NODE_ENV !== "development";

const publicPath = isProdBuild
  ? `https://${process.env.VERCEL_URL}/`
  : "http://localhost:5001/";

const shared = [
  {
    react: {
      singleton: true,
      requiredVersion: package.dependencies.react,
    },
  },
  {
    "react-helmet-async": {
      singleton: true,
      requiredVersion: package.dependencies["react-helmet-async"],
    },
  },
  {
    "react-router-dom": {
      singleton: true,
      requiredVersion: package.dependencies["react-router-dom"],
    },
  },
];

/**
 * @param {"client" | "server"} __BUILD_ENV__
 */
const remotes = (__BUILD_ENV__) => ({});

/** @type {import("webpack").Configuration} */
const baseConfig = {
  mode: isProdBuild ? "production" : "development",
  devtool: isProdBuild ? "source-map" : "inline-source-map",
  experiments: {
    topLevelAwait: true,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(
        isProdBuild ? "production" : "development"
      ),
    }),
  ],
};

/**
 * @param {"client" | "server"} __BUILD_ENV__
 * @returns {import("webpack").Configuration}
 */
function runtimeConfig(__BUILD_ENV__) {
  const conditionalPlugins = [];

  if (__BUILD_ENV__ === "client") {
    conditionalPlugins.push(new FederationStatsPlugin());
  }

  if (__BUILD_ENV__ === "server") {
    conditionalPlugins.push(new WebpackNodeHttpChunkLoadingPlugin());
  }

  return {
    ...baseConfig,
    entry:
      __BUILD_ENV__ === "client"
        ? "./runtime/bootstrap.js"
        : ["@babel/polyfill", "./runtime/bootstrap.js"],
    target: __BUILD_ENV__ === "client" ? "web" : "async-node",
    output: {
      path: path.resolve(process.cwd(), "dist", __BUILD_ENV__, "runtime"),
      publicPath: `${publicPath}_static/${__BUILD_ENV__}/runtime/`,
      ...(__BUILD_ENV__ === "server"
        ? { libraryTarget: "commonjs-module" }
        : {}),
    },
    ...(__BUILD_ENV__ === "client" ? {} : { target: "node" }),
    plugins: [
      ...baseConfig.plugins,
      ...conditionalPlugins,
      new webpack.DefinePlugin({
        __BUILD_ENV__: JSON.stringify(__BUILD_ENV__),
      }),
      new webpack.container.ModuleFederationPlugin({
        name: `${package.name}_runtime`,
        filename: "remote-entry.js",
        library:
          __BUILD_ENV__ === "client"
            ? { name: `${package.name}_runtime`, type: "var" }
            : { type: "commonjs-module" },
        shared,
        remotes: {
          ...remotes(__BUILD_ENV__),
          pages:
            __BUILD_ENV__ === "client"
              ? `${package.name}_pages`
              : "../pages/remote-entry.js",
        },
      }),
    ],
  };
}

/**
 * @param {"client" | "server"} __BUILD_ENV__
 * @returns {import("webpack").Configuration}
 */
function pagesConfig(__BUILD_ENV__) {
  const conditionalPlugins = [];

  if (__BUILD_ENV__ === "client") {
    conditionalPlugins.push(new FederationStatsPlugin());
  }

  if (__BUILD_ENV__ === "server") {
    conditionalPlugins.push(new WebpackNodeHttpChunkLoadingPlugin());
  }

  return {
    ...baseConfig,
    entry: "./noop.js",
    target: __BUILD_ENV__ === "client" ? "web" : "async-node",
    output: {
      path: path.resolve(process.cwd(), "dist", __BUILD_ENV__, "pages"),
      publicPath: `${publicPath}_static/${__BUILD_ENV__}/pages/`,
    },
    plugins: [
      ...baseConfig.plugins,
      ...conditionalPlugins,
      new webpack.container.ModuleFederationPlugin({
        name: `${package.name}_pages`,
        filename: "remote-entry.js",
        library:
          __BUILD_ENV__ === "client"
            ? { name: `${package.name}_pages`, type: "var" }
            : { type: "commonjs-module" },
        shared,
        exposes: {
          "./index": "./pages/index.jsx",
          "./test": "./pages/test.jsx",
        },
        remotes: remotes(__BUILD_ENV__),
      }),
    ],
  };
}

module.exports = [
  pagesConfig("client"),
  pagesConfig("server"),
  runtimeConfig("client"),
  runtimeConfig("server"),
];
