# BeeYield AI Enhancement Plan 🐝🧠
**Transform BeeYield AI from RAG Retrieval → Modern LLM Assistant with Citations & Internal Links**

---

## 🎯 Current State vs. Target State

### ❌ **Current Problems:**
1. **Short outputs** - Just retrieval snippets, not comprehensive answers
2. **No citations/links** - Missing references to data sources
3. **RAG-only** - Using knowledge base retrieval without LLM synthesis
4. **No internal navigation** - Not linking to bee health, diseases, or data pages
5. **Limited usefulness** - Feels like a search results list, not an AI assistant

### ✅ **Target State (Like ChatGPT/Claude):**
1. **Detailed, comprehensive answers** (800-1200 words minimum)
2. **Inline citations** - Link to knowledge base sources [1], [2], etc.
3. **Internal page links** - Direct users to:
   - `/bee-health` - Bee Health Guide
   - `/diseases` - Disease dropdown data
   - `/api/data/bee-data` - Bee species, lifecycle, behavior data
4. **Hybrid RAG + LLM** - Retrieve facts, then generate detailed answers using OpenAI/Gemini
5. **Professional formatting** - Markdown headings, bullet lists, bold keyw ords

---

## 🏗️ **Current Architecture**

### Backend (`backend/app/services/ai_service.py`)
- ✅ **Dual-API System**: Gemini 2.0 Flash + GPT-4o
- ✅ **Hybrid Search**: BM25 + Qdrant vector search
- ✅ **Knowledge Base**: 13,893+ documents
- ✅ **Length enforcement**: 800-1200 word target
- ⚠️ **Citations**: Collected but not formatted in response
- ⚠️ **Internal links**: No auto-linking to pages

### Frontend (`src/components/beeyield/AIAssistantView.tsx`)
- ✅ **Chat interface**: Beautiful UI with history
- ✅ **Source badges**: Displays sources as chips
- ⚠️ **Link parsing**: Only handles `[Insert Link: beeyield.com/...]` format
- ❌ **No automatic link detection** for diseases, bee data, etc.

---

## 🚀 **Enhancement Strategy**

### **Phase 1: Enhanced Citations & Internal Linking**

#### **1.1 Backend: Add Page URL Mapping**

Create a mapping for automatic page suggestions:

```python
# backend/app/services/link_generator.py

PAGE_LINKS = {
    # Health & Diseases
    "bee health": "/bee-health",
    "bee diseases": "/diseases",
    "varroa": "/diseases?filter=varroa",
    "american foulbrood": "/diseases?filter=afb",
    "nosema": "/diseases?filter=nosema",
    "chalkbrood": "/diseases?filter=chalkbrood",
    
    # Bee Biology
    "bee lifecycle": "/bee-data?section=lifecycle",
    "queen bee": "/bee-data?section=queens",
    "worker bees": "/bee-data?section=workers",
    "drone bees": "/bee-data?section=drones",
    
    # Honey & Products
    "honey types": "/honey-types",
    "acacia honey": "/honey-types?type=acacia",
    "manuka honey": "/honey-types?type=manuka",
    
    # IoT & Tech
    "hive monitoring": "/beeyield-dashboard/meters",
    "sensor data": "/beeyield-dashboard/meters",
    "intelligent hives": "/intelligent-hives",
    
    # Pollination
    "pollination services": "/pollination-services",
    "crop pollination": "/pollination-request",
}

def inject_page_links(text: str, detected_topics: list[str]) -> str:
    """
    Inject internal page links based on detected topics.
    Returns text with [Insert Link: beeyield.com/...] markers.
    """
    links_to_add = []
    
    for topic in detected_topics:
        topic_lower = topic.lower()
        for keyword, url in PAGE_LINKS.items():
            if keyword in topic_lower and url not in [l[1] for l in links_to_add]:
                links_to_add.append((keyword, url))
    
    # Insert links at relevant positions in text
    enhanced_text = text
    for keyword, url in links_to_add[:5]:  # Max 5 links
        # Find first occurrence of keyword and insert link after
        import re
        pattern = re.compile(re.escape(keyword), re.IGNORECASE)
        match = pattern.search(enhanced_text)
        if match:
            insert_pos = match.end()
            link_marker = f" [Insert Link: beeyield.com{url}]"
            enhanced_text = enhanced_text[:insert_pos] + link_marker + enhanced_text[insert_pos:]
    
    return enhanced_text
```

#### **1.2 Backend: Citation Formatting**

Modify `ai_service.py` to add inline citations:

```python
# In AIService.chat() method, after final_answer generation:

def format_citations(text: str, sources: list[dict]) -> str:
    """
    Add inline citations [1], [2], etc. to the text.
    Append "References:" section at end.
    """
    if not sources:
        return text
    
    # Build references section
    refs = "\n\n---\n### 📚 References\n"
    for i, source in enumerate(sources[:12], 1):
        source_name = source.get("name", "Unknown")
        source_type = source.get("type", "document")
        refs += f"[{i}] {source_name} ({source_type})\n"
    
    return text + refs

# Apply in final answer
final_answer = format_citations(final_answer, citations)

# Detect topics and inject page links
from app.services.link_generator import inject_page_links
detected_topics = [...]  # Extract from message or knowledge_context
final_answer = inject_page_links(final_answer, detected_topics)
```

#### **1.3 Frontend: Enhanced Link Rendering**

Update `AIAssistantView.tsx` to support more link formats:

```typescript
const FormattedMessage: React.FC<{ content: string, isUser: boolean }> = ({ content, isUser }) => {
    if (isUser) return <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>;

    // Process markdown-style links [text](url)
    const processMarkdownLinks = (text: string) => {
        const parts = text.split(/(\[.*?\]\(.*?\))/g);
        return parts.map((part, i) => {
            const match = part.match(/\[(.*?)\]\((.*?)\)/);
            if (match) {
                const [, text, url] = match;
                return (
                    <a
                        key={i}
                        href={url}
                        className="text-[#F4D03F] font-bold hover:underline underline-offset-4"
                    >
                        {text}
                    </a>
                );
            }
            return <span key={i}>{part}</span>;
        });
    };

    // Process BeeYield internal links [Insert Link: ...]
    const parts = content.split(/(#+\s+.*|\[Insert Link:.*?\]|\*\*.*?\*\*)/g);

    return (
        <div className="text-sm leading-relaxed whitespace-pre-wrap space-y-3">
            {parts.map((part, i) => {
                // Headings
                if (part.startsWith('###')) {
                    return <h4 key={i} className="text-base font-black mt-4 mb-2">{part.replace('###', '').trim()}</h4>;
                }
                if (part.startsWith('##')) {
                    return <h3 key={i} className="text-lg font-black mt-6 mb-3">{part.replace('##', '').trim()}</h3>;
                }
                
                // Internal links
                const linkMatch = part.match(/\[Insert Link: beeyield\.com(\/[^\]]+)\]/);
                if (linkMatch) {
                    const path = linkMatch[1];
                    return (
                        <a
                            key={i}
                            href={path}
                            className="inline-flex items-center gap-1 text-[#F4D03F] font-bold hover:underline px-2 py-1 bg-[#F4D03F]/10 rounded"
                        >
                            <LinkIcon className="w-3 h-3" />
                            {path.replace(/\//g, ' › ').trim()}
                        </a>
                    );
                }
                
                // Bold
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} className="font-black">{part.slice(2, -2)}</strong>;
                }
                
                return <span key={i}>{pr

ocessMarkdownLinks(part)}</span>;
            })}
        </div>
    );
};
```

---

### **Phase 2: Bee Health & Disease Integration**

#### **2.1 Create Bee Health Data Endpoint**

```python
# backend/app/api/api_v1/endpoints/bee_data.py

@router.get("/bee-health")
async def get_bee_health_guide():
    """
    Return comprehensive bee health data for AI context.
    """
    return {
        "diseases": [
            {
                "name": "Varroa Destructor",
                "type": "parasitic_mite",
                "severity": "critical",
                "symptoms": ["Deformed wings", "Shortened abdomen", "Crawling bees"],
                "treatment": ["Formic acid", "Oxalic acid", "Amitraz"],
                "url": "/diseases?filter=varroa"
            },
            {
                "name": "American Foulbrood (AFB)",
                "type": "bacterial",
                "severity": "critical",
                "symptoms": ["Foul odor", "Ropy larvae", "Sunken/perforated cappings"],
                "treatment": ["Burn infected hives", "Antibiotics (prevention)"],
                "url": "/diseases?filter=afb"
            },
            # ... more diseases
        ],
        "health_indicators": [
            {"metric": "brood_pattern", "healthy": "Solid pattern, 90%+ coverage"},
            {"metric": "bee_behavior", "healthy": "Active foraging, no aggression"}
        ]
    }
```

#### **2.2 Inject Bee Health Data into AI Context**

```python
#In ai_service.py, within the chat() method:

# Phase 1: After hybrid search
if any(kw in msg_lower for kw in ["disease", "health", "sick", "varroa", "foulbrood"]):
    async with httpx.AsyncClient() as client:
        health_resp = await client.get(f"{settings.API_BASE_URL}/bee-data/bee-health")
        if health_resp.status_code == 200:
            health_data = health_resp.json()
            knowledge_context += f"\n\n--- BEE HEALTH DATABASE ---\n{json.dumps(health_data, indent=2)}"
            
            # Auto-add disease page links
            detected_topics.extend([d["name"] for d in health_data.get("diseases", [])])
```

---

### **Phase 3: Better Output Quality**

#### **3.1 Enforce Minimum Length & Structure**

Already implemented in `ai_service.py`:
- ✅ 800-1200 word target
- ✅ 5-7 paragraph minimum
- ✅ Markdown structure (##, ###)

#### **3.2 Add "Learn More" Suggestions**

```python
# In chat() method, after final_answer:

suggestions = [
    "View full bee health guide [Insert Link: beeyield.com/bee-health]",
    "Check disease database [Insert Link: beeyield.com/diseases]",
    "Monitor your hives with IoT [Insert Link: beeyield.com/intelligent-hives]",
]

final_answer += f"\n\n### 🔗 Learn More\n" + "\n".join(f"- {s}" for s in suggestions[:3])
```

---

## 📊 **Expected Output Format**

### Before Enhancement:
```
Found 3 results about Varroa mites.
- Varroa destructor is a parasitic mite
- Causes wing deformity
- Treat with formic acid
```

### After Enhancement:
```markdown
## Varroa Destructor: Biology, Impact, and Treatment

Varroa destructor is the most devastating parasitic mite affecting honeybees worldwide [1]. First discovered in Asia, it has spread globally and threatens both commercial and hobbyist beekeeping operations [Insert Link: beeyield.com/diseases?filter=varroa].

### Life Cycle and Transmission

The female mite reproduces inside capped brood cells, feeding on developing pupae [2]. This causes:
- **Deformed Wing Virus (DWV)** [3]
- Shortened abdomens
- Reduced lifespan
- Colony collapse if untreated

### Treatment Options [Insert Link: beeyield.com/bee-health]

1. **Organic acids**: Formic acid 65%, Oxalic acid sublimation
2. **Synthetic**: Amitraz, flumethrin strips
3. **IPM**: Drone brood trapping, screened bottom boards

**Current 2026 Intelligence**: Amitraz resistance confirmed in 45% of Kenyan apiaries [4]. Rotate treatments to prevent resistance buildup.

---

### 📚 References
[1] USDA Bee Research Lab - Varroa Biology (database)
[2] BeeYield Knowledge Base - Parasitic Diseases (iot)
[3] HoneyChain Ledger - Treatment Records (blockchain)
[4] Verifiable AI Report - Feb 2026 Outbreak Trends (web)

### 🔗 Learn More
- View full bee health guide [Insert Link: beeyield.com/bee-health]
- Check disease database [Insert Link: beeyield.com/diseases]
- Monitor mite levels with IoT [Insert Link: beeyield.com/intelligent-hives]
```

---

## ✅ **Implementation Checklist**

### Backend
- [ ] Create `link_generator.py` with page mapping
- [ ] Add `format_citations()` function
- [ ] Create `/bee-data/bee-health` endpoint
- [ ] Inject disease data into AI context when relevant
- [ ] Add "Learn More" suggestions to all responses

### Frontend
- [ ] Enhance `FormattedMessage` component for markdown links
- [ ] Add icons for internal link chips (LinkIcon, ExternalLinkIcon)
- [ ] Display citations/references at end of messages
- [ ] Make source badges clickable (navigate to relevant pages)

### Data
- [ ] Map all diseases to `/diseases?filter=X` URLs
- [ ] Create bee data page at `/bee-data`
- [ ] Ensure bee health guide exists at `/bee-health`

---

## 🎯 **Success Metrics**

1. **Output Length**: Average response ≥ 600 words
2. **Citations**: 100% of technical answers include references
3. **Internal Links**: ≥ 2 relevant page links per response
4. **User Engagement**: Click-through rate on internal links ≥ 30%
5. **Satisfaction**: User feedback rating ≥ 4.5/5

---

## 🚢 **Deployment Plan**

1. **Week 1**: Backend enhancements (citations, links)
2. **Week 2**: Frontend UI improvements (markdown rendering)
3. **Week 3**: Bee health data integration
4. **Week 4**: Testing & refinement

---

**Want me to start implementing these changes?** 🚀
