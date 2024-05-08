const { defineConfig } = require('@vue/cli-service')
// element-ui按需加载
// 报错不存在需要降版本
const AutoImport = require("unplugin-auto-import/webpack");
const Components = require("unplugin-vue-components/webpack");
const { ElementPlusResolver } = require("unplugin-vue-components/resolvers");
module.exports = defineConfig({
  transpileDependencies: true,
  // 打包路径
  assetsDir: 'static',
  parallel: false,
  publicPath: '/',
  // 关闭eslint
  lintOnSave: false,
  // 为了解决一个报错 看着难受
  chainWebpack: (config) => {
    // debug时开启source-map
    config.devtool('source-map')
    config.plugin('define').tap((definitions) => {
      Object.assign(definitions[0], {
        __VUE_OPTIONS_API__: 'true',
        __VUE_PROD_DEVTOOLS__: 'false',
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
      })
      return definitions
    })
  },
  // 配置代理
  devServer: {
    // 关闭全屏报错显示
    client: {
      overlay: false,
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8088/api/', // 代理地址
        changeOrigin: true, // 允许跨域
        pathRewrite: {
          '^/api': '/' // 重写路径
        }
      }
    }
  },
  // element-ui按需加载
  configureWebpack: {
    plugins: [
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
  }
})
