# Plant Sanctuary – Testing Guide

Next.js 16 e-commerce and articles site. Consumes Django API. Runs on port 3002.

---

## Quick Start

### Prerequisites

- Node.js 18+
- Django backend running at `http://localhost:8000`

### Run the App Locally

```bash
cd plant-sanctuary
npm install

# Create .env.local for local backend
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
echo "NEXT_PUBLIC_COMPANY_SLUG=plant-sanctuary" >> .env.local

npm run dev
```

- Home: http://localhost:3002
- Products: http://localhost:3002/products
- Contact: http://localhost:3002/contact
- Profile: http://localhost:3002/profile

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://3pillars.pythonanywhere.com/api` | Django API base URL |
| `NEXT_PUBLIC_COMPANY_SLUG` | `plant-sanctuary` | Company slug for auth and products |

---

## Variable Alignment (Django API)

| Item | Value |
|------|-------|
| Company slug | `plant-sanctuary` |
| Auth storage keys | `auth_token`, `refresh_token`, `company_id` |
| Login request | `{ username, password, company_slug }` |
| Login response | `{ access, refresh, user, company }` |
| Register response | `{ tokens: { access, refresh }, user, company }` |
| Register request | `{ email, password, password_confirm, full_name?, company_slug }` |

---

## Test Commands

| Command | Description |
|---------|-------------|
| `npm run test` | Run unit tests (single run) |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:coverage` | Run with coverage report |
| `npm run test:coverage:public` | Generate coverage and copy to Testing page |
| `npm run test:e2e` | Run Cypress E2E (headless, CI-friendly) |
| `npm run test:e2e:open` | Open Cypress UI for interactive E2E testing |

---

## Unit Tests (Vitest)

```bash
cd plant-sanctuary
npm run test           # Run unit tests
npm run test:watch     # Watch mode
npm run test:coverage  # Run with coverage report
```

### Coverage Reports

- **Text**: Printed to terminal
- **HTML**: `coverage/index.html` (open in browser)
- **LCOV**: `coverage/lcov.info` (for CI tools)

### Test Structure

```
plant-sanctuary/
├── vitest.config.ts
├── src/
│   ├── test/
│   │   └── setup.ts          # @testing-library/jest-dom, localStorage reset
│   └── lib/
│       ├── api.ts
│       └── api.test.ts       # authApi.login, register, logout, request headers
```

### What to Test

- `src/lib/api.test.ts` – API client, auth flows, token storage
- Client components with `@testing-library/react`
- Mock `fetch` or API clients for pages that fetch from Django

---

## Integration Testing

### Recommended Tools

- **Vitest** + React Testing Library
- Mock `next/navigation`, `next/headers`, and API clients

### What to Test

- Client components with `@testing-library/react`
- Server components by rendering
- Mock `serverNewsApi` for pages that fetch from Django
- Contact page and site settings (from DB) rendering
- Profile business hours and site settings forms (owner-only)

---

## End-to-End Testing

### Recommended Tool

**Cypress**. See [docs/CYPRESS_GUIDE.md](../docs/CYPRESS_GUIDE.md) for setup and best practices.

### Prerequisites

- Django running at `http://localhost:8000`
- Plant Sanctuary company with products

### Seed Django Test Data

From the `django-crm` directory, run:

```bash
cd django-crm
python manage.py seed_plant_sanctuary_e2e
```

This creates:
- **Plant Sanctuary company** (slug: `plant-sanctuary`) if not exists
- **Test user**: `testuser` / `testpass` (for login E2E tests)
- **Sample products** (plants and care items) if none exist

### Run E2E Tests

1. Start Django: `python manage.py runserver 8000`
2. Start Next.js: `cd plant-sanctuary && npm run dev` (port 3002)
3. Run Cypress:
   ```bash
   cd plant-sanctuary
   npm run test:e2e        # Headless run (CI-friendly)
   npm run test:e2e:open   # Open Cypress UI for interactive debugging
   ```

### E2E Environment Variables

- `CYPRESS_TEST_USER` (default: testuser)
- `CYPRESS_TEST_PASSWORD` (default: testpass)

### Critical Flows to Test

- Auth: login, logout, register
- Products list and detail
- Cart and checkout (requires login)
- Profile (orders, business hours, site settings)
- Contact page – verify contact info and business hours come from API, not hardcoded

### Cypress Config

Use `baseUrl: 'http://localhost:3002'` in `cypress.config.js`.

### data-cy Attributes

| Attribute | Location |
|-----------|----------|
| `login-username` | Login form username input |
| `login-password` | Login form password input |
| `login-submit` | Login submit button |
| `register-full-name` | Register form full name |
| `register-email` | Register form email |
| `register-password` | Register form password |
| `register-submit` | Register submit button |
| `product-card` | Product card (each product) |
| `add-to-cart` | Add to cart button |
| `cart-item` | Cart item row |
| `checkout-submit` | Checkout submit button |

---

## Best Testing Practices

- Same Next.js practices as past-and-present and river-side-herald; use `data-cy` for stable selectors; log in via `cy.request()` + `cy.session()` for speed; use `beforeEach` for shared setup, not `afterEach` for cleanup
- **Focus on e-commerce flows**: products, cart, checkout, orders, profile
- **Test contact page** and site settings (from DB) rendering
- **Test profile business hours and site settings forms** (owner-only)
- **E2E**: verify contact info and business hours come from API, not hardcoded

---

## Learning Focus

- Next.js App Router testing
- E-commerce + articles combined flows
- Site settings and contact from database
- Owner-only form access

---

## Suggested Test Order

1. Add Vitest/Jest + RTL; test one client component
2. Mock API and test contact page (site settings data)
3. Add Cypress; test login and product list
4. Add E2E for cart and checkout
5. Add E2E for profile (business hours, site settings)
6. Verify contact page and footer use API data
