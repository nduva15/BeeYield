export interface LocationData {
    slug: string;
    cityName: string;
    regionName: string;
    description: string;
    address: string;
    crops: string[];
    stats: { label: string; value: string }[];
    heroImage: string;
}

export const locations: LocationData[] = [
    {
        slug: 'kibwezi',
        cityName: 'Kibwezi',
        regionName: 'Lower Eastern',
        description: "East Africa's premier precision pollination hub. We optimize yields for mangoes, sisal, and legumes across the Kibwezi corridor using real-time IoT hive analytics.",
        address: 'Off Mombasa Road, Kibwezi, Makueni County, Kenya',
        crops: ['Mango', 'Sisal', 'Maize', 'Beans'],
        stats: [
            { label: 'Hives in Region', value: '450+' },
            { label: 'Avg Yield Increase', value: '38%' },
            { label: 'Managed Acres', value: '1,200' }
        ],
        heroImage: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=1920'
    },
    {
        slug: 'makueni',
        cityName: 'Makueni',
        regionName: 'Makueni County',
        description: "Sustainable pollination and honey traceability across Makueni. Supporting thousands of smallholder farmers with tech-enabled solutions for a food-secure future.",
        address: 'Makueni Town Center, Makueni County, Kenya',
        crops: ['Macadamia', 'Coffee', 'Mango', 'Sunflower'],
        stats: [
            { label: 'Beekeepers Trained', value: '250+' },
            { label: 'Avg Yield Increase', value: '35%' },
            { label: 'Water Points built', value: '12' }
        ],
        heroImage: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=1920'
    },
    {
        slug: 'embu',
        cityName: 'Embu',
        regionName: 'Mt. Kenya East',
        description: "Driving macadamia and coffee yields across Embu. Our precision pollination services help farmers achieve premium export quality through better flower set and IoT monitoring.",
        address: 'Embu Town Center, Embu County, Kenya',
        crops: ['Macadamia', 'Coffee', 'Tea', 'Dairy'],
        stats: [
            { label: 'Yield Increase', value: '42%' },
            { label: 'Hives Placed', value: '300+' },
            { label: 'Local Partners', value: '15' }
        ],
        heroImage: 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&q=80&w=1920'
    },
    {
        slug: 'meru',
        cityName: 'Meru',
        regionName: 'Mt. Kenya North',
        description: "The avocado and coffee pollination leader in Meru. We partner with cooperatives to ensure consistent pollination across high-altitude farms.",
        address: 'Meru Town Center, Meru County, Kenya',
        crops: ['Avocado', 'Coffee', 'Macadamia', 'Potatoes'],
        stats: [
            { label: 'Avocado Boost', value: '45%' },
            { label: 'Smart Hives', value: '500+' },
            { label: 'Co-ops Served', value: '8' }
        ],
        heroImage: 'https://images.unsplash.com/photo-1605000797499-95a51c521949?auto=format&fit=crop&q=80&w=1920'
    },
    {
        slug: 'machakos',
        cityName: 'Machakos',
        regionName: 'Eastern Kenya',
        description: "Optimizing dryland fruit production and honey traceability in Machakos. Helping farmers leverage sustainable beekeeping for food security.",
        address: 'Machakos Town Center, Machakos County, Kenya',
        crops: ['Mango', 'Citrus', 'Maize', 'Pigeon Peas'],
        stats: [
            { label: 'Farmer Network', value: '400+' },
            { label: 'Yield Stability', value: '30%' },
            { label: 'Water Projects', value: '5' }
        ],
        heroImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1920'
    }
];
