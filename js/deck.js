
const deckContainer = document.getElementById('deckContainer');
const shuffleBtn = document.getElementById('shuffleDeck');
const resetBtn = document.getElementById('resetDeck');
const themeToggle = document.getElementById('themeToggle');

// New elements for card search
const searchWrapper = document.createElement('div');
searchWrapper.style.marginBottom = '1rem';

searchWrapper.innerHTML = `
  <input type="text" id="cardSearchInput" placeholder="Enter Pokémon name..." style="padding: 0.5rem; width: 200px; margin-right: 0.5rem;" />
  <button id="addCardBtn">Add Card</button>
  <span id="cardSearchStatus" style="margin-left: 10px; font-style: italic;"></span>
`;

document.querySelector('main').prepend(searchWrapper);

const cardSearchInput = document.getElementById('cardSearchInput');
const addCardBtn = document.getElementById('addCardBtn');
const cardSearchStatus = document.getElementById('cardSearchStatus');

let deck = [];

const savedDeck = localStorage.getItem('pokemonDeck');


if (savedDeck) {
  deck = JSON.parse(savedDeck);
  renderDeck();
} else {
  fetchStarterDeck();
}

async function fetchStarterDeck() {

const loadingDiv = document.createElement('div');
  loadingDiv.id = 'loadingStatus';
  loadingDiv.style.fontStyle = 'italic';
  loadingDiv.style.marginBottom = '10px';
  loadingDiv.textContent = 'Loading your deck...';
  deckContainer.parentNode.insertBefore(loadingDiv, deckContainer);

  const pokemonNames = ['Pikachu', 'Charizard', 'Gengar', 'Snorlax', 'Machamp','Rapidash'];
  for (let name of pokemonNames) {
    await fetchAndAddCard(name);
    renderDeck();
  }
  saveDeck();
  
  const loadingMessage = document.getElementById('loadingStatus');
  if (loadingMessage) loadingMessage.remove();
}

async function fetchAndAddCard(name, showStatus = false) {
  if (showStatus) {
    cardSearchStatus.textContent = 'Searching...';
  }

  try {
    const res = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:${name}`);
    const data = await res.json();
    const card = data.data.find(c => c.images && c.attacks);
    if (card) {
      deck.push({
        name: card.name,
        type: card.types ? card.types.join(', ') : 'N/A',
        hp: card.hp || 'N/A',
        attack: card.attacks[0].name || 'Unknown',
        damage: card.attacks[0].damage || '0',
        image: card.images.small
      });
      //renderDeck();
      saveDeck();
      if (showStatus) cardSearchStatus.textContent = 'Card added!';
      return true;
    } else {
      if (showStatus) cardSearchStatus.textContent = 'Pokémon not found.';
      return false;
    }
  } catch (err) {
    console.error('Error fetching card:', err);
    if (showStatus) cardSearchStatus.textContent = 'Error fetching card.';
    return false;
  }
}

function renderDeck() {
  deckContainer.innerHTML = '';
  deck.forEach((card, index) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'deck-card';
    cardEl.setAttribute('draggable', true);
    cardEl.setAttribute('data-index', index);
    cardEl.innerHTML = `
      <img src="${card.image}" alt="${card.name}" style="width:100%; border-radius:8px;" />
      <h3>${card.name}</h3>
      <button class="remove-btn" data-index="${index}" style="margin-top: 8px; background: #e53935; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">
        Remove
      </button>
    `;
    deckContainer.appendChild(cardEl);
  });

  addDragEvents(); // re-apply drag & drop after rerender

  // attach listeners to new remove buttons each time
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const index = +e.target.dataset.index;
      deck.splice(index, 1);
      saveDeck();
      renderDeck(); // trigger rerender
    });
  });
}


function saveDeck() {
  localStorage.setItem('pokemonDeck', JSON.stringify(deck));
}

function addDragEvents() {
  const cards = document.querySelectorAll('.deck-card');
  let dragSrcIndex = null;

  cards.forEach(card => {
    card.addEventListener('dragstart', e => {
      dragSrcIndex = +card.getAttribute('data-index');
      card.style.opacity = '0.5';
    });

    card.addEventListener('dragover', e => e.preventDefault());

    card.addEventListener('drop', e => {
      const dropIndex = +card.getAttribute('data-index');
      [deck[dragSrcIndex], deck[dropIndex]] = [deck[dropIndex], deck[dragSrcIndex]];
      renderDeck();
      saveDeck();
    });

    card.addEventListener('dragend', () => {
      card.style.opacity = '1';
    });
  });
}

shuffleBtn.addEventListener('click', () => {
  deck.sort(() => Math.random() - 0.5);
  renderDeck();
  saveDeck();
});

resetBtn.addEventListener('click', () => {
  localStorage.removeItem('pokemonDeck');
  location.reload();
});

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

addCardBtn.addEventListener('click', async () => {
  const name = cardSearchInput.value.trim();
  if (!name) return;
  const success = await fetchAndAddCard(name, true);
  if (success) {
    cardSearchInput.value = '';
  }
});
