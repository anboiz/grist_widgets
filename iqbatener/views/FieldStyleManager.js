/**
 * @file Gestionnaire des styles pour les champs de formulaire.
 * @description Ce module centralise la logique d'application des classes CSS en fonction du type de champ.
 */

import { DATA_TYPES } from '../models/FormFieldConfig.js';

/**
 * Gère les classes CSS à appliquer aux champs de formulaire.
 */
export class FieldStyleManager {
  /**
   * Récupère les classes CSS spécifiques pour un type de champ donné.
   * @param {string} type - Type de champ (ex: DATA_TYPES.BOOL, DATA_TYPES.STR).
   * @returns {string[]} Liste des classes CSS à appliquer.
   */
  getClassesForType(type) {
    const styleMap = {
      [DATA_TYPES.BOOL]: ['form-check', 'form-switch'],
      // Ajoutez ici d'autres types si nécessaire
    };
    return styleMap[type] || [];
  }
}