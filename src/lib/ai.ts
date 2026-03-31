import { Mistral } from '@mistralai/mistralai'

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY!,
})

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

type Meal = {
  dejeuner: { nom: string; ingredients: string[] }
  diner: { nom: string; ingredients: string[] }
}

type WeekMeals = Record<string, Meal>

type ShoppingItem = {
  nom: string
  quantite: string
  categorie: string
  prixEstime: number
}

const GOAL_DESCRIPTIONS: Record<string, string> = {
  prise_masse: 'Prise de masse musculaire : repas riches en protéines (150g+/jour), glucides complexes, calories élevées.',
  seche: 'Sèche / perte de poids : repas riches en protéines, faibles en glucides et lipides, déficit calorique.',
  maintien: 'Maintien du poids : repas équilibrés, macro-nutriments balancés.',
  performance: 'Performance sportive : repas riches en protéines et glucides complexes pour l\'énergie.',
  endurance: 'Endurance : repas riches en glucides complexes, hydratation, repas légers mais énergétiques.',
}

export async function generateWeeklyMenu(
  nbPersons: number,
  restrictions: string | null,
  budget: string,
  goal: string | null,
  preferences: string | null,
  calories: number | null,
): Promise<{ meals: WeekMeals; shoppingList: ShoppingItem[] }> {
  const budgetDesc = budget === 'economique' ? 'petit budget (environ 3-5€ par repas)' :
    budget === 'genereux' ? 'budget confortable (8-15€ par repas)' :
    'budget moyen (5-8€ par repas)'

  let context = `Génère un menu healthy pour une semaine (7 jours) pour ${nbPersons} personne(s).
${restrictions ? `Restrictions alimentaires : ${restrictions}` : 'Pas de restrictions alimentaires.'}
Budget : ${budgetDesc}`

  if (goal && GOAL_DESCRIPTIONS[goal]) {
    context += `\nObjectif sportif : ${GOAL_DESCRIPTIONS[goal]}`
  }

  if (calories) {
    context += `\nObjectif calorique : environ ${calories} kcal par jour par personne.`
  }

  if (preferences) {
    context += `\nPréférences culinaires : ${preferences}. Adapte les recettes à ces goûts.`
  }

  const prompt = `${context}

Réponds UNIQUEMENT en JSON valide, sans texte avant ou après. Le format exact :
{
  "meals": {
    "Lundi": {
      "dejeuner": {
        "nom": "Nom du plat",
        "ingredients": ["ingredient1", "ingredient2"],
        "etapes": [
          { "description": "Couper les légumes en dés", "duree": null },
          { "description": "Faire cuire au four", "duree": 25 },
          { "description": "Laisser reposer", "duree": 5 }
        ]
      },
      "diner": {
        "nom": "Nom du plat",
        "ingredients": ["ingredient1", "ingredient2"],
        "etapes": [
          { "description": "Faire revenir les oignons", "duree": 5 },
          { "description": "Ajouter la sauce et laisser mijoter", "duree": 15 }
        ]
      }
    },
    "Mardi": { ... },
    "Mercredi": { ... },
    "Jeudi": { ... },
    "Vendredi": { ... },
    "Samedi": { ... },
    "Dimanche": { ... }
  },
  "shoppingList": [
    { "nom": "Tomates", "quantite": "1kg", "categorie": "Fruits & Légumes", "prixEstime": 2.50 },
    { "nom": "Poulet", "quantite": "800g", "categorie": "Viandes", "prixEstime": 6.00 }
  ]
}

IMPORTANT pour les étapes :
- Chaque plat doit avoir entre 3 et 8 étapes de préparation claires et détaillées.
- "duree" est en minutes. Mettre null si l'étape n'a pas de temps d'attente (ex: couper, mélanger). Mettre un nombre si l'étape nécessite un minuteur (cuisson, repos, marinade).

Les catégories de courses possibles : "Fruits & Légumes", "Viandes & Poissons", "Produits laitiers", "Épicerie", "Boulangerie", "Surgelés", "Boissons", "Autre"

Les prix sont en euros, estimés sur les prix moyens français.
Regroupe les ingrédients identiques dans la liste de courses (pas de doublons).
Les jours doivent être : ${DAYS.join(', ')}`

  const response = await mistral.chat.complete({
    model: 'mistral-small-latest',
    messages: [{ role: 'user', content: prompt }],
    responseFormat: { type: 'json_object' },
  })

  const text = response.choices?.[0]?.message?.content
  if (typeof text !== 'string') throw new Error('Réponse vide de Mistral')

  const parsed = JSON.parse(text)

  return {
    meals: parsed.meals,
    shoppingList: parsed.shoppingList,
  }
}
