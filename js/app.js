/**
 * Discipline Nutrition - Interface utilisateur
 */

class App {
    constructor() {
        this.currentMeal = null;
        this.selectedDate = game.getTodayString();
        this.displayedWeekMonday = game.getMondayOfWeek();
        this.init();
    }

    init() {
        this.renderRegimeSelector();
        this.bindEvents();
        this.renderCalendar();
        this.updateUI();
    }

    /**
     * Noms des jours
     */
    getDayNames() {
        return ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    }

    /**
     * Noms des mois
     */
    getMonthNames() {
        return ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    }

    /**
     * Lie les événements
     */
    bindEvents() {
        // Navigation calendrier
        document.getElementById('prev-week').addEventListener('click', () => {
            this.navigateWeek(-1);
        });

        document.getElementById('next-week').addEventListener('click', () => {
            this.navigateWeek(1);
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
     * Navigation de semaine
     */
    navigateWeek(direction) {
        const current = game.parseDate(this.displayedWeekMonday);
        current.setDate(current.getDate() + (direction * 7));
        this.displayedWeekMonday = game.formatDate(current);
        this.renderCalendar();
    }

    /**
     * Rendu du calendrier
     */
    renderCalendar() {
        const weekDays = game.getWeekDays(this.displayedWeekMonday);
        const grid = document.getElementById('calendar-grid');
        const dayNames = this.getDayNames();

        // Label de la semaine
        const monday = game.parseDate(this.displayedWeekMonday);
        const sunday = new Date(monday);
        sunday.setDate(sunday.getDate() + 6);

        const monthNames = this.getMonthNames();
        let weekLabel = '';

        if (monday.getMonth() === sunday.getMonth()) {
            weekLabel = `${monday.getDate()} - ${sunday.getDate()} ${monthNames[monday.getMonth()]}`;
        } else {
            weekLabel = `${monday.getDate()} ${monthNames[monday.getMonth()].slice(0, 3)} - ${sunday.getDate()} ${monthNames[sunday.getMonth()].slice(0, 3)}`;
        }

        document.getElementById('week-label').textContent = weekLabel;

        // Grille des jours
        grid.innerHTML = '';

        weekDays.forEach(day => {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';

            if (day.isToday) dayEl.classList.add('today');
            if (day.date === this.selectedDate) dayEl.classList.add('selected');

            // Status dots (cartes jouées)
            let statusDots = '';
            const meals = Object.values(day.meals);
            meals.forEach(meal => {
                if (meal) {
                    statusDots += `<span class="status-dot ${meal.type}"></span>`;
                } else {
                    statusDots += `<span class="status-dot empty"></span>`;
                }
            });

            dayEl.innerHTML = `
                <span class="day-name">${dayNames[day.dayOfWeek]}</span>
                <span class="day-number">${day.dayNumber}</span>
                <div class="day-status">${statusDots}</div>
            `;

            dayEl.addEventListener('click', () => {
                this.selectDate(day.date);
            });

            grid.appendChild(dayEl);
        });
    }

    /**
     * Sélectionne une date
     */
    selectDate(dateStr) {
        this.selectedDate = dateStr;
        this.renderCalendar();
        this.updateUI();
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
            btn.addEventListener('click', (e) => this.selectRegime(mode.id, e));
            container.appendChild(btn);
        });

        // Afficher/masquer le deck personnalisé
        const customDeck = document.getElementById('custom-deck');
        customDeck.style.display = state.regimeMode === 'custom' ? 'block' : 'none';
    }

    /**
     * Sélectionne un régime
     */
    selectRegime(modeId, event) {
        if (modeId === 'custom') {
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
        const today = game.getTodayString();

        // Deck restant
        document.getElementById('count-discipline').textContent = state.remainingCards.discipline;
        document.getElementById('count-flex').textContent = state.remainingCards.flex;
        document.getElementById('count-joker').textContent = state.remainingCards.joker;

        // Classes pour deck vide
        document.getElementById('deck-discipline').classList.toggle('empty', state.remainingCards.discipline === 0);
        document.getElementById('deck-flex').classList.toggle('empty', state.remainingCards.flex === 0);
        document.getElementById('deck-joker').classList.toggle('empty', state.remainingCards.joker === 0);

        // Info reset
        document.getElementById('reset-info').textContent = `Reset dans ${state.daysUntilReset}j`;

        // Titre de la date sélectionnée
        const titleEl = document.getElementById('selected-date-title');
        const selectedDate = game.parseDate(this.selectedDate);
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        let dateTitle = selectedDate.toLocaleDateString('fr-FR', options);
        dateTitle = dateTitle.charAt(0).toUpperCase() + dateTitle.slice(1);

        if (this.selectedDate === today) {
            titleEl.innerHTML = `${dateTitle} <span class="today-badge">Aujourd'hui</span>`;
        } else {
            titleEl.textContent = dateTitle;
        }

        // Repas du jour sélectionné
        const meals = game.getDayMeals(this.selectedDate);
        this.renderMeals(meals);
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
        const isCurrentWeek = game.isInCurrentWeek(this.selectedDate);

        // Nom du repas
        document.getElementById('modal-meal-name').textContent = `${mealInfo.emoji} ${mealInfo.name}`;

        // Cartes restantes
        document.getElementById('modal-discipline-count').textContent = state.remainingCards.discipline;
        document.getElementById('modal-flex-count').textContent = state.remainingCards.flex;
        document.getElementById('modal-joker-count').textContent = state.remainingCards.joker;

        // Désactiver les cartes épuisées (seulement pour la semaine courante)
        if (isCurrentWeek) {
            document.querySelector('.card-choice.discipline').disabled = state.remainingCards.discipline === 0;
            document.querySelector('.card-choice.flex').disabled = state.remainingCards.flex === 0;
            document.querySelector('.card-choice.joker').disabled = state.remainingCards.joker === 0;
        } else {
            // Pour les autres semaines, toutes les cartes sont disponibles
            document.querySelector('.card-choice.discipline').disabled = false;
            document.querySelector('.card-choice.flex').disabled = false;
            document.querySelector('.card-choice.joker').disabled = false;
        }

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

        const result = game.playCard(this.selectedDate, this.currentMeal, cardType);

        if (result.success) {
            this.closeModal();
            this.renderCalendar();
            this.updateUI();
        } else {
            this.showToast(result.message, true);
        }
    }

    /**
     * Annule une carte
     */
    cancelCard(mealType) {
        const result = game.cancelCard(this.selectedDate, mealType);

        if (result.success) {
            this.renderCalendar();
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
