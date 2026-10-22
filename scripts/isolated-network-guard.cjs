// Test-only Node preload: reject non-loopback connections before CRA starts.
const net = require('net');
const connect = net.Socket.prototype.connect;
net.Socket.prototype.connect = function (...args) {
  const options = net._normalizeArgs(args)[0];
  if (!options.path && !['127.0.0.1', 'localhost', '::1'].includes(options.host || 'localhost')) {
    throw new Error('Isolated frontend blocked non-loopback connection');
  }
  return connect.apply(this, args);
};
