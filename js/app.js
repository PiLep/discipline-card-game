/**
 * Discipline Nutrition - Interface Hearthstone avec Drag & Drop
 */

class App {
    constructor() {
        this.selectedDate = game.getTodayString();
        this.displayedWeekMonday = game.getMondayOfWeek();
        this.draggedCard = null;
        this.init();
    }

    init() {
        this.initTheme();
        this.renderRegimeSelector();
        this.bindEvents();
        this.renderCalendar();
        this.renderHand();
        this.renderMealSlots();
        this.updateUI();
        this.initOnboarding();
    }

    getDayNames() {
        return ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    }

    getMonthNames() {
        return ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    }

    bindEvents() {
        // Navigation calendrier
        document.getElementById('prev-week').addEventListener('click', () => this.navigateWeek(-1));
        document.getElementById('next-week').addEventListener('click', () => this.navigateWeek(1));

        // Swipe navigation sur le calendrier
        this.setupSwipeNavigation();

        // Settings
        document.getElementById('settings-toggle').addEventListener('click', () => {
            document.getElementById('settings-panel').classList.add('active');
        });
        document.getElementById('close-settings').addEventListener('click', () => {
            document.getElementById('settings-panel').classList.remove('active');
        });
        document.getElementById('settings-panel').addEventListener('click', (e) => {
            if (e.target.id === 'settings-panel') {
                document.getElementById('settings-panel').classList.remove('active');
            }
        });
        document.getElementById('save-custom').addEventListener('click', () => this.saveCustomDeck());

        // Dark mode toggle
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        darkModeToggle.addEventListener('change', () => this.toggleDarkMode(darkModeToggle.checked));

        // Restart tutorial
        document.getElementById('restart-tuto').addEventListener('click', () => this.restartTutorial());

        // Setup drop zones
        this.setupDropZones();
    }

    initTheme() {
        const savedTheme = localStorage.getItem('darkMode');
        const isDarkMode = savedTheme === null ? true : savedTheme === 'true';
        document.getElementById('dark-mode-toggle').checked = isDarkMode;
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        }
    }

    toggleDarkMode(enabled) {
        document.body.classList.toggle('dark-mode', enabled);
        localStorage.setItem('darkMode', enabled);
    }

    setupSwipeNavigation() {
        const calendar = document.querySelector('.calendar-section');
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        calendar.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        calendar.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
        }, { passive: true });
    }

    handleSwipe(startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 50;

        // Vérifier que c'est un swipe horizontal (pas vertical)
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                // Swipe vers la droite = semaine précédente
                this.navigateWeek(-1);
            } else {
                // Swipe vers la gauche = semaine suivante
                this.navigateWeek(1);
            }
        }
    }

    setupDropZones() {
        const dropZones = document.querySelectorAll('.meal-drop-zone');

        dropZones.forEach(zone => {
            // Desktop drag events
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('drag-over');
            });

            zone.addEventListener('dragleave', (e) => {
                // Only remove if actually leaving the zone (not entering a child)
                if (!zone.contains(e.relatedTarget)) {
                    zone.classList.remove('drag-over');
                }
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                const mealType = zone.dataset.meal;
                if (this.draggedCard) {
                    this.playCard(mealType, this.draggedCard);
                    this.draggedCard = null;
                }
            });
        });
    }

    navigateWeek(direction) {
        const current = game.parseDate(this.displayedWeekMonday);
        current.setDate(current.getDate() + (direction * 7));
        this.displayedWeekMonday = game.formatDate(current);

        const todayMonday = game.getMondayOfWeek();
        if (this.displayedWeekMonday === todayMonday) {
            this.selectedDate = game.getTodayString();
        } else {
            this.selectedDate = this.displayedWeekMonday;
        }

        this.renderCalendar();
        this.renderHand();
        this.renderMealSlots();
        this.updateUI();
    }

    renderCalendar() {
        const weekDays = game.getWeekDays(this.displayedWeekMonday);
        const grid = document.getElementById('calendar-grid');
        const dayNames = this.getDayNames();

        // Week label
        const monday = game.parseDate(this.displayedWeekMonday);
        const sunday = new Date(monday);
        sunday.setDate(sunday.getDate() + 6);
        const monthNames = this.getMonthNames();
        const todayMonday = game.getMondayOfWeek();

        let weekLabel = monday.getMonth() === sunday.getMonth()
            ? `${monday.getDate()} - ${sunday.getDate()} ${monthNames[monday.getMonth()]}`
            : `${monday.getDate()} ${monthNames[monday.getMonth()].slice(0, 3)} - ${sunday.getDate()} ${monthNames[sunday.getMonth()].slice(0, 3)}`;

        // Week status indicator
        let weekStatus = '';
        if (this.displayedWeekMonday === todayMonday) {
            weekStatus = '<span class="week-status current">Semaine en cours</span>';
        } else if (this.displayedWeekMonday < todayMonday) {
            weekStatus = '<span class="week-status past">Semaine passée</span>';
        } else {
            weekStatus = '<span class="week-status future">Semaine future</span>';
        }

        document.getElementById('week-label').innerHTML = `${weekLabel} ${weekStatus}`;

        grid.innerHTML = '';

        weekDays.forEach(day => {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            if (day.isToday) dayEl.classList.add('today');
            if (day.date === this.selectedDate) dayEl.classList.add('selected');

            let statusDots = '';
            Object.values(day.meals).forEach(meal => {
                statusDots += meal
                    ? `<span class="status-dot ${meal.type}"></span>`
                    : `<span class="status-dot empty"></span>`;
            });

            dayEl.innerHTML = `
                <span class="day-name">${dayNames[day.dayOfWeek]}</span>
                <span class="day-number">${day.dayNumber}</span>
                <div class="day-status">${statusDots}</div>
            `;

            dayEl.addEventListener('click', () => this.selectDate(day.date));
            grid.appendChild(dayEl);
        });
    }

    selectDate(dateStr) {
        this.selectedDate = dateStr;
        this.renderCalendar();
        this.renderHand();
        this.renderMealSlots();
        this.updateUI();
    }

    renderHand() {
        const hand = document.getElementById('card-hand');
        const mondayStr = game.getMondayForDate(this.selectedDate);
        const weekState = game.getStateForWeek(mondayStr);
        const deck = weekState.remainingCards;

        hand.innerHTML = '';

        // Cartes dans la main
        const cards = [
            { type: 'discipline', ...CARD_TYPES.discipline, count: deck.discipline },
            { type: 'flex', ...CARD_TYPES.flex, count: deck.flex },
            { type: 'joker', ...CARD_TYPES.joker, count: deck.joker },
            { type: 'fasting', ...FASTING_OPTION, count: '∞' }
        ];

        const totalCards = cards.length;
        cards.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = `hand-card ${card.type}`;
            cardEl.draggable = true;

            // Arc effect: rotation and vertical offset (responsive)
            const isMobile = window.innerWidth <= 480;
            const isTablet = window.innerWidth <= 768 && window.innerWidth > 480;

            const centerIndex = (totalCards - 1) / 2;
            const offset = index - centerIndex;
            const rotation = offset * 5; // 5 degrees per card from center
            const yOffset = Math.abs(offset) * 12; // Cards on edges are lower

            // Different baseY for different screen sizes
            const baseY = isMobile ? 60 : isTablet ? 100 : 150;

            cardEl.style.setProperty('--card-rotation', `${rotation}deg`);
            cardEl.style.setProperty('--card-y', `${baseY + yOffset}px`);
            cardEl.style.transform = `translateY(${baseY + yOffset}px) rotate(${rotation}deg)`;

            const isDisabled = card.type !== 'fasting' && card.count === 0;
            if (isDisabled) {
                cardEl.classList.add('disabled');
                cardEl.draggable = false;
            }

            cardEl.innerHTML = `
                ${card.type !== 'fasting' ? `<span class="card-count">${card.count}</span>` : ''}
                <img class="card-image" src="${card.image}" alt="${card.name}" draggable="false">
            `;

            if (!isDisabled) {
                // Drag events
                cardEl.addEventListener('dragstart', (e) => {
                    this.draggedCard = card.type;
                    cardEl.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'move';
                });

                cardEl.addEventListener('dragend', () => {
                    this.draggedCard = null;
                    cardEl.classList.remove('dragging');
                    document.querySelectorAll('.meal-drop-zone').forEach(z => z.classList.remove('drag-over'));
                });

                // Touch events for mobile
                let touchGhost = null;
                let touchStarted = false;

                cardEl.addEventListener('touchstart', (e) => {
                    // Skip if disabled (but allow fasting which has '∞')
                    if (card.type !== 'fasting' && card.count <= 0) return;

                    touchStarted = true;
                    this.draggedCard = card.type;
                    cardEl.classList.add('dragging');

                    // Créer un ghost qui suit le doigt
                    touchGhost = cardEl.cloneNode(true);
                    touchGhost.classList.add('touch-ghost');
                    touchGhost.style.cssText = `
                        position: fixed;
                        pointer-events: none;
                        z-index: 1000;
                        width: ${cardEl.offsetWidth}px;
                        height: ${cardEl.offsetHeight}px;
                        opacity: 0.9;
                        transform: scale(1.1) rotate(5deg);
                        transition: none;
                    `;
                    document.body.appendChild(touchGhost);

                    const touch = e.touches[0];
                    touchGhost.style.left = (touch.clientX - cardEl.offsetWidth / 2) + 'px';
                    touchGhost.style.top = (touch.clientY - cardEl.offsetHeight / 2) + 'px';
                }, { passive: true });

                cardEl.addEventListener('touchmove', (e) => {
                    if (!touchStarted) return;
                    e.preventDefault();

                    const touch = e.touches[0];

                    // Déplacer le ghost
                    if (touchGhost) {
                        touchGhost.style.left = (touch.clientX - cardEl.offsetWidth / 2) + 'px';
                        touchGhost.style.top = (touch.clientY - cardEl.offsetHeight / 2) + 'px';
                    }

                    // Highlight drop zone sous le doigt (par coordonnées, pas elementFromPoint)
                    document.querySelectorAll('.meal-drop-zone').forEach(z => {
                        const rect = z.getBoundingClientRect();
                        if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                            touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                            z.classList.add('drag-over');
                        } else {
                            z.classList.remove('drag-over');
                        }
                    });
                }, { passive: false });

                cardEl.addEventListener('touchend', (e) => {
                    if (!touchStarted) return;
                    touchStarted = false;

                    cardEl.classList.remove('dragging');

                    // Supprimer le ghost
                    if (touchGhost) {
                        touchGhost.remove();
                        touchGhost = null;
                    }

                    const touch = e.changedTouches[0];

                    // Trouver la drop zone par coordonnées
                    let targetZone = null;
                    document.querySelectorAll('.meal-drop-zone').forEach(z => {
                        const rect = z.getBoundingClientRect();
                        if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                            touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                            targetZone = z;
                        }
                        z.classList.remove('drag-over');
                    });

                    if (targetZone) {
                        const mealType = targetZone.dataset.meal;
                        this.playCard(mealType, this.draggedCard);
                    }
                    this.draggedCard = null;
                });

                cardEl.addEventListener('touchcancel', () => {
                    touchStarted = false;
                    cardEl.classList.remove('dragging');
                    if (touchGhost) {
                        touchGhost.remove();
                        touchGhost = null;
                    }
                    this.draggedCard = null;
                    document.querySelectorAll('.meal-drop-zone').forEach(z => z.classList.remove('drag-over'));
                });

                // Click fallback
                cardEl.addEventListener('click', () => {
                    this.showCardOptions(card.type);
                });
            }

            hand.appendChild(cardEl);
        });

        // Info deck
        const deckInfo = document.getElementById('deck-info');
        const todayMonday = game.getMondayOfWeek();
        if (mondayStr === todayMonday) {
            deckInfo.innerHTML = `<span class="cta-hint">Glisse une carte sur un repas</span>`;
        } else if (mondayStr < todayMonday) {
            deckInfo.innerHTML = `<span class="week-past-hint">Semaine passée</span>`;
        } else {
            deckInfo.innerHTML = `<span class="week-future-hint">Semaine future</span>`;
        }
    }

    showCardOptions(cardType) {
        // Si on clique sur une carte, montrer les repas disponibles
        const meals = game.getDayMeals(this.selectedDate);
        const availableMeals = Object.entries(meals)
            .filter(([_, meal]) => meal === null)
            .map(([type, _]) => type);

        if (availableMeals.length === 0) {
            this.showToast('Tous les repas sont déjà remplis', true);
            return;
        }

        if (availableMeals.length === 1) {
            this.playCard(availableMeals[0], cardType);
        } else {
            // Highlight les zones disponibles
            document.querySelectorAll('.meal-drop-zone').forEach(zone => {
                if (availableMeals.includes(zone.dataset.meal)) {
                    zone.classList.add('drag-over');
                    setTimeout(() => zone.classList.remove('drag-over'), 1000);
                }
            });
            this.showToast('Choisis un repas');
        }
    }

    renderMealSlots() {
        const meals = game.getDayMeals(this.selectedDate);

        Object.entries(meals).forEach(([mealType, meal]) => {
            const slot = document.getElementById(`slot-${mealType}`);

            if (meal) {
                const cardInfo = meal.type === 'fasting' ? FASTING_OPTION : CARD_TYPES[meal.type];
                slot.innerHTML = `
                    <div class="played-card-mini ${meal.type}">
                        <img class="card-image" src="${cardInfo.image}" alt="${cardInfo.name}" draggable="false">
                        <button class="remove-btn">&times;</button>
                    </div>
                `;

                slot.querySelector('.remove-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.cancelCard(mealType);
                });
            } else {
                slot.innerHTML = `<span class="empty-slot">Glisse une carte ici</span>`;
            }
        });
    }

    playCard(mealType, cardType) {
        const result = game.playCard(this.selectedDate, mealType, cardType);

        if (result.success) {
            this.renderCalendar();
            this.renderHand();
            this.renderMealSlots();
        } else {
            this.showToast(result.message, true);
        }
    }

    cancelCard(mealType) {
        const result = game.cancelCard(this.selectedDate, mealType);

        if (result.success) {
            this.renderCalendar();
            this.renderHand();
            this.renderMealSlots();
            this.showToast('Carte annulée');
        }
    }

    updateUI() {
        const today = game.getTodayString();
        const titleEl = document.getElementById('selected-date-title');
        const selectedDate = game.parseDate(this.selectedDate);
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        let dateTitle = selectedDate.toLocaleDateString('fr-FR', options);
        dateTitle = dateTitle.charAt(0).toUpperCase() + dateTitle.slice(1);

        titleEl.innerHTML = this.selectedDate === today
            ? `${dateTitle} <span class="today-badge">Aujourd'hui</span>`
            : dateTitle;
    }

    renderRegimeSelector() {
        const container = document.getElementById('regime-selector');
        const weekState = game.getStateForWeek(this.displayedWeekMonday);

        container.innerHTML = '';

        Object.values(REGIME_MODES).forEach(mode => {
            const btn = document.createElement('button');
            btn.className = `regime-btn ${weekState.regimeMode === mode.id ? 'active' : ''}`;
            btn.textContent = mode.name;
            btn.addEventListener('click', (e) => this.selectRegime(mode.id, e));
            container.appendChild(btn);
        });

        const customDeck = document.getElementById('custom-deck');
        customDeck.style.display = weekState.regimeMode === 'custom' ? 'block' : 'none';
    }

    selectRegime(modeId, event) {
        if (modeId === 'custom') {
            document.getElementById('custom-deck').style.display = 'block';
        } else {
            game.setRegimeMode(modeId);
            document.getElementById('custom-deck').style.display = 'none';
        }

        document.querySelectorAll('.regime-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        this.renderHand();
    }

    saveCustomDeck() {
        const customDeck = {
            discipline: parseInt(document.getElementById('custom-discipline').value) || 0,
            flex: parseInt(document.getElementById('custom-flex').value) || 0,
            joker: parseInt(document.getElementById('custom-joker').value) || 0
        };

        game.setRegimeMode('custom', customDeck);
        this.renderHand();
        this.showToast('Deck personnalisé appliqué !');
        document.getElementById('settings-panel').classList.remove('active');
    }

    showToast(message, isError = false) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.toggle('error', isError);
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    // Onboarding
    initOnboarding() {
        const onboardingComplete = localStorage.getItem('onboardingComplete');
        const onboarding = document.getElementById('onboarding');

        // Always render and bind (needed for restart tutorial)
        this.renderOnboardingRegimes();
        this.bindOnboardingEvents();

        // Hide if already completed
        if (onboardingComplete) {
            onboarding.style.display = 'none';
        }
    }

    renderOnboardingRegimes() {
        const container = document.getElementById('onboarding-regimes');
        container.innerHTML = '';

        // Exclude 'custom' from onboarding
        const regimes = Object.values(REGIME_MODES).filter(r => r.id !== 'custom');

        regimes.forEach(regime => {
            const el = document.createElement('div');
            el.className = 'onboarding-regime';
            el.dataset.regime = regime.id;
            el.innerHTML = `
                <span class="regime-radio"></span>
                <div class="regime-info">
                    <strong>${regime.name}</strong>
                    <p>${regime.description}</p>
                    <span class="regime-hint">${regime.hint}</span>
                </div>
            `;
            el.addEventListener('click', () => this.selectOnboardingRegime(regime.id));
            container.appendChild(el);
        });
    }

    selectOnboardingRegime(regimeId) {
        // Update UI
        document.querySelectorAll('.onboarding-regime').forEach(el => {
            el.classList.toggle('selected', el.dataset.regime === regimeId);
        });

        // Store selection
        this.selectedOnboardingRegime = regimeId;

        // Enable continue button
        document.getElementById('onboarding-regime-btn').disabled = false;
    }

    bindOnboardingEvents() {
        // Next step buttons
        document.querySelectorAll('.onboarding-btn[data-next]').forEach(btn => {
            btn.addEventListener('click', () => {
                const nextStep = btn.dataset.next;
                this.goToOnboardingStep(nextStep);
            });
        });

        // Finish button
        document.getElementById('onboarding-finish').addEventListener('click', () => {
            this.completeOnboarding();
        });
    }

    goToOnboardingStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.onboarding-step').forEach(step => {
            step.style.display = 'none';
        });

        // Show target step
        const targetStep = document.querySelector(`.onboarding-step[data-step="${stepNumber}"]`);
        if (targetStep) {
            targetStep.style.display = 'block';
            // Re-trigger animation
            targetStep.style.animation = 'none';
            targetStep.offsetHeight; // Trigger reflow
            targetStep.style.animation = 'fadeInUp 0.4s ease-out';
        }
    }

    completeOnboarding() {
        // Apply selected regime
        if (this.selectedOnboardingRegime) {
            game.setRegimeMode(this.selectedOnboardingRegime);
            this.renderRegimeSelector();
            this.renderHand();
        }

        // Mark onboarding as complete
        localStorage.setItem('onboardingComplete', 'true');

        // Hide onboarding with animation
        const onboarding = document.getElementById('onboarding');
        onboarding.classList.add('hidden');
        setTimeout(() => {
            onboarding.style.display = 'none';
        }, 300);
    }

    restartTutorial() {
        // Close settings panel
        document.getElementById('settings-panel').classList.remove('active');

        // Reset onboarding state
        this.selectedOnboardingRegime = null;

        // Reset UI
        document.querySelectorAll('.onboarding-regime').forEach(el => {
            el.classList.remove('selected');
        });
        document.getElementById('onboarding-regime-btn').disabled = true;

        // Go to step 1
        this.goToOnboardingStep(1);

        // Show onboarding
        const onboarding = document.getElementById('onboarding');
        onboarding.style.display = 'flex';
        onboarding.classList.remove('hidden');
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
