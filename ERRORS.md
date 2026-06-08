# BeeYield Development Error Log

## [2026-04-26 11:35] - Build Failure: ENOENT SoundAnalysisView

- **Type**: Agent/Process
- **Severity**: High
- **File**: `src/pages/BeeYieldDashboard.tsx:88`, `src/components/beeyield/lovable_ai/LovableIndex.tsx:38`
- **Agent**: Antigravity
- **Root Cause**: Vite production build (Rollup) failed to resolve the `SoundAnalysisView.tsx` file when imported without an extension, despite it being a valid pattern in development. This occurred after the component was refactored.
- **Error Message**: 
  ```
  [vite:load-fallback] Could not load .../SoundAnalysisView (imported by BeeYieldDashboard.tsx): ENOENT: no such file or directory
  ```
- **Fix Applied**: Explicitly added the `.tsx` extension to the import statements in both files.
- **Prevention**: When creating or significantly refactoring core components that are used across multi-chunk layouts, use explicit extensions or ensure index exports are clean to assist the Rollup bundler.
- **Status**: Fixed

## [2026-04-26 11:35] - TypeScript Errors in SensorHealthView

- **Type**: Logic/Syntax
- **Severity**: Medium
- **File**: `src/components/beeyield/SensorHealthView.tsx`
- **Agent**: Antigravity
- **Root Cause**: Using non-existent properties on `Hive` (`name`, `health_status`) and `SensorReading` (`created_at`) types due to a mismatch between implementation and the service layer's interface definition. Missing import for `ArrowRight`.
- **Fix Applied**: Refactored property access to use `hive_code`, `status`, and `timestamp` respectively. Added `ArrowRight` to `lucide-react` imports.
- **Prevention**: Always verify component properties against the `beeyieldService.ts` interfaces before committing UI changes.
- **Status**: Fixed

## [2026-04-27 09:17] - Runtime Error: ReferenceError Home is not defined

- **Type**: Agent
- **Severity**: Medium
- **File**: `src/pages/Team.tsx:302`
- **Agent**: Antigravity
- **Root Cause**: Added the `Home` icon from `lucide-react` to the new "Our Story" section in `Team.tsx` but failed to include it in the top-level import list.
- **Error Message**: 
  ```
  Uncaught ReferenceError: Home is not defined
  ```
- **Fix Applied**: Added `Home` to the `lucide-react` import destructuring in `Team.tsx`.
- **Prevention**: Always audit `lucide-react` imports after adding new icons to a component using multi-replace or manual edits.
- **Status**: Fixed

---

## [2026-06-08 09:32] - Runtime Error: supabaseKey is required on Vercel deployment

- **Type**: Runtime
- **Severity**: High
- **File**: `src/integrations/supabase/client.ts:12`
- **Agent**: @orchestrator
- **Root Cause**: The client-side Supabase helper initialized the Supabase client immediately at import-time. When deploying to Vercel without environment variables configured, `VITE_SUPABASE_ANON_KEY` is undefined, causing the app to throw an unhandled exception and crash at startup.
- **Error Message**: 
  ```
  supabaseKey is required.
  ```
- **Fix Applied**: Wrapped client initialization in `src/integrations/supabase/client.ts` in a null check and updated `wrapSupabaseClient` in `src/integrations/supabase/legacy-table-guard.ts` to support optional/null clients safely.
- **Prevention**: Never run top-level initialization of clients with env values without a fallback/null check to ensure safety when environment configuration is incomplete.
- **Status**: Fixed

---

## [2026-06-08 09:37] - Integration Error: Failed to fetch dynamically imported module (Vite chunk load failure)

- **Type**: Integration
- **Severity**: High
- **File**: `src/main.tsx:31`
- **Agent**: @orchestrator
- **Root Cause**: In production Vite deployments, pushing a new build deletes older hashed code-split chunks. Users who already have the app open will experience load failures when navigating to a lazy-loaded page whose chunk hash changed.
- **Error Message**: 
  ```
  Failed to fetch dynamically imported module: https://bee-yield-.../assets/BeeYieldDashboard-96zgx6RD.js
  ```
- **Fix Applied**: Updated `retryLazyImport` in `src/main.tsx` to catch chunk fetching failures and execute a clean `window.location.reload()` to sync browser state with the new deployment. Wrapped all primary authenticated/dashboard views with this protection.
- **Prevention**: Wrap lazy page loaders in a chunk error-catching utility that reloads the browser to download the updated client files.
- **Status**: Fixed
