// Variables del juego
let pokemonToGuess = null;
let attempts = 0;
const maxPokemon = 151; // Ponemos aquí los pokemon que queremos (podemos ver si podemos hacer el juego por generaciones¿?)

// Inicializar el juego
async function initGame() {
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
    
    console.log('Pokémon a adivinar:', pokemonToGuess.name); //Para debug
}

//Manejar el intento de adivinar
async function handleGuess() {
    const guessInput = document.getElementById('pokemon-guess');
    const guess = guessInput.value.trim().toLowerCase();
    
    if (!guess) return;
    
    //Obtener datos del Pokémon adivinado
    const guessedPokemon = await fetchPokemon(guess);
    
    if (!guessedPokemon) {
        alert('¡Pokémon no encontrado! Intenta con otro nombre.');
        return;
    }
    
    attempts++;
    document.getElementById('attempts-count').textContent = attempts;
    
    //Comparar con el Pokémon a adivinar
    comparePokemon(guessedPokemon);
    
    //Limpiar el input
    guessInput.value = '';
    
    //Comprobar si acertó
    if (guessedPokemon.name === pokemonToGuess.name) {
        document.getElementById('pokemon-image').classList.add('revealed');
        setTimeout(() => {
            alert(`¡Felicidades! Adivinaste el Pokémon en ${attempts} intentos.`);
            initGame(); //Reiniciar juego
        }, 500);
    }
}

// Comparar Pokémon y mostrar pistas
function comparePokemon(guessedPokemon) {
    const hintsContainer = document.getElementById('hints-container');
    
    //Crear filas de pistas
    const hintRow = document.createElement('div');
    hintRow.className = 'hint-row';
    
    //Nombre
    const nameHint = createHint('Nombre', guessedPokemon.name, 
                              guessedPokemon.name === pokemonToGuess.name);
    hintRow.appendChild(nameHint);
    
    hintsContainer.appendChild(hintRow);
    
    //ID
    const idComparison = compareNumbers(guessedPokemon.id, pokemonToGuess.id);
    const idHint = createHint('ID', `#${guessedPokemon.id}`, 
                             idComparison.match, idComparison.hint);
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
}

//Event listeners
document.getElementById('guess-button').addEventListener('click', handleGuess);
document.getElementById('pokemon-guess').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleGuess();
});

//Iniciar el juego al cargar la página
window.addEventListener('load', initGame);