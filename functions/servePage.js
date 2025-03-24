const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Inicializa o Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

const servePage = functions.https.onRequest(async (req, res) => {
  try {
    const url = req.url || '';
    const regex = /\/id-([a-zA-Z0-9-]+)/; // Captura o pageUrl da URL
    const match = url.match(regex);

    if (match) {
      const pageUrl = match[1]; // Extrai o pageUrl da URL

      // Validação do pageUrl
      if (!pageUrl || typeof pageUrl !== 'string') {
        res.status(400).send('pageUrl inválido');
        return;
      }

      // Consulta ao Firestore para buscar os dados da página
      const pagesRef = admin.firestore().collection('pages');
      const querySnapshot = await pagesRef.where('pageUrl', '==', pageUrl).get();

      if (querySnapshot.empty) {
        // Caso a página não seja encontrada
        res.status(404).send('Página não encontrada');
        return;
      }

      const pageData = querySnapshot.docs[0].data(); // Extrai os dados da página

      // Renderiza a página de visualização diretamente
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Visualização da Página</title>
        </head>
        <body>
          <h1>Detalhes da Página</h1>
          <div id="page-details">
            <p>Nome da Página: ${pageData.pageName}</p>
            <p>Descrição: ${pageData.description || 'Sem descrição'}</p>
            <p>Modalidade: ${pageData.modalidade}</p>
            <!-- Adicione mais campos conforme necessário -->
          </div>
        </body>
        </html>
      `;

      res.setHeader('Content-Type', 'text/html');
      res.set('Cache-Control', 'public, max-age=300'); // Cache de 5 minutos
      res.status(200).send(html);
    } else {
      // Caso o pageUrl não seja válido
      res.status(404).send('Página não encontrada');
    }
  } catch (error) {
    console.error('Erro na função:', error.message);
    res.status(500).send('Erro interno na função');
  }
});

module.exports = servePage;
