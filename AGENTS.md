# AGENTS.md - Guide for AI Agents

Welcome! This file is designed to help you (an AI agent) quickly grasp the architecture and logic of **Cartes sur table** (Discipline Nutrition).

## 🎯 Project Overview
"Cartes sur table" is a Progressive Web App (PWA) designed to help users plan their weekly meals using a "card deck" system. 
- **Goal**: Help users stick to a nutritional regime by gamifying meal planning.
- **Concept**: Each week, the user gets a limited deck of cards (Discipline, Flex, Joker) to assign to their meals (Breakfast, Lunch, Dinner).

## 🛠 Tech Stack
- **Frontend**: Vanilla HTML5, CSS3, and JavaScript (ES6+).
- **Architecture**: No build system (no Webpack/Vite). Files are served directly.
- **Persistence**: `localStorage` (all data stays on the device).
- **PWA**: Includes a Service Worker (`sw.js`) and a web manifest for offline support and "Add to Home Screen" functionality.

## 📂 File Structure
- `index.html`: Main entry point and layout.
- `css/style.css`: All styling, including the Hearthstone-inspired UI and dark mode support.
- `js/`:
  - `cards-data.js`: Definitions of card types, regimes, and initial deck sizes.
  - `game.js`: Core logic (`NutritionGame` class). Handles state, date calculations, and card playing logic.
  - `app.js`: UI orchestration (`App` class). Handles DOM events, drag-and-drop, and rendering.
- `images/`:
  - `cards/`: Graphical assets for the cards.
  - `logo.png`, `favicon*`: Standard branding assets.

## 🧠 Core Logic & State
- **State Management**: The state is stored in `localStorage` under the key `disciplineNutritionState`.
- **Date Handling**: The app organizes everything by "Monday of the week". Even if the user checks a date in the middle of the week, the app calculates the relevant Monday to find the correct deck for that week.
- **Cards**:
  - `discipline`: Strict healthy meal.
  - `flex`: Moderate meal.
  - `joker`: Free meal (cheat meal).
  - `fasting`: Special option (infinite uses, doesn't consume a card).

## 🖱 UI & Interactions
- **Drag & Drop**: A custom Hearthstone-like interface where cards from the "hand" are dragged onto meal slots in the "board".
- **Responsive**: Mobile-first design. Uses touch events for dragging on mobile devices.
- **Onboarding**: A tutorial overlay for first-time users, including regime selection.

## 💡 Tips for AI Agents
- **Editing Logic**: Most business rules are in `js/game.js`. State updates should always trigger `this.saveState()`.
- **Editing UI**: `js/app.js` uses standard DOM manipulation. If you add new elements to `index.html`, remember to bind them in `App.bindEvents()`.
- **Images**: All cards have corresponding images in `images/cards/`.
- **PWA**: If you update assets, remember that `sw.js` handles caching.
