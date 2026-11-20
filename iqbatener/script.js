import { DATA_TYPES, formFields, defaultValues, appSideMapping, gristColumns } from './models/FormFieldConfig.js';
import {FieldCreator} from './views/FieldCreator.js'
import {FormCreator} from './views/FormCreator.js'
import { GristUtils } from './gristUtils/gristUtils.js';







// ========== MODÈLE ==========
class ObjectModel {
  /**
   * Modèle de données pour le widget.
   */
  constructor(gristUtils) {
    this.data = defaultValues;
    this.mapping = {};
    this.gristConnector = gristUtils;
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
      // console.log(gristData);
      const promises = [];
      for (const [key, value] of Object.entries(formFields)){
        // console.log(key)
        // console.log(value)
        if(value.type === DATA_TYPES.COLLECTION) {
          // console.log(value.refConfig)
          // console.log(gristData[this.data ])
          const promise = gristUtils.getRowsByIds(value.refConfig.table, gristData[key])
            .then(result => {
              // console.log(result);
              this.data[key] = result;
            });
          promises.push(promise);
        }

      }
    // Attendre que toutes les promesses soient résolues
    await Promise.all(promises);

    // console.log(this.data)
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
   * @param {FieldCreator} fieldCreator - service de génération de champs.
   */
  constructor(formCreator,formFields) {
    this.rootElement = document.getElementById('object-form');
    this.formFields = formFields
    this.formCreator = formCreator
    this.formCreator.setDocument(document)
    this.formCreator.setRootElement(this.rootElement)
    this.saveButton = document.getElementById('save-button');
    
    // initRefFields().catch(console.error); // Initialisation des champs de référence
  }

  async generateForm() {
    this.inputs = await this.formCreator.createForm(this.formFields)
    console.log(this.inputs)
  }



  /**
   * Affiche les données dans le formulaire.
   * @param {Object} data - Données à afficher.
   */
  render(data) {
    console.log('Render')
    console.log({data})
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
          // console.log(option)
        }

      } else if (field.type == DATA_TYPES.FLOAT){

        this.inputs[key].value = data.fields[key];
      } else if (field.type == DATA_TYPES.COLLECTION){
        console.log("Render Collection")
        // console.log(field)
        // console.log(key)
        // console.log(data.fields[key])
        const collectionId = fieldConfig.elementId;
        const templateCard = form.querySelector(`#${collectionId}-template-card`);
        const cardsContainer = form.querySelector(`#${collectionId}-cards-container`);
        console.log({cardsContainer:cardsContainer})
        console.log({field:field})
        console.log({data:data})

        if (!templateCard || !cardsContainer) return;

        // 2. Vider le conteneur des cartes
        cardsContainer.innerHTML = '';

        // 3. Récupérer les données de la collection depuis formData
        const collectionData = formData[field.link] || [];


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
    // Attention recrée une deuxiéme fois le formulaire TODO ne faire le formulaire qu'une seule fois
    view.generateForm().then(() => {
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
    return this.model.data.id+offset
  }
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



// ========== INITIALISATION ==========
let currentTableId = 'INFOENERGIE'; // À adapter selon votre configuration
const gristUtils = new GristUtils(currentTableId)

const fieldCreator = new FieldCreator();
const formCreator = new FormCreator(gristUtils,fieldCreator);
const model = new ObjectModel(gristUtils);
const view = new ObjectView(formCreator,formFields);
const controller = new ObjectController(model, view);

// Variables globales pour la navigation
let currentRecordIndex = 0;


/**
 * Configure les écouteurs d'événements pour les boutons de navigation.
 */
async function setupNavigationListeners(currentTableId) {

  document.getElementById('prev-btn').addEventListener('click', () => {
    gristUtils.loadRecord(controller.handleNext(-1));
  });

  document.getElementById('next-btn').addEventListener('click', () => {
    gristUtils.loadRecord(controller.handleNext(+1));
  });
}

// Initialisation de Grist
grist.ready({
  columns: gristColumns,
  requiredAccess: 'full',
})

let allRecords = gristUtils.fetchAllRecords(currentTableId);
console.log({allRecords: allRecords})
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