// infoenergie_widget.js
class InfoEnergieWidget {
  constructor() {
    this.currentRowIndex = 0;
    this.rows = [];
    this.widgetId = null;
  }

  // Initialisation du widget
  init(widgetId, options) {
    this.widgetId = widgetId;
    this.options = options;
    this.fetchData();
    this.render();
    this.setupEventListeners();
  }

  // Récupération des données depuis Grist
  async fetchData() {
    const tableId = this.options.tableId || 'INFOENERGIE';
    const data = await grist.docApi.fetchSelectedTable(tableId);
    this.rows = data;
    if (this.rows.length > 0) {
      this.currentRowIndex = 0;
    }
  }

  // Affichage des données de la ligne courante
  render() {
    const container = document.getElementById(this.widgetId);
    container.innerHTML = '';

    if (this.rows.length === 0) {
      container.textContent = "Aucune donnée disponible.";
      return;
    }

    const currentRow = this.rows[this.currentRowIndex];

    // Création de la structure HTML
    const widgetContent = document.createElement('div');
    widgetContent.style.fontFamily = 'Arial, sans-serif';
    widgetContent.style.padding = '10px';
    widgetContent.style.border = '1px solid #ccc';
    widgetContent.style.borderRadius = '5px';
    widgetContent.style.maxWidth = '600px';

    // Titre
    const title = document.createElement('h3');
    title.textContent = `Informations Énergie (${this.currentRowIndex + 1}/${this.rows.length})`;
    widgetContent.appendChild(title);

    // Contenu des champs
    const fields = [
      { label: 'Source', key: 'Source' },
      { label: 'ID Gesimmo', key: 'id_gesimmo' },
      { label: 'Bâtiment (Commentaire)', key: 'batiment_comm' },
      { label: 'Détail (Commentaire)', key: 'deet_comm' },
      { label: 'Statut BACS', key: 'bacs_statut' },
      { label: 'Commentaire BACS', key: 'bacs_comm' },
      { label: 'Type d\'énergie', key: 'energie_type' },
      { label: 'Commentaire Énergie', key: 'energie_comm' },
      { label: 'DPE Énergie (Étiquette)', key: 'dpe_energie_etiquette' },
      { label: 'DPE Énergie (Ratio)', key: 'dpe_energie_ratio' },
      { label: 'Performance BACS', key: 'bacs_performance' },
      { label: 'DPE Climat (Étiquette)', key: 'dpe_climat_etiquette' },
      { label: 'DPE Climat (Ratio)', key: 'dpe_climat_ratio' },
      { label: 'Date DPE', key: 'dpe_date' },
      { label: 'Date de modification', key: 'modif_date' },
      { label: 'Utilisateur de modification', key: 'modif_user' },
    ];

    fields.forEach(({ label, key }) => {
      const fieldDiv = document.createElement('div');
      fieldDiv.style.marginBottom = '8px';

      const labelSpan = document.createElement('span');
      labelSpan.textContent = `${label}: `;
      labelSpan.style.fontWeight = 'bold';

      const valueSpan = document.createElement('span');
      valueSpan.textContent = currentRow[key] !== undefined ? currentRow[key] : 'N/A';

      fieldDiv.appendChild(labelSpan);
      fieldDiv.appendChild(valueSpan);
      widgetContent.appendChild(fieldDiv);
    });

    // Boutons de navigation
    const navDiv = document.createElement('div');
    navDiv.style.marginTop = '15px';
    navDiv.style.display = 'flex';
    navDiv.style.gap = '10px';

    const prevButton = document.createElement('button');
    prevButton.textContent = '← Précédent';
    prevButton.disabled = this.currentRowIndex === 0;
    prevButton.onclick = () => this.navigate(-1);

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Suivant →';
    nextButton.disabled = this.currentRowIndex >= this.rows.length - 1;
    nextButton.onclick = () => this.navigate(1);

    navDiv.appendChild(prevButton);
    navDiv.appendChild(nextButton);
    widgetContent.appendChild(navDiv);

    container.appendChild(widgetContent);
  }

  // Navigation entre les lignes
  navigate(direction) {
    this.currentRowIndex += direction;
    if (this.currentRowIndex < 0) this.currentRowIndex = 0;
    if (this.currentRowIndex >= this.rows.length) this.currentRowIndex = this.rows.length - 1;
    this.render();
  }

  // Configuration des écouteurs d'événements
  setupEventListeners() {
    // Écouteur pour les changements de données (optionnel)
    grist.on('change', () => {
      this.fetchData().then(() => this.render());
    });
  }
}

// Enregistrement du widget
grist.ready(() => {
  const widget = new InfoEnergieWidget();
  grist.registerWidget(widget, 'InfoEnergieWidget', {
    tableId: grist.options.tableId || 'INFOENERGIE',
  });
});