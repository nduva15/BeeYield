"""
CEBA AI Multi-Tenant Scoped Context API Endpoints
Routes AI queries through strict zero-trust tenant isolation boundaries,
evaluating RLS scoped context prior to LLM payload construction.
"""

import time
from typing import Dict, Any
from fastapi import APIRouter, Depends

from app.core import security
from app.services.ceba_context_engine import (
    ScopedContextPayload,
    CebaChatRequest,
    CebaChatResponse,
    extract_tenant_context,
    sanitize_user_prompt,
    fetch_scoped_context,
    execute_ceba_ai_engine,
    log_ceba_audit,
)

router = APIRouter()

@router.post("/chat", response_model=CebaChatResponse)
async def ceba_scoped_chat(
    payload: CebaChatRequest,
    current_user: Dict[str, Any] = Depends(security.get_current_user),
):
    """
    FR-1 & FR-3: Scoped CEBA AI Chat endpoint.
    1. Authenticates JWT & extracts tenant scope (FR-1.1, FR-1.2)
    2. Sanitizes input to neutralize prompt injection (FR-4.1)
    3. Resolves data strictly within tenant boundary (FR-2.1 - FR-2.3)
    4. Assembles Section 5 JSON Schema and executes Claude API (FR-3.1, FR-3.2)
    5. Writes immutable audit log (NFR Section 6)
    """
    start_time = time.perf_counter()

    # 1. Identity & Authorization Context Extraction
    tenant = extract_tenant_context(current_user)

    # 2. Prompt Sanitization
    sanitized_query = sanitize_user_prompt(payload.query)

    # 3. Scoped Context Resolution (Sub-200ms target SLA)
    context_payload = await fetch_scoped_context(tenant, sanitized_query)

    # 4. CEBA AI Engine Execution with System Security Instructions
    ai_response = await execute_ceba_ai_engine(sanitized_query, context_payload)

    latency_ms = int((time.perf_counter() - start_time) * 1000)

    # 5. Immutable Security Audit Logging
    await log_ceba_audit(
        tenant_id=tenant.tenant_id,
        user_id=tenant.user_id,
        user_name=tenant.user_name,
        prompt_sanitized=sanitized_query,
        response=ai_response,
        latency_ms=latency_ms,
        status_code=200,
    )

    return CebaChatResponse(
        response=ai_response,
        context_payload=context_payload,
        latency_ms=latency_ms,
        model="claude-3-5-sonnet",
        audit_logged=True,
    )


@router.get("/context", response_model=ScopedContextPayload)
async def get_my_scoped_context(
    current_user: Dict[str, Any] = Depends(security.get_current_user),
):
    """
    Returns the compiled Section 5 JSON context payload for the authenticated tenant.
    """
    tenant = extract_tenant_context(current_user)
    return await fetch_scoped_context(tenant)
