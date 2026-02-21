# BeeYield Oxidize Plan
## Python → Rust Migration (75/10/15 Architecture)

---

## Codebase Audit Summary

### Current Python Backend: ~390KB across 35 services, 37 endpoints
| Service File | Lines | Bytes | Category | Rust Priority |
|---|---|---|---|---|
| `ai_assistant.py` | ~1400 | 54KB | AI/RAG orchestration | ⬜ Keep (LLM glue) |
| `ai_service.py` | ~600 | 21KB | AI/RAG | ⬜ Keep (LLM glue) |
| `traceability_service.py` | 745 | 34KB | **Blockchain + DB** | 🟥 Port (core logic) |
| `shop_service.py` | ~800 | 30KB | E-commerce CRUD | 🟨 Partial (validation) |
| `pollination_service.py` | 706 | 29KB | **Compute + CRUD** | 🟥 Port (calculations) |
| `ingestion_pipelines.py` | 582 | 21KB | **Data processing** | 🟥 Port (batch transform) |
| `image_analysis_service.py` | 570 | 21KB | **ML inference** | 🟥 Port (image pipeline) |
| `metadata_standardizer.py` | 469 | 17KB | **Hashing + classification** | 🟥 Port (pure compute) |
| `streaming_search.py` | ~600 | 21KB | Vector search | 🟨 Partial (query build) |
| `reports_service.py` | ~500 | 17KB | Report generation | 🟨 Partial (PDF template) |
| `polygon_service.py` | ~400 | 12KB | Geospatial | 🟥 Port (geometry math) |
| `label_studio_service.py` | ~400 | 12KB | Labeling service | ⬜ Keep (API client) |
| `link_generator.py` | ~350 | 10KB | URL generation | 🟥 Port (string ops) |
| `content_service.py` | ~300 | 9KB | CMS content | ⬜ Keep (DB proxy) |
| `blog_ai_service.py` | ~250 | 7KB | AI blogging | ⬜ Keep (LLM glue) |
| `harvest_batch_service.py` | 214 | 7KB | **Batch ID + snapshots** | 🟥 Port (core logic) |
| `email_service.py` | ~250 | 7KB | Email sending | ⬜ Keep (external API) |
| `vector_store.py` | ~250 | 7KB | Qdrant client | ⬜ Keep (client SDK) |
| `acoustic_analyzer.py` | 165 | 6KB | **Audio processing** | 🟥 Port (DSP + voting) |
| `bee_health_ai.py` | 130 | 5KB | **Health scoring** | 🟥 Port (pure compute) |
| `sync_scheduler.py` | ~150 | 4KB | Background tasks | ⬜ Keep (asyncio glue) |
| `rate_limit_manager.py` | 120 | 4KB | **Rate limiting** | 🟥 Port (timing + jitter) |
| `iot_service.py` | ~100 | 3KB | IoT sensor CRUD | ⬜ Keep (thin DB proxy) |
| `bee_atomic.py` | ~100 | 3KB | Atomic operations | 🟥 Port (concurrency) |
| `synthesizer.py` | ~90 | 2KB | Data synthesis | 🟥 Port |
| `meter_service.py` | ~80 | 2KB | Meter readings | ⬜ Keep (thin DB proxy) |
| `mpesa.py` | ~70 | 2KB | M-Pesa payments | ⬜ Keep (external API) |
| `payment.py` | ~50 | 1KB | Payment proxy | ⬜ Keep (external API) |
| `form_service.py` | ~40 | 1KB | Form handling | ⬜ Keep (thin DB proxy) |

---

## Architecture: The Oxidized Stack

```
┌──────────────────────────────────────────────┐
│            Python (10% — Thin Wrapper)        │
│  main.py → FastAPI app, CORS, lifespan       │
│  endpoints/*.py → Route handlers (request →  │
│    validate → call Rust → return response)    │
│  config.py → .env loading                    │
│  External SDK wrappers (Supabase, OpenAI)    │
└───────────────────┬──────────────────────────┘
                    │ PyO3 FFI
┌───────────────────▼──────────────────────────┐
│        Rust (75% — beeyield_core crate)       │
│                                               │
│  ┌─────────────┐  ┌──────────────────────┐   │
│  │ health.rs   │  │ traceability.rs      │   │
│  │ anomaly det │  │ blockchain ops       │   │
│  │ risk pred.  │  │ batch creation       │   │
│  │ score calc  │  │ journey builder      │   │
│  └─────────────┘  └──────────────────────┘   │
│  ┌─────────────┐  ┌──────────────────────┐   │
│  │ ingest.rs   │  │ standardizer.rs      │   │
│  │ pipeline    │  │ GID hashing (SHA256) │   │
│  │ batch xform │  │ domain classification│   │
│  │ lakehouse   │  │ chunking + geo det.  │   │
│  └─────────────┘  └──────────────────────┘   │
│  ┌─────────────┐  ┌──────────────────────┐   │
│  │ pollinate.rs│  │ image.rs             │   │
│  │ needs calc  │  │ bbox NMS             │   │
│  │ FPA ratio   │  │ health aggregation   │   │
│  │ analytics   │  │ annotated image gen  │   │
│  └─────────────┘  └──────────────────────┘   │
│  ┌─────────────┐  ┌──────────────────────┐   │
│  │ acoustic.rs │  │ rate_limit.rs        │   │
│  │ segmenting  │  │ exp backoff + jitter │   │
│  │ vote agg.   │  │ throttle decorator   │   │
│  │ mel/mfcc    │  │ timing state         │   │
│  └─────────────┘  └──────────────────────┘   │
│  ┌─────────────┐  ┌──────────────────────┐   │
│  │ geo.rs      │  │ harvest.rs           │   │
│  │ polygon ops │  │ batch ID generation  │   │
│  │ area calc   │  │ snapshot compilation │   │
│  └─────────────┘  └──────────────────────┘   │
└──────────────────────────────────────────────┘
                    │
┌───────────────────▼──────────────────────────┐
│      PyO3 Bindings (15% — Glue Layer)         │
│  #[pymodule] beeyield_core                    │
│  #[pyclass]  HiveHealthEngine   (→ health.rs)│
│  #[pyclass]  MetadataEngine     (→ std.rs)   │
│  #[pyclass]  PollinationEngine  (→ poll.rs)  │
│  #[pyclass]  AcousticEngine     (→ acoustic) │
│  #[pyclass]  ImageEngine        (→ image)    │
│  #[pyclass]  RateLimiter        (→ rate)     │
│  #[pyclass]  GeoEngine          (→ geo)      │
│  #[pyclass]  HarvestBatcher     (→ harvest)  │
│  #[pyclass]  TraceEngine        (→ trace)    │
│                                               │
│  Each #[pyclass] holds internal state.       │
│  Python holds a reference → Rust owns data.  │
│  ∴ Zero-copy for internal ops.               │
└──────────────────────────────────────────────┘
```

---

## Phase 1: Core Compute (START HERE)

### Port these 3 services first (highest ROI):
1. **`bee_health_ai.py`** → `health.rs` (130 lines, pure compute, zero I/O)
2. **`metadata_standardizer.py`** → `standardizer.rs` (469 lines, SHA256 hashing, regex, classification)
3. **`rate_limit_manager.py`** → `rate_limit.rs` (120 lines, timing + jitter)

### Why these first?
- Zero external dependencies (no DB, no HTTP, no LLM calls)
- Pure compute functions → easiest to test
- Immediately measurable performance gain
- Establishes the PyO3 bridge pattern for all future ports

---

## Phase 2: Data Processing Pipeline
4. **`harvest_batch_service.py`** → `harvest.rs` (batch ID generation, snapshot compilation)
5. **`ingestion_pipelines.py`** → `ingest.rs` (transform → standardize → embed pipeline)
6. **`acoustic_analyzer.py`** → `acoustic.rs` (audio segmenting, majority voting)

## Phase 3: Business Logic
7. **`pollination_service.py`** → `pollinate.rs` (pollination needs calculator, analytics)
8. **`traceability_service.py`** → `traceability.rs` (journey builder, blockchain ops)
9. **`polygon_service.py`** → `geo.rs` (geospatial polygon operations)
10. **`image_analysis_service.py`** → `image.rs` (detection pipeline, NMS, health aggregation)

---

## Anti-Patterns to Avoid

### ❌ String Copy Trap
```python
# BAD: Converting entire DataFrames back and forth
result_json = rust_module.process(json.dumps(huge_data))
data = json.loads(result_json)  # Two serialization passes!
```

### ✅ Zero-Copy Pattern
```python
# GOOD: Rust holds the state, Python holds a reference
engine = beeyield_core.HiveHealthEngine()
engine.load_sensor_batch(sensor_readings)  # Data stays in Rust
anomalies = engine.detect_anomalies()      # Computed in Rust, returned as Python list
score = engine.health_score()              # No data copy, just a number
```

### ❌ One-Function-Per-Call
```python
# BAD: Crossing FFI boundary for every tiny operation
gid = rust_module.compute_gid(content, source)
domain = rust_module.detect_domain(content, source)
repo = rust_module.detect_repo(url, source)
reliability = rust_module.detect_reliability(domain, repo)
```

### ✅ Batch Operation Pattern
```python
# GOOD: One FFI call, Rust does all internal work
engine = beeyield_core.MetadataEngine()
nodes = engine.standardize_batch(raw_items)  # All computation in one call
```

---

## What Stays in Python (The 10%)

| Component | Reason |
|---|---|
| `main.py` / `app.main.py` | FastAPI app lifecycle, CORS, routing |
| `config.py` | `.env` loading via pydantic-settings |
| `endpoints/*.py` | HTTP request/response handling |
| `ai_assistant.py` | LLM API orchestration (OpenAI/Google SDK) |
| `ai_service.py` | RAG pipeline orchestration |
| `blog_ai_service.py` | LLM content generation |
| `email_service.py` | Resend API SDK |
| `mpesa.py` / `payment.py` | External payment API SDKs |
| `vector_store.py` | Qdrant Python client |
| `supabase_db.py` | Supabase Python client |
| `sync_scheduler.py` | asyncio scheduling logic |

---

## Eliminated Python Dependencies (Post-Oxidize)

These libraries become redundant once Rust handles the logic:
- `numpy` → Rust `ndarray` crate (acoustic + image)
- `hashlib` → Rust `sha2` crate (metadata GID)
- Most regex usage → Rust `regex` crate (10x faster)
- Manual JSON serialization → `serde` (zero-copy)
- `math` module → Rust stdlib (pollination calculations)
- `random` (jitter) → Rust `rand` crate
- `time` (rate limiting) → Rust `std::time::Instant`
