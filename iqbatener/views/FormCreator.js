
/**
 * @file Service de rendu des champs de formulaire.
 * @description Ce module gère la création des éléments HTML pour chaque type de champ.
 */

import { DATA_TYPES } from '../models/FormFieldConfig.js';

/**
 * Service pour générer les champs du formulaire.
 */
export class FormCreator {
  /**
   * @param {Object.<string, import('../models/FormFieldConfig.js').FormFieldConfig>} formFields - Configuration des champs.
   */
  constructor(gristUtils,fieldCreator) {
    this.gristUtils = gristUtils
    this.fieldCreator = fieldCreator;
  }

    setDocument(document) {
        this.document = document;
    }

    setRootElement(rootElement) {
        this.rootElement = rootElement;
    }

    /**
    * @param {str} elementId - Configuration des champs.
    */  
    getFieldPlaceHolderIfExists(elementId) {
        return this.document.getElementById(elementId);
    }

    /**
     * @param {Object.<string, import('../models/FormFieldConfig.js').FormFieldConfig>} formFields - Configuration des champs.
     */
    async createForm(formFields) {
        const refPromises = [];
        const inputs ={};
        for (const [key, field] of Object.entries(formFields)) {
            if (field.hidden) continue;
            // console.log(key)
            let div = this.getFieldPlaceHolderIfExists(field.elementId);
            // console.log(div)
            
            if (!div) {
                div = this.createPlaceHolder(field)
                // console.log(div)
                this.attachPlaceHolderToTheRightParent(field,div)
            }

            let input = this.getFieldInputIfExists(field.elementId)

            if (!input) {
                this.applyCustomStyle(div, field)

                this.fieldCreator.createInput(div, field);
                
                input = document.getElementById(`${field.elementId}-input`);
            }

            if (field.type === DATA_TYPES.REF) {

                const promise = this.fillRefSelect(field.elementId, field).catch(console.error);
                
                refPromises.push(promise);
            }    

            inputs[key] = input;
        }
            
        let bleu =  Promise.all(refPromises);
        // console.log(bleu)
        return inputs
    }

    createPlaceHolder(field) {
        let div = this.document.createElement('div');
        div.id = field.elementId;
        if (Object.hasOwn(field, 'format')) {
          div.classList.add(field.format);
        } else {
          div.classList.add('mb-3');
        }
        return div
    }

    attachPlaceHolderToTheRightParent(field,div) {
        if (Object.hasOwn(field, 'isChildOf')) {
          let parent_div = this.rootElement.querySelector(`#${field.isChildOf}-row`);
          parent_div.appendChild(div);
        } else {
          this.rootElement.appendChild(div);
        }
    }

    getFieldInputIfExists(elementId) {
        return this.document.getElementById(`${elementId}-input`);        
    }

    applyCustomStyle(div, field) {
        const styles = [];
        if (field.type === DATA_TYPES.BOOL) {
            styles.add(getStyleForTypeBool())
        }        
        if (styles.length > 0) {
            div.classList.add(...styles);
        }
    }

    getStyleForTypeBool() {
        return ['form-check', 'form-switch'];
    }

    generateColorChanger(colorMapping,defaultColor="#606060") {
    return function(select) {
        const color=colorMapping[select.value] ?? defaultColor
        return select.style.backgroundColor = color;
        }
    }

    /**
     * Remplit un champ SELECT avec les options de référence.
     * @param {string} elementId - ID de l'élément SELECT.
     * @param {FormFieldConfig} fieldConfig - Configuration du champ.
     */
    async fillRefSelect(elementId, fieldConfig) {

        // console.log(elementId)
      const selectElement = document.getElementById(`${elementId}-input`);
      if (!selectElement) return;
    
      const refData = await this.gristUtils.fetchRefData(fieldConfig.refConfig.table);
      const options = this.formatRefOptions(refData, fieldConfig);
    
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
    
          const colorChanger = this.generateColorChanger(colorMapping)
          selectElement.addEventListener('change', (e) => {
    
            colorChanger(e.currentTarget)
          });
        }
        
      });
    
    }

    /**
     * Formate les données de référence pour un champ SELECT.
     * @param {Array} refData - Données de référence brutes.
     * @param {FormFieldConfig} fieldConfig - Configuration du champ.
     * @returns {Array} Liste des options formatées.
     */
    formatRefOptions(refData, fieldConfig) {
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
}
