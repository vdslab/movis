/** @type {import('next').NextConfig} */

const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  reactStrictMode: true,
  webpack: (config) => {
    config.plugins.push(
      new CopyPlugin({
        patterns: ["prisma/dev.db"],
      })
    );
    return config;
  },
};
