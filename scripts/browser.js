$(document).ready(function () {
  if (window.innerWidth <= 576) {
    $('#search-input').attr('placeholder', '¡Busca!');
  } else {
    $('#search-input').attr('placeholder', 'Busca tu Pokémon');
  }

  $('#search-btn').on('click', function () {
    const pokemon = $('#search-input').val().toLowerCase().trim();
    if (pokemon) {
      const targetUrl = `pokemonsheet.html?pokemon=${pokemon}`;
      animateAndRedirect(targetUrl);
    }
  });

  $('#random-btn').on('click', function () {
    const randomId = Math.floor(Math.random() * 1025) + 1;
    const targetUrl = `pokemonsheet.html?pokemon=${randomId}`;
    animateAndRedirect(targetUrl);
  });

  window.animateAndRedirect = function (targetUrl) {
    const redHalf = document.querySelector('.pokeball-half.red');
    const whiteHalf = document.querySelector('.pokeball-half.white');
    const searchBar = document.querySelector('.search-bar');
    const pokeballCircle = document.getElementById('pokeball-circle');
    const overlay = document.getElementById('fade-overlay');

    const audio = new Audio('resources/audio/pokeball_open.mp3');

    document.querySelectorAll('.fixed-button, .pokeball, .pikachu-btn').forEach(el => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.5s ease';
    });

    searchBar.style.transition = 'all 0.8s ease-in-out';
    searchBar.style.width = '60px';
    searchBar.style.height = '60px';
    searchBar.style.borderRadius = '50%';
    searchBar.style.overflow = 'hidden';
    searchBar.style.justifyContent = 'center';
    searchBar.style.alignItems = 'center';
    searchBar.innerHTML = '';

    setTimeout(() => {
      pokeballCircle.style.opacity = 1;
    }, 800);

    setTimeout(() => {
      const OFFSET = '-600px'; 

      redHalf.style.transform = `translateY(${OFFSET})`;
      whiteHalf.style.transform = 'translateY(100%)';

      searchBar.style.transition = 'transform 1s ease-in-out';
      pokeballCircle.style.transition = 'transform 1s ease-in-out';

      searchBar.style.transform = `translate(-50%, ${OFFSET})`;
      pokeballCircle.style.transform = `translate(-50%, ${OFFSET})`;

      audio.play().catch(err => {
        console.error('Error al reproducir el audio:', err);
        window.location.href = targetUrl;
      });

      audio.addEventListener('ended', () => {
        overlay.style.opacity = 1;
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 1000);
      });
    }, 1300);
  };
});