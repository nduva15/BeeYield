import { X, Sprout, Flower2 } from "lucide-react";

// Florage = nectar/pollen-bearing flora resources around the apiary.
// Expert reference table: top 40 melliferous plants with bloom window, nectar score (0-10),
// pollen score (0-10), flight-attractive radius (m), and notes.
const FLORAGE: Array<{ name: string; latin: string; bloom: string; nectar: number; pollen: number; radius: number; notes: string }> = [
  { name: "Black Locust", latin: "Robinia pseudoacacia", bloom: "May–Jun", nectar: 10, pollen: 4, radius: 1500, notes: "Premium acacia honey; 10–14 day bloom; cold-sensitive" },
  { name: "Manuka", latin: "Leptospermum scoparium", bloom: "Nov–Feb (S.Hem)", nectar: 9, pollen: 5, radius: 1200, notes: "MGO-rich antibacterial honey; NZ/Aus" },
  { name: "Sidr (Christ's Thorn)", latin: "Ziziphus spina-christi", bloom: "Oct–Dec", nectar: 10, pollen: 6, radius: 1500, notes: "Premium arid-zone honey; Yemen/Saudi/Kenya" },
  { name: "Sunflower", latin: "Helianthus annuus", bloom: "Jul–Aug", nectar: 7, pollen: 9, radius: 1200, notes: "Fast crystallisation; high pollen load" },
  { name: "Almond", latin: "Prunus dulcis", bloom: "Feb", nectar: 5, pollen: 10, radius: 800, notes: "First-of-season pollen pulse; CA mass-bloom" },
  { name: "Apple", latin: "Malus domestica", bloom: "Apr–May", nectar: 6, pollen: 8, radius: 600, notes: "King-bloom sets 70%; orchard pollination" },
  { name: "Rapeseed/Canola", latin: "Brassica napus", bloom: "Apr–May", nectar: 9, pollen: 9, radius: 1500, notes: "Heavy crystalliser; major early-summer flow" },
  { name: "Heather (Ling)", latin: "Calluna vulgaris", bloom: "Aug–Sep", nectar: 8, pollen: 6, radius: 1500, notes: "Thixotropic gel-honey; UK moors" },
  { name: "Linden/Basswood", latin: "Tilia spp.", bloom: "Jun–Jul", nectar: 10, pollen: 5, radius: 1200, notes: "Single-tree can yield 10kg honey; menthol notes" },
  { name: "Eucalyptus", latin: "Eucalyptus spp.", bloom: "Year-round (varies)", nectar: 9, pollen: 7, radius: 2000, notes: "200+ species; reliable arid forage" },
  { name: "Clover (White)", latin: "Trifolium repens", bloom: "May–Sep", nectar: 9, pollen: 7, radius: 800, notes: "Workhorse pasture nectar source" },
  { name: "Buckwheat", latin: "Fagopyrum esculentum", bloom: "Jul–Sep", nectar: 8, pollen: 6, radius: 1000, notes: "Dark mineral-rich honey; AM-only nectar flow" },
  { name: "Borage", latin: "Borago officinalis", bloom: "Jun–Sep", nectar: 10, pollen: 7, radius: 800, notes: "Refills nectaries every 2 minutes!" },
  { name: "Phacelia", latin: "Phacelia tanacetifolia", bloom: "Jun–Sep", nectar: 9, pollen: 9, radius: 800, notes: "Top cover-crop for bee forage; purple-blue pollen" },
  { name: "Avocado (Hass)", latin: "Persea americana", bloom: "Mar–May", nectar: 7, pollen: 6, radius: 700, notes: "Dichogamous A/B flowering" },
  { name: "Coffee (Arabica)", latin: "Coffea arabica", bloom: "Sep–Oct (E.Africa)", nectar: 7, pollen: 6, radius: 600, notes: "7-day mass bloom after rain trigger" },
  { name: "Mango", latin: "Mangifera indica", bloom: "Mar (India), Aug (Kenya)", nectar: 6, pollen: 7, radius: 700, notes: "Heat-suppressed >32°C" },
  { name: "Macadamia", latin: "Macadamia integrifolia", bloom: "Aug–Sep", nectar: 7, pollen: 7, radius: 800, notes: "Long racemes need 4 hives/ha" },
  { name: "Blueberry (highbush)", latin: "Vaccinium corymbosum", bloom: "Apr–May", nectar: 6, pollen: 7, radius: 500, notes: "Buzz pollination; bumblebees superior" },
  { name: "Cucurbits (squash)", latin: "Cucurbita spp.", bloom: "Jun–Sep", nectar: 8, pollen: 8, radius: 700, notes: "Squash bees specialised; AM-only flowers" },
  { name: "Citrus (Orange)", latin: "Citrus sinensis", bloom: "Mar–May", nectar: 9, pollen: 7, radius: 1000, notes: "Aromatic premium honey; orange-blossom" },
  { name: "Lavender", latin: "Lavandula angustifolia", bloom: "Jun–Aug", nectar: 8, pollen: 5, radius: 600, notes: "Provence honey; aromatic terpenes" },
  { name: "Goldenrod", latin: "Solidago spp.", bloom: "Aug–Oct", nectar: 8, pollen: 7, radius: 1000, notes: "Critical autumn flow; smelly during ripening" },
  { name: "Aster (Michaelmas)", latin: "Symphyotrichum spp.", bloom: "Sep–Oct", nectar: 7, pollen: 6, radius: 700, notes: "Late-season pollen for winter bees" },
  { name: "Dandelion", latin: "Taraxacum officinale", bloom: "Mar–May", nectar: 6, pollen: 9, radius: 400, notes: "Critical first spring pollen pulse" },
  { name: "Willow (Goat)", latin: "Salix caprea", bloom: "Mar–Apr", nectar: 7, pollen: 10, radius: 800, notes: "Earliest pollen source in temperate zones" },
  { name: "Hawthorn", latin: "Crataegus monogyna", bloom: "May", nectar: 7, pollen: 6, radius: 800, notes: "Hedgerow staple; brief intense bloom" },
  { name: "Ivy", latin: "Hedera helix", bloom: "Sep–Nov", nectar: 8, pollen: 7, radius: 600, notes: "Last major nectar before winter; ivy bee specialist" },
  { name: "Bramble (Blackberry)", latin: "Rubus fruticosus", bloom: "Jun–Aug", nectar: 7, pollen: 6, radius: 700, notes: "Hedgerow workhorse; long bloom" },
  { name: "Lime/Linden Honeydew", latin: "Tilia + aphid", bloom: "Jun–Aug", nectar: 9, pollen: 0, radius: 1500, notes: "Aphid-mediated forest honeydew flow" },
  { name: "Sainfoin", latin: "Onobrychis viciifolia", bloom: "May–Jul", nectar: 9, pollen: 7, radius: 800, notes: "100kg/ha nectar potential; alpine pasture" },
  { name: "Alfalfa", latin: "Medicago sativa", bloom: "Jun–Sep", nectar: 8, pollen: 8, radius: 1000, notes: "Tripping-flower mechanism; leafcutter bees preferred" },
  { name: "Cotton", latin: "Gossypium hirsutum", bloom: "Jun–Sep", nectar: 7, pollen: 6, radius: 800, notes: "Extrafloral nectaries supplement floral flow" },
  { name: "Mesquite", latin: "Prosopis spp.", bloom: "Apr–Jul", nectar: 8, pollen: 7, radius: 1500, notes: "Premium desert honey; SW USA, Argentina" },
  { name: "Tupelo", latin: "Nyssa ogeche", bloom: "Apr–May", nectar: 10, pollen: 5, radius: 800, notes: "Non-crystallising honey; Florida swamps" },
  { name: "Star Thistle", latin: "Centaurea solstitialis", bloom: "Jul–Sep", nectar: 9, pollen: 6, radius: 1000, notes: "California summer dearth-breaker" },
  { name: "Pumpkin/Squash", latin: "Cucurbita pepo", bloom: "Jul–Sep", nectar: 7, pollen: 9, radius: 600, notes: "Large pollen grains; squash bees specialist" },
  { name: "Strawberry", latin: "Fragaria × ananassa", bloom: "Apr–Jun", nectar: 5, pollen: 6, radius: 400, notes: "Per-flower bee visits boost berry size 30%" },
  { name: "Raspberry", latin: "Rubus idaeus", bloom: "May–Jul", nectar: 8, pollen: 7, radius: 600, notes: "Long bloom; high-grade honey" },
  { name: "Vetch (Hairy)", latin: "Vicia villosa", bloom: "May–Jul", nectar: 8, pollen: 7, radius: 800, notes: "Nitrogen-fixing cover crop; bee magnet" },
];

export default function FloragePage({ isOpen, onClose, embedded }: { isOpen: boolean; onClose: () => void; embedded?: boolean }) {
  if (!isOpen) return null;
  return (
    <div className={embedded ? "h-full bg-background/50 backdrop-blur-md rounded-[2.5rem] border border-border overflow-y-auto custom-scroll" : "fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto custom-scroll"}>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Sprout className="w-7 h-7 text-honey" />
            <div>
              <h1 className="font-display text-2xl font-bold text-honey">Florage Database</h1>
              <p className="text-xs text-muted-foreground">{FLORAGE.length} expert melliferous plants — bloom window, nectar/pollen score, flight radius</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-lg border border-border hover:border-primary/50 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left p-3">Plant</th>
                  <th className="text-left p-3">Latin</th>
                  <th className="text-left p-3">Bloom</th>
                  <th className="text-center p-3">Nectar</th>
                  <th className="text-center p-3">Pollen</th>
                  <th className="text-right p-3">Radius (m)</th>
                  <th className="text-left p-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {FLORAGE.map((p) => (
                  <tr key={p.latin} className="border-t border-border hover:bg-muted/30">
                    <td className="p-3 font-semibold text-foreground"><Flower2 className="w-3 h-3 inline mr-1 text-honey" />{p.name}</td>
                    <td className="p-3 italic text-xs text-muted-foreground">{p.latin}</td>
                    <td className="p-3 text-xs">{p.bloom}</td>
                    <td className="p-3 text-center"><Score val={p.nectar} /></td>
                    <td className="p-3 text-center"><Score val={p.pollen} /></td>
                    <td className="p-3 text-right text-xs">{p.radius}</td>
                    <td className="p-3 text-xs text-muted-foreground">{p.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl border border-honey/30 bg-honey/5 text-sm">
          <b className="text-honey">Linked tools:</b> Florage scores feed the <b>Pollination Planning</b> page (florage diversity multiplier), the <b>MOA View</b> (florage radius overlay), and the <b>Activity Forecaster</b> (expected bees/min from florage abundance × weather).
        </div>
      </div>
    </div>
  );
}

function Score({ val }: { val: number }) {
  const filled = "★".repeat(Math.round(val / 2));
  const empty = "☆".repeat(5 - Math.round(val / 2));
  return <span className="text-honey text-xs">{filled}<span className="text-muted-foreground">{empty}</span></span>;
}

// Export the table for other components to use
export { FLORAGE };
