import {
  BookOpenText,
  Car,
  GitFork,
  Route,
  ShieldCheck,
  Signpost,
  TrafficCone,
  Truck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Display metadata for the syllabus. The keys are the backend's topic keys
// (domain.Topics), which follow the Yo'l harakati qoidalari: one topic per
// chapter or appendix section, grouped under eight headings. GET /topics also
// returns each topic's title and group; this copy exists so that screens which
// only hold a question's category (practice, exam) can name it without a
// round trip. Anything the backend adds later still renders, through
// categoryMeta's fallback, until it is given a row here.

export interface TopicGroupMeta {
  title: string;
  icon: LucideIcon;
  color: string;
}

export const TOPIC_GROUPS: Record<string, TopicGroupMeta> = {
  signs: { title: "Yo'l belgilari", icon: Signpost, color: '#2563EB' },
  intersections: { title: 'Chorrahalar', icon: GitFork, color: '#DC2626' },
  signals: { title: 'Ishoralar va chiziqlar', icon: TrafficCone, color: '#D97706' },
  maneuvers: { title: 'Asosiy manyovrlar', icon: Route, color: '#16A34A' },
  special: { title: 'Maxsus vaziyatlar', icon: Car, color: '#0891B2' },
  general: { title: 'Umumiy qoidalar', icon: BookOpenText, color: '#0D9488' },
  transport: { title: "Tashish va qo'shimcha talablar", icon: Truck, color: '#7C3AED' },
  safety: { title: 'Xavfsizlik va texnik holat', icon: ShieldCheck, color: '#DB2777' },
};

export const TOPIC_GROUP_ORDER = Object.keys(TOPIC_GROUPS);

interface TopicRow {
  title: string;
  group: string;
  // What the topic covers in the Rules, shown under its name.
  source: string;
}

const TOPICS: Record<string, TopicRow> = {
  signs_warning: { title: 'Ogohlantiruvchi belgilar', group: 'signs', source: "YHQ 1-ilova, 1-bo'lim" },
  signs_priority: { title: 'Imtiyoz belgilari', group: 'signs', source: "YHQ 1-ilova, 2-bo'lim" },
  signs_prohibitory: { title: 'Taqiqlovchi belgilar', group: 'signs', source: "YHQ 1-ilova, 3-bo'lim" },
  signs_mandatory: { title: 'Buyuruvchi belgilar', group: 'signs', source: "YHQ 1-ilova, 4-bo'lim" },
  signs_information: { title: "Axborot-ko'rsatgich belgilari", group: 'signs', source: "YHQ 1-ilova, 5-bo'lim" },
  signs_service: { title: 'Servis belgilari', group: 'signs', source: "YHQ 1-ilova, 6-bo'lim" },
  signs_additional: { title: "Qo'shimcha axborot belgilari", group: 'signs', source: "YHQ 1-ilova, 7-bo'lim" },

  intersections_general: { title: 'Chorrahalarda harakatlanish', group: 'intersections', source: 'YHQ 14-bob' },
  intersections_regulated: { title: 'Tartibga solingan chorrahalar', group: 'intersections', source: 'YHQ 15-bob' },
  intersections_equal: {
    title: 'Tartibga solinmagan teng ahamiyatli chorrahalar',
    group: 'intersections',
    source: 'YHQ 16-bob, 105, 107–108-bandlar',
  },
  intersections_main_road: {
    title: "Tartibga solinmagan chorrahalar: asosiy yo'l",
    group: 'intersections',
    source: 'YHQ 16-bob, 104-band',
  },
  intersections_main_road_turns: {
    title: "Asosiy yo'lning yo'nalishi o'zgaradigan chorrahalar",
    group: 'intersections',
    source: 'YHQ 16-bob, 106-band',
  },

  signals_traffic_lights: { title: 'Svetofor ishoralari', group: 'signals', source: 'YHQ 7-bob, 30–37-bandlar' },
  signals_regulator: { title: 'Tartibga soluvchining ishoralari', group: 'signals', source: 'YHQ 7-bob, 38–43-bandlar' },
  signals_warning: { title: 'Ogohlantiruvchi va avariya ishoralari', group: 'signals', source: 'YHQ 8-bob' },
  markings_horizontal: { title: 'Yotiq chiziqlar', group: 'signals', source: "YHQ 2-ilova, 1-bo'lim" },
  markings_vertical: { title: 'Tik chiziqlar', group: 'signals', source: "YHQ 2-ilova, 2-bo'lim" },

  maneuvering: { title: 'Harakatlanishni boshlash, manyovr qilish', group: 'maneuvers', source: 'YHQ 9-bob' },
  lane_position: { title: 'Qatnov qismida transport vositalarining joylashuvi', group: 'maneuvers', source: 'YHQ 10-bob' },
  speed: { title: 'Harakatlanish tezligi', group: 'maneuvers', source: 'YHQ 11-bob' },
  overtaking: { title: "Quvib o'tish", group: 'maneuvers', source: 'YHQ 12-bob' },
  stopping_parking: { title: "To'xtash va to'xtab turish", group: 'maneuvers', source: 'YHQ 13-bob' },

  pedestrian_crossings: { title: "Piyodalar o'tish joylari va bekatlar", group: 'special', source: 'YHQ 17-bob' },
  railway_crossings: { title: "Temir yo'l kesishmalari", group: 'special', source: 'YHQ 18-bob' },
  motorways: { title: 'Avtomagistrallarda harakatlanish', group: 'special', source: 'YHQ 19-bob' },
  residential_areas: { title: 'Turar joy dahalarida harakatlanish', group: 'special', source: 'YHQ 20-bob' },
  slopes: { title: 'Tik balandlik va nishabliklarda harakatlanish', group: 'special', source: 'YHQ 21-bob' },
  route_vehicles: { title: "Yo'nalishli transport vositalarining imtiyozlari", group: 'special', source: 'YHQ 22-bob' },
  special_vehicles: { title: 'Maxsus transport vositalarining imtiyozlari', group: 'special', source: 'YHQ 6-bob' },
  lighting: { title: 'Tashqi yoritish asboblaridan foydalanish', group: 'special', source: 'YHQ 23-bob' },

  general_rules: { title: 'Umumiy qoidalar va asosiy tushunchalar', group: 'general', source: 'YHQ 1-bob' },
  driver_duties: { title: 'Haydovchilarning umumiy vazifalari', group: 'general', source: 'YHQ 2-bob' },
  accidents: { title: "Yo'l-transport hodisasida haydovchining majburiyatlari", group: 'general', source: 'YHQ 3-bob' },
  pedestrians: { title: 'Piyodalarning majburiyatlari', group: 'general', source: 'YHQ 4-bob' },
  passengers: { title: "Yo'lovchilarning majburiyatlari", group: 'general', source: 'YHQ 5-bob' },
  liability: { title: 'Haydovchining huquqiy javobgarligi', group: 'general', source: "MJtK, Yo'l harakati to'g'risidagi qonun" },

  towing: { title: 'Mexanik transport vositalarini shatakka olish', group: 'transport', source: 'YHQ 24-bob' },
  driving_training: { title: "Transport vositalarini boshqarishni o'rgatish", group: 'transport', source: 'YHQ 25-bob' },
  passenger_transport: { title: 'Odam tashish', group: 'transport', source: 'YHQ 26-bob' },
  cargo_transport: { title: 'Yuk tashish', group: 'transport', source: 'YHQ 27-bob' },
  bicycles_mopeds: { title: "Velosiped, moped va aravalar, hayvonlarni haydab o'tish", group: 'transport', source: 'YHQ 28-bob' },

  first_aid: { title: 'Birinchi tibbiy yordam', group: 'safety', source: '' },
  safe_driving: { title: 'Harakat xavfsizligi asoslari', group: 'safety', source: '' },
  vehicle_faults: { title: 'Transport vositalaridan foydalanishni taqiqlovchi shartlar', group: 'safety', source: 'YHQ 3-ilova' },
  registration_marks: { title: "Yo'lga chiqarish talablari va taniqli belgilar", group: 'safety', source: 'YHQ 29-bob' },
  danger_plates: { title: 'Xavflilik belgilari', group: 'safety', source: 'YHQ 4-ilova' },
};

export interface CategoryMeta {
  title: string;
  description: string;
  group: string;
  icon: LucideIcon;
  color: string;
}

export function categoryMeta(category: string): CategoryMeta {
  const row = TOPICS[category];
  const group = TOPIC_GROUPS[row?.group ?? ''];
  return {
    title: row?.title ?? category,
    description: row?.source ?? '',
    group: row?.group ?? '',
    icon: group?.icon ?? BookOpenText,
    color: group?.color ?? '#64748B',
  };
}
