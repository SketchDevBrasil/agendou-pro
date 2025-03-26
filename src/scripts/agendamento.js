import { db } from '../firebase-config.js';
import { collection, query, where, getDocs } from 'firebase/firestore';

document.addEventListener('DOMContentLoaded', () => {
  const pageNameElement = document.getElementById('page-name');
  const descricaoElement = document.getElementById('descricao');
  const pageUrlElement = document.getElementById('page-url');
  const modalidadeElement = document.getElementById('modalidade');
  const paisElement = document.getElementById('pais');
  const estadoElement = document.getElementById('estado');
  const cidadeElement = document.getElementById('cidade');
  const ruaElement = document.getElementById('rua');
  const cepElement = document.getElementById('cep');
  const logoImage = document.getElementById('logo-image');
  const limiteAgendamentosElement = document.getElementById('limite-agendamentos');
  const horariosContainer = document.getElementById('horarios-container');

  // Função para extrair o pageUrl da URL
  const getPageUrlFromUrl = () => {
    const path = window.location.pathname;
    const parts = path.split('/');
    const urlPart = parts.find(part => part.startsWith('id-'));
    return urlPart ? urlPart.replace('id-', '') : null;
  };

  // Função para carregar os dados da página pelo pageUrl
  const loadPageDataByUrl = async (pageUrl) => {
    if (!pageUrl) {
      alert('Página não encontrada.');
      window.location.href = '/';
    }

    const pagesRef = collection(db, 'pages');
    const q = query(pagesRef, where('pageUrl', '==', pageUrl));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const pageDoc = querySnapshot.docs[0];
      loadPageData(pageDoc.data());
    } else {
      alert('Página não encontrada.');
      window.location.href = '/';
    }
  };


// Adiciona um evento de clique
pageUrlElement.addEventListener('click', () => {
  // Obtém a URL atual ou gera uma dinâmica (como no seu exemplo)
  const currentUrl = window.location.href; // ou use uma URL personalizada
  // const customUrl = `https://agendou.web.app/id-${pageData.pageUrl}`; // Se pageData estiver definido
  
  // Verifica se a API de compartilhamento é suportada (navegadores móveis)
  if (navigator.share) {
    navigator.share({
      title: 'Compartilhar link',
      url: currentUrl, // ou customUrl
    })
    .catch(err => console.error('Erro ao compartilhar:', err));
  } 
  // Fallback para copiar a URL (navegadores desktop)
  else {
    navigator.clipboard.writeText(currentUrl) // ou customUrl
      .then(() => {
        alert('Link copiado para a área de transferência!');
      })
      .catch(err => {
        console.error('Erro ao copiar:', err);
        // Fallback mais antigo (para navegadores sem Clipboard API)
        const textarea = document.createElement('textarea');
        textarea.value = currentUrl; // ou customUrl
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Link copiado!');
      });
  }
});


  // Função para carregar os dados na página
  const loadPageData = (pageData) => {
    if (pageNameElement) pageNameElement.textContent = pageData.pageName || '';
    if (descricaoElement) descricaoElement.textContent = pageData.description || '';
    if (modalidadeElement) modalidadeElement.textContent = pageData.modalidade || '';
    if (paisElement) paisElement.textContent = pageData.endereco?.pais || '';
    if (estadoElement) estadoElement.textContent = pageData.endereco?.estado || '';
    if (cidadeElement) cidadeElement.textContent = pageData.endereco?.cidade || '';
    if (ruaElement) ruaElement.textContent = pageData.endereco?.rua || '';
    if (cepElement) cepElement.textContent = pageData.endereco?.cep || '';

    if (logoImage && pageData.logoUrl) {
      logoImage.src = pageData.logoUrl;
      logoImage.style.display = 'block';
    }

    if (limiteAgendamentosElement) limiteAgendamentosElement.textContent = pageData.limiteAgendamentosPorHora || 'Não especificado';

    // Carregar horários
    if (horariosContainer && pageData.horarios) {
      horariosContainer.innerHTML = '';
      Object.entries(pageData.horarios).forEach(([dia, horarios]) => {
        const diaDiv = document.createElement('div');
        diaDiv.innerHTML = `
          <h3>${dia.charAt(0).toUpperCase() + dia.slice(1)}</h3>
          <p>Manhã: ${horarios.manha || 'Fechado'}</p>
          <p>Almoço: ${horarios.almoco || 'Fechado'}</p>
          <p>Tarde: ${horarios.tarde || 'Fechado'}</p>
        `;
        horariosContainer.appendChild(diaDiv);
      });
    }
  };

  // Carregar os dados ao iniciar a página
  const pageUrl = getPageUrlFromUrl();
  loadPageDataByUrl(pageUrl);
});
