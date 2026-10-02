// "proyectos" y "notas" vienen de data.js, cargado antes que este
// archivo en index.html.

document.addEventListener("DOMContentLoaded", () => {
  // --- Lenis: scroll suave ---
  const lenis = new Lenis();

  // --- GSAP + ScrollTrigger, sincronizados con Lenis ---
  // Esta es la integración recomendada por la propia documentación de
  // Lenis: en vez de tener dos loops de animación corriendo por su
  // cuenta (uno de Lenis, otro de GSAP), dejamos que el "ticker" de GSAP
  // sea el único que avanza el reloj, y le pasamos ese mismo tiempo a
  // Lenis en cada frame. lagSmoothing(0) evita que GSAP intente
  // "recuperar" frames perdidos de golpe, lo que se ve raro con un
  // scroll suave.
  gsap.registerPlugin(ScrollTrigger);
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((tiempo) => {
    lenis.raf(tiempo * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // --- Render de "Proyectos" y "Notas" a partir de data.js ---
  // Lista de proyectos, no cards: cada <li> es una fila con el título
  // grande, una miniatura metida dentro del mismo título (display:inline
  // en el CSS), categoría + descripción, y un link "Ver más" aparte abajo.
  const proyectosGrid = document.getElementById("proyectos-grid");
  proyectosGrid.innerHTML = proyectos.map((proyecto) => `
    <li class="proyecto-item">
      <h3 class="proyecto-item__titulo">
        ${proyecto.titulo}
        <span class="proyecto-item__visual">
          <img src="${proyecto.imagen}" alt="" loading="lazy">
        </span>
      </h3>
      <span class="proyecto-item__categoria">${proyecto.categoria}</span>
      <p class="proyecto-item__descripcion">${proyecto.descripcion}</p>
      <a href="${proyecto.enlace}" class="proyecto-item__link">Ver más de este proyecto</a>
    </li>
  `).join("");

  const notasLista = document.getElementById("notas-lista");
  notasLista.innerHTML = notas.map((nota) => `
    <li class="nota">
      <span class="nota__fecha">${nota.fecha}</span>
      <h3 class="nota__titulo">${nota.titulo}</h3>
      <p class="nota__resumen">${nota.resumen}</p>
    </li>
  `).join("");

  // --- Navegación mobile: hamburguesa <-> overlay a pantalla completa ---
  const btnHamburguesa = document.getElementById("btn-hamburguesa");
  const navOverlay = document.getElementById("nav-overlay");
  const btnCerrarOverlay = document.getElementById("btn-cerrar-overlay");

  function abrirOverlay() {
    navOverlay.classList.add("is-abierto");
    btnHamburguesa.setAttribute("aria-expanded", "true");
  }

  function cerrarOverlay() {
    navOverlay.classList.remove("is-abierto");
    btnHamburguesa.setAttribute("aria-expanded", "false");
  }

  btnHamburguesa.addEventListener("click", abrirOverlay);
  btnCerrarOverlay.addEventListener("click", cerrarOverlay);

  // --- Scroll suave al hacer clic en cualquier enlace "#ancla" ---
  // Sin esto, los <a href="#proyectos"> saltarían de golpe en vez de
  // deslizarse — lenis.scrollTo() es el que sabe animar ese salto.
  document.querySelectorAll('a[href^="#"]').forEach((enlace) => {
    enlace.addEventListener("click", (evento) => {
      const destino = document.querySelector(enlace.getAttribute("href"));
      if (!destino) return;

      evento.preventDefault();
      cerrarOverlay(); // por si el clic vino del menú mobile
      lenis.scrollTo(destino);
    });
  });

  // --- Animación de aparición por sección ---
  // Cada <section data-section="..."> (y el footer) entra con un fade +
  // un leve desplazamiento hacia arriba cuando llega al 80% de la
  // pantalla, en vez de estar siempre visible de golpe.
  document.querySelectorAll("[data-section]").forEach((seccion) => {
    gsap.from(seccion, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: seccion,
        start: "top 80%"
      }
    });
  });
});
const randomCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function scrambleLine(line) {
  const text = line.dataset.scramble;
  const characters = Array.from(text);
  const letterElements = [];

  line.replaceChildren();

  characters.forEach((character) => {
    if (character === " ") {
      line.append(document.createTextNode(" "));
      return;
    }

    const letter = document.createElement("span");
    letter.className = "hero__letra";
    letter.textContent = character;
    line.append(letter);
    letterElements.push({ element: letter, character });
  });

  letterElements.forEach(({ element, character }, index) => {
    const delay = index * 24;
    const duration = 380;

    window.setTimeout(() => {
      const interval = window.setInterval(() => {
        element.textContent =
          randomCharacters[Math.floor(Math.random() * randomCharacters.length)];
      }, 45);

      window.setTimeout(() => {
        window.clearInterval(interval);
        element.textContent = character;
      }, duration);
    }, delay);
  });
}

function startHeroEffect() {
  const lines = document.querySelectorAll(".hero__titulo [data-scramble]");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    lines.forEach((line) => {
      line.textContent = line.dataset.scramble;
    });
    return;
  }

  lines.forEach(scrambleLine);
}

const heroTitle = document.querySelector(".hero__titulo");

if (heroTitle && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      startHeroEffect();
      observer.disconnect();
    }
  });

  observer.observe(heroTitle);
} else {
  startHeroEffect();
}
