/**
 * Discipline Nutrition - Interface utilisateur
 */

class App {
    constructor() {
        this.currentMeal = null;
        this.init();
    }

    init() {
        this.displayDate();
        this.renderRegimeSelector();
        this.bindEvents();
        this.updateUI();
    }

    /**
     * Affiche la date
     */
    displayDate() {
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        const date = new Date().toLocaleDateString('fr-FR', options);
        document.getElementById('current-date').textContent =
            date.charAt(0).toUpperCase() + date.slice(1);
    }

    /**
     * Lie les événements
     */
    bindEvents() {
        // Boutons "Jouer une carte"
        document.querySelectorAll('.play-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const slot = e.target.closest('.meal-slot');
                this.openCardModal(slot.dataset.meal);
            });
        });

        // Choix de carte dans la modal
        document.querySelectorAll('.card-choice').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!btn.disabled) {
                    this.playCard(btn.dataset.card);
                }
            });
        });

        // Annuler modal
        document.getElementById('cancel-modal').addEventListener('click', () => {
            this.closeModal();
        });

        // Fermer modal en cliquant dehors
        document.getElementById('card-modal').addEventListener('click', (e) => {
            if (e.target.id === 'card-modal') {
                this.closeModal();
            }
        });

        // Sauvegarde deck personnalisé
        document.getElementById('save-custom').addEventListener('click', () => {
            this.saveCustomDeck();
        });
    }

    /**
     * Crée le sélecteur de régime
     */
    renderRegimeSelector() {
        const container = document.getElementById('regime-selector');
        const state = game.getState();

        container.innerHTML = '';

        Object.values(REGIME_MODES).forEach(mode => {
            const btn = document.createElement('button');
            btn.className = `regime-btn ${state.regimeMode === mode.id ? 'active' : ''}`;
            btn.textContent = `${mode.emoji} ${mode.name}`;
            btn.addEventListener('click', () => this.selectRegime(mode.id));
            container.appendChild(btn);
        });

        // Afficher/masquer le deck personnalisé
        const customDeck = document.getElementById('custom-deck');
        customDeck.style.display = state.regimeMode === 'custom' ? 'block' : 'none';
    }

    /**
     * Sélectionne un régime
     */
    selectRegime(modeId) {
        if (modeId === 'custom') {
            // Afficher les inputs personnalisés
            document.getElementById('custom-deck').style.display = 'block';
        } else {
            game.setRegimeMode(modeId);
            document.getElementById('custom-deck').style.display = 'none';
        }

        // Mettre à jour les boutons
        document.querySelectorAll('.regime-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        this.updateUI();
    }

    /**
     * Sauvegarde le deck personnalisé
     */
    saveCustomDeck() {
        const customDeck = {
            discipline: parseInt(document.getElementById('custom-discipline').value) || 0,
            flex: parseInt(document.getElementById('custom-flex').value) || 0,
            joker: parseInt(document.getElementById('custom-joker').value) || 0
        };

        game.setRegimeMode('custom', customDeck);
        this.updateUI();
        this.showToast('Deck personnalisé appliqué !');
    }

    /**
     * Met à jour toute l'interface
     */
    updateUI() {
        const state = game.getState();

        // Deck restant
        document.getElementById('count-discipline').textContent = state.remainingCards.discipline;
        document.getElementById('count-flex').textContent = state.remainingCards.flex;
        document.getElementById('count-joker').textContent = state.remainingCards.joker;

        // Classes pour deck vide
        document.getElementById('deck-discipline').classList.toggle('empty', state.remainingCards.discipline === 0);
        document.getElementById('deck-flex').classList.toggle('empty', state.remainingCards.flex === 0);
        document.getElementById('deck-joker').classList.toggle('empty', state.remainingCards.joker === 0);

        // Info reset
        document.getElementById('reset-info').textContent = `Reset dans ${state.daysUntilReset} jour${state.daysUntilReset > 1 ? 's' : ''}`;

        // Repas
        this.renderMeals(state.todayMeals);
    }

    /**
     * Affiche les repas
     */
    renderMeals(meals) {
        Object.entries(meals).forEach(([mealType, meal]) => {
            const container = document.getElementById(`meal-${mealType}`);

            if (meal) {
                // Carte jouée
                const cardInfo = meal.type === 'fasting' ? FASTING_OPTION : CARD_TYPES[meal.type];
                container.innerHTML = `
                    <div class="played-card ${meal.type}">
                        <span class="emoji">${cardInfo.emoji}</span>
                        <div class="info">
                            <span class="name">${cardInfo.name}</span>
                            <span class="desc">${cardInfo.description}</span>
                        </div>
                        <button class="cancel-btn" data-meal="${mealType}">&times;</button>
                    </div>
                `;

                // Événement annulation
                container.querySelector('.cancel-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.cancelCard(mealType);
                });
            } else {
                // Pas de carte
                container.innerHTML = `<button class="play-btn">Jouer une carte</button>`;
                container.querySelector('.play-btn').addEventListener('click', () => {
                    this.openCardModal(mealType);
                });
            }
        });
    }

    /**
     * Ouvre la modal de choix de carte
     */
    openCardModal(mealType) {
        this.currentMeal = mealType;
        const state = game.getState();
        const mealInfo = MEALS[mealType];

        // Nom du repas
        document.getElementById('modal-meal-name').textContent = `${mealInfo.emoji} ${mealInfo.name}`;

        // Cartes restantes
        document.getElementById('modal-discipline-count').textContent = state.remainingCards.discipline;
        document.getElementById('modal-flex-count').textContent = state.remainingCards.flex;
        document.getElementById('modal-joker-count').textContent = state.remainingCards.joker;

        // Désactiver les cartes épuisées
        document.querySelector('.card-choice.discipline').disabled = state.remainingCards.discipline === 0;
        document.querySelector('.card-choice.flex').disabled = state.remainingCards.flex === 0;
        document.querySelector('.card-choice.joker').disabled = state.remainingCards.joker === 0;

        // Afficher la modal
        document.getElementById('card-modal').classList.add('active');
    }

    /**
     * Ferme la modal
     */
    closeModal() {
        document.getElementById('card-modal').classList.remove('active');
        this.currentMeal = null;
    }

    /**
     * Joue une carte
     */
    playCard(cardType) {
        if (!this.currentMeal) return;

        const result = game.playCard(this.currentMeal, cardType);

        if (result.success) {
            this.closeModal();
            this.updateUI();
        } else {
            this.showToast(result.message, true);
        }
    }

    /**
     * Annule une carte
     */
    cancelCard(mealType) {
        const result = game.cancelCard(mealType);

        if (result.success) {
            this.updateUI();
            this.showToast('Carte annulée');
        }
    }

    /**
     * Affiche un toast
     */
    showToast(message, isError = false) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.toggle('error', isError);
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
