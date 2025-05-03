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

// Comparar números (para ID, altura, peso)
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

// Verificar si dos arrays son iguales
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

// Crear la pista
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

// Obtener Pokémon por nombre o ID
async function fetchPokemon(identifier) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${identifier}`);
        const data = await response.json();
        
        return {
            name: data.name,
            id: data.id,
            types: data.types.map(t => t.type.name),
            height: data.height,
            weight: data.weight,
            sprites: {
                front_default: data.sprites.front_default
            }
        };
    } catch (error) {
        console.error('Error fetching Pokémon:', error);
        return null;
    }
}