const { defineConfig } = require('@vue/cli-service')
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
// module.exports = defineConfig({
//   transpileDependencies: true,
//   configureWebpack: {
//     resolve: {
//       fallback: {
//         'zlib': require.resolve('browserify-zlib'),
//         // 'util': false,
//         'assert': false,
//         'stream': require.resolve('stream-browserify'),
//       }
//     }
//   },
// })

// https://stackoverflow.com/questions/64557638/how-to-polyfill-node-core-modules-in-webpack-5
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new NodePolyfillPlugin()
    ]
  },
})
