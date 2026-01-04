/**
 * Base de données des cartes d'aliments
 * Chaque carte a:
 * - id: identifiant unique
 * - name: nom de l'aliment
 * - emoji: représentation visuelle
 * - category: catégorie alimentaire
 * - points: points de discipline (+/-)
 * - description: info nutritionnelle
 */

const FOOD_CARDS = [
    // PROTÉINES
    { id: 'chicken', name: 'Poulet grillé', emoji: '🍗', category: 'proteins', points: 15, description: 'Excellente source de protéines maigres' },
    { id: 'fish', name: 'Poisson', emoji: '🐟', category: 'proteins', points: 18, description: 'Riche en oméga-3' },
    { id: 'eggs', name: 'Œufs', emoji: '🥚', category: 'proteins', points: 12, description: 'Protéines complètes' },
    { id: 'beef', name: 'Bœuf', emoji: '🥩', category: 'proteins', points: 10, description: 'Riche en fer' },
    { id: 'tofu', name: 'Tofu', emoji: '🧈', category: 'proteins', points: 14, description: 'Protéine végétale' },
    { id: 'lentils', name: 'Lentilles', emoji: '🫘', category: 'proteins', points: 16, description: 'Protéines et fibres' },
    { id: 'shrimp', name: 'Crevettes', emoji: '🦐', category: 'proteins', points: 14, description: 'Faible en calories' },
    { id: 'turkey', name: 'Dinde', emoji: '🦃', category: 'proteins', points: 15, description: 'Viande maigre' },

    // LÉGUMES
    { id: 'broccoli', name: 'Brocoli', emoji: '🥦', category: 'vegetables', points: 20, description: 'Super aliment vert' },
    { id: 'carrot', name: 'Carotte', emoji: '🥕', category: 'vegetables', points: 15, description: 'Riche en bêta-carotène' },
    { id: 'salad', name: 'Salade verte', emoji: '🥬', category: 'vegetables', points: 18, description: 'Légère et nutritive' },
    { id: 'tomato', name: 'Tomate', emoji: '🍅', category: 'vegetables', points: 14, description: 'Antioxydants' },
    { id: 'cucumber', name: 'Concombre', emoji: '🥒', category: 'vegetables', points: 12, description: 'Hydratant' },
    { id: 'pepper', name: 'Poivron', emoji: '🫑', category: 'vegetables', points: 15, description: 'Vitamine C' },
    { id: 'corn', name: 'Maïs', emoji: '🌽', category: 'vegetables', points: 10, description: 'Fibres et énergie' },
    { id: 'mushroom', name: 'Champignons', emoji: '🍄', category: 'vegetables', points: 14, description: 'Faible en calories' },
    { id: 'eggplant', name: 'Aubergine', emoji: '🍆', category: 'vegetables', points: 13, description: 'Fibres' },
    { id: 'spinach', name: 'Épinards', emoji: '🥬', category: 'vegetables', points: 19, description: 'Fer et vitamines' },
    { id: 'garlic', name: 'Ail', emoji: '🧄', category: 'vegetables', points: 8, description: 'Antibactérien naturel' },
    { id: 'onion', name: 'Oignon', emoji: '🧅', category: 'vegetables', points: 8, description: 'Arôme et santé' },

    // FRUITS
    { id: 'apple', name: 'Pomme', emoji: '🍎', category: 'fruits', points: 15, description: 'Fibres et vitamines' },
    { id: 'banana', name: 'Banane', emoji: '🍌', category: 'fruits', points: 12, description: 'Énergie et potassium' },
    { id: 'orange', name: 'Orange', emoji: '🍊', category: 'fruits', points: 16, description: 'Vitamine C' },
    { id: 'strawberry', name: 'Fraises', emoji: '🍓', category: 'fruits', points: 18, description: 'Antioxydants' },
    { id: 'grapes', name: 'Raisin', emoji: '🍇', category: 'fruits', points: 10, description: 'Sucres naturels' },
    { id: 'watermelon', name: 'Pastèque', emoji: '🍉', category: 'fruits', points: 14, description: 'Hydratation' },
    { id: 'peach', name: 'Pêche', emoji: '🍑', category: 'fruits', points: 13, description: 'Vitamines A et C' },
    { id: 'pear', name: 'Poire', emoji: '🍐', category: 'fruits', points: 14, description: 'Fibres douces' },
    { id: 'cherry', name: 'Cerises', emoji: '🍒', category: 'fruits', points: 12, description: 'Anti-inflammatoire' },
    { id: 'kiwi', name: 'Kiwi', emoji: '🥝', category: 'fruits', points: 17, description: 'Super vitamine C' },
    { id: 'mango', name: 'Mangue', emoji: '🥭', category: 'fruits', points: 11, description: 'Vitamines et sucres' },
    { id: 'pineapple', name: 'Ananas', emoji: '🍍', category: 'fruits', points: 13, description: 'Enzymes digestives' },
    { id: 'lemon', name: 'Citron', emoji: '🍋', category: 'fruits', points: 15, description: 'Détox naturel' },
    { id: 'blueberry', name: 'Myrtilles', emoji: '🫐', category: 'fruits', points: 20, description: 'Super antioxydant' },
    { id: 'avocado', name: 'Avocat', emoji: '🥑', category: 'fruits', points: 16, description: 'Bonnes graisses' },

    // FÉCULENTS
    { id: 'bread', name: 'Pain complet', emoji: '🍞', category: 'grains', points: 10, description: 'Glucides complexes' },
    { id: 'rice', name: 'Riz', emoji: '🍚', category: 'grains', points: 8, description: 'Énergie durable' },
    { id: 'pasta', name: 'Pâtes', emoji: '🍝', category: 'grains', points: 7, description: 'Glucides' },
    { id: 'potato', name: 'Pomme de terre', emoji: '🥔', category: 'grains', points: 9, description: 'Amidon et potassium' },
    { id: 'sweet_potato', name: 'Patate douce', emoji: '🍠', category: 'grains', points: 14, description: 'Fibres et vitamines' },
    { id: 'croissant', name: 'Croissant', emoji: '🥐', category: 'grains', points: 3, description: 'Plaisir matinal' },
    { id: 'bagel', name: 'Bagel', emoji: '🥯', category: 'grains', points: 5, description: 'Glucides' },
    { id: 'cereals', name: 'Céréales', emoji: '🥣', category: 'grains', points: 8, description: 'Petit-déjeuner' },
    { id: 'oats', name: 'Flocons d\'avoine', emoji: '🌾', category: 'grains', points: 15, description: 'Fibres et énergie' },

    // PRODUITS LAITIERS
    { id: 'milk', name: 'Lait', emoji: '🥛', category: 'dairy', points: 10, description: 'Calcium' },
    { id: 'cheese', name: 'Fromage', emoji: '🧀', category: 'dairy', points: 6, description: 'Protéines et calcium' },
    { id: 'yogurt', name: 'Yaourt', emoji: '🥛', category: 'dairy', points: 12, description: 'Probiotiques' },
    { id: 'butter', name: 'Beurre', emoji: '🧈', category: 'dairy', points: 2, description: 'Matières grasses' },
    { id: 'greek_yogurt', name: 'Yaourt grec', emoji: '🥣', category: 'dairy', points: 15, description: 'Protéines' },

    // PLAISIRS (points négatifs ou faibles)
    { id: 'pizza', name: 'Pizza', emoji: '🍕', category: 'treats', points: -10, description: 'Plaisir occasionnel' },
    { id: 'burger', name: 'Burger', emoji: '🍔', category: 'treats', points: -12, description: 'Fast-food' },
    { id: 'fries', name: 'Frites', emoji: '🍟', category: 'treats', points: -8, description: 'Fritture' },
    { id: 'hotdog', name: 'Hot-dog', emoji: '🌭', category: 'treats', points: -10, description: 'Transformé' },
    { id: 'donut', name: 'Donut', emoji: '🍩', category: 'treats', points: -15, description: 'Sucre et friture' },
    { id: 'cake', name: 'Gâteau', emoji: '🍰', category: 'treats', points: -12, description: 'Dessert sucré' },
    { id: 'icecream', name: 'Glace', emoji: '🍦', category: 'treats', points: -10, description: 'Dessert glacé' },
    { id: 'chocolate', name: 'Chocolat', emoji: '🍫', category: 'treats', points: -5, description: 'Plaisir modéré' },
    { id: 'candy', name: 'Bonbons', emoji: '🍬', category: 'treats', points: -12, description: 'Sucres simples' },
    { id: 'cookie', name: 'Cookie', emoji: '🍪', category: 'treats', points: -8, description: 'Biscuit sucré' },
    { id: 'chips', name: 'Chips', emoji: '🥨', category: 'treats', points: -10, description: 'Snack salé' },
    { id: 'soda', name: 'Soda', emoji: '🥤', category: 'treats', points: -15, description: 'Boisson sucrée' },
    { id: 'beer', name: 'Bière', emoji: '🍺', category: 'treats', points: -8, description: 'Alcool' },
    { id: 'wine', name: 'Vin', emoji: '🍷', category: 'treats', points: -5, description: 'Alcool modéré' },
    { id: 'cocktail', name: 'Cocktail', emoji: '🍹', category: 'treats', points: -12, description: 'Alcool sucré' },
    { id: 'popcorn', name: 'Popcorn', emoji: '🍿', category: 'treats', points: -3, description: 'Snack léger' },

    // BOISSONS SAINES
    { id: 'water', name: 'Eau', emoji: '💧', category: 'vegetables', points: 10, description: 'Hydratation essentielle' },
    { id: 'green_tea', name: 'Thé vert', emoji: '🍵', category: 'vegetables', points: 12, description: 'Antioxydants' },
    { id: 'coffee', name: 'Café noir', emoji: '☕', category: 'vegetables', points: 5, description: 'Énergie naturelle' },
    { id: 'smoothie', name: 'Smoothie', emoji: '🥤', category: 'fruits', points: 10, description: 'Fruits mixés' },

    // NOIX ET GRAINES
    { id: 'nuts', name: 'Noix', emoji: '🥜', category: 'proteins', points: 12, description: 'Bonnes graisses' },
    { id: 'almonds', name: 'Amandes', emoji: '🌰', category: 'proteins', points: 14, description: 'Protéines et fibres' },
];

/**
 * Défis quotidiens et hebdomadaires
 */
const DAILY_CHALLENGES = [
    {
        id: 'five_veggies',
        title: '5 légumes aujourd\'hui',
        description: 'Mangez au moins 5 portions de légumes',
        category: 'vegetables',
        target: 5,
        reward: 50,
        icon: '🥦'
    },
    {
        id: 'two_fruits',
        title: '2 fruits frais',
        description: 'Mangez au moins 2 fruits',
        category: 'fruits',
        target: 2,
        reward: 30,
        icon: '🍎'
    },
    {
        id: 'proteins',
        title: 'Protéines à chaque repas',
        description: 'Incluez des protéines dans chaque repas principal',
        category: 'proteins',
        target: 3,
        reward: 40,
        icon: '🥩'
    },
    {
        id: 'no_treats',
        title: 'Zéro plaisir coupable',
        description: 'Évitez les aliments "plaisirs" aujourd\'hui',
        category: 'treats',
        target: 0,
        maxAllowed: 0,
        reward: 60,
        icon: '🚫'
    },
    {
        id: 'hydration',
        title: 'Super hydratation',
        description: 'Buvez au moins 8 verres d\'eau',
        targetFood: 'water',
        target: 8,
        reward: 35,
        icon: '💧'
    },
    {
        id: 'balanced_breakfast',
        title: 'Petit-déj équilibré',
        description: 'Incluez protéines, fruits et féculents au petit-déjeuner',
        special: 'balanced_breakfast',
        reward: 45,
        icon: '🌅'
    }
];

const WEEKLY_CHALLENGES = [
    {
        id: 'weekly_veggies',
        title: '35 légumes cette semaine',
        description: 'Accumulez 35 portions de légumes',
        category: 'vegetables',
        target: 35,
        reward: 200,
        icon: '🥗'
    },
    {
        id: 'streak_3',
        title: 'Série de 3 jours',
        description: 'Maintenez une série de 3 jours de discipline',
        special: 'streak',
        target: 3,
        reward: 150,
        icon: '🔥'
    },
    {
        id: 'max_treats',
        title: 'Modération',
        description: 'Maximum 5 "plaisirs" cette semaine',
        category: 'treats',
        maxAllowed: 5,
        reward: 180,
        icon: '⚖️'
    },
    {
        id: 'protein_master',
        title: 'Maître des protéines',
        description: 'Consommez 21 portions de protéines',
        category: 'proteins',
        target: 21,
        reward: 170,
        icon: '💪'
    }
];

/**
 * Niveaux et seuils de points
 */
const LEVELS = [
    { level: 1, name: 'Débutant', minPoints: 0, icon: '🌱' },
    { level: 2, name: 'Apprenti', minPoints: 100, icon: '🌿' },
    { level: 3, name: 'Motivé', minPoints: 300, icon: '🌳' },
    { level: 4, name: 'Discipliné', minPoints: 600, icon: '⭐' },
    { level: 5, name: 'Expert', minPoints: 1000, icon: '🌟' },
    { level: 6, name: 'Maître', minPoints: 1500, icon: '💫' },
    { level: 7, name: 'Champion', minPoints: 2500, icon: '🏆' },
    { level: 8, name: 'Légende', minPoints: 4000, icon: '👑' },
    { level: 9, name: 'Titan', minPoints: 6000, icon: '💎' },
    { level: 10, name: 'Divin', minPoints: 10000, icon: '🌈' }
];

/**
 * Messages de motivation
 */
const MOTIVATION_MESSAGES = [
    "Excellent choix ! Continue comme ça ! 💪",
    "Tu es sur la bonne voie ! 🎯",
    "Chaque bon choix compte ! ⭐",
    "Ta discipline paie ! 🏆",
    "Bravo pour ce repas équilibré ! 🥗",
    "Tu construis de bonnes habitudes ! 🌱",
    "Super effort aujourd'hui ! 🌟",
    "Tu es plus fort que tes envies ! 💪"
];

const WARNING_MESSAGES = [
    "Attention, ce choix te coûte des points 😅",
    "Un petit écart, c'est ok, mais reste vigilant ! ⚠️",
    "Essaie de compenser avec des légumes ! 🥦",
    "Ce n'est qu'un petit pas en arrière ! 💪"
];

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FOOD_CARDS,
        DAILY_CHALLENGES,
        WEEKLY_CHALLENGES,
        LEVELS,
        MOTIVATION_MESSAGES,
        WARNING_MESSAGES
    };
}
