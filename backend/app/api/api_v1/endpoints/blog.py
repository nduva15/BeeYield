"""
Blog/CMS Endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from typing import list, Optional
from app.schemas import blog as schemas
from app.db.supabase_db import db_select, db_insert, db_update, db_get_by_id
from datetime import datetime

router = APIRouter()


# ============ PUBLIC BLOG ENDPOINTS ============

@router.get("/posts", response_model=list[dict])
def get_blog_posts(
    category: Optional[str] = None,
    tag: Optional[str] = None,
    limit: int = Query(10, le=50),
    offset: int = 0
):
    """
    Get all published blog posts with optional filtering.
    """
    filters = {"status": "published"}
    if category:
        filters["category"] = category
    
    posts = db_select(
        "blog_posts", 
        filters=filters, 
        order_by="published_at", 
        ascending=False,
        limit=limit
    )
    
    if not posts or len(posts) == 0:
        # Return mock data
        return [
            {
                "id": "post-new-1",
                "slug": "defending-the-colony-bee-diseases",
                "title": "Defending the Colony: Common Bee Diseases in Kenya",
                "excerpt": "While African bees are resilient, they face threats. Learn about the diseases affecting our hives and how we use technology and natural methods to keep them healthy.",
                "featured_image": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800",
                "category": "Conservation",
                "tags": ["bee health", "diseases", "Kenya", "conservation"],
                "author_name": "Timothy Nduva",
                "read_time_minutes": 8,
                "published_at": "2026-01-05T09:00:00Z",
                "views_count": 142
            },
            {
                "id": "post-new-2",
                "slug": "honey-traceability-blockchain",
                "title": "The Transparency Revolution: Why We Put Our Honey on the Blockchain",
                "excerpt": "From the hive in Kibwezi to your table. Discover how BeeYield uses blockchain technology to fight fraud and guarantee 100% pure, authentic honey.",
                "featured_image": "https://images.unsplash.com/photo-1627725945110-d02f7413a968?w=800",
                "category": "Technology",
                "tags": ["blockchain", "traceability", "food safety", "agritech"],
                "author_name": "Agatha Nduva",
                "read_time_minutes": 10,
                "published_at": "2026-01-03T14:30:00Z",
                "views_count": 356
            },
            {
                "id": "post-new-3",
                "slug": "beeyield-agritech-innovation",
                "title": "Growing the Future: How BeeYield is Transforming Agritech in Kenya",
                "excerpt": "We are more than just honey. Explore how our startup is leveraging IoT and data to solve pollination deficits and empower farmers across Africa.",
                "featured_image": "https://images.unsplash.com/photo-1471943311424-646960669fbc?w=800",
                "category": "Sustainability",
                "tags": ["agritech", "startup", "innovation", "Kenya"],
                "author_name": "Carole Nduva",
                "read_time_minutes": 7,
                "published_at": "2026-01-01T11:15:00Z",
                "views_count": 289
            },
            {
                "id": "post-new-4",
                "slug": "raw-vs-commercial-honey",
                "title": "Raw vs. Commercial Honey: Determining the Difference",
                "excerpt": "Not all honey is created equal. We break down the health benefits of raw, unfiltered honey versus processed alternatives found on supermarket shelves.",
                "featured_image": "https://images.unsplash.com/photo-1589709977937-dbbee18dd6bc?w=800",
                "category": "Education",
                "tags": ["honey", "health", "nutrition", "raw honey"],
                "author_name": "Timothy Nduva",
                "read_time_minutes": 6,
                "published_at": "2025-12-28T10:00:00Z",
                "views_count": 521
            },
            {
                "id": "post-new-5",
                "slug": "pollination-services-explained",
                "title": "The Silent Workers: How Pollination Services Boost Farm Yields",
                "excerpt": "Farmers can increase yields by up to 30% simply by adding bees. Learn how our managed pollination services are changing the game for Kenyan agriculture.",
                "featured_image": "https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?w=800",
                "category": "Pollination",
                "tags": ["agriculture", "farming", "crop yields", "pollination"],
                "author_name": "Timothy Nduva",
                "read_time_minutes": 9,
                "published_at": "2025-12-25T08:45:00Z",
                "views_count": 189
            },
            {
                "id": "post-new-6",
                "slug": "women-in-agritech",
                "title": "Empowering Women in Agritech: The BeeYield Story",
                "excerpt": "Technology is the great equalizer. Discover how we are training women in rural communities to become expert beekeepers and tech-enabled farmers.",
                "featured_image": "https://images.unsplash.com/photo-1595856722839-847336780993?w=800",
                "category": "Impact",
                "tags": ["women in tech", "empowerment", "social impact", "Kenya"],
                "author_name": "Agatha Nduva",
                "read_time_minutes": 8,
                "published_at": "2025-12-20T13:20:00Z",
                "views_count": 412
            },
            {
                "id": "post-new-7",
                "slug": "why-honey-crystallizes",
                "title": "Why Does Honey Crystallize? The Sweet Sign of Purity",
                "excerpt": "Is your honey turning hard and white? Don't throw it away! We explain the science behind crystallization and why it proves your honey is the real deal.",
                "featured_image": "https://images.unsplash.com/photo-1587049547525-46fd2100863d?w=800",
                "category": "Education",
                "tags": ["honey", "science", "food facts", "crystallization"],
                "author_name": "Carole Nduva",
                "read_time_minutes": 5,
                "published_at": "2025-12-15T09:30:00Z",
                "views_count": 890
            },
            {
                "id": "post-new-8",
                "slug": "climate-smart-beekeeping",
                "title": "Climate-Smart Beekeeping: Adapting to Change in East Africa",
                "excerpt": "As weather patterns shift, so must our methods. How BeeYield helps farmers adapt to drought and heat to maintain healthy, productive hives.",
                "featured_image": "https://images.unsplash.com/photo-1473970363249-14a51df71661?w=800",
                "category": "Sustainability",
                "tags": ["climate change", "environment", "adaptation", "East Africa"],
                "author_name": "Timothy Nduva",
                "read_time_minutes": 11,
                "published_at": "2025-12-10T11:00:00Z",
                "views_count": 234
            },
            {
                "id": "post-new-9",
                "slug": "economics-of-beekeeping",
                "title": "From Hobby to Business: The Economics of Beekeeping in Kenya",
                "excerpt": "With low startup costs and high returns, beekeeping is an ideal venture. We break down the numbers for aspiring apiarists.",
                "featured_image": "https://images.unsplash.com/photo-1565138127415-4ba849b2512a?w=800",
                "category": "Business",
                "tags": ["business", "entrepreneurship", "farming", "money"],
                "author_name": "Agatha Nduva",
                "read_time_minutes": 12,
                "published_at": "2025-12-05T15:45:00Z",
                "views_count": 675
            },
            {
                "id": "post-new-10",
                "slug": "bee-friendly-gardening",
                "title": "Bee-Friendly Gardening: 5 Plants to Help Pollinators in Nairobi",
                "excerpt": "You don't need a farm to help the bees. Here are five native plants you can grow in your garden or balcony to support local pollinators.",
                "featured_image": "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800",
                "category": "Lifestyle",
                "tags": ["gardening", "sustainability", "Nairobi", "flowers"],
                "author_name": "Carole Nduva",
                "read_time_minutes": 6,
                "published_at": "2025-12-01T10:15:00Z",
                "views_count": 345
            }
        ]
    
    return posts


@router.get("/posts/{slug}", response_model=dict)
def get_blog_post(slug: str):
    """
    Get a single blog post by slug.
    """
    posts = db_select("blog_posts", filters={"slug": slug, "status": "published"}, limit=1)
    
    if posts and len(posts) > 0:
        post = posts[0]
        # Increment view count
        db_update("blog_posts", {"views_count": post.get("views_count", 0) + 1}, {"id": post["id"]})
        return post
    
    # Return mock data
    if slug == "defending-the-colony-bee-diseases":
        return {
            "id": "post-new-1",
            "slug": "defending-the-colony-bee-diseases",
            "title": "Defending the Colony: Common Bee Diseases in Kenya",
            "excerpt": "While African bees are resilient, they face threats. Learn about the diseases affecting our hives and how we use technology and natural methods to keep them healthy.",
            "content": """
# Defending the Colony: Common Bee Diseases in Kenya and How We Tackle Them

In the lush landscapes of Kenya, from the arid plains of Kibwezi to the highlands, the African honeybee (*Apis mellifera scutellata*) is a legend. Known for its resilience and vigor, it has thrived for centuries. However, even these hardy pollinators are not invincible. As we scale up beekeeping to meet the demand for pure, high-quality honey, understanding not just the benefits but the threats to our bees is crucial.

## The Invisible Threat
Beekeeping is often romanticized—sunlit fields and buzzing hives. But behind the scenes, it is a constant battle for health. In Kenya, we face several challenges that, if left unchecked, can decimate colonies.

### 1. Varroa Mites (*Varroa destructor*)
While African honeybees are famous for their grooming behavior which helps them remove these parasites physically, Varroa mites remain a significant stressor. These tiny, red-brown mites attach themselves to bees and larvae, sucking their "blood" (hemolymph) and transmitting deadly viruses like the Deformed Wing Virus (DWV). 

**Our Approach:** At BeeYield, we prioritize **Integrated Pest Management (IPM)**. Instead of flooding hives with chemicals which can contaminate honey, we use screened bottom boards. These allow mites to fall out of the hive where they cannot crawl back up. We also monitor mite levels rigorously using our IoT sensors—sudden drops in hive activity often signal a high infestation.

### 2. Bacterial Brood Diseases
Diseases like **American Foulbrood (AFB)** and **European Foulbrood (EFB)** attack the developing larvae. 
*   **AFB** is particularly nasty; it turns larvae into a ropy slime and is highly contagious.
*   **EFB** is often stress-related, appearing when colonies are weak or short on food.

**Our Approach:** Hygiene is our first line of defense. We regularly rotate old combs out of operation. Our "Digital Hive" technology helps here too—by tracking weight changes, we ensure colonies are never starving, reducing the stress that invites EFB.

### 3. Pests: The Small Hive Beetle & Wax Moths
In the warm Kenyan climate, Small Hive Beetles are a nuisance. They lay eggs in the hive, and their larvae tunnel through combs, eating honey and pollen, and fermenting the honey. Wax Moths are the cleaners of nature, destroying weak hives.

**Our Approach:** Strong colonies are the best defense. A full, booming hive will physically kick out beetles and moths. Our training programs for farmers focus on maintaining colony strength through proper queen management and seasonal feeding.

## Technology Meets Tradition
What makes BeeYield unique is how we blend traditional African beekeeping wisdom with modern tech. 

*   **IoT Sensors:** We don't just guess if a hive is sick. Our sensors monitor temperature and humidity. A "fever" in the hive (abnormal heat) can indicate a massive immune response to infection. We can intervene *before* the colony collapses.
*   **Farmer Education:** Timothy Nduva, our founder, personally leads workshops in Kibwezi. We teach farmers to recognize the early signs of disease—a spotty brood pattern, a strange smell, or lethargic bees.

## Conclusion
Healthy bees mean healthy honey, and a healthy planet. By understanding these diseases and using a mix of technology and good husbandry, we ensure that every jar of BeeYield honey is not just delicious, but the product of a thriving, happy ecosystem.
""",
            "featured_image": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800",
            "category": "Conservation",
            "tags": ["bee health", "diseases", "Kenya", "conservation"],
            "author_name": "Timothy Nduva",
            "read_time_minutes": 8,
            "published_at": "2026-01-05T09:00:00Z",
            "views_count": 142
        }

    if slug == "honey-traceability-blockchain":
        return {
            "id": "post-new-2",
            "slug": "honey-traceability-blockchain",
            "title": "The Transparency Revolution: Why We Put Our Honey on the Blockchain",
            "excerpt": "From the hive in Kibwezi to your table. Discover how BeeYield uses blockchain technology to fight fraud and guarantee 100% pure, authentic honey.",
            "content": """
# The Transparency Revolution: Why We Put Our Honey on the Blockchain

Honey is often called "liquid gold." Unfortunately, like gold, it attracts counterfeiters. Globally, honey is one of the most adulterated food products. Terms like "pure" and "natural" are slapped onto jars that contain rice syrup, corn syrup, or honey that has been ultra-filtered to hide its origin.

At BeeYield, we believe you deserve better. We believe in radical transparency. That's why we built our platform on the **blockchain**.

## Why Blockchain?
Blockchain isn't just for cryptocurrency. At its core, it is a digital ledger that cannot be changed. Once we record something—like the harvest date of a batch of honey—it is there forever. It cannot be deleted, altered, or faked.

## The Journey of Your Jar
When you buy a jar of BeeYield honey, you aren't just buying a sweetener; you are buying a story. Here is how we verify it:

1.  **Harvest:** When Timothy Nduva harvests honey in Kibwezi, the batch is weighed and tagged. This data (date, location, weight) is uploaded to our system.
2.  **Processing:** As the honey is filtered and bottled, these steps are also recorded. We link the specific harvest batch to the final jars.
3.  **The Code:** Each jar gets a unique Code.
4.  **Verification:** You scan the QR code on your jar. Instantly, our app queries the blockchain. You see the *exact* map location of the hives. You see the date it was harvested. You see the face of the beekeeper.

## Bringing Trust Back to the Table
For us, this is personal. Beekeeping is hard work. When cheap, fake honey floods the market, it undercuts honest farmers who are doing things the right way. 

By using technology to prove the authenticity of our product, we justify a fair price for our farmers. When you scan that code, you are validating their hard work. You are proving that *real* food from *real* people matters.

## The Future is Traceable
We are not stopping at honey. We envision a future where all agricultural produce in Africa is traceable. Imagine knowing exactly which farm your maize, beans, or mangoes came from. Imagine tipping the farmer directly from your phone because you enjoyed their produce.

This is the revolution BeeYield is leading. It starts with one spoon of honey, but it ends with a transformed, honest food system for everyone.
""",
            "featured_image": "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800",
            "category": "Technology",
            "tags": ["blockchain", "traceability", "food safety", "agritech"],
            "author_name": "Agatha Nduva",
            "read_time_minutes": 10,
            "published_at": "2026-01-03T14:30:00Z",
            "views_count": 356
        }

    if slug == "beeyield-agritech-innovation":
        return {
            "id": "post-new-3",
            "slug": "beeyield-agritech-innovation",
            "title": "Growing the Future: How BeeYield is Transforming Agritech in Kenya",
            "excerpt": "We are more than just honey. Explore how our startup is leveraging IoT and data to solve pollination deficits and empower farmers across Africa.",
            "content": """
# Growing the Future: How BeeYield is Transforming Agritech in Kenya

Kenya is often cited as the "Silicon Savannah." We are a nation of innovators. But while fintech has grabbed the headlines, a quieter but potentially more impactful revolution is happening in our fields: **Agritech**.

Agriculture is the backbone of our economy, yet it faces existential threats. Climate change is making rains unpredictable. Land sizes are shrinking. And critically, pollinators are disappearing.

## The Pollination Deficit
Most people don't know that 75% of the world's food crops depend on pollination. In Kenya, yields for crops like mangoes, runner beans, and avocados are often far below their potential simply because there aren't enough bees.

This is where BeeYield steps in. We are not just selling honey; we are selling **yield assurance**.

## Our Innovation: Data-Driven Pollination
We treat pollination as a precise science. 
*   **Mapping:** We map farms that need pollination.
*   **Deployment:** During flowering seasons, we move our mobile apiaries to these farms.
*   **IoT Monitoring:** We don't just drop boxes and leave. Our IoT sensors track the activity levels of the hives. We know when the bees are flying and when they are clustered. 

This data allows us to guarantee results. We can tell a mango farmer in Makueni, "We have deployed 50 hives, and our data shows high foraging activity." The result? In our pilot studies, we've seen yield increases of **up to 30%**.

## Challenges and Triumphs
Building a hardware startup in Africa is not easy. Importing sensors is expensive. Connectivity in rural areas can be spotty. 
But the opportunities dwarf the challenges.
*   **Youth Employment:** Beekeeping is a high-value skill. We are training a new generation of "digital beekeepers" who manage these high-tech hives.
*   **Sustainability:** By making bees economically valuable to farmers (through pollination services, not just honey), we incentivize the protection of natural habitats. Farmers stop cutting down trees when they realize those trees feed the bees that boost their crop yields.

## A Vision for Africa
BeeYield started in Kibwezi, but our vision is continental. The problems we are solving—low yields, lack of traceability, market access—are pan-African. We believe that by marrying ancient African agricultural practices with cutting-edge technology (Blockchain, IoT, AI), we can secure the food future of our continent.

Join us on this journey. Whether you are a honey lover, a farmer, or an investor, there is a place for you in the hive.
""",
            "featured_image": "https://images.unsplash.com/photo-1471943311424-646960669fbc?w=800",
            "category": "Sustainability",
            "tags": ["agritech", "startup", "innovation", "Kenya"],
            "author_name": "Carole Nduva",
            "read_time_minutes": 7,
            "published_at": "2026-01-01T11:15:00Z",
            "views_count": 289
        }

    if slug == "raw-vs-commercial-honey":
        return {
            "id": "post-new-4",
            "slug": "raw-vs-commercial-honey",
            "title": "Raw vs. Commercial Honey: Determining the Difference",
            "excerpt": "Not all honey is created equal. We break down the health benefits of raw, unfiltered honey versus processed alternatives found on supermarket shelves.",
            "content": """
# Raw vs. Commercial Honey: Determining the Difference

Walk into any supermarket in Nairobi, and you’ll see rows of golden jars. But is that really honey?

At BeeYield, we champion **Raw Honey**. But what does that actually mean? And why does it matter?

## What is Commercial Honey?
Most mass-market honey has been:
1.  **Pasteurized:** Heated to high temperatures to prevent crystallization and kill yeast. This sounds good, but heat destroys delicate enzymes, antioxidants, and vitamins.
2.  **Ultra-Filtered:** Strained under high pressure to remove every microscopic particle. This often removes pollen—the very fingerprint of honey that proves its origin.
3.  **Sometimes Adulterated:** Some "honey" is cut with corn syrup or rice syrup to increase volume and lower cost.

## What is Raw Honey?
Raw honey, like the kind harvested by Timothy Nduva in Kibwezi, comes straight from the honeycomb.
*   **Unpasteurized:** It is never heated above standard hive temperatures (approx 95°F/35°C).
*   **Lightly Strained:** We filter out wax capping and bee parts, but leave the good stuff—pollen, propolis, and enzymes.

## The Health Difference
*   **Enzymes:** Raw honey is rich in amylase (digests carbs) and glucose oxidase (antimicrobial).
*   **Antioxidants:** Dark raw honey contains flavonoids that combat oxidative stress.
*   **Allergy Relief:** Consuming local raw honey containing local pollen *may* help reduce seasonal allergies by acclimatizing your body.

## The Taste Test
Commercial honey tastes sweet—just sweet. Raw honey is complex. You can taste the flowers. An Acacia honey tastes different from a Sunflower honey. It has "terroir," just like fine wine.

**The Verdict:** If you want a sweetener, buy sugar. If you want a superfood that supports your health and local farmers, choose Raw Honey.
""",
            "featured_image": "https://images.unsplash.com/photo-1589709977937-dbbee18dd6bc?w=800",
            "category": "Education",
            "tags": ["honey", "health", "nutrition", "raw honey"],
            "author_name": "Timothy Nduva",
            "read_time_minutes": 6,
            "published_at": "2025-12-28T10:00:00Z",
            "views_count": 521
        }

    if slug == "pollination-services-explained":
        return {
            "id": "post-new-5",
            "slug": "pollination-services-explained",
            "title": "The Silent Workers: How Pollination Services Boost Farm Yields",
            "excerpt": "Farmers can increase yields by up to 30% simply by adding bees. Learn how our managed pollination services are changing the game for Kenyan agriculture.",
            "content": """
# The Silent Workers: How Pollination Services Boost Farm Yields

When we think of farm inputs, we think of fertilizer, water, and seeds. But we often forget the most critical input of all: **Pollination**.

In Kenya, horticulture is a massive industry. We export avocados, beans, and flowers to the world. But many farmers are leaving money on the table.

## The Yield Gap
A mango tree can have thousands of flowers. If only 1% are pollinated, you get a poor harvest. If 5% are pollinated, you get a bumper harvest. The difference? **Bees.**

Wild pollinators are in decline due to habitat loss and pesticide use. Relying on nature alone is no longer a safe bet for commercial farming.

## Managed Pollination Services
This is a new concept in East Africa, but standard practice in places like California (for almonds). 

**How it works:**
1.  **Assessment:** We visit a farm (e.g., a Watermelon farm in Kitui). We calculate the number of hives needed based on acreage.
2.  **Deployment:** We bring in BeeYield "Mobile Apiaries" just as the crop begins to flower.
3.  **Timing:** We leave the bees for 3-4 weeks—the peak bloom window.
4.  **Removal:** We move the bees to the next crop or back to our sanctuary.

## The Results
The data is undeniable.
*   **Avocados:** Yield increase of 20-30%. Quality improves too—fruit is more uniform.
*   **Macadamia:** Higher nut set and retention.
*   **Beans & Vegetables:** Faster pod setting and heavier crops.

## A Win-Win
Farmers make more money from the same land. Beekeepers get a rental fee for their hives, diversifying their income beyond just honey. And the bees? They get a feast of nectar.

At BeeYield, we are building the operational backbone to make this service accessible to smallholder and large-scale farmers alike.
""",
            "featured_image": "https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?w=800",
            "category": "Pollination",
            "tags": ["agriculture", "farming", "crop yields", "pollination"],
            "author_name": "Timothy Nduva",
            "read_time_minutes": 9,
            "published_at": "2025-12-25T08:45:00Z",
            "views_count": 189
        }

    if slug == "women-in-agritech":
        return {
            "id": "post-new-6",
            "slug": "women-in-agritech",
            "title": "Empowering Women in Agritech: The BeeYield Story",
            "excerpt": "Technology is the great equalizer. Discover how we are training women in rural communities to become expert beekeepers and tech-enabled farmers.",
            "content": """
# Empowering Women in Agritech: The BeeYield Story

Agriculture in Africa is powered by women. They produce up to 80% of the food, yet they often own little land and have limited access to technology.

At BeeYield, we are changing that narrative through the humble bee.

## Why Beekeeping Works for Women
Traditionally, cattle farming requires land ownership and immense physical strength. Beekeeping is different.
*   **Low Land Requirement:** You don't need acres. You can keep hives on a small plot or even a communal forest edge.
*   **Low Maintenance:** Unlike milking cows twice a day, bees need checking once a week or fortnight. This fits into the busy schedules of women who manage households.

## The Digital Leap
We don't just teach women how to handle bees; we teach them **Digital Beekeeping**.
Agatha Nduva, our co-founder, leads this initiative. We train women groups in Makueni and Kitui to:
1.  **Use Smartphones:** To log hive data into the BeeYield app.
2.  **Monitor IoT Alerts:** Understanding actionable alerts like "Hive 3 is overheating" or "Hive 5 has been knocked over."
3.  **Mobile Money:** Receiving payments directly to M-Pesa, ensuring they control their income.

## Success Story: Mama Sarah
Mama Sarah in Kibwezi used to rely on rain-fed maize, which failed 3 years out of 5. She started with 5 BeeYield hives. Today, she manages 20. She uses the income from honey and wax to pay school fees for her grandchildren. 

"The phone tells me when the honey is ready," she says. "I don't have to guess."

This is the power of Agritech. It's not about complex servers in a city; it's about putting power in the hands of a grandmother in the village.
""",
            "featured_image": "https://images.unsplash.com/photo-1595856722839-847336780993?w=800",
            "category": "Impact",
            "tags": ["women in tech", "empowerment", "social impact", "Kenya"],
            "author_name": "Agatha Nduva",
            "read_time_minutes": 8,
            "published_at": "2025-12-20T13:20:00Z",
            "views_count": 412
        }

    if slug == "why-honey-crystallizes":
        return {
            "id": "post-new-7",
            "slug": "why-honey-crystallizes",
            "title": "Why Does Honey Crystallize? The Sweet Sign of Purity",
            "excerpt": "Is your honey turning hard and white? Don't throw it away! We explain the science behind crystallization and why it proves your honey is the real deal.",
            "content": """
# Why Does Honey Crystallize? The Sweet Sign of Purity

We get this call all the time: "My honey has gone bad! It's turned into sugar!"

Good news: **It hasn't gone bad.** In fact, crystallization is one of the best proofs that your honey is 100% natural and unadulterated.

## The Science of Sweetness
Honey is a supersaturated sugar solution. It contains more sugar (glucose and fructose) than the water content can naturally hold. Over time, the glucose separates from the water and forms crystals.

*   **Glucose:** The sugar that crystallizes.
*   **Fructose:** The sugar that stays liquid.

Honey varieties high in glucose (like Sunflowers) crystallize quickly—sometimes in weeks. Honey high in fructose (like Acacia) stays liquid for years.

## Why "Fake" Honey Doesn't Crystallize
Highly processed or adulterated honey (mixed with corn syrup) stays liquid forever. Why?
1.  **Pasteurization:** Heating melts any seed crystals.
2.  **Filtering:** Removing pollen takes away the "nuclei" that crystals need to start growing.

So, if your jar sits in the cupboard for two years and looks exactly the same, be suspicious. If it turns solid, cloudy, or white, **celebrate!** You have real honey.

## How to Fix It
Don't throw it out!
1.  Put the jar in a bowl of **warm water** (not boiling!).
2.  Let it sit for 20-30 minutes.
3.  Stir gently.

The crystals will melt, and your honey will be liquid again. Remember: never microwave it, or you will kill the beneficial enzymes!
""",
            "featured_image": "https://images.unsplash.com/photo-1587049547525-46fd2100863d?w=800",
            "category": "Education",
            "tags": ["honey", "science", "food facts", "crystallization"],
            "author_name": "Carole Nduva",
            "read_time_minutes": 5,
            "published_at": "2025-12-15T09:30:00Z",
            "views_count": 890
        }

    if slug == "climate-smart-beekeeping":
        return {
            "id": "post-new-8",
            "slug": "climate-smart-beekeeping",
            "title": "Climate-Smart Beekeeping: Adapting to Change in East Africa",
            "excerpt": "As weather patterns shift, so must our methods. How BeeYield helps farmers adapt to drought and heat to maintain healthy, productive hives.",
            "content": """
# Climate-Smart Beekeeping: Adapting to Change in East Africa

East Africa is on the frontline of climate change. We are seeing longer droughts, erratic rainfall, and extreme heat. For a creature as sensitive as the bee—and dependent on flowers—this is a crisis.

At BeeYield, we are pioneering **Climate-Smart Beekeeping**.

## The Challenge: Flower Gaps
Drought means no flowers. No flowers mean no nectar. In the past, bees could forage year-round. Now, there are "dearth periods" that can last months. If left alone, colonies starve or migrate (abscond).

## Solution 1: Drought-Resistant Flora
We don't just plant trees; we plant the **right** trees. We encourage farmers to plant drought-resistant, melliferous (bee-loving) flora like:
*   *Acacia tortilis* (Umbrella Thorn)
*   *Calliandra*
*   Moringa
*   Sunflowers (fast maturity to catch short rains)

## Solution 2: Strategic Water Provision
Bees need water to cool the hive. In extreme heat, they spend all their energy fetching water instead of nectar. We install "bee watering stations" near apiaries—clean water with floating pebbles so bees can land safely. This simple step can save a colony during a heatwave.

## Solution 3: The Langstroth Hive Benefit
Traditional log hives are hard to inspect. We use modern Langstroth hives which allow us to **feed** bees during droughts. We provide sugar syrup and pollen supplements to keep the queen laying, so when the rains finally return, the colony is strong and ready to harvest immediately.

## Adaptation is Survival
We cannot stop the climate from changing overnight. But we can change how we farm. By integrating beekeeping with agroforestry and water conservation, we build a system that is resilient, profitable, and green.
""",
            "featured_image": "https://images.unsplash.com/photo-1473970363249-14a51df71661?w=800",
            "category": "Sustainability",
            "tags": ["climate change", "environment", "adaptation", "East Africa"],
            "author_name": "Timothy Nduva",
            "read_time_minutes": 11,
            "published_at": "2025-12-10T11:00:00Z",
            "views_count": 234
        }

    if slug == "economics-of-beekeeping":
        return {
            "id": "post-new-9",
            "slug": "economics-of-beekeeping",
            "title": "From Hobby to Business: The Economics of Beekeeping in Kenya",
            "excerpt": "With low startup costs and high returns, beekeeping is an ideal venture. We break down the numbers for aspiring apiarists.",
            "content": """
# From Hobby to Business: The Economics of Beekeeping in Kenya

Is beekeeping profitable? The short answer is **Yes**. 

Compared to poultry or dairy, beekeeping has unique economic advantages that make it perfect for Kenyan youth and farmers looking for diversification.

## Low Startup Capital
You don't need to build a barn or buy expensive feeds daily.
*   **Land:** Free (use marginal land, rocky patches, or forest edges).
*   **Equipment:** A Hive, a Suit, a Smoker, and a Hive Tool. That's it.
*   **Stock:** Free. In Kenya, you don't buy bees; you bait a hive and a swarm moves in naturally!

## Low Recurrent Costs
Bees feed themselves. They don't need vaccines. Labor is minimal—maybe 2 hours per hive per month.

## The Revenue Streams
It’s not just about honey. A savvy beekeeper has multiple income lines:
1.  **Honey:** The liquid gold. High demand in cities like Nairobi.
2.  **Beeswax:** Used in candles, cosmetics, and shoe polish. Often thrown away by amateurs but highly valuable.
3.  **Propolis:** A natural antibiotic sold to pharmaceutical companies.
4.  **Pollination Services:** Renting hives to avocado or melon farmers.
5.  **Colony Sales:** Selling established colonies to new beekeepers.

## The ROI
A well-managed Langstroth hive can produce 10-20kg of honey per harvest, with 2-3 harvests a year in good zones. With honey retailing at 800-1000 KES per kg, a single hive can generate 20,000+ KES annually. 

With 50 hives, this becomes a serious business yielding over 1 Million KES—all while leaving you time to do other work.

## Conclusion
Beekeeping is "Silent Wealth." It builds up quietly in the background. For young entrepreneurs in Africa, it represents a path to financial independence with minimal barriers to entry.
""",
            "featured_image": "https://images.unsplash.com/photo-1565138127415-4ba849b2512a?w=800",
            "category": "Business",
            "tags": ["business", "entrepreneurship", "farming", "money"],
            "author_name": "Agatha Nduva",
            "read_time_minutes": 12,
            "published_at": "2025-12-05T15:45:00Z",
            "views_count": 675
        }

    if slug == "bee-friendly-gardening":
        return {
            "id": "post-new-10",
            "slug": "bee-friendly-gardening",
            "title": "Bee-Friendly Gardening: 5 Plants to Help Pollinators in Nairobi",
            "excerpt": "You don't need a farm to help the bees. Here are five native plants you can grow in your garden or balcony to support local pollinators.",
            "content": """
# Bee-Friendly Gardening: 5 Plants to Help Pollinators in Nairobi

You might think you need a farm in Kibwezi to help bees. You don't. Urban areas like Nairobi are actually vital sanctuaries for bees because they often have diverse flowers year-round, unlike monoculture farms.

Whether you have a large garden in Karen or a small balcony in Westlands, you can help. Here are 5 plants that thrive in our climate and bees absolutely love.

## 1. Lavender
Bees go crazy for purple flowers. Lavender is hardy, drought-resistant, and smells amazing. It provides high-quality nectar.
*   *Tip:* It loves sun and sandy soil. Don't overwater it!

## 2. Sunflowers
The giant yellow heads are like landing pads for bees. They are packed with pollen.
*   *Tip:* Plant them in stages (every 2 weeks) so you have continuous blooms for months.

## 3. Basil (and other Herbs)
Let your herbs bolt! We usually harvest basil before it flowers, but if you let it bloom, the bees will thank you. Mint, Rosemary, and Thyme are also excellent nectar sources.

## 4. Bottlebrush (*Callistemon*)
A common tree in Nairobi landscaping. The red, brush-like flowers are rich in nectar and attract not just honeybees, but also sunbirds.

## 5. Aloe
Native Aloes produce spikes of orange/red flowers that are crucial during dry seasons when little else is blooming. They are zero-maintenance and survive on rain alone.

## No Pesticides!
The most important rule: **Stop spraying.** If you plant these flowers but spray your garden with broad-spectrum insecticides, you are creating a trap. Embrace a few bugs—ladybugs and lacewings will handle the pests naturally.

Plant a flower, feed a bee. It's that simple.
""",
            "featured_image": "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800",
            "category": "Lifestyle",
            "tags": ["gardening", "sustainability", "Nairobi", "flowers"],
            "author_name": "Carole Nduva",
            "read_time_minutes": 6,
            "published_at": "2025-12-01T10:15:00Z",
            "views_count": 345
        }

    if slug == "beeyield-agritech-innovation":
        return {
            "id": "post-new-3",
            "slug": "beeyield-agritech-innovation",
            "title": "Growing the Future: How BeeYield is Transforming Agritech in Kenya",
            "excerpt": "We are more than just honey. Explore how our startup is leveraging IoT and data to solve pollination deficits and empower farmers across Africa.",
            "content": """
# Growing the Future: How BeeYield is Transforming Agritech in Kenya

Kenya is often cited as the "Silicon Savannah." We are a nation of innovators. But while fintech has grabbed the headlines, a quieter but potentially more impactful revolution is happening in our fields: **Agritech**.

Agriculture is the backbone of our economy, yet it faces existential threats. Climate change is making rains unpredictable. Land sizes are shrinking. And critically, pollinators are disappearing.

## The Pollination Deficit
Most people don't know that 75% of the world's food crops depend on pollination. In Kenya, yields for crops like mangoes, runner beans, and avocados are often far below their potential simply because there aren't enough bees.

This is where BeeYield steps in. We are not just selling honey; we are selling **yield assurance**.

## Our Innovation: Data-Driven Pollination
We treat pollination as a precise science. 
*   **Mapping:** We map farms that need pollination.
*   **Deployment:** During flowering seasons, we move our mobile apiaries to these farms.
*   **IoT Monitoring:** We don't just drop boxes and leave. Our IoT sensors track the activity levels of the hives. We know when the bees are flying and when they are clustered. 

This data allows us to guarantee results. We can tell a mango farmer in Makueni, "We have deployed 50 hives, and our data shows high foraging activity." The result? In our pilot studies, we've seen yield increases of **up to 30%**.

## Challenges and Triumphs
Building a hardware startup in Africa is not easy. Importing sensors is expensive. Connectivity in rural areas can be spotty. 
But the opportunities dwarf the challenges.
*   **Youth Employment:** Beekeeping is a high-value skill. We are training a new generation of "digital beekeepers" who manage these high-tech hives.
*   **Sustainability:** By making bees economically valuable to farmers (through pollination services, not just honey), we incentivize the protection of natural habitats. Farmers stop cutting down trees when they realize those trees feed the bees that boost their crop yields.

## A Vision for Africa
BeeYield started in Kibwezi, but our vision is continental. The problems we are solving—low yields, lack of traceability, market access—are pan-African. We believe that by marrying ancient African agricultural practices with cutting-edge technology (Blockchain, IoT, AI), we can secure the food future of our continent.

Join us on this journey. Whether you are a honey lover, a farmer, or an investor, there is a place for you in the hive.
""",
            "featured_image": "https://images.unsplash.com/photo-1471943311424-646960669fbc?w=800",
            "category": "Sustainability",
            "tags": ["agritech", "startup", "innovation", "Kenya"],
            "author_name": "Carole Nduva",
            "read_time_minutes": 7,
            "published_at": "2026-01-01T11:15:00Z",
            "views_count": 289
        }

    if slug == "importance-of-bees":
        return {
            "id": "post-1",
            "slug": "importance-of-bees",
            "title": "The Importance of Bees in Our Ecosystem",
            "excerpt": "Discover why bees are crucial pollinators and what we can do to protect them.",
            "content": "# The Importance of Bees in Our Ecosystem\n\nBees are among the most important pollinators...",
            "featured_image": "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800",
            "category": "Conservation",
            "tags": ["bees", "environment", "pollination"],
            "author_name": "Timothy Nduva",
            "read_time_minutes": 5,
            "published_at": "2024-12-15T10:00:00Z",
            "views_count": 1235
        }
    
    raise HTTPException(status_code=404, detail="Blog post not found")


@router.get("/categories", response_model=list[dict])
def get_blog_categories():
    """
    Get all blog categories.
    """
    return [
        {"name": "Conservation", "slug": "conservation"},
        {"name": "Technology", "slug": "technology"},
        {"name": "Sustainability", "slug": "sustainability"},
        {"name": "Pollination", "slug": "pollination"}
    ]


# ============ ADMIN ENDPOINTS (Protected) ============

@router.post("/posts", response_model=dict)
def create_blog_post(post: schemas.BlogPostCreate):
    """
    Create a new blog post.
    """
    post_data = post.dict()
    if not post_data.get("slug"):
        post_data["slug"] = post_data["title"].lower().replace(" ", "-")
    
    post_data["created_at"] = datetime.utcnow().isoformat()
    result = db_insert("blog_posts", post_data)
    return result


@router.put("/posts/{post_id}", response_model=dict)
def update_blog_post(post_id: str, post: schemas.BlogPostCreate):
    """
    Update an existing blog post.
    """
    return db_update("blog_posts", post.dict(), {"id": post_id})
