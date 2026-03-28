export interface MealDef {
  id: string
  time: string
  name: string
  description: string
  kcal: number
  protein: number
  carbs: number
  fat: number
}

export interface PhaseNutrition {
  kcal: number
  protein: number
  carbs: number
  fat: number
  meals: MealDef[]
}

export interface SupplementDef {
  id: string
  name: string
  dose: string
  timing: string
  important?: boolean
}

export const CUT_PLAN: PhaseNutrition = {
  kcal: 2500,
  protein: 200,
  carbs: 269,
  fat: 70,
  meals: [
    {
      id: 'breakfast',
      time: '08:00',
      name: 'Breakfast',
      description: '4 eggs + 80g oats + banana',
      kcal: 620,
      protein: 38,
      carbs: 78,
      fat: 18,
    },
    {
      id: 'lunch',
      time: '13:00',
      name: 'Lunch',
      description: '200g chicken + 150g rice (dry) + veg',
      kcal: 680,
      protein: 52,
      carbs: 95,
      fat: 8,
    },
    {
      id: 'preworkout',
      time: '17:30',
      name: 'Pre-workout',
      description: '100g Greek yogurt + 40g granola + fruit',
      kcal: 360,
      protein: 18,
      carbs: 52,
      fat: 6,
    },
    {
      id: 'postworkout',
      time: '20:30',
      name: 'Post-workout',
      description: '200g chicken + 120g rice + olive oil',
      kcal: 620,
      protein: 50,
      carbs: 80,
      fat: 14,
    },
    {
      id: 'evening',
      time: '22:30',
      name: 'Evening',
      description: '250g cottage cheese or casein shake',
      kcal: 220,
      protein: 32,
      carbs: 8,
      fat: 4,
    },
  ],
}

export const BULK_PLAN: PhaseNutrition = {
  kcal: 3500,
  protein: 175,
  carbs: 463,
  fat: 105,
  meals: [
    {
      id: 'breakfast',
      time: '08:00',
      name: 'Breakfast',
      description: '5 eggs + 120g oats + banana + honey',
      kcal: 850,
      protein: 45,
      carbs: 115,
      fat: 22,
    },
    {
      id: 'lunch',
      time: '13:00',
      name: 'Lunch',
      description: '250g chicken + 200g rice (dry) + veg + olive oil',
      kcal: 950,
      protein: 60,
      carbs: 130,
      fat: 18,
    },
    {
      id: 'preworkout',
      time: '17:30',
      name: 'Pre-workout',
      description: '150g Greek yogurt + 60g granola + fruit + nuts',
      kcal: 520,
      protein: 25,
      carbs: 75,
      fat: 15,
    },
    {
      id: 'postworkout',
      time: '20:30',
      name: 'Post-workout',
      description: '250g chicken + 150g rice + olive oil + avocado',
      kcal: 870,
      protein: 55,
      carbs: 100,
      fat: 30,
    },
    {
      id: 'evening',
      time: '22:30',
      name: 'Evening',
      description: '300g cottage cheese + nuts + casein shake',
      kcal: 310,
      protein: 40,
      carbs: 18,
      fat: 20,
    },
  ],
}

export const SUPPLEMENTS: SupplementDef[] = [
  { id: 'creatine', name: 'Creatine Monohydrate', dose: '5g', timing: 'Any time, daily' },
  { id: 'whey', name: 'Whey Protein', dose: '1-2 scoops', timing: 'Post-workout' },
  { id: 'vitamind', name: 'Vitamin D3 + K2', dose: '2000-4000 IU', timing: 'With breakfast' },
  { id: 'magnesium', name: 'Magnesium Glycinate', dose: '400mg', timing: '30 min before bed', important: true },
  { id: 'omega3', name: 'Omega-3 Fish Oil', dose: '2-3g', timing: 'With meals' },
]
