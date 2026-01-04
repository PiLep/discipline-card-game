/**
 * Discipline Nutrition - Logique du jeu
 *
 * Règles:
 * - Le deck se réinitialise chaque lundi
 * - On place une carte (ou jeûne) par repas
 * - Les cartes dépensées sont retirées du deck
 * - Navigation dans le calendrier pour voir/modifier les jours
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

            // Données des jours (clé = date YYYY-MM-DD)
            days: {}
        };

        this.loadState();
        this.checkNewWeek();
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
     * Convertit une date string en objet Date
     */
    parseDate(dateStr) {
        return new Date(dateStr + 'T00:00:00');
    }

    /**
     * Vérifie si c'est une nouvelle semaine
     */
    checkNewWeek() {
        const currentMonday = this.getMondayOfWeek();

        if (this.state.weekStart !== currentMonday) {
            this.state.weekStart = currentMonday;
            this.resetDeck();
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
     * Obtient les repas d'un jour donné
     */
    getDayMeals(dateStr) {
        if (!this.state.days[dateStr]) {
            return {
                breakfast: null,
                lunch: null,
                dinner: null,
                snack: null
            };
        }
        return this.state.days[dateStr].meals;
    }

    /**
     * Vérifie si une date est dans la semaine courante
     */
    isInCurrentWeek(dateStr) {
        const monday = this.getMondayOfWeek();
        const date = this.parseDate(dateStr);
        const mondayDate = this.parseDate(monday);
        const sundayDate = new Date(mondayDate);
        sundayDate.setDate(sundayDate.getDate() + 6);

        return date >= mondayDate && date <= sundayDate;
    }

    /**
     * Joue une carte pour un repas à une date donnée
     */
    playCard(dateStr, mealType, cardType) {
        // Initialiser le jour si nécessaire
        if (!this.state.days[dateStr]) {
            this.state.days[dateStr] = {
                meals: {
                    breakfast: null,
                    lunch: null,
                    dinner: null,
                    snack: null
                }
            };
        }

        const dayMeals = this.state.days[dateStr].meals;

        // Vérifier si le repas est déjà pris
        if (dayMeals[mealType] !== null) {
            return { success: false, message: 'Ce repas a déjà une carte' };
        }

        // Gérer le jeûne (pas de carte consommée)
        if (cardType === 'fasting') {
            dayMeals[mealType] = {
                type: 'fasting',
                timestamp: Date.now()
            };
            this.saveState();
            return { success: true };
        }

        // Vérifier si la date est dans la semaine courante (pour utiliser le deck)
        if (!this.isInCurrentWeek(dateStr)) {
            // Pour les autres semaines, on ne vérifie pas le deck
            dayMeals[mealType] = {
                type: cardType,
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
        dayMeals[mealType] = {
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
    cancelCard(dateStr, mealType) {
        if (!this.state.days[dateStr]) {
            return { success: false, message: 'Aucune carte à annuler' };
        }

        const meal = this.state.days[dateStr].meals[mealType];
        if (!meal) {
            return { success: false, message: 'Aucune carte à annuler' };
        }

        // Remettre la carte dans le deck si dans la semaine courante
        if (meal.type !== 'fasting' && this.isInCurrentWeek(dateStr)) {
            this.state.remainingCards[meal.type]++;
        }

        this.state.days[dateStr].meals[mealType] = null;
        this.saveState();

        return { success: true };
    }

    /**
     * Obtient le résumé d'un jour
     */
    getDaySummary(dateStr) {
        const meals = this.getDayMeals(dateStr);
        const summary = {
            total: 0,
            filled: 0,
            cards: {
                discipline: 0,
                flex: 0,
                joker: 0,
                fasting: 0
            }
        };

        Object.values(meals).forEach(meal => {
            summary.total++;
            if (meal) {
                summary.filled++;
                if (summary.cards[meal.type] !== undefined) {
                    summary.cards[meal.type]++;
                }
            }
        });

        return summary;
    }

    /**
     * Obtient les jours d'une semaine
     */
    getWeekDays(mondayStr) {
        const monday = this.parseDate(mondayStr);
        const days = [];
        const today = this.getTodayString();

        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            days.push({
                date: dateStr,
                dayOfWeek: date.getDay(),
                dayNumber: date.getDate(),
                isToday: dateStr === today,
                meals: this.getDayMeals(dateStr),
                summary: this.getDaySummary(dateStr)
            });
        }

        return days;
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
