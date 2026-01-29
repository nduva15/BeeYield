
import { localIntelligence } from './src/services/localIntelligence';

async function testKnowledgeBase() {
    const queries = [
        "How do I use a fume board?",
        "What are the steps for alcohol wash?",
        "How do I fix laying workers?",
        "Difference between swarm cell and supersedure cell?",
        "How to use a Holst milk test?",
        "Tell me about bee escapes"
    ];

    console.log("--- Starting Local Intelligence Verification ---");

    for (const query of queries) {
        console.log(`\nQuery: "${query}"`);
        const response = await localIntelligence.chat(query);
        console.log(`Response: ${response}`);

        if (response.includes("offline mode") && !response.includes("operating in offline mode with access")) {
            console.error("FAIL: Fallback generic message received instead of specific content.");
        } else if (response.length < 50) {
            console.error("FAIL: Response too short, likely missed.");
        } else {
            console.log("PASS: Content retrieved.");
        }
    }
}

testKnowledgeBase();
