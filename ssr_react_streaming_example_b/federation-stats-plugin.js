const webpack = require("webpack");

const PLUGIN_NAME = "FederationStatsPlugin";

class FederationStatsPlugin {
  constructor(options = { filename: "federation-stats.json" }) {
    if (!options || !options.filename) {
      throw new Error("filename option is required.");
    }

    this._options = options;
  }

  apply(compiler) {
    const federationPlugin =
      compiler.options.plugins &&
      compiler.options.plugins.find(
        (plugin) => plugin.constructor.name === "ModuleFederationPlugin"
      );

    if (!federationPlugin) {
      throw new Error("No ModuleFederationPlugin found.");
    }

    const exposedFiles = new Map(
      Object.entries(federationPlugin._options.exposes || {}).map(([k, v]) => [
        v,
        k,
      ])
    );

    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: PLUGIN_NAME,
          stage: compilation.constructor.PROCESS_ASSETS_STAGE_REPORT,
        },
        async () => {
          const stats = compilation.getStats().toJson({});

          const modules = stats.modules.filter(
            (mod) =>
              mod.issuerName === "container entry" && exposedFiles.has(mod.name)
          );

          const chunks = modules.map((mod) => {
            const exposedAs = exposedFiles.get(mod.name);
            const chunks = mod.chunks.map((chunkId) =>
              stats.chunks.find((chunk) => chunk.id === chunkId)
            );

            return {
              mod: exposedAs,
              chunks: chunks.reduce((p, c) => {
                c.siblings.forEach((s) => {
                  const chunk = stats.chunks.find((c) => c.id === s);
                  // const isShared = chunk.modules.some(
                  //   (m) => m.moduleType === "consume-shared-module"
                  // );

                  // if (!isShared) {
                    chunk.files.forEach((f) => p.push(f));
                  // }
                });
                c.files.forEach((f) => p.push(f));
                return p;
              }, []),
            };
          });

          const exposes = chunks.reduce(
            (p, c) => Object.assign(p, { [c.mod]: c.chunks }),
            {}
          );

          const remote =
            (federationPlugin._options.library &&
              federationPlugin._options.library.name) ||
            federationPlugin._options.name;

          const statsResult = {
            remote,
            exposes,
          };

          const statsJson = JSON.stringify(statsResult);
          const statsBuffer = Buffer.from(statsJson, "utf-8");
          const statsSource = {
            source: () => statsBuffer,
            size: () => statsBuffer.length,
          };

          const filename = this._options.filename;

          const asset = compilation.getAsset(filename);
          if (asset) {
            compilation.updateAsset(filename, statsSource);
          } else {
            compilation.emitAsset(filename, statsSource);
          }
        }
      );
    });
  }
}

module.exports = FederationStatsPlugin;
