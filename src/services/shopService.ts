/**
 * Shop Service - Connects to Supabase
 */
import { supabase } from "@/lib/supabase";
import { apiGet, apiPost } from "./api";

export interface ProductVariant {
    id: string;
    size: string;
    price_kes: number;
    stock_quantity: number;
    is_available: boolean;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    category: string;
    badge: string | null;
    images: string[];
    rating: number;
    review_count: number;
    is_active: boolean;
    variants: ProductVariant[];
}

export const fallbackProducts: Product[] = [
    // ========== HONEY PRODUCTS (8) ==========
    {
        id: "honey-1",
        name: "Highland Blossom Honey",
        description: "Rare, multi-floral honey harvested from the pristine Aberdare highlands. Delicate floral notes with a smooth, lingering finish.",
        category: "honey",
        badge: "Bestseller",
        images: [
            "/images/products/honey_lifestyle_1.jpg",
            "/images/products/beeyield_honey_250g.png",
            "/images/products/beeyield_honey_500g.png",
            "/images/products/beeyield_honey_1kg.png",
            "/images/products/highland_blossom_honey.png"
        ],
        rating: 4.9,
        review_count: 128,
        is_active: true,
        variants: [
            { id: "v1", size: "250g", price_kes: 250, stock_quantity: 100, is_available: true },
            { id: "v2", size: "500g", price_kes: 500, stock_quantity: 75, is_available: true },
            { id: "v3", size: "1kg", price_kes: 1000, stock_quantity: 50, is_available: true }
        ]
    },
    {
        id: "honey-2",
        name: "Savannah Gold Honey",
        description: "Rich, amber honey with distinctive citrus and acacia undertones from the Kibwezi savannah. Bold and energizing.",
        category: "honey",
        badge: "Premium",
        images: [
            "/images/products/honey_lifestyle_2.jpg",
            "/images/products/beeyield_honey_250g.png",
            "/images/products/beeyield_honey_500g.png",
            "/images/products/beeyield_honey_1kg.png",
            "/images/products/savannah_blossom_honey.png"
        ],
        rating: 4.8,
        review_count: 89,
        is_active: true,
        variants: [
            { id: "v4", size: "250g", price_kes: 250, stock_quantity: 80, is_available: true },
            { id: "v5", size: "500g", price_kes: 500, stock_quantity: 60, is_available: true },
            { id: "v6", size: "1kg", price_kes: 1000, stock_quantity: 40, is_available: true }
        ]
    },
    {
        id: "honey-3",
        name: "Mara Wildflower Honey",
        description: "Exquisite wildflower honey from the Maasai Mara region. Complex, aromatic profile with hints of wild herbs and grassland blooms.",
        category: "honey",
        badge: "Limited Edition",
        images: [
            "/images/products/honey_lifestyle_3.jpg",
            "/images/products/beeyield_honey_250g.png",
            "/images/products/beeyield_honey_500g.png",
            "/images/products/beeyield_honey_1kg.png",
            "/images/products/wildflower_honey.png"
        ],
        rating: 4.9,
        review_count: 67,
        is_active: true,
        variants: [
            { id: "v-h3-1", size: "250g", price_kes: 250, stock_quantity: 40, is_available: true },
            { id: "v-h3-2", size: "500g", price_kes: 500, stock_quantity: 30, is_available: true },
            { id: "v-h3-3", size: "1kg", price_kes: 1000, stock_quantity: 20, is_available: true }
        ]
    },
    {
        id: "honey-4",
        name: "Pure Acacia Honey",
        description: "Light, mild honey with a subtle sweetness. Perfect for tea, baking, and those who prefer delicate flavors.",
        category: "honey",
        badge: "Organic",
        images: [
            "/images/products/honey_lifestyle_4.jpg",
            "/images/products/beeyield_honey_250g.png",
            "/images/products/beeyield_honey_500g.png",
            "/images/products/beeyield_honey_1kg.png",
            "/images/products/acacia_honey.png"
        ],
        rating: 4.7,
        review_count: 156,
        is_active: true,
        variants: [
            { id: "v-h4-1", size: "250g", price_kes: 250, stock_quantity: 120, is_available: true },
            { id: "v-h4-2", size: "500g", price_kes: 500, stock_quantity: 90, is_available: true },
            { id: "v-h4-3", size: "1kg", price_kes: 1000, stock_quantity: 60, is_available: true }
        ]
    },
    {
        id: "honey-5",
        name: "Desert Bloom Honey",
        description: "Unique honey from desert-adapted flora in Northern Kenya. Crystallizes naturally with a creamy texture.",
        category: "honey",
        badge: "Rare",
        images: [
            "/images/products/honey_lifestyle_5.jpg",
            "/images/products/beeyield_honey_250g.png",
            "/images/products/beeyield_honey_500g.png",
            "/images/products/beeyield_honey_1kg.png",
            "/images/products/desert_bloom_honey.png"
        ],
        rating: 4.8,
        review_count: 34,
        is_active: true,
        variants: [
            { id: "v-h5-1", size: "250g", price_kes: 250, stock_quantity: 25, is_available: true },
            { id: "v-h5-2", size: "500g", price_kes: 500, stock_quantity: 15, is_available: true },
            { id: "v-h5-3", size: "1kg", price_kes: 1000, stock_quantity: 10, is_available: true }
        ]
    },
    {
        id: "honey-6",
        name: "Eucalyptus Reserve Honey",
        description: "Bold, medicinal honey harvested from eucalyptus forests. Known for its immune-boosting properties.",
        category: "honey",
        badge: "Therapeutic",
        images: [
            "/images/products/honey_lifestyle_1.jpg",
            "/images/products/beeyield_honey_250g.png",
            "/images/products/beeyield_honey_500g.png",
            "/images/products/beeyield_honey_1kg.png",
            "/images/products/eucalyptus_honey.png"
        ],
        rating: 4.9,
        review_count: 78,
        is_active: true,
        variants: [
            { id: "v-h6-1", size: "250g", price_kes: 250, stock_quantity: 70, is_available: true },
            { id: "v-h6-2", size: "500g", price_kes: 500, stock_quantity: 50, is_available: true },
            { id: "v-h6-3", size: "1kg", price_kes: 1000, stock_quantity: 35, is_available: true }
        ]
    },
    {
        id: "honey-7",
        name: "Raw Honeycomb Jar",
        description: "Pure, unprocessed honeycomb straight from the hive, now in our signature jars. Experience honey in its most natural form.",
        category: "honey",
        badge: "Artisan",
        images: [
            "/images/products/honey_lifestyle_2.jpg",
            "/images/products/beeyield_honey_250g.png",
            "/images/products/beeyield_honey_500g.png",
            "/images/products/beeyield_honey_1kg.png",
            "/images/products/honey_comb_chunk.png"
        ],
        rating: 5.0,
        review_count: 92,
        is_active: true,
        variants: [
            { id: "v-h7-1", size: "250g", price_kes: 250, stock_quantity: 40, is_available: true },
            { id: "v-h7-2", size: "500g", price_kes: 500, stock_quantity: 25, is_available: true },
            { id: "v-h7-3", size: "1kg", price_kes: 1000, stock_quantity: 15, is_available: true }
        ]
    },
    {
        id: "honey-8",
        name: "Coastal Mangrove Honey",
        description: "Exotic honey from the mangrove forests of the Kenyan coast. Unique minerality with caramel undertones.",
        category: "honey",
        badge: "New",
        images: [
            "/images/products/honey_lifestyle_3.jpg",
            "/images/products/beeyield_honey_250g.png",
            "/images/products/beeyield_honey_500g.png",
            "/images/products/beeyield_honey_1kg.png",
            "/images/products/savannah_blossom_honey.png"
        ],
        rating: 4.6,
        review_count: 23,
        is_active: true,
        variants: [
            { id: "v-h8-1", size: "250g", price_kes: 250, stock_quantity: 35, is_available: true },
            { id: "v-h8-2", size: "500g", price_kes: 500, stock_quantity: 20, is_available: true },
            { id: "v-h8-3", size: "1kg", price_kes: 1000, stock_quantity: 10, is_available: true }
        ]
    },
    // ========== HARDWARE/SENSORS PRODUCTS (8) ==========
    {
        id: "hw-1",
        name: "ApiSense Sentinel Node",
        description: "Advanced IoT hive monitor with acoustic disease detection, temperature, and humidity sensors. Real-time alerts via cellular network.",
        category: "hardware",
        badge: "New Technology",
        images: ["/images/products/solar_hive_monitor.png"],
        rating: 5.0,
        review_count: 12,
        is_active: true,
        variants: [
            { id: "v-hw-1", size: "Standard Unit", price_kes: 15000, stock_quantity: 50, is_available: true }
        ]
    },
    {
        id: "hw-2",
        name: "BeeYield Hive Scale",
        description: "Precision weight monitoring with 4G connectivity. Track honey flow and colony growth in real-time from your dashboard.",
        category: "hardware",
        badge: "Best Value",
        images: ["/images/products/hive_temp_sensor.png"],
        rating: 4.8,
        review_count: 24,
        is_active: true,
        variants: [
            { id: "v-hw-2", size: "Standard Unit", price_kes: 12500, stock_quantity: 50, is_available: true }
        ]
    },
    {
        id: "hw-3",
        name: "BeeSense Humidity Monitor",
        description: "Compact IoT humidity sensor with digital display. Track optimal hive conditions for healthy bee colonies.",
        category: "hardware",
        badge: "Essential",
        images: ["/images/products/hive_humidity_sensor.png"],
        rating: 4.9,
        review_count: 38,
        is_active: true,
        variants: [
            { id: "v-hw-3", size: "Standard Unit", price_kes: 8500, stock_quantity: 75, is_available: true }
        ]
    },
    {
        id: "hw-4",
        name: "Solar Power Kit",
        description: "Complete solar panel kit for off-grid hive monitoring. Powers all BeeYield sensors for 24/7 operation.",
        category: "hardware",
        badge: "Eco-Friendly",
        images: ["/images/products/solar_hive_monitor.png"],
        rating: 4.7,
        review_count: 19,
        is_active: true,
        variants: [
            { id: "v-hw-4-1", size: "5W Panel", price_kes: 4500, stock_quantity: 60, is_available: true },
            { id: "v-hw-4-2", size: "10W Panel", price_kes: 7500, stock_quantity: 40, is_available: true }
        ]
    },
    {
        id: "hw-5",
        name: "Hive Gateway Hub",
        description: "Central hub connecting up to 20 hive sensors. Aggregates data and provides mesh networking for remote apiaries.",
        category: "hardware",
        badge: "Professional",
        images: ["/images/products/hive_temp_sensor.png"],
        rating: 4.9,
        review_count: 15,
        is_active: true,
        variants: [
            { id: "v-hw-5", size: "Standard Unit", price_kes: 22000, stock_quantity: 25, is_available: true }
        ]
    },
    {
        id: "hw-6",
        name: "Acoustic Swarm Detector",
        description: "AI-powered sound analysis module that predicts swarming events 48 hours in advance. Protect your colonies.",
        category: "hardware",
        badge: "AI Powered",
        images: ["/images/products/hive_humidity_sensor.png"],
        rating: 5.0,
        review_count: 8,
        is_active: true,
        variants: [
            { id: "v-hw-6", size: "Standard Unit", price_kes: 18500, stock_quantity: 30, is_available: true }
        ]
    },
    {
        id: "hw-7",
        name: "Weather Station Pro",
        description: "Agricultural weather station with wind, rain, UV, and barometric sensors. Integrates with your hive dashboard.",
        category: "hardware",
        badge: "Premium",
        images: ["/images/products/solar_hive_monitor.png"],
        rating: 4.8,
        review_count: 22,
        is_active: true,
        variants: [
            { id: "v-hw-7", size: "Complete Kit", price_kes: 28000, stock_quantity: 15, is_available: true }
        ]
    },
    {
        id: "hw-8",
        name: "Starter Sensor Bundle",
        description: "Perfect for beginners! Includes temperature, humidity, and weight sensors for monitoring 3 hives.",
        category: "hardware",
        badge: "Best for Beginners",
        images: ["/images/products/hive_temp_sensor.png"],
        rating: 4.9,
        review_count: 45,
        is_active: true,
        variants: [
            { id: "v-hw-8", size: "3-Hive Bundle", price_kes: 35000, stock_quantity: 20, is_available: true }
        ]
    },
    // ========== MERCH PRODUCTS (8) ==========
    {
        id: "merch-1",
        name: "BeeYield Classic Tee",
        description: "100% organic cotton with embroidered BeeYield logo. Durable, breathable, and supports sustainable pollination.",
        category: "merch",
        badge: "Eco-Friendly",
        images: ["/images/products/beekeeper_tshirt.png"],
        rating: 4.7,
        review_count: 56,
        is_active: true,
        variants: [
            { id: "v13", size: "S", price_kes: 2500, stock_quantity: 30, is_available: true },
            { id: "v14", size: "M", price_kes: 2500, stock_quantity: 50, is_available: true },
            { id: "v15", size: "L", price_kes: 2500, stock_quantity: 50, is_available: true },
            { id: "v16", size: "XL", price_kes: 2500, stock_quantity: 30, is_available: true }
        ]
    },
    {
        id: "merch-2",
        name: "Pollinator Hoodie",
        description: "Premium heavyweight organic cotton hoodie. Perfect for early morning hive inspections.",
        category: "merch",
        badge: "Seasonal",
        images: ["/images/products/beeyield_hoodie.png"],
        rating: 4.9,
        review_count: 42,
        is_active: true,
        variants: [
            { id: "v17", size: "M", price_kes: 4500, stock_quantity: 20, is_available: true },
            { id: "v18", size: "L", price_kes: 4500, stock_quantity: 25, is_available: true },
            { id: "v18-xl", size: "XL", price_kes: 4500, stock_quantity: 15, is_available: true }
        ]
    },
    {
        id: "merch-3",
        name: "Hive & Co. Trucker Cap",
        description: "Premium mesh-back trucker cap with embroidered bee logo. Adjustable fit, breathable design.",
        category: "merch",
        badge: "New Arrival",
        images: ["/images/products/beeyield_cap.png"],
        rating: 4.8,
        review_count: 31,
        is_active: true,
        variants: [
            { id: "v-m3", size: "One Size", price_kes: 1800, stock_quantity: 80, is_available: true }
        ]
    },
    {
        id: "merch-4",
        name: "Canvas Tote Bag",
        description: "Heavy-duty canvas tote with honeycomb print. Perfect for farmers markets and grocery runs.",
        category: "merch",
        badge: "Sustainable",
        images: ["/images/products/beeyield_tote_bag.png"],
        rating: 4.6,
        review_count: 67,
        is_active: true,
        variants: [
            { id: "v-m4", size: "Standard", price_kes: 1500, stock_quantity: 100, is_available: true }
        ]
    },
    {
        id: "merch-5",
        name: "Beekeeper Work Shirt",
        description: "Long-sleeve cotton work shirt with ventilated back panel. Professional look for the modern apiarist.",
        category: "merch",
        badge: "Professional",
        images: ["/images/products/beekeeper_tshirt.png"],
        rating: 4.7,
        review_count: 28,
        is_active: true,
        variants: [
            { id: "v-m5-1", size: "M", price_kes: 3200, stock_quantity: 25, is_available: true },
            { id: "v-m5-2", size: "L", price_kes: 3200, stock_quantity: 35, is_available: true },
            { id: "v-m5-3", size: "XL", price_kes: 3200, stock_quantity: 20, is_available: true }
        ]
    },
    {
        id: "merch-6",
        name: "Honey Harvest Apron",
        description: "Durable waxed canvas apron with multiple pockets. Protects while extracting and bottling honey.",
        category: "merch",
        badge: "Handcrafted",
        images: ["/images/products/beeyield_hoodie.png"],
        rating: 4.9,
        review_count: 19,
        is_active: true,
        variants: [
            { id: "v-m6", size: "One Size", price_kes: 3800, stock_quantity: 40, is_available: true }
        ]
    },
    {
        id: "merch-7",
        name: "Kids Bee Explorer Tee",
        description: "Fun, educational t-shirt for young bee enthusiasts. Features cartoon bees and pollination facts.",
        category: "merch",
        badge: "Kids",
        images: ["/images/products/beekeeper_tshirt.png"],
        rating: 4.8,
        review_count: 52,
        is_active: true,
        variants: [
            { id: "v-m7-1", size: "Age 4-6", price_kes: 1800, stock_quantity: 30, is_available: true },
            { id: "v-m7-2", size: "Age 7-9", price_kes: 1800, stock_quantity: 35, is_available: true },
            { id: "v-m7-3", size: "Age 10-12", price_kes: 1800, stock_quantity: 25, is_available: true }
        ]
    },
    {
        id: "merch-8",
        name: "Limited Edition Jacket",
        description: "Premium windbreaker jacket with reflective bee pattern. Water-resistant and stylish.",
        category: "merch",
        badge: "Limited",
        images: ["/images/products/beeyield_hoodie.png"],
        rating: 5.0,
        review_count: 14,
        is_active: true,
        variants: [
            { id: "v-m8-1", size: "M", price_kes: 6500, stock_quantity: 10, is_available: true },
            { id: "v-m8-2", size: "L", price_kes: 6500, stock_quantity: 12, is_available: true }
        ]
    },
    // ========== EDUCATION/LEARN PRODUCTS (8) ==========
    {
        id: "edu-1",
        name: "Beekeeping Starter Guide",
        description: "Comprehensive 85-page PDF covering hive selection, bee health, and honey harvesting for beginners in East Africa.",
        category: "education",
        badge: "Digital",
        images: ["/images/products/beekeeping_guide.png"],
        rating: 4.9,
        review_count: 215,
        is_active: true,
        variants: [
            { id: "v22", size: "PDF Download", price_kes: 1500, stock_quantity: 9999, is_available: true }
        ]
    },
    {
        id: "edu-2",
        name: "Precision Pollination Handbook",
        description: "Advanced techniques for using data to optimize crop yields. Essential for commercial farmers and professional beekeepers.",
        category: "education",
        badge: "Professional",
        images: ["/images/products/beekeeping_guide.png"],
        rating: 5.0,
        review_count: 48,
        is_active: true,
        variants: [
            { id: "v23", size: "PDF Download", price_kes: 3500, stock_quantity: 9999, is_available: true }
        ]
    },
    {
        id: "edu-3",
        name: "Queen Rearing Masterclass",
        description: "Video course with 12 hours of expert instruction on queen breeding, grafting, and colony management.",
        category: "education",
        badge: "Video Course",
        images: ["/images/products/beekeeping_guide.png"],
        rating: 4.8,
        review_count: 87,
        is_active: true,
        variants: [
            { id: "v-e3", size: "Online Access", price_kes: 5500, stock_quantity: 9999, is_available: true }
        ]
    },
    {
        id: "edu-4",
        name: "Honey Processing Manual",
        description: "Complete guide to extraction, filtering, bottling, and quality certification for commercial honey production.",
        category: "education",
        badge: "Bestseller",
        images: ["/images/products/beekeeping_guide.png"],
        rating: 4.7,
        review_count: 134,
        is_active: true,
        variants: [
            { id: "v-e4", size: "PDF Download", price_kes: 2500, stock_quantity: 9999, is_available: true }
        ]
    },
    {
        id: "edu-5",
        name: "IoT Hive Monitoring Course",
        description: "Learn to set up, calibrate, and interpret data from BeeYield sensors. Includes troubleshooting guides.",
        category: "education",
        badge: "Technical",
        images: ["/images/products/beekeeping_guide.png"],
        rating: 4.9,
        review_count: 56,
        is_active: true,
        variants: [
            { id: "v-e5", size: "Online Access", price_kes: 4000, stock_quantity: 9999, is_available: true }
        ]
    },
    {
        id: "edu-6",
        name: "Disease & Pest Management",
        description: "Identify and treat common bee diseases and pests in East Africa. Includes natural and chemical treatment options.",
        category: "education",
        badge: "Essential",
        images: ["/images/products/beekeeping_guide.png"],
        rating: 4.8,
        review_count: 98,
        is_active: true,
        variants: [
            { id: "v-e6", size: "PDF Download", price_kes: 2000, stock_quantity: 9999, is_available: true }
        ]
    },
    {
        id: "edu-7",
        name: "Business of Beekeeping",
        description: "Transform your hobby into a profitable venture. Covers pricing, marketing, regulations, and scaling operations.",
        category: "education",
        badge: "Entrepreneur",
        images: ["/images/products/beekeeping_guide.png"],
        rating: 4.6,
        review_count: 73,
        is_active: true,
        variants: [
            { id: "v-e7", size: "PDF + Templates", price_kes: 4500, stock_quantity: 9999, is_available: true }
        ]
    },
    {
        id: "edu-8",
        name: "Complete Beekeeper Bundle",
        description: "All educational materials in one package! Includes all guides, courses, and lifetime updates.",
        category: "education",
        badge: "Best Value",
        images: ["/images/products/beekeeping_guide.png"],
        rating: 5.0,
        review_count: 42,
        is_active: true,
        variants: [
            { id: "v-e8", size: "Full Bundle", price_kes: 15000, stock_quantity: 9999, is_available: true }
        ]
    }
];

export const getProducts = async (category_name?: string): Promise<Product[]> => {
    try {
        const params: any = {};
        if (category_name) params.category = category_name;

        const products = await apiGet<Product[]>('/shop/products', params);
        return products;
    } catch (error) {
        console.error("Error fetching products from API:", error);
        // Fallback to local products if API fails
        return category_name
            ? fallbackProducts.filter(p => p.category === category_name)
            : fallbackProducts;
    }
};

export const getProduct = async (productId: string): Promise<Product | null> => {
    try {
        return await apiGet<Product>(`/shop/products/${productId}`);
    } catch (error) {
        console.error("Error fetching product from API:", error);
        return fallbackProducts.find(p => p.id === productId) || null;
    }
};

export interface CheckoutOrder {
    shipping_address: {
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        county: string;
        postal_code?: string;
    };
    payment_method: "mpesa" | "card";
    items: {
        product_id: string;
        variant_id: string;
        quantity: number;
    }[];
    total_kes: number;
    notes?: string;
}

export interface CheckoutResponse {
    order_id: string;
    order_number: string;
    status: string;
    message: string;
    payment_info?: any;
}

export const initializeCheckout = async (orderData: CheckoutOrder, accessToken?: string): Promise<CheckoutResponse> => {
    try {
        const headers: Record<string, string> = {};
        if (accessToken) {
            headers.Authorization = `Bearer ${accessToken}`;
        } else if (supabase) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) headers.Authorization = `Bearer ${session.access_token}`;
        }

        return await apiPost<CheckoutResponse>('/shop/checkout/init', orderData, { headers });
    } catch (error) {
        console.error("Error initializing checkout via API:", error);
        throw error;
    }
};


export const mockOrders = [
    {
        id: "ord_12345678",
        order_number: "BY-7829-XJ",
        status: "processing",
        total_amount: 4500,
        payment_method: "mpesa",
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        shipping_address: {
            first_name: "Timothy",
            last_name: "Nduva",
            address: "123 Green Avenue, Westlands",
            city: "Nairobi",
            county: "Nairobi",
            phone: "+254712345678"
        },
        items: [
            { product_id: "honey-1", name: "Highland Blossom Honey", quantity: 2, price: 1500 },
            { product_id: "honey-2", name: "Savannah Gold Honey", quantity: 1, price: 1500 }
        ]
    },
    {
        id: "ord_87654321",
        order_number: "BY-3321-KL",
        status: "delivered",
        total_amount: 2800,
        payment_method: "card",
        created_at: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
        shipping_address: {
            first_name: "Timothy",
            last_name: "Nduva",
            address: "123 Green Avenue, Westlands",
            city: "Nairobi",
            county: "Nairobi",
            phone: "+254712345678"
        },
        items: [
            { product_id: "merch-1", name: "BeeYield Classic Tee", quantity: 1, price: 2500 },
            { product_id: "honey-4", name: "Pure Acacia Honey (Sample)", quantity: 1, price: 300 }
        ]
    }
];

export const getUserOrders = async (email: string): Promise<any[]> => {
    try {
        const { data: { session } } = await (supabase ? supabase.auth.getSession() : Promise.resolve({ data: { session: null } }));
        const headers: Record<string, string> = {};
        if (session) headers.Authorization = `Bearer ${session.access_token}`;

        const orders = await apiGet<any[]>('/shop/orders', { email }, { headers });
        return Array.isArray(orders) && orders.length > 0 ? orders : mockOrders;
    } catch (error) {
        console.error("Error fetching user orders via API, using fallbacks:", error);
        return mockOrders;
    }
};


