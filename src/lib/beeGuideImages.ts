import bumblebeeImage from '@/assets/bees/bumblebee.jpg';
import carpenterBeeImage from '@/assets/bees/carpenter-bee.jpg';
import dwarfHoneyBeeImage from '@/assets/bees/dwarf-honey-bee.jpg';
import easternHoneyBeeImage from '@/assets/bees/eastern-honey-bee.jpg';
import giantHoneyBeeImage from '@/assets/bees/giant-honey-bee.jpg';
import leafcutterBeeImage from '@/assets/bees/leafcutter-bee.jpg';
import masonBeeImage from '@/assets/bees/mason-bee.jpg';
import miningBeeImage from '@/assets/bees/mining-bee.jpg';
import orchidBeeImage from '@/assets/bees/orchid-bee.jpg';
import stinglessBeeImage from '@/assets/bees/stingless-bee.jpg';
import sweatBeeImage from '@/assets/bees/sweat-bee.jpg';
import westernHoneyBeeImage from '@/assets/bees/western-honey-bee.jpg';

const LIVE_IMAGE_KEYS = [
    'live_photo_url',
    'livePhotoUrl',
    'image_url',
    'imageUrl',
    'photo_url',
    'photoUrl',
    'thumbnail_url',
    'thumbnailUrl',
    'image',
    'photo',
    'cover_image',
    'coverImage',
] as const;

const speciesFallbacks: Record<string, string> = {
    apis_mellifera: westernHoneyBeeImage,
    'apis mellifera': westernHoneyBeeImage,
    'western honey bee': westernHoneyBeeImage,
    apis_cerana: easternHoneyBeeImage,
    'apis cerana': easternHoneyBeeImage,
    'eastern honey bee': easternHoneyBeeImage,
    apis_dorsata: giantHoneyBeeImage,
    'apis dorsata': giantHoneyBeeImage,
    'giant honey bee': giantHoneyBeeImage,
    apis_florea: dwarfHoneyBeeImage,
    'apis florea': dwarfHoneyBeeImage,
    'dwarf honey bee': dwarfHoneyBeeImage,
    bombus_terrestris: bumblebeeImage,
    'bombus terrestris': bumblebeeImage,
    bumblebee: bumblebeeImage,
    'buff-tailed bumblebee': bumblebeeImage,
    megachile_rotundata: leafcutterBeeImage,
    'megachile rotundata': leafcutterBeeImage,
    'alfalfa leafcutter bee': leafcutterBeeImage,
    osmia_cornuta: masonBeeImage,
    'osmia cornuta': masonBeeImage,
    'european orchard bee': masonBeeImage,
    osmia_lignaria: masonBeeImage,
    'osmia lignaria': masonBeeImage,
    'blue orchard bee': masonBeeImage,
    xylocopa_virginica: carpenterBeeImage,
    'xylocopa virginica': carpenterBeeImage,
    xylocopa_violacea: carpenterBeeImage,
    'xylocopa violacea': carpenterBeeImage,
    'violet carpenter bee': carpenterBeeImage,
    'eastern carpenter bee': carpenterBeeImage,
    andrena_carantonica: miningBeeImage,
    'andrena carantonica': miningBeeImage,
    andrena_milwaukeensis: miningBeeImage,
    'andrena milwaukeensis': miningBeeImage,
    'common mining bee': miningBeeImage,
    'milwaukee mining bee': miningBeeImage,
    eufriesea_purpurata: orchidBeeImage,
    'eufriesea purpurata': orchidBeeImage,
    'orchid bee': orchidBeeImage,
    melipona_beecheii: stinglessBeeImage,
    'melipona beecheii': stinglessBeeImage,
    trigona_carbonaria: stinglessBeeImage,
    'trigona carbonaria': stinglessBeeImage,
    meliponula_ferruginea: stinglessBeeImage,
    'meliponula ferruginea': stinglessBeeImage,
    'stingless bee': stinglessBeeImage,
    halictus_confusus: sweatBeeImage,
    'halictus confusus': sweatBeeImage,
    augochlora_pura: sweatBeeImage,
    'augochlora pura': sweatBeeImage,
    'sweat bee': sweatBeeImage,
};

const normalize = (value: unknown): string => String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

const getStringValue = (value: unknown): string | null => {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
};

export const getLiveGuideImage = (item: Record<string, unknown> | null | undefined): string | null => {
    if (!item) return null;

    for (const key of LIVE_IMAGE_KEYS) {
        const value = getStringValue(item[key]);
        if (value) return value;
    }

    const photoArray = Array.isArray(item.photos) ? item.photos : Array.isArray(item.images) ? item.images : null;
    if (photoArray) {
        for (const entry of photoArray) {
            if (typeof entry === 'string' && entry.trim()) return entry.trim();
            if (entry && typeof entry === 'object') {
                const nested = getStringValue((entry as Record<string, unknown>).url)
                    || getStringValue((entry as Record<string, unknown>).src)
                    || getStringValue((entry as Record<string, unknown>).image_url)
                    || getStringValue((entry as Record<string, unknown>).photo_url);
                if (nested) return nested;
            }
        }
    }

    return null;
};

export const getGuideFallbackImage = (item: Record<string, unknown> | null | undefined): string | null => {
    if (!item) return null;

    const candidates = [
        item.id,
        item.name,
        item.commonName,
        item.common_name,
        item.scientificName,
        item.scientific_name,
    ];

    for (const candidate of candidates) {
        const match = speciesFallbacks[normalize(candidate)];
        if (match) return match;
    }

    return null;
};

export const getGuideImage = (item: Record<string, unknown> | null | undefined): string | null =>
    getLiveGuideImage(item) || getGuideFallbackImage(item);
