module.exports = {
  publicPath: "",
  // desabilita `source maps` para desativar o debug em produção
  // productionSourceMap: false,

  chainWebpack: (config) => {
    // vue inspect --plugin html
    // Alterar titulo do html
    config.plugin("html").tap((args) => {
      args[0].title = "Letreiro Digital";
      return args;
    });
  },

  devServer: {
    https: true,
  },
};
