/**
 * Discipline Nutrition - Logique du jeu
 *
 * Règles:
 * - Le deck se réinitialise chaque lundi
 * - On place une carte (ou jeûne) par repas
 * - Les cartes dépensées sont retirées du deck
 */

class NutritionGame {
    constructor() {
        this.state = {
            // Configuration
            regimeMode: 'lowcarb',
            customDeck: null,

            // État de la semaine courante
            weekStart: null,
            remainingCards: {
                discipline: 0,
                flex: 0,
                joker: 0
            },

            // Repas de la journée
            todayDate: null,
            todayMeals: {
                breakfast: null,
                lunch: null,
                dinner: null,
                snack: null
            },

            // Historique (semaines passées)
            history: []
        };

        this.loadState();
        this.checkNewWeek();
        this.checkNewDay();
    }

    /**
     * Charge l'état depuis localStorage
     */
    loadState() {
        const saved = localStorage.getItem('disciplineNutritionState');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.state = { ...this.state, ...parsed };
            } catch (e) {
                console.error('Erreur chargement:', e);
            }
        }
    }

    /**
     * Sauvegarde l'état
     */
    saveState() {
        localStorage.setItem('disciplineNutritionState', JSON.stringify(this.state));
    }

    /**
     * Obtient le lundi de la semaine pour une date donnée
     */
    getMondayOfWeek(date = new Date()) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d.toISOString().split('T')[0];
    }

    /**
     * Obtient la date d'aujourd'hui
     */
    getTodayString() {
        return new Date().toISOString().split('T')[0];
    }

    /**
     * Vérifie si c'est une nouvelle semaine (lundi)
     */
    checkNewWeek() {
        const currentMonday = this.getMondayOfWeek();

        if (this.state.weekStart !== currentMonday) {
            // Nouvelle semaine - réinitialiser le deck
            this.state.weekStart = currentMonday;
            this.resetDeck();
            this.saveState();
        }
    }

    /**
     * Vérifie si c'est un nouveau jour
     */
    checkNewDay() {
        const today = this.getTodayString();

        if (this.state.todayDate !== today) {
            // Archiver la journée précédente
            if (this.state.todayDate) {
                this.archiveDay();
            }

            // Nouveau jour
            this.state.todayDate = today;
            this.state.todayMeals = {
                breakfast: null,
                lunch: null,
                dinner: null,
                snack: null
            };
            this.saveState();
        }
    }

    /**
     * Réinitialise le deck selon le mode
     */
    resetDeck() {
        const mode = REGIME_MODES[this.state.regimeMode];
        if (mode) {
            if (this.state.regimeMode === 'custom' && this.state.customDeck) {
                this.state.remainingCards = { ...this.state.customDeck };
            } else {
                this.state.remainingCards = { ...mode.deck };
            }
        }
    }

    /**
     * Archive les données de la journée
     */
    archiveDay() {
        const dayData = {
            date: this.state.todayDate,
            meals: { ...this.state.todayMeals }
        };

        this.state.history.push(dayData);

        // Garder 60 jours d'historique
        if (this.state.history.length > 60) {
            this.state.history.shift();
        }
    }

    /**
     * Joue une carte pour un repas
     */
    playCard(mealType, cardType) {
        // Vérifier si le repas est déjà pris
        if (this.state.todayMeals[mealType] !== null) {
            return { success: false, message: 'Ce repas a déjà une carte' };
        }

        // Gérer le jeûne (pas de carte consommée)
        if (cardType === 'fasting') {
            this.state.todayMeals[mealType] = {
                type: 'fasting',
                timestamp: Date.now()
            };
            this.saveState();
            return { success: true };
        }

        // Vérifier si on a encore des cartes de ce type
        if (this.state.remainingCards[cardType] <= 0) {
            return {
                success: false,
                message: `Plus de cartes ${CARD_TYPES[cardType].name} !`
            };
        }

        // Jouer la carte
        this.state.remainingCards[cardType]--;
        this.state.todayMeals[mealType] = {
            type: cardType,
            timestamp: Date.now()
        };
        this.saveState();

        return {
            success: true,
            remainingCards: this.state.remainingCards[cardType]
        };
    }

    /**
     * Annule une carte jouée
     */
    cancelCard(mealType) {
        const meal = this.state.todayMeals[mealType];
        if (!meal) {
            return { success: false, message: 'Aucune carte à annuler' };
        }

        // Remettre la carte dans le deck (sauf jeûne)
        if (meal.type !== 'fasting') {
            this.state.remainingCards[meal.type]++;
        }

        this.state.todayMeals[mealType] = null;
        this.saveState();

        return { success: true };
    }

    /**
     * Change le mode de régime
     */
    setRegimeMode(modeId, customDeck = null) {
        this.state.regimeMode = modeId;
        if (modeId === 'custom' && customDeck) {
            this.state.customDeck = customDeck;
        }
        this.resetDeck();
        this.saveState();
    }

    /**
     * Obtient l'état actuel
     */
    getState() {
        return {
            ...this.state,
            currentMode: REGIME_MODES[this.state.regimeMode],
            daysUntilReset: this.getDaysUntilMonday()
        };
    }

    /**
     * Jours restants jusqu'au prochain lundi
     */
    getDaysUntilMonday() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        if (dayOfWeek === 1) return 7;
        return dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    }

    /**
     * Réinitialise tout
     */
    reset() {
        localStorage.removeItem('disciplineNutritionState');
        location.reload();
    }
}

// Instance globale
const game = new NutritionGame();
