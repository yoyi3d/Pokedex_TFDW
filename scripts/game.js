//Variables del juego
let pokemonToGuess = null;
let attempts = 0;
const maxPokemon = 1025; //Solo primera generación para simplificar
let allPokemonNames = [];

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
        document.getElementById('pokemon-image').classList.add('revealed');
        setTimeout(() => {
            initGame(); //Reiniciar juego
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
    ).slice(0, 12); //Limitar a 12 sugerencias
    
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

//Comparar Pokémon y mostrar pistas
function comparePokemon(guessedPokemon) {
    const hintsContainer = document.getElementById('hints-container');
    
    //Crear filas de pistas
    const hintRow = document.createElement('div');
    hintRow.className = 'hint-row';
    
    //Nombre
    const nameHint = createHint('Nombre', guessedPokemon.name, guessedPokemon.name === pokemonToGuess.name);
    hintRow.appendChild(nameHint);
    
    hintsContainer.appendChild(hintRow);
    
    //ID
    const idComparison = compareNumbers(guessedPokemon.id, pokemonToGuess.id);
    const idHint = createHint('ID', `#${guessedPokemon.id}`, idComparison.match, idComparison.hint);
    hintsContainer.appendChild(idHint);
    
    //Tipo(s)
    const typesHint = createHint('Tipo(s)', 
        guessedPokemon.types.map(type => 
            `<span class="type" style="background-color: ${typeColors[type]}">${type}</span>`
        ).join(''),
        arraysEqual(guessedPokemon.types, pokemonToGuess.types),
        compareArrays(guessedPokemon.types, pokemonToGuess.types)
    );
    hintsContainer.appendChild(typesHint);
    
    //Altura
    const heightComparison = compareNumbers(guessedPokemon.height, pokemonToGuess.height);
    const heightHint = createHint('Altura', `${guessedPokemon.height / 10}m`, 
                                heightComparison.match, heightComparison.hint);
    hintsContainer.appendChild(heightHint);
    
    //Peso
    const weightComparison = compareNumbers(guessedPokemon.weight, pokemonToGuess.weight);
    const weightHint = createHint('Peso', `${guessedPokemon.weight / 10}kg`, 
                                weightComparison.match, weightComparison.hint);
    hintsContainer.appendChild(weightHint);

    //Generación
    const genComparison = compareGenerations(guessedPokemon.generation, pokemonToGuess.generation);
    const genHint = createHint(
        'Generación',
        `Gen ${guessedPokemon.generation}`,
        genComparison.match,
        genComparison.hint
    );
    hintsContainer.appendChild(genHint);
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