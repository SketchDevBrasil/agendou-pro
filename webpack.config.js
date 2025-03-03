import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import Dotenv from 'dotenv-webpack';

// Corrige __dirname no ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: 'development', // Modo de desenvolvimento
  entry: {
    index: './src/index.js', // Ponto de entrada para index.html
    authIndex: './src/scripts/authIndex.js', // Ponto de entrada para index.html (autenticação)
    admin: './src/scripts/authAdmin.js', // Ponto de entrada para admin.html
    login: './src/scripts/authLogin.js', // Ponto de entrada para login.html
  },
  output: {
    filename: 'scripts/[name].bundle.js', // Gera arquivos como index.bundle.js, admin.bundle.js, etc.
    path: path.resolve(__dirname, 'dist'), // Diretório de saída
    clean: true, // Limpa o diretório de saída antes de cada build
    publicPath: '/', // Caminho base para os assets
    assetModuleFilename: 'assets/images/[name][ext]', // Caminho para imagens
  },
  devServer: {
    static: path.resolve(__dirname, 'dist'), // Diretório de arquivos estáticos
    hot: true, // Habilita Hot Module Replacement (HMR)
    port: 8080, // Define a porta (opcional, já que 8080 é o padrão)
    open: true, // Abre o navegador automaticamente
    watchFiles: ['src/**/*.html'], // Observa mudanças nos arquivos HTML
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Arquivos JavaScript
        exclude: /node_modules/, // Ignora a pasta node_modules
        use: {
          loader: 'babel-loader', // Usa o Babel para transpilar
          options: {
            presets: ['@babel/preset-env'], // Preset do Babel para compatibilidade
          },
        },
      },
      {
        test: /\.css$/, // Arquivos CSS
        use: [MiniCssExtractPlugin.loader, 'css-loader'], // Extrai CSS em arquivos separados
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i, // Arquivos de imagem
        type: 'asset/resource', // Trata como recurso estático
        generator: {
          filename: 'assets/images/[name][ext]', // Caminho de saída para imagens
        },
      },
      {
        test: /\.html$/i, // Arquivos HTML
        use: ['html-loader'], // Usa o html-loader para processar HTML
      },
    ],
  },
  plugins: [
    // Página inicial (index.html)
    new HtmlWebpackPlugin({
      template: './src/public/index.html',
      filename: 'index.html',
      chunks: ['index', 'authIndex'], // Inclui os chunks "index" e "authIndex"
    }),
    // Página de Admin (admin.html)
    new HtmlWebpackPlugin({
      template: './src/public/admin.html',
      filename: 'admin.html',
      chunks: ['admin'], // Inclui apenas o chunk "admin"
    }),
    // Página de Login (login.html)
    new HtmlWebpackPlugin({
      template: './src/public/login.html',
      filename: 'login.html',
      chunks: ['login'], // Inclui apenas o chunk "login"
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
    // Extrai CSS em arquivos separados
    new MiniCssExtractPlugin({
      filename: 'styles/[name].css', // Gera arquivos como index.css, admin.css, etc.
    }),
    // Carrega variáveis de ambiente do arquivo .env
    new Dotenv(),
  ],
};