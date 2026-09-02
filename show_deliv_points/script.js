/**
 * @file Custom Grist Widget pour la mise à jour d'un enregistrement.
 * @description Ce widget permet de modifier les données d'un enregistrement Grist via un formulaire.
 */

/**
 * Types de données supportés par le widget.
 * @readonly
 * @enum {string}
 */
const DATA_TYPES = {
  INT: 'int',
  STR: 'str',
  BOOL: 'bool',
};

/**
 * Structure des données du formulaire.
 * @typedef {Object} FormFieldConfig
 * @property {string} type - Type de la variable (DATA_TYPES.INT, DATA_TYPES.STR, DATA_TYPES.BOOL).
 * @property {string} link - Nom de la colonne dans Grist.
 * @property {string} [name] - Nom affiché dans l'interface.
 * @property {string} [elementId] - ID de l'élément de saisie dans le formulaire.
 * @property {*} [default] - Valeur par défaut.
 * @property {boolean} [hidden=false] - Indique si l'élément doit être masqué dans le formulaire.
 */

/**
 * Configuration des champs du formulaire.
 * @type {Object.<string, FormFieldConfig>}
 */
const formFields = {
  id: { type: DATA_TYPES.INT, link: 'id', hidden: true },
  reference: {
    type: DATA_TYPES.STR,
    link: 'Reference',
    name: 'Référence du gestionnaire de réseau',
    elementId: 'objectauto-reference',
  },
  fluide: {
    type: DATA_TYPES.STR,
    link: 'Fluide',
    name: 'Fluide',
    elementId: 'objectauto-fluide',
  },
  manager: {
    type: DATA_TYPES.STR,
    link: 'Gestionnaire',
    name: 'Gestionnaire du réseau',
    elementId: 'objectauto-manager',
  },
  address: {
    type: DATA_TYPES.STR,
    link: 'Adresse',
    name: 'Adresse postale',
    elementId: 'objectauto-address',
  },
  isActive: {
    type: DATA_TYPES.BOOL,
    default: true,
    link: 'Est_actif',
    name: 'Est actif ?',
    elementId: 'objectauto-isActive',
  },
};

/**
 * Extrait les noms des colonnes Grist à partir de la configuration.
 * @returns {string[]} Liste des noms de colonnes.
 */
function getGristColumns() {
  return Object.values(formFields)
    .map((field) => field.link)
    .filter((link) => link !== undefined && link !== 'id');
}

/**
 * Génère un dictionnaire des valeurs par défaut.
 * @returns {Object.<string, *>} Dictionnaire des valeurs par défaut.
 */
function getDefaultValues() {
  return Object.entries(formFields).reduce((acc, [key, field]) => {
    acc[key] = field.default !== undefined ? field.default : '';
    return acc;
  }, {});
}

/**
 * Crée un mappage entre les clés du formulaire et les colonnes Grist.
 * @returns {Object.<string, string>} Mappage des clés.
 */
function getAppSideMapping() {
  return Object.entries(formFields).reduce((acc, [key, field]) => {
    if (field.link !== 'id') {
      acc[key] = field.link;
    }
    return acc;
  }, {});
}

// Initialisation des données par défaut et du mappage
const defaultValues = getDefaultValues();
const appSideMapping = getAppSideMapping();
const gristColumns = getGristColumns();

// Initialisation de Grist
grist.ready({
  columns: gristColumns,
  requiredAccess: 'full',
});

/**
 * Ajoute des classes CSS spécifiques en fonction du type de champ.
 * @param {string} type - Type de champ (DATA_TYPES).
 * @returns {string[]} Liste des classes CSS à ajouter.
 */
function adjustFormStyle(type) {
  if (type === DATA_TYPES.BOOL) {
    return ['form-check', 'form-switch'];
  }
  return [];
}

/**
 * Génère le HTML pour un champ de formulaire.
 * @param {string} name - Nom affiché du champ.
 * @param {string} elementId - ID de l'élément.
 * @param {string} type - Type de champ (DATA_TYPES).
 * @returns {string} HTML du champ.
 */
function createFormField(name, elementId, type) {
  if (type === DATA_TYPES.STR) {
    return `
      <label class="form-label"><strong>${name}</strong></label>
      <input type="text" class="form-control" id="${elementId}-input">
    `;
  } else if (type === DATA_TYPES.BOOL) {
    return `
      <label class="form-label"><strong>${name}</strong></label>
      <input type="checkbox" class="form-check-input" id="${elementId}-input">
    `;
  }
  return '';
}

// ========== MODÈLE ==========
class ObjectModel {
  /**
   * Modèle de données pour le widget.
   */
  constructor() {
    this.data = defaultValues;
    this.mapping = {};
  }

  /**
   * Met à jour le mappage entre les clés du formulaire et Grist.
   * @param {Object.<string, string>} mapping - Mappage à appliquer.
   */
  updateMapping(mapping) {
    this.mapping = mapping;
  }

  /**
   * Met à jour les données depuis Grist.
   * @param {Object} gristData - Données provenant de Grist.
   */
  updateFromGrist(gristData) {
    if (gristData) {
      this.data = gristData;
    } else {
      this.data.id = this.generateUUID();
    }
  }

  /**
   * Met à jour les données depuis le formulaire.
   * @param {Object.<string, *>} formData - Données du formulaire.
   */
  updateFromForm(formData) {
    for (const [key, value] of Object.entries(formData)) {
      this.data[key] = value;
    }
  }

  /**
   * Récupère les données du modèle.
   * @returns {Object} Données du modèle.
   */
  getData() {
    const fields = {};
    for (const [key, field] of Object.entries(formFields)) {
      if (key === 'id') continue;
      fields[key] = this.data[key];
    }
    return {
      id: this.data.id,
      fields,
    };
  }

  /**
   * Récupère les données formatées pour Grist.
   * @returns {Object} Données prêtes pour Grist.
   */
  getDataForGrist() {
    const tempData = this.getData();
    const fields = {};
    for (const [key, gristColumn] of Object.entries(this.mapping)) {
      if (key === 'id') continue;
      fields[gristColumn] = tempData.fields[key];
    }
    return {
      id: this.data.id,
      fields,
    };
  }

  /**
   * Génère un UUID (simplifié pour l'exemple).
   * @returns {string} UUID généré.
   */
  generateUUID() {
    return Math.random().toString(36).substring(2, 15);
  }
}

// ========== VUE ==========
class ObjectView {
  /**
   * Vue du formulaire.
   */
  constructor() {
    this.rootElement = document.getElementById('object-form');
    this.inputs = {};
    this.saveButton = document.getElementById('save-button');
    this.createForm();
  }

  /**
   * Crée le formulaire dynamiquement.
   */
  createForm() {
    for (const [key, field] of Object.entries(formFields)) {
      if (field.hidden) continue;

      let div = document.getElementById(field.elementId);
      if (!div) {
        div = document.createElement('div');
        div.id = field.elementId;
        div.classList.add('mb-3');
        this.rootElement.appendChild(div);
      }

      let input = document.getElementById(`${field.elementId}-input`);
      if (!input) {
        const styles = adjustFormStyle(field.type);
        if (styles.length > 0) {
          div.classList.add(...styles);
        }
        div.innerHTML = createFormField(field.name, field.elementId, field.type);
        input = document.getElementById(`${field.elementId}-input`);
      }

      this.inputs[key] = input;
      console.log(this.inputs)
    }
  }

  /**
   * Affiche les données dans le formulaire.
   * @param {Object} data - Données à afficher.
   */
  render(data) {
    for (const [key, field] of Object.entries(formFields)) {
      if (!this.inputs[key]) continue;
      if (field.type == DATA_TYPES.BOOL){
        this.inputs[key].checked = data.fields[key];
      } else {
        this.inputs[key].value = data.fields[key];
      }
      
    }
  }

  /**
   * Lie l'événement de sauvegarde au bouton.
   * @param {Function} handler - Fonction à exécuter lors de la sauvegarde.
   */
  bindSave(handler) {
    this.saveButton.addEventListener('click', handler);
  }

  /**
   * Récupère les données du formulaire.
   * @returns {Object.<string, *>} Données du formulaire.
   */
  getFormData() {
    const formData = {};
    for (const [key, field] of Object.entries(formFields)) {
      console.log(key)
      console.log(this.inputs[key])
      if (!this.inputs[key]) continue;
      if (field.type == DATA_TYPES.BOOL){
        formData[key] = this.inputs[key].checked;
      } else {
        formData[key] = this.inputs[key].value;
      }
    }
    console.log('Données du formulaire')
    console.log(formData)
    return formData;
  }
}

// ========== CONTRÔLEUR ==========
class ObjectController {
  /**
   * Contrôleur du widget.
   * @param {ObjectModel} model - Modèle de données.
   * @param {ObjectView} view - Vue du formulaire.
   */
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.view.render(this.model.getData());
    this.view.bindSave(() => this.handleSave());
  }

  /**
   * Met à jour la vue.
   */
  render() {
    this.view.render(this.model.getData());
  }

  /**
   * Gère la sauvegarde des données.
   */
  async handleSave() {
    const formData = this.view.getFormData();
    console.log('Form Data')
    console.log(formData)
    this.model.updateFromForm(formData);
    await this.sendDataToGrist(this.model.getDataForGrist());
  }

  /**
   * Envoie les données à Grist.
   * @param {Object} data - Données à envoyer.
   */
  async sendDataToGrist(data) {
    console.log('Envoi à Grist')
    console.log(data)
    await grist.selectedTable.update(data);
    alert('Objet sauvegardé avec succès !');
  }
}

// ========== INITIALISATION ==========
const model = new ObjectModel();
const view = new ObjectView();
const controller = new ObjectController(model, view);

/**
 * Callback appelé par Grist lors de la sélection d'un enregistrement.
 * @param {Object} record - Enregistrement sélectionné.
 * @param {Object} mappings - Mappage des colonnes.
 */
grist.onRecord((record, mappings) => {
  const mappedRecord = grist.mapColumnNames(record);
  if (!mappedRecord) {
    console.error('Veuillez mapper toutes les colonnes requises.');
    return;
  }

  // Crée un mappage entre les clés du formulaire et Grist
  const mappingToGrist = {};
  for (const [key, gristColumn] of Object.entries(appSideMapping)) {
    if (mappings[gristColumn]) {
      mappingToGrist[key] = mappings[gristColumn];
    }
  }

  model.updateMapping(mappingToGrist);

  // Prépare les données pour le modèle
  const recordData = { id: record.id };
  for (const [key, gristColumn] of Object.entries(appSideMapping)) {
    recordData[key] = mappedRecord[gristColumn] !== undefined
      ? mappedRecord[gristColumn]
      : defaultValues[key];
  }

  model.updateFromGrist(recordData);
  controller.render();
});