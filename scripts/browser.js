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
  });
  