
const POKEMON_TO_SHOW = 'charizard';

$(document).ready(function() {
    fetchPokemonData(POKEMON_TO_SHOW);
});

async function fetchPokemonData(pokemonName) {
    try {
        // Mostrar spinner de carga
        $('#loadingSpinner').show();
        $('#pokemonCard').hide();
        
        // Obtener datos básicos del Pokémon
        const response = await $.ajax({
            url: `https://pokeapi.co/api/v2/pokemon/${pokemonName}`,
            method: 'GET'
        });
        
        // Obtener datos de la especie para la descripción
        const speciesResponse = await $.ajax({
            url: response.species.url,
            method: 'GET'
        });
        
        // Buscar la descripción en español
        let description = 'Descripción no disponible';
        speciesResponse.flavor_text_entries.some(entry => {
            if (entry.language.name === 'es') {
                description = entry.flavor_text.replace(/\n/g, ' ');
                return true;
            }
        });
        
        // Si no hay descripción en español, buscar en inglés
        if (description === 'Descripción no disponible') {
            speciesResponse.flavor_text_entries.some(entry => {
                if (entry.language.name === 'en') {
                    description = entry.flavor_text.replace(/\n/g, ' ');
                    return true;
                }
            });
        }
        
        // Actualizar la UI con los datos
        updatePokemonUI(response, speciesResponse, description);
        
    } catch (error) {
        console.error('Error al obtener datos del Pokémon:', error);
        // Mostrar mensaje de error en la tarjeta
        $('#pokemonName').text('Pokémon no encontrado');
        $('#pokemonDescription').text('No se pudo cargar la información del Pokémon solicitado.');
    } finally {
        // Ocultar spinner de carga
        $('#loadingSpinner').hide();
        $('#pokemonCard').show();
    }
}

function updatePokemonUI(pokemonData, speciesData, description) {
    // Actualizar nombre y número
    const pokemonNumber = pokemonData.id.toString().padStart(3, '0');
    $('#pokemonName').text(`#${pokemonNumber} ${pokemonData.name.toUpperCase()}`);
    
    // Actualizar imagen
    $('#pokemonImage').attr('src', pokemonData.sprites.other['official-artwork'].front_default);
    $('#pokemonImage').attr('alt', pokemonData.name);
    
    // Actualizar descripción
    $('#pokemonDescription').text(description);
    
    // Actualizar tipos
    $('#typesContainer').empty();
    pokemonData.types.forEach(type => {
        const typeName = type.type.name;
        $('#typesContainer').append(
            `<span class="type-badge ${typeName}">${typeName.toUpperCase()}</span>`
        );
    });
    
    // Actualizar categoría (género)
    const genera = speciesData.genera.find(g => g.language.name === 'es') || 
                  speciesData.genera.find(g => g.language.name === 'en');
    $('#pokemonSpecies').text(genera ? genera.genus : 'Desconocido');
    
    // Actualizar altura y peso (convertir de decímetros a metros y de hectogramos a kg)
    $('#pokemonHeight').text((pokemonData.height / 10).toFixed(1));
    $('#pokemonWeight').text((pokemonData.weight / 10).toFixed(1));
    
    // Actualizar habilidad
    const ability = pokemonData.abilities.find(a => !a.is_hidden) || pokemonData.abilities[0];
    $('#pokemonAbility').text(ability.ability.name.replace('-', ' '));
}