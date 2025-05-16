//Variables del juego
let pokemonToGuess = null;
let attempts = 0;
const maxPokemon = 1025; 
let allPokemonNames = [];

 document.getElementById('homeButton').addEventListener('click', function() {
        window.location.href = 'browser.html';
    });
//Inicializar el juego
async function initGame() {
    //Cargar lista completa de Pokémon si no está cargada
    if (allPokemonNames.length === 0) {
        allPokemonNames = await fetchAllPokemonNames(maxPokemon);
    }
    
    //Obtener un Pokémon aleatorio
    const randomId = Math.floor(Math.random() * maxPokemon) + 1;
    pokemonToGuess = await fetchPokemon(randomId);
    
    //Mostrar la silueta
    const pokemonImage = document.getElementById('pokemon-image');
    pokemonImage.src = pokemonToGuess.sprites.front_default;
    pokemonImage.classList.remove('revealed');
    
    //Reiniciar contadores
    attempts = 0;
    document.getElementById('attempts-count').textContent = attempts;
    document.getElementById('hints-container').innerHTML = '';
    document.getElementById('suggestions-container').innerHTML = '';
    
    console.log('Pokémon a adivinar:', pokemonToGuess.name); //Para debug
}

//Manejar el intento de adivinar
async function handleGuess() {
    const guessInput = document.getElementById('pokemon-guess');
    const guess = guessInput.value.trim().toLowerCase();
    
    if (!guess) return;
    
    //Obtener datos del Pokémon adivinado
    const guessedPokemon = await fetchPokemon(guess);
    
    attempts++;
    document.getElementById('attempts-count').textContent = attempts;
    
    //Comparar con el Pokémon a adivinar
    comparePokemon(guessedPokemon);
    
    //Limpiar el input y sugerencias
    guessInput.value = '';
    document.getElementById('suggestions-container').innerHTML = '';
    
    //Comprobar si acertó
    if (guessedPokemon.name === pokemonToGuess.name) {
        const pokemonImage = document.getElementById('pokemon-image');
        pokemonImage.classList.add('revealed');
        
        setTimeout(() => {
            initGame(); // Reiniciar juego
        }, 2500);
    }
}

//Mostrar sugerencias mientras se escribe
async function showSuggestions(input) {
    const container = document.getElementById('suggestions-container');
    container.innerHTML = '';
    
    if (input.length < 2) return; //Mostrar solo después de 2 caracteres
    
    const filtered = allPokemonNames.filter(name => 
        name.startsWith(input.toLowerCase())
    ).slice(0, 18); //Limitar a 12 sugerencias
    
    //Mostrar loading
    container.innerHTML = '<div class="loading">Buscando Pokémon...</div>';
    
    //Cargar en paralelo
    const suggestions = await Promise.all(
        filtered.map(async name => {
            const pokemonData = await fetchPokemon(name);
            return { name, data: pokemonData };
        })
    );
    
    container.innerHTML = '';
    
    suggestions.forEach(({ name, data }) => {
        if (!data) return;
        
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.innerHTML = `
            <img src="${data.sprites.front_default}" class="suggestion-image">
            <div class="suggestion-name">${name}</div>
        `;
        
        item.addEventListener('click', () => {
            document.getElementById('pokemon-guess').value = name;
            container.innerHTML = '';
            handleGuess();
        });
        
        container.appendChild(item);
    });
}

function comparePokemon(guessedPokemon) {
    const hintsContainer = document.getElementById('hints-container');
    
    const hintContainer = document.createElement('div');
    hintContainer.className = 'hint-container';
    hintContainer.style.opacity = '0';
    
    // Imagen del Pokémon (sin texto)
    const pokemonImageBox = document.createElement('div');
    pokemonImageBox.className = 'hint-box';
    pokemonImageBox.innerHTML = `
        <img src="${guessedPokemon.sprites.front_default}" 
             class="pokemon-hint-image" 
             alt="${guessedPokemon.name}">
    `;
    hintContainer.appendChild(pokemonImageBox);
    
    // ID
    const idComparison = compareNumbers(guessedPokemon.id, pokemonToGuess.id);
    const idBox = createHintBox(
        `#${guessedPokemon.id}`,
        idComparison.match,
        idComparison.hint
    );
    hintContainer.appendChild(idBox);
    
    // Tipo(s)
    const typesComparison = compareTypes(guessedPokemon.types, pokemonToGuess.types);
    const typesBox = document.createElement('div');
    typesBox.className = `hint-box ${typesComparison.status}`;
    
    typesBox.innerHTML = `
        <div class="type-hint">
            <div class="type-container">
                ${guessedPokemon.types.map(type => 
                    `<span class="type" style="background-color: ${typeColors[type]}">${type}</span>`
                ).join('')}
            </div>
        </div>
    `;
    hintContainer.appendChild(typesBox);
    
    // Altura
    const heightComparison = compareNumbers(guessedPokemon.height, pokemonToGuess.height);
    const heightBox = createHintBox(
        `${guessedPokemon.height / 10} m`,
        heightComparison.match,
        heightComparison.hint
    );
    hintContainer.appendChild(heightBox);
    
    // Peso
    const weightComparison = compareNumbers(guessedPokemon.weight, pokemonToGuess.weight);
    const weightBox = createHintBox(
        `${guessedPokemon.weight / 10} kg`,
        weightComparison.match,
        weightComparison.hint
    );
    hintContainer.appendChild(weightBox);
    
    // Generación
    const genComparison = compareGenerations(guessedPokemon.generation, pokemonToGuess.generation);
    const genBox = createHintBox(
        `Gen ${guessedPokemon.generation}`,
        genComparison.match,
        genComparison.hint
    );
    hintContainer.appendChild(genBox);
    
    hintsContainer.appendChild(hintContainer);
        setTimeout(() => {
        hintContainer.style.transition = 'opacity 0.5s ease';
        hintContainer.style.opacity = '1';
    }, 100);
}

// Nueva función para comparar tipos
function compareTypes(guessedTypes, actualTypes) {
    if (arraysEqual(guessedTypes, actualTypes)) {
        return { status: 'correct' };
    }
    
    const commonTypes = guessedTypes.filter(type => actualTypes.includes(type));
    return {
        status: commonTypes.length > 0 ? 'partial' : 'incorrect'
    };
}

// Función para crear cajas de pista
function createHintBox(value, isCorrect, hint) {
    const hintBox = document.createElement('div');
    hintBox.className = `hint-box ${isCorrect ? 'correct' : 'incorrect'}`;
    
    let displayValue = value;
    if (hint === 'Más alto' || hint === 'Generación posterior') {
        displayValue = `${value}<span class="arrow arrow-down"></span>`;
    } else if (hint === 'Más bajo' || hint === 'Generación anterior') {
        displayValue = `${value}<span class="arrow arrow-up"></span>`;
    }
    
    hintBox.innerHTML = displayValue;
    return hintBox;
}

// Función compareNumbers actualizada
function compareNumbers(guessed, actual) {
    if (guessed === actual) {
        return { match: true, hint: '' };
    }
    return { 
        match: false, 
        hint: guessed > actual ? 'Más alto' : 'Más bajo' 
    };
}

// Función compareGenerations actualizada
function compareGenerations(guessedGen, actualGen) {
    if (guessedGen === actualGen) {
        return { match: true, hint: '' };
    }
    return { 
        match: false, 
        hint: guessedGen > actualGen ? 'Generación posterior' : 'Generación anterior' 
    };
}

//Event listeners
document.getElementById('guess-button').addEventListener('click', handleGuess);
document.getElementById('pokemon-guess').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleGuess();
});
document.getElementById('pokemon-guess').addEventListener('input', (e) => {
    showSuggestions(e.target.value.trim());
});

//Iniciar el juego al cargar la página
window.addEventListener('load', initGame);