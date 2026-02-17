# 🐝 BEE-SOUND-ANALYSIS Integration Guide

## Architecture Overview

This integration connects the **BEE-SOUND-ANALYSIS** trained model to **BeeYield** using a **Kaggle Remote Inference Bridge**. This approach leverages Kaggle's free GPU/TPU resources while keeping the main application lightweight.

```
┌─────────────────┐      ┌──────────────┐      ┌─────────────────────┐      ┌──────────────┐
│  BeeYield UI    │─────▶│  Backend API │─────▶│  Kaggle Notebook    │─────▶│ Trained Model│
│  (React/TS)     │      │  (FastAPI)   │      │  (GPU Inference)    │      │  (28GB Data) │
└─────────────────┘      └──────────────┘      └─────────────────────┘      └──────────────┘
         │                       │                       │                           │
         │                       │                       │                           │
    Upload Audio          Store Job ID            Run Inference               Return Results
         │                       │                       │                           │
         │◀──────────────────────┴───────────────────────┴───────────────────────────┘
         │
    Display Results
```

## ✅ What's Already Connected

### Frontend (`src/components/beeyield/SoundAnalysisView.tsx`)
- ✅ Full acoustic analysis UI
- ✅ File upload handling
- ✅ Real-time processing animation
- ✅ Results visualization

### Backend (`backend/app/api/api_v1/endpoints/acoustic.py`)
- ✅ `/acoustic/inference/trigger` - Starts remote inference job
- ✅ `/acoustic/inference/callback` - Receives results from Kaggle
- ✅ `/acoustic/inferences/{job_id}` - Polls job status
- ✅ Database tables: `acoustic_inferences`, `acoustic_readings`

### Services
- ✅ `kaggleInferenceService.ts` - Frontend service for API calls
- ✅ `beeyieldService.ts` - Includes `getAcousticReadings()` and `createAcousticReading()`

## 🔧 Integration Steps

### Step 1: Prepare the Model for Kaggle Deployment

The BEE-SOUND-ANALYSIS repo has been cloned to `beeyield-sound-analysis/`. Next steps:

1. **Review the trained model artifacts:**
   ```bash
   ls beeyield-sound-analysis/
   ```

2. **Identify model files:**
   - `.h5` or `.pt` model weights
   - Training notebooks
   - Preprocessing scripts
   - Feature extraction code

### Step 2: Create Kaggle Dataset with Model

1. **Package the model artifacts:**
   ```bash
   cd beeyield-sound-analysis
   # Create a clean export directory
   mkdir -p model_export
   cp path/to/trained_model.h5 model_export/
   cp preprocessing.py model_export/
   ```

2. **Upload to Kaggle Datasets:**
   - Go to https://www.kaggle.com/datasets
   - Click "New Dataset"
   - Upload `model_export/` contents
   - Name it: `beeyield-sound-model-v4`

### Step 3: Update Kaggle Inference Notebook

The existing notebook at `kaggle/beeyield_headless_server.ipynb` needs to be adapted for sound analysis:

**Required Changes:**
1. Mount the `beeyield-sound-model-v4` dataset
2. Load the trained model
3. Add audio preprocessing (spectrograms, MFCC, etc.)
4. Update the `/acoustic/analyze` endpoint

**New Kaggle Notebook Structure:**
```python
# Load BEE-SOUND-ANALYSIS model
import tensorflow as tf  # or torch
model = tf.keras.models.load_model('/kaggle/input/beeyield-sound-model-v4/model.h5')

@app.post("/acoustic/analyze")
async def analyze_audio(audio_url: str):
    # 1. Download audio from URL
    # 2. Preprocess (spectrogram/MFCC)
    # 3. Run model inference
    # 4. Return prediction + confidence
    pass
```

### Step 4: Configure Webhook Endpoints

Update `backend/app/api/api_v1/endpoints/acoustic.py`:

```python
async def trigger_acoustic_inference(trigger: AcousticTrigger):
    # Current implementation creates job_id and stores in DB
    # TODO: Add actual Kaggle API integration
    
    # Option A: Use Kaggle API to trigger notebook
    # kaggle.api.kernels.push(...)
    
    # Option B: Direct HTTP to deployed notebook via Ngrok/Kaggle proxy
    kaggle_url = os.getenv("KAGGLE_INFERENCE_URL")  # From Ngrok tunnel
    response = await httpx.post(f"{kaggle_url}/acoustic/analyze", json={
        "audio_url": trigger.audio_url,
        "callback_url": f"{BACKEND_URL}/api/v1/acoustic/inference/callback"
    })
```

### Step 5: Environment Variables

Add to `.env`:
```bash
# Kaggle Inference Bridge
KAGGLE_INFERENCE_URL=https://xxxxx.ngrok.io  # From running Kaggle notebook
KAGGLE_API_KEY=your_secret_api_key_here

# Public callback URL (for Kaggle to reach your backend)
BACKEND_PUBLIC_URL=https://your-backend.com  # Or use Ngrok for dev
```

## 🚀 Deployment Options

### Option A: Always-On Kaggle Notebook (Recommended for Dev)
- **Pros:** Simple setup, free GPU usage
- **Cons:** Session timeout after 12 hours (free tier)
- **How:** Run `kaggle/beeyield_headless_server.ipynb` manually, keep session alive

### Option B: Kaggle API Kernel Push (Production)
- **Pros:** Automated, can trigger on-demand
- **Cons:** Requires Kaggle Pro ($) for reliable uptime
- **How:** Use `kaggle kernels push` to deploy notebook programmatically

### Option C: Hybrid Local + Kaggle
- **Pros:** Fast local testing, Kaggle for production inference
- **Cons:** Need to maintain both environments
- **How:** Add local TensorFlow/PyTorch fallback in `acoustic.py`

## 📊 Testing the Integration

### 1. Test Kaggle Endpoint (Manual)
```bash
# Upload test audio to Supabase Storage or public host
curl -X POST https://your-kaggle-endpoint.ngrok.io/acoustic/analyze \
  -H "X-API-Key: your_key" \
  -d '{"audio_url": "https://example.com/test.wav"}'
```

### 2. Test Backend Bridge
```bash
curl -X POST http://localhost:8000/api/v1/acoustic/inference/trigger \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "hive_id": "00000000-0000-0000-0000-000000000001",
    "audio_url": "https://example.com/test.wav",
    "model_type": "v4-28gb"
  }'
```

### 3. Test Full Flow from Frontend
1. Go to `http://localhost:5173/beeyield/sound-analysis`
2. Upload a `.wav` file
3. Watch the processing animation
4. Verify results appear (check browser console for API calls)

## 🔍 Monitoring & Debugging

### Check Inference Job Status
```sql
SELECT * FROM acoustic_inferences 
WHERE status = 'triggered' 
ORDER BY created_at DESC;
```

### Check Recorded Readings
```sql
SELECT * FROM acoustic_readings 
ORDER BY recorded_at DESC 
LIMIT 20;
```

### Backend Logs
```bash
# In backend terminal
tail -f backend/logs/uvicorn.log
```

## 📝 Next Steps

1. ✅ Clone BEE-SOUND-ANALYSIS (DONE)
2. ⏳ Identify trained model files in `beeyield-sound-analysis/`
3. ⏳ Create Kaggle dataset with model
4. ⏳ Update Kaggle notebook to load model
5. ⏳ Test inference endpoint
6. ⏳ Configure webhooks and callbacks
7. ⏳ End-to-end testing

## 🎯 Success Criteria

- [ ] Audio file uploaded from frontend
- [ ] Backend creates job and calls Kaggle
- [ ] Kaggle notebook processes audio with trained model
- [ ] Results returned via webhook to backend
- [ ] Frontend displays prediction + confidence
- [ ] Result saved to `acoustic_readings` table

## 📚 References

- [BEE-SOUND-ANALYSIS Repo](https://github.com/nduva15/BEE-SOUND-ANALYSIS)
- [Kaggle Notebooks API](https://github.com/Kaggle/kaggle-api)
- [FastAPI Webhooks Guide](https://fastapi.tiangolo.com/advanced/events/)
- [Ngrok Documentation](https://ngrok.com/docs)
