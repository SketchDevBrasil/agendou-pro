import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import Dotenv from 'dotenv-webpack';

// Corrige __dirname no ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: 'development',
  entry: {
    index: './src/index.js', // Ponto de entrada para index.html
    authIndex: './src/scripts/authIndex.js', // Ponto de entrada para index.html (autenticação)
    admin: './src/scripts/verificarAuth.js', // Ponto de entrada para admin.html
    login: './src/scripts/authLogin.js', // Ponto de entrada para login.html
  },
  output: {
    filename: 'scripts/[name].bundle.js', // Gera arquivos como index.bundle.js, admin.bundle.js, etc.
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: '/',
    assetModuleFilename: 'assets/images/[name][ext]',
  },
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    hot: true,
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name][ext]',
        },
      },
      {
        test: /\.html$/i,
        use: ['html-loader'],
      },
    ],
  },
  plugins: [
    // Página inicial (index.html)
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      chunks: ['index', 'authIndex'], // Inclui os chunks "index" e "authIndex"
    }),
    // Página de Admin (admin.html)
    new HtmlWebpackPlugin({
      template: './src/public/admin.html',
      filename: 'admin.html',
      chunks: ['admin'], // Inclui o chunk "admin"
    }),
    // Página de Login (login.html)
    new HtmlWebpackPlugin({
      template: './src/public/login.html',
      filename: 'login.html',
      chunks: ['login'], // Inclui o chunk "login"
    }),
    // Página 404 (404.html)
    new HtmlWebpackPlugin({
      template: './src/public/404.html',
      filename: '404.html',
      chunks: [], // Não inclui nenhum chunk (página estática)
    }),
    // Página de Estabelecimento (estabelecimento.html)
    new HtmlWebpackPlugin({
      template: './src/public/estabelecimento.html',
      filename: 'estabelecimento.html',
      chunks: [], // Não inclui nenhum chunk (página estática)
    }),
    // Página de Políticas (politicas.html)
    new HtmlWebpackPlugin({
      template: './src/public/politicas.html',
      filename: 'politicas.html',
      chunks: [], // Não inclui nenhum chunk (página estática)
    }),
    new MiniCssExtractPlugin({
      filename: 'styles/[name].css', // Gera arquivos CSS separados
    }),
    new Dotenv(),
  ],
};