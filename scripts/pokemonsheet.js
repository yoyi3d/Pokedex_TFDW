const DEFAULT_POKEMON = 'charizard'; // Pokémon por defecto

// TIPOS DE INGLÉS A ESPAÑOL
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

// COLORES DE LOS TIPOS
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

// Colores de fondo para la tarjeta según tipo primario
const cardBackgrounds = {
    fire: 'linear-gradient(135deg, #FFF3F0 0%, #FFE5DE 100%)',
    water: 'linear-gradient(135deg, #F0F7FF 0%, #E0EFFF 100%)',
    grass: 'linear-gradient(135deg, #F2FFF0 0%, #E0FFDE 100%)',
    electric: 'linear-gradient(135deg, #FFFDEA 0%, #FFF8D0 100%)',
    psychic: 'linear-gradient(135deg, #FFEEF5 0%, #FFE0EB 100%)',
    ice: 'linear-gradient(135deg, #F0FDFF 0%, #E0F7FF 100%)',
    dragon: 'linear-gradient(135deg, #F0E8FF 0%, #E0D0FF 100%)',
    dark: 'linear-gradient(135deg, #F0EEEC 0%, #E0DEDC 100%)',
    fairy: 'linear-gradient(135deg, #FFEEF2 0%, #FFE0E8 100%)',
    normal: 'linear-gradient(135deg, #F5F5F5 0%, #E5E5E5 100%)',
    fighting: 'linear-gradient(135deg, #FFEEED 0%, #FFE0DE 100%)',
    flying: 'linear-gradient(135deg, #F0EEFF 0%, #E0DEFF 100%)',
    poison: 'linear-gradient(135deg, #F5EEF5 0%, #E5DEE5 100%)',
    ground: 'linear-gradient(135deg, #F5F0E8 0%, #E5E0D8 100%)',
    rock: 'linear-gradient(135deg, #F5F2E8 0%, #E5E2D8 100%)',
    bug: 'linear-gradient(135deg, #F5F8E8 0%, #E5F0D8 100%)',
    ghost: 'linear-gradient(135deg, #F0EEF5 0%, #E0DEE5 100%)',
    steel: 'linear-gradient(135deg, #F0F0F5 0%, #E0E0E5 100%)'
};

$(document).ready(function() {
    console.log('Documento listo - Iniciando carga de Pokémon...');
    
    // Mostrar spinner
    $('#loadingSpinner').show();
    
    // Cargar Pokémon
    loadPokemon(DEFAULT_POKEMON);
});

async function loadPokemon(pokemonName) {
    try {
        console.log(`Cargando datos de ${pokemonName}...`);
        
        // 1. Obtener datos básicos del Pokémon
        const pokemonData = await $.ajax({
            url: `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`,
            method: 'GET',
            timeout: 10000 // 10 segundos de timeout
        });
        
        console.log('Datos básicos recibidos:', pokemonData);

        // 2. Obtener datos de la especie
        const speciesData = await $.ajax({
            url: pokemonData.species.url,
            method: 'GET',
            timeout: 10000
        });
        
        console.log('Datos de especie recibidos:', speciesData);

        // 3. Mostrar los datos
        displayPokemon(pokemonData, speciesData);
        
    } catch (error) {
        console.error('Error al cargar Pokémon:', error);
        showError();
    } finally {
        // Ocultar spinner
        $('#loadingSpinner').hide();
    }
}

function displayPokemon(pokemon, species) {
    const primaryType = pokemon.types[0].type.name;
    const primaryTypeSpanish = typeTranslations[primaryType] || primaryType;
    
    // Aplicar estilo según tipo primario (usando nombres en español)
    $('#pokemonCard')
        .removeClass()
        .addClass(`pokemon-card card-${primaryTypeSpanish.toLowerCase()}`)
        .css('display', 'none');
    
    // Obtener descripción en español
    const description = getDescription(species);
    
    // Construir HTML con tipos en español
    const html = `
        <div class="pokemon-header">
            <span class="pokemon-number">#${pokemon.id.toString().padStart(3, '0')}</span>
            <h1 class="pokemon-name">${pokemon.name}</h1>
        </div>
        
        <div class="text-center p-4">
            <div class="pokemon-image-container">
                <img src="${pokemon.sprites.other['official-artwork'].front_default}" 
                     class="pokemon-image" 
                     alt="${pokemon.name}">
            </div>
            
            <p class="pokemon-description">${description}</p>
            
            <div class="pokemon-types">
                ${pokemon.types.map(type => {
                    const typeName = type.type.name;
                    const typeSpanish = typeTranslations[typeName] || typeName;
                    return `
                        <span class="type-badge" style="background-color: ${typeColors[typeName]}">
                            ${typeSpanish}
                        </span>
                    `;
                }).join('')}
            </div>
        </div>
        
        <div class="pokemon-stats">
            <div class="stat-row">
                <span class="stat-label">Categoría</span>
                <span class="stat-value">${getGenus(species)}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Altura</span>
                <span class="stat-value">${(pokemon.height / 10).toFixed(1)} m</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Peso</span>
                <span class="stat-value">${(pokemon.weight / 10).toFixed(1)} kg</span>
            </div>
        </div>
    `;
    
    // Insertar HTML y mostrar con animación
    $('#pokemonCard').html(html).fadeIn(500);
}


// Funciones auxiliares
function getDescription(species) {
    const entry = species.flavor_text_entries.find(e => e.language.name === 'es');
    return entry ? entry.flavor_text.replace(/[\n\f]/g, ' ') : 'Descripción no disponible';
}

function getGenus(species) {
    const genus = species.genera.find(g => g.language.name === 'es');
    return genus ? genus.genus : 'Desconocido';
}

function showError() {
    $('#pokemonCard').html(`
        <div class="pokemon-header bg-danger text-white">
            <h1>Error</h1>
        </div>
        <div class="text-center p-4">
            <p>No se pudo cargar el Pokémon</p>
        </div>
    `).fadeIn(500);
}