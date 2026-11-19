import { defaultValues, appSideMapping} from '../models/FormFieldConfig.js';

export class GristUtils {
    /**
   * @param 
   */
  constructor(currentTableId) {
    this.currentTableId = currentTableId;
    this.refDataCache = {};
  }

  /**
   * Charge un enregistrement spécifique dans le formulaire.
   * @param {number} index - Index de l'enregistrement à charger.
   */
    async loadRecord(index) {
    
        grist.viewApi.setSelectedRows(index)
        let selectedRecord = await grist.viewApi.fetchSelectedRecord(index)
        console.log({selectedRecord:selectedRecord})
        const mappedRecord = await grist.mapColumnNames(selectedRecord);
        console.log({mappedRecord:mappedRecord})
        // Attention violation du SRP
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

    // Fonction pour charger tous les enregistrements
    async fetchAllRecords(currentTableId) {
        if (!currentTableId) {
            currentTableId= this.currentTableId
        }

        console.log({currentTableId:currentTableId})
    
      try {
        const data = await grist.docApi.fetchTable(currentTableId);
        let allRecords = data;
        console.log({allRecords:allRecords})
        if (allRecords['id'].length > 0) {
    
        //   let currentRecordIndex = 0;
    
          return allRecords;
          
        } else {
          console.warn("Aucun enregistrement trouvé dans la table.");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des enregistrements :", error);
      }
    }
    
    async getRowsByIds(tableId, ids) {
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


    /**
     * Récupère les données de référence depuis Grist.
     * @param {string} tableName - Nom de la table de référence.
     * @returns {Promise<Array>} Liste des enregistrements de référence.
     */
    async fetchRefData(tableName) {
        // Vérifie si les données sont déjà en cache
        if (this.refDataCache[tableName]) {
            return this.refDataCache[tableName];
        }

        try {
            const data = await grist.docApi.fetchTable(tableName);
            this.refDataCache[tableName] = data;
            return data;
        } catch (error) {
            console.error(`Erreur lors de la récupération des données de référence (${tableName}):`, error);
            return { id: [], [data.displayField]: [] };
        }

    }
}