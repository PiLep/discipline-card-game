/**
 * Application Discipline Nutrition - Interface utilisateur
 */

class NutritionApp {
    constructor() {
        this.currentMealType = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateUI();
        this.displayDate();
        this.renderCollection();
        this.renderChallenges();
        this.loadRegimeSettings();
    }

    /**
     * Lie les événements
     */
    bindEvents() {
        // Onglets
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Boutons d'ajout de carte
        document.querySelectorAll('.add-card-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.openAddCardModal(e.target.dataset.meal));
        });

        // Fermeture des modales
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModals();
            });
        });

        // Recherche d'aliments
        document.getElementById('search-food').addEventListener('input', (e) => {
            this.filterFoodCards(e.target.value);
        });

        // Sauvegarde du régime
        document.getElementById('save-regime').addEventListener('click', () => this.saveRegime());

        // Fermer modal félicitations
        document.querySelector('.close-congrats-btn').addEventListener('click', () => {
            document.getElementById('congrats-modal').classList.remove('active');
        });

        // Filtres collection
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterCollection(e.target.dataset.filter));
        });
    }

    /**
     * Change d'onglet
     */
    switchTab(tabId) {
        // Mettre à jour les onglets
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });

        // Mettre à jour le contenu
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabId);
        });

        // Rafraîchir les données si nécessaire
        if (tabId === 'defis') {
            this.renderChallenges();
        } else if (tabId === 'collection') {
            this.renderCollection();
        }
    }

    /**
     * Affiche la date du jour
     */
    displayDate() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const today = new Date().toLocaleDateString('fr-FR', options);
        document.getElementById('current-date').textContent = today.charAt(0).toUpperCase() + today.slice(1);
    }

    /**
     * Met à jour l'interface
     */
    updateUI() {
        const stats = game.getStats();

        // Stats header
        document.getElementById('streak').textContent = stats.streak;
        document.getElementById('points').textContent = stats.points;
        document.getElementById('level').textContent = stats.level;

        // Points du jour
        document.getElementById('daily-points').textContent = stats.dailyPoints;
        document.getElementById('compliance').textContent = stats.compliance + '%';

        // Repas
        this.renderMeal('breakfast', stats.todayMeals.breakfast);
        this.renderMeal('lunch', stats.todayMeals.lunch);
        this.renderMeal('dinner', stats.todayMeals.dinner);
        this.renderMeal('snacks', stats.todayMeals.snacks);
    }

    /**
     * Affiche les cartes d'un repas
     */
    renderMeal(mealType, foods) {
        const container = document.getElementById(`${mealType}-cards`);
        container.innerHTML = '';

        foods.forEach(food => {
            const card = this.createFoodCard(food, mealType);
            container.appendChild(card);
        });
    }

    /**
     * Crée une carte d'aliment
     */
    createFoodCard(food, mealType) {
        const card = document.createElement('div');
        card.className = `food-card ${food.category}`;
        card.innerHTML = `
            <span class="emoji">${food.emoji}</span>
            <span class="name">${food.name}</span>
            <span class="points ${food.points < 0 ? 'negative' : ''}">${food.points > 0 ? '+' : ''}${food.points} pts</span>
            <button class="remove-btn" title="Retirer">&times;</button>
        `;

        card.querySelector('.remove-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeFood(food.id, mealType);
        });

        return card;
    }

    /**
     * Retire un aliment
     */
    removeFood(entryId, mealType) {
        game.removeFoodFromMeal(entryId, mealType);
        this.updateUI();
        this.renderChallenges();
    }

    /**
     * Ouvre la modal d'ajout de carte
     */
    openAddCardModal(mealType) {
        this.currentMealType = mealType;
        document.getElementById('search-food').value = '';
        this.renderFoodGrid(FOOD_CARDS);
        document.getElementById('add-card-modal').classList.add('active');
    }

    /**
     * Ferme toutes les modales
     */
    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    /**
     * Affiche la grille d'aliments
     */
    renderFoodGrid(foods) {
        const grid = document.getElementById('food-cards-grid');
        grid.innerHTML = '';

        foods.forEach(food => {
            const card = document.createElement('div');
            card.className = 'selectable-card';
            card.innerHTML = `
                <span class="emoji">${food.emoji}</span>
                <span class="name">${food.name}</span>
            `;

            card.addEventListener('click', () => this.selectFood(food.id));
            grid.appendChild(card);
        });
    }

    /**
     * Filtre les cartes d'aliments
     */
    filterFoodCards(searchTerm) {
        const term = searchTerm.toLowerCase();
        const filtered = FOOD_CARDS.filter(food =>
            food.name.toLowerCase().includes(term) ||
            food.category.toLowerCase().includes(term)
        );
        this.renderFoodGrid(filtered);
    }

    /**
     * Sélectionne un aliment
     */
    selectFood(foodId) {
        const result = game.addFoodToMeal(foodId, this.currentMealType);

        if (result) {
            this.closeModals();
            this.updateUI();
            this.renderChallenges();

            // Vérifier level up
            const levelResult = game.updateLevel();
            if (levelResult && levelResult.levelUp) {
                this.showCongrats(
                    `🎉 Niveau ${levelResult.newLevel.level} !`,
                    `Tu es maintenant ${levelResult.newLevel.name} ${levelResult.newLevel.icon}`
                );
            }

            // Vérifier défis complétés
            this.checkNewCompletedChallenges();
        }
    }

    /**
     * Vérifie les nouveaux défis complétés
     */
    checkNewCompletedChallenges() {
        const challenges = game.getChallengesWithProgress();

        // Vérifier les défis quotidiens
        challenges.daily.forEach(challenge => {
            const storageKey = `challenge_${challenge.id}_${game.getTodayString()}`;
            if (challenge.isCompleted && !localStorage.getItem(storageKey)) {
                localStorage.setItem(storageKey, 'true');
                this.showCongrats(
                    `${challenge.icon} Défi complété !`,
                    `${challenge.title} - +${challenge.reward} points bonus !`
                );
                game.state.points += challenge.reward;
                game.saveState();
                this.updateUI();
            }
        });
    }

    /**
     * Affiche une modal de félicitations
     */
    showCongrats(title, message) {
        document.getElementById('congrats-title').textContent = title;
        document.getElementById('congrats-message').textContent = message;
        document.getElementById('congrats-modal').classList.add('active');
    }

    /**
     * Affiche les défis
     */
    renderChallenges() {
        const challenges = game.getChallengesWithProgress();

        // Défis quotidiens
        const dailyContainer = document.getElementById('daily-challenges');
        dailyContainer.innerHTML = '';

        challenges.daily.forEach(challenge => {
            const card = this.createChallengeCard(challenge);
            dailyContainer.appendChild(card);
        });

        // Défis hebdomadaires
        const weeklyContainer = document.getElementById('weekly-challenges');
        weeklyContainer.innerHTML = '';

        challenges.weekly.forEach(challenge => {
            const card = this.createChallengeCard(challenge, true);
            weeklyContainer.appendChild(card);
        });
    }

    /**
     * Crée une carte de défi
     */
    createChallengeCard(challenge, isWeekly = false) {
        const card = document.createElement('div');
        card.className = `challenge-card ${challenge.isCompleted ? 'completed' : ''}`;

        let progressText = '';
        if (challenge.maxAllowed !== undefined) {
            progressText = `${challenge.progress}/${challenge.maxAllowed} max`;
        } else {
            progressText = `${challenge.progress}/${challenge.target}`;
        }

        card.innerHTML = `
            <span class="challenge-icon">${challenge.icon}</span>
            <div class="challenge-content">
                <div class="challenge-title">${challenge.title}</div>
                <div class="challenge-progress">${progressText}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${challenge.percentage}%"></div>
                </div>
            </div>
            <span class="challenge-reward">+${challenge.reward}</span>
        `;

        return card;
    }

    /**
     * Affiche la collection
     */
    renderCollection(filter = 'all') {
        const grid = document.getElementById('collection-grid');
        grid.innerHTML = '';

        let cards = FOOD_CARDS;
        if (filter !== 'all') {
            cards = FOOD_CARDS.filter(food => food.category === filter);
        }

        cards.forEach(food => {
            const card = document.createElement('div');
            card.className = 'collection-card';
            card.innerHTML = `
                <span class="card-points ${food.points < 0 ? 'negative' : ''}">${food.points > 0 ? '+' : ''}${food.points}</span>
                <span class="emoji">${food.emoji}</span>
                <span class="name">${food.name}</span>
                <span class="category">${this.getCategoryName(food.category)}</span>
            `;
            grid.appendChild(card);
        });
    }

    /**
     * Filtre la collection
     */
    filterCollection(filter) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.renderCollection(filter);
    }

    /**
     * Obtient le nom de la catégorie
     */
    getCategoryName(category) {
        const names = {
            proteins: 'Protéines',
            vegetables: 'Légumes',
            fruits: 'Fruits',
            grains: 'Féculents',
            dairy: 'Laitiers',
            treats: 'Plaisirs'
        };
        return names[category] || category;
    }

    /**
     * Charge les paramètres du régime
     */
    loadRegimeSettings() {
        const stats = game.getStats();

        document.getElementById('regime-type').value = stats.regime.type;
        document.getElementById('goal-proteins').value = stats.regime.goals.proteins;
        document.getElementById('goal-vegetables').value = stats.regime.goals.vegetables;
        document.getElementById('goal-fruits').value = stats.regime.goals.fruits;
        document.getElementById('goal-grains').value = stats.regime.goals.grains;
        document.getElementById('goal-dairy').value = stats.regime.goals.dairy;
        document.getElementById('goal-treats').value = stats.regime.goals.treats;
    }

    /**
     * Sauvegarde le régime
     */
    saveRegime() {
        const type = document.getElementById('regime-type').value;
        const goals = {
            proteins: parseInt(document.getElementById('goal-proteins').value),
            vegetables: parseInt(document.getElementById('goal-vegetables').value),
            fruits: parseInt(document.getElementById('goal-fruits').value),
            grains: parseInt(document.getElementById('goal-grains').value),
            dairy: parseInt(document.getElementById('goal-dairy').value),
            treats: parseInt(document.getElementById('goal-treats').value)
        };

        game.saveRegimeSettings(type, goals);

        this.showCongrats(
            '✅ Régime sauvegardé !',
            'Tes objectifs ont été mis à jour.'
        );

        this.updateUI();
    }
}

// Initialiser l'application au chargement
document.addEventListener('DOMContentLoaded', () => {
    window.app = new NutritionApp();
});
