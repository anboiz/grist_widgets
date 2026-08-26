// Initialisation des variables
// Déclaration 
const data = {
    id: {type: 'int', link:'id', hidden: true},
    reference: {type: 'str', link:'Reference'},
    fluide: {type: 'str', link:'Fluide'},
    manager: {type: 'str', link:'Gestionnaire'},
    adress: {type: 'str', link:'Adresse'},
    isActive: {type: 'bool', default:true}  
} 

// Extraire les valeurs de 'link' et filtrer les entrées sans 'link'
const linksList = Object.values(data)
    .map(item => item.link)
    .filter(link => ((link !== undefined) & (link !== 'id')));

// Créer un nouveau dictionnaire avec {clé : default | ""}
const defaultValues = Object.entries(data).reduce((acc, [key, value]) => {
    acc[key] = value.default !== undefined ? value.default : "";
    return acc;
}, {});

const appSideMapping = Object.entries(data)
    .reduce((acc, [key, value]) => {
        if  (value.link !== 'id') acc[key] = value.link;
        return acc;
    }, {});

// console.log(linksList);
// console.log(defaultValues);
console.log(appSideMapping);

grist.ready({columns: linksList, requiredAccess: 'full'});


// ========== MODÈLE ==========
class ObjectModel {
  constructor() {
    this.data = defaultValues;
    this.mapping = {}
  }

  updateMapping(mapping) {
    console.log(mapping)
    this.mapping = mapping
  }

  // Met à jour depuis Grist
  updateFromGrist(gristData) {
    if (gristData) {
      this.data = gristData
    } else {
      this.data.id = generateUUID();
    }
    console.log(this.data)
  }

  // Met à jour un champ
  updateField(field, value) {
    this.data[field] = value;
  }

  // Récupère les données
  getData() {
    return {
        id: this.data.id,
        fields: {
            Id2: this.data.reference,
            gestionnaire: this.data.manager, 
        }
    }
  }
}

// ========== VUE ==========
class ObjectView {
  constructor() {
    this.rootElement = document.getElementById("object-form");
    this.createForm();

  }

  createForm(){
        for (const [key, value] of Object.entries(data)) {
            // dict[key] = (value !== undefined) ? mapped[value] : defaultValues[value]
            console.log([key, value])
            // if value['hidden'] {

            // }
        }    
  }

  // Affiche les données
  render(data) {
    this.idElement.value = data.id;
    this.referenceElement.value = data.reference;
    this.managerElement.value = data.manager;
    this.activeElement.checked = data.isActive;
    this.addressElement.value = data.address;
  }

  // Lie les événements
  bindSave(handler) {
    this.saveButton.addEventListener("click", handler);
  }

  // Récupère les données du formulaire
  getFormData() {
    return {
      id: parseInt(this.idElement.value),
      reference: this.referenceElement.value,
      manager: this.managerElement.value,
      isActive: this.activeElement.checked,
      address: this.addressElement.value,
    };
  }
}

// ========== CONTRÔLEUR ==========
class ObjectController {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    // Initialisation
    this.view.render(this.model.getData());

    // Liaison des événements
    this.view.bindSave(() => this.handleSave());
  }
  // Met à jour la vue
  render() {
    this.view.render(this.model.getData());
  }

  // Gère la sauvegarde
  async handleSave() {
    console.log("Saving ....")
    const formData = this.view.getFormData();
    this.model.updateFromGrist(formData);
    console.log(formData)
    console.log(this.model.getData())
    await this.sendDataToGrist(this.model.getData());
  }

  // Envoie les données à Grist
  async sendDataToGrist(data) {
    await grist.selectedTable.update( data)
    alert("Objet sauvegardé avec succès !");
  }
}

// ========== INITIALISATION ==========
const model = new ObjectModel();
const view = new ObjectView();
const controller = new ObjectController(model, view);

grist.onRecord(function(record, mappings) {
    const mapped = grist.mapColumnNames(record);
    // First check if all columns were mapped.
    console.log("mapped")
    console.log(mapped)
    console.log("mappings")
    console.log(mappings)

    model.updateMapping(mappings)
    if (mapped) {

        dict = {'id':record.id}
        
        for (const [key, value] of Object.entries(appSideMapping)) {
            dict[key] = (value !== undefined) ? mapped[value] : defaultValues[value]
        }

        console.log("Dictionaire")
        console.log(dict)

        model.updateFromGrist(dict)
        // Rafraîchir la vue après la mise à jour du modèle
        controller.render();        


    } else {
        // Helper returned a null value. It means that not all
        // required columns were mapped.
        console.error("Please map all columns");
    }
        
});

// grist.onRecords(function(records) {
//     console.log(records);
// });

