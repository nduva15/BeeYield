# Implementation Plan - Fix Frontend Property and Type Errors

The objective is to resolve the remaining TypeScript and linting errors identified across several frontend pages (`ESG.tsx`, `GlobalHiveNetwork.tsx`, `Impact.tsx`, and `Team.tsx`). These errors range from missing imports to type mismatches with backend data structures.

## User Review Required

> [!IMPORTANT]
> I will be adjusting the `GlobalHiveNetwork.tsx` to use `region` instead of `county` as per the `Apiary` interface. I will also provide fallback values for `image_url` and `description` which are currently missing from the `Apiary` type.

## Proposed Changes

### Pages

#### [ESG.tsx](c:\Users\aggym\Downloads\Honey\src\pages\ESG.tsx)
- Define a local interface `ESGPagePillar` that combines the structure of both `fallbackPillars` and the fetched `ESGPillar` from the service.
- Update the `pillars` state to use this interface to resolve `'pillar' is of type 'unknown'` errors during mapping.

#### [GlobalHiveNetwork.tsx](c:\Users\aggym\Downloads\Honey\src\pages\GlobalHiveNetwork.tsx)
- Update the mapping over `apiaries` to use properties that exist on the `Apiary` interface.
- Replace `apiary.county` with `apiary.region` (or `apiary.location_name`).
- Add fallback values for `apiary.image_url` and `apiary.description` as they are not currently in the `Apiary` interface.

#### [Impact.tsx](c:\Users\aggym\Downloads\Honey\src\pages\Impact.tsx)
- Add the missing `Badge` import from `@/components/ui/badge`.

#### [Team.tsx](c:\Users\aggym\Downloads\Honey\src\pages\Team.tsx)
- Add the missing `Button` import from `@/components/ui/button`.

## Verification Plan

### Automated Tests
- Run `npx tsc --noEmit` to ensure all TypeScript errors are resolved.
- Run `npm run lint` if applicable to check for any remaining linting issues.

### Manual Verification
- Visually inspect `GlobalHiveNetwork.tsx` in a browser (if possible) to ensure apiary cards display correctly with the new mapping.
- Verify `ESG.tsx` renders pillars correctly.
- Ensure `Impact.tsx` and `Team.tsx` build and display as expected.
