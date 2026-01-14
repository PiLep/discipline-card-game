# 🃏 Cartes sur table (Discipline Nutrition)

**Cartes sur table** est une application web progressive (PWA) qui transforme la planification alimentaire en un jeu de cartes hebdomadaire. Inspirée par l'interface de Hearthstone, elle vous aide à équilibrer vos repas sans la lourdeur du comptage de calories.

![Screenshot de l'application](images/logo.png)

## 🎯 Le Concept

Chaque lundi, vous recevez un **deck de cartes** correspondant au régime que vous avez choisi. Votre mission : répartir ces cartes sur vos repas de la semaine (Petit-déjeuner, Déjeuner, Dîner).

### Les types de cartes :
- **🟢 Discipline** : Repas 100% conforme (Protéines + Légumes).
- **🔵 Flex** : Un écart raisonnable (Ajout de féculents ou fruits).
- **🟠 Joker** : Liberté totale (Cheat meal), zéro culpabilité !
- **🟣 Jeûner** : Option pour sauter un repas sans consommer de carte.

## ✨ Fonctionnalités

- **Interface Hearthstone-like** : Glissez-déposez vos cartes directement sur votre calendrier.
- **Modes de régime** : Choisissez entre *Keto*, *Low Carb*, *Équilibre* ou créez votre propre deck personnalisé.
- **100% Privé** : Toutes vos données restent dans votre navigateur (`localStorage`). Pas de compte, pas de serveur.
- **PWA (Progressive Web App)** : Installez l'application sur votre écran d'accueil et utilisez-la hors ligne.
- **Mode Sombre** : Activé par défaut pour un confort visuel optimal.

## 🚀 Commencer

L'application est statique et n'a pas besoin d'étape de compilation.

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/PiLep/discipline-card-game.git
   ```
2. Ouvrez `index.html` dans votre navigateur ou utilisez un serveur local (ex: extension VS Code "Live Server").

## 🛠 Tech Stack

- **Langages** : HTML5, CSS3, JavaScript (ES6+).
- **Logique** : Vanilla JS (pas de framework).
- **Persistance** : LocalStorage.
- **Offline** : Service Workers.

## 🤝 Contribution

Les contributions sont les bienvenues ! Si vous êtes un agent IA, n'oubliez pas de consulter le fichier [AGENTS.md](./AGENTS.md) pour comprendre l'architecture interne rapidement.

## 📄 Licence

MIT
