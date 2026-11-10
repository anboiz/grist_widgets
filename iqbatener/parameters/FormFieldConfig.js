/**
 * @file Custom Grist Widget pour la mise à jour d'un enregistrement.
 * @description Ce widget permet de modifier les données d'un enregistrement Grist via un formulaire.
 */

/**
 * Types de données supportés par le widget.
 * @readonly
 * @enum {string}
 */
export const DATA_TYPES = {
  INT: 'int',
  STR: 'str',
  LGSTR: 'lgstr',
  BOOL: 'bool',
  FLOAT: 'float',
  REF: 'ref',
  ROW: 'row',
  COLLECTION: 'collection'
};

/**
 * @typedef {Object} RefConfig
 * @property {string} table - Nom de la table de référence dans Grist.
 * @property {string} displayField - Champ à afficher dans les options du SELECT.
 * @property {string} [valueField='id'] - Champ utilisé comme valeur.
 * @property {string} [iconField] - Champ optionnel pour une icône.
 * @property {string} [color] - Champ optionnel pour la couleur de fond.
 */

/**
 * @typedef {Object} FormFieldConfig
 * @property {DATA_TYPES} type - Type du champ.
 * @property {string} link - Nom de la colonne dans Grist.
 * @property {string} [name] - Nom affiché dans l'interface.
 * @property {string} [elementId] - ID de l'élément de saisie.
 * @property {*} [default] - Valeur par défaut.
 * @property {boolean} [hidden=false] - Si vrai, le champ est masqué.
 * @property {string} [isChildOf] - ID du parent si le champ est imbriqué.
 * @property {string} [format] - Classe CSS pour le conteneur.
 * @property {RefConfig} [refConfig] - Configuration pour les champs REF.
 * @property {Object.<string, FormFieldConfig>} [infos] - Configuration pour les COLLECTION.
 */

/**
 * Configuration des champs du formulaire.
 * @type {Object.<string, FormFieldConfig>}
 */
export const formFields = {
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
      color: 'couleur',
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
  observations: {
    type: DATA_TYPES.COLLECTION,
    link: 'OBSERVATION_liaison',
    name: 'Observation sur les constituants du bâtiment',
    elementId: 'objectauto-observations',
    refConfig: {
      table: 'OBSERVATION',
      group_by: 'gristHelper_Display',
      infos:{
        cle_technique:{
          type: DATA_TYPES.STR,
          name: 'Clé technique',
          elementId: 'objectauto-cle_technique',          
        },
        liaison_valeur:{
          type: DATA_TYPES.FLOAT,
          name: 'Commentaire pour identifier le bâtiment',
          elementId: 'objectauto-liaison_valeur',          
        },        
      }
    },
  }
};

/**
 * Utilitaires pour la configuration des champs.
 */
export class FormFieldUtils {
  /**
   * Extrait les noms des colonnes Grist à partir de la configuration.
   * @returns {string[]} Liste des noms de colonnes (sans 'id').
   */
  static getGristColumns() {
    return Object.values(formFields)
      .map((field) => field.link)
      .filter((link) => link !== undefined && link !== 'id');
  }

  /**
   * Génère un dictionnaire des valeurs par défaut pour tous les champs.
   * @returns {Object.<string, *>} Dictionnaire { cléDuChamp: valeurParDéfaut }.
   */
  static getDefaultValues() {
    return Object.entries(formFields).reduce((acc, [key, field]) => {
      acc[key] = field.default !== undefined ? field.default : '';
      return acc;
    }, {});
  }

  /**
   * Crée un mappage entre les clés du formulaire et les colonnes Grist.
   * @returns {Object.<string, string>} Mappage { cléDuChamp: colonneGrist }.
   */
  static getAppSideMapping() {
    return Object.entries(formFields).reduce((acc, [key, field]) => {
      if (field.link && field.link !== 'id') {
        acc[key] = field.link;
      }
      return acc;
    }, {});
  }
}

// Initialisation des constantes globales (si nécessaire)
export const defaultValues = FormFieldUtils.getDefaultValues();
export const appSideMapping = FormFieldUtils.getAppSideMapping();
export const gristColumns = FormFieldUtils.getGristColumns();