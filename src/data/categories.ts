import { BookOpenText, Gavel, GitFork, HeartPulse, Route, Signpost, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Display metadata for the backend's question categories. The category keys
// are the backend's (domain.Categories); anything it adds later still renders,
// through categoryMeta's fallback, until it is given a row here.
export interface CategoryMeta {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  road_signs: {
    title: "Yo'l belgilari",
    description: "Ogohlantiruvchi, imtiyozli, taqiqlovchi, buyuruvchi belgilar va yo'l chiziqlari",
    icon: Signpost,
    color: '#2563EB',
  },
  traffic_rules: {
    title: 'Harakat qoidalari',
    description: "Haydovchi va piyodalarning umumiy majburiyatlari, svetofor va tartibga soluvchi",
    icon: BookOpenText,
    color: '#0D9488',
  },
  intersections: {
    title: 'Chorrahalar',
    description: "Tartibga solingan va teng ahamiyatli chorrahalarda o'tish navbati",
    icon: GitFork,
    color: '#DC2626',
  },
  first_aid: {
    title: 'Birinchi tibbiy yordam',
    description: "Yo'l-transport hodisasida jabrlanganlarga birinchi yordam ko'rsatish",
    icon: HeartPulse,
    color: '#DB2777',
  },
  penalties: {
    title: 'Javobgarlik',
    description: "Ma'muriy javobgarlik va jarimalar",
    icon: Gavel,
    color: '#7C3AED',
  },
  vehicle_safety: {
    title: 'Texnik holat',
    description: "Transport vositasining nosozliklari va foydalanish taqiqlanadigan holatlar",
    icon: Wrench,
    color: '#EA580C',
  },
  situations: {
    title: 'Harakatlanish holatlari',
    description: "Tezlik, quvib o'tish, to'xtash va to'xtab turish",
    icon: Route,
    color: '#16A34A',
  },
};

export function categoryMeta(category: string): CategoryMeta {
  return (
    CATEGORY_META[category] ?? {
      title: category,
      description: '',
      icon: BookOpenText,
      color: '#64748B',
    }
  );
}
