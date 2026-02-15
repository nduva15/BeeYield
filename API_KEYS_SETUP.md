# 🚨 Missing API Keys - BeeYield AI Configuration

## Problem Detected
Your BeeYield AI is missing both **OpenAI** and **Google AI (Gemini)** API keys!

This is why you're getting short outputs - the system falls back to basic knowledge base retrieval when LLM APIs aren't available.

## Solution: Add API Keys

### 1️⃣ **Get OpenAI API Key** (for GPT-4o)
1. Go to: https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-proj-...`)
5. Add to `.env`:
```bash
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE
```

### 2️⃣ **Get Google AI API Key** (for Gemini 2.0 Flash)
1. Go to: https://aistudio.google.com/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key
5. Add to `.env`:
```bash
GOOGLE_API_KEY=YOUR_GOOGLE_AI_KEY_HERE
```

### 3️⃣ **Restart Backend**
```bash
# Stop current backend (Ctrl+C)
cd backend
python -m uvicorn app.main:app --reload
```

## What This Fixes

### Before (Current State) ❌
```
Short output: "Varroa destructor is a mite. Causes wing deformity."
No citations, no links, ~50 words
```

### After (With API Keys) ✅
```markdown
## Varroa Destructor: Comprehensive Analysis

Varroa destructor is the most devastating parasitic mite... [800+ words]

### References
[1] USDA Research (database)
[2] HoneyChain Ledger (blockchain)

### Learn More
- Disease Database [link]
- Bee Health Guide [link]
```

## Cost Estimates

**OpenAI (GPT-4o):**
- $0.0025 per 1K input tokens
- $0.01 per 1K output tokens
- ~$0.05 per detailed query

**Google AI (Gemini 2.0 Flash):**
- FREE tier: 1500 requests/day
- Very low cost on paid tier

**For testing:** Start with Google AI (free), add OpenAI later for best quality.

## Alternative: Free Tier Only

If you only add **Google AI key**, the system will:
- ✅ Use Gemini 2.0 Flash for everything (free tier)
- ✅ Still get 800-1200 word responses
- ✅ Citations and links work
- ⚠️ Slightly lower quality than GPT-4o

---

**I've updated your `.env` file with placeholders. Add your keys and restart!**
