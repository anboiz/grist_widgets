
grist.ready({columns: ['Reference','Gestionnaire'], requiredAccess: 'full'});


// ========== MODÈLE ==========
class ObjectModel {
  constructor() {
    this.data = {
      id: "",
      reference: "",
      manager: "",
      isActive: false,
      address: "",
    };
  }

  // Met à jour depuis Grist
  updateFromGrist(gristData) {
    console.log(gristData)
    if (gristData) {
      this.data.id = gristData.id || "";
      this.data.reference = gristData.reference || "";
      this.data.manager = gristData.manager || "";
      this.data.isActive = gristData.isActive || false;
      this.data.address = gristData.address || "";
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
        fields: this.data
    }
  }
}

// ========== VUE ==========
class ObjectView {
  constructor() {
    this.idElement = document.getElementById("object-id");
    this.referenceElement = document.getElementById("object-reference");
    this.managerElement = document.getElementById("object-manager");
    this.activeElement = document.getElementById("object-active");
    this.addressElement = document.getElementById("object-address");
    this.saveButton = document.getElementById("save-button");
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
      id: this.idElement.value,
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
    const formData = this.view.getFormData();
    this.model.updateFromGrist(formData);
    console.log(formData)
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
    if (mapped) {
        // document.getElementById('image').src = mapped.Link;
        // document.getElementById('title').innerText = mapped.Title;
        console.log(`Using ${mappings.Id} and ${mappings.Reference} columns`);

        model.updateFromGrist({
            'id':record.id,
            'reference':mapped.Reference,
            'manager':mapped.Gestionnaire,
        })
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

