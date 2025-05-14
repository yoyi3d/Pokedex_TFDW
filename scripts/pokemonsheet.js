$(document).ready(function() {
    $('#loadingSpinner').show();

    // Obtener el nombre del Pokémon desde la URL
    const params = new URLSearchParams(window.location.search);
    const pokemonName = params.get('pokemon') || 'charizard';

    loadPokemon(pokemonName);
});

$(document).on('click', '#homeButton', function() {
    window.location.href = 'browser.html';
});

// Traducciones de tipos
const typeTranslations = {
    fire: 'FUEGO',
    water: 'AGUA',
    grass: 'PLANTA',
    electric: 'ELÉCTRICO',
    psychic: 'PSÍQUICO',
    ice: 'HIELO',
    dragon: 'DRAGÓN',
    dark: 'SINIESTRO',
    fairy: 'HADA',
    normal: 'NORMAL',
    fighting: 'LUCHA',
    flying: 'VOLADOR',
    poison: 'VENENO',
    ground: 'TIERRA',
    rock: 'ROCA',
    bug: 'BICHO',
    ghost: 'FANTASMA',
    steel: 'ACERO'
};

// Colores por tipo
const typeColors = {
    fire: '#F08030',
    water: '#6890F0',
    grass: '#78C850',
    electric: '#F8D030',
    psychic: '#F85888',
    ice: '#98D8D8',
    dragon: '#7038F8',
    dark: '#705848',
    fairy: '#EE99AC',
    normal: '#A8A878',
    fighting: '#C03028',
    flying: '#A890F0',
    poison: '#A040A0',
    ground: '#E0C068',
    rock: '#B8A038',
    bug: '#A8B820',
    ghost: '#705898',
    steel: '#B8B8D0'
};


async function loadPokemon(pokemonName) {
    try {
        const pokemon = await $.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
        const species = await $.get(pokemon.species.url);
        displayPokemon(pokemon, species, []);

        try {
            const evolutionChain = await $.get(species.evolution_chain.url);
            const evolutionData = await getEvolutionChain(evolutionChain.chain);
            updateEvolutionDisplay(evolutionData);
        } catch (e) {
            console.log("No se pudo cargar la cadena evolutiva", e);
        }

    } catch (error) {
        console.error('Error:', error);
        showError();
    } finally {
        $('#loadingSpinner').hide();
    }
}

async function getEvolutionChain(chain) {
    const evolutionChain = [];
    let current = chain;

    while (current && evolutionChain.length < 3) {
        try {
            const pokemonData = await $.get(`https://pokeapi.co/api/v2/pokemon/${current.species.name}`);

            evolutionChain.push({
                name: current.species.name,
                image: pokemonData.sprites.other['official-artwork'].front_default
            });

            current = current.evolves_to[0];
        } catch (e) {
            console.error("Error cargando evolución", e);
            break;
        }
    }

    return evolutionChain;
}

function displayPokemon(pokemon, species) {
    const primaryType = pokemon.types[0].type.name;
    const primaryTypeSpanish = typeTranslations[primaryType] || primaryType;
    const typeClass = `type-${primaryTypeSpanish.toLowerCase()}`;

    $('#pokemonCard')
        .removeClass()
        .addClass(`pokedex-horizontal bg-${primaryTypeSpanish.toLowerCase()}`)
        .css('display', 'none');

    const description = getDescription(species);
    const cryUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemon.id}.ogg`;
    const audioElement = new Audio(cryUrl);

    const html = `
        <div class="pokedex-left">
            <div>
                <div class="pokemon-number">#${pokemon.id.toString().padStart(3, '0')}</div>
                <h1 class="pokemon-name">${pokemon.name.toUpperCase()}</h1>
                <p class="pokemon-description">${description}</p>

                <div class="pokemon-types">
                    ${pokemon.types.map(type => `
                        <span class="type-badge" style="background-color: ${typeColors[type.type.name]}">
                            ${typeTranslations[type.type.name] || type.type.name}
                        </span>
                    `).join('')}
                </div>
            </div>

            <div class="pokemon-stats">
                <div class="stat-row">
                    <span class="stat-label">Categoría:</span>
                    <span class="stat-value">${getGenus(species)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Altura:</span>
                    <span class="stat-value">${(pokemon.height / 10).toFixed(1)} m</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Peso:</span>
                    <span class="stat-value">${(pokemon.weight / 10).toFixed(1)} kg</span>
                </div>
            </div>
        </div>

        <div class="pokedex-right">
            <div class="d-flex justify-content-end w-100 mb-3">
                <button id="homeButton" class="btn btn-home ${typeClass}">
                    <i class="fa fa-home"></i> Home
                </button>
            </div>
            <div class="pokemon-image-container">
                <img src="${pokemon.sprites.other['official-artwork'].front_default || 
                          pokemon.sprites.front_default}" 
                     class="pokemon-image clickable-pokemon" 
                     alt="${pokemon.name}"
                     data-pokemon-id="${pokemon.id}">
            </div>

            <div id="evolutionContainer"></div>
        </div>
    `;

    $('#pokemonCard').html(html).fadeIn(500, function() {
        $('.clickable-pokemon').on('click', function() {
            audioElement.currentTime = 0;
            audioElement.play().catch(e => console.log("Error al reproducir:", e));
            $(this).addClass('pokemon-clicked');
            setTimeout(() => $(this).removeClass('pokemon-clicked'), 200);
        });
    });
}

function updateEvolutionDisplay(evolutionChain) {
    if (evolutionChain.length > 1) {
        $('#evolutionContainer').html(`
            <div class="evolution-chain-container">
                <div class="evolution-chain-title">Cadena Evolutiva</div>
                <div class="evolution-chain">
                    ${evolutionChain.map((pokemon, index) => `
                        ${index > 0 ? '<span class="evolution-arrow">→</span>' : ''}
                        <div class="evolution-stage">
                            <img src="${pokemon.image}" 
                                 class="evolution-image" 
                                 alt="${pokemon.name}"
                                 onclick="loadPokemon('${pokemon.name}')">
                            <span class="evolution-name">${pokemon.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `);
    }
}

function getDescription(species) {
    const entry = species.flavor_text_entries.find(e => e.language.name === 'es') || 
                 species.flavor_text_entries.find(e => e.language.name === 'en');
    return entry ? entry.flavor_text.replace(/[\n\f]/g, ' ') : 'Descripción no disponible';
}

function getGenus(species) {
    const genus = species.genera.find(g => g.language.name === 'es') || 
                 species.genera.find(g => g.language.name === 'en');
    return genus ? genus.genus : 'Desconocido';
}

function showError() {
    $('#pokemonCard').html(`
        <div class="pokedex-left">
            <h1 class="text-danger">ERROR</h1>
            <p>No se pudo cargar el Pokémon</p>
        </div>
    `).fadeIn(500);
}

// Exponer la función para ser llamada desde fuera
window.loadPokemon = loadPokemon;
