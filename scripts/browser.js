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

    
    function animateAndRedirect(targetURL) {
        // 1. Fade out todos los elementos
        document.querySelectorAll("#main-content > *").forEach(el => {
          el.style.transition = "opacity 0.5s ease";
          el.style.opacity = 0;
        });
      
        // 2. Transformar el buscador a pokeball
        const searchBar = document.querySelector(".search-bar");
        searchBar.style.transition = "all 1s ease";
        searchBar.style.width = "60px";
        searchBar.style.height = "60px";
        searchBar.style.borderRadius = "50%";
        searchBar.style.overflow = "hidden";
        searchBar.innerHTML = ""; // Vaciarlo para que solo se vea como círculo
      
        // 3. Mostrar círculo central
        const ball = document.getElementById("pokeball-circle");
        ball.style.opacity = 1;
      
        // 4. Iniciar apertura de la pokeball
        setTimeout(() => {
          document.getElementById("top-half").style.transform = "translateY(-100%)";
          document.getElementById("bottom-half").style.transform = "translateY(100%)";
        }, 1000);
      
        // 5. Redirigir tras animación
        setTimeout(() => {
          window.location.href = targetURL;
        }, 2000);
      }
      

  });
  