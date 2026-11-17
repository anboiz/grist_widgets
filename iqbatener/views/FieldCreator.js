/**
 * @file Service de rendu des champs de formulaire.
 * @description Ce module gère la création des éléments HTML pour chaque type de champ.
 */

import { DATA_TYPES } from '../models/FormFieldConfig.js';

/**
 * Service pour générer les champs du formulaire.
 */
export class FieldCreator {
  // /**
  //  * @param {Object.<string, import('../models/FormFieldConfig.js').FormFieldConfig>} formFields - Configuration des champs.
  //  */
  // constructor(formFields) {
  //   this.formFields = formFields;
  // }

  /**
   * Ajoute des classes CSS spécifiques en fonction du type de champ.
   * @param {string} type - Type de champ (DATA_TYPES).
   * @returns {string[]} Liste des classes CSS à ajouter.
   */
  adjustFormStyle(type) {
    if (type === DATA_TYPES.BOOL) {
      return ['form-check', 'form-switch'];
    }
    return [];
  }

  /**
   * Crée un élément DOM pour un champ de formulaire.
   * @param {import('../models/FormFieldConfig.js').FormFieldConfig} field - Configuration du champ.
   * @returns {HTMLElement} Élément DOM du champ.
   */
  createInput(field) {
    console.log(field)
    const { type, name, elementId } = field;
    let element;

    switch (type) {
      case DATA_TYPES.STR:
        element = this.createTextInput(name, elementId);
        break;
      case DATA_TYPES.LGSTR:
        element = this.createTextArea(name, elementId);
        break;
      case DATA_TYPES.FLOAT:
        element = this.createNumberInput(name, elementId);
        break;
      case DATA_TYPES.BOOL:
        element = this.createCheckbox(name, elementId);
        break;
      case DATA_TYPES.REF:
        element = this.createSelect(name, elementId);
        break;
      case DATA_TYPES.ROW:
        element = this.createRowContainer(elementId);
        break;
      case DATA_TYPES.COLLECTION:
        element = this.createCollectionContainer(name, elementId);
        break;
      default:
        element = document.createElement('div');
        console.warn(`Type de champ non géré: ${type}`);
    }

    return element;
  }

  /**
   * Crée un input de type texte.
   * @param {string} name - Nom du champ.
   * @param {string} elementId - ID de l'élément.
   * @returns {HTMLInputElement} Input de type texte.
   */
  createTextInput(name, elementId) {
    const label = this.createLabel(name, elementId);
    const input = document.createElement('input');
    input.type = 'text';
    input.classList.add('form-control');
    input.id = `${elementId}-input`;

    const container = document.createElement('div');
    container.appendChild(label);
    container.appendChild(input);
    return container;
  }

  /**
   * Crée un textarea.
   * @param {string} name - Nom du champ.
   * @param {string} elementId - ID de l'élément.
   * @returns {HTMLTextAreaElement} Textarea.
   */
  createTextArea(name, elementId) {
    const label = this.createLabel(name, elementId);
    const textarea = document.createElement('textarea');
    textarea.rows = 4;
    textarea.classList.add('form-control');
    textarea.id = `${elementId}-input`;

    const container = document.createElement('div');
    container.appendChild(label);
    container.appendChild(textarea);
    return container;
  }

  /**
   * Crée un input de type number.
   * @param {string} name - Nom du champ.
   * @param {string} elementId - ID de l'élément.
   * @returns {HTMLInputElement} Input de type number.
   */
  createNumberInput(name, elementId) {
    const label = this.createLabel(name, elementId);
    const input = document.createElement('input');
    input.type = 'number';
    input.classList.add('form-control');
    input.id = `${elementId}-input`;

    const container = document.createElement('div');
    container.appendChild(label);
    container.appendChild(input);
    return container;
  }

  /**
   * Crée une checkbox.
   * @param {string} name - Nom du champ.
   * @param {string} elementId - ID de l'élément.
   * @returns {HTMLDivElement} Conteneur avec label et checkbox.
   */
  createCheckbox(name, elementId) {
    const container = document.createElement('div');
    container.classList.add(...this.adjustFormStyle(DATA_TYPES.BOOL));

    const label = document.createElement('label');
    label.classList.add('form-label');
    label.innerHTML = `<strong>${name}</strong>`;

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.classList.add('form-check-input');
    input.id = `${elementId}-input`;

    container.appendChild(label);
    container.appendChild(input);
    return container;
  }

  /**
   * Crée un SELECT pour les champs de référence.
   * @param {string} name - Nom du champ.
   * @param {string} elementId - ID de l'élément.
   * @returns {HTMLSelectElement} SELECT avec option par défaut.
   */
  createSelect(name, elementId) {
    const label = this.createLabel(name, elementId);
    const select = document.createElement('select');
    select.classList.add('form-select');
    select.id = `${elementId}-input`;

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.selected = true;
    defaultOption.textContent = `Sélectionnez un ${name.toLowerCase()}`;
    select.appendChild(defaultOption);

    const container = document.createElement('div');
    container.appendChild(label);
    container.appendChild(select);
    return container;
  }

  /**
   * Crée un conteneur pour un champ de type ROW.
   * @param {string} elementId - ID de l'élément.
   * @returns {HTMLDivElement} Conteneur ROW.
   */
  createRowContainer(elementId) {
    const div = document.createElement('div');
    div.classList.add('row');
    div.id = `${elementId}-row`;
    return div;
  }

  /**
   * Crée un conteneur pour un champ de type COLLECTION.
   * @param {string} name - Nom du champ.
   * @param {string} elementId - ID de l'élément.
   * @returns {HTMLDivElement} Conteneur avec titre et espace pour les éléments.
   */
  createCollectionContainer(name, elementId) {
    const title = document.createElement('h4');
    title.innerHTML = `<strong>${name}</strong>`;

    const container = document.createElement('div');
    container.id = `${elementId}-input`;

    const root = document.createElement('div');
    root.appendChild(title);
    root.appendChild(container);
    return root;
  }

  /**
   * Crée un label pour un champ.
   * @param {string} name - Nom du champ.
   * @param {string} elementId - ID de l'élément.
   * @returns {HTMLLabelElement} Label.
   */
  createLabel(name, elementId) {
    const label = document.createElement('label');
    label.classList.add('form-label');
    label.innerHTML = `<strong>${name}</strong>`;
    label.htmlFor = `${elementId}-input`;
    return label;
  }
}