# 🚀 BeeYield Quick Start Guide

## Current System Status
✅ Backend running on http://localhost:8000  
✅ Frontend running on http://localhost:5173  
✅ Database connected (Supabase + ClickHouse)  
✅ HoneyChain™ blockchain active (366 blocks)  

---

## Quick Commands

### Test Backend
```bash
# Health check
curl http://localhost:8000/

# API docs
open http://localhost:8000/docs

# Blockchain status
curl http://localhost:8000/api/v1/traceability/chain

# AI status
curl http://localhost:8000/api/v1/ai/status
```

### Test Frontend
```bash
# Open main site
open http://localhost:5173/

# BeeYield Dashboard
open http://localhost:5173/beeyield

# Traceability page
open http://localhost:5173/traceability

# Test batch code
open http://localhost:5173/traceability?code=KIB-KIB-H001-0126
```

### Verify Harvests Data
```bash
cd backend
.\venv\Scripts\python.exe verify_harvests.py
```

---

## Key Features to Test

### 1. Create a Harvest
1. Go to http://localhost:5173/beeyield/harvests
2. Click "Record New Harvest"
3. Fill in details (hive, date, quantity, honey type, color)
4. Submit → automatically sealed on blockchain!
5. Check toast notification for batch code

### 2. Trace a Batch
1. Go to http://localhost:5173/traceability
2. Enter batch code: `KIB-KIB-H001-0126`
3. See full journey:
   - Farmer (Timothy Nduva)
   - Apiary location
   - Hive details
   - Harvest data
   - Blockchain verification

### 3. AI Assistant
1. Go to http://localhost:5173/beeyield/ai-assistant
2. Ask: "Tell me about Timothy Nduva"
3. Ask: "What is the 50/50 promise?"
4. Ask: "Show me recent harvests"
5. Notice **markdown formatting** in responses!

---

## Database Schema

### Harvests Table (Complete)
```sql
CREATE TABLE harvests (
    id UUID PRIMARY KEY,
    harvest_date DATE NOT NULL,
    quantity_kg DECIMAL NOT NULL,
    quantity_left_for_bees_kg DECIMAL,
    honey_type TEXT,              -- NEW
    color_grade TEXT,             -- NEW
    is_verified BOOLEAN,          -- NEW
    batch_code TEXT,              -- NEW
    hive_id UUID REFERENCES hives(id),
    farmer_id UUID REFERENCES farmers(id),
    apiary_id UUID REFERENCES apiaries(id),
    blockchain_hash TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints

### Traceability
- `GET /api/v1/traceability/code/{code}` - Trace batch
- `POST /api/v1/traceability/harvests` - Record harvest
- `POST /api/v1/traceability/apiaries` - Create apiary
- `POST /api/v1/traceability/hives` - Create hive
- `GET /api/v1/traceability/chain` - Blockchain status

### AI Assistant
- `POST /api/v1/ai/chat` - Chat with AI
- `GET /api/v1/ai/status` - AI knowledge base status

---

## Troubleshooting

### Backend not responding?
```bash
# Check if running
curl http://localhost:8000/

# Restart if needed
cd backend
.\venv\Scripts\python.exe main.py
```

### Frontend not loading?
```bash
# Check if running
curl http://localhost:5173/

# Restart if needed
npm run dev
```

### Database connection issues?
- Check `.env` file has correct Supabase credentials
- Verify httpx is installed: `pip install httpx`
- Run verification: `python verify_harvests.py`

---

## Sample Batch Codes to Test
- `KIB-KIB-H001-0126`
- `KIB-KIB-H005-0126`
- `KIB-KIB-H015-0126`

---

## Documentation
- **Full Implementation**: `IMPLEMENTATION_SUMMARY.md`
- **System Status**: `STATUS.md`
- **API Docs**: http://localhost:8000/docs

---

**Need Help?** Check the documentation files or run `verify_harvests.py` to test the system.

🐝 **Happy Beekeeping!** 🍯
