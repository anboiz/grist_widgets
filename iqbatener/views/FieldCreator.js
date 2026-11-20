/**
 * @file Service de rendu des champs de formulaire.
 * @description Ce module gère la création des éléments HTML pour chaque type de champ.
 */

import { DATA_TYPES } from '../models/FormFieldConfig.js';
import { FieldStyleManager} from './FieldStyleManager.js';

// --- Classe principale FieldCreator ---
/**
 * Service pour générer les champs du formulaire en utilisant le pattern Strategy.
 */
export class FieldCreator {
  #strategyFactory;
  styleManager;

  constructor(styleManager = new FieldStyleManager()) {
    this.styleManager = styleManager;
    this.#strategyFactory = new FieldStrategyFactory(styleManager);
  }

  /**
   * Crée un élément DOM pour un champ de formulaire.
   * @param {HTMLDivElement} parentElement - Élément parent où le champ sera inséré.
   * @param {import('../models/FormFieldConfig.js').FormFieldConfig} formFieldConfig - Configuration du champ.
   * @returns {HTMLElement} Élément DOM du champ.
   * @throws {Error} Si le type de champ n'est pas géré.
   */
  createInput(parentElement, formFieldConfig) {
    const type= formFieldConfig.type;
    const strategy = this.#strategyFactory.getStrategy(type);
    return strategy.create(parentElement, formFieldConfig);
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
   * @param {import('../models/FormFieldConfig.js').FormFieldConfig}
   * @returns {HTMLElement} Élément DOM du champ.
   * @abstract
   */
  create(parentElement, FormFieldConfig) {
    throw new Error('La méthode "create" doit être implémentée par les classes filles.');
  }

  /**
   * Crée un label pour un champ.
   * @param {@param {import('../models/FormFieldConfig.js').FormFieldConfig}} formFieldConfig - Configuration du champ.
   * @returns {HTMLLabelElement} Label configuré.
   * @protected
   */
  _createLabel(formFieldConfig) {
    const { name, elementId, link } = formFieldConfig;
    const label = document.createElement('label');
    label.classList.add('form-label');
    label.innerHTML = `<strong>${name || link}</strong>`; // Utilise `name` ou `link` comme fallback
    label.htmlFor = `${elementId}-input`;
    return label;
  }
  /**
   * Crée un input de base (texte, number, etc.).
   * @param {string} type - Type de l'input, balise HTML (ex: 'text', 'number').
   * @param {@param {import('../models/FormFieldConfig.js').FormFieldConfig}} formFieldConfig - Configuration du champ.
   * @returns {HTMLInputElement} Input configuré.
   * @protected
   */
  _createBaseInput(type, formFieldConfig) {
    const { elementId, default: defaultValue } = formFieldConfig;
    const input = document.createElement('input');
    input.type = type;
    input.classList.add('form-control');
    input.id = `${elementId}-input`;
    if (defaultValue !== undefined) {
      input.value = defaultValue;
    }
    return input;
  }

  /**
   * Applique les styles spécifiques à un type de champ sur un élément parent.
   * @param {HTMLDivElement} parentElement - Élément parent.
   * @param {@param {import('../models/FormFieldConfig.js').FormFieldConfig}} formFieldConfig - Configuration du champ.
   * @protected
   */
  _applyStyles(parentElement, formFieldConfig) {
    const { type, format } = formFieldConfig;
    // Appliquer les styles par défaut pour le type
    const typeClasses = this.#styleManager.getClassesForType(type);
    if (typeClasses.length > 0) {
      parentElement.classList.add(...typeClasses);
    }
    // Appliquer les classes CSS personnalisées (si `format` est défini)
    if (format) {
      parentElement.classList.add(...format.split(' '));
    }
  }
  
  /**
   * Vérifie si le champ doit être masqué.
   * @param {@param {import('../models/FormFieldConfig.js').FormFieldConfig}} formFieldConfig - Configuration du champ.
   * @returns {boolean} True si le champ est masqué.
   * @protected
   */
  _isHidden(formFieldConfig) {
    return formFieldConfig.hidden === true;
  }
}

/**
 * Stratégie pour créer un input de type texte.
 */
export class TextInputStrategy extends BaseFieldStrategy {
  /**
   * Crée un input de type texte.
   * @param {HTMLDivElement} parentElement - Élément parent.
   * @param {@param {import('../models/FormFieldConfig.js').FormFieldConfig}} formFieldConfig - Configuration du champ.
   * @returns {HTMLDivElement} Conteneur avec label et input.
   */
  create(parentElement, formFieldConfig) {
    if (this._isHidden(formFieldConfig)) {
      return parentElement; // Retourne le parent vide si masqué
    }

    const label = this._createLabel(formFieldConfig);
    const input = this._createBaseInput('text', formFieldConfig);

    parentElement.appendChild(label);
    parentElement.appendChild(input);
    return parentElement;
  }
}

class TextAreaStrategy extends BaseFieldStrategy {
  /**
   * Crée un input de type texte.
   * @param {HTMLDivElement} parentElement - Élément parent.
   * @param {@param {import('../models/FormFieldConfig.js').FormFieldConfig}} formFieldConfig - Configuration du champ.
   * @returns {HTMLDivElement} Conteneur avec label et input.
   */
  create(parentElement, formFieldConfig) {
    const label = this._createLabel(formFieldConfig);
    const input = document.createElement('textarea')

    input.classList.add('form-control');
    input.id = `${formFieldConfig.elementId}-input`;
    input.rows = 4;

    parentElement.appendChild(label);
    parentElement.appendChild(input);
    return parentElement;
  }
}

class NumberInputStrategy extends BaseFieldStrategy {
  /**
   * Crée un SELECT pour les champs de référence.
   * @param {HTMLDivElement} parentElement - Élément parent.
   * @param {@param {import('../models/FormFieldConfig.js').FormFieldConfig}} formFieldConfig - Configuration du champ.
   * @returns {HTMLDivElement} Conteneur avec label et SELECT.
   */
  create(parentElement, formFieldConfig) {
    const label = this._createLabel(formFieldConfig);
    const input = this._createBaseInput('input', formFieldConfig);
    input.type = 'number';
    parentElement.appendChild(label);
    parentElement.appendChild(input);
    return parentElement;
  }
}

class CheckboxStrategy extends BaseFieldStrategy {
  /**
   * Crée un SELECT pour les champs de référence.
   * @param {HTMLDivElement} parentElement - Élément parent.
   * @param {@param {import('../models/FormFieldConfig.js').FormFieldConfig}} formFieldConfig - Configuration du champ.
   * @returns {HTMLDivElement} Conteneur avec label et SELECT.
   */
  create(parentElement, formFieldConfig) {
    this._applyStyles(parentElement, DATA_TYPES.BOOL);

    const label = this._createLabel(formFieldConfig);
    const input = this._createBaseInput('input', formFieldConfig);
    input.type = 'checkbox';
    input.classList.add('form-check-input');
    input.id = `${formFieldConfig.elementId}-input`;

    parentElement.appendChild(label);
    parentElement.appendChild(input);
    return parentElement;
  }
}
class SelectStrategy extends BaseFieldStrategy {
  /**
   * Crée un SELECT pour les champs de référence.
   * @param {HTMLDivElement} parentElement - Élément parent.
   * @param {@param {import('../models/FormFieldConfig.js').FormFieldConfig}} formFieldConfig - Configuration du champ.
   * @returns {HTMLDivElement} Conteneur avec label et SELECT.
   */
  create(parentElement, formFieldConfig) {
    if (this._isHidden(formFieldConfig)) {
      return parentElement;
    }    
    const { refConfig, elementId, name, link } = formFieldConfig;
    const label = this._createLabel(formFieldConfig);

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
  /**
   * Crée un SELECT pour les champs de référence.
   * @param {HTMLDivElement} parentElement - Élément parent.
   * @param {@param {import('../models/FormFieldConfig.js').FormFieldConfig}} formFieldConfig - Configuration du champ.
   * @returns {HTMLDivElement} Conteneur ROW.
   */
  create(parentElement, formFieldConfig) {
    parentElement.classList.add('row');
    parentElement.id = `${formFieldConfig.elementId}-row`;
    return parentElement;
  }
}
class CollectionContainerStrategy extends BaseFieldStrategy {
  /**
   * Crée un conteneur pour un champ de type ROW.
   * @param {HTMLDivElement} parentElement - Élément parent.
   * @param {@param {import('../models/FormFieldConfig.js').FormFieldConfig}} formFieldConfig - Configuration du champ.
   * @returns {HTMLDivElement} Conteneur ROW.
   */
  create(parentElement, formFieldConfig) {
    console.log(`Create collection`)
    console.log({formFieldConfig:formFieldConfig})
    if (this._isHidden(formFieldConfig)) {
      return parentElement;
    }


    const { name, link, elementId, infos } = formFieldConfig;
    const label = this._createLabel(formFieldConfig);
    const container = document.createElement('div')

    console.log({ name, link, elementId, infos })

    console.log({container:container})

    // 2. Créer le conteneur des cartes
    const cardsContainer = document.createElement('div');
    cardsContainer.id = `${elementId}-cards-container`;
    cardsContainer.classList.add('collection-cards-container', 'd-flex', 'flex-wrap', 'gap-3');
    container.appendChild(cardsContainer);

    console.log({cardsContainer:cardsContainer})

    // 3. Créer une carte vierge type (template) en utilisant les `infos`
    const templateCard = this.#createEmptyCard(elementId, infos);
    templateCard.id = `${elementId}-template-card`;
    // templateCard.style.display = 'none';
    cardsContainer.appendChild(templateCard);
    console.log({templateCard:templateCard})

    parentElement.appendChild(label);
    parentElement.appendChild(container);

    return parentElement;
  }
    /**
   * Crée une carte vierge type (sans données) en utilisant les `infos` pour les champs.
   * @param {string} elementId - ID de base pour la carte.
   * @param {Object.<string, FormFieldConfig>} infos - Configuration des champs de la carte.
   * @returns {HTMLDivElement} Carte vierge.
   * @private
   */
  #createEmptyCard(elementId, infos) {
    const card = document.createElement('div');
    card.classList.add('card', 'collection-card', 'p-3', 'mb-2', 'shadow-sm');

    // Ajouter un titre par défaut
    const cardTitle = document.createElement('h5');
    cardTitle.classList.add('card-title');
    cardTitle.textContent = 'Nouvelle carte';
    card.appendChild(cardTitle);

    // Ajouter un conteneur pour les champs de la carte
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    cardBody.id = `${elementId}-card-body`;

    // Créer les champs de la carte en utilisant `infos`
    if (infos) {
      Object.entries(infos).forEach(([fieldName, fieldConfig]) => {
        // Créer un conteneur pour chaque champ
        const fieldContainer = document.createElement('div');
        fieldContainer.classList.add('mb-2');

        // Utiliser FieldCreator pour créer le champ (délégation)
        const fieldCreator = new FieldCreator(this.styleManager);
        fieldCreator.createInput(fieldContainer, fieldConfig);

        cardBody.appendChild(fieldContainer);
      });
    }

    card.appendChild(cardBody);

    // Ajouter un bouton de suppression
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.classList.add('btn', 'btn-danger', 'btn-sm', 'float-end');
    deleteButton.innerHTML = '<i class="bi bi-trash"></i> Supprimer';
    card.appendChild(deleteButton);

    return card;
  }
}