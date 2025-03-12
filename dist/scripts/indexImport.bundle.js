/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/scripts/indexUi.js":
/*!********************************!*\
  !*** ./src/scripts/indexUi.js ***!
  \********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n// Menu Hambúrguer\nvar mobileMenu = document.getElementById('mobile-menu');\nvar navLinks = document.querySelector('.nav-links');\nvar menuIcon = document.getElementById('menu-icon');\nmobileMenu.addEventListener('click', function () {\n  // Alterna a visibilidade do menu de navegação\n  navLinks.classList.toggle('active');\n\n  // Alterna entre as imagens do ícone de hambúrguer e o \"X\"\n  if (menuIcon.src.includes('hamburger-icon.png')) {\n    menuIcon.src = '../assets/images/close-icon.png'; // Altera para o ícone de fechar\n  } else {\n    menuIcon.src = '../assets/images/hamburger-icon.png'; // Volta para o ícone de hambúrguer\n  }\n});\n\n// Animação dos cards ao rolar a página\nvar cards = document.querySelectorAll('.card');\nvar observer = new IntersectionObserver(function (entries) {\n  entries.forEach(function (entry) {\n    if (entry.isIntersecting) {\n      entry.target.classList.add('visible');\n    }\n  });\n}, {\n  threshold: 0.5\n});\ncards.forEach(function (card) {\n  observer.observe(card);\n});\nvar paraEmpresas = document.getElementById('btn-empresas');\nvar paraUsuarios = document.getElementById('btn-usuarios');\nparaEmpresas.addEventListener('click', function () {\n  showEmpresas();\n});\nparaUsuarios.addEventListener('click', function () {\n  showUsuarios();\n});\nfunction showEmpresas() {\n  // Alternar visibilidade dos elementos\n  document.querySelectorAll('.empresa').forEach(function (el) {\n    return el.style.display = 'block';\n  });\n  document.querySelectorAll('.usuario').forEach(function (el) {\n    return el.style.display = 'none';\n  });\n\n  // Alternar classes dos botões\n  document.getElementById('btn-empresas').classList.add('active');\n  document.getElementById('btn-usuarios').classList.remove('active');\n\n  // Atualizar textos\n  document.getElementById('hero-title').textContent = \"Agendamento Online Simples e Eficiente Para Empresas\";\n  document.getElementById('hero-subtitle').textContent = \"Gerencie seus agendamentos, otimize seu tempo e aumente sua produtividade.\";\n  document.getElementById('funcionalidades-subtitle').textContent = \"Tudo o que você precisa para gerenciar seus agendamentos de forma eficiente.\";\n  document.getElementById('benefits-subtitle').textContent = \"Descubra como o Agendou pode transformar a gestão do seu negócio.\";\n\n  // Atualizar background\n  var heroDiv = document.getElementById('home');\n  if (heroDiv) {\n    heroDiv.style.backgroundImage = \"url('../assets/images/heroEmpresas.png')\";\n    heroDiv.style.backgroundSize = \"cover\"; // Faz a imagem cobrir toda a div\n    heroDiv.style.backgroundPosition = \"center\"; // Centraliza a imagem\n    heroDiv.style.backgroundRepeat = \"no-repeat\"; // Evita repetição da imagem\n  } else {\n    console.error(\"Elemento #home não encontrado.\");\n  }\n}\nfunction showUsuarios() {\n  // Alternar visibilidade dos elementos\n  document.querySelectorAll('.usuario').forEach(function (el) {\n    return el.style.display = 'block';\n  });\n  document.querySelectorAll('.empresa').forEach(function (el) {\n    return el.style.display = 'none';\n  });\n\n  // Alternar classes dos botões\n  document.getElementById('btn-usuarios').classList.add('active');\n  document.getElementById('btn-empresas').classList.remove('active');\n\n  // Atualizar textos\n  document.getElementById('hero-title').textContent = \"Agendamento Online Simples e Eficiente Para Clientes\";\n  document.getElementById('hero-subtitle').textContent = \"Encontre profissionais e agende serviços de forma rápida e fácil.\";\n  document.getElementById('funcionalidades-subtitle').textContent = \"Tudo o que você precisa para agendar serviços de forma eficiente.\";\n  document.getElementById('benefits-subtitle').textContent = \"Descubra como o Agendou pode facilitar sua vida.\";\n\n  // Atualizar background\n  var heroDiv = document.getElementById('home');\n  if (heroDiv) {\n    heroDiv.style.backgroundImage = \"url('../assets/images/heroAgendouCli.png')\";\n    heroDiv.style.backgroundSize = \"cover\"; // Faz a imagem cobrir toda a div\n    heroDiv.style.backgroundPosition = \"center\"; // Centraliza a imagem\n    heroDiv.style.backgroundRepeat = \"no-repeat\"; // Evita repetição da imagem\n  } else {\n    console.error(\"Elemento #home não encontrado.\");\n  }\n}\n\n//# sourceURL=webpack://agendou/./src/scripts/indexUi.js?");

/***/ }),

/***/ "./src/scriptsImport/indexImport.js":
/*!******************************************!*\
  !*** ./src/scriptsImport/indexImport.js ***!
  \******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _scripts_indexUi_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scripts/indexUi.js */ \"./src/scripts/indexUi.js\");\n/* harmony import */ var _styles_main_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../styles/main.css */ \"./src/styles/main.css\");\n// Importa os arquivos JavaScript\n // Lógica da interface do usuário\n\n// Importa os arquivos CSS\n // Estilos gerais\n\n//# sourceURL=webpack://agendou/./src/scriptsImport/indexImport.js?");

/***/ }),

/***/ "./src/styles/main.css":
/*!*****************************!*\
  !*** ./src/styles/main.css ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://agendou/./src/styles/main.css?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/scriptsImport/indexImport.js");
/******/ 	
/******/ })()
;