const functions = require('firebase-functions');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

exports.servePage = functions.https.onRequest(async (req, res) => {
  try {
    const url = req.url || '';
    const regex = /\/id-([a-zA-Z0-9-]+)/;
    const match = url.match(regex);

    if (match) {
      const pageUrl = match[1];

      if (!pageUrl || typeof pageUrl !== 'string') {
        res.status(400).send('pageUrl inválido');
        return;
      }

      const pagesRef = admin.firestore().collection('pages');
      const querySnapshot = await pagesRef.where('pageUrl', '==', pageUrl).get();

      if (querySnapshot.empty) {
        res.status(404).send('Página não encontrada');
        return;
      }

      const pageData = querySnapshot.docs[0].data();

      // Redirecionamento direto com dados na URL
      const baseUrl = 'https://agendou.web.app/agendamento';
      const params = new URLSearchParams(pageData).toString(); // Transforma os dados em parâmetros da URL
      const redirectUrl = `${baseUrl}?${params}`;

      res.redirect(redirectUrl);

    } else {
      res.status(404).send('Página não encontrada');
    }
  } catch (error) {
    console.error('Erro na função:', error.message);
    res.status(500).send('Erro interno na função');
  }
});
