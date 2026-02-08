#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

/**
 * BeeYield Expert-MoE Router (C++)
 * 
 * This high-performance logic layer identifies user intent and routes
 * queries to the most relevant "Expert" hub.
 */

enum class ExpertType {
    AFRICAN,
    EUROPEAN_NA,
    ASIAN_OCEANIC,
    PATHOLOGY,
    GENERAL
};

struct RouteResult {
    ExpertType expert;
    float confidence;
    std::string reason;
};

class MoERouter {
public:
    RouteResult route_intent(const std::string& query) {
        std::string lower_query = query;
        std::transform(lower_query.begin(), lower_query.end(), lower_query.begin(), ::tolower);

        // Pathology Expert: Disease keywords
        if (contains(lower_query, {"varroa", "foulbrood", "nosema", "disease", "pest", "virus"})) {
            return {ExpertType::PATHOLOGY, 0.95f, "Pathology keywords detected"};
        }

        // African Expert: Regional keywords
        if (contains(lower_query, {"kenya", "ethiopia", "africa", "scutellata", "adansonii", "desert", "savannah"})) {
            return {ExpertType::AFRICAN, 0.90f, "African regional context detected"};
        }

        // Asian Expert: Regional keywords
        if (contains(lower_query, {"asia", "australia", "china", "india", "cerana", "giant hornet", "manuka"})) {
            return {ExpertType::ASIAN_OCEANIC, 0.85f, "Asian/Oceanic regional context detected"};
        }

        // Default to General Intelligence
        return {ExpertType::GENERAL, 1.0f, "General apiculture query"};
    }

private:
    bool contains(const std::string& text, const std::vector<std::string>& keywords) {
        for (const auto& kw : keywords) {
            if (text.find(kw) != std::string::npos) return true;
        }
        return false;
    }
};

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cerr << "Usage: moe_router <query>" << std::endl;
        return 1;
    }

    MoERouter router;
    RouteResult result = router.route_intent(argv[1]);

    std::cout << "Expert: " << static_cast<int>(result.expert) << std::endl;
    std::cout << "Confidence: " << result.confidence << std::endl;
    std::cout << "Reason: " << result.reason << std::endl;

    return 0;
}
