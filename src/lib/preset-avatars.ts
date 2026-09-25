/**
 * BeeYield Curated Apiculture Preset Avatars
 * High-definition, beautifully styled vector avatars representing different beekeeping roles and elements.
 */

export interface PresetAvatar {
  id: string;
  name: string;
  role: string;
  category: "role" | "nature" | "equipment";
  svg: string;
}

// Generates an inline SVG data URI with UTF-8 encoding
function createSvgDataUri(svgContent: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`;
}

export const PRESET_AVATARS: PresetAvatar[] = [
  {
    id: "avatar_master_apiarist",
    name: "Master Apiarist",
    role: "Lead Beekeeper & Apiary Manager",
    category: "role",
    svg: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <linearGradient id="bgGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#F59E0B" />
            <stop offset="100%" stop-color="#D97706" />
          </linearGradient>
          <linearGradient id="suitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" />
            <stop offset="100%" stop-color="#F3F4F6" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="24" fill="url(#bgGrad1)" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="#FEF3C7" stroke-width="2" opacity="0.4" />
        <!-- Suit Collar & Body -->
        <path d="M22 92 C24 72 35 66 50 66 C65 66 76 72 78 92 Z" fill="url(#suitGrad)" />
        <path d="M46 66 L50 78 L54 66 Z" fill="#E5E7EB" />
        <!-- Veil & Helmet -->
        <ellipse cx="50" cy="42" rx="20" ry="24" fill="#F9FAFB" stroke="#D1D5DB" stroke-width="2" />
        <ellipse cx="50" cy="42" rx="15" ry="18" fill="#1F2937" opacity="0.85" />
        <!-- Mesh Screen -->
        <line x1="37" y1="36" x2="63" y2="36" stroke="#4B5563" stroke-width="1" />
        <line x1="36" y1="42" x2="64" y2="42" stroke="#4B5563" stroke-width="1" />
        <line x1="37" y1="48" x2="63" y2="48" stroke="#4B5563" stroke-width="1" />
        <line x1="44" y1="28" x2="44" y2="56" stroke="#4B5563" stroke-width="1" />
        <line x1="50" y1="26" x2="50" y2="58" stroke="#4B5563" stroke-width="1" />
        <line x1="56" y1="28" x2="56" y2="56" stroke="#4B5563" stroke-width="1" />
        <!-- Golden Star Badge -->
        <circle cx="74" cy="74" r="10" fill="#FEF3C7" stroke="#F59E0B" stroke-width="2" />
        <path d="M74 68 L76 72 L80 73 L77 76 L78 80 L74 78 L70 80 L71 76 L68 73 L72 72 Z" fill="#D97706" />
      </svg>
    `),
  },
  {
    id: "avatar_queen_bee",
    name: "Golden Queen",
    role: "Queen Breeder & Colony Matriarch",
    category: "nature",
    svg: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <linearGradient id="bgGradQueen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1E1B4B" />
            <stop offset="50%" stop-color="#312E81" />
            <stop offset="100%" stop-color="#4338CA" />
          </linearGradient>
          <linearGradient id="goldCrown" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FDE047" />
            <stop offset="100%" stop-color="#EAB308" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="24" fill="url(#bgGradQueen)" />
        <!-- Hexagon aura -->
        <polygon points="50,15 78,31 78,63 50,79 22,63 22,31" fill="none" stroke="#FBBF24" stroke-width="2" opacity="0.3" />
        <!-- Crown -->
        <path d="M38 32 L42 22 L50 28 L58 22 L62 32 Z" fill="url(#goldCrown)" stroke="#CA8A04" stroke-width="1.5" />
        <circle cx="50" cy="27" r="2" fill="#EF4444" />
        <!-- Queen Body -->
        <ellipse cx="50" cy="44" rx="10" ry="9" fill="#FBBF24" />
        <!-- Striped Abdomen (Longer for Queen) -->
        <path d="M43 51 C43 51 40 76 50 82 C60 76 57 51 57 51 Z" fill="#F59E0B" />
        <path d="M42 58 Q50 61 58 58" stroke="#1F2937" stroke-width="2.5" fill="none" />
        <path d="M43 66 Q50 69 57 66" stroke="#1F2937" stroke-width="2.5" fill="none" />
        <path d="M46 74 Q50 76 54 74" stroke="#1F2937" stroke-width="2.5" fill="none" />
        <!-- Delicate Wings -->
        <ellipse cx="34" cy="46" rx="14" ry="7" transform="rotate(-30 34 46)" fill="#E0E7FF" opacity="0.6" stroke="#A5B4FC" stroke-width="1" />
        <ellipse cx="66" cy="46" rx="14" ry="7" transform="rotate(30 66 46)" fill="#E0E7FF" opacity="0.6" stroke="#A5B4FC" stroke-width="1" />
      </svg>
    `),
  },
  {
    id: "avatar_worker_forager",
    name: "Pollen Forager",
    role: "Worker Bee & Pollination Scout",
    category: "nature",
    svg: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <linearGradient id="bgGradForager" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#065F46" />
            <stop offset="100%" stop-color="#047857" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="24" fill="url(#bgGradForager)" />
        <!-- Flower petals behind bee -->
        <circle cx="50" cy="50" r="30" fill="none" stroke="#34D399" stroke-width="2" stroke-dasharray="4 4" opacity="0.4" />
        <!-- Worker Bee Body -->
        <ellipse cx="50" cy="42" rx="12" ry="11" fill="#F59E0B" />
        <!-- Eyes -->
        <circle cx="45" cy="38" r="2.5" fill="#1F2937" />
        <circle cx="55" cy="38" r="2.5" fill="#1F2937" />
        <!-- Abdomen with stripes -->
        <ellipse cx="50" cy="62" rx="14" ry="17" fill="#FBBF24" />
        <path d="M37 54 Q50 58 63 54" stroke="#111827" stroke-width="3.5" fill="none" />
        <path d="M36 63 Q50 67 64 63" stroke="#111827" stroke-width="3.5" fill="none" />
        <path d="M39 71 Q50 74 61 71" stroke="#111827" stroke-width="3.5" fill="none" />
        <!-- Pollen Basket (Corbicula) Glow -->
        <circle cx="32" cy="64" r="5" fill="#FCD34D" stroke="#D97706" stroke-width="1.5" />
        <circle cx="68" cy="64" r="5" fill="#FCD34D" stroke="#D97706" stroke-width="1.5" />
        <!-- Wings -->
        <ellipse cx="32" cy="34" rx="13" ry="7" transform="rotate(-25 32 34)" fill="#ECFDF5" opacity="0.8" stroke="#6EE7B7" stroke-width="1" />
        <ellipse cx="68" cy="34" rx="13" ry="7" transform="rotate(25 68 34)" fill="#ECFDF5" opacity="0.8" stroke="#6EE7B7" stroke-width="1" />
      </svg>
    `),
  },
  {
    id: "avatar_honeycomb_gold",
    name: "Golden Comb",
    role: "Pure Honey & Capped Supers",
    category: "nature",
    svg: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <linearGradient id="bgGradComb" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#78350F" />
            <stop offset="100%" stop-color="#451A03" />
          </linearGradient>
          <linearGradient id="goldHoney" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FCD34D" />
            <stop offset="100%" stop-color="#F59E0B" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="24" fill="url(#bgGradComb)" />
        <!-- Center Honeycomb Group -->
        <g stroke="#FDE68A" stroke-width="2.5" fill="url(#goldHoney)">
          <!-- Top Left -->
          <polygon points="34,22 46,28 46,40 34,46 22,40 22,28" opacity="0.85" />
          <!-- Top Right -->
          <polygon points="66,22 78,28 78,40 66,46 54,40 54,28" opacity="0.85" />
          <!-- Center Primary -->
          <polygon points="50,40 64,48 64,64 50,72 36,64 36,48" stroke="#FFFBEB" stroke-width="3" />
          <!-- Bottom Left -->
          <polygon points="34,64 46,70 46,82 34,88 22,82 22,70" opacity="0.75" />
          <!-- Bottom Right -->
          <polygon points="66,64 78,70 78,82 66,88 54,82 54,70" opacity="0.75" />
        </g>
        <!-- Honey Drip -->
        <circle cx="50" cy="56" r="4" fill="#FEF3C7" />
        <path d="M50 56 Q50 63 52 64 Q50 68 48 64 Z" fill="#FEF3C7" />
      </svg>
    `),
  },
  {
    id: "avatar_smart_apiarist",
    name: "Apisense IoT",
    role: "Precision Tech & Acoustic Telemetry",
    category: "equipment",
    svg: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <linearGradient id="bgGradIoT" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0F172A" />
            <stop offset="100%" stop-color="#1E293B" />
          </linearGradient>
          <linearGradient id="cyanGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38BDF8" />
            <stop offset="100%" stop-color="#0284C7" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="24" fill="url(#bgGradIoT)" />
        <!-- Circular Radar Tracks -->
        <circle cx="50" cy="50" r="36" fill="none" stroke="#38BDF8" stroke-width="1.5" opacity="0.3" />
        <circle cx="50" cy="50" r="24" fill="none" stroke="#38BDF8" stroke-width="1.5" opacity="0.5" />
        <!-- Smart Hive Box -->
        <rect x="36" y="38" width="28" height="26" rx="4" fill="#334155" stroke="url(#cyanGlow)" stroke-width="2" />
        <!-- Digital Circuit Lines -->
        <line x1="24" y1="50" x2="36" y2="50" stroke="#38BDF8" stroke-width="2" />
        <circle cx="22" cy="50" r="3" fill="#38BDF8" />
        <line x1="64" y1="50" x2="76" y2="50" stroke="#38BDF8" stroke-width="2" />
        <circle cx="78" cy="50" r="3" fill="#38BDF8" />
        <!-- Antenna & Pulse Wave -->
        <line x1="50" y1="38" x2="50" y2="24" stroke="#F59E0B" stroke-width="2.5" />
        <circle cx="50" cy="22" r="3.5" fill="#F59E0B" />
        <path d="M42 20 A10 10 0 0 1 58 20" fill="none" stroke="#FBBF24" stroke-width="2" stroke-linecap="round" />
        <path d="M36 15 A18 18 0 0 1 64 15" fill="none" stroke="#FBBF24" stroke-width="1.5" opacity="0.6" stroke-linecap="round" />
        <!-- Activity Pulse in Box -->
        <path d="M40 51 L45 51 L48 45 L52 57 L55 51 L60 51" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `),
  },
  {
    id: "avatar_raw_honey_jar",
    name: "Certified Jar",
    role: "Export Grade Raw Honey",
    category: "nature",
    svg: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <linearGradient id="bgGradJar" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#EA580C" />
            <stop offset="100%" stop-color="#C2410C" />
          </linearGradient>
          <linearGradient id="honeyAmber" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FDE68A" />
            <stop offset="30%" stop-color="#F59E0B" />
            <stop offset="100%" stop-color="#D97706" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="24" fill="url(#bgGradJar)" />
        <!-- Glass Jar Outline -->
        <rect x="30" y="32" width="40" height="48" rx="8" fill="#FFFBEB" opacity="0.15" />
        <!-- Honey Liquid Fill -->
        <path d="M30 46 Q50 49 70 46 L70 72 C70 76 66 80 62 80 L38 80 C34 80 30 76 30 72 Z" fill="url(#honeyAmber)" />
        <!-- Jar Lid & Cloth Ribbon -->
        <rect x="34" y="24" width="32" height="7" rx="3" fill="#78350F" />
        <rect x="32" y="30" width="36" height="3" fill="#D97706" />
        <!-- Label Badge -->
        <rect x="36" y="52" width="28" height="18" rx="3" fill="#FFFFFF" opacity="0.9" />
        <circle cx="50" cy="59" r="3.5" fill="#D97706" />
        <rect x="42" y="65" width="16" height="2" fill="#9CA3AF" />
      </svg>
    `),
  },
  {
    id: "avatar_smoker_specialist",
    name: "Apiary Smoker",
    role: "Colony Inspection & Gentle Smoke",
    category: "equipment",
    svg: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <linearGradient id="bgGradSmoker" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4B5563" />
            <stop offset="100%" stop-color="#374151" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="24" fill="url(#bgGradSmoker)" />
        <!-- Calming Smoke Clouds -->
        <circle cx="38" cy="22" r="8" fill="#F3F4F6" opacity="0.4" />
        <circle cx="48" cy="18" r="10" fill="#F3F4F6" opacity="0.5" />
        <circle cx="60" cy="20" r="7" fill="#F3F4F6" opacity="0.3" />
        <!-- Stainless Steel Canister -->
        <rect x="40" y="44" width="26" height="38" rx="4" fill="#E5E7EB" stroke="#9CA3AF" stroke-width="2" />
        <line x1="40" y1="56" x2="66" y2="56" stroke="#D1D5DB" stroke-width="2" />
        <!-- Funnel Cone Spout -->
        <polygon points="42,44 64,44 55,26 49,26" fill="#D1D5DB" stroke="#9CA3AF" stroke-width="1.5" />
        <!-- Heat Shield Wire Cage -->
        <line x1="38" y1="50" x2="38" y2="76" stroke="#F59E0B" stroke-width="2" />
        <!-- Wooden Bellows -->
        <path d="M26 50 L36 46 L36 78 L26 74 Z" fill="#B45309" stroke="#78350F" stroke-width="2" />
        <rect x="23" y="58" width="5" height="8" rx="2" fill="#78350F" />
      </svg>
    `),
  },
  {
    id: "avatar_biosecure_inspector",
    name: "BioSecure Shield",
    role: "Hive Health & Disease Defense",
    category: "role",
    svg: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <linearGradient id="bgGradBio" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0284C7" />
            <stop offset="100%" stop-color="#0369A1" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="24" fill="url(#bgGradBio)" />
        <!-- Shield -->
        <path d="M50 20 L76 30 C76 56 64 74 50 82 C36 74 24 56 24 30 Z" fill="#F0F9FF" stroke="#38BDF8" stroke-width="3" />
        <!-- Verified Green Checkmark in Shield -->
        <circle cx="50" cy="50" r="18" fill="#10B981" />
        <path d="M42 50 L47 55 L58 43" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `),
  },
];

export const TIMOTHY_DEFAULT_AVATAR = PRESET_AVATARS[0].svg;
