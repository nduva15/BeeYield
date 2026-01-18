export interface BeeProductDetail {
    product: string;
    composition: string;
    uses: string[];
    shelfLife: string;
    technicalProperties: string;
    harvestMethod: string;
}

export const beeProductData: Record<string, BeeProductDetail> = {
    "Raw Honey": {
        product: "Raw Honey",
        composition: "80% sugars (fructose/glucose), 17-18% water, enzymes, minerals, and pollen.",
        uses: ["Natural sweetener", "Wound healing (antibacterial)", "Cough suppressant", "Preservative"],
        shelfLife: "Indefinite if sealed (naturally antibacterial due to low pH and hydrogen peroxide).",
        technicalProperties: "pH: 3.2 - 4.5. High osmotic pressure. Specific gravity: 1.4. Non-Newtonian fluid behavior.",
        harvestMethod: "Centrifugal extraction (Langstroth) or Crush and Strain (Top Bar)."
    },
    "Beeswax": {
        product: "Beeswax",
        composition: "Complex mix of fatty acid esters and long-chain alcohols.",
        uses: ["Candle making", "Cosmetics (balms/lotions)", "Food wrap (Beeswrap)", "Industrial lubricants"],
        shelfLife: "Indefinite. Stable under normal conditions.",
        technicalProperties: "Melting point: 62-64°C (144-147°F). Insoluble in water, highly soluble in organic solvents.",
        harvestMethod: "Melting cappings or old combs followed by double filtration."
    },
    "Propolis (Bee Glue)": {
        product: "Propolis",
        composition: "50% resin, 30% wax, 10% essential oils, 5% pollen.",
        uses: ["Natural antibiotic", "Varnish for musical instruments", "Dental care (gum health)", "Anti-viral supplements"],
        shelfLife: "3-5 years if stored cold and dark.",
        technicalProperties: "Rich in flavonoids and phenolics. Strong antimicrobial activity against Gram-positive bacteria.",
        harvestMethod: "Scraping from hive parts or using specialized Propolis Traps (plastic screens)."
    },
    "Royal Jelly": {
        product: "Royal Jelly",
        composition: "Water, proteins (MRJPs), carbohydrates, and lipids (10-HDA).",
        uses: ["Dietary supplement", "Anti-aging skincare", "Fertility support"],
        shelfLife: "2 weeks (refrigerated), 1 year (frozen). Highly perishable.",
        technicalProperties: "Contains 10-Hydroxy-2-decenoic acid (10-HDA), the unique bio-active marker found only in Royal Jelly.",
        harvestMethod: "Suction from queen cells after 72 hours of larval growth; requires queenless cell-builder hives."
    },
    "Bee Pollen": {
        product: "Bee Pollen",
        composition: "25-40% protein, amino acids, lipids, and vitamins.",
        uses: ["Protein supplement", "Allergy desensitization", "Natural energy booster"],
        shelfLife: "1 year (dried), 2 years (frozen).",
        technicalProperties: "High bio-availability of essential amino acids. Varies in color based on floral source.",
        harvestMethod: "Pollen traps that dislodge pellets from the forager's corbicula (pollen basket)."
    },
    "Bee Venom (Apitoxin)": {
        product: "Bee Venom",
        composition: "Peptides (Melittin, Apamin), enzymes, and bio-active amines.",
        uses: ["Apitherapy (Arthritis/MS)", "Cosmetics (natural botox/plumping)", "Desensitization for bee allergies"],
        shelfLife: "Stable for months when dried and refrigerated.",
        technicalProperties: "Melittin (50% of dry weight) causes cell membrane disruption and anti-inflammatory response.",
        harvestMethod: "Electro-stimulation using a glass plate placed at the hive entrance; bees sting the glass without dying."
    }
};
