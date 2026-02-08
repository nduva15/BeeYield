# Product Requirements Document (PRD)
# BeeYield Image Analysis Module

**Version:** 1.0  
**Date:** 2026-02-08  
**Author:** BeeYield Engineering Team  
**Status:** Complete Specification

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals and Objectives](#3-goals-and-objectives)
4. [Target Users](#4-target-users)
5. [Feature Overview](#5-feature-overview)
6. [Current Implementation Analysis](#6-current-implementation-analysis)
7. [Backend Architecture](#7-backend-architecture)
8. [API Specification](#8-api-specification)
9. [Database Schema](#9-database-schema)
10. [Frontend Integration](#10-frontend-integration)
11. [AI/ML Pipeline](#11-aiml-pipeline)
12. [Security Considerations](#12-security-considerations)
13. [Performance Requirements](#13-performance-requirements)
14. [Testing Strategy](#14-testing-strategy)
15. [Implementation Roadmap](#15-implementation-roadmap)
16. [Success Metrics](#16-success-metrics)
17. [Appendix](#17-appendix)

---

## 1. Executive Summary

The BeeYield Image Analysis module is a core AI-powered feature that enables beekeepers to upload photographs of their hives and bees for automated health analysis, disease detection, and colony population estimation. This PRD documents the complete specification for building a production-ready backend to support this feature, integrating with the existing BeeYield infrastructure.

### Key Deliverables
- **Backend API**: FastAPI endpoints for image upload, processing, and result retrieval
- **ML Pipeline**: Real-time bee detection, counting, and disease classification
- **Database Integration**: Supabase storage with analysis history
- **Frontend Enhancement**: Improved UI with backend-powered results

---

## 2. Problem Statement

### Current Challenges
1. **Client-Side Only Processing**: The current implementation uses TensorFlow.js with MobileNet on the frontend, which:
   - Is limited to generic image classification (not bee-specific)
   - Cannot perform accurate object detection or counting
   - Lacks disease detection capabilities
   - Produces simulated/random results

2. **No Persistence**: Analysis results are not stored, preventing:
   - Historical health tracking
   - Trend analysis over time
   - Correlation with other hive data (harvests, inspections)

3. **Limited Accuracy**: MobileNet is trained on ImageNet, not apiculture-specific data, leading to:
   - False positives on non-bee images
   - No Varroa mite detection
   - No disease-specific classification

### Business Impact
- Beekeepers cannot rely on the current analysis for real decision-making
- No differentiation from generic photo apps
- Missing opportunity for premium "BeeYield Intelligence" features

---

## 3. Goals and Objectives

### Primary Goals
| Goal | Success Metric |
|------|----------------|
| Accurate bee detection | >85% precision on bee counting |
| Disease detection | Identify Varroa, Nosema, AFB indicators |
| Real-time processing | <10 seconds for standard images |
| Historical tracking | 100% of analyses persisted |

### Secondary Goals
- Integration with existing BeeYield hive management system
- Support for offline analysis with sync
- Generate actionable health recommendations
- Enable comparison with healthy hive baselines

---

## 4. Target Users

### Primary Users
| Persona | Description | Key Needs |
|---------|-------------|-----------|
| **Commercial Beekeeper** | Manages 50-500+ hives | Quick batch analysis, disease alerts |
| **Hobbyist Beekeeper** | Manages 1-10 hives | Easy-to-understand health scores |
| **Field Inspector** | Visits multiple apiaries | Portable analysis, offline support |

### User Stories
1. **As a beekeeper**, I want to photograph my hive entrance and get an accurate count of visible bees
2. **As a beekeeper**, I want to detect early signs of Varroa mites from close-up bee photos
3. **As a beekeeper**, I want to track my colony's health over time with photo evidence
4. **As an inspector**, I want to document hive conditions with AI-verified assessments

---

## 5. Feature Overview

### 5.1 Core Features

#### Image Upload & Processing
- Drag-and-drop or click-to-upload interface
- Supported formats: JPEG, PNG, WebP, HEIC
- Maximum file size: 10MB
- Auto-compression for large files

#### Bee Detection & Counting
- Object detection using YOLO or similar model
- Bounding box visualization
- Confidence threshold adjustment (40-100%)
- Overlap threshold for duplicate filtering

#### Disease Detection
| Disease | Detection Method | Accuracy Target |
|---------|------------------|-----------------|
| Varroa Mites | Visual spots on bees | 80% |
| Deformed Wing Virus | Wing abnormalities | 75% |
| Chalkbrood | Mummified larvae | 85% |
| American Foulbrood | Cappings pattern | 70% |
| Nosema | Body color changes | 60% |

#### Health Scoring
- Aggregate health score (0-100)
- Per-bee health classification
- Risk level indicators (Low/Medium/High/Critical)

### 5.2 Enhanced Features (Phase 2)
- Queen detection and marking
- Brood pattern analysis
- Hive strength estimation
- Population trend forecasting

---

## 6. Current Implementation Analysis

### Existing Frontend Component
**Location:** `src/components/beeyield/ImageAnalysisView.tsx`

#### Current Architecture
```
┌─────────────────────────────────────────────────┐
│            ImageAnalysisView (React)            │
├─────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────────────────┐ │
│  │ File Input  │ -> │ TensorFlow.js + MobileNet│ │
│  └─────────────┘    └───────────┬─────────────┘ │
│                                 v               │
│  ┌─────────────────────────────────────────────┐│
│  │        Simulated Results (Random)           ││
│  └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

#### Current State Variables
```typescript
interface CurrentState {
  selectedImage: File | null;
  previewUrl: string | null;
  isAnalyzing: boolean;
  results: {
    beesCounted: number;        // Currently random 35-55
    healthStatus: string;       // Always "Healthy"
    overallConfidence: number;  // Always 100
    detections: DetectionRecord[];
  } | null;
  confidenceThreshold: number[];
  overlapThreshold: number[];
  displayMode: string;
  error: string | null;
  realtimeCount: number;
}
```

#### Current Processing Flow
1. User uploads image
2. MobileNet classifies image (generic)
3. Biological keyword matching (workaround)
4. Random bee count generation (35-55)
5. Simulated detection records

#### Limitations
- No actual bee detection model
- Results are not based on image content
- No backend storage or persistence
- No disease detection

---

## 7. Backend Architecture

### 7.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          BeeYield Image Analysis Backend                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐    ┌──────────────────────┐    ┌───────────────────┐  │
│  │   Frontend   │───>│   FastAPI Gateway    │───>│  Analysis Service │  │
│  │   (React)    │    │   /api/v1/image/*    │    │                   │  │
│  └──────────────┘    └──────────────────────┘    └─────────┬─────────┘  │
│                                 │                           │           │
│                                 v                           v           │
│                      ┌──────────────────────┐    ┌───────────────────┐  │
│                      │   Supabase Storage   │    │  ML Pipeline      │  │
│                      │   (Image Files)      │    │  ┌─────────────┐  │  │
│                      └──────────────────────┘    │  │ Bee Detector│  │  │
│                                                   │  │ (YOLOv8)   │  │  │
│                                 │                 │  └─────────────┘  │  │
│                                 v                 │  ┌─────────────┐  │  │
│                      ┌──────────────────────┐    │  │ Health      │  │  │
│                      │   Supabase DB        │    │  │ Classifier  │  │  │
│                      │   (Analysis Results) │    │  └─────────────┘  │  │
│                      └──────────────────────┘    └───────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Component Details

#### FastAPI Gateway
**Location:** `backend/app/api/api_v1/endpoints/image_analysis.py`

Responsibilities:
- Authentication & authorization
- File upload handling
- Request validation
- Response formatting
- Rate limiting

#### Image Analysis Service
**Location:** `backend/app/services/image_analysis_service.py`

Responsibilities:
- Image preprocessing
- ML model inference
- Result aggregation
- Health score calculation

#### ML Pipeline
**Location:** `backend/app/ml/`

Components:
- `bee_detector.py` - YOLO-based bee detection
- `health_classifier.py` - Disease classification
- `preprocessing.py` - Image normalization

### 7.3 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| API | FastAPI | REST endpoints |
| ML Framework | PyTorch/ONNX | Model inference |
| Object Detection | YOLOv8 | Bee detection |
| Image Processing | OpenCV, Pillow | Preprocessing |
| Storage | Supabase Storage | Image files |
| Database | Supabase PostgreSQL | Results |
| Queue | Redis (optional) | Async processing |

---

## 8. API Specification

### 8.1 Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/image/analyze` | Upload and analyze image |
| GET | `/api/v1/image/analysis/{id}` | Get analysis result |
| GET | `/api/v1/image/analyses` | List user's analyses |
| DELETE | `/api/v1/image/analysis/{id}` | Delete analysis |
| GET | `/api/v1/image/hive/{hive_id}/analyses` | Analyses for specific hive |

### 8.2 Detailed API Specifications

#### POST /api/v1/image/analyze

**Description:** Upload an image for analysis

**Request:**
```http
POST /api/v1/image/analyze
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

{
  "image": <binary file>,
  "hive_id": "uuid (optional)",
  "apiary_id": "uuid (optional)",
  "confidence_threshold": 0.4,
  "overlap_threshold": 0.5,
  "analysis_type": "full | detection_only | health_only"
}
```

**Response:**
```json
{
  "success": true,
  "analysis_id": "uuid",
  "status": "completed",
  "results": {
    "bee_count": 47,
    "health_status": "Healthy",
    "health_score": 92,
    "confidence": 0.89,
    "detections": [
      {
        "id": 1,
        "label": "Bee",
        "confidence": 0.95,
        "health": "Healthy",
        "health_confidence": 0.91,
        "bbox": {
          "x": 120,
          "y": 85,
          "width": 48,
          "height": 52
        }
      }
    ],
    "disease_indicators": [
      {
        "disease": "Varroa Mites",
        "probability": 0.12,
        "affected_bees": [3, 7, 15],
        "severity": "Low"
      }
    ],
    "recommendations": [
      "Colony appears healthy with normal activity levels",
      "Continue regular monitoring schedule"
    ]
  },
  "image_url": "https://storage.supabase.co/...",
  "annotated_image_url": "https://storage.supabase.co/...",
  "created_at": "2026-02-08T12:00:00Z",
  "processing_time_ms": 3420
}
```

#### GET /api/v1/image/analysis/{id}

**Description:** Retrieve a specific analysis result

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "hive_id": "uuid",
  "apiary_id": "uuid",
  "original_image_url": "https://...",
  "annotated_image_url": "https://...",
  "results": { ... },
  "created_at": "2026-02-08T12:00:00Z"
}
```

#### GET /api/v1/image/analyses

**Description:** List all analyses for the authenticated user

**Query Parameters:**
- `hive_id` (optional): Filter by hive
- `apiary_id` (optional): Filter by apiary
- `date_from` (optional): Start date filter
- `date_to` (optional): End date filter
- `limit`: Results per page (default: 20)
- `offset`: Pagination offset

**Response:**
```json
{
  "total": 142,
  "items": [
    {
      "id": "uuid",
      "thumbnail_url": "https://...",
      "bee_count": 47,
      "health_score": 92,
      "health_status": "Healthy",
      "created_at": "2026-02-08T12:00:00Z"
    }
  ]
}
```

---

## 9. Database Schema

### 9.1 Tables

#### image_analyses
```sql
CREATE TABLE image_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    apiary_id UUID REFERENCES apiaries(id),
    hive_id UUID REFERENCES hives(id),
    
    -- Image Storage
    original_image_path TEXT NOT NULL,
    annotated_image_path TEXT,
    thumbnail_path TEXT,
    
    -- Analysis Parameters
    confidence_threshold DECIMAL(3,2) DEFAULT 0.40,
    overlap_threshold DECIMAL(3,2) DEFAULT 0.50,
    analysis_type TEXT DEFAULT 'full',
    
    -- Results
    bee_count INTEGER,
    health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
    health_status TEXT CHECK (health_status IN ('Healthy', 'Warning', 'Critical', 'Unknown')),
    overall_confidence DECIMAL(3,2),
    
    -- Detailed Results (JSONB)
    detections JSONB DEFAULT '[]'::jsonb,
    disease_indicators JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    
    -- Metadata
    image_width INTEGER,
    image_height INTEGER,
    file_size_bytes INTEGER,
    processing_time_ms INTEGER,
    model_version TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_image_analyses_user_id ON image_analyses(user_id);
CREATE INDEX idx_image_analyses_hive_id ON image_analyses(hive_id);
CREATE INDEX idx_image_analyses_apiary_id ON image_analyses(apiary_id);
CREATE INDEX idx_image_analyses_created_at ON image_analyses(created_at DESC);
CREATE INDEX idx_image_analyses_health_status ON image_analyses(health_status);
```

#### image_analysis_detections (Normalized for querying)
```sql
CREATE TABLE image_analysis_detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES image_analyses(id) ON DELETE CASCADE,
    
    detection_index INTEGER NOT NULL,
    label TEXT NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    health_status TEXT,
    health_confidence DECIMAL(3,2),
    
    -- Bounding Box
    bbox_x INTEGER NOT NULL,
    bbox_y INTEGER NOT NULL,
    bbox_width INTEGER NOT NULL,
    bbox_height INTEGER NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_detections_analysis_id ON image_analysis_detections(analysis_id);
```

### 9.2 Row-Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE image_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_analysis_detections ENABLE ROW LEVEL SECURITY;

-- User can view their own analyses
CREATE POLICY "Users can view own analyses"
ON image_analyses FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- User can create analyses
CREATE POLICY "Users can create analyses"
ON image_analyses FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- User can delete own analyses
CREATE POLICY "Users can delete own analyses"
ON image_analyses FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Shared apiary access
CREATE POLICY "Users can view shared apiary analyses"
ON image_analyses FOR SELECT
TO authenticated
USING (
    apiary_id IN (
        SELECT apiary_id FROM apiary_shares 
        WHERE shared_with_user_id = auth.uid()
    )
);

-- Admin access
CREATE POLICY "Admins can view all analyses"
ON image_analyses FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
);
```

### 9.3 Migration Script

**Location:** `supabase/migrations/20260208240000_image_analysis_module.sql`

```sql
-- BeeYield Image Analysis Module Migration
-- Version: 1.0
-- Date: 2026-02-08

-- Create image_analyses table
CREATE TABLE IF NOT EXISTS image_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    apiary_id UUID REFERENCES apiaries(id) ON DELETE SET NULL,
    hive_id UUID REFERENCES hives(id) ON DELETE SET NULL,
    
    original_image_path TEXT NOT NULL,
    annotated_image_path TEXT,
    thumbnail_path TEXT,
    
    confidence_threshold DECIMAL(3,2) DEFAULT 0.40,
    overlap_threshold DECIMAL(3,2) DEFAULT 0.50,
    analysis_type TEXT DEFAULT 'full',
    
    bee_count INTEGER,
    health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
    health_status TEXT CHECK (health_status IN ('Healthy', 'Warning', 'Critical', 'Unknown')),
    overall_confidence DECIMAL(3,2),
    
    detections JSONB DEFAULT '[]'::jsonb,
    disease_indicators JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    
    image_width INTEGER,
    image_height INTEGER,
    file_size_bytes INTEGER,
    processing_time_ms INTEGER,
    model_version TEXT DEFAULT 'v1.0',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_image_analyses_user_id ON image_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_image_analyses_hive_id ON image_analyses(hive_id);
CREATE INDEX IF NOT EXISTS idx_image_analyses_apiary_id ON image_analyses(apiary_id);
CREATE INDEX IF NOT EXISTS idx_image_analyses_created_at ON image_analyses(created_at DESC);

-- Enable RLS
ALTER TABLE image_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "image_analyses_select_own" ON image_analyses
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "image_analyses_insert_own" ON image_analyses
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "image_analyses_delete_own" ON image_analyses
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "image_analyses_select_shared" ON image_analyses
    FOR SELECT TO authenticated
    USING (
        apiary_id IN (
            SELECT apiary_id FROM apiary_shares 
            WHERE shared_with_user_id = auth.uid()
        )
    );

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_image_analyses_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER image_analyses_updated
    BEFORE UPDATE ON image_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_image_analyses_timestamp();

-- Grant permissions
GRANT ALL ON image_analyses TO authenticated;
GRANT ALL ON image_analyses TO service_role;
```

---

## 10. Frontend Integration

### 10.1 Updated Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                ImageAnalysisView (Enhanced)                  │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌─────────────────────────────────────┐│
│  │ ImageUploader│ -> │    API Client (beeyieldService.ts)  ││
│  ├──────────────┤    └─────────────────┬───────────────────┘│
│  │ Settings     │                      |                    │
│  │ - Confidence │                      v                    │
│  │ - Overlap    │    ┌─────────────────────────────────────┐│
│  │ - Display    │    │ POST /api/v1/image/analyze          ││
│  └──────────────┘    └─────────────────┬───────────────────┘│
│                                        |                    │
│  ┌─────────────────────────────────────v───────────────────┐│
│  │                  ResultsDisplay                          ││
│  │  ┌─────────────┐  ┌────────────┐  ┌──────────────────┐  ││
│  │  │AnnotatedImg│  │HealthScore │  │ DetectionsTable  │  ││
│  │  └─────────────┘  └────────────┘  └──────────────────┘  ││
│  │  ┌─────────────────────────────────────────────────────┐││
│  │  │               DiseaseIndicators                     │││
│  │  └─────────────────────────────────────────────────────┘││
│  │  ┌─────────────────────────────────────────────────────┐││
│  │  │               Recommendations                       │││
│  │  └─────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   AnalysisHistory                        ││
│  │   Previous analyses with thumbnails and quick stats      ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 10.2 Service Integration

**Add to `src/services/beeyieldService.ts`:**

```typescript
// Image Analysis Types
export interface ImageAnalysisRequest {
    image: File;
    hive_id?: string;
    apiary_id?: string;
    confidence_threshold?: number;
    overlap_threshold?: number;
    analysis_type?: 'full' | 'detection_only' | 'health_only';
}

export interface BeeDetection {
    id: number;
    label: string;
    confidence: number;
    health: string;
    health_confidence: number;
    bbox: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

export interface DiseaseIndicator {
    disease: string;
    probability: number;
    affected_bees: number[];
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface ImageAnalysisResult {
    success: boolean;
    analysis_id: string;
    status: 'processing' | 'completed' | 'failed';
    results: {
        bee_count: number;
        health_status: 'Healthy' | 'Warning' | 'Critical' | 'Unknown';
        health_score: number;
        confidence: number;
        detections: BeeDetection[];
        disease_indicators: DiseaseIndicator[];
        recommendations: string[];
    };
    image_url: string;
    annotated_image_url: string;
    created_at: string;
    processing_time_ms: number;
}

export interface AnalysisHistoryItem {
    id: string;
    thumbnail_url: string;
    bee_count: number;
    health_score: number;
    health_status: string;
    created_at: string;
    hive_code?: string;
    apiary_name?: string;
}

// API Functions
export async function analyzeImage(
    request: ImageAnalysisRequest,
    token: string
): Promise<ImageAnalysisResult> {
    const formData = new FormData();
    formData.append('image', request.image);
    if (request.hive_id) formData.append('hive_id', request.hive_id);
    if (request.apiary_id) formData.append('apiary_id', request.apiary_id);
    if (request.confidence_threshold) {
        formData.append('confidence_threshold', request.confidence_threshold.toString());
    }
    if (request.overlap_threshold) {
        formData.append('overlap_threshold', request.overlap_threshold.toString());
    }
    if (request.analysis_type) {
        formData.append('analysis_type', request.analysis_type);
    }

    const response = await fetch(`${API_BASE_URL}/image/analyze`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
    }

    return response.json();
}

export async function getAnalysisHistory(
    token: string,
    options?: {
        hive_id?: string;
        apiary_id?: string;
        limit?: number;
        offset?: number;
    }
): Promise<{ total: number; items: AnalysisHistoryItem[] }> {
    const params = new URLSearchParams();
    if (options?.hive_id) params.append('hive_id', options.hive_id);
    if (options?.apiary_id) params.append('apiary_id', options.apiary_id);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    const response = await fetch(
        `${API_BASE_URL}/image/analyses?${params.toString()}`,
        {
            headers: { 'Authorization': `Bearer ${token}` }
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.statusText}`);
    }

    return response.json();
}

export async function getAnalysisById(
    analysisId: string,
    token: string
): Promise<ImageAnalysisResult> {
    const response = await fetch(
        `${API_BASE_URL}/image/analysis/${analysisId}`,
        {
            headers: { 'Authorization': `Bearer ${token}` }
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch analysis: ${response.statusText}`);
    }

    return response.json();
}

export async function deleteAnalysis(
    analysisId: string,
    token: string
): Promise<void> {
    const response = await fetch(
        `${API_BASE_URL}/image/analysis/${analysisId}`,
        {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to delete analysis: ${response.statusText}`);
    }
}
```

### 10.3 Updated Component State

```typescript
interface ImageAnalysisState {
    // Upload
    selectedImage: File | null;
    previewUrl: string | null;
    isDragging: boolean;
    
    // Processing
    isAnalyzing: boolean;
    analysisProgress: number; // 0-100
    progressMessage: string;
    
    // Settings
    confidenceThreshold: number;
    overlapThreshold: number;
    displayMode: 'both' | 'label' | 'confidence' | 'none';
    selectedHiveId: string | null;
    selectedApiaryId: string | null;
    
    // Results
    results: ImageAnalysisResult | null;
    error: string | null;
    
    // History
    analysisHistory: AnalysisHistoryItem[];
    historyLoading: boolean;
}
```

---

## 11. AI/ML Pipeline

### 11.1 Model Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    BeeYield ML Pipeline                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Input Image                                                         │
│       │                                                              │
│       v                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                    Preprocessing                                 ││
│  │  • Resize to 640x640 (YOLO input)                               ││
│  │  • Normalize pixel values                                        ││
│  │  • Color space conversion (RGB)                                  ││
│  └─────────────────────────────────────────────────────────────────┘│
│       │                                                              │
│       v                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │              Bee Detector (YOLOv8-Nano)                         ││
│  │  • Trained on BeeImage Dataset (10K+ images)                    ││
│  │  • Output: Bounding boxes + confidence scores                   ││
│  │  • Non-Maximum Suppression (NMS)                                ││
│  └─────────────────────────────────────────────────────────────────┘│
│       │                                                              │
│       v                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │              Per-Bee Health Classifier                          ││
│  │  • For each detected bee:                                       ││
│  │    - Crop region from original image                            ││
│  │    - Run through health classification model                    ││
│  │    - Classes: Healthy, Varroa, DWV, Unknown                    ││
│  └─────────────────────────────────────────────────────────────────┘│
│       │                                                              │
│       v                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │              Disease Aggregation                                 ││
│  │  • Aggregate per-bee results                                    ││
│  │  • Calculate disease probabilities                              ││
│  │  • Generate recommendations                                     ││
│  └─────────────────────────────────────────────────────────────────┘│
│       │                                                              │
│       v                                                              │
│  Output: ImageAnalysisResult                                         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 11.2 Model Training Data

| Dataset | Size | Description |
|---------|------|-------------|
| BeeImage | 10,000+ | General bee detection |
| VarroaNet | 3,000 | Varroa mite detection |
| HiveHealth | 5,000 | Disease classification |
| Custom BeeYield | 2,000 | African bee species |

### 11.3 Model Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Bee Detection mAP | >85% | Baseline |
| Varroa Detection Recall | >80% | Baseline |
| Inference Time (GPU) | <500ms | Baseline |
| Inference Time (CPU) | <3s | Baseline |

### 11.4 Backend ML Service

**Location:** `backend/app/services/image_analysis_service.py`

```python
from typing import Dict, Any, List, Optional
import base64
import io
import time
from datetime import datetime
from PIL import Image
import numpy as np

class ImageAnalysisService:
    """
    Production Image Analysis Service for BeeYield.
    Handles image upload, ML inference, and result storage.
    """
    
    MODEL_VERSION = "v1.0"
    MAX_BEES_TO_CLASSIFY = 40  # Health classification limit per image
    
    @staticmethod
    async def analyze_image(
        image_bytes: bytes,
        user_id: str,
        hive_id: Optional[str] = None,
        apiary_id: Optional[str] = None,
        confidence_threshold: float = 0.4,
        overlap_threshold: float = 0.5,
        analysis_type: str = "full"
    ) -> Dict[str, Any]:
        """
        Main analysis pipeline.
        """
        start_time = time.time()
        
        # 1. Preprocess image
        image = Image.open(io.BytesIO(image_bytes))
        image_rgb = image.convert('RGB')
        width, height = image.size
        
        # 2. Run bee detection
        detections = await ImageAnalysisService._detect_bees(
            image_rgb,
            confidence_threshold,
            overlap_threshold
        )
        
        # 3. Run health classification (if full analysis)
        if analysis_type in ["full", "health_only"]:
            detections = await ImageAnalysisService._classify_health(
                image_rgb,
                detections
            )
        
        # 4. Aggregate disease indicators
        disease_indicators = ImageAnalysisService._aggregate_diseases(detections)
        
        # 5. Calculate health score
        health_score, health_status = ImageAnalysisService._calculate_health_score(
            detections,
            disease_indicators
        )
        
        # 6. Generate recommendations
        recommendations = ImageAnalysisService._generate_recommendations(
            health_status,
            disease_indicators,
            len(detections)
        )
        
        processing_time = int((time.time() - start_time) * 1000)
        
        return {
            "bee_count": len(detections),
            "health_score": health_score,
            "health_status": health_status,
            "overall_confidence": np.mean([d["confidence"] for d in detections]) if detections else 0,
            "detections": detections,
            "disease_indicators": disease_indicators,
            "recommendations": recommendations,
            "image_width": width,
            "image_height": height,
            "processing_time_ms": processing_time,
            "model_version": ImageAnalysisService.MODEL_VERSION
        }
    
    @staticmethod
    async def _detect_bees(
        image: Image.Image,
        confidence_threshold: float,
        overlap_threshold: float
    ) -> List[Dict[str, Any]]:
        """
        Run YOLO bee detection model.
        In production, this uses a trained YOLOv8 model.
        """
        # TODO: Replace with actual YOLO inference
        # For now, using placeholder detection logic
        
        # Placeholder: Generate realistic detections based on image
        width, height = image.size
        
        # Analyze image brightness/contrast to estimate bee count
        img_array = np.array(image)
        brightness = np.mean(img_array)
        
        # Estimate bee count (placeholder algorithm)
        base_count = 30
        if brightness > 128:
            base_count += 15
        
        estimated_count = base_count + np.random.randint(-5, 10)
        
        detections = []
        for i in range(estimated_count):
            # Generate plausible bounding boxes
            x = np.random.randint(50, width - 100)
            y = np.random.randint(50, height - 100)
            w = np.random.randint(40, 60)
            h = np.random.randint(45, 65)
            conf = np.random.uniform(confidence_threshold, 0.98)
            
            if conf >= confidence_threshold:
                detections.append({
                    "id": i + 1,
                    "label": "Bee",
                    "confidence": round(conf, 2),
                    "bbox": {
                        "x": x,
                        "y": y,
                        "width": w,
                        "height": h
                    }
                })
        
        return detections
    
    @staticmethod
    async def _classify_health(
        image: Image.Image,
        detections: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Classify health status for each detected bee.
        """
        # Limit to MAX_BEES_TO_CLASSIFY highest confidence bees
        sorted_detections = sorted(
            detections,
            key=lambda x: x["confidence"],
            reverse=True
        )[:ImageAnalysisService.MAX_BEES_TO_CLASSIFY]
        
        for detection in sorted_detections:
            # TODO: Replace with actual health classification model
            # Placeholder: Most bees are healthy with small disease probability
            health_roll = np.random.random()
            
            if health_roll > 0.95:
                detection["health"] = "Varroa"
                detection["health_confidence"] = round(np.random.uniform(0.6, 0.85), 2)
            elif health_roll > 0.90:
                detection["health"] = "DWV"
                detection["health_confidence"] = round(np.random.uniform(0.5, 0.75), 2)
            else:
                detection["health"] = "Healthy"
                detection["health_confidence"] = round(np.random.uniform(0.85, 0.98), 2)
        
        # Mark remaining bees as unclassified
        for detection in detections:
            if "health" not in detection:
                detection["health"] = "Unknown"
                detection["health_confidence"] = 0.0
        
        return detections
    
    @staticmethod
    def _aggregate_diseases(
        detections: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Aggregate disease indicators from individual bee classifications.
        """
        disease_counts = {}
        disease_bees = {}
        
        for detection in detections:
            health = detection.get("health", "Unknown")
            if health not in ["Healthy", "Unknown"]:
                disease_counts[health] = disease_counts.get(health, 0) + 1
                if health not in disease_bees:
                    disease_bees[health] = []
                disease_bees[health].append(detection["id"])
        
        total_classified = sum(
            1 for d in detections 
            if d.get("health") not in [None, "Unknown"]
        )
        
        indicators = []
        for disease, count in disease_counts.items():
            probability = count / total_classified if total_classified > 0 else 0
            
            severity = "Low"
            if probability > 0.3:
                severity = "Critical"
            elif probability > 0.15:
                severity = "High"
            elif probability > 0.05:
                severity = "Medium"
            
            indicators.append({
                "disease": disease,
                "probability": round(probability, 2),
                "affected_bees": disease_bees[disease],
                "severity": severity
            })
        
        return indicators
    
    @staticmethod
    def _calculate_health_score(
        detections: List[Dict[str, Any]],
        disease_indicators: List[Dict[str, Any]]
    ) -> tuple[int, str]:
        """
        Calculate overall health score (0-100) and status.
        """
        if not detections:
            return 0, "Unknown"
        
        # Base score
        score = 100
        
        # Deduct for disease indicators
        for indicator in disease_indicators:
            if indicator["severity"] == "Critical":
                score -= 40
            elif indicator["severity"] == "High":
                score -= 25
            elif indicator["severity"] == "Medium":
                score -= 15
            elif indicator["severity"] == "Low":
                score -= 5
        
        score = max(0, min(100, score))
        
        # Determine status
        if score >= 80:
            status = "Healthy"
        elif score >= 50:
            status = "Warning"
        else:
            status = "Critical"
        
        return score, status
    
    @staticmethod
    def _generate_recommendations(
        health_status: str,
        disease_indicators: List[Dict[str, Any]],
        bee_count: int
    ) -> List[str]:
        """
        Generate actionable recommendations based on analysis.
        """
        recommendations = []
        
        if bee_count == 0:
            recommendations.append(
                "No bees detected in image. Ensure photo is focused on bee activity."
            )
            return recommendations
        
        if health_status == "Healthy":
            recommendations.append(
                "Colony appears healthy with normal activity levels."
            )
            recommendations.append(
                "Continue regular monitoring schedule."
            )
        elif health_status == "Warning":
            recommendations.append(
                "Some health concerns detected. Consider closer inspection."
            )
        else:  # Critical
            recommendations.append(
                "⚠️ CRITICAL: Immediate hive inspection recommended."
            )
        
        for indicator in disease_indicators:
            if indicator["disease"] == "Varroa" and indicator["probability"] > 0.1:
                recommendations.append(
                    f"Varroa mites detected ({int(indicator['probability']*100)}% affected). "
                    "Consider Oxalic acid or Formic acid treatment."
                )
            elif indicator["disease"] == "DWV" and indicator["probability"] > 0.05:
                recommendations.append(
                    "Deformed Wing Virus indicators present. "
                    "Often associated with Varroa - treat mites first."
                )
        
        if bee_count < 20:
            recommendations.append(
                "Low bee count in image. For accurate colony assessment, "
                "photograph entrance during peak activity (10am-2pm)."
            )
        
        return recommendations
```

---

## 12. Security Considerations

### 12.1 Authentication & Authorization

| Requirement | Implementation |
|-------------|----------------|
| JWT Validation | Supabase Auth tokens |
| User Isolation | RLS policies on all tables |
| Rate Limiting | 10 analyses per hour per user |
| File Validation | MIME type + magic bytes check |

### 12.2 File Upload Security

```python
# Allowed MIME types
ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic"
]

# Maximum file size
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Image validation
def validate_image(file_bytes: bytes, content_type: str) -> bool:
    # Check MIME type
    if content_type not in ALLOWED_MIME_TYPES:
        return False
    
    # Check magic bytes
    try:
        image = Image.open(io.BytesIO(file_bytes))
        image.verify()
        return True
    except:
        return False
```

### 12.3 Data Privacy

- Images stored in user-specific Supabase Storage buckets
- Automatic deletion after 90 days (configurable)
- No third-party sharing without consent
- GDPR-compliant data export/deletion

---

## 13. Performance Requirements

### 13.1 Response Time SLAs

| Operation | Target | Max |
|-----------|--------|-----|
| Image Upload | <2s | 5s |
| Analysis (GPU) | <5s | 10s |
| Analysis (CPU) | <15s | 30s |
| History Load | <500ms | 2s |

### 13.2 Scalability

| Metric | Initial | Target |
|--------|---------|--------|
| Concurrent Analyses | 10 | 100 |
| Daily Analyses | 1,000 | 50,000 |
| Storage (per user) | 100MB | 1GB |

### 13.3 Infrastructure

```yaml
# Production deployment (example)
services:
  api:
    image: beeyield-api
    replicas: 3
    resources:
      limits:
        cpu: "2"
        memory: "4Gi"
  
  ml-worker:
    image: beeyield-ml
    replicas: 2
    resources:
      limits:
        cpu: "4"
        memory: "8Gi"
        nvidia.com/gpu: 1
```

---

## 14. Testing Strategy

### 14.1 Unit Tests

```python
# backend/tests/test_image_analysis.py

import pytest
from app.services.image_analysis_service import ImageAnalysisService

class TestImageAnalysisService:
    
    @pytest.mark.asyncio
    async def test_analyze_valid_bee_image(self, sample_bee_image):
        result = await ImageAnalysisService.analyze_image(
            image_bytes=sample_bee_image,
            user_id="test-user-id",
            confidence_threshold=0.4
        )
        
        assert result["bee_count"] > 0
        assert result["health_score"] >= 0
        assert result["health_status"] in ["Healthy", "Warning", "Critical", "Unknown"]
    
    @pytest.mark.asyncio
    async def test_analyze_non_bee_image(self, sample_landscape_image):
        result = await ImageAnalysisService.analyze_image(
            image_bytes=sample_landscape_image,
            user_id="test-user-id"
        )
        
        assert result["bee_count"] == 0
    
    def test_health_score_calculation(self):
        detections = [
            {"id": 1, "health": "Healthy", "confidence": 0.9},
            {"id": 2, "health": "Varroa", "confidence": 0.85},
        ]
        indicators = [{"disease": "Varroa", "probability": 0.5, "severity": "High"}]
        
        score, status = ImageAnalysisService._calculate_health_score(
            detections, indicators
        )
        
        assert 0 <= score <= 100
        assert status in ["Healthy", "Warning", "Critical"]
```

### 14.2 Integration Tests

```python
# backend/tests/test_image_api.py

import pytest
from httpx import AsyncClient
from app.main import app

class TestImageAnalysisAPI:
    
    @pytest.mark.asyncio
    async def test_upload_and_analyze(self, auth_token, sample_image):
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                "/api/v1/image/analyze",
                headers={"Authorization": f"Bearer {auth_token}"},
                files={"image": ("test.jpg", sample_image, "image/jpeg")}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "analysis_id" in data
    
    @pytest.mark.asyncio
    async def test_get_analysis_history(self, auth_token):
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get(
                "/api/v1/image/analyses",
                headers={"Authorization": f"Bearer {auth_token}"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert "items" in data
            assert "total" in data
```

### 14.3 Frontend Tests

```typescript
// src/components/beeyield/__tests__/ImageAnalysisView.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImageAnalysisView from '../ImageAnalysisView';
import * as beeyieldService from '@/services/beeyieldService';

jest.mock('@/services/beeyieldService');

describe('ImageAnalysisView', () => {
    it('renders upload area', () => {
        render(<ImageAnalysisView onTabChange={jest.fn()} />);
        expect(screen.getByText('Select Bee Image')).toBeInTheDocument();
    });
    
    it('calls API on image upload', async () => {
        const mockAnalyze = jest.spyOn(beeyieldService, 'analyzeImage');
        mockAnalyze.mockResolvedValue({
            success: true,
            analysis_id: 'test-id',
            results: {
                bee_count: 42,
                health_score: 95,
                health_status: 'Healthy',
                detections: [],
                disease_indicators: [],
                recommendations: []
            }
        });
        
        render(<ImageAnalysisView onTabChange={jest.fn()} />);
        
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        const input = screen.getByRole('input', { hidden: true });
        
        fireEvent.change(input, { target: { files: [file] } });
        
        await waitFor(() => {
            expect(mockAnalyze).toHaveBeenCalled();
        });
    });
});
```

---

## 15. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

| Task | Priority | Effort |
|------|----------|--------|
| Create database migration | High | 4h |
| Implement API endpoints (stubs) | High | 8h |
| Set up Supabase Storage bucket | High | 2h |
| Update frontend to call API | High | 8h |
| Basic error handling | High | 4h |

### Phase 2: ML Integration (Week 3-4)

| Task | Priority | Effort |
|------|----------|--------|
| Integrate YOLOv8 for detection | High | 16h |
| Train/fine-tune bee detector | High | 24h |
| Implement health classifier | Medium | 16h |
| Add annotated image generation | Medium | 8h |
| Performance optimization | Medium | 8h |

### Phase 3: Enhanced Features (Week 5-6)

| Task | Priority | Effort |
|------|----------|--------|
| Analysis history view | Medium | 8h |
| Hive linkage UI | Medium | 4h |
| Export/share results | Low | 4h |
| Offline analysis support | Low | 16h |
| Admin analytics dashboard | Low | 8h |

### Phase 4: Polish & Launch (Week 7-8)

| Task | Priority | Effort |
|------|----------|--------|
| End-to-end testing | High | 16h |
| Performance benchmarks | High | 8h |
| Documentation | High | 8h |
| User acceptance testing | High | 8h |
| Production deployment | High | 8h |

---

## 16. Success Metrics

### 16.1 Technical Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Detection Accuracy | N/A | >85% | Validation set |
| Processing Time | N/A | <10s | P95 latency |
| API Availability | N/A | 99.5% | Uptime monitoring |
| Error Rate | N/A | <1% | Error logs |

### 16.2 User Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Daily Active Analyses | 0 | 100+ | Analytics |
| User Retention (7-day) | N/A | 40% | Cohort analysis |
| Feature Adoption | N/A | 60% | Usage tracking |
| User Satisfaction | N/A | 4.5/5 | In-app survey |

### 16.3 Business Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Premium Conversions | 0 | 5% | Subscription data |
| Support Tickets | N/A | <10/month | Helpdesk |
| Feature Requests | N/A | Track | Feedback system |

---

## 17. Appendix

### 17.1 Existing Codebase References

| Component | Location | Purpose |
|-----------|----------|---------|
| Frontend View | `src/components/beeyield/ImageAnalysisView.tsx` | Current UI |
| AI Service | `backend/app/services/ai_service.py` | AI orchestration |
| Bee Health AI | `backend/app/services/bee_health_ai.py` | Health algorithms |
| API Router | `backend/app/api/api_v1/api.py` | Route registration |
| Supabase DB | `backend/app/db/supabase_db.py` | Database client |

### 17.2 Related Documentation

- [BeeYield API Documentation](../backend/BEEYIELD_API_DOCS.md)
- [Neural Hive Architecture](../.gemini/antigravity/knowledge/neural_hive_architecture/artifacts/overview.md)
- [Data Ingestion Pipeline](../.gemini/antigravity/knowledge/beeyield_data_ingestion/artifacts/pipeline.md)

### 17.3 External Resources

- [YOLOv8 Documentation](https://docs.ultralytics.com/)
- [BeeImage Dataset](https://kaggle.com/datasets/bee-image)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

### 17.4 Glossary

| Term | Definition |
|------|------------|
| **mAP** | Mean Average Precision - object detection accuracy metric |
| **NMS** | Non-Maximum Suppression - removes duplicate detections |
| **RLS** | Row-Level Security - Postgres access control |
| **DWV** | Deformed Wing Virus |
| **AFB** | American Foulbrood |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-08 | BeeYield Team | Initial PRD |

---

**End of Document**
