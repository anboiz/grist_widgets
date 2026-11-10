import { DATA_TYPES, formFields } from './parameters/FormFieldConfig.js';

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
  } else if (type === DATA_TYPES.COLLECTION) {
    return `
      <h4><strong>${name}</strong></h4>
      <div id="${elementId}-input"></div>
    `;
  }
  return '';
}

function generateColorChanger(colorMapping,defaultColor="#606060") {
  return function(select) {
    const color=colorMapping[select.value] ?? defaultColor
    return select.style.backgroundColor = color;
  }
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
  async updateFromGrist(gristData) {
    if (gristData) {
      this.data = gristData;
      console.log(gristData);
      const promises = [];
      for (const [key, value] of Object.entries(formFields)){
        console.log(key)
        console.log(value)
        if(value.type === DATA_TYPES.COLLECTION) {
          console.log(value.refConfig)
          console.log(gristData[this.data ])
          const promise = getRowsByIds(value.refConfig.table, gristData[key])
            .then(result => {
              console.log(result);
              this.data[key] = result;
            });
          promises.push(promise);
        }

      }
    // Attendre que toutes les promesses soient résolues
    await Promise.all(promises);

    console.log(this.data)
    } else {
      this.data.id = this.generateUUID();
    }
    return this.data
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
    for (const [key, field] of Object.entries(formFields)) {
      if (field.hidden) continue;

      let div = document.getElementById(field.elementId);
      if (!div) {
        div = document.createElement('div');
        div.id = field.elementId;

        if (Object.hasOwn(field, 'format')) {

          div.classList.add(field.format);
        } else {
          div.classList.add('mb-3');
        }
        
        if (Object.hasOwn(field, 'isChildOf')) {

          let parent_div = this.rootElement.querySelector(`#${field.isChildOf}-row`);

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

        const promise = fillRefSelect(field.elementId, field).catch(console.error);
        
        refPromises.push(promise);
      }    

      this.inputs[key] = input;
    }
    let resPromises =  Promise.all(refPromises);
    return resPromises
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
          option.parentElement.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          console.log(option)
        }

      } else if (field.type == DATA_TYPES.FLOAT){

        this.inputs[key].value = data.fields[key];
      } else if (field.type == DATA_TYPES.COLLECTION){
        console.log("Render Collection")
        console.log(field)
        console.log(key)
        console.log(data.fields[key])
        for (const e in data.fields[key]){
          console.log(e)
          const div = document.createElement('div');
          div.class = field.elementId;
          this.inputs[key].appendChild(div)
        }

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
      // this.view.render(this.model.getData());
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
  if (!refData || !refData.id || !refData.id.length) {
    return [];
  }

  const displayField = fieldConfig.refConfig["displayField"];
  const valueField = fieldConfig.refConfig["valueField"] ?? 'id';
  const iconField = fieldConfig.refConfig["iconField"] ?? null;
  const color = fieldConfig.refConfig["color"] ?? null;

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

    return option;
  });
}

/**
 * Remplit un champ SELECT avec les options de référence.
 * @param {string} elementId - ID de l'élément SELECT.
 * @param {FormFieldConfig} fieldConfig - Configuration du champ.
 */
async function fillRefSelect(elementId, fieldConfig) {

  const selectElement = document.getElementById(`${elementId}-input`);
  if (!selectElement) return;

  const refData = await fetchRefData(fieldConfig.refConfig.table);
  const options = formatRefOptions(refData, fieldConfig);

  const colorMapping={}

  while (selectElement.options.length > 1) {
    selectElement.remove(1);
  }

  // Ajoute les options formatées
  options.forEach(option => {
    const optionElement = document.createElement('option');
    let colorOption = false
    optionElement.id = elementId + "_" + option.value;
    optionElement.value = option.value;
    optionElement.textContent = option.label;

    if (Object.hasOwn(option,'color')){

      colorMapping[option.value] = option.color
      colorOption = true 
    } 

    selectElement.appendChild(optionElement);

    if (colorOption) {

      const colorChanger = generateColorChanger(colorMapping)
      selectElement.addEventListener('change', (e) => {

        colorChanger(e.currentTarget)
      });
    }
    
  });

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

  try {
    const data = await grist.docApi.fetchTable(currentTableId);
      allRecords = data;
    if (allRecords['id'].length > 0) {

      currentRecordIndex = 0;

      return allRecords;
      
    } else {
      console.warn("Aucun enregistrement trouvé dans la table.");
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des enregistrements :", error);
  }
}

async function getRowsByIds(tableId, ids) {
  const { token, baseUrl } = await grist.docApi.getAccessToken({ readOnly: true });
  const placeholders = ids.map(() => '?').join(',');

  const resp = await fetch(`${baseUrl}/sql?auth=${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sql: `SELECT * FROM "${tableId}" WHERE id IN (${placeholders})`,
      args: ids,
    }),
  });
  if (!resp.ok) throw new Error(`Erreur SQL ${resp.status}`);
  const { records } = await resp.json();
  return records.map(r => r.fields);
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

  grist.viewApi.setSelectedRows(index)
  let selectedRecord = await grist.viewApi.fetchSelectedRecord(index)

  const mappedRecord = grist.mapColumnNames(selectedRecord);


  // Prépare les données pour le modèle
  const recordData = { id: selectedRecord.id };
  for (const [key, gristColumn] of Object.entries(appSideMapping)) {
    recordData[key] = mappedRecord[gristColumn] !== undefined
      ? mappedRecord[gristColumn]
      : defaultValues[key];
  }

  const promise = model.updateFromGrist(recordData);
  Promise.all([promise])
  controller.render();  
}

/**
 * Configure les écouteurs d'événements pour les boutons de navigation.
 */
async function setupNavigationListeners(currentTableId) {

  document.getElementById('prev-btn').addEventListener('click', () => {
    loadRecord(controller.handleNext(-1));
  });

  document.getElementById('next-btn').addEventListener('click', () => {
    loadRecord(controller.handleNext(+1));
  });
}

// Initialisation de Grist
grist.ready({
  columns: gristColumns,
  requiredAccess: 'full',
})

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

  const promise = model.updateFromGrist(recordData);
  Promise.all([promise]).then(() => {
    controller.render();
  });
});