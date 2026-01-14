/**
 * Discipline Nutrition - Logique du jeu
 */
class NutritionGame {
    constructor() {
        this.state = { regimeMode: 'lowcarb', customDeck: null, weeks: {}, days: {} };
        this.initPromise = this.init();
    }

    async init() {
        await window.storage.migrateFromLocalStorage('disciplineNutritionState');
        const saved = await window.storage.get('disciplineNutritionState');
        if (saved) this.state = { ...this.state, ...saved };
        return this.state;
    }

    async ensureInitialized() { await this.initPromise; }
    async saveState() { await window.storage.set('disciplineNutritionState', this.state); }

    formatDate(d) { 
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    getMondayOfWeek(d = new Date()) {
        const date = new Date(d);
        const day = date.getDay();
        date.setDate(date.getDate() + (day === 0 ? -6 : 1 - day));
        return this.formatDate(date);
    }

    getTodayString() { return this.formatDate(new Date()); }
    parseDate(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }

    getWeekDeck(monday) {
        if (!this.state.weeks[monday]) this.initWeek(monday);
        return this.state.weeks[monday].remainingCards;
    }

    async initWeek(monday) {
        const mode = REGIME_MODES[this.state.regimeMode];
        this.state.weeks[monday] = { 
            remainingCards: { ...(this.state.regimeMode === 'custom' ? this.state.customDeck : mode?.deck || { discipline: 10, flex: 8, joker: 3 }) } 
        };
        await this.saveState();
    }

    getDayMeals(date) { return this.state.days[date]?.meals || { breakfast: null, lunch: null, dinner: null }; }

    async playCard(date, mealType, cardType) {
        await this.ensureInitialized();
        if (!this.state.days[date]) this.state.days[date] = { meals: { breakfast: null, lunch: null, dinner: null } };
        const dayMeals = this.state.days[date].meals;
        if (dayMeals[mealType]) return { success: false, message: 'Repas déjà pris' };

        if (cardType !== 'fasting') {
            const monday = this.getMondayOfWeek(this.parseDate(date));
            const deck = this.getWeekDeck(monday);
            if (deck[cardType] <= 0) return { success: false, message: `Plus de cartes ${CARD_TYPES[cardType].name} !` };
            deck[cardType]--;
        }

        dayMeals[mealType] = { type: cardType, timestamp: Date.now() };
        await this.saveState();
        return { success: true };
    }

    async cancelCard(date, mealType) {
        await this.ensureInitialized();
        const meal = this.state.days[date]?.meals[mealType];
        if (!meal) return { success: false };

        if (meal.type !== 'fasting') {
            this.getWeekDeck(this.getMondayOfWeek(this.parseDate(date)))[meal.type]++;
        }
        this.state.days[date].meals[mealType] = null;
        await this.saveState();
        return { success: true };
    }

    getDaySummary(date) {
        const meals = this.getDayMeals(date);
        const summary = { total: 3, filled: 0, cards: { discipline: 0, flex: 0, joker: 0, fasting: 0 } };
        Object.values(meals).forEach(m => m && (summary.filled++, summary.cards[m.type]++));
        return summary;
    }

    getWeekDays(mondayStr) {
        const monday = this.parseDate(mondayStr);
        const today = this.getTodayString();
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(monday);
            d.setDate(d.getDate() + i);
            const ds = this.formatDate(d);
            return { date: ds, dayOfWeek: d.getDay(), dayNumber: d.getDate(), isToday: ds === today, meals: this.getDayMeals(ds), summary: this.getDaySummary(ds) };
        });
    }

    async setRegimeMode(modeId, deck = null) {
        await this.ensureInitialized();
        this.state.regimeMode = modeId;
        if (deck) this.state.customDeck = deck;
        await this.saveState();
    }

    async resetWeekDeck(monday) {
        await this.ensureInitialized();
        delete this.state.weeks[monday];
        await this.initWeek(monday);
    }

    getStateForWeek(monday) {
        return { regimeMode: this.state.regimeMode, currentMode: REGIME_MODES[this.state.regimeMode], remainingCards: this.getWeekDeck(monday), isCurrentWeek: monday === this.getMondayOfWeek(), weekStart: monday };
    }

    async reset() {
        await window.storage.delete('disciplineNutritionState');
        ['disciplineNutritionState', 'darkMode', 'onboardingComplete'].forEach(k => localStorage.removeItem(k));
        location.reload();
    }
}

const game = new NutritionGame();
