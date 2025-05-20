$(document).ready(function() {
    $('#loadingSpinner').show();

    // Obtener el nombre del Pokémon desde la URL
    const params = new URLSearchParams(window.location.search);
    const pokemonName = params.get('pokemon') || 'charizard';

    loadPokemon(pokemonName);
});

$(document).on('click', '#homeButton', function() {
    window.location.href = 'index.html';
});
$(document).on('click', '#dexButton', function() {
    window.location.href = 'pokedex.html';
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
  <div class="container-fluid p-0">
    <div class="row g-0 pokedex-horizontal" style="${getTypeStyle(pokemon.types[0].type.name)}"> 
      <div class="col-lg-6 pokedex-left p-4">
        <div class="pokemon-types d-flex justify-content-between">  
          <button id="homeButton" class="btn btn-home ${typeClass} mb-4">
              <i class="fa fa-home"></i> Home
            </button>
            <button id="dexButton" class="btn btn-dex ${typeClass} mb-4">
              <i class="fa fa-book"></i> Pokédex
            </button>
        </div>
        
        <div class="d-flex flex-column h-100">
          <div>
            <div class="pokemon-number">#${pokemon.id.toString().padStart(3, '0')}</div>
            <h1 class="pokemon-name">${pokemon.name.toUpperCase()}</h1>
            <p class="pokemon-description">${description}</p>
            
            <div class="pokemon-types d-flex gap-2 mb-4">
              ${pokemon.types.map(type => `
                <span class="type-badge" style="background-color: ${typeColors[type.type.name]}">
                  ${typeTranslations[type.type.name] || type.type.name}
                </span>
              `).join('')}
            </div>
          </div>
          
          <div class="pokemon-stats mt-auto">
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
      </div>
    
      <div class="col-lg-6 pokedex-right p-4 d-flex flex-column align-items-center justify-content-center">
        <div class="pokemon-image-container mb-4">
          <img src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}" 
              class="pokemon-image clickable-pokemon" 
              alt="${pokemon.name}"
              data-pokemon-id="${pokemon.id}">
        </div>
        
        <div id="evolutionContainer" class="w-100"></div>
    </div>
  </div>
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
        <div class="pokedex-horizontal bg-light p-4 d-flex flex-column align-items-center justify-content-center text-center">
            <img src="resources/img/Pikachu_Depresion.png" alt="Pikachu triste" class="mb-4" style="max-width: 200px;">
            <h2 class="text-danger mb-3">Lo sentimos, este Pokémon no existe</h2>
            <p class="mb-4">Prueba a reescribir el nombre o busca en todos para encontrarlo.</p>
            <a href="index.html" class="btn btn-outline-primary">
                <i class="fa fa-arrow-left me-2"></i>Volver a la página principal
            </a>
        </div>
    `).fadeIn(500);
}
function getTypeStyle(typeName) {
  const typeStyles = {
    fire: 'background-color: #FFF3F0;',
    water: 'background-color: #F0F7FF;',
    grass: 'background-color: #F0FBF0;',
    electric: 'background-color: #FFFCE0;',
    psychic: 'background-color: #FFE0F0;',
    ice: 'background-color: #F0FFFF;',
    dragon: 'background-color: #F0E8FF;',
    dark: 'background-color: #F0E8E0;',
    fairy: 'background-color: #FFEEF5;',
    normal: 'background-color: #F5F5F0;',
    fighting: 'background-color: #FFE8E0;',
    flying: 'background-color: #F0E8FF;',
    poison: 'background-color: #F5E0F5;',
    ground: 'background-color: #FAF0D0;',
    rock: 'background-color: #F5F0D0;',
    bug: 'background-color: #F5F5D0;',
    ghost: 'background-color: #F0E8F0;',
    steel: 'background-color: #F0F0F5;'
  };
  
  return typeStyles[typeName] || '';
}

// Exponer la función para ser llamada desde fuera
window.loadPokemon = loadPokemon;
