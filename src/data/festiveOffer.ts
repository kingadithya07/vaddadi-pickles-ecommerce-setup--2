export interface FestiveGiftItem {
  id: string;
  name: string;
  teluguName: string;
  category: 'Pickles' | 'Powders' | 'Fryums';
  image: string;
  tagline: string;
  description: string;
  hasNoGarlicOption?: boolean;
}

export interface FestiveTierConfig {
  tierNumber: number;
  minAmount: number;
  maxAmount?: number;
  freeGiftCount: number;
  title: string;
  badge: string;
  accentColor: string;
  bgGradient: string;
  borderClass: string;
  pickleWeight: string;
  powderWeight: string;
  fryumWeight: string;
  perks: string[];
}

export const FESTIVE_OFFER_NAME = 'Dussehra/Durga Pooja And Diwali/Deepavali';
export const FESTIVE_OFFER_SHORT_NAME = 'Dussehra & Diwali Offer';

export const FESTIVE_TIERS_CONFIG: FestiveTierConfig[] = [
  {
    tierNumber: 1,
    minAmount: 1000,
    maxAmount: 2499,
    freeGiftCount: 1,
    title: 'Silver Festive Tier',
    badge: '1 FREE Gift',
    accentColor: 'text-amber-600',
    bgGradient: 'from-amber-50 to-orange-50',
    borderClass: 'border-amber-300',
    pickleWeight: '100g',
    powderWeight: '100g',
    fryumWeight: '50g',
    perks: [
      'Choose 1 Free Gift (100g Pickles/Podis or 50g Fryums)',
      'Free Shipping all over India included',
      'Applicable on normal products & combos'
    ]
  },
  {
    tierNumber: 2,
    minAmount: 2500,
    maxAmount: 4999,
    freeGiftCount: 2,
    title: 'Gold Festive Tier',
    badge: '2 FREE Gifts',
    accentColor: 'text-yellow-600',
    bgGradient: 'from-yellow-50 to-amber-100',
    borderClass: 'border-yellow-400',
    pickleWeight: '100g',
    powderWeight: '100g',
    fryumWeight: '100g',
    perks: [
      'Choose 2 Free Gifts (100g each)',
      'Free Shipping with priority packaging',
      'Mix & match your favorite pickles, podis & fryums'
    ]
  },
  {
    tierNumber: 3,
    minAmount: 5000,
    freeGiftCount: 3,
    title: 'Diamond Festive Tier',
    badge: '3 FREE Gifts',
    accentColor: 'text-purple-600',
    bgGradient: 'from-purple-50 to-pink-100',
    borderClass: 'border-purple-300',
    pickleWeight: '100g',
    powderWeight: '100g',
    fryumWeight: '100g',
    perks: [
      'Choose 3 Free Gifts (100g each)',
      'VIP festive hamper curation & expedited dispatch',
      'Maximum festive celebration value'
    ]
  }
];

export const CURATED_FESTIVE_GIFTS: FestiveGiftItem[] = [
  {
    id: 'prod_1774337565319',
    name: 'Gongura Pickle',
    teluguName: 'గోంగూర పచ్చడి',
    category: 'Pickles',
    image: 'https://sbkcxmymhvrorkiiocqi.supabase.co/storage/v1/object/public/vaddadi%20pickles%20product%20images/Gongura.jpg',
    tagline: 'Signature Andhra Tangy Classic',
    description: 'Iconic sorrel leaves pickle prepared with stone-ground spices and cold-pressed oil.',
    hasNoGarlicOption: true,
  },
  {
    id: 'prod_1774337409121',
    name: 'Tomato Pickle',
    teluguName: 'టమోటా పచ్చడి',
    category: 'Pickles',
    image: 'https://sbkcxmymhvrorkiiocqi.supabase.co/storage/v1/object/public/vaddadi%20pickles%20product%20images/Tomato.jpg',
    tagline: 'Sun-dried Country Tomatoes',
    description: 'Tangy and richly spiced homemade tomato pickle, perfect with dosa, idli & hot rice.',
    hasNoGarlicOption: true,
  },
  {
    id: 'prod_1774337224243',
    name: 'Ginger Pickle (Allam Pachadi)',
    teluguName: 'అల్లం పచ్చడి',
    category: 'Pickles',
    image: 'https://sbkcxmymhvrorkiiocqi.supabase.co/storage/v1/object/public/vaddadi%20pickles%20product%20images/Ginger.jpg',
    tagline: 'Sweet, Spicy & Tangy',
    description: 'Traditional digestive allam pickle with jaggery and tamarind, best paired with pesarattu.',
    hasNoGarlicOption: true,
  },
  {
    id: 'prod_1774337701638',
    name: 'Lemon Pickle (Nimmakaya)',
    teluguName: 'నిమ్మకాయ పచ్చడి',
    category: 'Pickles',
    image: 'https://sbkcxmymhvrorkiiocqi.supabase.co/storage/v1/object/public/vaddadi%20pickles%20product%20images/Lemon.jpg',
    tagline: 'Zesty Aged Lemon Jars',
    description: 'Classic zesty salted and spiced lemon pickle aged naturally to perfection.',
  },
  {
    id: 'prod_1774336765761',
    name: 'Red Chilli Pickle (Pandu Mirapakai)',
    teluguName: 'పండు మిరపకాయ పచ్చడి',
    category: 'Pickles',
    image: 'https://sbkcxmymhvrorkiiocqi.supabase.co/storage/v1/object/public/vaddadi%20pickles%20product%20images/Redchilli-Pickle.jpg',
    tagline: 'Fiery & Aromatic',
    description: 'Fresh ripe red chillies pounded with tamarind and roasted methi powder.',
    hasNoGarlicOption: true,
  },
  {
    id: 'prod_1790057290232',
    name: 'Cut Mango Pickle (Magaya)',
    teluguName: 'మాగాయ పచ్చడి',
    category: 'Pickles',
    image: 'https://sbkcxmymhvrorkiiocqi.supabase.co/storage/v1/object/public/vaddadi%20pickles%20product%20images/magaya%20(cut%20mango%20pickles).jpeg',
    tagline: 'Sun-dried Peeled Mangoes',
    description: 'Sun-cured peeled mango strips blended with fragrant mustard-fenugreek masala.',
    hasNoGarlicOption: true,
  },
  {
    id: 'prod_1790057615548',
    name: 'Sweet Mango Pickle (Tipi Avakaya)',
    teluguName: 'తీపి ఆవకాయ',
    category: 'Pickles',
    image: 'https://sbkcxmymhvrorkiiocqi.supabase.co/storage/v1/object/public/vaddadi%20pickles%20product%20images/sweet%20mango.jpg',
    tagline: 'Jaggery Sweet & Spicy Blend',
    description: 'Authentic Bellam Avakaya cooked with pure jaggery and mustard for festive dining.',
    hasNoGarlicOption: true,
  },
  {
    id: 'prod_1774338771747',
    name: 'Kandi Podi (Gunpowder)',
    teluguName: 'కంది పొడి',
    category: 'Powders',
    image: 'https://sbkcxmymhvrorkiiocqi.supabase.co/storage/v1/object/public/vaddadi%20pickles%20product%20images/Kandi-Podi.jpg',
    tagline: 'Roasted Toor Dal Rice Spice',
    description: 'Finely roasted lentils with cumin and chillies; heaven when enjoyed with hot steamed rice and ghee.',
  },
  {
    id: 'prod_1774339121143',
    name: 'Karivepaku Podi (Curry Leaves)',
    teluguName: 'కరివేపాకు పొడి',
    category: 'Powders',
    image: 'https://sbkcxmymhvrorkiiocqi.supabase.co/storage/v1/object/public/vaddadi%20pickles%20product%20images/Karivepaku-Podi.jpg',
    tagline: 'Aromatic & Health-Packed',
    description: 'Sun-dried fresh curry leaves roasted with black gram, Bengal gram, and fragrant spices.',
  },
  {
    id: 'prod_1774339220630',
    name: 'Idli Karam Podi',
    teluguName: 'ఇడ్లీ కారం పొడి',
    category: 'Powders',
    image: 'https://sbkcxmymhvrorkiiocqi.supabase.co/storage/v1/object/public/vaddadi%20pickles%20product%20images/Idli-Karam-Podi.jpg',
    tagline: 'Crispy Dosa & Idli Companion',
    description: 'The definitive South Indian breakfast powder made with roasted dals and aromatic spices.',
  },
  {
    id: 'prod_1774338878674',
    name: 'Nuvvula Karam Podi',
    teluguName: 'నువ్వుల కారం పొడి',
    category: 'Powders',
    image: 'https://sbkcxmymhvrorkiiocqi.supabase.co/storage/v1/object/public/vaddadi%20pickles%20product%20images/Nuvvula-Karam-Podi.jpg',
    tagline: 'Rich Roasted Sesame Powder',
    description: 'Nutritious roasted sesame seeds ground with garlic and red chillies for rich nutty flavor.',
  },
  {
    id: 'prod_1774339576986',
    name: 'Saggubiyyam Vadiyalu (Sago Fryums)',
    teluguName: 'సగ్గుబియ్యం వడియాలు',
    category: 'Fryums',
    image: 'https://sbkcxmymhvrorkiiocqi.supabase.co/storage/v1/object/public/vaddadi%20pickles%20product%20images/Sabudana%20Green%20Chilli%20Vadiyalu.jpg',
    tagline: 'Melt-in-Mouth Crispy Fryums',
    description: 'Handmade sabudana fryums with a touch of green chilli and cumin. Puffs up light and crunchy.',
  },
  {
    id: 'prod_1774338414071',
    name: 'Curd Chillies (Challa Mirapakai)',
    teluguName: 'మజ్జిగ మిరపకాయలు',
    category: 'Fryums',
    image: 'https://sbkcxmymhvrorkiiocqi.supabase.co/storage/v1/object/public/vaddadi%20pickles%20product%20images/curd%20chilli-.jpg',
    tagline: 'Salted & Sun-dried in Curd',
    description: 'Country chillies soaked in seasoned sour curd and sun-dried; deep-fry for the ultimate curd-rice crunch.',
  },
  {
    id: 'prod_1774338609172',
    name: 'Rice Flour Fryums (Biyyam Pindi)',
    teluguName: 'బియ్యం పిండి వడియాలు',
    category: 'Fryums',
    image: 'https://sbkcxmymhvrorkiiocqi.supabase.co/storage/v1/object/public/vaddadi%20pickles%20product%20images/Biyyam-Palak-Vadiyalu.jpg',
    tagline: 'Crispy Sun-Dried Andhra Vadiyalu',
    description: 'Traditional steamed rice dough crisps pressed into intricate patterns and sun-dried naturally.',
  },
  {
    id: 'prod_1774337920027',
    name: 'Ashgourd Fryums (Gummidi Vadiyalu)',
    teluguName: 'గుమ్మడికాయ వడియాలు',
    category: 'Fryums',
    image: 'https://sbkcxmymhvrorkiiocqi.supabase.co/storage/v1/object/public/vaddadi%20pickles%20product%20images/GummadikayaVadiyaluMainImage_b753b631-6966-41ab-b0a1-f7cdcb4762a4_1024x1024%20(1).jpg',
    tagline: 'Grandmother Urad & Gourd Recipe',
    description: 'Authentic Andhra wedding meal favorite made from grated ashgourd and spiced urad dal batter.',
  },
  {
    id: 'prod_1790007800949',
    name: 'Pela / Pelala Vadiyalu',
    teluguName: 'పేలాల వడియాలు',
    category: 'Fryums',
    image: 'https://sbkcxmymhvrorkiiocqi.supabase.co/storage/v1/object/public/vaddadi%20pickles%20product%20images/Pela%20/%20Pelala%20Vadiyalu',
    tagline: 'Rare Puffed Rice Fryums',
    description: 'Unique crispy fryums crafted from wholesome puffed paddy; delicate, airy, and deeply nostalgic.',
  }
];

/**
 * Calculates the exact weight for the item given the cart subtotal.
 * Per user instructions:
 * - Above ₹5000: 100g for all items
 * - Above ₹2500: 100g for all items
 * - Above ₹1000: 100g for pickles & powders, 50g for fryums
 */
export function getGiftWeight(category: string, subtotal: number): string {
  if (category === 'Fryums') {
    if (subtotal >= 2500) {
      return '100g';
    }
    return '50g';
  }
  return '100g';
}

export interface FestiveTierStatus {
  tier: 0 | 1 | 2 | 3;
  eligibleCount: number;
  currentTierConfig: FestiveTierConfig | null;
  nextTierConfig: FestiveTierConfig | null;
  amountNeededForNext: number;
  progressPercent: number;
  isUnlocked: boolean;
  isMaxTier: boolean;
}

export function getFestiveTierStatus(subtotal: number): FestiveTierStatus {
  if (subtotal >= 5000) {
    return {
      tier: 3,
      eligibleCount: 3,
      currentTierConfig: FESTIVE_TIERS_CONFIG[2],
      nextTierConfig: null,
      amountNeededForNext: 0,
      progressPercent: 100,
      isUnlocked: true,
      isMaxTier: true,
    };
  }

  if (subtotal >= 2500) {
    const amountNeeded = 5000 - subtotal;
    const progress = Math.min(100, Math.round(((subtotal - 2500) / (5000 - 2500)) * 100));
    return {
      tier: 2,
      eligibleCount: 2,
      currentTierConfig: FESTIVE_TIERS_CONFIG[1],
      nextTierConfig: FESTIVE_TIERS_CONFIG[2],
      amountNeededForNext: amountNeeded,
      progressPercent: progress,
      isUnlocked: true,
      isMaxTier: false,
    };
  }

  if (subtotal >= 1000) {
    const amountNeeded = 2500 - subtotal;
    const progress = Math.min(100, Math.round(((subtotal - 1000) / (2500 - 1000)) * 100));
    return {
      tier: 1,
      eligibleCount: 1,
      currentTierConfig: FESTIVE_TIERS_CONFIG[0],
      nextTierConfig: FESTIVE_TIERS_CONFIG[1],
      amountNeededForNext: amountNeeded,
      progressPercent: progress,
      isUnlocked: true,
      isMaxTier: false,
    };
  }

  // Below ₹1000
  const amountNeeded = 1000 - subtotal;
  const progress = Math.min(100, Math.round((subtotal / 1000) * 100));
  return {
    tier: 0,
    eligibleCount: 0,
    currentTierConfig: null,
    nextTierConfig: FESTIVE_TIERS_CONFIG[0],
    amountNeededForNext: amountNeeded,
    progressPercent: progress,
    isUnlocked: false,
    isMaxTier: false,
  };
}
