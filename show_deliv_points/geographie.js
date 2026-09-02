/**
 * @file geographie.js
 * @description Gestion de la carte MapLibre GL JS pour afficher un point à partir de coordonnées X (longitude) et Y (latitude).
 * Utilisation des orthophotos de l'IGN via le service WMTS de GéoPlatform.
 */

// =============================================
// CONSTANTES
// =============================================

/**
 * Coordonnées par défaut centrées sur la France.
 * @type {number[]}
 */
const MAP_CENTER = [2.3522, 46.6034];

/**
 * Niveau de zoom initial de la carte.
 * @type {number}
 */
const MAP_ZOOM = 4;

/**
 * Niveau de zoom pour afficher les détails d'une adresse.
 * @type {number}
 */
const DETAIL_ZOOM = 15;

/**
 * URL du service WMTS des orthophotos de l'IGN.
 * @type {string}
 */
const IGN_ORTHO_URL = 'https://data.geopf.fr/wmts';

/**
 * Configuration de la couche WMTS pour les orthophotos.
 * @type {Object}
 */
const IGN_ORTHO_LAYER_CONFIG = {
  url: 'https://data.geopf.fr/wmts',
  layer: 'HR.ORTHOIMAGERY.ORTHOPHOTOS',
  style: 'normal',
  format: 'image/jpeg',
  tileMatrixSet: 'PM',
};

// =============================================
// VARIABLES GLOBALES
// =============================================

/** @type {maplibregl.Map} */
let map = null;

/** @type {maplibregl.Marker} */
let marker = null;

/** @type {MutationObserver} */
let coordinateObserver = null;

// =============================================
// ÉLÉMENTS DOM
// =============================================
// Non nécessaire car déclarés dans adresse.js

// /** @type {HTMLInputElement} */
// const coordinateXInput = document.getElementById('objectauto-coordinate-x');

// /** @type {HTMLInputElement} */
// const coordinateYInput = document.getElementById('objectauto-coordinate-y');

// =============================================
// FONCTIONS PRINCIPALES
// =============================================

/**
 * Initialise la carte MapLibre GL JS avec les orthophotos de l'IGN.
 */
function initMap() {
  // Initialisation de la carte
  map = new maplibregl.Map({
    container: 'map',
    style: {
      version: 8,
      sources: {},
      layers: [],
    },
    center: MAP_CENTER,
    zoom: MAP_ZOOM,
  });

  // Ajout des contrôles de navigation
  map.addControl(new maplibregl.NavigationControl(), 'top-right');

  // Ajout des orthophotos une fois la carte chargée
  map.on('load', addIgnOrthophotos);

  // Initialisation de l'observateur pour les coordonnées
  initCoordinateObserver();
}

/**
 * Ajoute les orthophotos de l'IGN comme fond de carte.
 */
function addIgnOrthophotos() {
  // Configuration de la source WMTS
  map.addSource('ign-ortho', {
    type: 'raster',
    tiles: buildWmtsTileUrl(IGN_ORTHO_LAYER_CONFIG),
    tileSize: 256,
    attribution: '© <a href="https://www.ign.fr" target="_blank">IGN</a>',
  });

  // Ajout de la couche pour afficher les orthophotos
  map.addLayer({
    id: 'ign-ortho-layer',
    type: 'raster',
    source: 'ign-ortho',
    minzoom: 0,
    maxzoom: 19,
  });
}

/**
 * Construit l'URL des tuiles WMTS pour les orthophotos de l'IGN.
 * @returns {string} URL des tuiles WMTS.
 */
function buildWmtsTileUrl(layerConfig) {
  const { url, layer, style, format, tileMatrixSet } = layerConfig;
  return `${url}?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layer}&STYLE=${style}&FORMAT=${format}&TILEMATRIXSET=${tileMatrixSet}&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`;
}

/**
 * Met à jour la position du marqueur sur la carte en fonction des coordonnées.
 */
function updateMarker() {
  const longitude = parseFloat(coordinateXInput.value);
  const latitude = parseFloat(coordinateYInput.value);

  // Si les coordonnées ne sont pas valides, recentre la carte sur la France
  if (areCoordinatesInvalid(longitude, latitude)) {
    resetMapToDefaultView();
    return;
  }

  // Met à jour la vue de la carte et le marqueur
  updateMapView(longitude, latitude);
}

/**
 * Vérifie si les coordonnées sont invalides.
 * @param {number} longitude - Longitude.
 * @param {number} latitude - Latitude.
 * @returns {boolean} `true` si les coordonnées sont invalides.
 */
function areCoordinatesInvalid(longitude, latitude) {
  return isNaN(longitude) || isNaN(latitude) || (longitude === 0 && latitude === 0);
}

/**
 * Recentre la carte sur la vue par défaut (France).
 */
function resetMapToDefaultView() {
  map.flyTo({
    center: MAP_CENTER,
    zoom: MAP_ZOOM,
  });

  // Supprime le marqueur s'il existe
  if (marker) {
    marker.remove();
    marker = null;
  }
}

/**
 * Met à jour la vue de la carte et ajoute un marqueur.
 * @param {number} longitude - Longitude.
 * @param {number} latitude - Latitude.
 */
function updateMapView(longitude, latitude) {
  // Centre la carte sur les nouvelles coordonnées
  map.flyTo({
    center: [longitude, latitude],
    zoom: DETAIL_ZOOM,
  });

  // Met à jour le marqueur
  updateMarkerPosition(longitude, latitude);
}

/**
 * Met à jour la position du marqueur.
 * @param {number} longitude - Longitude.
 * @param {number} latitude - Latitude.
 */
function updateMarkerPosition(longitude, latitude) {
  // Supprime l'ancien marqueur s'il existe
  if (marker) {
    marker.remove();
  }

  // Ajoute un nouveau marqueur
  marker = new maplibregl.Marker()
    .setLngLat([longitude, latitude])
    .addTo(map);
}

// =============================================
// OBSERVATEUR DE COORDONNÉES
// =============================================

/**
 * Initialise l'observateur pour surveiller les changements des coordonnées.
 */
function initCoordinateObserver() {
  // Configuration de l'observateur
  const config = { attributes: true, attributeFilter: ['value'] };

  // Callback pour les mutations
  const callback = (mutationList) => {
    for (const mutation of mutationList) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
        updateMarker();
      }
    }
  };

  // Création de l'observateur
  coordinateObserver = new MutationObserver(callback);

  // Observation des champs de coordonnées
  coordinateObserver.observe(coordinateXInput, config);
  coordinateObserver.observe(coordinateYInput, config);
}

// =============================================
// INITIALISATION
// =============================================

// Initialise la carte lorsque la page est chargée
document.addEventListener('DOMContentLoaded', initMap);