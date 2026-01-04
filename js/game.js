/**
 * Logique du jeu Discipline Nutrition
 */

class NutritionGame {
    constructor() {
        this.state = {
            points: 0,
            streak: 0,
            level: 1,
            lastPlayDate: null,
            regime: {
                type: 'balanced',
                goals: {
                    proteins: 3,
                    vegetables: 5,
                    fruits: 2,
                    grains: 3,
                    dairy: 2,
                    treats: 1
                }
            },
            history: [],
            todayMeals: {
                breakfast: [],
                lunch: [],
                dinner: [],
                snacks: []
            },
            challengesProgress: {},
            weeklyProgress: {}
        };

        this.loadState();
        this.checkNewDay();
    }

    /**
     * Charge l'état depuis localStorage
     */
    loadState() {
        const savedState = localStorage.getItem('nutritionGameState');
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                this.state = { ...this.state, ...parsed };
            } catch (e) {
                console.error('Erreur de chargement:', e);
            }
        }
    }

    /**
     * Sauvegarde l'état dans localStorage
     */
    saveState() {
        localStorage.setItem('nutritionGameState', JSON.stringify(this.state));
    }

    /**
     * Vérifie si c'est un nouveau jour
     */
    checkNewDay() {
        const today = this.getTodayString();

        if (this.state.lastPlayDate !== today) {
            // Vérifier le streak
            const yesterday = this.getYesterdayString();

            if (this.state.lastPlayDate === yesterday) {
                // Journée consécutive - vérifier si objectifs atteints hier
                if (this.wasYesterdaySuccessful()) {
                    this.state.streak++;
                } else {
                    this.state.streak = 0;
                }
            } else if (this.state.lastPlayDate !== null) {
                // Journée manquée
                this.state.streak = 0;
            }

            // Archiver les repas d'hier
            if (this.state.lastPlayDate) {
                this.archiveDay(this.state.lastPlayDate);
            }

            // Réinitialiser pour aujourd'hui
            this.state.todayMeals = {
                breakfast: [],
                lunch: [],
                dinner: [],
                snacks: []
            };
            this.state.challengesProgress = {};
            this.state.lastPlayDate = today;

            // Réinitialiser les défis hebdomadaires si nouvelle semaine
            if (this.isNewWeek()) {
                this.state.weeklyProgress = {};
            }

            this.saveState();
        }
    }

    /**
     * Archive les repas d'un jour
     */
    archiveDay(dateString) {
        const dayData = {
            date: dateString,
            meals: { ...this.state.todayMeals },
            points: this.calculateDailyPoints(),
            compliance: this.calculateCompliance()
        };

        this.state.history.push(dayData);

        // Garder seulement les 30 derniers jours
        if (this.state.history.length > 30) {
            this.state.history.shift();
        }
    }

    /**
     * Vérifie si hier était un succès
     */
    wasYesterdaySuccessful() {
        return this.calculateCompliance() >= 70;
    }

    /**
     * Vérifie si c'est une nouvelle semaine
     */
    isNewWeek() {
        const today = new Date();
        return today.getDay() === 1; // Lundi
    }

    /**
     * Obtient la date d'aujourd'hui en string
     */
    getTodayString() {
        return new Date().toISOString().split('T')[0];
    }

    /**
     * Obtient la date d'hier en string
     */
    getYesterdayString() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split('T')[0];
    }

    /**
     * Ajoute un aliment à un repas
     */
    addFoodToMeal(foodId, mealType) {
        const food = FOOD_CARDS.find(f => f.id === foodId);
        if (!food) return null;

        const entry = {
            ...food,
            timestamp: Date.now(),
            id: `${foodId}_${Date.now()}`
        };

        this.state.todayMeals[mealType].push(entry);

        // Mettre à jour les points
        this.state.points += food.points;

        // Mettre à jour le niveau
        this.updateLevel();

        // Mettre à jour les défis
        this.updateChallengesProgress();

        this.saveState();

        return {
            food: entry,
            message: food.points >= 0
                ? MOTIVATION_MESSAGES[Math.floor(Math.random() * MOTIVATION_MESSAGES.length)]
                : WARNING_MESSAGES[Math.floor(Math.random() * WARNING_MESSAGES.length)]
        };
    }

    /**
     * Retire un aliment d'un repas
     */
    removeFoodFromMeal(entryId, mealType) {
        const index = this.state.todayMeals[mealType].findIndex(f => f.id === entryId);
        if (index === -1) return false;

        const food = this.state.todayMeals[mealType][index];
        this.state.points -= food.points;
        this.state.todayMeals[mealType].splice(index, 1);

        this.updateLevel();
        this.updateChallengesProgress();
        this.saveState();

        return true;
    }

    /**
     * Met à jour le niveau du joueur
     */
    updateLevel() {
        for (let i = LEVELS.length - 1; i >= 0; i--) {
            if (this.state.points >= LEVELS[i].minPoints) {
                if (this.state.level !== LEVELS[i].level) {
                    const oldLevel = this.state.level;
                    this.state.level = LEVELS[i].level;

                    if (this.state.level > oldLevel) {
                        return {
                            levelUp: true,
                            newLevel: LEVELS[i]
                        };
                    }
                }
                break;
            }
        }
        return null;
    }

    /**
     * Obtient les infos du niveau actuel
     */
    getCurrentLevel() {
        return LEVELS.find(l => l.level === this.state.level) || LEVELS[0];
    }

    /**
     * Calcule les points du jour
     */
    calculateDailyPoints() {
        let total = 0;
        Object.values(this.state.todayMeals).forEach(meal => {
            meal.forEach(food => {
                total += food.points;
            });
        });
        return total;
    }

    /**
     * Compte les portions par catégorie
     */
    countByCategory(category) {
        let count = 0;
        Object.values(this.state.todayMeals).forEach(meal => {
            meal.forEach(food => {
                if (food.category === category) {
                    count++;
                }
            });
        });
        return count;
    }

    /**
     * Calcule le taux de respect du régime
     */
    calculateCompliance() {
        const goals = this.state.regime.goals;
        let achieved = 0;
        let total = 0;

        // Vérifier chaque objectif
        Object.entries(goals).forEach(([category, target]) => {
            const count = this.countByCategory(category);

            if (category === 'treats') {
                // Pour les plaisirs, moins c'est mieux
                if (count <= target) {
                    achieved++;
                }
            } else {
                // Pour les autres, atteindre ou dépasser
                if (count >= target) {
                    achieved++;
                } else {
                    achieved += count / target;
                }
            }
            total++;
        });

        return Math.round((achieved / total) * 100);
    }

    /**
     * Met à jour la progression des défis
     */
    updateChallengesProgress() {
        // Défis quotidiens
        DAILY_CHALLENGES.forEach(challenge => {
            if (challenge.category) {
                this.state.challengesProgress[challenge.id] = this.countByCategory(challenge.category);
            } else if (challenge.targetFood) {
                let count = 0;
                Object.values(this.state.todayMeals).forEach(meal => {
                    meal.forEach(food => {
                        if (food.id.startsWith(challenge.targetFood)) {
                            count++;
                        }
                    });
                });
                this.state.challengesProgress[challenge.id] = count;
            } else if (challenge.special === 'balanced_breakfast') {
                const breakfast = this.state.todayMeals.breakfast;
                const hasProtein = breakfast.some(f => f.category === 'proteins');
                const hasFruit = breakfast.some(f => f.category === 'fruits');
                const hasGrain = breakfast.some(f => f.category === 'grains');
                this.state.challengesProgress[challenge.id] = (hasProtein && hasFruit && hasGrain) ? 1 : 0;
            }
        });

        // Défis hebdomadaires (cumulatifs)
        WEEKLY_CHALLENGES.forEach(challenge => {
            if (challenge.category) {
                const dailyCount = this.countByCategory(challenge.category);
                this.state.weeklyProgress[challenge.id] = (this.state.weeklyProgress[challenge.id] || 0) + dailyCount;
            } else if (challenge.special === 'streak') {
                this.state.weeklyProgress[challenge.id] = this.state.streak;
            }
        });
    }

    /**
     * Vérifie les défis complétés
     */
    getCompletedChallenges() {
        const completed = [];

        DAILY_CHALLENGES.forEach(challenge => {
            const progress = this.state.challengesProgress[challenge.id] || 0;

            if (challenge.maxAllowed !== undefined) {
                if (progress <= challenge.maxAllowed) {
                    completed.push(challenge);
                }
            } else if (progress >= challenge.target) {
                completed.push(challenge);
            }
        });

        return completed;
    }

    /**
     * Obtient la progression de tous les défis
     */
    getChallengesWithProgress() {
        const daily = DAILY_CHALLENGES.map(challenge => {
            const progress = this.state.challengesProgress[challenge.id] || 0;
            let isCompleted = false;
            let percentage = 0;

            if (challenge.maxAllowed !== undefined) {
                isCompleted = progress <= challenge.maxAllowed;
                percentage = isCompleted ? 100 : 0;
            } else {
                isCompleted = progress >= challenge.target;
                percentage = Math.min(100, (progress / challenge.target) * 100);
            }

            return {
                ...challenge,
                progress,
                isCompleted,
                percentage
            };
        });

        const weekly = WEEKLY_CHALLENGES.map(challenge => {
            const progress = this.state.weeklyProgress[challenge.id] || 0;
            let isCompleted = false;
            let percentage = 0;

            if (challenge.maxAllowed !== undefined) {
                isCompleted = progress <= challenge.maxAllowed;
                percentage = isCompleted ? 100 : Math.max(0, 100 - (progress - challenge.maxAllowed) * 20);
            } else {
                isCompleted = progress >= challenge.target;
                percentage = Math.min(100, (progress / challenge.target) * 100);
            }

            return {
                ...challenge,
                progress,
                isCompleted,
                percentage
            };
        });

        return { daily, weekly };
    }

    /**
     * Sauvegarde les paramètres du régime
     */
    saveRegimeSettings(type, goals) {
        this.state.regime.type = type;
        this.state.regime.goals = goals;
        this.saveState();
    }

    /**
     * Obtient les statistiques
     */
    getStats() {
        return {
            points: this.state.points,
            streak: this.state.streak,
            level: this.state.level,
            levelInfo: this.getCurrentLevel(),
            dailyPoints: this.calculateDailyPoints(),
            compliance: this.calculateCompliance(),
            todayMeals: this.state.todayMeals,
            regime: this.state.regime
        };
    }

    /**
     * Obtient l'historique
     */
    getHistory() {
        return this.state.history;
    }

    /**
     * Réinitialise le jeu
     */
    reset() {
        localStorage.removeItem('nutritionGameState');
        this.state = {
            points: 0,
            streak: 0,
            level: 1,
            lastPlayDate: null,
            regime: {
                type: 'balanced',
                goals: {
                    proteins: 3,
                    vegetables: 5,
                    fruits: 2,
                    grains: 3,
                    dairy: 2,
                    treats: 1
                }
            },
            history: [],
            todayMeals: {
                breakfast: [],
                lunch: [],
                dinner: [],
                snacks: []
            },
            challengesProgress: {},
            weeklyProgress: {}
        };
        this.saveState();
    }
}

// Instance globale du jeu
const game = new NutritionGame();
