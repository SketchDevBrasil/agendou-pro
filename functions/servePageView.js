const functions = require('firebase-functions');
const admin = require('firebase-admin');
// Inicializa o Firebase apenas se necessário
if (!admin.apps.length) {
    admin.initializeApp();
  }

exports.servePage = functions.https.onRequest(async (req, res) => {
  const pageUrl = req.params.pageUrl; // Captura o pageUrl da URL

  try {
    // Busca a página no Firestore
    const pagesRef = admin.firestore().collection('pages');
    const querySnapshot = await pagesRef.where('pageUrl', '==', pageUrl).get();

    if (querySnapshot.empty) {
      res.status(404).send('Página não encontrada.');
      return;
    }

    const pageData = querySnapshot.docs[0].data();

    // Renderiza a página de agendamento
    res.send(`
      <html>
        <head>
          <title>${pageData.pageName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            p { color: #555; }
          </style>
        </head>
        <body>
          <h1>${pageData.pageName}</h1>
          <p>${pageData.description}</p>
          <h2>Horários de Atendimento</h2>
          <ul>
            ${Object.entries(pageData.horarios).map(([dia, horarios]) => `
              <li>
                <strong>${dia}:</strong>
                <ul>
                  <li>Manhã: ${horarios.manha}</li>
                  <li>Almoço: ${horarios.almoco}</li>
                  <li>Tarde: ${horarios.tarde}</li>
                </ul>
              </li>
            `).join('')}
          </ul>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Erro ao buscar página:', error);
    res.status(500).send('Erro ao carregar a página.');
  }
});