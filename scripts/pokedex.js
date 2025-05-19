$(document).ready(function () {
    const pokemonContainer = $('#pokemonContainer');
    const prevButton = $('#prev-button');
    const nextButton = $('#next-button');
    let allPokemonList = [];
    let filteredList = [];
    let currentPage = 1;
    const itemsPerPage = 12;

    $('#homeButton').click(function() {
        window.location.href = 'browser.html';
    });

    // 1. Crear el contenedor de la barra de carga y agregarlo al body.
    $('body').append(`
        <div id="loading-screen" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 9999;">
            <div style="width: 80%; max-width: 400px; background-color: #e0e0e0; border-radius: 50px; padding: 5px;">
                <div id="progress-bar" style="width: 0%; height: 20px; background-color: green; border-radius: 50px;"></div>
            </div>
        </div>
    `);

    // Función para actualizar el progreso
    function updateProgressBar(progress) {
        $('#progress-bar').css('width', progress + '%');
    }

    const generationRanges = {
        0: { start: 1, end: 1025},
        1: { start: 1, end: 151 },
        2: { start: 152, end: 251 },
        3: { start: 252, end: 386 },
        4: { start: 387, end: 493 },
        5: { start: 494, end: 649 },
        6: { start: 650, end: 721 },
        7: { start: 722, end: 809 },
        8: { start: 810, end: 905 },
        9: { start: 906, end: 1025 }
    };

    const typeColors = {
        bug: "#A8B820", dark: "#705848", dragon: "#7038F8", electric: "#F8D030",
        fairy: "#EE99AC", fighting: "#C03028", fire: "#F08030", flying: "#A890F0",
        ghost: "#705898", grass: "#78C850", ground: "#E0C068", ice: "#98D8D8",
        normal: "#A8A878", poison: "#A040A0", psychic: "#F85888", rock: "#B8A038",
        steel: "#B8B8D0", water: "#6890F0"
    };

    const typeTranslation = {
        bug: "Bicho", dark: "Siniestro", dragon: "Dragón", electric: "Eléctrico",
        fairy: "Hada", fighting: "Lucha", fire: "Fuego", flying: "Volador",
        ghost: "Fantasma", grass: "Planta", ground: "Tierra", ice: "Hielo",
        normal: "Normal", poison: "Veneno", psychic: "Psíquico", rock: "Roca",
        steel: "Acero", water: "Agua"
    };

    function getTextColor(hexColor) {
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 125 ? '#000000' : '#FFFFFF';
    }

    function loadPokemonData(url) {
        return $.get(url).then(data => ({
            id: data.id,
            name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
            types: data.types.map(t => t.type.name),
            image: data.sprites.front_default || "placeholder.png",
            isAltForm: data.forms && data.forms.length > 1
        })).catch(() => null);
    }

    // Función para cargar los Pokémon
    function loadGeneration(genNumber) {
        const { start, end } = generationRanges[genNumber];
        $.get('https://pokeapi.co/api/v2/pokemon?limit=100000').then(resp => {
            const urls = resp.results.map(p => p.url);
            const totalPokemon = urls.length;
            let loadedPokemon = 0;
            
            // Inicializar la carga de Pokémon
            return Promise.all(urls.map(url => {
                return loadPokemonData(url).then(pokemon => {
                    loadedPokemon++;
                    updateProgressBar((loadedPokemon / totalPokemon) * 100); // Actualizar barra de progreso
                    return pokemon;
                });
            }));
        }).then(data => {
            allPokemonList = data;
            applyFilters();
            $('#loading-screen').fadeOut(); // Ocultar la pantalla de carga una vez completado
        });
    }

    function applyFilters() {
        filteredList = allPokemonList.slice();

        const selectedType = $('#filter-type').val();
        if (selectedType) filteredList = filteredList.filter(p => p.types.includes(selectedType));

        const selectedGen = $('#filter-generation').val();
        if (selectedGen !== '0') {
            const { start, end } = generationRanges[selectedGen];
            filteredList = filteredList.filter(p => p.id >= start && p.id <= end);
        }

        const selectedForma = $('#filter-forma').val();
        if (selectedForma === "alternativa") filteredList = filteredList.filter(p => p.isAltForm);

        const query = $('#search-input').val().toLowerCase();
        if (query) filteredList = filteredList.filter(p => p.name.toLowerCase().includes(query));

        const sortOption = $('#sort-options').val();
        if (sortOption === "name") filteredList.sort((a, b) => a.name.localeCompare(b.name));
        else if (sortOption === "number") filteredList.sort((a, b) => a.id - b.id);

        renderCards(filteredList);
    }

    function adjustColor(hex, factor) {
        const r = Math.min(255, Math.max(0, parseInt(hex.substr(1,2), 16) + factor));
        const g = Math.min(255, Math.max(0, parseInt(hex.substr(3,2), 16) + factor));
        const b = Math.min(255, Math.max(0, parseInt(hex.substr(5,2), 16) + factor));
        return `rgb(${r}, ${g}, ${b})`;
    }

    function renderCards(pokemonList) {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedList = pokemonList.slice(startIndex, endIndex);

        pokemonContainer.empty();

        paginatedList.forEach(pokemon => {
            const type1 = pokemon.types[0];
            const type2 = pokemon.types[1] || null;
            const base1 = typeColors[type1] || '#FFF';
            const base2 = type2 ? (typeColors[type2] || '#FFF') : null;
            const textColor = getTextColor(base1);

            const gradientStyle = base2
                ? `background: linear-gradient(135deg, ${adjustColor(base1, -30)}, ${base2}, ${adjustColor(base2, 40)});`
                : `background: linear-gradient(135deg, ${adjustColor(base1, -30)}, ${base1}, ${adjustColor(base1, 40)});`;

            const translatedTypes = pokemon.types.map(t => typeTranslation[t] || t);
            const typeBadges = translatedTypes.map((typeName, index) => {
                const key = pokemon.types[index];
                const color = typeColors[key] || '#AAA';
                return `<span class="badge me-1" style="background-color: ${color}; color: ${getTextColor(color)}; border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.2); padding: 4px 8px; border-radius: 12px; font-weight: bold; font-size: 0.75rem;">${typeName}</span>`;
            }).join('');

            const infoLabel = pokemon.isAltForm
                ? `<span class="position-absolute top-0 start-0 m-2 badge bg-warning text-dark">Forma alternativa</span>`
                : `<span class="position-absolute top-0 start-0 m-2 badge bg-light text-dark">#${pokemon.id}</span>`;

            const card = `
            <div class="col-12 col-sm-6 col-md-4 col-lg-2 mb-4 d-flex align-items-stretch">
                <div class="card position-relative shadow-sm w-100 d-flex flex-column justify-content-between text-center tilt-card"
                    style="${gradientStyle} color: ${textColor}; height: 320px; padding: 12px; overflow: hidden;"
                    data-type1="${type1}" data-type2="${type2 || ''}" onclick="goToPokemonDetail('${pokemon.name}')">
                    ${infoLabel}
                    <div class="circle-background position-absolute top-50 start-50 translate-middle" 
                        style="width: 100px; height: 100px; border-radius: 50%; background-color: white; opacity: 0.2; z-index: 0;">
                    </div>
                    <div class="flex-grow-1 d-flex justify-content-center align-items-center" style="z-index: 1; height: 140px;">
                        <img src="${pokemon.image}" alt="${pokemon.name}" style="max-height: 120px; width: auto;">
                    </div>
                    <div style="z-index: 1;">
                        <h5 class="card-title mt-2 mb-1">${pokemon.name}</h5>
                        <div>${typeBadges}</div>
                    </div>
                </div>
            </div>
            `;

        $('.tilt-card').tilt({
          maxTilt: 30,
          perspective: 1300,
          scale: 1.04,
          speed: 1000,
          transition: true
         });


            pokemonContainer.append(card);
        });

        prevButton.prop('disabled', currentPage === 1);
        nextButton.prop('disabled', currentPage * itemsPerPage >= pokemonList.length);
    }

    // Función para redirigir al detalle del Pokémon
    window.goToPokemonDetail = function(pokemonName) {
        window.location.href = `pokemonsheet.html?pokemon=${pokemonName}`;
    };

    $('#filter-type, #filter-generation, #filter-forma').change(applyFilters);
    $('#search-input').on('input', applyFilters);
    $('#sort-options').change(applyFilters);

    prevButton.click(() => {
        if (currentPage > 1) { currentPage--; applyFilters(); }
    });
    nextButton.click(() => {
        if (currentPage * itemsPerPage < filteredList.length) { currentPage++; applyFilters(); }
    });

    loadGeneration(0); // Cargar la generación inicial
});
