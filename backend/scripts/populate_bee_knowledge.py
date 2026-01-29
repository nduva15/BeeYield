
import json
import os
import random
from typing import List, Dict

# Path to the knowledge base
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KB_PATH = os.path.join(BASE_DIR, "app", "data", "knowledge_base.json")

def create_knowledge_node(source: str, subtopic: str, general_content: str, beeyield_content: str) -> Dict[str, str]:
    return {
        "source": source,
        "subtopic": subtopic,
        "content": f"{general_content} {beeyield_content}"
    }

def generate_massive_data() -> List[Dict[str, str]]:
    nodes = []
    
    # ---------------------------------------------------------
    # 1. ANATOMY & PHYSIOLOGY (20 entries)
    # ---------------------------------------------------------
    anatomy_data = [
        ("The proboscis is a tube-like mouthpart used to suck up nectar.", 
         "**BEEYIELD SENSORS**: Our flow meters mimic the proboscis action to measure nectar viscosity in the hive."),
        ("Bees have five eyes: two large compound eyes and three ocelli.", 
         "**BEEYIELD VISION**: Our spectral cameras see UV patterns just like bee compound eyes to map forage."),
        ("The Nasonov gland releases pheromones to guide bees home.", 
         "**BEEYIELD TECH**: Our synthetic geolocation beacon helps guide swarms to bait hives by simulating this scent."),
        ("Corbiculae (pollen baskets) are on the hind legs.", 
         "**BEEYIELD ANALYTICS**: Image recognition cameras count full corbiculae entering the hive to estimate protein intake."),
        ("Bees beat their wings 230 times per second.", 
         "**BEEYIELD ACOUSTICS**: We analyze this specific frequency; a drop implies exhaustion or heavy humidity load."),
        ("The sting is barbed and rips out of the bee's body.", 
         "**BEEYIELD SAFETY**: Our remote monitoring prevents 90% of defensive stings by reducing physical inspections."),
        ("Bees communicate distance via the waggle dance.", 
         "**BEEYIELD DECODING**: Our vibration sensors map the dance angle to plot foraging maps on your dashboard."),
        ("Trophallaxis is food sharing between bees.", 
         "**BEEYIELD TRACKING**: We use tracers to monitor how fast automated feed spreads via trophallaxis in a test hive."),
        ("Bees see UV light but not red.", 
         "**BEEYIELD DESIGN**: Our hive entrances use UV-reflective paint to reduce drifting between colonies."),
        ("Antennae detect scents and carbon dioxide levels.", 
         "**BEEYIELD CO2**: We monitor hive CO2; high levels trigger automatic ventilation fans in our smart lids."),
        ("Mandibles are jaws used for kneading wax and fighting.", 
         "**BEEYIELD ALERTS**: High-frequency 'biting' sounds detected by our mics indicate a robber bee attack."),
        ("Haemolymph is bee blood but carries no oxygen.", 
         "**BEEYIELD HEALTH**: Our thermal scans detect haemolymph infection 'fevers' before they kill the bee."),
        ("Fat bodies store energy and immunity proteins.", 
         "**BEEYIELD NUTRITION**: Our scale weights correlate with metabolic fat body depletion during winter."),
        ("The crop (honey stomach) holds nectar during transport.", 
         "**BEEYIELD EFFICIENCY**: We calculate 'crop capacity' vs flight time to optimize apiary placement radius."),
        ("Spiracles are breathing holes along the abdomen.", 
         "**BEEYIELD AIR**: Our sensors detect blocked spiracles from Tracheal mites via distinct respiratory acoustic shifts."),
        ("Wax glands produce flakes from the abdomen.", 
         "**BEEYIELD GROWTH**: We measure wax production rates to tell you exactly when to add a new super box."),
        ("Bees navigate using the sun's position.", 
         "**BEEYIELD GPS**: We align solar panel orientation with bee flight paths to avoid shading the landing board."),
        ("Drones have no stinger and exist to mate.", 
         "**BEEYIELD BREEDING**: We track drone exit counts to time queen rearing cycles perfectly."),
        ("The Hypopharyngeal gland produces royal jelly.", 
         "**BEEYIELD QUEEN**: Monitoring nurse bee vibration tells us if royal jelly production is peaking for queen cells."),
        ("Bees are cold-blooded (ectothermic).", 
         "**BEEYIELD WINTER**: Our smart insulation wraps actively maintain the cluster warmth, saving 30% of winter honey stores.")
    ]
    for g, b in anatomy_data:
        nodes.append(create_knowledge_node("Bee Anatomy 101", "Physiology", g, b))

    # ---------------------------------------------------------
    # 2. SEASONAL MANAGEMENT (20 entries)
    # ---------------------------------------------------------
    seasonal_data = [
        ("Spring build-up requires protein for brood rearing.", 
         "**BEEYIELD SPRING**: Our scales detect the first nectar flow of the season to trigger 'Add Super' alerts."),
        ("Swarm prevention involves giving the queen room to lay.", 
         "**BEEYIELD SPACE**: We alert you when brood nest density hits 85%, prompting immediate expansion."),
        ("The June Gap is a nectar dearth in early summer.", 
         "**BEEYIELD FEEDING**: Weight sensors detect the daily loss trend of a dearth, alerting you to feed syrup."),
        ("Summer is the main honey flow season.", 
         "**BEEYIELD HARVEST**: Real-time weight gain graphs show the exact hour the flow stops, ensuring maximum harvest."),
        ("Robbing is common in late summer/autumn.", 
         "**BEEYIELD DEFENSE**: Entrance acoustic monitoring detects the high-pitch frenzy of robbers instantly."),
        ("Autumn feeding ensures winter survival.", 
         "**BEEYIELD CALC**: Our algorithm calculates existing stores vs colony size to prescribe the exact syrup liters needed."),
        ("Varroa treatment is critical in August/September.", 
         "**BEEYIELD TIMING**: We correlate local mite counts with brood cycles to recommend the most effective treatment day."),
        ("Winter cluster forms below 10°C (50°F).", 
         "**BEEYIELD CLUSTER**: Thermal imaging visualizes the cluster size and position without opening the hive."),
        ("Oxalic acid dribble is used in mid-winter.", 
         "**BEEYIELD BROODLESS**: Our sensors confirm the 'broodless' period for maximum efficacy of Oxalic acid."),
        ("Dead-outs (dead hives) must be cleaned in spring.", 
         "**BEEYIELD MORTALITY**: We detect 'Zero Activity' (thermal + acoustic flatline) so you can clean up before moths invade."),
        ("Requeening is best done in late summer.", 
         "**BEEYIELD GENETICS**: Our database compares your queen's performance to the regional average to advise requeening."),
        ("Equalizing colonies balances apiary strength.", 
         "**BEEYIELD STRENGTH**: We rank every hive 1-100, showing you exactly which weak hives need brood from strong ones."),
        ("Checkerboarding prevents swarming by breaking honey barrier.", 
         "**BEEYIELD INSPECT**: Our digital logbook reminds you which frames were checkerboarded and when."),
        ("Supering involves adding boxes for honey storage.", 
         "**BEEYIELD AI**: We predict 'Days to Full' based on current nectar flow rates, so you never miss a super."),
        ("Ventilation prevents moisture buildup in winter.", 
         "**BEEYIELD HUMIDITY**: Internal hygrometers alert you to wet conditions that cause condensation and mold."),
        ("Mouse guards prevent rodents entering in autumn.", 
         "**BEEYIELD SECURITY**: Motion sensors at the entrance can actually detect rodent intrusion attempts."),
        ("Hefting the hive checks winter weight.", 
         "**BEEYIELD AUTOMATION**: No lifting needed; our load cells report weight to your phone every 15 minutes."),
        ("Early pollen stimulates brood rearing.", 
         "**BEEYIELD FORAGE**: We analyze local satellite maps to predict the first pollen bloom like Willow or Hazel."),
        ("Splitting hives reduces swarm impulse.", 
         "**BEEYIELD SPLIT**: Our 'Swarm Risk Index' tells you the precise day to split a colony for success."),
        ("Uniting weak colonies saves bees in autumn.", 
         "**BEEYIELD DECISION**: Our AI compares the cost of feeding 2 weak hives vs the output of 1 united strong hive.")
    ]
    for g, b in seasonal_data:
        nodes.append(create_knowledge_node("Seasonal Beekeeping", "Yearly Cycle", g, b))

    # ---------------------------------------------------------
    # 3. GLOBAL FLORA & HONEY (20 entries)
    # ---------------------------------------------------------
    flora_data = [
        ("Manuka (Leptospermum) yields high-value medicinal honey.", 
         "**BEEYIELD AUTH**: Our GPS tracks foraging on Manuka bushes to certify UMF grades on the blockchain."),
        ("Acacia nectar is secreted in high humidity.", 
         "**BEEYIELD WEATHER**: We correlate humidity forecasts with Acacia bloom to predict the biggest flow days."),
        ("Rapeseed (Canola) honey crystallizes in days.", 
         "**BEEYIELD ALERT**: Speed extract alert! We warn you to extract Rapeseed honey within 48h of capping."),
        ("Sunflower nectar yield depends on soil moisture.", 
         "**BEEYIELD SOIL**: Our soil moisture probes in sunflower fields predict nectar volume for the season."),
        ("Lavender honey is premium and light-colored.", 
         "**BEEYIELD ORIGIN**: Acoustic signatures actually differ in Lavender fields; our AI confirms the floral source."),
        ("Buckwheat honey is dark and rich in antioxidants.", 
         "**BEEYIELD HEALTH**: We market this 'black gold' via our app, highlighting its verified antioxidant profile."),
        ("Heather honey is thixotropic (gel-like).", 
         "**BEEYIELD PROCESS**: We advise specific extraction settings (agitation) for Heather honey based on viscosity data."),
        ("Eucalyptus flow is heavy and fast.", 
         "**BEEYIELD VOLUME**: Our scales have recorded 10kg gains in a single day during peak Eucalyptus flow."),
        ("Clover is the most common honey source.", 
         "**BEEYIELD STANDARD**: We maintain a global 'Clover Standard' baseline to grade other honeys against."),
        ("Orange Blossom honey has a distinct citrus aroma.", 
         "**BEEYIELD TERPENES**: Our chemical sensors can detect the d-limonene terpene signature of citrus nectar."),
        ("Tupelo honey has a high fructose ratio.", 
         "**BEEYIELD DIABETIC**: We certify high-fructose Tupelo honey for diabetic-friendly marketing claims."),
        ("Sisal plants bloom only once after 10 years.", 
         "**BEEYIELD SCOUT**: Our satellite tracking identifies massive Sisal bloom events for migratory beekeeper alerts."),
        ("Coffee pollination increases bean size.", 
         "**BEEYIELD COFFEE**: We provide certification data to coffee farmers proving bee visitation rates."),
        ("Almond pollination is the largest bee event globally.", 
         "**BEEYIELD MIGRATION**: We manage the logistics of moving thousands of smart hives to almond orchards efficiently."),
        ("Goldenrod honey has a strong smell.", 
         "**BEEYIELD NOSE**: Our VOC sensors distinguish between Goldenrod nectar smell and AFB disease smell (often confused)."),
        ("Dandelion provides critical early spring nectar.", 
         "**BEEYIELD STARTUP**: Detecting Dandelion bloom triggers our 'Spring Wakeup' mode for hive sensors."),
        ("Linden (Lime) trees produce minty honey.", 
         "**BEEYIELD PREMIUM**: We map ancient Linden groves to help you produce single-origin limited editions."),
        ("Thyme honey is famous in Greece and New Zealand.", 
         "**BEEYIELD HERITAGE**: We blockchain-verify Thyme honey to protect against counterfeit syrups."),
        ("Macadamia nut pollination requires managed bees.", 
         "**BEEYIELD YIELD**: Our data proves a 40% nut set increase in Macadamia orchards with BeeYield hives."),
        ("Avocado flowers open as male one day, female the next.", 
         "**BEEYIELD TIMING**: We track foraging hours to ensure bees visit during the correct gender-phase of Avocado bloom.")
    ]
    for g, b in flora_data:
        nodes.append(create_knowledge_node("Global Flora Guide", "Nectar Sources", g, b))

    # ---------------------------------------------------------
    # 4. EQUIPMENT & TECH (15 entries)
    # ---------------------------------------------------------
    equipment_data = [
        ("The Smoker masks alarm pheromones.", 
         "**BEEYIELD DIGITAL**: Our 'Digital Smoker' emits a calming frequency that reduces aggression without smoke measurement."),
        ("A Hive Tool is used to pry apart propolis-glued frames.", 
         "**BEEYIELD DESIGN**: Our smart frames have 'easy-lift' tabs that reduce the force needed, saving your back."),
        ("Langstroth is the standard vertical hive.", 
         "**BEEYIELD KIT**: Our sensor retrofit kit fits any standard 10-frame Langstroth box in 30 seconds."),
        ("Top Bar Hives are horizontal and cage-free.", 
         "**BEEYIELD TBH**: We offer a customized sensor bar specifically for the unique geometry of Top Bar Hives."),
        ("Queen Excluders keep the queen out of honey supers.", 
         "**BEEYIELD FLOW**: Our sensors detect if workers are refusing to pass through the excluder, a common issue."),
        ("Extractors spin honey out by centrifugal force.", 
         "**BEEYIELD CONNECT**: Our app connects to smart extractors to auto-stop when the frame weight hits empty."),
        ("Flow Hives allow tapping honey without opening.", 
         "**BEEYIELD FLOW**: We integrate perfectly with Flow Hives, telling you exactly when the frames are full to tap."),
        ("Vaporizers are used for oxalic acid sublimation.", 
         "**BEEYIELD SAFE**: Remotely trigger your vaporizer via our app so you aren't near the dangerous fumes."),
        ("Bee Suits protect from stings.", 
         "**BEEYIELD FREEDOM**: With 24/7 monitoring, you only wear the suit when you absolutely need to, not for routine checks."),
        ("Foundation guides bees to build straight comb.", 
         "**BEEYIELD SMART**: Our foundation has embedded conductive wires that measure comb building progress."),
        ("Nucleus colonies (Nucs) are small starter hives.", 
         "**BEEYIELD BABY**: We have a 'Nuc Mode' for sensors that adjusts alert thresholds for smaller colony sizes."),
        ("Sugar water feeders are used in dearth.", 
         "**BEEYIELD LEVEL**: Our ultrasonic lid sensor pings your phone when the feeder bucket is empty."),
        ("Pollen traps collect pollen from returning foragers.", 
         "**BEEYIELD BALANCE**: We warn if you leave the trap on too long, risking protein deficiency for the brood."),
        ("Solar wax melters refine beeswax.", 
         "**BEEYIELD TEMP**: Our temp probe tells you when your melter hits the perfect purification temp of 63°C."),
        ("Double brood boxes give more room for laying.", 
         "**BEEYIELD CONFIG**: The app automatically adjusts weight baselines when you tell it you added a second box.")
    ]
    for g, b in equipment_data:
        nodes.append(create_knowledge_node("Beekeeping Tech", "Equipment", g, b))

    random.shuffle(nodes)
    return nodes

def main():
    print("Initializing BeeYield Knowledge Injector v3.0-MASSIVE...")
    
    if not os.path.exists(KB_PATH):
        print(f"Error: Knowledge base not found at {KB_PATH}")
        return

    try:
        with open(KB_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading DB: {e}")
        return

    existing_nodes = data.get("knowledge_nodes", [])
    print(f"Existing Nodes: {len(existing_nodes)}")
    
    # Generate massive dataset
    new_nodes = generate_massive_data()
    
    # Append
    existing_nodes.extend(new_nodes)
    data["knowledge_nodes"] = existing_nodes
    
    # Update metadata
    data["metadata"]["total_nodes"] = len(existing_nodes)
    data["metadata"]["last_sync"] = "UPDATED VIA MASSIVE INJECTOR (75+ NEW NODES)"

    # Save
    with open(KB_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

    print(f"SUCCESS! Injected {len(new_nodes)} new nodes.")
    print(f"New Total Knowledge Nodes: {len(existing_nodes)}")

if __name__ == "__main__":
    main()
