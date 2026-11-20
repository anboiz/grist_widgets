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

class TextAreaStrategy extends BaseFieldStrategy {
  /**
   * Crée un input de type texte.
   * @param {HTMLDivElement} parentElement - Élément parent.
   * @param {string} name - Nom du champ.
   * @param {string} elementId - ID de l'élément.
   * @returns {HTMLDivElement} Conteneur avec label et input.
   */
  create(parentElement, name, elementId) {
    const label = this._createLabel(name, elementId);
    const input = document.createElement('textarea')

    input.classList.add('form-control');
    input.id = `${elementId}-input`;
    input.rows = 4;
    
    parentElement.appendChild(label);
    parentElement.appendChild(input);
    return parentElement;
  }
}

class NumberInputStrategy extends BaseFieldStrategy {
  /**
   * Crée un input de type texte.
   * @param {HTMLDivElement} parentElement - Élément parent.
   * @param {string} name - Nom du champ.
   * @param {string} elementId - ID de l'élément.
   * @returns {HTMLDivElement} Conteneur avec label et input.
   */
  create(parentElement, name, elementId) {
    const label = this._createLabel(name, elementId);
    const input = this._createBaseInput('input', elementId);
    input.type = 'number';
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
    const input = this._createBaseInput('input', elementId);
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
    // const select = document.createElement('select');
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
class CollectionContainerStrategy extends BaseFieldStrategy {
  /**
   * Crée un conteneur pour un champ de type ROW.
   * @param {HTMLDivElement} parentElement - Élément parent.
   * @param {string} _name - Non utilisé ici (présent pour respecter l'interface).
   * @param {string} elementId - ID de l'élément.
   * @returns {HTMLDivElement} Conteneur ROW.
   */
  create(parentElement, name, elementId) {
    const label = this._createLabel(name, elementId);
    const input = this._createBaseInput('input', elementId);

    input.classList.add('row');
    input.id = `${elementId}-input`;

    parentElement.appendChild(label);
    parentElement.appendChild(input);

    return parentElement;
  }
}