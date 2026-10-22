require('./isolated-network-guard.cjs');
const path = require('path');
const fs = require('fs');
if (process.env.REACT_APP_API_BASE_URL !== 'http://127.0.0.1:18089') throw Error('Explicit isolated loopback backend required');
process.env.NODE_ENV = 'development';
process.env.BABEL_ENV = 'development';
process.env.DISABLE_ESLINT_PLUGIN = 'true';
const artifacts = path.resolve(__dirname, '../../verification-frontend/isolated');
fs.mkdirSync(artifacts, { recursive: true });
const paths = require('react-scripts/config/paths');
paths.appWebpackCache = path.join(artifacts, 'webpack-cache');
paths.appTsBuildInfoFile = path.join(artifacts, 'tsbuildinfo');
const config = require('react-scripts/config/webpack.config')('development');
if (config.cache) config.cache.cacheDirectory = paths.appWebpackCache;
function isolateLoaders(rules) {
  for (const rule of rules || []) {
    if (rule.loader?.includes('babel-loader')) rule.options.cacheDirectory = path.join(artifacts, 'babel-cache');
    isolateLoaders(rule.oneOf); isolateLoaders(rule.rules);
  }
}
isolateLoaders(config.module.rules);
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const settings = require('react-scripts/config/webpackDevServer.config')(undefined, '127.0.0.1');
Object.assign(settings, { host: '127.0.0.1', port: 3000, allowedHosts: ['127.0.0.1', 'localhost'], open: false });
const server = new WebpackDevServer(settings, webpack(config));
server.start().catch(error => { console.error(error); process.exitCode = 1; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.stop().then(() => process.exit()));
