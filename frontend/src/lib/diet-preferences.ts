export type DietPreferences = {
  cuisines: string[];
  diets: string[];
  allergens: string[];
};

const STORAGE_KEY = "kp_diet_preferences_v1";

export const CUISINE_OPTIONS: string[] = [
  "итальянская",
  "японская",
  "русская",
  "китайская",
  "грузинская",
  "европейская",
  "американская",
  "мексиканская",
  "индийская",
  "французская",
];

export const DIET_OPTIONS: string[] = [
  "веган",
  "вегетарианское",
  "безглютен",
  "кето",
  "палео",
  "халяль",
  "кошерное",
  "низкоуглеводное",
  "безлактозное",
];

export const ALLERGEN_OPTIONS: string[] = [
  "орехи",
  "молочное",
  "глютен",
  "яйца",
  "рыба",
  "морепродукты",
  "соя",
  "арахис",
  "сельдерей",
];

export function loadDietPreferences(): DietPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DietPreferences>;
    return {
      cuisines: Array.isArray(parsed.cuisines) ? parsed.cuisines : [],
      diets: Array.isArray(parsed.diets) ? parsed.diets : [],
      allergens: Array.isArray(parsed.allergens) ? parsed.allergens : [],
    };
  } catch {
    return null;
  }
}

export function saveDietPreferences(prefs: DietPreferences): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore write errors (e.g. private mode)
  }
}


