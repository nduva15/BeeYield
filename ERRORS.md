# ERRORS.md - Automatic Error Tracking & Learning

## [2026-04-20 16:37] - LovableIndex.tsx Code Corruption

- **Type**: Agent
- **Severity**: High
- **File**: `src/components/beeyield/lovable_ai/LovableIndex.tsx`
- **Agent**: Antigravity
- **Root Cause**: The `multi_replace_file_content` tool replaced a larger block than intended due to overlapping or mismatched target content, leading to a loss of core JSX logic.
- **Error Message**: 
  ```tsx
  // Resulting corrupted code snippet
  408:             title="Our Story"
  409:           >
  410:                 <div className="text-xs text-muted-foreground bg-muted border border-border rounded-lg px-3 py-1.5 self-end flex items-center gap-2">
  ```
- **Fix Applied**: Fully reconstructed the file using previous view_file history and verified integrity.
- **Prevention**: Be more precise with line ranges and avoid large multi-line TargetContent blocks when using multi_replace_file_content.
- **Status**: Fixed

---
