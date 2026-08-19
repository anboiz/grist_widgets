// ========== MODÈLE (Model) ==========
class WidgetModel {
  constructor() {
    this.data = {
      message: "Bonjour, ceci est un message par défaut.",
      count: 0,
    };
  }

  // Méthode pour mettre à jour les données
  updateMessage(newMessage) {
    this.data.message = newMessage;
  }

  // Méthode pour incrémenter un compteur
  incrementCount() {
    this.data.count += 1;
  }

  // Récupérer les données
  getData() {
    return this.data;
  }
}

// ========== VUE (View) ==========
class WidgetView {
  constructor() {
    this.titleElement = document.getElementById("widget-title");
    this.messageElement = document.getElementById("widget-message");
    this.buttonElement = document.getElementById("widget-button");
  }

  // Met à jour l'affichage
  render(data) {
    this.messageElement.textContent = data.message;
    this.titleElement.textContent = `Mon Widget (${data.count})`;
  }

  // Ajoute un écouteur d'événement au bouton
  bindButtonClick(handler) {
    this.buttonElement.addEventListener("click", handler);
  }
}

// ========== CONTRÔLEUR (Controller) ==========
class WidgetController {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    // Initialisation
    this.view.render(this.model.getData());

    // Liaison des événements
    this.view.bindButtonClick(() => this.handleButtonClick());
  }

  // Gère le clic sur le bouton
  handleButtonClick() {
    this.model.incrementCount();
    this.model.updateMessage(`Vous avez cliqué ${this.model.getData().count} fois !`);
    this.view.render(this.model.getData());
  }
}

// ========== INITIALISATION ==========
document.addEventListener("DOMContentLoaded", () => {
  const model = new WidgetModel();
  const view = new WidgetView();
  new WidgetController(model, view);
});