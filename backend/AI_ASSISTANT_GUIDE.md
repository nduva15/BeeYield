# BeeYield AI Assistant - Developer Guide

## Overview
The BeeYield AI Assistant V2 is a comprehensive multi-modal intelligence system designed to provide context-aware responses to users. It integrates data from multiple sources:

1.  **HoneyChain Traceability**: Immutable blockchain records.
2.  **IoT Telemetry**: Real-time sensor data from hives.
3.  **BeeYield Store**: Product catalog and order status.
4.  **Knowledge Base**: Static company information and educational content.
5.  **Google Gemini**: Natural language processing engine.

## Architecture

### 1. Service Layer (`app/services/ai_assistant.py`)
-   **`IntentDetector`**: Classifies user messages into intents (e.g., `trace_honey`, `pollination_service`).
-   **`DataRetriever`**: Fetches specific data based on intent (e.g., querying Supabase for orders or Blockchain for batches).
-   **`KnowledgeBase`**: Manages static JSON content with caching.
-   **`AIEngine`**: Handles the prompt engineering and interaction with Google Gemini API.

### 2. API Layer (`app/api/api_v1/endpoints/ai_assistant.py`)
-   **prefix**: `/api/v1/assistant`
-   **`POST /chat`**: Main entry point. Accepts `history`, `language`, and `context`.
-   **`POST /trace`**: Verification endpoint for QR code scans.
-   **`POST /hive/analyze`**: On-demand health analysis for IoT sensors.
-   **`POST /quick-action`**: Handles structured actions like "Check Order" or "Get Quote".

## Usage Examples

### Chat
**Request:**
```json
{
  "message": "Where does my honey come from? Batch KIB-ACACIAL-26",
  "language": "EN"
}
```

**Response:**
```json
{
  "response": "Your honey is 100% authentic Acacia honey from our Kibwezi Main Apiary...",
  "sources": [{"type": "blockchain", "name": "HoneyChain Ledger"}]
}
```

### Traceability
**Request:**
```json
{
  "batch_code": "KIB-ACACIAL-26"
}
```

## Setup & Configuration

### Environment Variables
Ensure `.env` contains:
```bash
GOOGLE_API_KEY=your_gemini_api_key
```

### Database Dependencies
The system relies on the following Supabase tables:
- `products`
- `orders`
- `farmers`
- `apiaries`
- `pollination_contracts`

## Development
To extend the assistant:
1.  **Add Intents**: meaningful keywords in `IntentDetector.INTENTS`.
2.  **Add Data Source**: Create a method in `DataRetriever` and call it in `BeeYieldAI.process_query`.
3.  **Prompt Engineering**: Update `AIEngine.generate_response` system prompt.
