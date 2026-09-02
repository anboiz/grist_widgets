/**
 * @file adresse.js
 * @description Gestion de l'auto-complétion d'adresse via l'API Adresse officielle française.
 *              Récupère les coordonnées géographiques (X: longitude, Y: latitude) et les stocke dans des champs masqués.
 */

// URL de l'API Adresse (DINUM)
const API_ADRESSE_URL = 'https://api-adresse.data.gouv.fr/search/';

// Délai avant d'envoyer une requête (ms)
const DEBOUNCE_DELAY = 300;

// Éléments DOM
const addressInput = document.getElementById('objectauto-address-input');
const addressSuggestions = document.getElementById('address-suggestions');
const coordinateXInput = document.getElementById('objectauto-coordinate-x-input');
const coordinateYInput = document.getElementById('objectauto-coordinate-y-input');

// Variable pour stocker la requête en cours
let currentRequest = null;

/**
 * Affiche les suggestions d'adresse dans la liste déroulante.
 * @param {Array} suggestions - Liste des suggestions d'adresse.
 */
function displaySuggestions(suggestions) {
  if (suggestions.length === 0) {
    addressSuggestions.style.display = 'none';
    return;
  }

  addressSuggestions.innerHTML = '';
  suggestions.forEach((suggestion) => {
    const suggestionItem = document.createElement('div');
    suggestionItem.className = 'address-suggestion-item';
    suggestionItem.textContent = suggestion.properties.label;
    suggestionItem.addEventListener('click', () => {
      selectSuggestion(suggestion);
    });
    addressSuggestions.appendChild(suggestionItem);
  });

  addressSuggestions.style.display = 'block';
}

/**
 * Sélectionne une suggestion et remplit les champs d'adresse et de coordonnées.
 * @param {Object} suggestion - Suggestion sélectionnée.
 */
function selectSuggestion(suggestion) {
  // Remplit le champ d'adresse
  addressInput.value = suggestion.properties.label;

  // Remplit les coordonnées (X = longitude, Y = latitude)
  const [longitude, latitude] = suggestion.geometry.coordinates;
  coordinateXInput.value = parseFloat(longitude).toFixed(6); // Conversion en float avec 6 décimales
  coordinateYInput.value = parseFloat(latitude).toFixed(6); // Conversion en float avec 6 décimales


  // Masque les suggestions
  addressSuggestions.style.display = 'none';

  
  // Met à jour la carte (si elle est initialisée)
  if (typeof updateMarker === 'function') {
    updateMarker();
  }
}

/**
 * Effectue une requête à l'API Adresse pour obtenir des suggestions.
 * @param {string} query - Texte saisi par l'utilisateur.
 */
function fetchAddressSuggestions(query) {
  if (!query || query.length < 3) {
    addressSuggestions.style.display = 'none';
    return;
  }

  // Annule la requête précédente si elle existe
  if (currentRequest) {
    currentRequest.abort();
  }

  currentRequest = new AbortController();
  const signal = currentRequest.signal;

  fetch(`${API_ADRESSE_URL}?q=${encodeURIComponent(query)}&limit=5`, { signal })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erreur lors de la requête à l\'API Adresse.');
      }
      return response.json();
    })
    .then((data) => {
      if (data.features && data.features.length > 0) {
        displaySuggestions(data.features);
      } else {
        addressSuggestions.style.display = 'none';
      }
    })
    .catch((error) => {
      if (error.name !== 'AbortError') {
        console.error('Erreur:', error);
        addressSuggestions.style.display = 'none';
      }
    });
}

/**
 * Gère le délai avant d'envoyer une requête (debounce).
 */
function debounceFetch() {
  let timeoutId = null;
  return function(query) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fetchAddressSuggestions(query);
    }, DEBOUNCE_DELAY);
  };
}

// Initialisation de l'auto-complétion
const debouncedFetch = debounceFetch();

// Écouteur d'événement pour la saisie dans le champ d'adresse
addressInput.addEventListener('input', (event) => {
  const query = event.target.value.trim();
  debouncedFetch(query);
});

// Masque les suggestions si on clique ailleurs
document.addEventListener('click', (event) => {
  if (event.target !== addressInput) {
    addressSuggestions.style.display = 'none';
  }
});