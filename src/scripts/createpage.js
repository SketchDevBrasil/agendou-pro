import { auth } from '../firebase-config.js';
import { getFirestore, doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

// Aguarda o DOM ser carregado
document.addEventListener('DOMContentLoaded', () => {
  // Inicializa o Firestore e o Storage
  const db = getFirestore();
  const storage = getStorage();

  // Referências aos elementos do formulário
  const createPageForm = document.getElementById('create-page-form');
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
  const logoModal = document.getElementById('logo-modal');
  const closeLogoModal = document.getElementById('close-logo-modal');
  const logoToCrop = document.getElementById('logo-to-crop');
  const cropLogoButton = document.getElementById('crop-logo-button');
  const limiteAgendamentosInput = document.getElementById('limite-agendamentos');
  const progressBarContainer = document.getElementById('progress-bar-container');
  const progressBar = document.getElementById('progress-bar');
  const tipoPaginaSelect = document.getElementById('tipo-pagina'); // Novo campo
  const statusPaginaContainer = document.getElementById('status-pagina-container'); // Novo campo (Ativo/Inativo)
  const statusPaginaSelect = document.getElementById('status-pagina'); // Novo campo (Ativo/Inativo)

  let cropper;

  // Função para verificar se o nome da página já existe
  const isPageNameUnique = async (pageName) => {
    const pagesRef = collection(db, 'pages');
    const q = query(pagesRef, where('pageName', '==', pageName));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty; // Retorna true se o nome for único
  };

  // Atualiza o link da página conforme o nome é digitado
  if (pageNameInput && pageUrlPreview) {
    pageNameInput.addEventListener('input', () => {
      const pageName = pageNameInput.value.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
      pageUrlPreview.textContent = `https://agendou.web.app/${pageName}`;
    });
  }

  // Função para validar se pelo menos um horário foi definido
  const validateHorarios = () => {
    const diasSelecionados = document.querySelectorAll('.dia-checkbox:checked');
    if (diasSelecionados.length === 0) {
      alert('Defina pelo menos um horário de atendimento.');
      return false;
    }
    return true;
  };

  // Função para aplicar as regras de Free e Pro
  const aplicarRegrasTipoPagina = () => {
    if (!tipoPaginaSelect || !statusPaginaContainer) return; // Verifica se os elementos existem

    const tipoPagina = tipoPaginaSelect.value;

    if (tipoPagina === 'free') {
      // Free: Com anúncios e não personalizável
      if (logoInput) logoInput.disabled = true;
      if (limiteAgendamentosInput) limiteAgendamentosInput.disabled = true;
      if (statusPaginaContainer) statusPaginaContainer.style.display = 'none'; // Oculta o campo Ativo/Inativo
    } else if (tipoPagina === 'pro') {
      // Pro: Sem anúncios e personalizável
      if (logoInput) logoInput.disabled = false;
      if (limiteAgendamentosInput) limiteAgendamentosInput.disabled = false;
      if (statusPaginaContainer) statusPaginaContainer.style.display = 'block'; // Exibe o campo Ativo/Inativo
    }
  };

  // Aplica as regras ao mudar a seleção
  if (tipoPaginaSelect) {
    tipoPaginaSelect.addEventListener('change', aplicarRegrasTipoPagina);
  }

  // Aplica as regras ao carregar a página (sem alerta)
  aplicarRegrasTipoPagina();

  // Abre o modal para cortar a logo
  if (logoInput) {
    logoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (logoToCrop) logoToCrop.src = event.target.result;
          if (logoModal) logoModal.style.display = 'flex'; // Exibe o modal

          // Inicializa o Cropper.js
          if (cropper) {
            cropper.destroy(); // Destrói qualquer instância anterior do Cropper
          }
          if (logoToCrop) {
            cropper = new Cropper(logoToCrop, {
              aspectRatio: 1, // Proporção 1:1
              viewMode: 1, // Impede que a imagem seja arrastada para fora do contêiner
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
      if (logoModal) logoModal.style.display = 'none'; // Oculta o modal
      if (cropper) {
        cropper.destroy(); // Destrói o Cropper ao fechar o modal
      }
    });
  }

  // Corta a logo e exibe a pré-visualização
  if (cropLogoButton) {
    cropLogoButton.addEventListener('click', () => {
      if (cropper) {
        const canvas = cropper.getCroppedCanvas({
          width: 200,
          height: 200,
        });
        canvas.toBlob((blob) => {
          if (logoImage) logoImage.src = URL.createObjectURL(blob); // Exibe a logo cortada
          if (logoPreview) logoPreview.style.display = 'block'; // Mostra a pré-visualização
          if (logoModal) logoModal.style.display = 'none'; // Fecha o modal
        }, 'image/jpeg', 0.9); // Qualidade de 90%
      }
    });
  }



  // Função para fazer upload da logo
// Função para fazer upload da logo
const uploadLogo = async (blob, pageId) => { // Adicione o pageId como parâmetro
  const user = auth.currentUser;
  if (!user) {
    alert('Usuário não autenticado. Faça login para continuar.');
    return;
  }

  // Define o caminho no Storage com o UID do usuário e o ID da página
  const logoRef = ref(storage, `logos/${user.uid}/${pageId}/logo`);

  // Mostra a barra de progresso
  if (progressBarContainer) progressBarContainer.style.display = 'block';
  if (progressBar) progressBar.style.width = '0%';

  const uploadTask = uploadBytesResumable(logoRef, blob);

  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (progressBar) progressBar.style.width = `${progress}%`;
      },
      (error) => {
        console.error('Erro ao fazer upload da logo:', error);
        alert('Não foi possível fazer upload da logo.');
        reject(error);
      },
      async () => {
        const logoUrl = await getDownloadURL(uploadTask.snapshot.ref);
        if (progressBarContainer) progressBarContainer.style.display = 'none';
        resolve(logoUrl); // Retorna a URL da logo
      }
    );
  });
};



  // Adiciona o evento de envio do formulário
  if (createPageForm) {
    createPageForm.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      // Valida se pelo menos um horário foi definido
      if (!validateHorarios()) {
        return;
      }
  
      const user = auth.currentUser;
      if (!user) {
        alert('Usuário não autenticado. Faça login para continuar.');
        return;
      }
  
      // Coleta os dados do formulário
      const pageName = pageNameInput ? pageNameInput.value.trim() : '';
      const modalidade = modalidadeSelect ? modalidadeSelect.value : '';
      const endereco = {
        pais: paisInput ? paisInput.value.trim() : '',
        estado: estadoInput ? estadoInput.value.trim() : '',
        cidade: cidadeInput ? cidadeInput.value.trim() : '',
        rua: ruaInput ? ruaInput.value.trim() : '',
        cep: cepInput ? cepInput.value.trim() : '',
      };
      const limiteAgendamentos = limiteAgendamentosInput ? parseInt(limiteAgendamentosInput.value, 10) : 1;
      const tipoPagina = tipoPaginaSelect ? tipoPaginaSelect.value : 'free';
      const statusPagina = tipoPagina === 'pro' && statusPaginaSelect ? statusPaginaSelect.value : 'ativo'; // Ativo/Inativo apenas para Pro
  
      // Verifica se o nome da página é único
      const isUnique = await isPageNameUnique(pageName);
      if (!isUnique) {
        alert('Já existe uma página com esse nome. Escolha outro nome.');
        return;
      }
  
      // Coleta os horários de atendimento
      const horarios = {};
      document.querySelectorAll('.dia').forEach(dia => {
        const checkbox = dia.querySelector('.dia-checkbox');
        if (checkbox && checkbox.checked) {
          const diaNome = checkbox.value;
          const manhaInicio = dia.querySelector('.horario-manha-inicio')?.value || '';
          const manhaFim = dia.querySelector('.horario-manha-fim')?.value || '';
          const almocoInicio = dia.querySelector('.horario-almoco-inicio')?.value || '';
          const almocoFim = dia.querySelector('.horario-almoco-fim')?.value || '';
          const tardeInicio = dia.querySelector('.horario-tarde-inicio')?.value || '';
          const tardeFim = dia.querySelector('.horario-tarde-fim')?.value || '';
  
          horarios[diaNome] = {
            manha: `${manhaInicio} às ${manhaFim}`,
            almoco: `${almocoInicio} às ${almocoFim}`,
            tarde: `${tardeInicio} às ${tardeFim}`,
          };
        }
      });
  
      // Cria a página no Firestore e obtém o ID
      const pageRef = doc(collection(db, 'pages')); // Gera um ID único
      const pageId = pageRef.id; // Obtém o ID da página
  
      // Faz upload da logo (se houver)
      let logoUrl = null;
      if (logoImage && logoImage.src && logoImage.src !== '#') {
        const logoBlob = await fetch(logoImage.src).then((res) => res.blob());
        logoUrl = await uploadLogo(logoBlob, pageId); // Passa o pageId para o upload
      }
  
      // Cria o objeto com os dados da página
      const pageData = {
        pageName: pageName,
        pageUrl: pageName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        modalidade: modalidade,
        endereco: endereco,
        horarios: horarios,
        limiteAgendamentosPorHora: limiteAgendamentos,
        logoUrl: logoUrl || null, // Garante que logoUrl seja null se não houver logo
        tipoPagina: tipoPagina, // Free ou Pro
        statusPagina: statusPagina, // Ativo ou Inativo (apenas para Pro)
        validade: false, // Por padrão, a página é criada como inativa
        ownerUid: user.uid,
        createdAt: new Date(),
      };
  
      try {
        // Salva a página no Firestore
        await setDoc(pageRef, pageData);
  
        alert('Página criada com sucesso!');
        window.location.href = '/updatepage.html'; // Redireciona para o perfil
      } catch (error) {
        console.error('Erro ao criar página:', error);
        alert('Não foi possível criar a página.');
      }
    });
  }

  // Habilita/desabilita campos de horário ao selecionar o dia
  document.querySelectorAll('.dia-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const diaContainer = e.target.closest('.dia');
      const horariosExpandidos = diaContainer.querySelector('.horarios-expandidos');
      const horarios = diaContainer.querySelectorAll('input[type="time"]');

      if (e.target.checked) {
        if (horariosExpandidos) horariosExpandidos.style.display = 'block'; // Exibe os horários
        horarios.forEach(horario => {
          if (horario) horario.disabled = false; // Habilita os campos de horário
        });
      } else {
        if (horariosExpandidos) horariosExpandidos.style.display = 'none'; // Oculta os horários
        horarios.forEach(horario => {
          if (horario) horario.disabled = true; // Desabilita os campos de horário
        });
      }
    });
  });
});