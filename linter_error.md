# Linter Fixes – Plant Sanctuary

## Fixed (Errors → 0)

| File | Issue | Fix |
|------|-------|-----|
| `src/components/layout/ClientHeader.tsx` | `react-hooks/set-state-in-effect` | Replaced `useEffect` + `setMounted` with `useMounted()` hook |
| `src/components/layout/ClientHeader.tsx` | `cartLoading` unused | Removed from destructuring |
| `src/components/layout/MobileNav.tsx` | `react-hooks/set-state-in-effect` | Replaced with `useMounted()` hook |
| `src/app/about/page.tsx` | `@next/next/no-html-link-for-pages` | Changed `<a href="/products">` to `<Link href="/products">` |
| `src/app/testing/page.tsx` | `react-hooks/set-state-in-effect` | Removed redundant `setCoverageLoading(true)` (already `true` on mount) |

---

## Plan to Fix Remaining Warnings (209)

### 1. `@typescript-eslint/no-explicit-any` (~120 occurrences)

**Strategy:** Replace `any` with proper types.

| Priority | Files | Approach |
|----------|-------|----------|
| High | `src/lib/api.ts`, `src/lib/api-server.ts` | Add interfaces for API responses, error shapes |
| High | `src/contexts/AuthContext.tsx`, `src/contexts/CartContext.tsx` | Type profile, user, error objects |
| Medium | `src/app/**/*.tsx` (cart, checkout, profile, products) | Type form handlers, API responses |
| Low | `cypress.config.js`, `scripts/*.js` | Use `unknown` or `Record<string, unknown>` where needed |

**Example:**
```ts
// Before
catch (error: any) { ... }

// After
catch (error: unknown) {
  const msg = error instanceof Error ? error.message : String(error)
  ...
}
```

---

### 2. `@typescript-eslint/no-unused-vars` (~25 occurrences)

**Strategy:** Remove or prefix with `_`.

| Category | Files | Fix |
|----------|-------|-----|
| Unused imports | login, profile, products/[slug], shipping, AdminActions, ProductCard, ProductForm | Remove or use `_` prefix |
| Unused params | `catch (e)` → `catch (_e)` | Prefix with `_` (already in argsIgnorePattern) |
| Unused destructured vars | ProductForm (category_id, featured_image_id, etc.) | Use `_` prefix or remove |

---

### 3. `react/no-unescaped-entities` (~20 occurrences)

**Strategy:** Escape apostrophes in JSX text.

| Files | Fix |
|-------|-----|
| about, articles, checkout/success, contact, faq, login, privacy, returns, shipping, profile | Replace `'` with `&apos;` or `{'\''}` in text |

**Example:**
```tsx
// Before
<p>Don't worry</p>

// After
<p>Don&apos;t worry</p>
// or
<p>{`Don't worry`}</p>
```

---

### 4. `@next/next/no-img-element` (~15 occurrences)

**Strategy:** Use Next.js `Image` for local/optimizable images.

| Files | Notes |
|-------|-------|
| cart, checkout, articles, page, products, profile, ProductCard, ProductForm, ProductGallery | Use `<Image />` with `width`, `height`, or `fill`; add remote patterns in `next.config.ts` for external URLs |

**Example:**
```tsx
import Image from 'next/image'
<Image src={url} alt="..." width={200} height={200} />
```

---

### 5. `react-hooks/exhaustive-deps` (~8 occurrences)

**Strategy:** Add deps or use `useCallback`/`useMemo` where appropriate.

| File | Hook | Fix |
|------|------|-----|
| cart/page.tsx | useEffect | Add `fetchCart` to deps or wrap in useCallback |
| checkout/page.tsx | useEffect | Same |
| admin/inventory/* | useEffect | Add fetchProduct/fetchProducts |
| CategoryManager, ProductForm | useEffect | Add fetchCategories |
| AuthContext | useEffect | Add fetchProfile or document why omitted |
| CartContext | useCallback | Add `user` to deps |

---

### 6. Config / Scripts

| File | Issue | Fix |
|------|-------|-----|
| `cypress.config.js` | `on`, `config` unused | Use `_on`, `_config` or remove if not needed |
| `scripts/commit_push.js`, etc. | `_` unused | Remove or use in destructuring |

---

## Suggested Order of Work

1. **Quick wins:** Unused vars/imports (2.1, 2.2) – ~30 min  
2. **Escaped entities:** (3) – ~20 min  
3. **Cypress/scripts:** (6) – ~5 min  
4. **Hook deps:** (5) – ~30 min  
5. **`any` types:** (1) – incremental, start with api.ts and contexts  
6. **Image components:** (4) – requires layout/sizing decisions  

---

## Commands

```bash
# Run lint
npm run lint

# Lint specific file
npx eslint src/app/about/page.tsx
```
