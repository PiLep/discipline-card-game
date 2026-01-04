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
        emoji: '💪',
        color: '#4CAF50',
        description: 'Légumes & Protéines uniquement'
    },
    flex: {
        id: 'flex',
        name: 'Flex',
        emoji: '⚖️',
        color: '#2196F3',
        description: 'Légumes, Protéines & Féculents'
    },
    joker: {
        id: 'joker',
        name: 'Joker',
        emoji: '🃏',
        color: '#FF9800',
        description: 'Tout est permis !'
    }
};

// Option jeûner (ne consomme pas de carte)
const FASTING_OPTION = {
    id: 'fasting',
    name: 'Jeûner',
    emoji: '🧘',
    color: '#9C27B0',
    description: 'Sauter ce repas'
};

const MEALS = {
    breakfast: { id: 'breakfast', name: 'Petit-déjeuner', emoji: '🌅' },
    lunch: { id: 'lunch', name: 'Déjeuner', emoji: '☀️' },
    dinner: { id: 'dinner', name: 'Dîner', emoji: '🌙' }
};

/**
 * Modes de régime avec leur deck hebdomadaire
 */
const REGIME_MODES = {
    lowcarb: {
        id: 'lowcarb',
        name: 'Low Carb',
        description: 'Régime pauvre en glucides',
        emoji: '🥩',
        deck: {
            discipline: 15,
            flex: 4,
            joker: 2
        }
    },
    keto: {
        id: 'keto',
        name: 'Keto',
        description: 'Régime cétogène strict',
        emoji: '🥓',
        deck: {
            discipline: 19,
            flex: 1,
            joker: 1
        }
    },
    balanced: {
        id: 'balanced',
        name: 'Équilibré',
        description: 'Alimentation équilibrée',
        emoji: '⚖️',
        deck: {
            discipline: 10,
            flex: 8,
            joker: 3
        }
    },
    moderate: {
        id: 'moderate',
        name: 'Modéré',
        description: 'Contrôle modéré',
        emoji: '🎯',
        deck: {
            discipline: 14,
            flex: 5,
            joker: 2
        }
    },
    custom: {
        id: 'custom',
        name: 'Personnalisé',
        description: 'Ton propre deck',
        emoji: '✏️',
        deck: {
            discipline: 10,
            flex: 8,
            joker: 3
        }
    }
};
