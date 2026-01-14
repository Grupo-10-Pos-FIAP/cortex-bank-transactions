const { mergeWithCustomize, customizeArray } = require("webpack-merge");
const path = require("path");
const webpack = require("webpack");
const Dotenv = require("dotenv-webpack");
const singleSpaDefaults = require("webpack-config-single-spa-react-ts");

module.exports = (webpackConfigEnv, argv) => {
  const defaultConfig = singleSpaDefaults({
    orgName: "cortex-bank",
    projectName: "transactions",
    webpackConfigEnv,
    argv,
    outputSystemJS: false,
  });

  const PORT = 3003;

  return mergeWithCustomize({
    customizeArray: customizeArray({
      plugins: (basePlugins, newPlugins) => {
        const filteredBasePlugins = basePlugins.filter(
          (plugin) => !(plugin instanceof webpack.DefinePlugin)
        );
        return [...filteredBasePlugins, ...newPlugins];
      },
    }),
  })(defaultConfig, {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    devServer: {
      hot: true,
      host: "0.0.0.0",
      port: PORT,
      allowedHosts: "all",
      historyApiFallback: true,
      watchFiles: ["src/**", "public/**"],
      client: {
        webSocketURL: {
          protocol: "ws",
          hostname: "localhost",
          port: PORT,
        },
      },
    },
    watchOptions: {
      poll: 1000,
      aggregateTimeout: 300,
      ignored: /node_modules/,
    },
    plugins: [
      new Dotenv({
        path: path.resolve(__dirname, ".env"),
        safe: false,
        systemvars: true,
      }),
      new webpack.DefinePlugin({
        "process.env.API_BASE_URL": JSON.stringify(
          process.env.API_BASE_URL || "http://localhost:8080"
        ),
        "process.env.USE_MOCK": JSON.stringify(process.env.USE_MOCK || ""),
        "process.env.MOCK_API_BASE_URL": JSON.stringify(
          process.env.MOCK_API_BASE_URL || "http://localhost:8080"
        ),
        "process.env.NODE_ENV": JSON.stringify(
          process.env.NODE_ENV || webpackConfigEnv.mode || "development"
        ),
      }),
    ],
  });
};
