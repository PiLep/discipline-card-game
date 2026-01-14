/**
 * Discipline Nutrition - Interface Hearthstone avec Drag & Drop
 */
const $ = document.getElementById.bind(document);
const $$ = document.querySelectorAll.bind(document);

class App {
    constructor() {
        this.selectedDate = game.getTodayString();
        this.displayedWeekMonday = game.getMondayOfWeek();
        this.draggedCard = null;
        game.ensureInitialized().then(() => this.init());
    }

    init() {
        this.initTheme();
        this.bindEvents();
        this.renderAll();
        this.initOnboarding();
    }

    renderAll() {
        this.renderCalendar();
        this.renderHand();
        this.renderMealSlots();
        this.updateUI();
        this.renderRegimeSelector();
    }

    bindEvents() {
        $('prev-week').onclick = () => this.navigateWeek(-1);
        $('next-week').onclick = () => this.navigateWeek(1);
        $('settings-toggle').onclick = () => $('settings-panel').classList.add('active');
        $('close-settings').onclick = () => $('settings-panel').classList.remove('active');
        $('settings-panel').onclick = (e) => e.target.id === 'settings-panel' && $('settings-panel').classList.remove('active');
        $('save-custom').onclick = () => this.saveCustomDeck();
        $('dark-mode-toggle').onchange = (e) => this.toggleDarkMode(e.target.checked);
        $('restart-tuto').onclick = () => this.restartTutorial();
        this.setupSwipeNavigation();
        this.setupDropZones();
    }

    initTheme() {
        const dark = localStorage.getItem('darkMode') !== 'false';
        $('dark-mode-toggle').checked = dark;
        document.body.classList.toggle('dark-mode', dark);
    }

    toggleDarkMode(on) {
        document.body.classList.toggle('dark-mode', on);
        localStorage.setItem('darkMode', on);
    }

    setupSwipeNavigation() {
        let startX, startY;
        const cal = document.querySelector('.calendar-section');
        cal.ontouchstart = e => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; };
        cal.ontouchend = e => {
            const dx = e.changedTouches[0].clientX - startX;
            const dy = e.changedTouches[0].clientY - startY;
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) this.navigateWeek(dx > 0 ? -1 : 1);
        };
    }

    setupDropZones() {
        $$('.meal-drop-zone').forEach(z => {
            z.ondragover = e => { e.preventDefault(); z.classList.add('drag-over'); };
            z.ondragleave = () => z.classList.remove('drag-over');
            z.ondrop = e => {
                e.preventDefault();
                z.classList.remove('drag-over');
                if (this.draggedCard) { this.playCard(z.dataset.meal, this.draggedCard); this.draggedCard = null; }
            };
        });
    }

    navigateWeek(dir) {
        const d = game.parseDate(this.displayedWeekMonday);
        d.setDate(d.getDate() + dir * 7);
        this.displayedWeekMonday = game.formatDate(d);
        this.selectedDate = (this.displayedWeekMonday === game.getMondayOfWeek()) ? game.getTodayString() : this.displayedWeekMonday;
        this.renderAll();
    }

    renderCalendar() {
        const days = game.getWeekDays(this.displayedWeekMonday);
        const grid = $('calendar-grid');
        const monday = game.parseDate(this.displayedWeekMonday);
        const sunday = new Date(monday); sunday.setDate(sunday.getDate() + 6);
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
        
        const status = this.displayedWeekMonday === game.getMondayOfWeek() ? 'current' : (this.displayedWeekMonday < game.getMondayOfWeek() ? 'past' : 'future');
        const labels = { current: 'En cours', past: 'Terminée', future: 'À venir' };
        
        $('week-label').innerHTML = `${monday.getDate()} ${months[monday.getMonth()]} - ${sunday.getDate()} ${months[sunday.getMonth()]} ` +
            `<span class="week-status ${status}">${labels[status]}</span>`;

        grid.innerHTML = '';
        days.forEach(d => {
            const el = document.createElement('div');
            el.className = `calendar-day ${d.isToday ? 'today' : ''} ${d.date === this.selectedDate ? 'selected' : ''}`;
            el.innerHTML = `<span class="day-name">${['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][d.dayOfWeek]}</span>` +
                           `<span class="day-number">${d.dayNumber}</span>` +
                           `<div class="day-status">${Object.values(d.meals).map(m => `<span class="status-dot ${m ? m.type : 'empty'}"></span>`).join('')}</div>`;
            el.onclick = () => { this.selectedDate = d.date; this.renderAll(); };
            grid.appendChild(el);
        });
    }

    renderHand() {
        const hand = $('card-hand');
        const deck = game.getWeekDeck(game.getMondayOfWeek(game.parseDate(this.selectedDate)));
        const cards = [
            { type: 'discipline', ...CARD_TYPES.discipline, count: deck.discipline },
            { type: 'flex', ...CARD_TYPES.flex, count: deck.flex },
            { type: 'joker', ...CARD_TYPES.joker, count: deck.joker },
            { type: 'fasting', ...FASTING_OPTION, count: '∞' }
        ];

        hand.innerHTML = '';
        cards.forEach((c, i) => {
            const el = document.createElement('div');
            const off = i - (cards.length - 1) / 2;
            const rot = off * 4;
            const y = (window.innerWidth <= 480 ? 15 : 25) + Math.abs(off) * 8;
            
            el.className = `hand-card ${c.type} ${c.count === 0 && c.type !== 'fasting' ? 'disabled' : ''}`;
            el.draggable = !el.classList.contains('disabled');
            el.style.transform = `translateY(${y}px) rotate(${rot}deg)`;
            el.innerHTML = `${c.type !== 'fasting' ? `<span class="card-count">${c.count}</span>` : ''}<img class="card-image" src="${c.image}" alt="${c.name}" draggable="false">`;

            if (el.draggable) {
                el.ondragstart = e => { this.draggedCard = c.type; el.classList.add('dragging'); };
                el.ondragend = () => { this.draggedCard = null; el.classList.remove('dragging'); $$('.meal-drop-zone').forEach(z => z.classList.remove('drag-over')); };
                el.onclick = () => this.showCardOptions(c.type);
                this.setupTouchEvents(el, c.type);
            }
            hand.appendChild(el);
        });
        
        const m = game.getMondayOfWeek(game.parseDate(this.selectedDate));
        const todayM = game.getMondayOfWeek();
        $('deck-info').innerHTML = m === todayM ? 
            '<span class="cta-hint">Glisse une carte</span>' : 
            `<span class="week-hint week-${m < todayM ? 'past' : 'future'}">${m < todayM ? 'Semaine passée' : 'Semaine future'}</span>`;
    }

    setupTouchEvents(el, type) {
        let ghost, startPos;
        el.ontouchstart = e => {
            this.draggedCard = type; el.classList.add('dragging');
            ghost = el.cloneNode(true);
            ghost.className += ' touch-ghost';
            Object.assign(ghost.style, { position: 'fixed', pointerEvents: 'none', zIndex: 1000, width: el.offsetWidth+'px', height: el.offsetHeight+'px', opacity: 0.9, transform: 'scale(1.1) rotate(5deg)' });
            document.body.appendChild(ghost);
            const t = e.touches[0]; ghost.style.left = (t.clientX - el.offsetWidth/2)+'px'; ghost.style.top = (t.clientY - el.offsetHeight/2)+'px';
        };
        el.ontouchmove = e => {
            e.preventDefault();
            const t = e.touches[0]; ghost.style.left = (t.clientX - el.offsetWidth/2)+'px'; ghost.style.top = (t.clientY - el.offsetHeight/2)+'px';
            $$('.meal-drop-zone').forEach(z => {
                const r = z.getBoundingClientRect();
                z.classList.toggle('drag-over', t.clientX >= r.left && t.clientX <= r.right && t.clientY >= r.top && t.clientY <= r.bottom);
            });
        };
        el.ontouchend = e => {
            el.classList.remove('dragging'); ghost?.remove();
            const t = e.changedTouches[0];
            let zone = Array.from($$('.meal-drop-zone')).find(z => {
                const r = z.getBoundingClientRect();
                return t.clientX >= r.left && t.clientX <= r.right && t.clientY >= r.top && t.clientY <= r.bottom;
            });
            if (zone) this.playCard(zone.dataset.meal, type);
            this.draggedCard = null;
            $$('.meal-drop-zone').forEach(z => z.classList.remove('drag-over'));
        };
    }

    showCardOptions(type) {
        const meals = game.getDayMeals(this.selectedDate);
        const free = Object.entries(meals).filter(([_, m]) => !m).map(([t]) => t);
        if (!free.length) return this.showToast('Complet', true);
        if (free.length === 1) return this.playCard(free[0], type);
        $$('.meal-drop-zone').forEach(z => free.includes(z.dataset.meal) && (z.classList.add('drag-over'), setTimeout(() => z.classList.remove('drag-over'), 1000)));
        this.showToast('Choisis un repas');
    }

    renderMealSlots() {
        Object.entries(game.getDayMeals(this.selectedDate)).forEach(([type, m]) => {
            const slot = $(`slot-${type}`);
            if (m) {
                const info = m.type === 'fasting' ? FASTING_OPTION : CARD_TYPES[m.type];
                slot.innerHTML = `<div class="played-card-mini ${m.type}"><img class="card-image" src="${info.image}" alt="${info.name}" draggable="false"><button class="remove-btn">&times;</button></div>`;
                slot.querySelector('.remove-btn').onclick = (e) => { e.stopPropagation(); this.cancelCard(type); };
            } else slot.innerHTML = '<span class="empty-slot">Glisse ici</span>';
        });
    }

    async playCard(mType, cType) {
        const r = await game.playCard(this.selectedDate, mType, cType);
        r.success ? this.renderAll() : this.showToast(r.message, true);
    }

    async cancelCard(mType) { if ((await game.cancelCard(this.selectedDate, mType)).success) { this.renderAll(); this.showToast('Annulé'); } }

    updateUI() {
        const d = game.parseDate(this.selectedDate);
        const title = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
        $('selected-date-title').innerHTML = (this.selectedDate === game.getTodayString() ? title + ' <span class="today-badge">Aujourd\'hui</span>' : title);
    }

    renderRegimeSelector() {
        const container = $('regime-selector');
        const mode = game.getStateForWeek(this.displayedWeekMonday).regimeMode;
        container.innerHTML = '';
        Object.values(REGIME_MODES).forEach(m => {
            const btn = document.createElement('button');
            btn.className = `regime-btn ${mode === m.id ? 'active' : ''}`;
            btn.textContent = m.name;
            btn.onclick = () => {
                if (m.id === 'custom') $('custom-deck').style.display = 'block';
                else { game.setRegimeMode(m.id); $('custom-deck').style.display = 'none'; }
                $$('.regime-btn').forEach(b => b.classList.toggle('active', b === btn));
                this.renderHand();
            };
            container.appendChild(btn);
        });
        $('custom-deck').style.display = mode === 'custom' ? 'block' : 'none';
    }

    async saveCustomDeck() {
        const deck = { discipline: parseInt($('custom-discipline').value) || 0, flex: parseInt($('custom-flex').value) || 0, joker: parseInt($('custom-joker').value) || 0 };
        await game.setRegimeMode('custom', deck);
        this.renderHand();
        this.showToast('Appliqué !');
        $('settings-panel').classList.remove('active');
    }

    showToast(msg, err = false) {
        const t = $('toast'); t.textContent = msg; t.classList.toggle('error', err); t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2500);
    }

    initOnboarding() {
        this.renderOnboardingRegimes();
        $$('.onboarding-btn[data-next]').forEach(btn => btn.onclick = () => this.goToOnboardingStep(btn.dataset.next));
        $('onboarding-finish').onclick = () => this.completeOnboarding();
        if (localStorage.getItem('onboardingComplete')) $('onboarding').style.display = 'none';
    }

    renderOnboardingRegimes() {
        const container = $('onboarding-regimes');
        container.innerHTML = '';
        Object.values(REGIME_MODES).filter(r => r.id !== 'custom').forEach(r => {
            const el = document.createElement('div');
            el.className = 'onboarding-regime';
            el.innerHTML = `<span class="regime-radio"></span><div class="regime-info"><strong>${r.name}</strong><p>${r.description}</p></div>`;
            el.onclick = () => {
                this.selRegime = r.id;
                $$('.onboarding-regime').forEach(e => e.classList.toggle('selected', e === el));
                $('onboarding-regime-btn').disabled = false;
            };
            container.appendChild(el);
        });
    }

    goToOnboardingStep(s) {
        $$('.onboarding-step').forEach(step => {
            step.style.display = (step.dataset.step === s ? 'block' : 'none');
            if (step.dataset.step === s) { step.style.animation = 'none'; step.offsetHeight; step.style.animation = 'fadeInUp 0.4s ease-out'; }
        });
    }

    async completeOnboarding() {
        if (this.selRegime) await game.setRegimeMode(this.selRegime);
        localStorage.setItem('onboardingComplete', 'true');
        $('onboarding').classList.add('hidden');
        setTimeout(() => $('onboarding').style.display = 'none', 300);
        this.renderAll();
    }

    restartTutorial() {
        $('settings-panel').classList.remove('active');
        this.selRegime = null;
        $$('.onboarding-regime').forEach(el => el.classList.remove('selected'));
        $('onboarding-regime-btn').disabled = true;
        this.goToOnboardingStep('1');
        $('onboarding').style.display = 'flex';
        $('onboarding').classList.remove('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => window.app = new App());
