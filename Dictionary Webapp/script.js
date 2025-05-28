const searchBtn = document.getElementById('searchBtn');
const wordInput = document.getElementById('wordInput');
const resultBox = document.getElementById('result');
const themeToggle = document.getElementById('themeToggle');
const historyList = document.getElementById('historyList');
const favoritesList = document.getElementById('favoritesList');

let searchHistory = JSON.parse(localStorage.getItem('history')) || [];
let favoriteWords = JSON.parse(localStorage.getItem('favorites')) || [];

themeToggle.onclick = () => {
  document.body.dataset.theme = document.body.dataset.theme === 'dark' ? '' : 'dark';
};

function updateHistory(word) {
  if (!searchHistory.includes(word)) {
    searchHistory.unshift(word);
    if (searchHistory.length > 10) searchHistory.pop();
    localStorage.setItem('history', JSON.stringify(searchHistory));
    renderHistory();
  }
}

function updateFavorites(word) {
  if (!favoriteWords.includes(word)) {
    favoriteWords.push(word);
    localStorage.setItem('favorites', JSON.stringify(favoriteWords));
    renderFavorites();
  }
}

function renderHistory() {
  historyList.innerHTML = '';
  searchHistory.forEach(word => {
    const li = document.createElement('li');
    li.textContent = word;
    li.onclick = () => fetchWordDefinition(word);
    historyList.appendChild(li);
  });
}

function renderFavorites() {
  favoritesList.innerHTML = '';
  favoriteWords.forEach(word => {
    const li = document.createElement('li');
    li.textContent = word;
    li.onclick = () => fetchWordDefinition(word);
    favoritesList.appendChild(li);
  });
}

searchBtn.addEventListener('click', () => {
  const word = wordInput.value.trim();
  if (word) fetchWordDefinition(word);
});

async function fetchWordDefinition(word) {
  resultBox.innerHTML = `<p>Loading...</p>`;
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!res.ok) throw new Error('Not found');
    const data = await res.json();
    displayDefinition(data[0]);
    updateHistory(word);
  } catch (error) {
    resultBox.innerHTML = `<p>Word not found.</p>`;
  }
}

function displayDefinition(data) {
  const phonetics = data.phonetics.find(p => p.audio) || {};
  const audioHTML = phonetics.audio
    ? `<audio controls src="${phonetics.audio}"></audio>`
    : '';

  const meaningsHTML = data.meanings.map(meaning => `
    <h3>${meaning.partOfSpeech}</h3>
    <ul>
      ${meaning.definitions.map(def => `<li>${def.definition}</li>`).join('')}
    </ul>
    <p><strong>Synonyms:</strong> ${meaning.synonyms.join(', ') || 'None'}</p>
    <p><strong>Antonyms:</strong> ${meaning.antonyms.join(', ') || 'None'}</p>
  `).join('');

  resultBox.innerHTML = `
    <h2>${data.word} <button onclick="updateFavorites('${data.word}')">⭐</button></h2>
    ${audioHTML}
    ${meaningsHTML}
  `;
}

renderHistory();
renderFavorites();
