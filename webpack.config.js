import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import Dotenv from 'dotenv-webpack';

// Corrige __dirname no ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: 'production',
  entry: {
    indexImport: './src/scriptsImport/indexImport.js',
    loginImport: './src/scriptsImport/loginImport.js',
    adminImport: './src/scriptsImport/adminImport.js',
    createpageImport: './src/scriptsImport/createpageImport.js',
    updatepageImport: './src/scriptsImport/updatepageImport.js',
    agendamentoImport: './src/scriptsImport/agendamentoImport.js',
  },
  output: {
    filename: 'scripts/[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: '/',
    assetModuleFilename: 'assets/images/[name][ext]',
  },
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    hot: true,
    port: 8080,
    open: true,
    watchFiles: ['src/**/*.html'],
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
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        include: path.resolve(__dirname, 'src/assets/images'),
        generator: {
          filename: 'assets/images/[name][ext]',
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][ext]',
        },
      },
      {
        test: /\.html$/i,
        use: ['html-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/public/index.html',
      filename: 'index.html',
      chunks: ['indexImport'],
    }),
    new HtmlWebpackPlugin({
      template: './src/public/admin.html',
      filename: 'admin.html',
      chunks: ['adminImport'],
    }),
    new HtmlWebpackPlugin({
      template: './src/public/login.html',
      filename: 'login.html',
      chunks: ['loginImport'],
    }),
    new HtmlWebpackPlugin({
      template: './src/public/createpage.html',
      filename: 'createpage.html',
      chunks: ['createpageImport'],
    }),
    new HtmlWebpackPlugin({
      template: './src/public/updatepage.html',
      filename: 'updatepage.html',
      chunks: ['updatepageImport'],
    }),
    new HtmlWebpackPlugin({
      template: './src/public/agendamento.html',
      filename: 'agendamento.html',
      chunks: ['agendamentoImport'],
    }),
    new HtmlWebpackPlugin({
      template: './src/public/404.html',
      filename: '404.html',
      chunks: [],
    }),
    new HtmlWebpackPlugin({
      template: './src/public/politicas.html',
      filename: 'politicas.html',
      chunks: [],
    }),
    new MiniCssExtractPlugin({
      filename: 'styles/[name].css',
    }),
    new Dotenv(),
  ],
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  devtool: 'source-map',
  cache: {
    type: 'filesystem',
  },
};