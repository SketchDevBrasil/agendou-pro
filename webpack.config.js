const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  mode: 'development', // Altere para 'production' ao fazer o build para produção
  entry: './src/index.js', // Ponto de entrada do JavaScript
  output: {
    filename: 'bundle.js', // Nome do arquivo de saída
    path: path.resolve(__dirname, 'dist'), // Pasta de saída
    clean: true, // Limpa a pasta dist antes de cada build
  },
  devServer: {
    static: './dist', // Pasta para servir arquivos estáticos
    hot: true, // Ativa o Hot Module Replacement (HMR)
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Processa arquivos JavaScript
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.css$/, // Processa arquivos CSS
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i, // Processa imagens
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html', // Usa o arquivo HTML como template
    }),
    new MiniCssExtractPlugin({
      filename: 'styles/[name].css', // Gera arquivos CSS na pasta dist/styles/
    }),
    new Dotenv(), // Carrega variáveis de ambiente do arquivo .env
  ],
};