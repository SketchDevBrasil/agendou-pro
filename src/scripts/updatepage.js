import { auth, db, storage } from '../firebase-config.js';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

document.addEventListener('DOMContentLoaded', () => {
  const updatePageForm = document.getElementById('update-page-form');
  const pageNameInput = document.getElementById('page-name');
  const pageUrlPreview = document.getElementById('page-url');
  const modalidadeSelect = document.getElementById('modalidade');
  const outraModalidadeInput = document.getElementById('outra-modalidade');
  const paisInput = document.getElementById('pais');
  const estadoInput = document.getElementById('estado');
  const cidadeInput = document.getElementById('cidade');
  const ruaInput = document.getElementById('rua');
  const cepInput = document.getElementById('cep');
  const logoInput = document.getElementById('logo');
  const logoPreview = document.getElementById('logo-preview');
  const logoImage = document.getElementById('logo-image');
  const limiteAgendamentosInput = document.getElementById('limite-agendamentos');
  const upgradeProContainer = document.getElementById('upgrade-pro-container');
  const tipoFreeCheckbox = document.getElementById('tipo-free');
  const tipoProCheckbox = document.getElementById('tipo-pro');
  const logoModal = document.getElementById('logo-modal');
  const logoToCrop = document.getElementById('logo-to-crop');
  const closeLogoModal = document.getElementById('close-logo-modal');
  const cropLogoButton = document.getElementById('crop-logo-button');
  const pageSelectionModal = document.getElementById('page-selection-modal');
  const closeModalButton = document.getElementById('close-modal-button');
  const pageListContainer = document.getElementById('page-list-container');

  let cropper;
  let pageId;

  // Verifica se o usuário está autenticado
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      alert('Usuário não autenticado. Faça login para continuar.');
      window.location.href = '/login.html';
      return;
    }

    // Carrega as páginas do usuário
    const loadUserPages = async () => {
      const pagesRef = collection(db, 'pages');
      const q = query(pagesRef, where('ownerUid', '==', user.uid));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert('Você não possui uma página. Redirecionando para a página de criação...');
        window.location.href = '/createpage.html';
        return;
      }

      // Se o usuário tiver apenas uma página, carrega os dados diretamente
      if (querySnapshot.size === 1) {
        const pageDoc = querySnapshot.docs[0];
        pageId = pageDoc.id;
        loadPageData(pageDoc.data());
        return;
      }

      // Se o usuário tiver mais de uma página, exibe o modal de seleção
      if (pageSelectionModal) pageSelectionModal.style.display = 'flex';
      if (pageListContainer) pageListContainer.innerHTML = '';

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
          <button onclick="selectPage('${doc.id}')">Selecionar</button>
        `;
        if (pageListContainer) pageListContainer.appendChild(pageItem);
      });

    };




    // Carrega os dados da página selecionada
    const loadPageData = async (pageData) => {
      if (pageSelectionModal) pageSelectionModal.style.display = 'none';

      // Preenche os campos do formulário
      if (pageNameInput) pageNameInput.value = pageData.pageName;
      if (pageUrlPreview) pageUrlPreview.textContent = `https://agendou.web.app/id-${pageData.pageUrl}`;
      if (modalidadeSelect) modalidadeSelect.value = pageData.modalidade;
      if (paisInput) paisInput.value = pageData.endereco.pais;
      if (estadoInput) estadoInput.value = pageData.endereco.estado;
      if (cidadeInput) cidadeInput.value = pageData.endereco.cidade;
      if (ruaInput) ruaInput.value = pageData.endereco.rua;
      if (cepInput) cepInput.value = pageData.endereco.cep;
      if (limiteAgendamentosInput) limiteAgendamentosInput.value = pageData.limiteAgendamentosPorHora;

      // Define o tipo de página (Free ou Pro)
      if (tipoFreeCheckbox && tipoProCheckbox) {
        if (pageData.tipoPagina === 'free') {
          tipoFreeCheckbox.checked = true;
          tipoProCheckbox.checked = false;
        } else {
          tipoFreeCheckbox.checked = false;
          tipoProCheckbox.checked = true;
        }
      }

      // Carrega os horários dos dias da semana
      Object.entries(pageData.horarios).forEach(([dia, horarios]) => {
        const checkbox = document.querySelector(`.dia-checkbox[value="${dia}"]`);
        if (checkbox) {
          checkbox.checked = true;
          const diaContainer = checkbox.closest('.dia');
          const horariosExpandidos = diaContainer.querySelector('.horarios-expandidos');
          if (horariosExpandidos) {
            horariosExpandidos.style.display = 'block';
            const inputsHorarios = horariosExpandidos.querySelectorAll('input[type="time"]');
            inputsHorarios.forEach(input => input.disabled = false);

            diaContainer.querySelector('.horario-manha-inicio').value = horarios.manha.split(' às ')[0];
            diaContainer.querySelector('.horario-manha-fim').value = horarios.manha.split(' às ')[1];
            diaContainer.querySelector('.horario-almoco-inicio').value = horarios.almoco.split(' às ')[0];
            diaContainer.querySelector('.horario-almoco-fim').value = horarios.almoco.split(' às ')[1];
            diaContainer.querySelector('.horario-tarde-inicio').value = horarios.tarde.split(' às ')[0];
            diaContainer.querySelector('.horario-tarde-fim').value = horarios.tarde.split(' às ')[1];
          }
        }
      });


      // Adiciona event listeners aos checkboxes dos dias da semana
      document.querySelectorAll('.dia-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
          const diaContainer = e.target.closest('.dia'); // Encontra o container do dia
          const horariosExpandidos = diaContainer.querySelector('.horarios-expandidos'); // Encontra o seletor de horários

          if (e.target.checked) {
            // Se o checkbox estiver marcado, mostra os horários
            horariosExpandidos.style.display = 'block';
            // Habilita os inputs de horário
            horariosExpandidos.querySelectorAll('input[type="time"]').forEach(input => input.disabled = false);
          } else {
            // Se o checkbox estiver desmarcado, oculta os horários
            horariosExpandidos.style.display = 'none';
            // Desabilita os inputs de horário
            horariosExpandidos.querySelectorAll('input[type="time"]').forEach(input => input.disabled = true);
          }
        });
      });


      // Carrega a logo da página
      if (logoImage && pageData.logoUrl) {
        logoImage.src = pageData.logoUrl;
        if (logoPreview) logoPreview.style.display = 'block';
      }

      // Mostra o container de upgrade para Pro se a página for do tipo Free
      if (upgradeProContainer && pageData.tipoPagina === 'free') {
        upgradeProContainer.classList.remove('hidden');
      }
    };


    // Função para selecionar uma página
    window.selectPage = async (selectedPageId) => {
      pageId = selectedPageId;
      const pageRef = doc(db, 'pages', pageId);
      const pageDoc = await getDoc(pageRef);
      if (pageDoc.exists()) {
        loadPageData(pageDoc.data());
      }

      // Fecha o modal após selecionar uma página
      if (pageSelectionModal) pageSelectionModal.style.display = 'none';
    };

    // Remove o fechamento automático do modal ao clicar no botão de fechar
    if (closeModalButton) {
      closeModalButton.addEventListener('click', () => {
        // Não fecha o modal aqui, apenas adiciona um aviso ou outra lógica
        alert('Selecione uma página para continuar.');
      });
    }

    // Atualiza o link da página em tempo real
    if (pageNameInput && pageUrlPreview) {
      pageNameInput.addEventListener('input', () => {
        // Remove espaços extras, converte para minúsculas e substitui caracteres especiais
        const pageUrl = pageNameInput.value
          .trim() // Remove espaços no início e no fim
          .toLowerCase() // Converte para minúsculas
          .replace(/\s+/g, '-') // Substitui espaços por hífens
          .replace(/[^a-z0-9-]/g, ''); // Remove caracteres especiais, mantendo apenas letras, números e hífens

        // Atualiza o texto do preview da URL
        pageUrlPreview.textContent = `https://agendou.web.app/id-${pageUrl}`;
      });
    }

    // Garante que apenas um checkbox (Free ou Pro) seja selecionado
    if (tipoFreeCheckbox && tipoProCheckbox) {
      tipoFreeCheckbox.addEventListener('change', () => {
        if (tipoFreeCheckbox.checked) {
          tipoProCheckbox.checked = false;
        }
      });

      tipoProCheckbox.addEventListener('change', () => {
        if (tipoProCheckbox.checked) {
          tipoFreeCheckbox.checked = false;
        }
      });
    }

    // Abre o modal de corte de logo
    if (logoInput) {
      logoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (logoToCrop) logoToCrop.src = event.target.result;
            if (logoModal) logoModal.style.display = 'flex';
            if (cropper) cropper.destroy();
            if (logoToCrop) {
              cropper = new Cropper(logoToCrop, {
                aspectRatio: 1,
                viewMode: 1,
              });
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Fecha o modal de corte de logo
    if (closeLogoModal) {
      closeLogoModal.addEventListener('click', () => {
        if (logoModal) logoModal.style.display = 'none';
        if (cropper) cropper.destroy();
      });
    }

    // Corta a logo e faz o upload
    if (cropLogoButton) {
      cropLogoButton.addEventListener('click', async () => {
        if (cropper) {
          const croppedCanvas = cropper.getCroppedCanvas();
          if (logoImage) logoImage.src = croppedCanvas.toDataURL();
          if (logoPreview) logoPreview.style.display = 'block';
          if (logoModal) logoModal.style.display = 'none';
          cropper.destroy();

          croppedCanvas.toBlob(async (blob) => {
            const user = auth.currentUser;
            if (!user) {
              alert('Usuário não autenticado. Faça login para continuar.');
              return;
            }

            // Define o caminho no Storage com o UID do usuário e o ID da página
            const storageRef = ref(storage, `logos/${user.uid}/${pageId}/logo`);

            // Faz o upload da nova logo
            const uploadTask = uploadBytesResumable(storageRef, blob);

            uploadTask.on('state_changed',
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
              },
              (error) => {
                console.error('Erro ao fazer upload da imagem:', error);
              },
              async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                const pageRef = doc(db, 'pages', pageId);
                await updateDoc(pageRef, { logoUrl: downloadURL });
                alert('Logo atualizada com sucesso!');
              }
            );
          }, 'image/png');
        }
      });
    }

    // Atualiza o formulário ao enviar
    if (updatePageForm) {
      updatePageForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Gera o pageUrl com base no pageName
        const pageUrl = pageNameInput.value.trim().toLowerCase().replace(/\s+/g, '-');

        const updatedPageData = {
          pageName: pageNameInput.value.trim(),
          pageUrl: pageUrl,
          modalidade: modalidadeSelect.value,
          endereco: {
            pais: paisInput.value.trim(),
            estado: estadoInput.value.trim(),
            cidade: cidadeInput.value.trim(),
            rua: ruaInput.value.trim(),
            cep: cepInput.value.trim(),
          },
          horarios: {},
          limiteAgendamentosPorHora: parseInt(limiteAgendamentosInput.value, 10),
          tipoPagina: tipoProCheckbox.checked ? 'pro' : 'free',
        };

        // Coleta os horários dos dias da semana
        document.querySelectorAll('.dia-checkbox').forEach(checkbox => {
          if (checkbox.checked) {
            const dia = checkbox.value;
            const diaContainer = checkbox.closest('.dia');
            updatedPageData.horarios[dia] = {
              manha: `${diaContainer.querySelector('.horario-manha-inicio').value} às ${diaContainer.querySelector('.horario-manha-fim').value}`,
              almoco: `${diaContainer.querySelector('.horario-almoco-inicio').value} às ${diaContainer.querySelector('.horario-almoco-fim').value}`,
              tarde: `${diaContainer.querySelector('.horario-tarde-inicio').value} às ${diaContainer.querySelector('.horario-tarde-fim').value}`,
            };
          }
        });

        // Atualiza o documento no Firestore
        const pageRef = doc(db, 'pages', pageId);
        await updateDoc(pageRef, updatedPageData);

        alert('Alterações salvas com sucesso!');
        window.location.reload();
      });
    }

    // Carrega as páginas do usuário ao iniciar
    await loadUserPages();
  });
});