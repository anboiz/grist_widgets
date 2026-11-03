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
  LGSTR: 'lgstr',
  BOOL: 'bool',
  FLOAT: 'float',
  REF: 'ref',
  ROW: 'row'
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
 * @property {Object} [refConfig] - Configuration spécifique aux références (pour type REF).
 * @property {string} [refConfig.table] - Nom de la table de référence.
 * @property {string} [refConfig.displayField] - Champ à afficher dans les options.
 * @property {string} [refConfig.valueField='id'] - Champ à utiliser comme valeur.
 * @property {string} [refConfig.iconField] - Champ optionnel pour une icône (ex: FontAwesome).
 * /

/**
 * Configuration des champs du formulaire.
 * @type {Object.<string, FormFieldConfig>}
 */
const formFields = {
  id: { type: DATA_TYPES.INT, link: 'id', hidden: true },
  id_gesimmo: {
    type: DATA_TYPES.STR,
    link: 'id_gesimmo',
    name: 'Code GesImmo du bâtiment',
    elementId: 'objectauto-gesimmo',
  },
  source: {
    type: DATA_TYPES.LGSTR,
    link: 'source',
    name: 'Fichier source',
    elementId: 'objectauto-source',
  },
  batiment_comm: {
    type: DATA_TYPES.STR,
    link: 'batiment_comm',
    name: 'Commentaire pour identifier le bâtiment',
    elementId: 'objectauto-batiment_comm',
  },
  deet_comm: {
    type: DATA_TYPES.LGSTR,
    link: 'deet_comm',
    name: 'Commentaire de l\'auditeur sur le statut au regard du dispositif écoénergie tertiaire',
    elementId: 'objectauto-deet_comm',
  },
  bacs:{
    type: DATA_TYPES.ROW,
    name: 'Gestion technique du bâtiment',
    elementId: 'objectauto-bacs',
  },
  bacs_statut: {
    type: DATA_TYPES.REF,
    link: 'bacs_statut',
    name: 'Statut au regard du décret BACS',
    elementId: 'objectauto-bacs_statut',
    isChildOf: 'objectauto-bacs',
    format: 'col-sm',
    refConfig: {
      table: 'BACS_STATUT_OPT',
      displayField: 'Valeur',
      valueField: 'Code',
    },
  },
  bacs_performance: {
    type: DATA_TYPES.REF,
    link: 'bacs_performance',
    name: 'Performance du système existant',
    elementId: 'objectauto-bacs_performance',
    isChildOf: 'objectauto-bacs',
    format: 'col-sm',
    refConfig: {
      table: 'BACS_PERFORMANCE',
      displayField: 'Affichage',
      valueField: 'classe',
    },
  },
  bacs_comm:{
    type: DATA_TYPES.LGSTR,
    link: 'bacs_comm',
    isChildOf: 'objectauto-bacs',
    format: 'col-6',
    name: 'Commentaire de l\'auditeur sur le système GTB existant',
    elementId: 'objectauto-bacs_comm',    
  },
  dpe:{
    type: DATA_TYPES.ROW,
    name: 'Performance énergétique',
    elementId: 'objectauto-dpe',
  },
  dpe_energie_etiquette: {
    type: DATA_TYPES.REF,
    link: 'dpe_energie_etiquette',
    name: 'Etiquette énergie',
    elementId: 'objectauto-dpe_energie_etiquette',
    isChildOf: 'objectauto-dpe',
    format: 'col-sm',
    refConfig: {
      table: 'DPE_ENERGIE_OPT',
      displayField: 'lettre',
      valueField: 'lettre',
      color: 'couleur',
    },
  },
  dpe_energie_ratio: {
    type: DATA_TYPES.FLOAT,
    link: 'dpe_energie_ratio',
    name: 'Consommation par m²',
    isChildOf: 'objectauto-dpe',
    format: 'col-sm',
    elementId: 'objectauto-dpe_energie_ratio',
  },
  dpe_climat_etiquette: {
    type: DATA_TYPES.REF,
    link: 'dpe_climat_etiquette',
    name: 'Etiquette climat',
    elementId: 'objectauto-dpe_climat_etiquette',
    isChildOf: 'objectauto-dpe',
    format: 'col-sm',
    refConfig: {
      table: 'DPE_CLIMAT_OPT',
      displayField: 'lettre',
      valueField: 'lettre',
    },
  },
  dpe_climat_ratio: {
    type: DATA_TYPES.FLOAT,
    link: 'dpe_climat_ratio',
    name: 'Emissions de GES par m²',
    elementId: 'objectauto-dpe_climat_ratio',
    isChildOf: 'objectauto-dpe',
    format: 'col-sm',
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
  console.log('Creating field : ', name, ', Type :', type)

  if (type === DATA_TYPES.STR) {
    return `
      <label class="form-label"><strong>${name}</strong></label>
      <input type="text" class="form-control" id="${elementId}-input">
    `;
  } else if (type === DATA_TYPES.ROW) {
    return `
      <div class="row" id="${elementId}-row"></div>
    `;
  } else if (type === DATA_TYPES.LGSTR) {
    return `
      <label class="form-label"><strong>${name}</strong></label>
      <textarea rows="4" class="form-control" id="${elementId}-input">
    `;
  } else if (type === DATA_TYPES.FLOAT) {
    return `
      <label class="form-label"><strong>${name}</strong></label>
      <input type="number" class="form-control" id="${elementId}-input">
    `;
  } else if (type === DATA_TYPES.BOOL) {
    return `
      <label class="form-label"><strong>${name}</strong></label>
      <input type="checkbox" class="form-check-input" id="${elementId}-input">
    `;
  } else if (type === DATA_TYPES.REF) {
    return `
      <label class="form-label"><strong>${name}</strong></label>
      <select class="form-select" id="${elementId}-input">
        <option value="" selected>Sélectionnez un ${name.toLowerCase()}</option>
      </select>
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
   * Récupère les données formatées pour Grist du modèle pour les injecter dans Grist.
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
    this.createForm()
    // initRefFields().catch(console.error); // Initialisation des champs de référence
  }

  /**
   * Crée le formulaire dynamiquement.
   */
  createForm() {
    const refPromises = [];
    console.log('Formulaire...')
    for (const [key, field] of Object.entries(formFields)) {
      console.log({key, field})
      if (field.hidden) continue;

      let div = document.getElementById(field.elementId);
      if (!div) {
        div = document.createElement('div');
        div.id = field.elementId;

        console.log({field:field})

        if (Object.hasOwn(field, 'format')) {
          console.log({format:field.format})
          div.classList.add(field.format);
        } else {
          div.classList.add('mb-3');
        }
        
        if (Object.hasOwn(field, 'isChildOf')) {
          console.log(field.isChildOf)

          let parent_div = this.rootElement.querySelector(`#${field.isChildOf}-row`);

          console.log({"parent_div":parent_div});

          parent_div.appendChild(div)
        } else {
          this.rootElement.appendChild(div);
        }
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

       // Si c'est un champ de référence, remplissez-le
      if (field.type === DATA_TYPES.REF) {
        console.log("---------Retrieving options---------")
        const promise = fillRefSelect(field.elementId, field).catch(console.error);
        refPromises.push(promise);
      }    

      this.inputs[key] = input;
    }
    return Promise.all(refPromises);
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
      } else if (field.type == DATA_TYPES.REF){
        const optionId = `${field.elementId}_${data.fields[key]}`;
        const option = this.inputs[key].querySelector(`#${optionId}`);
        if (option) {
          option.selected = true;
        }
        if (Object.hasOwn(field.refConfig, 'color')){
          console.log("----------------Couleur !----------------")
          console.log(this.inputs[key])
          console.log(data.fields[key])
        }
        // console.log(this.inputs[key].getElementById(field["elementId"] + data.fields[key]))
      } else if (field.type == DATA_TYPES.FLOAT){
        console.log({"float":data.fields[key]})
        this.inputs[key].value = data.fields[key];
        // console.log(this.inputs[key].getElementById(field["elementId"] + data.fields[key]))
      } else {
        this.inputs[key].value = data.fields[key];
        // data.fields[this.inputs[key].value]
      }
      
    }
  }


  /**
   * Lie l'événement de sauvegarde au bouton.
   * @param {Function} handler - Fonction à exécuter lors de la sauvegarde.
   */
  bindSave(handler) {
    // this.saveButton.addEventListener('click', handler);
  }

  /**
   * Récupère les données du formulaire.
   * @returns {Object.<string, *>} Données du formulaire.
   */
  getFormData() {
    const formData = {};
    for (const [key, field] of Object.entries(formFields)) {
      if (!this.inputs[key]) continue;
      if (field.type == DATA_TYPES.BOOL){
        formData[key] = this.inputs[key].checked;
      } else if ((field.type == DATA_TYPES.INT) || (field.type == DATA_TYPES.REF)){
        formData[key] = parseInt(this.inputs[key].value);
      } else if (field.type == DATA_TYPES.FLOAT){
        formData[key] = parseFloat(this.inputs[key].value);
      } else {
        formData[key] = this.inputs[key].value;
      }
    }
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
    // Attendre que le formulaire soit prêt avant de rendre
    view.createForm().then(() => {
      this.view.render(this.model.getData());
      this.view.bindSave(() => this.handleSave());
    });
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
    this.model.updateFromForm(formData);
    await this.sendDataToGrist(this.model.getDataForGrist());
  }

  /**
   * Envoie les données à Grist.
   * @param {Object} data - Données à envoyer.
   */
  async sendDataToGrist(data) {
    await grist.selectedTable.update(data);
    alert('Objet sauvegardé avec succès !');
  }

  handleNext(offset) {
    // console.log({"offset":offset})
    // console.log({"this.model.data.id":this.model.data.id})
    // console.log({"this.model.data.id+offset":this.model.data.id+offset})
    return this.model.data.id+offset
  }
}

/**
 * Cache pour stocker les données de référence déjà récupérées.
 * @type {Object.<string, Array>}
 */
const refDataCache = {};

/**
 * Récupère les données de référence depuis Grist.
 * @param {string} tableName - Nom de la table de référence.
 * @returns {Promise<Array>} Liste des enregistrements de référence.
 */
async function fetchRefData(tableName) {
  // Vérifie si les données sont déjà en cache
  if (refDataCache[tableName]) {
    return refDataCache[tableName];
  }

  try {
    const data = await grist.docApi.fetchTable(tableName);
    refDataCache[tableName] = data;
    return data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des données de référence (${tableName}):`, error);
    return { id: [], [data.displayField]: [] };
  }
}

/**
 * Formate les données de référence pour un champ SELECT.
 * @param {Array} refData - Données de référence brutes.
 * @param {FormFieldConfig} fieldConfig - Configuration du champ.
 * @returns {Array} Liste des options formatées.
 */
function formatRefOptions(refData, fieldConfig) {
  console.log([refData, fieldConfig])
  if (!refData || !refData.id || !refData.id.length) {
    return [];
  }

  const displayField = fieldConfig.refConfig["displayField"];
  const valueField = fieldConfig.refConfig["valueField"] ?? 'id';
  const iconField = fieldConfig.refConfig["iconField"] ?? null;
  const color = fieldConfig.refConfig["color"] ?? null;

  console.log({
    displayField:displayField,
    valueField:valueField,
    iconField:iconField,
    color:color
  });

  return refData.id.map((_, index) => {
    const option = {
      value: refData[valueField][index],
      label: refData[displayField][index] || 'Non spécifié',
    };

    if (iconField && refData[iconField]) {
      option.icon = refData[iconField][index];
    }

    if (color && refData[color]) {
      option.color = refData[color][index];
    }

    console.log({option:option})

    return option;
  });
}

/**
 * Remplit un champ SELECT avec les options de référence.
 * @param {string} elementId - ID de l'élément SELECT.
 * @param {FormFieldConfig} fieldConfig - Configuration du champ.
 */
async function fillRefSelect(elementId, fieldConfig) {
  console.log([elementId, fieldConfig])
  const selectElement = document.getElementById(`${elementId}-input`);
  if (!selectElement) return;

  const refData = await fetchRefData(fieldConfig.refConfig.table);
  const options = formatRefOptions(refData, fieldConfig);

  // Efface les options existantes (sauf la première)
  while (selectElement.options.length > 1) {
    selectElement.remove(1);
  }

  // Ajoute les options formatées
  options.forEach(option => {
    const optionElement = document.createElement('option');
    console.log(option.value)
    console.log(elementId)
    console.log(elementId + option.value)
    optionElement.id = elementId + "_" + option.value;
    optionElement.value = option.value;
    optionElement.textContent = option.label;
    if (Object.hasOwn(option,'color')){
      optionElement['data-content']=`<span style='background-color: ${option.color};'>${option.value}</span>`

    }
    // if (option.icon) {
    //   optionElement.dataset.icon = option.icon; // Stocke l'icône dans un dataset
    // }
    selectElement.appendChild(optionElement);
  });

  // // Initialise Select2 si disponible
  // if (typeof $.fn.select2 === 'function') {
  //   $(`#${elementId}-input`).select2({
  //     theme: 'bootstrap5',
  //     templateResult: formatOptionWithIcon,
  //     templateSelection: formatOptionWithIcon,
  //   });
  // }
}

/**
 * Formate une option avec une icône (pour Select2).
 * @param {Object} option - Option à formater.
 * @returns {jQuery} Élément jQuery formaté.
 */
function formatOptionWithIcon(option) {
  if (!option.id) return option.text;

  const icon = $(option.element).data('icon');
  if (!icon) return option.text;

  return $(
    `<span>${option.text} <i class="${icon} ms-2"></i></span>`
  );
}

// Fonction pour charger tous les enregistrements
async function fetchAllRecords(currentTableId) {
  console.log("---Recuperation des données---")
  try {
    const data = await grist.docApi.fetchTable(currentTableId);
      allRecords = data;
    console.log({
      "DonneesCollectees":allRecords,
      "Longueur":allRecords.length
    });
    if (allRecords['id'].length > 0) {
      console.log("Qqch à renvoyer !")
      currentRecordIndex = 0;
      // updateNavigationButtons();
      // loadRecord(currentRecordIndex);
      return allRecords;
      
    } else {
      console.warn("Aucun enregistrement trouvé dans la table.");
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des enregistrements :", error);
  }
}



// ========== INITIALISATION ==========
const model = new ObjectModel();
const view = new ObjectView();
const controller = new ObjectController(model, view);

// Variables globales pour la navigation
let currentRecordIndex = 0;
// let allRecords = [];
let currentTableId = 'INFOENERGIE'; // À adapter selon votre configuration

/**
 * Charge un enregistrement spécifique dans le formulaire.
 * @param {number} index - Index de l'enregistrement à charger.
 */
async function loadRecord(index) {
  console.log('Loading record index : ' + index)
  grist.viewApi.setSelectedRows(index)
  let selectedRecord = await grist.viewApi.fetchSelectedRecord(index)
  console.log(selectedRecord)

  const mappedRecord = grist.mapColumnNames(selectedRecord);

  console.log(mappedRecord)

  // Prépare les données pour le modèle
  const recordData = { id: selectedRecord.id };
  for (const [key, gristColumn] of Object.entries(appSideMapping)) {
    recordData[key] = mappedRecord[gristColumn] !== undefined
      ? mappedRecord[gristColumn]
      : defaultValues[key];
  }

  console.log(recordData)

  model.updateFromGrist(recordData);
  controller.render();  
}

/**
 * Configure les écouteurs d'événements pour les boutons de navigation.
 */
async function setupNavigationListeners(currentTableId) {
  console.log("---Setup des boutons---")
  // console.log({"Table":currentTableId})
  // const allRecords = await fetchAllRecords(currentTableId);

  document.getElementById('prev-btn').addEventListener('click', () => {
    console.log('Prev. button pressed')
    loadRecord(controller.handleNext(-1));
  });

  document.getElementById('next-btn').addEventListener('click', () => {
    console.log('Next button pressed')
    loadRecord(controller.handleNext(+1));
  });
}

// Initialisation de Grist
grist.ready({
  columns: gristColumns,
  requiredAccess: 'full',
})

console.log("I\'m ready !!!!!!")
let allRecords = fetchAllRecords(currentTableId);
setupNavigationListeners(currentTableId);




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