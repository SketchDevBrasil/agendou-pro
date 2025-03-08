// Menu Hambúrguer
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');
const menuIcon = document.getElementById('menu-icon');

mobileMenu.addEventListener('click', () => {
  // Alterna a visibilidade do menu de navegação
  navLinks.classList.toggle('active');

  // Alterna entre as imagens do ícone de hambúrguer e o "X"
  if (menuIcon.src.includes('hamburger-icon.png')) {
    menuIcon.src = '../assets/images/close-icon.png'; // Altera para o ícone de fechar
  } else {
    menuIcon.src = '../assets/images/hamburger-icon.png'; // Volta para o ícone de hambúrguer
  }
});



// Animação dos cards ao rolar a página
const cards = document.querySelectorAll('.card');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.5 }
);

cards.forEach((card) => {
  observer.observe(card);
});




const paraEmpresas = document.getElementById('btn-empresas');
const paraUsuarios = document.getElementById('btn-usuarios');

paraEmpresas.addEventListener('click', () => { showEmpresas() });
paraUsuarios.addEventListener('click', () => { showUsuarios() });


function showEmpresas() {
  // Alternar visibilidade dos elementos
  document.querySelectorAll('.empresa').forEach(el => el.style.display = 'block');
  document.querySelectorAll('.usuario').forEach(el => el.style.display = 'none');

  // Alternar classes dos botões
  document.getElementById('btn-empresas').classList.add('active');
  document.getElementById('btn-usuarios').classList.remove('active');

  // Atualizar textos
  document.getElementById('hero-title').textContent = "Agendamento Online Simples e Eficiente Para Empresas";
  document.getElementById('hero-subtitle').textContent = "Gerencie seus agendamentos, otimize seu tempo e aumente sua produtividade.";
  document.getElementById('funcionalidades-subtitle').textContent = "Tudo o que você precisa para gerenciar seus agendamentos de forma eficiente.";
  document.getElementById('benefits-subtitle').textContent = "Descubra como o Agendou pode transformar a gestão do seu negócio.";

  // Atualizar background
  const heroDiv = document.getElementById('home');
  if (heroDiv) {
    heroDiv.style.backgroundImage = "url('../assets/images/heroEmpresas.png')";
    heroDiv.style.backgroundSize = "cover"; // Faz a imagem cobrir toda a div
    heroDiv.style.backgroundPosition = "center"; // Centraliza a imagem
    heroDiv.style.backgroundRepeat = "no-repeat"; // Evita repetição da imagem
  } else {
    console.error("Elemento #home não encontrado.");
  }
}

function showUsuarios() {
  // Alternar visibilidade dos elementos
  document.querySelectorAll('.usuario').forEach(el => el.style.display = 'block');
  document.querySelectorAll('.empresa').forEach(el => el.style.display = 'none');

  // Alternar classes dos botões
  document.getElementById('btn-usuarios').classList.add('active');
  document.getElementById('btn-empresas').classList.remove('active');

  // Atualizar textos
  document.getElementById('hero-title').textContent = "Agendamento Online Simples e Eficiente Para Clientes";
  document.getElementById('hero-subtitle').textContent = "Encontre profissionais e agende serviços de forma rápida e fácil.";
  document.getElementById('funcionalidades-subtitle').textContent = "Tudo o que você precisa para agendar serviços de forma eficiente.";
  document.getElementById('benefits-subtitle').textContent = "Descubra como o Agendou pode facilitar sua vida.";

  // Atualizar background
  const heroDiv = document.getElementById('home');
  if (heroDiv) {
    heroDiv.style.backgroundImage = "url('../assets/images/heroAgendouCli.png')";
    heroDiv.style.backgroundSize = "cover"; // Faz a imagem cobrir toda a div
    heroDiv.style.backgroundPosition = "center"; // Centraliza a imagem
    heroDiv.style.backgroundRepeat = "no-repeat"; // Evita repetição da imagem
  } else {
    console.error("Elemento #home não encontrado.");
  }
}