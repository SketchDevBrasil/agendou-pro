const functions = require('firebase-functions');
const axios = require('axios');

const GIPHY_API_KEY = 'pg2uB8mBYXaUbG8R6MPG1EGQ1ely02BG'; // Substitua pela sua chave API do Giphy

// URLs base para cada tipo
const GIPHY_URLS = {
  Gif: 'https://api.giphy.com/v1/gifs/search',
  Sticker: 'https://api.giphy.com/v1/stickers/search',
  Text: 'https://api.giphy.com/v1/text/search', // Use o URL correto para Text, se disponível
};

exports.giphySearch = functions.https.onRequest(async (req, res) => {
  try {
    // Verifique se a solicitação é do tipo POST
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    // Obtenha os parâmetros da solicitação
    const { imageName, type } = req.body;

    // Verifique se os parâmetros necessários estão presentes
    if (!imageName || !type) {
      return res.status(400).send('imageName and type are required');
    }

    // Determine a URL com base no tipo recebido
    const searchUrl = GIPHY_URLS[type];

    if (!searchUrl) {
      return res.status(400).send('Invalid type. Valid types are Gif, Sticker, or Text');
    }

    // Faz a chamada à API do Giphy
    const response = await axios.get(searchUrl, {
      params: {
        api_key: GIPHY_API_KEY,
        q: imageName,
        limit: 100,
        offset: 0,
        rating: 'g',
        lang: 'en',
      },
    });

    // Mapeia a resposta para retornar apenas o nome e a URL
    const results = response.data.data.map(item => ({
      name: item.title || 'No title',
      url: item.images.fixed_height.url // Altere conforme necessário para o tamanho desejado
    }));

    // Envie a resposta com os dados do Giphy
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching data from Giphy:', error);
    res.status(500).send('Error fetching data from Giphy');
  }
});