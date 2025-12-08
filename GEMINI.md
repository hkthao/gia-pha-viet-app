# Gemini Interaction Notes

## General Reminders for Future Interactions:

### 1. Precision with 'replace' tool:
   - Always ensure `old_string` in `replace` tool calls exactly matches the file content, including whitespace and newlines.
   - For complex changes, break them into smaller, atomic `replace` operations.
   - It's best to `read_file` immediately before a `replace` to get the most accurate content for `old_string`.

### 2. Common TypeScript Errors Encountered & Fixed:
   - **`app/login.tsx`**:
     - Missing imports for React Native components (View, StyleSheet, ScrollView).
     - Missing imports for `react-native-paper` components (Appbar, Text, Button, useTheme).
     - Missing imports for hooks (`useTranslation`, `useRouter`, `useAuth`).
     - Missing imports for constants (`SPACING_LARGE`, `SPACING_MEDIUM`).
     - Fixed by adding all necessary imports and ensuring hook calls were within the component.
   - **`components/index.ts`**:
     - Typo in `export * from './events';` (should be `./event`).
     - Fixed by removing the incorrect export statement.

### 3. Pre-existing TypeScript Errors (Unresolved):
   - **`tests/unit/hooks/useFamilyDictList.test.tsx`**:
     - `TS2352: Conversion of type 'UseBoundStore<StoreApi<PublicFamilyDictStore>>' to type 'Mock<any, any, any>' may be a mistake...`
     - These errors are related to type casting issues when mocking Zustand stores in Jest tests. These were noted as pre-existing and not addressed in this session.

### 4. Successful Refactorings/Optimizations:
   - **`gia-pha-viet-app/hooks/useInfiniteUpdateDetector.ts`**:
     - Enhanced the hook to accept an optional `dependencies` array.
     - Implemented logic to compare current and previous dependencies and log which specific dependencies have changed when an infinite update loop is detected, providing more targeted debugging information.
   - **`gia-pha-viet-app/hooks/useFamilyDictList.tsx`**:
     - Extracted `renderFamilyDictItem` logic into a separate `FamilyDictItem.tsx` component (`components/family-dict/FamilyDictItem.tsx`).
     - Updated the hook to use the new component and cleaned up related styles and helper functions.
   - **`gia-pha-viet-app/hooks/useFamilySearchList.tsx`**:
     - Extracted `renderFamilyItem` logic into a separate `FamilyItem.tsx` component (`components/family/FamilyItem.tsx`).
     - Updated the hook to use the new component.
     - Applied optimizations based on `task.md` feedback:
       - Refactored `useStore` definition to separate Zustand store calls for better testability.
       - Created a `mappedStore` using `useMemo`.
       - Updated `FamilyItem.tsx` to accept an `onSelect` prop and `useFamilySearchList.tsx` to pass `onSelect={setCurrentFamilyId}`.
     - Grouped `FamilyItem` import from `@/components/family/FamilyItem';` to `import { FamilyItem } from '@/components/family';`.

### 5. Workflow Reminders:
   - Always run `tsc --noEmit` after implementing changes to check for TypeScript syntax errors.