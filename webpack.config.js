const { merge } = require("webpack-merge");
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

  return merge(defaultConfig, {
    // modify the webpack config however you'd like to by adding to this object
    devServer: {
        hot: true,
        host: "0.0.0.0",
        port: PORT,
        allowedHosts: "all",
        historyApiFallback: true,
        watchFiles: ["src//", "public//"],
  
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
  });
};
