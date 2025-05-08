// Colores para los tipos Pokémon
const typeColors = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC'
};

// Para las generaciones de pokemon
const generationRanges = {
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

function getGenerationByPokemonId(id) {
    for (const [gen, range] of Object.entries(generationRanges)) {
        if (id >= range.start && id <= range.end) {
            return parseInt(gen);
        }
    }
    return 1; 
}

// Cache para almacenar datos de Pokémon
const pokemonCache = {};

// Obtener Pokémon por nombre o ID
async function fetchPokemon(identifier) {
    if (pokemonCache[identifier]) {
        return pokemonCache[identifier];
    }
    
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${identifier}`);
        const response1 = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${identifier}`);
        const data = await response.json();
        const data1 = await response1.json();
        
        const pokemonData = {
            name: data.name,
            id: data.id,
            types: data.types.map(t => t.type.name),
            height: data.height,
            weight: data.weight,
            habitat: data1.habitat,
            generation: getGenerationByPokemonId(data.id),
            sprites: {
                front_default: data.sprites.front_default || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'
            }
        };
        
        pokemonCache[identifier] = pokemonData;
        return pokemonData;
    } catch (error) {
        console.error('Error fetching Pokémon:', error);
        return null;
    }
}

// Comparar las generaciones
function compareGenerations(guessedGen, actualGen) {
    if (guessedGen === actualGen) {
        return { match: true, hint: '' };
    }
    return { 
        match: false, 
        hint: guessedGen > actualGen ? 'Generación anterior' : 'Generación posterior' 
    };
}

//Comparar números (para ID, altura, peso)
function compareNumbers(guessed, actual) {
    if (guessed === actual) {
        return { match: true, hint: '' };
    }
    return { 
        match: false, 
        hint: guessed > actual ? 'Más alto' : 'Más bajo' 
    };
}

// Comparar arrays (para tipos)
function compareArrays(guessed, actual) {
    if (arraysEqual(guessed, actual)) return '';
    
    const commonElements = guessed.filter(element => actual.includes(element));
    
    if (commonElements.length > 0) {
        return `Tienes ${commonElements.length} tipo(s) correcto(s)`;
    }
    
    return 'Ningún tipo coincide';
}

function compareArrays1(guessed, actual) {
    if (arraysEqual(guessed, actual)) return '';
    
    const commonElements = guessed.filter(element => actual.includes(element));
    
    if (commonElements.length > 0) {
        return `Tienes ${commonElements.length} habitat(s) correcto(s)`;
    }
    
    return 'Ningún habitat coincide';
}

function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
    
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    
    for (let i = 0; i < sortedA.length; i++) {
        if (sortedA[i] !== sortedB[i]) return false;
    }
    
    return true;
}

//Crear la pista
function createHint(category, value, isCorrect, hintText = '') {
    const hintDiv = document.createElement('div');
    hintDiv.className = 'hint-row';
    
    if (isCorrect) {
        hintDiv.classList.add('correct');
    } else if (hintText) {
        hintDiv.classList.add('partial');
        value += ` (${hintText})`;
    } else {
        hintDiv.classList.add('incorrect');
    }
    
    hintDiv.innerHTML = `
        <div class="hint-category">${category}:</div>
        <div class="hint-value">${value}</div>
    `;
    
    return hintDiv;
}

//Obtener lista de todos los Pokémon
async function fetchAllPokemonNames(limit = 151) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
        const data = await response.json();
        return data.results.map(p => p.name);
    } catch (error) {
        console.error('Error fetching Pokémon list:', error);
        return [];
    }
}