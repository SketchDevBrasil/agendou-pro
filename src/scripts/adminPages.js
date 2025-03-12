import { auth, db } from '../firebase-config.js';
import { collection, query, where, getDocs, limit, startAfter } from 'firebase/firestore';

document.addEventListener('DOMContentLoaded', () => {
  const profileHeaderppp = document.querySelector('.profile-headerppp');
  let lastVisibleDoc = null; // Armazena o último documento visível para paginação
  let isLoading = false; // Evita múltiplos carregamentos simultâneos
  const PAGE_SIZE = 2; // Número de itens por página

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = '/login.html';
      return;
    }

    const loadUserPages = async (startAfterDoc = null) => {
      if (isLoading) return; // Evita chamadas simultâneas
      isLoading = true;

      try {
        // Cria a consulta com ou sem `startAfter`
        let q;
        if (startAfterDoc) {
          q = query(
            collection(db, 'pages'),
            where('ownerUid', '==', user.uid),
            startAfter(startAfterDoc),
            limit(PAGE_SIZE)
          );
        } else {
          q = query(
            collection(db, 'pages'),
            where('ownerUid', '==', user.uid),
            limit(PAGE_SIZE)
          );
        }

        const querySnapshot = await getDocs(q);

        // Se for a primeira carga, limpa o container
        if (!startAfterDoc) {
          profileHeaderppp.innerHTML = '';
        }

        if (querySnapshot.empty) {
          if (!startAfterDoc) {
            const createPageButton = document.createElement('button');
            createPageButton.className = 'create-page-btn'; // Adiciona a classe de estilo
            createPageButton.textContent = 'Criar Página de Atendimento';
            createPageButton.onclick = () => {
              window.location.href = '/createpage.html';
            };
            profileHeaderppp.appendChild(createPageButton);
          }
          else {
            // Oculta o botão "Mostrar mais" se não houver mais páginas
            const showMoreButton = document.getElementById('show-more-pages');
            if (showMoreButton) showMoreButton.style.display = 'none';
          }
          return;
        }

        // Adiciona os resultados ao DOM antes do botão "Mostrar mais"
        querySnapshot.forEach((doc) => {
          const pageData = doc.data();
          const pageItem = document.createElement('div');
          pageItem.className = 'page-item';
          pageItem.innerHTML = `
            <div class="page-item-content">
              <img src="${pageData.logoUrl}" alt="Logo da página" class="page-logo" />
              <div>
                <p><strong>${pageData.pageName}</strong></p>
                <p>${pageData.modalidade}</p>
              </div>
            </div>
            <button onclick="window.location.href='/updatepage.html?id=${doc.id}'">Editar</button>
          `;
          profileHeaderppp.insertBefore(pageItem, document.getElementById('show-more-pages'));
        });

        // Atualiza o último documento visível para a próxima query
        lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

        // Adiciona ou atualiza o botão "Mostrar mais"
        let showMoreButton = document.getElementById('show-more-pages');
        if (!showMoreButton) {
          showMoreButton = document.createElement('button');
          showMoreButton.id = 'show-more-pages';
          showMoreButton.className = 'show-more-button';
          showMoreButton.textContent = 'Mostrar mais';
          profileHeaderppp.appendChild(showMoreButton);

          showMoreButton.addEventListener('click', async () => {
            await loadUserPages(lastVisibleDoc);
          });
        }
      } catch (error) {
        console.error('Erro ao carregar páginas:', error);
      } finally {
        isLoading = false; // Libera o carregamento
      }
    };

    // Carrega as primeiras páginas ao iniciar
    await loadUserPages();
  });
});
