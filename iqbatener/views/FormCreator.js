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
  constructor(fieldCreator) {
    this.fieldCreator = fieldCreator;
  }

    setDocument(document) {
        this.document = document;
    }

    setRootElement(rootElement) {
        this.rootElement = rootElement;
    }

    /**
     * @param {Object.<string, import('../models/FormFieldConfig.js').FormFieldConfig>} formFields - Configuration des champs.
     */
    createForm(formFields) {
        const refPromises = [];
        const inputs ={};
        for (const [key, field] of Object.entries(formFields)) {
            if (field.hidden) continue;
            
            let div = getFieldPlaceHolderIfExists(elementId);
            
            if (!div) {
                div = createPlaceHolder(field)
                attachPlaceHolderToTheRightParent(field,div)
            }

            let input = getFieldInputIfExists(field.elementId)

            if (!input) {
                applyCustomStyle(div, field)

                div.innerHTML = this.fieldCreator.createInput(field);
                
                input = document.getElementById(`${field.elementId}-input`);
            }

            // if (field.type === DATA_TYPES.REF) {

            //     const promise = fillRefSelect(field.elementId, field).catch(console.error);
                
            //     refPromises.push(promise);
            // }    

        inputs[key] = input;
    }
        
    // let _resPromises =  Promise.all(refPromises);
    return inputs
    }

    /**
    * @param {str} elementId - Configuration des champs.
    */  
    getFieldPlaceHolderIfExists(elementId) {
        return this.document.getElementById(elementId);
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
}  
