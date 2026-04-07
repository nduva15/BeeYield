export interface LearnMaterial {
  productId: string;
  productName: string;
  slug: string;
  subtitle: string;
  formatLabel: string;
  teaser: string;
  fileName: string;
}

export const LEARN_MATERIALS: LearnMaterial[] = [
  {
    productId: "edu-1",
    productName: "BEEKEEPING STARTER GUIDE",
    slug: "beeyield-beekeeping-starter-guide",
    subtitle: "A practical first-season handbook for apiary setup, inspections, feeding, and harvest timing.",
    formatLabel: "12+ page PDF handbook",
    teaser: "Start with the right site, the right box, and a routine your bees can actually thrive in.",
    fileName: "beeyield-beekeeping-starter-guide.pdf",
  },
  {
    productId: "edu-2",
    productName: "PRECISION POLLINATION HANDBOOK",
    slug: "beeyield-precision-pollination-handbook",
    subtitle: "BeeYield's field model for crop deployment, colony strength, bloom timing, and frames per acre.",
    formatLabel: "12+ page PDF handbook",
    teaser: "Move from hive counts to measurable pollination power with a frames-per-acre operating model.",
    fileName: "beeyield-precision-pollination-handbook.pdf",
  },
  {
    productId: "edu-3",
    productName: "QUEEN REARING MASTERCLASS",
    slug: "beeyield-queen-rearing-masterclass-workbook",
    subtitle: "Companion workbook for selecting breeder stock, grafting larvae, building nucs, and introducing queens.",
    formatLabel: "12+ page PDF workbook",
    teaser: "Use the course alongside a field-ready workbook that keeps queen rearing disciplined and repeatable.",
    fileName: "beeyield-queen-rearing-masterclass-workbook.pdf",
  },
  {
    productId: "edu-4",
    productName: "HONEY PROCESSING MANUAL",
    slug: "beeyield-honey-processing-manual",
    subtitle: "A post-harvest guide to moisture control, extraction hygiene, settling, bottling, and traceability.",
    formatLabel: "12+ page PDF manual",
    teaser: "Protect flavour, enzymes, and shelf life from the moment supers leave the yard.",
    fileName: "beeyield-honey-processing-manual.pdf",
  },
  {
    productId: "edu-5",
    productName: "HIVE MONITORING COURSE",
    slug: "beeyield-hive-monitoring-course-handbook",
    subtitle: "Technical handbook for using BeeYield sensor data to interpret brood heat, humidity, weight, sound, and alerts.",
    formatLabel: "12+ page PDF handbook",
    teaser: "Learn what each sensor means, what a healthy signal looks like, and when to walk to the hive.",
    fileName: "beeyield-hive-monitoring-course-handbook.pdf",
  },
  {
    productId: "edu-6",
    productName: "DISEASE & PEST MANAGEMENT",
    slug: "beeyield-disease-and-pest-management",
    subtitle: "A biosecurity-first field guide to Varroa, foulbrood, Nosema, small hive beetle, wax moth, and stress diagnosis.",
    formatLabel: "12+ page PDF field guide",
    teaser: "Catch the signal early, sample properly, and respond with an integrated management plan.",
    fileName: "beeyield-disease-and-pest-management.pdf",
  },
  {
    productId: "edu-7",
    productName: "BUSINESS OF BEEKEEPING",
    slug: "beeyield-business-of-beekeeping",
    subtitle: "Commercial playbook for pricing, product mix, compliance, market channels, contracts, and scale decisions.",
    formatLabel: "12+ page PDF playbook",
    teaser: "Turn beekeeping into a disciplined enterprise with better numbers, packaging, and market timing.",
    fileName: "beeyield-business-of-beekeeping.pdf",
  },
  {
    productId: "edu-8",
    productName: "COMPLETE BEEKEEPER BUNDLE",
    slug: "beeyield-complete-beekeeper-bundle-roadmap",
    subtitle: "Bundle roadmap with reading order, yearly cadence, KPI sheets, templates, and implementation checklists.",
    formatLabel: "12+ page PDF roadmap",
    teaser: "Use the full library as a system, not a stack of disconnected downloads.",
    fileName: "beeyield-complete-beekeeper-bundle-roadmap.pdf",
  },
];

export const getLearnMaterialByName = (productName: string): LearnMaterial | undefined =>
  LEARN_MATERIALS.find((material) => material.productName === productName);

export const getLearnMaterialById = (productId: string): LearnMaterial | undefined =>
  LEARN_MATERIALS.find((material) => material.productId === productId);
