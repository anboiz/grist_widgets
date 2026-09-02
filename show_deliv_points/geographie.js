/**
 * @file geographie.js
 * @description Gestion de la carte MapLibre GL JS pour afficher un point à partir des coordonnées X (longitude) et Y (latitude).
 * Utilisation des orthophotos de l'IGN via le service WMTS de GéoPlatform.
 */

// Éléments DOM
// const coordinateXInput = document.getElementById('objectauto-coordinate-x');
// const coordinateYInput = document.getElementById('objectauto-coordinate-y');

// Configuration de la carte
const MAP_CENTER = [2.3522, 46.6034]; // Coordonnées centrées sur la France
const MAP_ZOOM = 5; // Niveau de zoom initial

// Initialisation de la carte
let map = null;
let marker = null;



/**
 * Initialise la carte MapLibre GL JS avec les orthophotos de l'IGN.
 */
function initMap() {
  map = new maplibregl.Map({
    container: 'map',
    // Style vide, car nous allons ajouter manuellement les sources et couches
    style: {
      version: 8,
      sources: {},
      layers: [],
    },
    center: MAP_CENTER,
    zoom: MAP_ZOOM,
  });

  // Ajoute les contrôles de navigation
  map.addControl(new maplibregl.NavigationControl(), 'top-right');

  // Ajoute les orthophotos de l'IGN comme source de tuiles
  addIgnOrthophotos();

  // Écoute les changements sur les champs de coordonnées
  coordinateXInput.addEventListener('change', updateMarker);
  coordinateYInput.addEventListener('change', updateMarker);
}

/**
 * Ajoute les orthophotos de l'IGN comme fond de carte.
 * Utilisation du service WMTS de GéoPlatform (data.geopf.fr).
 */
function addIgnOrthophotos() {
  // URL du service WMTS des orthophotos de l'IGN (GéoPlatform)
  const ignOrthoUrl = 'https://data.geopf.fr/wmts';

  // Configuration de la source WMTS
  map.addSource('ign-ortho', {
    type: 'raster',
    tiles: [
      // Requête WMTS pour les orthophotos
      `${ignOrthoUrl}?style=normal\u0026format=image/png\u0026service=WMTS\u0026REQUEST=GETTILE\u0026LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2\u0026TILEMATRIXSET=PM\u0026TILEMATRIX={z}\u0026TILECOL={x}\u0026TILEROW={y}`
    //   `${ignOrthoUrl}?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=HR.ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&FORMAT=image/jpeg&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`
    ],
    // "https://data.geopf.fr/wmts?style=normal\u0026format=image/png\u0026service=WMTS\u0026REQUEST=GETTILE\u0026LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2\u0026TILEMATRIXSET=PM\u0026TILEMATRIX={z}\u0026TILECOL={x}\u0026TILEROW={y}"
    tileSize: 256,
    attribution: '© <a href="https://www.ign.fr" target="_blank">IGN</a>',
  });

  // Ajoute une couche pour afficher les orthophotos
  map.addLayer({
    id: 'ign-ortho-layer',
    type: 'raster',
    source: 'ign-ortho',
    minzoom: 0,
    maxzoom: 19,
  });
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
    zoom: 15, // Zoom plus proche pour voir les détails des orthophotos
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