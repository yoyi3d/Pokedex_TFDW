$(document).ready(function () {
    const pokemonContainer = $('#pokemonContainer');
    let allPokemonList = [];
    let displayedPokemonList = [];
    let currentPage = 1;
    const pokemonPerPage = 18; // Mostrar 18 Pokémon por página

    // Rango de Pokémon por generación
    const generationRanges = {
        0: { start: 1, end: 1025},   //Todos
        1: { start: 1, end: 151 },   // Kanto
        2: { start: 152, end: 251 }, // Johto
        3: { start: 252, end: 386 }, // Hoenn
        4: { start: 387, end: 493 }, // Sinnoh
        5: { start: 494, end: 649 }, // Unova
        6: { start: 650, end: 721 }, // Kalos
        7: { start: 722, end: 809 }, // Alola
        8: { start: 810, end: 905 }, // Galar
        9: { start: 906, end: 1025 } // Paldea
    };

    // Colores por tipo (para el fondo de las tarjetas)
    const typeColors = {
        bug: "#A8B820", dark: "#705848", dragon: "#7038F8", electric: "#F8D030",
        fairy: "#EE99AC", fighting: "#C03028", fire: "#F08030", flying: "#A890F0",
        ghost: "#705898", grass: "#78C850", ground: "#E0C068", ice: "#98D8D8",
        normal: "#A8A878", poison: "#A040A0", psychic: "#F85888", rock: "#B8A038",
        steel: "#B8B8D0", water: "#6890F0"
    };

    // Traducción de tipos al español
    const typeTranslation = {
        bug: "Bicho", dark: "Siniestro", dragon: "Dragón", electric: "Eléctrico",
        fairy: "Hada", fighting: "Lucha", fire: "Fuego", flying: "Volador",
        ghost: "Fantasma", grass: "Planta", ground: "Tierra", ice: "Hielo",
        normal: "Normal", poison: "Veneno", psychic: "Psíquico", rock: "Roca",
        steel: "Acero", water: "Agua"
    };

    // Calcular el color del texto según el fondo (para asegurarse de que sea legible)
    function getTextColor(hexColor) {
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 125 ? '#000000' : '#FFFFFF';
    }

    // Cargar datos de un Pokémon
    function loadPokemonData(url) {
        return $.get(url).then(data => {
            return {
                id: data.id,
                name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
                types: data.types.map(t => t.type.name),
                image: data.sprites.front_default || "placeholder.png",
                isAltForm: !data.is_default
            };
        }).catch(() => null); // Por si algún dato falla
    }
    
    

    // Renderizar las cartas de Pokémon
    function renderCards(pokemonList) {
        pokemonContainer.empty(); // Limpiar el contenedor de tarjetas
    
        pokemonList.forEach(pokemon => {
            const type = pokemon.types[0];
            const bgColor = typeColors[type] || '#FFFFFF';
            const textColor = getTextColor(bgColor);
            const translatedTypes = pokemon.types.map(t => typeTranslation[t] || t).join(', ');
    
            // Detectar si es una forma alternativa y etiquetarla
            let extraInfo = `National Dex: ${pokemon.id}`;
            if (pokemon.isAltForm) {
                const nameLower = pokemon.name.toLowerCase();
                if (nameLower.includes('alola')) {
                    extraInfo = "Forma Regional: Alola";
                } else if (nameLower.includes('galar')) {
                    extraInfo = "Forma Regional: Galar";
                } else if (nameLower.includes('hisui')) {
                    extraInfo = "Forma Regional: Hisui";
                } else if (nameLower.includes('paldea')) {
                    extraInfo = "Forma Regional: Paldea";
                } else if (nameLower.includes('mega')) {
                    extraInfo = "Mega Evolución";
                } else if (nameLower.includes('gmax')) {
                    extraInfo = "Forma Gigamax";
                } else {
                    extraInfo = "Forma Alternativa";
                }
            }
    
            const card = `
                <div class="col-12 col-sm-6 col-md-4 col-lg-2 mb-4">
                    <div class="card text-center shadow-sm" style="background-color: ${bgColor}; color: ${textColor};">
                        <img src="${pokemon.image}" class="card-img-top" alt="${pokemon.name}">
                        <div class="card-body">
                            <h5 class="card-title">${pokemon.name}</h5>
                            <p class="card-text">${extraInfo}</p>
                            <p class="card-text"><strong>Tipo:</strong> ${translatedTypes}</p>
                        </div>
                    </div>
                </div>
            `;
            pokemonContainer.append(card);
        });
    }
    

    // Paginación de los Pokémon
    function paginatePokemon(pokemonList, page) {
        const startIndex = (page - 1) * pokemonPerPage;
        const endIndex = startIndex + pokemonPerPage;
        return pokemonList.slice(startIndex, endIndex);
    }

    // Renderizar los controles de paginación
    function renderPagination(totalPokemon) {
        const totalPages = Math.ceil(totalPokemon / pokemonPerPage);
        const paginationContainer = $('#paginationContainer');
        paginationContainer.empty();

    // Botón anterior
    const prevButton = `<button class="btn btn-secondary me-2" id="prevPage" ${currentPage === 1 ? 'disabled' : ''}>
        <i class="bi bi-chevron-left"></i> Anterior
    </button>`;
    paginationContainer.append(prevButton);

    // Botones de páginas
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = `<button class="btn btn-secondary me-2" data-page="${i}">${i}</button>`;
        paginationContainer.append(pageButton);
    }

    // Botón siguiente
    const nextButton = `<button class="btn btn-secondary ms-2" id="nextPage" ${currentPage === totalPages ? 'disabled' : ''}>
        Siguiente <i class="bi bi-chevron-right"></i>
    </button>`;
    paginationContainer.append(nextButton);

    // Manejar la paginación
    $('#paginationContainer button').on('click', function () {
        const page = $(this).data('page');
        if (page) {
        currentPage = page;
        } else if ($(this).attr('id') === 'prevPage' && currentPage > 1) {
        currentPage--;
        } else if ($(this).attr('id') === 'nextPage' && currentPage < totalPages) {
        currentPage++;
        }
            displayedPokemonList = paginatePokemon(allPokemonList, currentPage);
            renderCards(displayedPokemonList);
            renderPagination(allPokemonList.length); // Volver a renderizar los botones de paginación
        });
    }

    // Cargar los Pokémon de una generación específica
    function loadGeneration(genNumber) {
        currentGeneration = genNumber;
        const { start, end } = generationRanges[genNumber];
    
        $.get('https://pokeapi.co/api/v2/pokemon?limit=100000').then(response => {
            const urls = response.results.map(p => p.url);
    
            const promises = urls.map(url => loadPokemonData(url));
    
            Promise.all(promises).then(pokemonData => {
                // Si estás en "Todos", incluyes todo
                if (genNumber === 0) {
                    allPokemonList = pokemonData;
                } else {
                    // Solo incluir los Pokémon cuyo ID está en el rango, o que su forma es alternativa de uno en ese rango
                    allPokemonList = pokemonData.filter(p =>
                        (p.id >= start && p.id <= end) ||
                        (p.isAltForm && p.id >= start && p.id <= end)
                    );
                }
    
                currentPage = 1;
                displayedPokemonList = paginatePokemon(allPokemonList, currentPage);
                renderCards(displayedPokemonList);
                renderPagination(allPokemonList.length);
            });
        });
    }
    
    

    // Filtrar Pokémon por tipo
    $('#filter-type').on('change', function () {
        const selectedType = $(this).val();
        const filtered = selectedType ? allPokemonList.filter(p => p.types.includes(selectedType)) : allPokemonList;
        displayedPokemonList = paginatePokemon(filtered, currentPage);
        renderCards(displayedPokemonList);
    });

    // Filtrar Pokémon por generación
    $('#filter-generation').on('change', function () {
        const selectedGeneration = $(this).val();
        loadGeneration(Number(selectedGeneration)); // Cargar la generación seleccionada
    });

    // Ordenar Pokémon por nombre
    $('#sort-name').on('click', function () {
        const sorted = [...allPokemonList].sort((a, b) => a.name.localeCompare(b.name));
        displayedPokemonList = paginatePokemon(sorted, currentPage);
        renderCards(displayedPokemonList);
    });
    

    // Ordenar Pokémon por número
    $('#sort-number').on('click', function () {
        const sorted = [...allPokemonList].sort((a, b) => a.id - b.id);
        displayedPokemonList = paginatePokemon(sorted, currentPage);
        renderCards(displayedPokemonList);
    });
    

    // Búsqueda por nombre
    $('#search-input').on('input', function () {
        const query = $(this).val().toLowerCase();
        const filtered = allPokemonList.filter(p => p.name.toLowerCase().includes(query));
        displayedPokemonList = paginatePokemon(filtered, currentPage);
        renderCards(displayedPokemonList);
    });

    //Busqueda por Formas
    $('#filter-forma').on('change', function () {
        const selectedForma = $(this).val();
        let filtered = allPokemonList;
    
        if (selectedForma === "alternativa") {
            filtered = allPokemonList.filter(p => p.isAltForm);
        }
    
        displayedPokemonList = paginatePokemon(filtered, currentPage);
        renderCards(displayedPokemonList);
        renderPagination(filtered.length);
    });
    

    // Cargar la primera generación por defecto
    loadGeneration(1);
});
