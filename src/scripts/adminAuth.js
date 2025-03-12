import { auth } from '../firebase-config.js'; // Importa o auth
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore'; // Importa as funções do Firestore
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'; // Importa as funções do Storage
import { onAuthStateChanged, sendEmailVerification } from 'firebase/auth';

// Inicializa o Firestore e o Storage
const db = getFirestore();
const storage = getStorage();

// Variável para armazenar a instância do Cropper
let cropper;

// Função para criar o perfil do usuário no Firestore
const createUserProfile = async (user) => {
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    // Cria um perfil padrão se não existir
    const defaultArroba = "user_" + Date.now(); // @ padrão com timestamp
    await setDoc(userDocRef, {
      displayName: user.displayName || "Não informado",
      email: user.email,
      arroba: defaultArroba,
      photoURL: "../assets/images/user.png", // Imagem padrão
      createdAt: new Date(),
    });
    console.log("Perfil do usuário criado com sucesso!");
  }
};

// Aguarda o DOM ser carregado
document.addEventListener('DOMContentLoaded', () => {
  // Referências aos elementos da página
  const userImage = document.getElementById('user-image');
  const userName = document.getElementById('user-name');
  const userArroba = document.getElementById('user-arroba'); // Novo campo @
  const userEmail = document.getElementById('user-email');
  const userUid = document.getElementById('user-uid');
  const verifyMessageDiv = document.getElementById('verify-message');
  const verifyEmailButton = document.getElementById('btn-verify');
  const updateProfileButton = document.getElementById('update-profile-button');
  const uploadModal = document.getElementById('upload-modal');
  const closeUploadModalButton = document.getElementById('close-upload-modal');
  const uploadForm = document.getElementById('upload-form');
  const fileInput = document.getElementById('file-input');
  const editNameModal = document.getElementById('edit-name-modal');
  const closeEditModalButton = document.getElementById('close-edit-modal');
  const editNameInput = document.getElementById('edit-name-input');
  const imageToCrop = document.getElementById('image-to-crop');
  const editArrobaModal = document.getElementById('edit-arroba-modal'); // Novo modal de edição de @
  const closeArrobaModalButton = document.getElementById('close-arroba-modal'); // Botão para fechar o modal de @
  const editArrobaInput = document.getElementById('edit-arroba-input'); // Input para editar o @

  // Função para abrir o modal de edição de nome
  window.openEditNameModal = () => {
    editNameModal.style.display = 'flex';
  };

  // Função para fechar o modal de edição de nome
  window.closeEditNameModal = () => {
    editNameModal.style.display = 'none';
  };

  // Função para salvar o nome no Firestore
  window.saveName = async () => {
    const newName = editNameInput.value.trim();
    if (newName) {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        try {
          // Atualiza o nome no Firestore
          await updateDoc(userDocRef, {
            displayName: newName,
          });

          // Atualiza o nome na página
          userName.textContent = "Nome: " + newName;
          closeEditNameModal();
          alert("Nome atualizado com sucesso!");
        } catch (error) {
          console.error("Erro ao atualizar o nome:", error);
          alert("Não foi possível atualizar o nome.");
        }
      }
    } else {
      alert("Por favor, insira um nome válido.");
    }
  };

  // Função para abrir o modal de edição de @
  window.openEditArrobaModal = () => {
    document.getElementById('arroba-error').style.display = 'none'; // Oculta a mensagem de erro
    editArrobaModal.style.display = 'flex';
  };

  // Função para fechar o modal de edição de @
  window.closeEditArrobaModal = () => {
    editArrobaModal.style.display = 'none';
  };

  // Função para salvar o @ no Firestore
  window.saveArroba = async () => {
    const newArroba = editArrobaInput.value.trim();
    if (newArroba) {
      // Valida o comprimento do @
      if (newArroba.length > 23) {
        alert("O @ deve ter no máximo 23 caracteres.");
        return;
      }

      // Valida o formato do @ (apenas letras minúsculas, números e _)
      const regex = /^[a-z0-9_]+$/;
      if (!regex.test(newArroba)) {
        alert("O @ deve conter apenas letras minúsculas, números e underscores (_).");
        return;
      }

      // Verifica se o @ já existe
      const isUnique = await isArrobaUnique(newArroba);
      if (!isUnique) {
        document.getElementById('arroba-error').style.display = 'block';
        return;
      }

      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        try {
          // Atualiza o @ no Firestore
          await updateDoc(userDocRef, {
            arroba: newArroba,
          });

          // Atualiza o @ na página
          userArroba.textContent = "@" + newArroba;
          closeEditArrobaModal();
          alert("@ atualizado com sucesso!");
        } catch (error) {
          console.error("Erro ao atualizar o @:", error);
          alert("Não foi possível atualizar o @.");
        }
      }
    } else {
      alert("Por favor, insira um @ válido.");
    }
  };

  // Função para abrir o modal de upload
  if (updateProfileButton) {
    updateProfileButton.addEventListener('click', () => {
      if (uploadModal) {
        uploadModal.style.display = 'flex';
      }
    });
  }

  // Função para fechar o modal de upload
  if (closeUploadModalButton) {
    closeUploadModalButton.addEventListener('click', () => {
      if (uploadModal) {
        uploadModal.style.display = 'none';
        if (cropper) {
          cropper.destroy(); // Destrói o Cropper ao fechar o modal
        }
      }
    });
  }

  // Função para fechar o modal de edição de nome
  if (closeEditModalButton) {
    closeEditModalButton.addEventListener('click', () => {
      if (editNameModal) {
        editNameModal.style.display = 'none';
      }
    });
  }

  // Função para fechar o modal de edição de @
  if (closeArrobaModalButton) {
    closeArrobaModalButton.addEventListener('click', () => {
      if (editArrobaModal) {
        editArrobaModal.style.display = 'none';
      }
    });
  }

  // Fechar o modal ao clicar fora dele
  window.addEventListener('click', (event) => {
    if (event.target === uploadModal) {
      uploadModal.style.display = 'none';
      if (cropper) {
        cropper.destroy(); // Destrói o Cropper ao fechar o modal
      }
    }
    if (event.target === editNameModal) {
      editNameModal.style.display = 'none';
    }
    if (event.target === editArrobaModal) {
      editArrobaModal.style.display = 'none';
    }
  });

  // Função para enviar e-mail de verificação
  if (verifyEmailButton) {
    verifyEmailButton.addEventListener('click', () => {
      const user = auth.currentUser;
      if (user) {
        sendEmailVerification(user)
          .then(() => {
            alert("E-mail de verificação enviado. Por favor, verifique sua caixa de entrada.");
          })
          .catch((error) => {
            console.error("Erro ao enviar e-mail de verificação:", error);
            alert("Não foi possível enviar o e-mail de verificação.");
          });
      }
    });
  }

  // Função para fazer upload da imagem e atualizar o perfil
  if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault(); // Evita o comportamento padrão do formulário

      const user = auth.currentUser;
      if (user && fileInput.files.length > 0) {
        const file = fileInput.files[0];

        // Verifica se o Cropper está ativo
        if (cropper) {
          // Obtém a imagem recortada como um canvas
          const canvas = cropper.getCroppedCanvas({
            width: 200,
            height: 200,
          });

          // Converte o canvas em um Blob
          canvas.toBlob(async (blob) => {
            // Define o caminho no Storage com o UID do usuário
            const storageRef = ref(storage, `profile-images/${user.uid}/profile-picture`);

            // Define os metadados com o UID do usuário
            const metadata = {
              customMetadata: {
                uid: user.uid,
              },
            };

            // Mostra a barra de progresso
            const progressBarContainer = document.getElementById('progress-bar-container');
            const progressBar = document.getElementById('progress-bar');

            if (progressBarContainer && progressBar) {
              progressBarContainer.style.display = 'block';
              progressBar.style.width = '0%';
            }

            // Configura o upload com progresso
            const uploadTask = uploadBytesResumable(storageRef, blob, metadata);

            // Monitora o progresso do upload
            uploadTask.on(
              'state_changed',
              (snapshot) => {
                // Calcula o progresso em porcentagem
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (progressBar) {
                  progressBar.style.width = `${progress}%`;
                }
              },
              (error) => {
                console.error("Erro ao fazer upload da imagem:", error);
                alert("Não foi possível atualizar a imagem de perfil.");
                if (progressBarContainer) {
                  progressBarContainer.style.display = 'none'; // Oculta a barra de progresso em caso de erro
                }
              },
              async () => {
                // Upload concluído com sucesso
                try {
                  // Obtém o link de download da imagem
                  const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                  console.log("Link da imagem:", downloadURL);

                  // Atualiza o perfil do usuário no Firestore com o novo link da imagem
                  const userDocRef = doc(db, 'users', user.uid);
                  await updateDoc(userDocRef, {
                    photoURL: downloadURL,
                  });

                  // Atualiza a imagem na página
                  if (userImage) {
                    userImage.src = downloadURL; // Atribui a URL diretamente
                    userImage.style.display = 'block';
                  }

                  // Fecha o modal
                  if (uploadModal) {
                    uploadModal.style.display = 'none';
                  }

                  alert("Imagem de perfil atualizada com sucesso!");
                } catch (error) {
                  console.error("Erro ao atualizar o perfil:", error);
                  alert("Não foi possível atualizar a imagem de perfil.");
                } finally {
                  if (progressBarContainer) {
                    progressBarContainer.style.display = 'none'; // Oculta a barra de progresso após o upload
                  }
                }
              }
            );
          }, 'image/jpeg', 0.9); // Define a qualidade da imagem (90%)
        }
      } else {
        alert("Nenhum arquivo selecionado ou usuário não autenticado.");
      }
    });
  }

  // Configura o Cropper.js quando uma imagem é selecionada
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          imageToCrop.src = event.target.result;
          imageToCrop.style.display = 'block';

          // Inicializa o Cropper.js
          if (cropper) {
            cropper.destroy(); // Destrói o Cropper anterior, se existir
          }
          cropper = new Cropper(imageToCrop, {
            aspectRatio: 1, // Define a proporção de corte como quadrado (1:1)
            viewMode: 1, // Impede que o usuário arraste a imagem para fora do contêiner
          });
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Verifica se há usuário autenticado
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log("Usuário autenticado:", user);

      // Cria o perfil do usuário se não existir
      await createUserProfile(user);

      // Atualiza as informações do usuário na página
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Atualiza o nome
        if (userName) userName.textContent = "Nome: " + (userData.displayName || "Não informado");

        // Atualiza o @
        if (userArroba) userArroba.textContent = "@: " + userData.arroba;

        // Atualiza o email
        if (userEmail) userEmail.textContent = "Email: " + user.email;

        // Atualiza o UID
        if (userUid) userUid.textContent = "UID: " + user.uid;

        // Atualiza a imagem
        if (userImage) {
          if (userData.photoURL) {
            userImage.src = userData.photoURL;
            userImage.style.display = 'block';
          } else {
            userImage.src = "../assets/images/user.png"; // Imagem padrão
            userImage.style.display = 'block';
          }
        }
      }

      // Verifica se o e-mail do usuário foi verificado
      if (verifyMessageDiv) {
        if (!user.emailVerified) {
          verifyMessageDiv.style.display = 'block';
        } else {
          verifyMessageDiv.style.display = 'none';
        }
      }
    } else {
      console.log("Nenhum usuário autenticado. Redirecionando para login...");
      window.location.href = "/login.html"; // Ajuste o caminho conforme sua rota de login
    }
  });

  // Função para verificar se o @ já existe na coleção users
  const isArrobaUnique = async (arroba) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('arroba', '==', arroba));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty; // Retorna true se o @ for único
  };
});