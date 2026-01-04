/**
 * Discipline Nutrition - Système de cartes
 *
 * 3 types de cartes:
 * - DISCIPLINE: Légumes + Protéines uniquement
 * - FLEX: Légumes + Protéines + Féculents
 * - JOKER: Tout est permis
 *
 * Le deck se réinitialise chaque lundi
 */

const CARD_TYPES = {
    discipline: {
        id: 'discipline',
        name: 'Discipline',
        image: 'images/cards/discipline.png',
        color: '#4CAF50',
        description: 'Légumes & Protéines uniquement'
    },
    flex: {
        id: 'flex',
        name: 'Flex',
        image: 'images/cards/flex.png',
        color: '#2196F3',
        description: 'Légumes, Protéines & Féculents'
    },
    joker: {
        id: 'joker',
        name: 'Joker',
        image: 'images/cards/joker.png',
        color: '#FF9800',
        description: 'Tout est permis !'
    }
};

// Option jeûner (ne consomme pas de carte)
const FASTING_OPTION = {
    id: 'fasting',
    name: 'Jeûner',
    image: 'images/cards/fasting.png',
    color: '#9C27B0',
    description: 'Sauter ce repas'
};

const MEALS = {
    breakfast: { id: 'breakfast', name: 'Petit-déjeuner' },
    lunch: { id: 'lunch', name: 'Déjeuner' },
    dinner: { id: 'dinner', name: 'Dîner' }
};

/**
 * Modes de régime avec leur deck hebdomadaire
 */
const REGIME_MODES = {
    keto: {
        id: 'keto',
        name: 'Keto',
        description: 'Perte de poids rapide',
        hint: '19 Discipline, 1 Flex, 1 Joker - Pour ceux qui veulent des resultats visibles rapidement',
        deck: {
            discipline: 19,
            flex: 1,
            joker: 1
        }
    },
    lowcarb: {
        id: 'lowcarb',
        name: 'Low Carb',
        description: 'Perte de poids progressive',
        hint: '15 Discipline, 4 Flex, 2 Joker - Moins strict, plus de flexibilite au quotidien',
        deck: {
            discipline: 15,
            flex: 4,
            joker: 2
        }
    },
    moderate: {
        id: 'moderate',
        name: 'Maintien',
        description: 'Garder son poids stable',
        hint: '14 Discipline, 5 Flex, 2 Joker - Pour maintenir ses resultats sur le long terme',
        deck: {
            discipline: 14,
            flex: 5,
            joker: 2
        }
    },
    balanced: {
        id: 'balanced',
        name: 'Equilibre',
        description: 'Manger sainement sans pression',
        hint: '10 Discipline, 8 Flex, 3 Joker - Pour une approche detendue et durable',
        deck: {
            discipline: 10,
            flex: 8,
            joker: 3
        }
    },
    custom: {
        id: 'custom',
        name: 'Personnalise',
        description: 'Cree ton propre equilibre',
        hint: 'Ajuste le nombre de cartes selon tes besoins',
        deck: {
            discipline: 10,
            flex: 8,
            joker: 3
        }
    }
};
