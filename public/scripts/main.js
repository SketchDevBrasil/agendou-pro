// Menu Hambúrguer
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');
const menuIcon = document.getElementById('menu-icon');

mobileMenu.addEventListener('click', () => {
  // Alterna a visibilidade do menu de navegação
  navLinks.classList.toggle('active');

  // Alterna entre as imagens do ícone de hambúrguer e o "X"
  if (menuIcon.src.includes('hamburger-icon.png')) {
    menuIcon.src = '../images/close-icon.png'; // Altera para o ícone de fechar
  } else {
    menuIcon.src = '../images/hamburger-icon.png'; // Volta para o ícone de hambúrguer
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

