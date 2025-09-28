const webpack = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Handle node: protocol imports
    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: require.resolve('buffer'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      util: require.resolve('util'),
      url: require.resolve('url'),
      fs: false,
      net: false,
      tls: false,
    };

    // Handle node: imports by aliasing them to their browser equivalents
    config.resolve.alias = {
      ...config.resolve.alias,
      'node:buffer': require.resolve('buffer'),
      'node:stream': require.resolve('stream-browserify'),
      'node:crypto': require.resolve('crypto-browserify'),
      'node:util': require.resolve('util'),
      'node:url': require.resolve('url'),
    };

    // Add a custom plugin to handle node: scheme
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^node:/,
        (resource) => {
          const moduleName = resource.request.replace('node:', '');
          switch (moduleName) {
            case 'buffer':
              resource.request = require.resolve('buffer');
              break;
            case 'stream':
              resource.request = require.resolve('stream-browserify');
              break;
            case 'crypto':
              resource.request = require.resolve('crypto-browserify');
              break;
            case 'util':
              resource.request = require.resolve('util');
              break;
            case 'url':
              resource.request = require.resolve('url');
              break;
            default:
              resource.request = require.resolve('util');
          }
        }
      )
    );

    // Provide polyfills for Node.js modules
    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser',
      })
    );

    return config;
  },
  transpilePackages: ['@lighthouse-web3/sdk', '@lighthouse-web3/kavach'],
};

module.exports = nextConfig;
