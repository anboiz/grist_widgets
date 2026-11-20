/**
 * @file Service de rendu des champs de formulaire.
 * @description Ce module gère la création des éléments HTML pour chaque type de champ.
 */

import { DATA_TYPES } from '../models/FormFieldConfig.js';
import { FieldStyleManager } from './FieldStyleManager.js';

// --- Classe principale FieldCreator ---
/**
 * Service pour générer les champs du formulaire en utilisant le pattern Strategy.
 */
export class FieldCreator {
  /**
   * Factory pour les stratégies de création de champs.
   * @type {FieldStrategyFactory}
   */
  #strategyFactory;

  /**
   * Constructeur du FieldCreator.
   * @param {FieldStyleManager} [styleManager] - Gestionnaire des styles (optionnel).
   */
  constructor(styleManager = new FieldStyleManager()) {
    this.#strategyFactory = new FieldStrategyFactory(styleManager);
  }

  /**
   * Crée un élément DOM pour un champ de formulaire.
   * @param {HTMLDivElement} parentElement - Élément parent où le champ sera inséré.
   * @param {import('../models/FormFieldConfig.js').FormFieldConfig} fieldConfig - Configuration du champ.
   * @returns {HTMLElement} Élément DOM du champ.
   * @throws {Error} Si le type de champ n'est pas géré.
   */
  createInput(parentElement, fieldConfig) {
    const { type, name, elementId } = fieldConfig;
    const strategy = this.#strategyFactory.getStrategy(type);
    return strategy.create(parentElement, name, elementId);
  }
}

/**
 * Factory pour créer les stratégies de création de champs.
 */
export class FieldStrategyFactory {
  /**
   * @param {FieldStyleManager} styleManager - Gestionnaire des styles.
   */
  constructor(styleManager) {
    this.strategies = {
      [DATA_TYPES.STR]: new TextInputStrategy(styleManager),
      [DATA_TYPES.LGSTR]: new TextAreaStrategy(styleManager),
      [DATA_TYPES.FLOAT]: new NumberInputStrategy(styleManager),
      [DATA_TYPES.BOOL]: new CheckboxStrategy(styleManager),
      [DATA_TYPES.REF]: new SelectStrategy(styleManager),
      [DATA_TYPES.ROW]: new RowContainerStrategy(styleManager),
      [DATA_TYPES.COLLECTION]: new CollectionContainerStrategy(styleManager),
    };
  }

  /**
   * Récupère la stratégie pour un type de champ donné.
   * @param {string} type - Type de champ.
   * @returns {BaseFieldStrategy} Stratégie correspondante.
   * @throws {Error} Si le type de champ n'est pas géré.
   */
  getStrategy(type) {
    const strategy = this.strategies[type];
    if (!strategy) {
      throw new Error(`Aucune stratégie trouvée pour le type de champ: ${type}`);
    }
    return strategy;
  }
}

// /**
//  * Service pour générer les champs du formulaire.
//  */
// export class FieldCreator {

//   /**
//    * Ajoute des classes CSS spécifiques en fonction du type de champ.
//    * @param {string} type - Type de champ (DATA_TYPES).
//    * @returns {string[]} Liste des classes CSS à ajouter.
//    */
//   adjustFormStyle(type) {
//     if (type === DATA_TYPES.BOOL) {
//       return ['form-check', 'form-switch'];
//     }
//     return [];
//   }

//   /**
//    * Crée un élément DOM pour un champ de formulaire.
//    * @param {import('../models/FormFieldConfig.js').FormFieldConfig} field - Configuration du champ.
//    * @returns {HTMLElement} Élément DOM du champ.
//    */
//   createInput(div, field) {
//     console.log(field)
//     const { type, name, elementId } = field;
//     let element;

//     switch (type) {
//       case DATA_TYPES.STR:
//         element = this.createTextInput(div, name, elementId);
//         break;
//       case DATA_TYPES.LGSTR:
//         element = this.createTextArea(div, name, elementId);
//         break;
//       case DATA_TYPES.FLOAT:
//         element = this.createNumberInput(div, name, elementId);
//         break;
//       case DATA_TYPES.BOOL:
//         element = this.createCheckbox(div, name, elementId);
//         break;
//       case DATA_TYPES.REF:
//         element = this.createSelect(div, name, elementId);
//         break;
//       case DATA_TYPES.ROW:
//         element = this.createRowContainer(div, elementId);
//         break;
//       case DATA_TYPES.COLLECTION:
//         element = this.createCollectionContainer(div, name, elementId);
//         break;
//       default:
//         element = document.createElement('div');
//         console.warn(`Type de champ non géré: ${type}`);
//     }

//     console.log(element)

//     return element;
//   }

//   /**
//    * Crée un input de type texte.
//    * @param {HTMLDivElement} div - Div parent.
//    * @param {string} name - Nom du champ.
//    * @param {string} elementId - ID de l'élément.
//    * @returns {HTMLInputElement} Input de type texte.
//    */
//   createTextInput(div, name, elementId) {
//     const label = this.createLabel(name, elementId);
//     const input = document.createElement('input');
//     input.type = 'text';
//     input.classList.add('form-control');
//     input.id = `${elementId}-input`;

//     div.appendChild(label);
//     div.appendChild(input);
//     return div;
//   }

//   /**
//    * Crée un textarea.
//    * @param {HTMLDivElement} div - Div parent.
//    * @param {string} name - Nom du champ.
//    * @param {string} elementId - ID de l'élément.
//    * @returns {HTMLTextAreaElement} Textarea.
//    */
//   createTextArea(div, name, elementId) {
//     const label = this.createLabel(name, elementId);
//     const textarea = document.createElement('textarea');
//     textarea.rows = 4;
//     textarea.classList.add('form-control');
//     textarea.id = `${elementId}-input`;

//     div.appendChild(label);
//     div.appendChild(textarea);
//     return div;
//   }

//   /**
//    * Crée un input de type number.
//    * @param {HTMLDivElement} div - Div parent.
//    * @param {string} name - Nom du champ.
//    * @param {string} elementId - ID de l'élément.
//    * @returns {HTMLInputElement} Input de type number.
//    */
//   createNumberInput(div, name, elementId) {
//     const label = this.createLabel(name, elementId);
//     const input = document.createElement('input');
//     input.type = 'number';
//     input.classList.add('form-control');
//     input.id = `${elementId}-input`;

//     div.appendChild(label);
//     div.appendChild(input);
//     return div;
//   }

//   /**
//    * Crée une checkbox.
//    * @param {HTMLDivElement} div - Div parent.
//    * @param {string} name - Nom du champ.
//    * @param {string} elementId - ID de l'élément.
//    * @returns {HTMLDivElement} Conteneur avec label et checkbox.
//    */
//   createCheckbox(div, name, elementId) {
//     div.classList.add(...this.adjustFormStyle(DATA_TYPES.BOOL));

//     const label = document.createElement('label');
//     label.classList.add('form-label');
//     label.innerHTML = `<strong>${name}</strong>`;

//     const input = document.createElement('input');
//     input.type = 'checkbox';
//     input.classList.add('form-check-input');
//     input.id = `${elementId}-input`;

//     container.appendChild(label);
//     container.appendChild(input);
//     return container;
//   }

//   /**
//    * Crée un SELECT pour les champs de référence.
//    * @param {HTMLDivElement} div - Div parent.
//    * @param {string} name - Nom du champ.
//    * @param {string} elementId - ID de l'élément.
//    * @returns {HTMLSelectElement} SELECT avec option par défaut.
//    */
//   createSelect(div, name, elementId) {
//     const label = this.createLabel(name, elementId);
//     const select = document.createElement('select');
//     select.classList.add('form-select');
//     select.id = `${elementId}-input`;

//     const defaultOption = document.createElement('option');
//     defaultOption.value = '';
//     defaultOption.selected = true;
//     defaultOption.textContent = `Sélectionnez un ${name.toLowerCase()}`;
//     select.appendChild(defaultOption);

//     div.appendChild(label);
//     div.appendChild(select);
//     return div;
//   }

//   /**
//    * Crée un conteneur pour un champ de type ROW.
//    * @param {HTMLDivElement} div - Div parent.
//    * @param {string} elementId - ID de l'élément.
//    * @returns {HTMLDivElement} Conteneur ROW.
//    */
//   createRowContainer(div, elementId) {
//     div.classList.add('row');
//     div.id = `${elementId}-row`;
//     return div;
//   }

//   /**
//    * Crée un conteneur pour un champ de type COLLECTION.
//    * @param {HTMLDivElement} div - Div parent.
//    * @param {string} name - Nom du champ.
//    * @param {string} elementId - ID de l'élément.
//    * @returns {HTMLDivElement} Conteneur avec titre et espace pour les éléments.
//    */
//   createCollectionContainer(div, name, elementId) {
//     const title = document.createElement('h4');
//     title.innerHTML = `<strong>${name}</strong>`;

//     const container = document.createElement('div');
//     container.id = `${elementId}-input`;

//     div.appendChild(title);
//     div.appendChild(container);
//     return div;
//   }

//   /**
//    * Crée un label pour un champ.
//    * @param {HTMLDivElement} div - Div parent.
//    * @param {string} name - Nom du champ.
//    * @param {string} elementId - ID de l'élément.
//    * @returns {HTMLLabelElement} Label.
//    */
//   createLabel(name, elementId) {
//     const label = document.createElement('label');
//     label.classList.add('form-label');
//     label.innerHTML = `<strong>${name}</strong>`;
//     label.htmlFor = `${elementId}-input`;
//     return label;
//   }
// }

/**
 * Stratégie de base pour la création des champs.
 * @abstract
 */
class BaseFieldStrategy {
  /**
   * Gestionnaire des styles pour les champs.
   * @type {FieldStyleManager}
   */
  #styleManager;

  /**
   * Constructeur de la stratégie de base.
   * @param {FieldStyleManager} styleManager - Gestionnaire des styles.
   */
  constructor(styleManager) {
    this.#styleManager = styleManager;
  }

  /**
   * Méthode abstraite pour créer un champ.
   * @param {HTMLDivElement} parentElement - Élément parent.
   * @param {string} name - Nom du champ.
   * @param {string} elementId - ID de l'élément.
   * @returns {HTMLElement} Élément DOM du champ.
   * @abstract
   */
  create(parentElement, name, elementId) {
    throw new Error('La méthode "create" doit être implémentée par les classes filles.');
  }

  /**
   * Crée un label pour un champ.
   * @param {string} name - Nom du champ.
   * @param {string} elementId - ID de l'élément.
   * @returns {HTMLLabelElement} Label configuré.
   * @protected
   */
  _createLabel(name, elementId) {
    const label = document.createElement('label');
    label.classList.add('form-label');
    label.innerHTML = `<strong>${name}</strong>`;
    label.htmlFor = `${elementId}-input`;
    return label;
  }

  /**
   * Crée un input de base (texte, number, etc.).
   * @param {string} type - Type de l'input (ex: 'text', 'number').
   * @param {string} elementId - ID de l'élément.
   * @returns {HTMLInputElement} Input configuré.
   * @protected
   */
  _createBaseInput(type, elementId) {
    const input = document.createElement('input');
    input.type = type;
    input.classList.add('form-control');
    input.id = `${elementId}-input`;
    return input;
  }

  /**
   * Applique les styles spécifiques à un type de champ sur un élément parent.
   * @param {HTMLDivElement} parentElement - Élément parent.
   * @param {string} type - Type de champ (ex: DATA_TYPES.BOOL).
   * @protected
   */
  _applyStyles(parentElement, type) {
    const classes = this.#styleManager.getClassesForType(type);
    if (classes.length > 0) {
      parentElement.classList.add(...classes);
    }
  }
}

class TextInputStrategy extends BaseFieldStrategy {
  /**
   * Crée un input de type texte.
   * @param {HTMLDivElement} parentElement - Élément parent.
   * @param {string} name - Nom du champ.
   * @param {string} elementId - ID de l'élément.
   * @returns {HTMLDivElement} Conteneur avec label et input.
   */
  create(parentElement, name, elementId) {
    const label = this._createLabel(name, elementId);
    const input = this._createBaseInput('text', elementId);
    parentElement.appendChild(label);
    parentElement.appendChild(input);
    return parentElement;
  }
}

class CheckboxStrategy extends BaseFieldStrategy {
  /**
   * Crée une checkbox.
   * @param {HTMLDivElement} parentElement - Élément parent.
   * @param {string} name - Nom du champ.
   * @param {string} elementId - ID de l'élément.
   * @returns {HTMLDivElement} Conteneur avec label et checkbox.
   */
  create(parentElement, name, elementId) {
    this._applyStyles(parentElement, DATA_TYPES.BOOL);

    const label = this._createLabel(name, elementId);
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.classList.add('form-check-input');
    input.id = `${elementId}-input`;

    parentElement.appendChild(label);
    parentElement.appendChild(input);
    return parentElement;
  }
}
class SelectStrategy extends BaseFieldStrategy {
  /**
   * Crée un SELECT pour les champs de référence.
   * @param {HTMLDivElement} parentElement - Élément parent.
   * @param {string} name - Nom du champ.
   * @param {string} elementId - ID de l'élément.
   * @returns {HTMLDivElement} Conteneur avec label et SELECT.
   */
  create(parentElement, name, elementId) {
    const label = this._createLabel(name, elementId);
    const select = document.createElement('select');
    select.classList.add('form-select');
    select.id = `${elementId}-input`;

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.selected = true;
    defaultOption.textContent = `Sélectionnez un ${name.toLowerCase()}`;
    select.appendChild(defaultOption);

    parentElement.appendChild(label);
    parentElement.appendChild(select);
    return parentElement;
  }
}
class RowContainerStrategy extends BaseFieldStrategy {
  /**
   * Crée un conteneur pour un champ de type ROW.
   * @param {HTMLDivElement} parentElement - Élément parent.
   * @param {string} _name - Non utilisé ici (présent pour respecter l'interface).
   * @param {string} elementId - ID de l'élément.
   * @returns {HTMLDivElement} Conteneur ROW.
   */
  create(parentElement, _name, elementId) {
    parentElement.classList.add('row');
    parentElement.id = `${elementId}-row`;
    return parentElement;
  }
}