import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  ArrowRight,
  Sprout,
  MapPin,
  Calendar,
  TrendingUp,
  Users,
  Quote,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Media = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100); // Small delay to ensure render
    }
  }, [location]);

  const caseStudies = [
    {
      id: "maize",
      title: "Maize Pollination",
      category: "Cereal Crop",
      stories: [
        {
          farmer: "James Mwangi",
          location: "Kibwezi, Makueni",
          role: "Commercial Maize Farmer",
          acres: 40,
          description:
            "My 40-acre maize farm in Kibwezi has always been decent, but plateaued. I was skeptical about bees for wind-pollinated maize, but BeeYield proved me wrong. The cobs are filled to the tip, pushing my yield per acre up by 18%.",
          quote:
            "I was skeptical at first because maize is wind-pollinated, but the difference in cob fullness was undeniable.",
          stats: [
            { label: "Yield Increase", value: "+18%" },
            { label: "Acres Pollinated", value: "40" },
            { label: "Cob Fill", value: "100%" },
          ],
          image: "/images/maize_case.png",
        },
        {
          farmer: "Peter Korir",
          location: "Mbuinzau, Makueni",
          role: "Seed Maize Producer",
          acres: 100,
          description:
            "Seed production is a numbers game. We need every silk pollinated. BeeYield brought in high-density hives during tasseling. The resulting seed set was the highest we've seen in five years.",
          quote:
            "For seed maize, you can't leave it to chance. The bees ensured every silk was hit.",
          stats: [
            { label: "Seed Set", value: "99%" },
            { label: "Acres Pollinated", value: "100" },
            { label: "Grade", value: "Premium" },
          ],
          image:
            "https://images.unsplash.com/photo-1634467524884-897d0af5e104?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Alice Wanjiku",
          location: "Makindu, Makueni",
          role: "Mixed Crop Farmer",
          acres: 15,
          description:
            "I intercrop maize with beans. The bees helped both. My maize cobs are heavier this season, and the kernels are deep and well-formed.",
          quote:
            "It's not just the quantity, it's the weight of the harvest that surprised me.",
          stats: [
            { label: "Harvest Weight", value: "+15%" },
            { label: "Acres Pollinated", value: "15" },
            { label: "Kernel Depth", value: "High" },
          ],
          image:
            "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Robert Kemboi",
          location: "Kibwezi, Makueni",
          role: "Maize Farmer",
          acres: 25,
          description:
            "Using BeeYield's services was a game changer for my medium-scale farm. The uniformity of the crop was excellent, making harvesting much easier.",
          quote:
            "Uniform growth and better filling. I'm definitely using them again next season.",
          stats: [
            { label: "Uniformity", value: "Excellent" },
            { label: "Acres Pollinated", value: "25" },
            { label: "Yield", value: "+12%" },
          ],
          image:
            "https://images.unsplash.com/photo-1629007687834-0466be24751f?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Sarah Chepkoech",
          location: "Mbuinzau, Makueni",
          role: "Commercial Farmer",
          acres: 60,
          description:
            "We farm on a large scale. BeeYield's professionalism and the impact of their bees on our maize crop were impressive. We saw a tangible return on investment.",
          quote:
            "Professional service and visible results. The bees paid for themselves.",
          stats: [
            { label: "ROI", value: "Positive" },
            { label: "Acres Pollinated", value: "60" },
            { label: "Quality", value: "High" },
          ],
          image:
            "https://images.unsplash.com/photo-1595126868697-7c7038e827e8?auto=format&fit=crop&q=80&w=1200",
        },
      ],
    },
    {
      id: "sunflower",
      title: "Sunflower Production",
      category: "Oilseed Crop",
      stories: [
        {
          farmer: "Sarah Kimathi",
          location: "Makindu, Makueni",
          role: "Sunflower Producer",
          acres: 30,
          description:
            "Sunflowers and bees are a perfect match. On my 30 acres in Makindu, the difference between the starting rows near the wild bees and the center was huge. BeeYield's hives evened that out. Full heads everywhere.",
          quote:
            "The bees were incredibly active. We saw full heads of seeds and higher oil extraction rates.",
          stats: [
            { label: "Oil Content", value: "+25%" },
            { label: "Acres Pollinated", value: "30" },
            { label: "Seed Set", value: "95%" },
          ],
          image: "/images/sunflower_case.png",
        },
        {
          farmer: "John Omondi",
          location: "Kibwezi, Makueni",
          role: "Smallholder Group Lead",
          acres: 50,
          description:
            "Our cooperative consolidated 50 acres for sunflower oil. We needed consistent pollination across fragmented plots. The mobile hives did the trick, boosting our collective output.",
          quote:
            "Bringing bees to our scattered plots unified our harvest quality.",
          stats: [
            { label: "Group Yield", value: "+30%" },
            { label: "Acres Pollinated", value: "50" },
            { label: "Uniformity", value: "High" },
          ],
          image:
            "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Lucas Maara",
          location: "Mbuinzau, Makueni",
          role: "Dryland Farmer",
          acres: 12,
          description:
            "Farming in semi-arid areas is tough. You need to maximize every flower. The bees ensured that the short bloom window resulted in a harvestable crop despite the heat.",
          quote: "The bees made sure the short rainy season bloom counted.",
          stats: [
            { label: "Drought Resilience", value: "Improved" },
            { label: "Acres Pollinated", value: "12" },
            { label: "Seed Count", value: "High" },
          ],
          image:
            "https://images.unsplash.com/photo-1470509037663-253afd7f0f6e?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Beatrice Wanjiku",
          location: "Makindu, Makueni",
          role: "Sunflower Farmer",
          acres: 8,
          description:
            "I started small with sunflowers. BeeYield helped me understand the importance of pollination. The seeds were plump and full of oil.",
          quote:
            "I never knew bees could make such a difference in seed quality.",
          stats: [
            { label: "Seed Quality", value: "Excellent" },
            { label: "Acres Pollinated", value: "8" },
            { label: "Oil %", value: "+20%" },
          ],
          image:
            "https://images.unsplash.com/photo-1528691503-4905106881c6?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "David Kiplagat",
          location: "Kibwezi, Makueni",
          role: "Commercial Grower",
          acres: 45,
          description:
            "Reliability is key for my contract farming. BeeYield delivered hives on time and the bees were strong. My harvest met all the buyer's specifications.",
          quote:
            "Reliable service and strong colonies. Exactly what a commercial grower needs.",
          stats: [
            { label: "Contract Met", value: "100%" },
            { label: "Acres Pollinated", value: "45" },
            { label: "Yield", value: "+15%" },
          ],
          image:
            "https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&q=80&w=1200",
        },
      ],
    },
    {
      id: "mangoes",
      title: "Mango Exports",
      category: "Fruit Orchard",
      stories: [
        {
          farmer: "David Mutua",
          location: "Mbuinzau, Makueni",
          role: "Orchard Manager",
          acres: 25,
          description:
            "Export markets demand perfection. Reduced early fruit drop was my main goal. BeeYield's pollinators kept the fruit on the tree and improved the shape.",
          quote:
            "Our export rejection rate dropped significantly. The fruit uniformity was the best in a decade.",
          stats: [
            { label: "Retention", value: "+30%" },
            { label: "Acres Pollinated", value: "25" },
            { label: "Export Grade", value: "Premium" },
          ],
          image: "/images/mango_case.png",
        },
        {
          farmer: "Esther Muli",
          location: "Kibwezi, Makueni",
          role: "Organic Mango Farmer",
          acres: 10,
          description:
            "As an organic farmer, I rely on nature. Adding managed hives boosted my bio-intensive approach. The bees were aggressive workers, hitting every flower spike.",
          quote:
            "Simple, natural, and effective. The bees did more for my crop than any fertilizer.",
          stats: [
            { label: "Fruit Set", value: "+25%" },
            { label: "Acres Pollinated", value: "10" },
            { label: "Size", value: "Large" },
          ],
          image:
            "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Rashid Ali",
          location: "Makindu, Makueni",
          role: "Coastal Grower",
          acres: 40,
          description:
            "Our coastal mango varieties flower profusely. We needed a workforce to match. BeeYield deployed 20 hives for my 40 acres, ensuring coverage spread to the canopy top.",
          quote:
            "We saw bees working even the top branches where we usually lose fruit.",
          stats: [
            { label: "Canopy Reach", value: "100%" },
            { label: "Acres Pollinated", value: "40" },
            { label: "Volume", value: "+40 Tons" },
          ],
          image:
            "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Joseph Kyalo",
          location: "Kibwezi, Makueni",
          role: "Mango Farmer",
          acres: 18,
          description:
            "Drought conditions usually hit my yield hard. However, with the bees maximizing pollination during the short flowering burst, I still managed a respectable harvest.",
          quote: "The bees saved my season during a tough dry spell.",
          stats: [
            { label: "Resilience", value: "High" },
            { label: "Acres Pollinated", value: "18" },
            { label: "Fruit Count", value: "Good" },
          ],
          image:
            "https://images.unsplash.com/photo-1596484393963-47a32c256247?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Mary Nduku",
          location: "Mbuinzau, Makueni",
          role: "Small Scale Exporter",
          acres: 5,
          description:
            "Quality over quantity is my motto. Bee pollination gave my mangoes the size and blush needed for the premium export crates.",
          quote: "Perfectly shaped fruit that gets the best price.",
          stats: [
            { label: "Price Premium", value: "+20%" },
            { label: "Acres Pollinated", value: "5" },
            { label: "Quality", value: "Top" },
          ],
          image:
            "https://images.unsplash.com/photo-1536511132770-4daf7575620d?auto=format&fit=crop&q=80&w=1200",
        },
      ],
    },
    {
      id: "beans",
      title: "Bean Yields",
      category: "Legumes",
      stories: [
        {
          farmer: "Alice Chebet",
          location: "Makindu, Makueni",
          role: "Mixed Crop Farmer",
          acres: 18,
          description:
            "Beans usually take care of themselves, but I wanted more. The 'tripping' effect of the bees was real. My pods filled out completely, no air pockets inside.",
          quote:
            "BeeYield's service helped us achieve a bumper harvest. The pods were consistently full.",
          stats: [
            { label: "Pod Fill", value: "98%" },
            { label: "Acres Pollinated", value: "18" },
            { label: "Harvest Time", value: "Uniform" },
          ],
          image: "/images/beans_case.png",
        },
        {
          farmer: "Geoffrey Otieno",
          location: "Kibwezi, Makueni",
          role: "Soya & Bean Farmer",
          acres: 22,
          description:
            "I grew soya and climbing beans. The bees worked both. The synchronized flowering and pod set made mechanical harvesting totally viable this year.",
          quote: "Uniform maturity saved me days of labor during harvest.",
          stats: [
            { label: "Labor Saving", value: "2 Days" },
            { label: "Acres Pollinated", value: "22" },
            { label: "Yield", value: "+22%" },
          ],
          image:
            "https://images.unsplash.com/photo-1515543904379-3d757afe72e3?auto=format&fit=crop&q=80&w=600",
        },
        {
          farmer: "Rose Auma",
          location: "Mbuinzau, Makueni",
          role: "Bean Farmer",
          acres: 10,
          description:
            "My bean crop has never looked this green and productive. The bees were constantly buzzing around. I harvested more bags per acre than ever before.",
          quote: "Record-breaking harvest for my farm.",
          stats: [
            { label: "Yield/Acre", value: "+20%" },
            { label: "Acres Pollinated", value: "10" },
            { label: "Pod Count", value: "High" },
          ],
          image:
            "https://images.unsplash.com/photo-1567306301408-9b74779a11af?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Paul Wafula",
          location: "Makindu, Makueni",
          role: "Commercial Farmer",
          acres: 35,
          description:
            "Rolling out BeeYield's hives across my 35 acres ensured consistent pod setting. The resulting uniformity in the bean size was perfect for processing.",
          quote:
            "Consistency is key for canning beans, and the bees delivered.",
          stats: [
            { label: "Consistency", value: "High" },
            { label: "Acres Pollinated", value: "35" },
            { label: "Rejection", value: "Low" },
          ],
          image:
            "https://images.unsplash.com/photo-1594247065091-62d3851b9e07?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Janet Kemunto",
          location: "Kibwezi, Makueni",
          role: "Mixed Farmer",
          acres: 7,
          description:
            "With limited land, I have to maximize efficiency. The bees helped my climbing beans produce pods right to the top of the poles.",
          quote: "Maximum production from every square foot of land.",
          stats: [
            { label: "Efficiency", value: "Maximized" },
            { label: "Acres Pollinated", value: "7" },
            { label: "Vertical Yield", value: "High" },
          ],
          image:
            "https://images.unsplash.com/photo-1615485500704-8e99099d9d0f?auto=format&fit=crop&q=80&w=1200",
        },
      ],
    },
    {
      id: "sisal",
      title: "Sisal Agave",
      category: "Fiber Crop",
      stories: [
        {
          farmer: "Estate Manager",
          location: "Mbuinzau, Makueni",
          role: "Sisal Plantation",
          acres: 500,
          description:
            "On 500 acres, biodiversity is a concern. The bees turned our flowering poles into a honey factory without disturbing seed production. A win-win for ecology and revenue.",
          quote:
            "Integrating bees created a new revenue stream from honey and improved local ecology.",
          stats: [
            { label: "Honey", value: "500kg" },
            { label: "Acres Managed", value: "500" },
            { label: "Sustainability", value: "High" },
          ],
          image: "/images/sisal_case.png",
        },
        {
          farmer: "Conservation Trust",
          location: "Makindu, Makueni",
          role: "Land Management",
          acres: 200,
          description:
            "We manage sisal barriers. The bees helped naturalize the fence lines and supported the surrounding wildflowers, boosting the overall insect population.",
          quote: "A perfect example of productive conservation.",
          stats: [
            { label: "Eco-Health", value: "Restored" },
            { label: "Acres Managed", value: "200" },
            { label: "Wildflowers", value: "Thriving" },
          ],
          image:
            "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Community Coop",
          location: "Kibwezi, Makueni",
          role: "Communal Land",
          acres: 100,
          description:
            "Our community uses sisal for crafts. The honey produced by the bees from the sisal flowers gave us an additional income source during the dry season.",
          quote: "Honey from sisal? A sweet surprise for our community.",
          stats: [
            { label: "Income", value: "Diversified" },
            { label: "Acres Managed", value: "100" },
            { label: "Honey Quality", value: "Unique" },
          ],
          image:
            "https://images.unsplash.com/photo-1590486803833-1c5dc8ce2ac3?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Private Rancher",
          location: "Mbuinzau, Makueni",
          role: "Ranching",
          acres: 1000,
          description:
            "Using bees on our sisal boundaries helps deter elephants while fixing carbon through better plant growth. It's a natural barrier system.",
          quote:
            "Bees, sisal, and elephants - a delicate but effective balance.",
          stats: [
            { label: "Conflict", value: "Reduced" },
            { label: "Acres Managed", value: "1000" },
            { label: "Eco-Balance", value: "Good" },
          ],
          image:
            "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Coastal Plantations",
          location: "Makindu, Makueni",
          role: "Commercial Agave",
          acres: 300,
          description:
            "We are experimenting with massive scale pollination. Initial results show healthier parent plants and more viable bulbils for replanting.",
          quote: "Investing in the future of our plantation stock.",
          stats: [
            { label: "Stock Health", value: "+10%" },
            { label: "Acres Managed", value: "300" },
            { label: "Propagation", value: "Easy" },
          ],
          image:
            "https://images.unsplash.com/photo-1599598425947-658b44670c5e?auto=format&fit=crop&q=80&w=1200",
        },
      ],
    },
    {
      id: "oranges",
      title: "Citrus Quality",
      category: "Fruit Orchard",
      stories: [
        {
          farmer: "Hassan Juma",
          location: "Kibwezi, Makueni",
          role: "Citrus Farmer",
          acres: 15,
          description:
            "My 15-acre orange grove had issues with fruit size. BeeYield ensured that every blossom got visited multiple times. The result? Big, heavy, juicy oranges.",
          quote:
            "The quality improved drastically. They are larger, sweeter, and fetch a better price.",
          stats: [
            { label: "Juice Content", value: "High" },
            { label: "Acres Pollinated", value: "15" },
            { label: "Fruit Size", value: "Large" },
          ],
          image:
            "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Mariam Abdi",
          location: "Mbuinzau, Makueni",
          role: "Orchard Owner",
          acres: 20,
          description:
            "We target the premium juice market. Brix levels are king. The stress-free pollination provided by the bees seemed to concentrate sugars better.",
          quote: "Our sweetness levels hit a record high this season.",
          stats: [
            { label: "Brix Level", value: "Top Tier" },
            { label: "Acres Pollinated", value: "20" },
            { label: "Bloom Coverage", value: "100%" },
          ],
          image:
            "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Ali Swaleh",
          location: "Makindu, Makueni",
          role: "Citrus Grower",
          acres: 10,
          description:
            "Salt air and heat can be tough on blossoms. The bees worked fast in the cool mornings. My lime trees are loaded with fruit this year.",
          quote: "Excellent set even with our rough coastal climate.",
          stats: [
            { label: "Climate Adaptation", value: "High" },
            { label: "Acres Pollinated", value: "10" },
            { label: "Yield", value: "+25%" },
          ],
          image:
            "https://images.unsplash.com/photo-1559181567-c3190ca9959b?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Farm Manager",
          location: "Kibwezi, Makueni",
          role: "Pixie Oranges",
          acres: 50,
          description:
            "Pixie oranges need to be seedless and sweet. Controlled pollination helps maintain quality. The bees did a great job navigating our dense orchard.",
          quote: "Dense canopy? No problem for BeeYield's hives.",
          stats: [
            { label: "Coverage", value: "100%" },
            { label: "Acres Pollinated", value: "50" },
            { label: "Fruit Quality", value: "Premium" },
          ],
          image:
            "https://images.unsplash.com/photo-1621696417779-795244793444?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Grace Mwende",
          location: "Mbuinzau, Makueni",
          role: "Lemon Farmer",
          acres: 5,
          description:
            "I wanted to extend my harvest season. The bees helped synchronize the bloom, so I had a massive, manageable harvest instead of sporadic picking.",
          quote: "Synchronized harvest simplified my labor planning.",
          stats: [
            { label: "Sync", value: "Perfect" },
            { label: "Acres Pollinated", value: "5" },
            { label: "Yield", value: "+18%" },
          ],
          image:
            "https://images.unsplash.com/photo-1595123049102-140a6e54145b?auto=format&fit=crop&q=80&w=1200",
        },
      ],
    },
    {
      id: "vegetables",
      title: "Mixed Vegetables",
      category: "Horticulture",
      stories: [
        {
          farmer: "Grace Wanjiku",
          location: "Makindu, Makueni",
          role: "Horticulturist",
          acres: 8,
          description:
            "I grow 12 types of vegetables on 8 intensive acres. The bees are generalists—they hit the peppers, the courgettes, everything. My rejection rate dropped by 15%.",
          quote:
            "We grow a bit of everything, and the bees have helped boost production across the board.",
          stats: [
            { label: "Crop Diversity", value: "12 Types" },
            { label: "Acres Pollinated", value: "8" },
            { label: "Defects", value: "-15%" },
          ],
          image:
            "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Njoroge K.",
          location: "Kibwezi, Makueni",
          role: "Market Gardener",
          acres: 5,
          description:
            "For the city market, looks matter. Misshapen courgettes don't sell. My bee-pollinated crop was straight and glossy.",
          quote: "The visual appeal of the produce is just different now.",
          stats: [
            { label: "Marketability", value: "+20%" },
            { label: "Acres Pollinated", value: "5" },
            { label: "Shape", value: "Perfect" },
          ],
          image:
            "https://images.unsplash.com/photo-1595855709915-f5b2b295ba5d?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Horti-Coop",
          location: "Mbuinzau, Makueni",
          role: "Export Veg",
          acres: 20,
          description:
            "French beans for export require delicate handling. The bees pollinated the flowers without damaging the delicate plants. Yields are up across the cooperative.",
          quote: "Gentle, effective pollination for high-value crops.",
          stats: [
            { label: "Export Quality", value: "Verified" },
            { label: "Acres Pollinated", value: "20" },
            { label: "Yield", value: "+12%" },
          ],
          image:
            "https://images.unsplash.com/photo-1557844352-761f2565b576?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Local school farm",
          location: "Makindu, Makueni",
          role: "Educational Farm",
          acres: 2,
          description:
            "We use the hives for education and pollination. The pumpkins and squashes grown by the students are record-breaking size this year thanks to the bees.",
          quote: "Education and production going hand in hand.",
          stats: [
            { label: "Size", value: "Record" },
            { label: "Acres Pollinated", value: "2" },
            { label: "Learning", value: "High" },
          ],
          image:
            "https://images.unsplash.com/photo-1621459586195-2cc677054f0c?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Urban Grower",
          location: "Kibwezi, Makueni",
          role: "Intensive Farming",
          acres: 1,
          description:
            "Even on 1 acre, density matters. The bees ensured that my vertical garden towers of capsicum set fruit at every level.",
          quote: "Maximizing yield in minimum space.",
          stats: [
            { label: "Vertical Set", value: "100%" },
            { label: "Acres Pollinated", value: "1" },
            { label: "Density", value: "High" },
          ],
          image:
            "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80&w=1200",
        },
      ],
    },
    {
      id: "tomatoes",
      title: "Tomato Greenhouses",
      category: "Greenhouse",
      stories: [
        {
          farmer: "Peter Njoroge",
          location: "Mbuinzau, Makueni",
          role: "Greenhouse Manager",
          acres: 3,
          description:
            "3 acres under plastic. We used to vibrate flowers by hand. The bees do it 40 hours a week for us. The savings on labor alone paid for the service.",
          quote:
            "Before bees, we had to mechanically vibrate flowers. The bees do it better and faster.",
          stats: [
            { label: "Labor Saved", value: "40 Hrs/Wk" },
            { label: "Acres Pollinated", value: "3" },
            { label: "Fruit Set", value: "99%" },
          ],
          image:
            "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Sarah Jenkins",
          location: "Makindu, Makueni",
          role: "Export Greenhouse",
          acres: 10,
          description:
            "Export tomatoes need to be uniform size. The bumblebee-like buzzing of BeeYield's hives ensured every flower released pollen completely.",
          quote:
            "Uniformity is our currency. The bees printed money for us this year.",
          stats: [
            { label: "Grade 1", value: "95%" },
            { label: "Acres Pollinated", value: "10" },
            { label: "Speed", value: "Fast" },
          ],
          image:
            "https://images.unsplash.com/photo-1561136120-f19b16ea9399?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "James Kinyanjui",
          location: "Kibwezi, Makueni",
          role: "Metro Greenhouse",
          acres: 5,
          description:
            "Supplying Nairobi hotels requires consistency. With bees, I don't miss a beat. Every cluster of flowers turns into a cluster of tomatoes.",
          quote: "Reliable production week after week.",
          stats: [
            { label: "Consistency", value: "High" },
            { label: "Acres Pollinated", value: "5" },
            { label: "Fruit Drop", value: "Zero" },
          ],
          image:
            "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Bio-Farm Ltd",
          location: "Mbuinzau, Makueni",
          role: "Organic Greenhouse",
          acres: 8,
          description:
            "We can't use hormones for fruit set. Bees are the only natural solution. They fit perfectly into our certified organic workflow.",
          quote: "The natural choice for organic certification.",
          stats: [
            { label: "Organic", value: "Certified" },
            { label: "Acres Pollinated", value: "8" },
            { label: "Set Rate", value: "98%" },
          ],
          image:
            "https://images.unsplash.com/photo-1558818498-28c1e002b655?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Innovation Hub",
          location: "Makindu, Makueni",
          role: "Research Greenhouse",
          acres: 1,
          description:
            "Monitoring the efficiency of bee pollination vs manual. The data is clear: bees are 3x more efficient and produce 15% heavier fruit.",
          quote: "Data-driven proof that nature does it best.",
          stats: [
            { label: "Efficiency", value: "3x" },
            { label: "Acres Pollinated", value: "1" },
            { label: "Weight", value: "+15%" },
          ],
          image:
            "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&q=80&w=1200",
        },
      ],
    },
    {
      id: "onions",
      title: "Onion Seed",
      category: "Seed Production",
      stories: [
        {
          farmer: "Seed Co. Rep",
          location: "Kibwezi, Makueni",
          role: "Production Lead",
          acres: 50,
          description:
            "On 50 acres of hybrid onion, you can't fake it. We placed 4 hives per acre. The activity was frantic. We broke our site record for seed yield per acre.",
          quote:
            "We are in the business of seeds, and bees are our most valuable employees.",
          stats: [
            { label: "Seed Yield", value: "+35%" },
            { label: "Acres Pollinated", value: "50" },
            { label: "Hive Density", value: "4/Acre" },
          ],
          image: "/images/onion-plantation.png",
        },
        {
          farmer: "Contract Farmer",
          location: "Mbuinzau, Makueni",
          role: "Irrigation Scheme",
          acres: 15,
          description:
            "Pollination is usually our bottleneck. Not this time. The coverage was so good we had to prop up the seed heads due to weight.",
          quote: "Heaviest heads I've ever seen.",
          stats: [
            { label: "Germination", value: "92%" },
            { label: "Acres Pollinated", value: "15" },
            { label: "Weight", value: "High" },
          ],
          image:
            "https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Daniel Moi",
          location: "Makindu, Makueni",
          role: "Seed Grower",
          acres: 10,
          description:
            "High altitude onion seed is valuable. The bees adapted well to the cooler mornings and ensured a profitable harvest.",
          quote: "Adaptable bees for our unique climate.",
          stats: [
            { label: "Adaptability", value: "Good" },
            { label: "Acres Pollinated", value: "10" },
            { label: "Profit", value: "+20%" },
          ],
          image:
            "https://images.unsplash.com/photo-1623226996614-727581559869?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Rift Valley Seeds",
          location: "Kibwezi, Makueni",
          role: "Commercial Seed",
          acres: 60,
          description:
            "We need purity. BeeYield managed the isolation distances and hive placement perfectly. Pure, high-quality hybrid seed was the result.",
          quote: "Purity and yield - the holy grail of seed production.",
          stats: [
            { label: "Genetic Purity", value: "100%" },
            { label: "Acres Pollinated", value: "60" },
            { label: "Yield", value: "+30%" },
          ],
          image:
            "https://images.unsplash.com/photo-1621459586326-c23f798889c3?auto=format&fit=crop&q=80&w=1200",
        },
        {
          farmer: "Smallholder Group",
          location: "Mbuinzau, Makueni",
          role: "Community Scheme",
          acres: 25,
          description:
            "Pooling our land for seed production was risky. The bees de-risked it by ensuring a bumper crop for everyone involved.",
          quote: "A collective success story.",
          stats: [
            { label: "Success", value: "Shared" },
            { label: "Acres Pollinated", value: "25" },
            { label: "Risk", value: "Lowered" },
          ],
          image:
            "https://images.unsplash.com/photo-1618382025171-47752e5a2db3?auto=format&fit=crop&q=80&w=1200",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-b from-secondary/30 to-background overflow-hidden">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <Badge
            variant="outline"
            className="mb-4 px-4 py-1.5 rounded-full text-primary border-primary/30"
          >
            Field Reports
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-foreground">
            Crop Case <span className="text-primary">Studies</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Explore how precision pollination is transforming yields across
            different crops. Verified results from our partner farmers.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {caseStudies.map((study) => (
              <Button
                key={study.id}
                variant="outline"
                size="sm"
                className="rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() =>
                  document
                    .getElementById(study.id)
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                {study.title}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Sections */}
      <div className="space-y-0">
        {caseStudies.map((study, index) => (
          <section
            key={study.id}
            id={study.id}
            className={`py-24 ${index % 2 === 0 ? "bg-background" : "bg-muted/30"}`}
          >
            <div className="container mx-auto px-4">
              {/* Section Title */}
              <div className="mb-12 flex items-center gap-4">
                <div
                  className={`p-3 rounded-full ${index % 2 === 0 ? "bg-secondary/50" : "bg-background"}`}
                >
                  <Sprout className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{study.title}</h2>
                  <Badge variant="secondary" className="mt-1">
                    {study.category}
                  </Badge>
                </div>
              </div>

              {/* Farmer Stories Carousel for this Crop */}
              <Carousel className="w-full relative">
                <CarouselContent>
                  {study.stories.map((story, storyIndex) => (
                    <CarouselItem key={storyIndex}>
                      <div
                        className={`flex flex-col lg:flex-row gap-12 lg:gap-20 items-center ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
                      >
                        {/* Image Column */}
                        <div className="w-full lg:w-1/2">
                          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl group border-4 border-background">
                            <img
                              src={story.image}
                              alt={`${story.farmer} - ${study.title}`}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                            <div className="absolute top-6 right-6 z-10">
                              <Badge className="bg-background/95 text-foreground backdrop-blur border-none shadow-xl px-4 py-2 text-sm font-bold">
                                {story.acres} Acres Pollinated
                              </Badge>
                            </div>
                            <div className="absolute bottom-8 left-8 text-white z-10">
                              <p className="font-bold text-2xl mb-2">
                                {story.farmer}
                              </p>
                              <p className="text-white/90 text-sm flex items-center font-medium bg-black/20 backdrop-blur-sm w-fit px-3 py-1 rounded-full">
                                <MapPin className="w-4 h-4 mr-1.5" />
                                {story.location}
                              </p>
                            </div>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-3 gap-4 mt-8">
                            {story.stats.map((stat, i) => (
                              <Card
                                key={i}
                                className="border-border/50 bg-card/80 backdrop-blur shadow-sm hover:shadow-md transition-shadow"
                              >
                                <CardContent className="p-4 text-center">
                                  <p className="text-xl md:text-2xl font-black text-primary mb-1">
                                    {stat.value}
                                  </p>
                                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                    {stat.label}
                                  </p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>

                        {/* Content Column */}
                        <div className="w-full lg:w-1/2 space-y-8">
                          <div>
                            <h3 className="text-2xl font-bold mb-3 flex items-center gap-2 text-primary">
                              <User className="w-6 h-6" />
                              Farmer Story
                            </h3>
                            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                              {story.description}
                            </p>
                          </div>

                          {/* Testimonial */}
                          <div className="relative p-8 md:p-10 bg-primary/5 rounded-3xl border border-primary/10">
                            <Quote className="absolute top-8 left-8 w-10 h-10 text-primary/20" />
                            <blockquote className="relative z-10 pt-6">
                              <p className="text-xl md:text-2xl font-medium italic text-foreground mb-6 leading-normal">
                                "{story.quote}"
                              </p>
                              <footer className="flex items-center gap-4 border-t border-primary/10 pt-6">
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl border-2 border-background shadow-sm">
                                  {story.farmer.charAt(0)}
                                </div>
                                <div>
                                  <cite className="not-italic font-bold text-foreground block text-lg">
                                    {story.farmer}
                                  </cite>
                                  <span className="text-sm text-muted-foreground font-medium">
                                    {story.role} &bull; {story.acres} Acres
                                  </span>
                                </div>
                              </footer>
                            </blockquote>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4 items-center pt-2">
                            <Button
                              asChild
                              size="lg"
                              className="w-full sm:w-auto rounded-full font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all h-14 px-8 text-lg"
                            >
                              <Link to="/pollination-request">
                                Book Pollination{" "}
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                              </Link>
                            </Button>
                            <p className="text-sm text-muted-foreground italic flex items-center">
                              <MapPin className="w-3 h-3 mr-1" /> Verified at{" "}
                              {story.location}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {/* IMPROVED Carousel Controls - Positioned clearly at the bottom center for mobile, or side for desktop */}
                <div className="flex justify-center gap-4 mt-8 md:mt-0 md:absolute md:top-1/2 md:-translate-y-1/2 md:w-full md:justify-between md:pointer-events-none md:px-4 lg:px-0 lg:-mx-16">
                  <div className="pointer-events-auto">
                    <CarouselPrevious className="relative left-0 translate-y-0 hover:bg-primary hover:text-primary-foreground border-2 border-primary/20 h-12 w-12 md:h-14 md:w-14 bg-background shadow-xl" />
                  </div>
                  <div className="pointer-events-auto">
                    <CarouselNext className="relative right-0 translate-y-0 hover:bg-primary hover:text-primary-foreground border-2 border-primary/20 h-12 w-12 md:h-14 md:w-14 bg-background shadow-xl" />
                  </div>
                </div>
              </Carousel>
            </div>
          </section>
        ))}
      </div>

      {/* CTA Footer */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Sprout className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Write Your Success Story?
          </h2>
          <p className="text-xl opacity-90 mb-8 leading-relaxed">
            Join these farmers and experience the power of precision
            pollination.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="rounded-full text-lg px-8 py-6 shadow-xl hover:scale-105 transition-transform"
          >
            <Link to="/pollination-request">Start Your Transformation</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Media;
