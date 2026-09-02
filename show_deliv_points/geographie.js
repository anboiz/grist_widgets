/**
 * @file geographie.js
 * @description Gestion de la carte MapLibre GL JS pour afficher un point à partir des coordonnées X (longitude) et Y (latitude).
 */

// Éléments DOM
const coordinateXInput = document.getElementById('objectauto-coordinate-x-input');
const coordinateYInput = document.getElementById('objectauto-coordinate-y-input');

// Configuration de la carte
const MAP_CENTER = [2.3522, 46.6034]; // Coordonnées centrées sur la France
const MAP_ZOOM = 5; // Niveau de zoom initial

// Initialisation de la carte
let map = null;
let marker = null;

/**
 * Initialise la carte MapLibre GL JS.
 */
function initMap() {
  map = new maplibregl.Map({
    container: 'map',
    style: 'https://demotiles.maplibre.org/style.json', // Style par défaut
    center: MAP_CENTER,
    zoom: MAP_ZOOM,
  });

  // Ajoute les contrôles de navigation
  map.addControl(new maplibregl.NavigationControl(), 'top-right');

  // Écoute les changements sur les champs de coordonnées
  coordinateXInput.addEventListener('change', updateMarker);
  coordinateYInput.addEventListener('change', updateMarker);
}

/**
 * Met à jour la position du marqueur sur la carte en fonction des coordonnées.
 */
function updateMarker() {
  const longitude = parseFloat(coordinateXInput.value);
  const latitude = parseFloat(coordinateYInput.value);

  // Vérifie que les coordonnées sont valides
  if (isNaN(longitude) || isNaN(latitude)) {
    return;
  }

  // Centre la carte sur les nouvelles coordonnées
  map.flyTo({
    center: [longitude, latitude],
    zoom: 12,
  });

  // Supprime l'ancien marqueur s'il existe
  if (marker) {
    marker.remove();
  }

  // Ajoute un nouveau marqueur
  marker = new maplibregl.Marker()
    .setLngLat([longitude, latitude])
    .addTo(map);
}

// Initialise la carte lorsque la page est chargée
document.addEventListener('DOMContentLoaded', initMap);