$(document).ready(function () {
  $('#search-btn').on('click', function () {
    const pokemon = $('#search-input').val().toLowerCase().trim();
    if (pokemon) {
      window.location.href = `placeholder.html?pokemon=${pokemon}`;
    }
  });

  $('#random-btn').on('click', function () {
    const randomId = Math.floor(Math.random() * 1010) + 1;
    window.location.href = `placeholder.html?pokemon=${randomId}`;
  });

  window.animateAndRedirect = function (targetUrl) {
    const redHalf = document.querySelector('.pokeball-half.red');
    const whiteHalf = document.querySelector('.pokeball-half.white');
    const searchBar = document.querySelector('.search-bar');
    const pokeballCircle = document.getElementById('pokeball-circle');

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
      const OFFSET = '-600px'; // AAAAAAAAAAA
    
      redHalf.style.transform = `translateY(${OFFSET})`;
      whiteHalf.style.transform = 'translateY(100%)';
    
      searchBar.style.transition = 'transform 1s ease-in-out';
      pokeballCircle.style.transition = 'transform 1s ease-in-out';
    
      searchBar.style.transform = `translate(-50%, ${OFFSET})`;
      pokeballCircle.style.transform = `translate(-50%, ${OFFSET})`;
    }, 1300);

    setTimeout(() => {
      window.location.href = targetUrl;
    }, 2400);
  };
});
