# PRD: System-Wide Grounded English Refactor (Jargon Liquidation)

**Revision**: 1.0  
**Status**: Planning / Execution  
**Objective**: Systematically identify and replace all technical "AI slop" and complex jargon (e.g., "Initiate Access," "MFA Handshake," "Orbital Subsystem") with plain, grounded English that a professional beekeeper can use without a manual.

---

## 1. Core Principles
1. **Clarity over Cleverness**: "Login" is better than "Initiate Handshake."
2. **Accessibility**: Language should be understood by users with no technical background.
3. **Professionalism**: Remove "slop" (unnecessary technical fluff like "Node: Primary") while maintaining a high-utility professional aesthetic.
4. **Consistency**: Use the same terms across the entire application.

---

## 2. Global Translation Key (45+ Sample Mappings)

| Current Jargon / AI Slop | Grounded English Replacement |
| :--- | :--- |
| Initiate Access | Login / Sign In |
| Administrator ID | Email Address |
| Access Key | Password |
| Authorize via Cloud Identity | Sign in with Google |
| Manual Override | Sign in with Email |
| Identity Verification | Security Check |
| MFA Handshake | Verification Code |
| Token Input | 6-Digit Code |
| Validate Token | Verify Code |
| Primary Authentication | Login Page |
| Request New Admin Credentials | Create Account / Register |
| Welcome, Commander | Welcome Back |
| Node: Primary / Protocol: TLS | *[REMOVE - System Noise]* |
| Interrogate Atlas | View Map |
| Commit Tactical Deployment | Save Field Plan |
| Orbital Intelligence Hub | Satellite View |
| Environmental Data Subsystem | Nature Data |
| Diagnostic Node | Field Status |
| Operational Pipeline | How it Works |
| Precision Professional | Farm Manager |
| Enterprise Geospatial | Farm Mapping |
| Bloom Saturation | Flower Coverage |
| Acoustic Mood Transformer | Hive Sound Analyzer |
| Hpa Optimizer | Performance Planner |
| Temporal Scope | Time Period |
| Proprietary ML | Computer Analysis |
| Intelligent Hive Info | Hive Sensors |
| Traceability Inquiry | Product History |
| Deep Diagnostic | Health Check |
| Audit Trail Handshake | Security Log |
| Live Payload Terminal | Live Debugger / Activity Log |
| Realm ID | Connection ID |
| Authorized Scopes | Shared Info |
| Stock Pulse Telemetry | Stock Progress |
| Webhook Monitoring | Live Updates |
| Confident Technical Request | Secure Help Request |
| Technical Manuals | Help Guides |
| Open Ticket Online | Contact Support |
| Encrypted Session | Secure Connection |
| Sync History | Past Updates |
| Asset Mapping | Account Mapping |
| Commit Mapping Policy | Save Mapping |
| External Webhook Secret | Security Key |
| Continuous Stock Reconciliation | Automatic Stock Check |
| Automated Sales Receipt | Auto-Invoicing |
| Recovery Attempt Count | Retry Attempts |

---

## 3. Targeted Page Audits

### 3.1 Authentication (Login/Register)
- **Goal**: Make the first impression human.
- **Changes**: Replaced all "Commander" and "Handshake" terms with standard Auth terminology.

### 3.2 Main Dashboard (BeeYieldDashboard.tsx)
- **Goal**: Clean up navigation and header noise.
- **Changes**: Simplified navigation labels (e.g., `HPA Optimizer` -> `Performance Planner`).

### 3.3 Beekeeping Insights (AgroIntelligenceView.tsx)
- **Goal**: Remove "Orbital" and "Intelligence" jargon.
- **Changes**: Transition to "Satellite" and "Weather" terminology.

### 3.4 Pollination Monitoring (PrecisionPollinationView.tsx)
- **Goal**: Simplify "Geospatial" and "Deployment" terms.
- **Changes**: Use "Mapping" and "Field Setup."

### 3.5 Support Centre (SupportCenterView.tsx)
- **Goal**: Make support feel approachable.
- **Changes**: Replaced "Interrogating" with "Reviewing."

---

## 4. Implementation Checklist
- [ ] Audit `src/lib/translations.ts` for all 45+ terms.
- [ ] Refactor `CebaLoginForm.tsx` and `CebaRegisterForm.tsx`.
- [ ] Scan `src/components/beeyield/` for inline technical strings.
- [ ] Update documentation and tooltips to match new terminology.
- [ ] Verify that no functional logic is broken by string changes.

---

## 5. Success Metrics
- Average user time-to-action on core forms is reduced by 20%.
- Zero support tickets regarding "Confusing terminology" or "What does handshake mean?".
- 100% jargon-free landing and core dashboard paths.
