"""
BeeYield AI Link Generator
==========================
Automatically injects internal page links into AI responses based on detected topics.
"""

import re
from typing import List, Tuple

# Comprehensive page link mapping
PAGE_LINKS = {
    # Health & Diseases
    "bee health": "/learn",
    "hive health": "/beeyield-dashboard",
    "bee diseases": "/diseases",
    "varroa": "/diseases?filter=varroa",
    "varroa mite": "/diseases?filter=varroa",
    "varroa destructor": "/diseases?filter=varroa",
    "american foulbrood": "/diseases?filter=afb",
    "afb": "/diseases?filter=afb",
    "european foulbrood": "/diseases?filter=efb",
    "efb": "/diseases?filter=efb",
    "nosema": "/diseases?filter=nosema",
    "chalkbrood": "/diseases?filter=chalkbrood",
    "deformed wing virus": "/diseases?filter=dwv",
    "dwv": "/diseases?filter=dwv",
    "small hive beetle": "/diseases?filter=shb",
    "wax moth": "/diseases?filter=wax-moth",
    
    # Bee Biology
    "bee lifecycle": "/bee-data?section=lifecycle",
    "bee life cycle": "/bee-data?section=lifecycle",
    "queen bee": "/bee-data?section=queens",
    "worker bees": "/bee-data?section=workers",
    "worker bee": "/bee-data?section=workers",
    "drone bees": "/bee-data?section=drones",
    "drone bee": "/bee-data?section=drones",
    "bee anatomy": "/bee-data?section=anatomy",
    "bee behavior": "/bee-data?section=behavior",
    "foraging": "/bee-data?section=foraging",
    "bee communication": "/bee-data?section=communication",
    "waggle dance": "/bee-data?section=communication",
    
    # Honey & Products
    "honey types": "/honey-types",
    "types of honey": "/honey-types",
    "acacia honey": "/honey-types?type=acacia",
    "manuka honey": "/honey-types?type=manuka",
    "clover honey": "/honey-types?type=clover",
    "wildflower honey": "/honey-types?type=wildflower",
    "honey properties": "/honey-types?section=properties",
    "raw honey": "/honey-types?section=raw",
    "propolis": "/products?category=propolis",
    "royal jelly": "/products?category=royal-jelly",
    "beeswax": "/products?category=beeswax",
    "pollen": "/products?category=pollen",
    
    # IoT & Technology
    "hive monitoring": "/beeyield-dashboard/meters",
    "intelligent hive": "/intelligent-hives",
    "intelligent hives": "/intelligent-hives",
    "smart hive": "/intelligent-hives",
    "iot sensor": "/beeyield-dashboard/meters",
    "iot sensors": "/beeyield-dashboard/meters",
    "sensor data": "/beeyield-dashboard/meters",
    "hive scale": "/intelligent-hives?section=scales",
    "temperature monitoring": "/beeyield-dashboard/meters",
    "humidity monitoring": "/beeyield-dashboard/meters",
    
    # Pollination
    "pollination services": "/pollination-services",
    "pollination service": "/pollination-services",
    "crop pollination": "/pollination-request",
    "pollination request": "/pollination-request",
    "pollinator": "/pollination-services",
    "pollinators": "/pollination-services",
    "almonds pollination": "/pollination-services?crop=almonds",
    "avocado pollination": "/pollination-services?crop=avocado",
    
    # Traceability & Blockchain
    "honey traceability": "/traceability",
    "blockchain": "/traceability",
    "honeychain": "/traceability",
    "batch tracking": "/traceability",
    "verify honey": "/traceability",
    
    # Management
    "apiary management": "/beeyield-dashboard",
    "hive management": "/beeyield-dashboard",
    "beekeeping": "/beeyield-dashboard",
    "harvest": "/beeyield-dashboard/harvests",
    "harvesting": "/beeyield-dashboard/harvests",
    "honey harvest": "/beeyield-dashboard/harvests",
    "inspection": "/beeyield-dashboard/inspections",
    "hive inspection": "/beeyield-dashboard/inspections",
    
    # Education & Resources
    "beekeeping course": "/courses",
    "bee course": "/courses",
    "training": "/courses",
    "tutorial": "/resources/tutorials",
    "guide": "/resources/guides",
    "blog": "/blog",
    "market data": "/market-analysis",
    "market analysis": "/market-analysis",
    "global research": "/research-hub",
    "research hub": "/research-hub",
    
    # Company
    "about beeyield": "/about",
    "contact": "/contact",
    "careers": "/careers",
    "shop": "/shop",
}


def detect_topics(text: str) -> List[str]:
    """
    Extract topics from text that match our page link keywords.
    Returns list of detected keywords.
    """
    text_lower = text.lower()
    detected = []
    
    for keyword in PAGE_LINKS.keys():
        # Use word boundaries to avoid false matches
        pattern = r'\b' + re.escape(keyword) + r'\b'
        if re.search(pattern, text_lower):
            detected.append(keyword)
    
    return detected


def inject_page_links(text: str, detected_topics: List[str] = None, max_links: int = 5) -> str:
    """
    Inject internal page links based on detected topics.
    Returns text with [Insert Link: beeyield.com/...] markers.
    
    Args:
        text: The AI response text
        detected_topics: Explicitly provided topics (if None, auto-detect)
        max_links: Maximum number of links to inject (default: 5)
    
    Returns:
        Enhanced text with link markers
    """
    if detected_topics is None:
        detected_topics = detect_topics(text)
    
    if not detected_topics:
        return text
    
    # Build list of (keyword, url) pairs to inject
    links_to_add: List[Tuple[str, str]] = []
    added_urls = set()
    
    for topic in detected_topics:
        topic_lower = topic.lower()
        if topic_lower in PAGE_LINKS:
            url = PAGE_LINKS[topic_lower]
            # Avoid duplicate URLs
            if url not in added_urls:
                links_to_add.append((topic, url))
                added_urls.add(url)
                if len(links_to_add) >= max_links:
                    break
    
    if not links_to_add:
        return text
    
    # Insert links strategically: after first mention of each keyword
    enhanced_text = text
    offset = 0  # Track position shifts due to insertions
    
    for keyword, url in links_to_add:
        # Find first occurrence (case-insensitive)
        pattern = re.compile(r'\b' + re.escape(keyword) + r'\b', re.IGNORECASE)
        match = pattern.search(enhanced_text[offset:])
        
        if match:
            # Calculate absolute position
            abs_pos = offset + match.end()
            link_marker = f" [Insert Link: beeyield.com{url}]"
            
            # Insert link marker
            enhanced_text = enhanced_text[:abs_pos] + link_marker + enhanced_text[abs_pos:]
            
            # Update offset to avoid re-matching
            offset = abs_pos + len(link_marker)
    
    return enhanced_text


def format_citations(text: str, sources: List[dict], max_citations: int = 12) -> str:
    """
    Add inline citations and References section to the text.
    
    Args:
        text: The AI response text
        sources: List of source dicts with 'name' and 'type' keys
        max_citations: Maximum citations to include
    
    Returns:
        Text with references section appended
    """
    if not sources:
        return text
    
    # Build references section
    refs = "\n\n---\n### 📚 References\n"
    for i, source in enumerate(sources[:max_citations], 1):
        source_name = source.get("name", "Unknown Source")
        source_type = source.get("type", "document")
        
        # Format type nicely
        type_emoji = {
            "blockchain": "⛓️",
            "iot": "📡",
            "database": "💾",
            "web": "🌐",
            "document": "📄",
            "research": "🔬",
        }.get(source_type.lower(), "📄")
        
        refs += f"[{i}] {source_name} ({type_emoji} {source_type})\n"
    
    return text + refs


def add_learn_more_section(text: str, detected_topics: List[str], max_suggestions: int = 3) -> str:
    """
    Add a "Learn More" section with suggested links.
    
    Args:
        text: The AI response text
        detected_topics: Topics detected in the query
        max_suggestions: Maximum suggestions to include
    
    Returns:
        Text with Learn More section appended
    """
    if not detected_topics:
        return text
    
    # Build suggestions based on topics
    suggestions = []
    added_urls = set()
    
    for topic in detected_topics:
        topic_lower = topic.lower()
        if topic_lower in PAGE_LINKS:
            url = PAGE_LINKS[topic_lower]
            if url not in added_urls:
                # Create readable title from URL
                title = url.split('?')[0].replace('/', ' › ').strip(' › ')
                title = title.replace('-', ' ').title()
                suggestions.append(f"- {title} [Insert Link: beeyield.com{url}]")
                added_urls.add(url)
                if len(suggestions) >= max_suggestions:
                    break
    
    if not suggestions:
        # Default suggestions
        suggestions = [
            "- Bee Health Guide [Insert Link: beeyield.com/bee-health]",
            "- Disease Database [Insert Link: beeyield.com/diseases]",
            "- Intelligent Hives [Insert Link: beeyield.com/intelligent-hives]",
        ]
    
    learn_more = "\n\n### 🔗 Learn More\n" + "\n".join(suggestions[:max_suggestions])
    
    return text + learn_more


# Convenience function for full enhancement
def enhance_response(
    text: str,
    sources: List[dict] = None,
    detected_topics: List[str] = None,
    add_citations: bool = True,
    add_links: bool = True,
    add_suggestions: bool = True
) -> str:
    """
    Apply full enhancement pipeline to AI response.
    
    Args:
        text: Original AI response
        sources: Citation sources
        detected_topics: Explicitly detected topics (auto-detect if None)
        add_citations: Whether to add references section
        add_links: Whether to inject internal links
        add_suggestions: Whether to add Learn More section
    
    Returns:
        Fully enhanced response
    """
    enhanced = text
    
    # Auto-detect topics if not provided
    if detected_topics is None and (add_links or add_suggestions):
        detected_topics = detect_topics(text)
    
    # Apply enhancements
    if add_links and detected_topics:
        enhanced = inject_page_links(enhanced, detected_topics)
    
    if add_citations and sources:
        enhanced = format_citations(enhanced, sources)
    
    if add_suggestions and detected_topics:
        enhanced = add_learn_more_section(enhanced, detected_topics)
    
    return enhanced
