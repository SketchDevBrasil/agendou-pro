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

function showEmpresas() {
  document.querySelectorAll('.empresa').forEach(el => el.style.display = 'block');
  document.querySelectorAll('.usuario').forEach(el => el.style.display = 'none');
  document.getElementById('btn-empresas').classList.add('active');
  document.getElementById('btn-usuarios').classList.remove('active');
  document.getElementById('hero-title').textContent = "Agendamento Online Simples e Eficiente";
  document.getElementById('hero-subtitle').textContent = "Gerencie seus agendamentos, otimize seu tempo e aumente sua produtividade.";
  document.getElementById('funcionalidades-subtitle').textContent = "Tudo o que você precisa para gerenciar seus agendamentos de forma eficiente.";
  document.getElementById('benefits-subtitle').textContent = "Descubra como o Agendou pode transformar a gestão do seu negócio.";
}

function showUsuarios() {
  document.querySelectorAll('.usuario').forEach(el => el.style.display = 'block');
  document.querySelectorAll('.empresa').forEach(el => el.style.display = 'none');
  document.getElementById('btn-usuarios').classList.add('active');
  document.getElementById('btn-empresas').classList.remove('active');
  document.getElementById('hero-title').textContent = "Agendamento Online Simples e Eficiente";
  document.getElementById('hero-subtitle').textContent = "Encontre profissionais e agende serviços de forma rápida e fácil.";
  document.getElementById('funcionalidades-subtitle').textContent = "Tudo o que você precisa para agendar serviços de forma eficiente.";
  document.getElementById('benefits-subtitle').textContent = "Descubra como o Agendou pode facilitar sua vida.";
}