/**
 * Discipline Nutrition - Logique du jeu
 *
 * Règles:
 * - Chaque semaine a son propre deck
 * - On place une carte (ou jeûne) par repas
 * - Les cartes dépensées sont retirées du deck de la semaine
 */

class NutritionGame {
    constructor() {
        this.state = {
            // Configuration
            regimeMode: 'lowcarb',
            customDeck: null,

            // Données par semaine (clé = lundi YYYY-MM-DD)
            weeks: {},

            // Données des jours (clé = date YYYY-MM-DD)
            days: {}
        };

        this.loadState();
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
     * Formate une date en YYYY-MM-DD (sans conversion UTC)
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Obtient le lundi de la semaine pour une date donnée
     */
    getMondayOfWeek(date = new Date()) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        d.setDate(d.getDate() + diff);
        d.setHours(0, 0, 0, 0);
        return this.formatDate(d);
    }

    /**
     * Obtient le lundi pour une date string
     */
    getMondayForDate(dateStr) {
        const date = this.parseDate(dateStr);
        return this.getMondayOfWeek(date);
    }

    /**
     * Obtient la date d'aujourd'hui
     */
    getTodayString() {
        return this.formatDate(new Date());
    }

    /**
     * Convertit une date string en objet Date
     */
    parseDate(dateStr) {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    /**
     * Obtient ou initialise le deck d'une semaine
     */
    getWeekDeck(mondayStr) {
        if (!this.state.weeks[mondayStr]) {
            this.initWeek(mondayStr);
        }
        return this.state.weeks[mondayStr].remainingCards;
    }

    /**
     * Initialise une semaine avec son deck
     */
    initWeek(mondayStr) {
        const mode = REGIME_MODES[this.state.regimeMode];
        let deck;

        if (this.state.regimeMode === 'custom' && this.state.customDeck) {
            deck = { ...this.state.customDeck };
        } else if (mode) {
            deck = { ...mode.deck };
        } else {
            deck = { discipline: 14, flex: 10, joker: 4 };
        }

        this.state.weeks[mondayStr] = {
            remainingCards: deck
        };
        this.saveState();
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

        // Obtenir le deck de la semaine correspondante
        const mondayStr = this.getMondayForDate(dateStr);
        const weekDeck = this.getWeekDeck(mondayStr);

        // Vérifier si on a encore des cartes de ce type
        if (weekDeck[cardType] <= 0) {
            return {
                success: false,
                message: `Plus de cartes ${CARD_TYPES[cardType].name} cette semaine !`
            };
        }

        // Jouer la carte
        weekDeck[cardType]--;
        dayMeals[mealType] = {
            type: cardType,
            timestamp: Date.now()
        };
        this.saveState();

        return {
            success: true,
            remainingCards: weekDeck[cardType]
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

        // Remettre la carte dans le deck de la semaine (sauf jeûne)
        if (meal.type !== 'fasting') {
            const mondayStr = this.getMondayForDate(dateStr);
            const weekDeck = this.getWeekDeck(mondayStr);
            weekDeck[meal.type]++;
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
            const dateStr = this.formatDate(date);

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
     * Change le mode de régime (affecte les nouvelles semaines)
     */
    setRegimeMode(modeId, customDeck = null) {
        this.state.regimeMode = modeId;
        if (modeId === 'custom' && customDeck) {
            this.state.customDeck = customDeck;
        }
        this.saveState();
    }

    /**
     * Réinitialise le deck d'une semaine spécifique
     */
    resetWeekDeck(mondayStr) {
        delete this.state.weeks[mondayStr];
        this.initWeek(mondayStr);
    }

    /**
     * Obtient l'état pour une semaine donnée
     */
    getStateForWeek(mondayStr) {
        const weekDeck = this.getWeekDeck(mondayStr);
        const today = this.getTodayString();
        const todayMonday = this.getMondayOfWeek();

        // Calculer les jours restants jusqu'à la fin de cette semaine
        const monday = this.parseDate(mondayStr);
        const sunday = new Date(monday);
        sunday.setDate(sunday.getDate() + 6);

        return {
            regimeMode: this.state.regimeMode,
            currentMode: REGIME_MODES[this.state.regimeMode],
            remainingCards: weekDeck,
            isCurrentWeek: mondayStr === todayMonday,
            weekStart: mondayStr
        };
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
